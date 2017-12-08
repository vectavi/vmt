'use strict'

const waitTx = require('./helpers/waittx.js')
const ether = require('./helpers/ether.js')
const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines vault lifecycle phases
const State = require('./helpers/state'); // our flavor defines vault lifecycle phases
const RefundableTokenMock = artifacts.require("./helpers/RefundableTokenMock.sol")
const PresaleTokenMock = artifacts.require("./helpers/PresaleTokenMock.sol")
const PresaleTokenManagerMock = artifacts.require("./helpers/PresaleTokenManagerMock.sol")
const ICOTokenManager = artifacts.require("../contracts/ICOTokenManager.sol")
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


contract("ICOTokenManager", () => {
    const [a, b, c, investor1, investor2, investor3, owner1, owner2, owner3] = web3.eth.accounts;
    const preesc = "0x0202020202020202020202020202020202020202";
    const escrow = "0x0303030303030303030303030303030303030303";
    const presaleOwners = [owner1, owner2, owner3];
    const requiredOwners = 2;
    const migrationManager = c;
    const tokenManager = a;
    const rate = new BigNumber(5000); // price in units of ether
    const etherGoal = 25000 // $7,500,000 / $300/ETH = 25,000 ETH
    const weiGoal = ether(etherGoal) // $7,500,000 / $300/ETH = 25,000 ETH
    const granter = investor2;
    const receiver = investor3;
    const tokenAmount = 50
    let now = 0
    let manager;
    let token;
    let presaleTokenManager, presaleToken
    let haveBurned
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

    it("can succesfully create PresaleTokenManager", () =>
        PresaleTokenManagerMock.new([a, b, c], 2)
            .then(res => {presaleTokenManager = res}));

    it("can succesfully create PresaleToken", () =>
        PresaleTokenMock.new(presaleTokenManager.address, preesc)
            .then(res => {presaleToken = res}));

    it("can succesfully create ICOTokenManager with 3 members", () =>
        ICOTokenManager.new([a, b, c], 2).then(mgr => {
            manager = mgr;
            return mgr.getOwners.call().then(owners =>
                assert.equal(3, owners.length, "has invalid number of members"))
        })
    );

    it("can succesfully create ICO RefundableToken", () =>
        RefundableTokenMock.new(presaleToken.address, manager.address, escrow, rate, etherGoal)
            .then(res => {token = res}));

    it("should be able to switch ICO token to Phase.Running", () =>
        manager.tokenSetPhase(token.address, Phase.Running).then(res => {
            const log = res.logs.find(log => log.event == "LogTokenSetPhase");
            const txId = log.args._txId;
            return manager.confirmTransaction(txId, {from: b}).then(res =>
                token.currentPhase.call().then(phase =>
                    assert.equal(Phase.Running, phase.toFixed(), "should be in Running phase"))
            )
        })
    )

    it("should be able to set ICO token migration manager", () =>
        manager.tokenSetMigrationManager(token.address, c).then(res => {
            const log = res.logs.find(log => log.event == "LogTokenSetMigrationManager");
            const txId = log.args._txId;
            return manager.confirmTransaction(txId, {from: b}).then(res =>
                token.migrationManager.call().then(csm =>
                    assert.equal(c, csm, "should change migration manager address")))
        })
    )

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

    it(`should have met weiGoal: ${weiGoal}`, () =>
        token.goal.call().then(res => 
            token.weiRaised.call().then(res2 => 
              assert.equal(res2.toFixed(), res.toFixed(), 
                  `weiRaised ${res2.toFixed()} is not below goal ${res.toFixed()}`))));

    it("weiRaised should equal weiGoal", () =>
        token.weiRaised.call().then(res => {
            assert.equal(res.toFixed(), weiGoal.toFixed(), 
                `weiRaised ${res.toFixed()} should equal weiGoal ${weiGoal.toFixed()}`)
        }));

    it("should be able to switch presale to Phase.Running", () =>
        presaleTokenManager.tokenSetPresalePhase(presaleToken.address, 1).then(res => {
            const log = res.logs.find(log => log.event == "LogTokenSetPresalePhase");
            const txId = log.args._txId;
            return presaleTokenManager.confirmTransaction(txId, {from: b}).then(res =>
                presaleToken.currentPhase.call().then(phase =>
                    assert.equal(1, phase.toFixed(), "should be in Running phase"))
            )
        })
    )

    it("investor1 can buy presale tokens", () => 
        presaleToken.balanceOf.call(investor1).then(curtok => {
            presaleToken.sendTransaction({value: saleWeiAmount, from: investor1})
                .then(() => 
                    presaleToken.balanceOf.call(investor1).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), web3.toWei(6250, 'ether'), 
                        `should buy ${6250} VPTs`)))}))

    it("investor2 can buy presale tokens", () => 
        presaleToken.balanceOf.call(investor2).then(curtok => {
            presaleToken.sendTransaction({value: saleWeiAmount, from: investor2})
                .then(() => 
                    presaleToken.balanceOf.call(investor2).then(newtok => 
                        assert.equal(newtok.sub(curtok).toFixed(), web3.toWei(6250, 'ether'), 
                        `should buy ${6250} VPTs`)))}))

    it("should be able to set presale token crowdsale manager", () =>
        presaleTokenManager.tokenSetCrowdsaleManager(presaleToken.address, token.address).then(res => {
            const log = res.logs.find(log => log.event == "LogTokenSetCrowdsaleManager");
            const txId = log.args._txId;
            return presaleTokenManager.confirmTransaction(txId, {from: b}).then(res =>
                presaleToken.crowdsaleManager.call().then(csm =>
                    assert.equal(token.address, csm, "should change crowdsale manager address")))
        })
    )

    /*
     * confirmed that test sequence order matter in out case.
     * tests are to be designed so they are not environment/state dependent.
     * tests in this sweet change token state and expect the changed state in successor tests.
     * although mocha executes suites and tests within suites sequencially (both sync and async 
     * tests), it take time to affect contract state change specially where the request 
     * is sent to the token manager to change state at the token. For this reason, we interleave
     * tests so that when we verify state change, it is more likely that the state change has settled.
     * TODO: fix this so it is deterministic
     * 
     * when the above "investorX can buy presale tokens" is placed just before/after this test
     * this test fails as between the submit and confirm tokenWithdrawEther, the inverstorX is
     * processed causing the preesc withdrawal verification to fail.
     * 
     */
    it("should be able to withdraw funds from presale token", () => {
        const curbal = web3.eth.getBalance(presaleToken.address)
            //console.log("curbal = "+curbal)
            //console.log("preesc 0 = "+web3.eth.getBalance(preesc))
        presaleToken.sendTransaction({value: web3.toWei(1, 'ether'), from: a}).then(() => {
            const newbal = web3.eth.getBalance(presaleToken.address)
            //console.log("newbal = "+newbal)
            assert.equal(newbal.toFixed(), curbal.add(web3.toWei(1, 'ether')).toFixed(), 
                "presale token should get 1 ether")
            const expectedBalance = web3.eth.getBalance(preesc).add(newbal)
            //console.log("preesc 1 = "+web3.eth.getBalance(preesc))
            presaleTokenManager.tokenWithdrawEther(presaleToken.address, {from: a}).then(res => {
                const log = res.logs.find(log => log.event == "LogTokenWithdrawEther");
                const txId = log.args._txId;
            //console.log("preesc 2 = "+web3.eth.getBalance(preesc))
                return presaleTokenManager.confirmTransaction(txId, {from: b}).then(res => {
                    const balance = web3.eth.getBalance(preesc);
            //console.log("preesc 3 = "+web3.eth.getBalance(preesc))
                    assert.equal(balance.toFixed(), expectedBalance.toFixed(), "presale escrow should get some ether");
                })
            }).then(() => presaleToken.balanceOf.call(a).then(res => 
                assert.equal(6250, web3.fromWei(res, 'ether').valueOf(), "1 Ether should buy 6250 VPT"))
            )
        })
    })


    it("should be able to switch presale to Phase.Migrating", () =>
        presaleTokenManager.tokenSetPresalePhase(presaleToken.address, 3).then(res => {
            const log = res.logs.find(log => log.event == "LogTokenSetPresalePhase");
            const txId = log.args._txId;
            return presaleTokenManager.confirmTransaction(txId, {from: b}).then(res =>
                presaleToken.currentPhase.call().then(phase =>
                    assert.equal(3, phase.toFixed(), "should be in Migrating phase"))
            )
        })
    )

    it("migrate/convert investor1 presale tokens to ICO tokens", async function(){ 
        let curtok = await token.balanceOf.call(investor1)
        let prebal = await presaleToken.balanceOf.call(investor1)
        //console.log("investor1 ICO token pre-burn balance = "+curtok)
        //console.log("investor1 presale token pre-burn ballance = "+prebal)
        assert.isAbove(prebal.toFixed(), 0, "should be non-zero tokens to migrate/convert")

        token.migrateToken(investor1).should.not.be.rejectedWith(EVMThrow)

        let newtok = await token.balanceOf.call(investor1)
        //console.log("investor1 ICO token post-burn balance = "+newtok)
        assert.equal(newtok.sub(curtok).toFixed(), prebal.toFixed(), 
            `should buy ${prebal.toFixed()} VMTs`)

        prebal = await presaleToken.balanceOf.call(investor1)
        //console.log("investor1 presale token post-burn balance = "+prebal)
        assert.equal(prebal.toFixed(), 0, "should be zero tokens after migrate/convert")
    })

    it("migrate/convert investor2 presale tokens to ICO tokens", async function(){ 
        let curtok = await token.balanceOf.call(investor2)
        let prebal = await presaleToken.balanceOf.call(investor2)
        assert.isAbove(prebal.toFixed(), 0, "should be non-zero tokens to migrate/convert")

        token.migrateToken(investor2).should.not.be.rejectedWith(EVMThrow)

        let newtok = await token.balanceOf.call(investor2)
        assert.equal(newtok.sub(curtok).toFixed(), prebal.toFixed(), 
            `should buy ${prebal.toFixed()} VMTs`)

        prebal = await presaleToken.balanceOf.call(investor2)
        assert.equal(prebal.toFixed(), 0, "should be zero tokens after migrate/convert")
    })

    it("migrate/convert investorA presale tokens to ICO tokens", async function(){ 
        let curtok = await token.balanceOf.call(a)
        let prebal = await presaleToken.balanceOf.call(a)
        assert.isAbove(prebal.toFixed(), 0, "should be non-zero tokens to migrate/convert")

        token.migrateToken(a).should.not.be.rejectedWith(EVMThrow)

        let newtok = await token.balanceOf.call(a)
        assert.equal(newtok.sub(curtok).toFixed(), prebal.toFixed(), 
            `should buy ${prebal.toFixed()} VMTs`)

        prebal = await presaleToken.balanceOf.call(a)
        assert.equal(prebal.toFixed(), 0, "should be zero tokens after migrate/convert")
    })

    it("should be able to switch ICO token to Phase.Finalizing", async function(){ 
        let phase = await token.currentPhase.call()
        assert.equal(phase.toFixed(), Phase.Running, "not Phase.Running")

        manager.tokenSetPhase(token.address, Phase.Finalizing).then(res => {
            //console.log("res.logs = "+JSON.stringify(res.logs))
            const log = res.logs.find(log => log.event == "LogTokenSetPhase");
            //console.log("log entry = "+JSON.stringify(res.logs))
            const txId = log.args._txId;
            return manager.confirmTransaction(txId, {from: b}).then(res =>
                token.currentPhase.call().then(phase =>
                    assert.equal(Phase.Finalized, phase.toFixed(), "should be in Finalized phase"))
            )
        })
    })

    /*
     * TODO: fix this so it is deterministic
     * 
     * this state change verification test fails if moved up to just after the 
     * "migrate/convert investorA presale tokens to ICO tokens" test
     * 
     */
    it("should automatically switch phase after burning all presale tokens to Phase.Migrated", async function(){ 
        let sold = await presaleToken.totalSupply.call()
        let phase = await presaleToken.currentPhase.call()
        assert.equal(sold.toFixed(), 0, "tokens burned, totalSupply should be zero")
        assert.equal(phase.toFixed(), 4, "tokens burned, should be in Migrated phase")
    })

    /*
     * TODO: fix this so it is deterministic
     * 
     * this state change verification test fails if moved up to just after the 
     * "should be able to switch ICO token to Phase.Finalizing" test
     * 
     */
    it("goal is met, verify additional pool allocations", () =>
        token.totalSupply.call().then(sold =>
            token.balanceOf.call(escrow).then(pool => 
                assert.equal((pool.mul(100).div(sold)).toFixed(), 45, 
                    "pool should equal 45% of total token supply"))))

    it("should be able to switch ICO token to Phase.Migrating", () =>
        manager.tokenSetPhase(token.address, Phase.Migrating).then(res => {
            const log = res.logs.find(log => log.event == "LogTokenSetPhase");
            const txId = log.args._txId;
            return manager.confirmTransaction(txId, {from: b}).then(res =>
                token.currentPhase.call().then(phase =>
                    assert.equal(Phase.Migrating, phase.toFixed(), "should be in Migrating phase"))
            )
        })
    )

    it("should be able to burn all ICO tokens {from: c} in Phase.Migrating", async function () {
        await token.burnTokens(investor1, { from: c })
        await token.burnTokens(investor2, { from: c })
        await token.burnTokens(a, { from: c })
        await token.burnTokens(escrow, { from: c })

        let balance = await token.balanceOf(investor1)
        assert.equal(balance.toFixed(), 0)

        balance = await token.balanceOf(investor2)
        assert.equal(balance.toFixed(), 0)

        balance = await token.balanceOf(a)
        assert.equal(balance.toFixed(), 0)

        balance = await token.balanceOf(escrow)
        assert.equal(balance.toFixed(), 0)
    })

    it("should automatically switch phase after burning all ICO tokens to Phase.Migrated", async function () {
        let balance = await token.totalSupply()
        assert.equal(balance.toFixed(), 0)

        let currentPhase = await token.currentPhase.call()
        assert.equal(currentPhase.toFixed(), Phase.Migrated, "not Phase.Migrated")
    })

    it("should be able to destroy ICO token to Phase.Migrated", () =>
        manager.tokenDestroy(token.address).then(res => {
            const log = res.logs.find(log => log.event == "LogTokenDestroy");
            const txId = log.args._txId;
            return manager.confirmTransaction(txId, {from: b}).should.not.be.rejectedWith(EVMThrow)
        })
    )

})

