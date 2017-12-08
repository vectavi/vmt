'use strict'

const ether = require('./helpers/ether.js')
const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines vault lifecycle phases
const State = require('./helpers/state'); // our flavor defines vault lifecycle phases
const RefundableTokenMock = artifacts.require("./helpers/RefundableTokenMock.sol")
const PresaleTokenMock = artifacts.require("./helpers/PresaleTokenMock.sol")
const PresaleTokenManagerMock = artifacts.require("./helpers/PresaleTokenManagerMock.sol")
const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

const PhaseStr = {};
Object.keys(Phase).forEach(k => PhaseStr[Phase[k]] = k);
const StateStr = {};
Object.keys(State).forEach(k => StateStr[State[k]] = k);

//
// variables to track escrow balance and transaction that wil finalize the token
//
var escpre, escpost, txhash
/*
 * reference: https://github.com/ethereum/web3.js/issues/393
 */
var waitTx = function(txHash, callback) {
  /*
  * Watch for a particular transaction hash and call the awaiting function when done;
  * Ether-pudding uses another method, with web3.eth.getTransaction(...) and checking the txHash;
  * on https://github.com/ConsenSys/ether-pudding/blob/master/index.js
  */
  var blockCounter = 3;
  // Wait for tx to be finished
  var filter = web3.eth.filter('latest').watch(function(err, blockHash) {
    if (blockCounter<=0) {
      filter.stopWatching();
      filter = null;
      //console.warn('!! Tx expired !!');
      if (callback)
        return callback(false);
      else
        return false;
    }
    // TODO: this is syncronous, use web3js 1.0 when released
    // TODO: http://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
    // Get info about latest Ethereum block
    var block = web3.eth.getBlock(blockHash);
    --blockCounter;
    // Found tx hash?
    if (block.transactions.indexOf(txHash) > -1) {
      // Tx is finished
      filter.stopWatching();
      filter = null;
      if (callback)
        return callback(true);
      else
        return true;
    // Tx hash not found yet?
    } else {
       //console.log('Waiting tx..', blockCounter);
    }
  });
};


contract('RefundableToken', function (accounts) {
    const investor1 = accounts[0];
    const investor2 = accounts[1];
    const investor3 = accounts[2];
    const presaleOwners = [accounts[3], accounts[4], accounts[5]];
    const requiredOwners = 2;
    const escrow = accounts[7];
    const migrationManager = accounts[8];
    const tokenManager = accounts[9];
    const rate = new BigNumber(5000); // price in units of ether
    const etherGoal = 25000 // $7,500,000 / $300/ETH = 25,000 ETH
    const weiGoal = ether(etherGoal) // $7,500,000 / $300/ETH = 25,000 ETH
    let token, ret, phase, tokenAddress
    let mintingFinished
    let presaleToken, presaleTokenManager 
    let salePrice, saleWeiAmount, saleWeiAmountLessThanGoal, purchasedTokens, purchasedTokensLessThanGoal
    let timestamp, blockNumber

    salePrice = new BigNumber(6000);
    saleWeiAmount = new BigNumber(web3.toWei(1, 'ether'));
    saleWeiAmountLessThanGoal = new BigNumber(web3.toWei(24998, 'ether'));
    purchasedTokens = new BigNumber(saleWeiAmount.mul(salePrice));
    purchasedTokensLessThanGoal = new BigNumber(saleWeiAmountLessThanGoal.mul(salePrice));


    const evmThrow = err =>
        //assert.isOk(err.message.match(/invalid JUMP/), err.message, 'should throw');
        assert.isOk(err.message.match(/invalid opcode/), err.message, 'should throw');

    const ok = (from, to) =>
        it(`can move from ${PhaseStr[from]} to ${PhaseStr[to]}`, () =>
            token.setPhase(to, {from: tokenManager}).then(() =>
                token.currentPhase.call().then(res => {
                    if (to == Phase.Finalizing) {
                        // when token lifecycle phase is set to Finalizing, 
                        // it will automatically switch to Finalized or Refunding
                        assert((res.eq(Phase.Finalized) || res.eq(Phase.Refunding)), 
                            "not Phase.Finalized or Phase.Refunding")
                    } else {
                        assert.equal(to, res.toFixed(), `not Phase.${PhaseStr[to]}`)
                    }
                })));

    const no = (from, to) =>
        it(`can't move from ${PhaseStr[from]} to ${PhaseStr[to]}`, () =>
            token.setPhase(to, {from: tokenManager})
                .then(assert.fail)
                .catch(() =>
                    token.currentPhase.call().then(res =>
                        assert.equal(from, res.toFixed(), `not Phase.${PhaseStr[from]}`))));

    it("can succesfully create PresaleTokenManager", () =>
        PresaleTokenManagerMock.new(presaleOwners, requiredOwners)
            .then(res => {presaleTokenManager = res}));

    it("can succesfully create PresaleToken", () =>
        PresaleTokenMock.new(presaleTokenManager.address, escrow)
            .then(res => {presaleToken = res}));

    it("can succesfully create RefundableToken", () =>
        RefundableTokenMock.new(presaleToken.address, tokenManager, escrow, rate, etherGoal)
            .then(res => {token = res}));


    // Case: fundraising goal not met
    // + verify initial phase
    // + verify initial goal
    // + verify initial weiRaised
    // - refund in phase created
    // - refund in phase running
    // + buy
    // - refund in phase paused
    // + set migration manager {from: tokenManager}
    // + finalizing => goal not met => refunding
    // + each investor claims invested amount
    // - investor claim already refunded
    it("should start in phase Created", () =>
        token.currentPhase.call().then(res =>
            assert.equal(Phase.Created, res.toFixed(), "not Phase.Created")));

    it(`should be initialized with etherGoal: ${etherGoal}`, () =>
        token.goal.call().then(res =>
            assert.equal(weiGoal.toFixed(), res.toFixed(), `weiGoal: ${weiGoal.toFixed()} is not ${weiGoal.toFixed()}`)));

    it("weiRaised should be zero", () =>
        token.weiRaised.call().then(res =>
            assert.equal(0, res.toFixed(), "weiRaised not zero")));

    it('should deny refunds before sale start', async function () {
        await token.claimRefund({from: investor1}).should.be.rejectedWith(EVMThrow)
    })

    it(`should be able to depositEther ${saleWeiAmount} to cover presale refund`, async function () {
        await token.depositEther({value: saleWeiAmount, from: investor1})
        const pre = web3.eth.getBalance(token.address);
        assert.equal(saleWeiAmount, pre.toFixed(), `token contract balance: ${pre.toFixed()} should be ${saleWeiAmount}`)
    })

    // depositEther must not adjust weiRaised
    it("weiRaised should be zero", () =>
        token.weiRaised.call().then(res =>
            assert.equal(0, res.toFixed(), "weiRaised not zero")));

    blockNumber = web3.eth.blockNumber;
    timestamp = web3.eth.getBlock(blockNumber).timestamp;
    //console.log("timestamp = "+timestamp.toFixed());

    ok(Phase.Created, Phase.Running);

    it('should deny refunds when sale running', async function () {
        await token.claimRefund({from: investor1}).should.be.rejectedWith(EVMThrow)
    })

    it("investor1 can buy ICO tokens", () => 
        token.balanceOf.call(investor1).then(curtok => {
            token.sendTransaction({value: saleWeiAmount, from: investor1})
                .then(() => 
                    token.balanceOf.call(investor1).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), purchasedTokens.toFixed(), 
                        `should buy ${purchasedTokens.toFixed()} VMTs`)))}))

    it(`weiRaised should be ${saleWeiAmount}`, () =>
        token.weiRaised.call().then(res =>
            assert.equal(saleWeiAmount, res.toFixed(), `weiRaised not ${saleWeiAmount}`)));

    it("investor2 can buy ICO tokens", () => 
        token.balanceOf.call(investor2).then(curtok => {
            token.sendTransaction({value: saleWeiAmountLessThanGoal, from: investor2})
                .then(() => 
                    token.balanceOf.call(investor2).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), purchasedTokensLessThanGoal.toFixed(), 
                        `should buy ${purchasedTokensLessThanGoal.toFixed()} VMTs`)))}))

    it(`weiRaised should be ${saleWeiAmount.add(saleWeiAmountLessThanGoal).toFixed()}`, () =>
        token.weiRaised.call().then(res =>
            assert.equal(saleWeiAmount.add(saleWeiAmountLessThanGoal).toFixed(), res.toFixed(), 
                `weiRaised not ${saleWeiAmount.add(saleWeiAmountLessThanGoal).toFixed()}`)));

    ok(Phase.Running, Phase.Paused);

    it('should deny refunds when sale paused', async function () {
        await token.claimRefund({from: investor1}).should.be.rejectedWith(EVMThrow)
    })

    it("tokenManager can call setMigrationManager in Phase.Paused)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it(`should not have met weiGoal: ${weiGoal}`, () =>
        token.goal.call().then(res => 
            token.weiRaised.call().then(res2 => 
              assert.isBelow(res2.toFixed(), res.toFixed(), 
                  `weiRaised ${res2.toFixed()} is not below goal ${res.toFixed()}`))));

    ok(Phase.Paused, Phase.Finalizing);

    it('finalize() call should transition isFinalized to true', async function () {
        ret = await token.isFinalized.call()
        ret.should.be.true
    })

    it("should be in phase Refunding", () =>
        token.currentPhase.call().then(res =>
            assert.equal(Phase.Refunding, res.toFixed(), "not Phase.Refunding")));

    it("vault should be in State.Refunding", () =>
        token.state.call().then(res =>
            assert.equal(State.Refunding, res.toFixed(), "vault state not State.Refunding")));

    it(`should refund investor1 saleWeiAmount: ${saleWeiAmount}`, async function () {

        const pre = web3.eth.getBalance(investor1)
        await token.claimRefund({from: investor1, gasPrice: 0}).should.be.fulfilled
        const post = web3.eth.getBalance(investor1)

        post.minus(pre).should.be.bignumber.equal(saleWeiAmount)
    })

    it(`should refund investor2 saleWeiAmountLessThanGoal: ${saleWeiAmountLessThanGoal}`, async function () {

        const pre = web3.eth.getBalance(investor2)
        await token.claimRefund({from: investor2, gasPrice: 0}).should.be.fulfilled
        const post = web3.eth.getBalance(investor2)

        post.minus(pre).should.be.bignumber.equal(saleWeiAmountLessThanGoal)
    })

    it('should deny refund when already refunded', async function () {
      await token.claimRefund({from: investor1, gasPrice: 0}).should.be.rejectedWith(EVMThrow)
    })


    // Case: fundraising goal met
    // + verify initial phase
    // + verify initial goal
    // + verify initial weiRaised
    // - refund in phase created
    // - refund in phase running
    // + buy
    // - refund in phase paused
    // + set migration manager {from: tokenManager}
    // + finalizing => goal met => finalized
    // - investor claims refund
    it("can succesfully create RefundableToken again", () =>
        RefundableTokenMock.new(presaleToken.address, tokenManager, escrow, rate, etherGoal)
            .then(res => {
                token = res; 
                tokenAddress = token.address;
                const pre = web3.eth.getBalance(tokenAddress);
                assert.equal(0, pre.toFixed(), `token contract initial balance: ${pre.toFixed()} should be zero`)
                //console.log("token initial balance = "+pre);
            }));

    it("should start in phase Created", () =>
        token.currentPhase.call().then(res =>
            assert.equal(Phase.Created, res.toFixed(), "not Phase.Created")));

    it(`should be initialized with etherGoal: ${etherGoal}`, () =>
        token.goal.call().then(res =>
            assert.equal(weiGoal.toFixed(), res.toFixed(), `weiGoal: ${weiGoal.toFixed()} is not ${weiGoal.toFixed()}`)));

    it("weiRaised should be zero", () =>
        token.weiRaised.call().then(res =>
            assert.equal(0, res.toFixed(), "weiRaised not zero")));

    it('should deny refunds before sale start', async function () {
        await token.claimRefund({from: investor1}).should.be.rejectedWith(EVMThrow)
    })

    blockNumber = web3.eth.blockNumber;
    timestamp = web3.eth.getBlock(blockNumber).timestamp;
    //console.log("timestamp = "+timestamp.toFixed());

    ok(Phase.Created, Phase.Running);

    it('should deny refunds when sale running', async function () {
        await token.claimRefund({from: investor1}).should.be.rejectedWith(EVMThrow)
    })

    it("investor1 can buy ICO tokens", () => 
        token.balanceOf.call(investor1).then(curtok => {
            token.sendTransaction({value: saleWeiAmount, from: investor1})
                .then(() => 
                    token.balanceOf.call(investor1).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), purchasedTokens.toFixed(), 
                        `should buy ${purchasedTokens.toFixed()} VMTs`)))}))

    it(`weiRaised should be ${saleWeiAmount}`, () =>
        token.weiRaised.call().then(res =>
            assert.equal(saleWeiAmount, res.toFixed(), `weiRaised not ${saleWeiAmount}`)));

    it("investor2 can buy ICO tokens", () => 
        token.balanceOf.call(investor2).then(curtok => {
            token.sendTransaction({value: saleWeiAmountLessThanGoal, from: investor2})
                .then(() => 
                    token.balanceOf.call(investor2).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), purchasedTokensLessThanGoal.toFixed(), 
                        `should buy ${purchasedTokensLessThanGoal.toFixed()} VMTs`)))}))

    it(`weiRaised should be ${saleWeiAmount.add(saleWeiAmountLessThanGoal).toFixed()}`, () =>
        token.weiRaised.call().then(res =>
            assert.equal(saleWeiAmount.add(saleWeiAmountLessThanGoal).toFixed(), res.toFixed(), 
                `weiRaised not ${saleWeiAmount.add(saleWeiAmountLessThanGoal).toFixed()}`)));

    // this purchase should cause goal met
    it("investor1 can buy ICO tokens", () => 
        token.balanceOf.call(investor1).then(curtok => {
            token.sendTransaction({value: saleWeiAmount, from: investor1})
                .then(() => 
                    token.balanceOf.call(investor1).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), purchasedTokens.toFixed(), 
                        `should buy ${purchasedTokens.toFixed()} VMTs`)))}))

    ok(Phase.Running, Phase.Paused);

    it('should deny refunds when sale paused', async function () {
        await token.claimRefund({from: investor1}).should.be.rejectedWith(EVMThrow)
    })

    it("tokenManager can call setMigrationManager in Phase.Paused)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it(`should have met weiGoal: ${weiGoal}`, () =>
        token.goal.call().then(res => 
            token.weiRaised.call().then(res2 => 
              assert.equal(res2.toFixed(), res.toFixed(), 
                  `weiRaised ${res2.toFixed()} is not below goal ${res.toFixed()}`))));

    // should forward funds to wallet after sale end when goal is met
    it("token contract inflow should equal weiGoal", () =>
        RefundableTokenMock.at(tokenAddress)
            .then(res => {
                token = res; 
                tokenAddress = token.address;
                const pre = web3.eth.getBalance(tokenAddress);
                assert.equal(pre.toFixed(), weiGoal.toFixed(), 
                    `token contract balance ${pre.toFixed()} should equal weiGoal ${weiGoal.toFixed()}`)
            }));

    it("token contract inflow should equal weiRaised", () =>
        RefundableTokenMock.at(tokenAddress)
            .then(res => {
                token = res; 
                tokenAddress = token.address;
                const pre = web3.eth.getBalance(tokenAddress);
                token.weiRaised.call().then(res => {
                    assert.equal(pre.toFixed(), res.toFixed(), 
                        `token contract balance ${pre.toFixed()} should equal weiRaised ${res.toFixed()}`)
                })
        }));

    it("weiRaised should equal weiGoal", () =>
        token.weiRaised.call().then(res => {
            assert.equal(res.toFixed(), weiGoal.toFixed(), 
                `weiRaised ${res.toFixed()} should equal weiGoal ${weiGoal.toFixed()}`)
        }));

    it('weiRaised should equal escrow inflow', async function () {
        // get current escrow balance
        escpre = web3.eth.getBalance(escrow); // track escrow balance before finalizing the token
        //console.log("escrow beginning balance = "+escpre);
        //
        // this transaction will finalize the token
        // if goal was reached, the vault will close and forward funds to the escrow/wallet account
        // otherwise,  refunds will be enabled for investors to claim investment refund
        //
        txhash = await token.setPhase.sendTransaction(Phase.Finalizing, {from: tokenManager});
        //console.log(`Tx: ${txhash}`);
        //
        // callback used to verify that escrow inflow matches wei raised
        //
        var txWaitCallback = function(result) {
           //console.log("waitTx callback result = "+result);
           if (result) {
               escpost = web3.eth.getBalance(escrow); // track escrow balance after finalizing the token
               //console.log("escrow ending balance = "+escpost);
               token.weiRaised.call().then(res => { // verify escrow inflow against wei raised
               //console.log(`escrow inflow ${escpost.minus(escpre).toFixed()} should equal weiRaised ${res.toFixed()}`);
                   assert.equal(escpost.minus(escpre).toFixed(), res.toFixed(), 
                       `escrow inflow ${escpost.minus(escpre).toFixed()} should equal weiRaised ${res.toFixed()}`)
               })
           }
        }
        // wait until the transaction is recorded on the ledger then callback to verify funds transfer
        if (txhash) {
           //console.log("wait for tx = "+txhash);
           waitTx(txhash, txWaitCallback);
        }
        // we expect the token to be finalized in this test case
        token.currentPhase.call().then(res => {
            //console.log("currentPhase = "+res.toFixed());
            // when phase is set to Finalizing, it will automatically 
            // switch to Finalized or Refunding
            assert((res.eq(Phase.Finalized) || res.eq(Phase.Refunding)), 
                "not Phase.Finalized or Phase.Refunding")
            })
    })

    it('should have transitioned isFinalized to true', async function () {
        ret = await token.isFinalized.call()
        ret.should.be.true
    })

    it("should be in phase Finalized", () =>
        token.currentPhase.call().then(res =>
            assert.equal(Phase.Finalized, res.toFixed(), "not Phase.Finalized")));

    it("vault should be in State.Closed", () =>
        token.state.call().then(res =>
            assert.equal(State.Closed, res.toFixed(), "vault state not State.Closed")));

    it('should transition mintingFinished to true', async function () {
        ret = await token.mintingFinished.call()
        ret.should.be.true
    })

    it('should deny refunds when goal met', async function () {
        await token.claimRefund({from: investor1, gasPrice: 0}).should.be.rejectedWith(EVMThrow)
    })

})

