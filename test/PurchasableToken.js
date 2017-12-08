'use strict';

const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines token lifecycle phases
const PurchasableTokenMock = artifacts.require("./helpers/PurchasableTokenMock.sol")
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


contract('PurchasableToken', function(accounts) {
    const investor1 = accounts[0];
    const investor2 = accounts[1];
    const investor3 = accounts[2];
    const presaleOwners = [accounts[3], accounts[4], accounts[5]];
    const requiredOwners = 2;
    const escrow = accounts[7];
    const migrationManager = accounts[8];
    const tokenManager = accounts[9];
    const initialSupply = 1000;
    const allowAmount = 100;
    const investorNone = 0x0;
    const rate = 5000; // price in units of ether
    let token, ret, phase
    let mintingFinished, currentPhase, allowance
    let presaleToken, presaleTokenManager, purchasedTokens, presalePrice, presaleTotalSupply, presaleWeiAmount
    let timestamp, blockNumber

    presalePrice = new BigNumber(6250);
    presaleWeiAmount = new BigNumber(web3.toWei(1, 'ether'));
    purchasedTokens = new BigNumber(presaleWeiAmount.mul(presalePrice));


    const evmThrow = err =>
        //assert.isOk(err.message.match(/invalid JUMP/), err.message, 'should throw');
        assert.isOk(err.message.match(/invalid opcode/), err.message, 'should throw');

    const ok = (from, to) =>
        it(`can move from ${PhaseStr[from]} to ${PhaseStr[to]}`, () =>
            token.setPhase(to, {from: tokenManager}).then(() =>
                token.currentPhase.call().then(res => {
                    if (to == Phase.Finalizing) {
                        // when phase is set to Finalizing, it will automatically 
                        // switch to Finalized or Refunding
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

    it("can succesfully create PresaleTokenManager", async function() {
        presaleTokenManager = await PresaleTokenManagerMock.new(presaleOwners, requiredOwners);
    });

    it("can succesfully create PresaleToken", async function() {
        presaleToken = await PresaleTokenMock.new(presaleTokenManager.address, escrow)
    });

    it("can succesfully create PurchasableToken", async function() {
        token = await PurchasableTokenMock.new(tokenManager, investor1, initialSupply, presaleToken.address, escrow, rate)
    });

    it("should start in phase Created", () =>
        token.currentPhase.call().then(res =>
            assert.equal(0, res.toFixed(), "not Phase.Created")));


    // At phase Created
    // - buy
    // - burn
    // + withdraw
    // + set migration manager {from: tokenManager}
    // - set migration manager {from: random guy}
    // + create another PurchasableToken
    // - transfer
    // - approve
    // - transferFrom
    it("should fail to buyTokens in Phase.Created", () =>
        token.buyTokens(investor1, {value: web3.toWei(1, 'ether'), from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("should fail to call burnTokens in Phase.Created", () =>
        token.burnTokens(investor1, {from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager can call withdrawEther in Phase.Created", () =>
        token.withdrawEther({from: tokenManager})
            .then(() => {}))

    it("tokenManager can call setMigrationManager in Phase.Created", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it("random guy should fail to call setMigrationManager in Phase.Created", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("can succesfully create another PurchasableToken", async function() {
        token = await PurchasableTokenMock.new(tokenManager, investor1, initialSupply, presaleToken.address, escrow, rate)
    });

    it('should throw an error when trying to transfer in Phase.Created', async function() {
        await token.transfer(investor1, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to approve transfer in Phase.Created', async function() {
        await token.approve(investor2, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom in Phase.Created', async function() {
        //await token.approve(investor2, allowAmount); // already verified above
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    no(Phase.Created, Phase.Created);
    no(Phase.Created, Phase.Paused);
    no(Phase.Created, Phase.Finalizing);
    no(Phase.Created, Phase.Refunding);
    no(Phase.Created, Phase.Finalized);
    no(Phase.Created, Phase.Migrating);
    no(Phase.Created, Phase.Migrated);

    blockNumber = web3.eth.blockNumber;
    timestamp = web3.eth.getBlock(blockNumber).timestamp;
    //console.log("timestamp = "+timestamp.toFixed());

    ok(Phase.Created, Phase.Running);

    // At phase Running
    // + sale start time is set
    // + sale start time is > block.timestamp before Phase.Running
    // + buy
    // - burn
    // + withdraw
    // + set migration manager
    // - set migration manager {from: random guy}
    // + buy again
    // - transfer
    // - approve
    // - transferFrom
    it("saleStart should be > 0 in Phase.Running", () =>
        token.saleStart.call().then(res => 
            assert(res.gt(0), "saleStart time is invalid")))

    it("saleStart should be >= block.timestamp in Phase.Running", () =>
        token.saleStart.call().then(res => {
            //console.log("saleStart = "+res.toFixed());
            assert(res.gte(timestamp), "can't buy tokens, sale start time is invalid")
        }))

    it("can call buyTokens in Phase.Running", () => {
        const expectedBalance = web3.eth.getBalance(escrow).add(web3.toWei(1, 'ether'))
        token.buyTokens(investor2, {value: web3.toWei(1, 'ether'), from: investor2})
            .then(() => {
                token.balanceOf.call(investor2).then(res =>
                    assert.equal(6000, web3.fromWei(res, 'ether').valueOf(), "1 Ether should buy 6000 VMT"))
                // funds are forwarded to escrow - not with token manager until vault is closed
                const balance = web3.eth.getBalance(escrow)
                return assert(balance.eq(expectedBalance),"escrow balance should increase by 1 ether")})})

    it("should fail to call burnTokens in Phase.Running", () =>
        token.burnTokens(investor2, {from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager can call withdrawEther in Phase.Running", () => {
        const mgrBalance1 = web3.eth.getBalance(escrow).toFixed();
        token.withdrawEther({from: tokenManager})
            .then(() => {
                const tokBalance = web3.fromWei(web3.eth.getBalance(token.address).toFixed(), 'ether');
                assert.equal(0, tokBalance, "contract balance is 0 ether");
                const mgrBalance2 = web3.eth.getBalance(escrow).toFixed();
                //return assert.isAbove(mgrBalance2, mgrBalance1, "escrow got some ether");
                // token purchase always forwards ether to escrow, withdrawEther should not find any ether
                return assert.equal(mgrBalance2, mgrBalance1, "withdrawEther should not find any ether");
            })
    });

    it("tokenManager can call setMigrationManager in Phase.Running", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it("random guy should fail to call setMigrationManager in Phase.Running", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("can call buyTokens in Phase.Running again", () => 
        token.balanceOf.call(investor2).then(res => {
            const expectedBalance = res.add(web3.toWei(6000, 'ether'))
            //console.log("expectedBalance = "+expectedBalance.toFixed())
            token.buyTokens(investor2, {value: web3.toWei(1, 'ether'), from: investor2})
                .then(() => 
                    token.balanceOf.call(investor2).then(res2 => {
                        //console.log("res2 = "+res2.toFixed())
                        assert(res2.eq(expectedBalance), "1 Ether should buy another 6000 VMT")}))}))

    it('should throw an error when trying to transfer in Phase.Running', async function() {
        await token.transfer(investor1, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to approve transfer in Phase.Running', async function() {
        await token.approve(investor2, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom in Phase.Running', async function() {
        //await token.approve(investor2, allowAmount); // already verified above
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    // 
    // At phase Running
    // verify presale token migration
    // verify presale token migration completion
    // 
    // steps:
    //   verify presale token is in created state
    it("presale token should start in phase Created", () =>
        presaleToken.currentPhase.call().then(res =>
            assert.equal(0, res.toFixed(), "not Phase.Created")));

    //   verify totalSupply started at zero
    it("presale token totalSupply should start at zero", () =>
        presaleToken.totalSupply.call().then(res =>
            assert.equal(0, res.toFixed(), "presale totalSupply is not zero")));

    //   switch to running phase - requires approval from 2 owner accounts
    it("should be able to switch presale to Phase.Running", () =>
      presaleTokenManager.tokenSetPresalePhase(presaleToken.address, 1, {from: presaleOwners[0]}).then(res => {
          const log = res.logs.find(log => log.event == "LogTokenSetPresalePhase");
          const txId = log.args._txId;
          return presaleTokenManager.confirmTransaction(txId, {from: presaleOwners[1]}).then(res =>
              presaleToken.currentPhase.call().then(phase =>
                  assert.equal(1, phase.toFixed(), "should be in Running phase"))
          )
      })
    )

    //   buy some presale tokens for investor1
    it("investor1 can buy presale token", () => 
        presaleToken.balanceOf.call(investor1).then(curtok => {
            presaleToken.buyTokens(investor1, {value: presaleWeiAmount, from: investor1})
                .then(() => 
                    presaleToken.balanceOf.call(investor1).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), purchasedTokens.toFixed(), 
                        "1 Ether should buy another 6250 VPT")))}))

    //   verify presale token totalSupply reflects purchased tokens
    it("presale token totalSupply should reflect purchased tokens", () =>
        presaleToken.totalSupply.call().then(res =>
            assert(purchasedTokens.eq(res), "unexpected presale totalSupply")));

    //   buy some presale tokens for investor2
    it("investor2 can buy presale token", () => 
        presaleToken.balanceOf.call(investor2).then(curtok => {
            presaleToken.buyTokens(investor2, {value: presaleWeiAmount, from: investor2})
                .then(() => 
                    presaleToken.balanceOf.call(investor2).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), purchasedTokens.toFixed(), 
                        "1 Ether should buy another 6250 VPT")))}))

    //   verify presale token totalSupply reflects purchased tokens
    it('presale token totalSupply should match total purchases', async function() {
        let totalSupply = await presaleToken.totalSupply.call();

        totalSupply.toFixed().should.equal(`${purchasedTokens.mul(2).toFixed()}`); // 2 purchases
    });

    //   set crowdsaleManager/migrationManager phase
    it("should be able to set crowdsale manager", () =>
        presaleTokenManager.tokenSetCrowdsaleManager(presaleToken.address, token.address, {from: presaleOwners[0]})
            .then(res => {
            const log = res.logs.find(log => log.event == "LogTokenSetCrowdsaleManager");
            const txId = log.args._txId;
            return presaleTokenManager.confirmTransaction(txId, {from: presaleOwners[1]}).then(res =>
                presaleToken.crowdsaleManager.call().then(csm =>
                    assert.equal(token.address, csm, "should change crowdsale manager address")))
            })
    )

    //   switch to migrating phase
    it("should be able to switch presale to Phase.Migrating", () =>
      presaleTokenManager.tokenSetPresalePhase(presaleToken.address, 3, {from: presaleOwners[0]}).then(res => {
          const log = res.logs.find(log => log.event == "LogTokenSetPresalePhase");
          const txId = log.args._txId;
          return presaleTokenManager.confirmTransaction(txId, {from: presaleOwners[1]}).then(res =>
              presaleToken.currentPhase.call().then(phase =>
                  assert.equal(3, phase.toFixed(), "should be in Phase.Migrating"))
          )
      })
    )

    //   verify presale token throws when non-investor tries to migrate presale tokens
    it('should throw an error when non-investor tries to migrate presale tokens', async function() {
        await token.migrateToken(investor3).should.be.rejectedWith(EVMThrow)
    });

    //   migrate/convert investor1 tokens and verify new tokens
    it("migrate investor1 presale tokens", () => 
        presaleToken.balanceOf.call(investor1).then(pretok => {
            token.balanceOf.call(investor1).then(curtok => {
                token.migrateToken(investor1).then(() => 
                    token.balanceOf.call(investor1).then(newtok => 
                        assert(newtok.eq(pretok.add(curtok)), 
                        "investor1 token balance should include migrated VPT")))})}))

    //   verify presale token is still in phase Migrating
    it("verify presale token is still in phase Migrating", () =>
        presaleToken.currentPhase.call().then(phase =>
            assert.equal(3, phase.toFixed(), "should be in Phase.Migrating")));

    //   migrate/convert investor2 tokens and verify new tokens
    it("migrate investor2 presale tokens", () => 
        presaleToken.balanceOf.call(investor2).then(pretok => {
            token.balanceOf.call(investor2).then(curtok => {
                token.migrateToken(investor2).then(() => 
                    token.balanceOf.call(investor2).then(newtok => 
                        assert(newtok.eq(pretok.add(curtok)), 
                        "investor2 token balance should include migrated VPT")))})}))

    //   verify presale token is still in phase Migrated
    it("verify presale token is in phase Migrated", () =>
        presaleToken.currentPhase.call().then(phase =>
            assert(4, phase.toFixed(), "should be in Phase.Migrated")));

    no(Phase.Running, Phase.Created);
    no(Phase.Running, Phase.Running);
    no(Phase.Running, Phase.Refunding);
    no(Phase.Running, Phase.Finalized);
    no(Phase.Running, Phase.Migrating);
    no(Phase.Running, Phase.Migrated);
    ok(Phase.Running, Phase.Paused);

    // At phase Paused
    // - buy
    // - burn
    // + withdraw
    // - set migration manager
    // - transfer
    // - approve
    // - transferFrom
    it("should fail to call buyTokens in Phase.Paused", () =>
        token.buyTokens(investor1, {value: web3.toWei(1, 'ether'), from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("should fail to call burnTokens in Phase.Paused", () =>
        token.burnTokens(investor1, {from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager can call withdrawEther in Phase.Paused", () => {
        const mgrBalance1 = web3.eth.getBalance(escrow).toFixed();
        token.withdrawEther({from: tokenManager})
            .then(() => {
                const tokBalance = web3.fromWei(web3.eth.getBalance(token.address).toFixed(), 'ether');
                assert.equal(0, tokBalance, "contract balance is 0 ether");
                const mgrBalance2 = web3.eth.getBalance(escrow).toFixed();
                //return assert.isAbove(mgrBalance2, mgrBalance1, "escrow got some ether");
                // token purchase always forwards ether to escrow, withdrawEther should not find any ether
                return assert.equal(mgrBalance2, mgrBalance1, "withdrawEther should not find any ether");
            })
    });

    it("random guy should fail to call setMigrationManager in Phase.Paused", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it('should throw an error when trying to transfer in Phase.Paused', async function() {
        await token.transfer(investor1, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to approve transfer in Phase.Paused', async function() {
        await token.approve(investor2, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom in Phase.Paused', async function() {
        //await token.approve(investor2, allowAmount); // already verified above
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    no(Phase.Paused, Phase.Created);
    no(Phase.Paused, Phase.Paused);
    no(Phase.Paused, Phase.Refunding);
    no(Phase.Paused, Phase.Finalized);
    no(Phase.Paused, Phase.Migrating);
    no(Phase.Paused, Phase.Migrated);
    ok(Phase.Paused, Phase.Running);

    // At phase Running (again)
    // + buy again
    // + check if migration manager is set
    // + set migration manager
    // - transfer
    // - approve
    // - transferFrom
    // + running => finalizing => finalized
    // + running => paused => finalizing => finalized
    it("can call buyTokens in Phase.Running again", () => 
        token.balanceOf.call(investor2).then(res => {
            const expBal = res.add(web3.toWei(6000, 'ether'))
            token.buyTokens(investor2, {value: web3.toWei(1, 'ether'), from: investor2})
                .then(() => 
                    token.balanceOf.call(investor2).then(res2 => {
                        assert(res2.eq(expBal), "1 Ether should buy another 6000 VMT")}))}))

    it("tokenManager can call setMigrationManager in Phase.Running", () =>
        token.setMigrationManager('0x0', {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal('0x0000000000000000000000000000000000000000', res, "Invalid migrationManager"))))

    it("tokenManager can call setMigrationManager in Phase.Running", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it('should throw an error when trying to transfer in Phase.Running again', async function() {
        await token.transfer(investor1, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to approve transfer in Phase.Running again', async function() {
        await token.approve(investor2, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom in Phase.Running again', async function() {
        //await token.approve(investor2, allowAmount); // already verified above
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    no(Phase.Running, Phase.Migrating);
    ok(Phase.Running, Phase.Finalizing);
    
    // should be able to switch from paused to finalizing phase
    it("can succesfully create another PurchasableToken", async function() {
        token = await PurchasableTokenMock.new(tokenManager, investor1, initialSupply, presaleToken.address, escrow, rate)
    });

    ok(Phase.Created, Phase.Running);
    ok(Phase.Running, Phase.Paused);

    it("tokenManager can call setMigrationManager in Phase.Paused)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it('Finalizing phase should transition isFinalized to true', async function () {
        ret = await token.isFinalized.call()
        ret.should.be.false
    })

    ok(Phase.Paused, Phase.Finalizing);

    it('Finalizing phase should transition isFinalized to true', async function () {
        ret = await token.isFinalized.call()
        ret.should.be.true
    })

    it("should be in phase Finalized", () =>
        token.currentPhase.call().then(res => {
            assert.equal(Phase.Finalized, res.toFixed(), "not Phase.Finalized")}));

    // At phase Finalized
    // see additional finalized phase tests under RefundableToken
    // - buy
    // - burn
    // + withdraw
    // + set migration manager
    // + transfer
    // + approve
    // + transferFrom

    it("should fail to call buyTokens in Phase.Finalized", () =>
        token.buyTokens(investor1, {value: web3.toWei(1, 'ether'), from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("should fail to call burnTokens in Phase.Finalized", () =>
        token.burnTokens(investor1, {from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager can call withdrawEther in Phase.Finalized", () =>
        token.withdrawEther({from: tokenManager})
          .then(() => {}))

    it("tokenManager can call setMigrationManager in Phase.Finalized", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it("can succesfully create another PurchasableToken", async function() {
        token = await PurchasableTokenMock.new(tokenManager, investor1, initialSupply, presaleToken.address, escrow, rate)
    });

    ok(Phase.Created, Phase.Running);

    it('Finalizing phase should transition isFinalized to true', async function () {
        ret = await token.isFinalized.call()
        ret.should.be.false
    })

    ok(Phase.Running, Phase.Finalizing);

    it('Finalizing phase should transition isFinalized to true', async function () {
        ret = await token.isFinalized.call()
        ret.should.be.true
    })

    it("should be in phase Finalized", () =>
        token.currentPhase.call().then(res => {
            assert.equal(Phase.Finalized, res.toFixed(), "not Phase.Finalized")}));

    it('should return the correct totalSupply after construction', async function() {
        let totalSupply = await token.totalSupply.call();

        totalSupply.toFixed().should.equal(`${initialSupply}`);
    });

    it('should throw an error when trying to transfer more than balance in Phase.Finalized', async function() {
        await token.transfer(investor1, initialSupply+1).should.be.rejectedWith(EVMThrow)
    });

    it('should return correct balances after transfer in Phase.Finalized', async function() {
        let balance1 = await token.balanceOf(investor1);
        let balance2 = await token.balanceOf(investor2);
        let balance3
        assert.isAbove(balance1, allowAmount);

        await token.transfer(investor2, allowAmount);
        balance3 = await token.balanceOf(investor1);
        assert(balance3.eq(balance1.sub(allowAmount)));

        balance3 = await token.balanceOf(investor2);
        assert(balance3.eq(balance2.add(allowAmount)));
    });

    it('should return the correct allowance amount after approval in Phase.Finalized', async function() {
        await token.approve(investor2, allowAmount);
        allowance = await token.allowance(investor1, investor2);
        assert.equal(allowance, allowAmount);
    });

    it('should return correct balances after transfering from another account in Phase.Finalized', async function() {
        let balance1 = await token.balanceOf(investor1);
        let balance2 = await token.balanceOf(investor2);
        let balance3 = await token.balanceOf(investor3);
        let balance4
        assert.isAbove(balance1, allowAmount);

        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}); // approved above

        balance4 = await token.balanceOf(investor1);
        assert(balance4.eq(balance1.sub(allowAmount)));

        balance4 = await token.balanceOf(investor3);
        assert(balance4.eq(balance3.add(allowAmount)));

        balance4 = await token.balanceOf(investor2);
        assert(balance4.eq(balance2));
    });

    it('should return correct allowance after transfer from a spender in Phase.Finalized', async function() {
        allowance = await token.allowance(investor1, investor2);
        assert.equal(allowance, 0);
    });

    it('should throw an error when trying to transfer to 0x0 in Phase.Finalized', async function() {
        await token.transfer(investorNone, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom to 0x0 in Phase.Finalized', async function() {
        await token.approve(investor2, allowAmount);
        await token.transferFrom(investor1, investorNone, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    no(Phase.Finalized, Phase.Created);
    no(Phase.Finalized, Phase.Paused);
    no(Phase.Finalized, Phase.Running);
    no(Phase.Finalized, Phase.Finalizing);
    no(Phase.Finalized, Phase.Refunding);
    no(Phase.Finalized, Phase.Finalized);
    no(Phase.Finalized, Phase.Migrated);

    it("tokenManager can call setMigrationManager in Phase.Finalized", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    ok(Phase.Finalized, Phase.Migrating);


    // At phase Refunding
    // see Refunding phase tests under RefundableToken
    // - buy
    // - burn
    // - withdraw
    // - set migration manager
    // + transfer
    // + approve
    // + transferFrom


    // At phase Migrating
    // - buy
    // + burn
    // + withdraw
    // - set migration manager
    // - transfer
    // - approve
    // - transferFrom

    it("should fail to call buyTokens in Phase.Migrating", () =>
        token.buyTokens(investor1, {value: web3.toWei(1, 'ether'), from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("should be able to successfully burnTokens in Phase.Migrating", () =>
        token.burnTokens(investor1, {from: migrationManager})
            .then(res => {}));

    it("tokenManager can call withdrawEther in Phase.Migrating", () =>
        token.withdrawEther({from: tokenManager})
          .then(() => {}))

    it("should fail to call setMigrationManager in Phase.Migrating", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(assert.fail).catch(evmThrow))

    it('should throw an error when trying to transfer in Phase.Migrating', async function() {
        await token.transfer(investor1, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to approve transfer in Phase.Migrating', async function() {
        await token.approve(investor2, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom in Phase.Migrating', async function() {
        //await token.approve(investor2, allowAmount); // already verified above
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    no(Phase.Migrating, Phase.Created);
    no(Phase.Migrating, Phase.Paused);
    no(Phase.Migrating, Phase.Running);
    no(Phase.Migrating, Phase.Finalizing);
    no(Phase.Migrating, Phase.Refunding);
    no(Phase.Migrating, Phase.Finalized);
    no(Phase.Migrating, Phase.Migrating);

    ok(Phase.Migrating, Phase.Migrated);

    // At phase Migrated
    // - buy
    // - burn
    // + withdraw
    // - set migration manager
    // - transfer
    // - approve
    // - transferFrom
    // + destroy

    it("should fail to call buyTokens in Phase.Migrated", () =>
        token.buyTokens(investor1, {value: web3.toWei(1, 'ether'), from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("should fail to call burnTokens in Phase.Migrated", () =>
        token.burnTokens(investor1, {from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager can call withdrawEther in Phase.Migrated", () =>
        token.withdrawEther({from: tokenManager})
            .then(() => {}))

    it('should fail to call setMigrationManager in Phase.Migrated', async function () {
        await token.setMigrationManager(migrationManager, {from: tokenManager}).should.be.rejectedWith(EVMThrow)
    })

    it('should throw an error when trying to transfer in Phase.Migrated', async function() {
        await token.transfer(investor1, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to approve transfer in Phase.Migrated', async function() {
        await token.approve(investor2, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom in Phase.Migrated', async function() {
        //await token.approve(investor2, allowAmount); // already verified above
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    no(Phase.Migrated, Phase.Created);
    no(Phase.Migrated, Phase.Paused);
    no(Phase.Migrated, Phase.Running);
    no(Phase.Migrated, Phase.Finalizing);
    no(Phase.Migrated, Phase.Refunding);
    no(Phase.Migrated, Phase.Finalized);
    no(Phase.Migrated, Phase.Migrating);
    no(Phase.Migrated, Phase.Migrated);

    it("random guy should not be able to destroy token", () =>
        token.destroy({from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager should be able to successfully destroy token", () =>
        token.destroy({from: tokenManager})
            .then(res => {}));

});

