'use strict';

const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines token lifecycle phases
const TokenLifecycleMock = artifacts.require("./helpers/TokenLifecycleMock.sol")
const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

const PhaseStr = {};
Object.keys(Phase).forEach(k => PhaseStr[Phase[k]] = k);


contract('TokenLifecycle', function(accounts) {
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
    let presaleToken, presaleTokenManager
    let timestamp, blockNumber


    const evmThrow = err =>
        //assert.isOk(err.message.match(/invalid JUMP/), err.message, 'should throw');
        assert.isOk(err.message.match(/invalid opcode/), err.message, 'should throw');

    const ok = (from, to) =>
        it(`can move from ${PhaseStr[from]} to ${PhaseStr[to]}`, () =>
            token.setPhase(to, {from: tokenManager}).then(() => {
                token.currentPhase.call().then(res => {
                    if (to == Phase.Finalizing) {
                        // when phase is set to Finalizing, it will automatically 
                        // switch to Finalized or Refunding
                        assert((res.eq(Phase.Finalized) || res.eq(Phase.Refunding)), 
                            "not Phase.Finalized or Phase.Refunding")
                    } else {
                        assert.equal(to, res.toFixed(), `not Phase.${PhaseStr[to]}`)
                    }
                })}));

    const no = (from, to) =>
        it(`can't move from ${PhaseStr[from]} to ${PhaseStr[to]}`, () =>
            token.setPhase(to, {from: tokenManager})
                .then(assert.fail)
                .catch(() =>
                    token.currentPhase.call().then(res =>
                        assert.equal(from, res.toFixed(), `not Phase.${PhaseStr[from]}`))));


    // At phase Created
    // + create token
    // + initial phase is created
    // - set phase  {from: random guy}
    // + set phase  {from: tokenManager}
    // + set migration manager {from: tokenManager}
    // - set migration manager {from: random guy}
    // - destroy {from: random guy}
    // + destroy {from: tokenManager}
    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    it("should start in phase Created", () =>
        token.currentPhase.call().then(res =>
            assert.equal(Phase.Created, res.toFixed(), "not Phase.Created")));

    it("random guy should fail to call setPhase in Phase.Created", () =>
        token.setPhase(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    no(Phase.Created, Phase.Created);
    no(Phase.Created, Phase.Paused);
    no(Phase.Created, Phase.Finalizing);
    no(Phase.Created, Phase.Refunding);
    no(Phase.Created, Phase.Finalized);
    no(Phase.Created, Phase.Migrating);
    no(Phase.Created, Phase.Migrated);

    it("tokenManager can call setMigrationManager in Phase.Created", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it("random guy should fail to call setMigrationManager in Phase.Created", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("random guy should not be able to destroy token in Phase.Created", () =>
        token.destroy({from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager should be able to successfully destroy token in Phase.Created", () =>
        token.destroy({from: tokenManager})
            .then(res => {}));


    // At phase Running
    // + create token
    // - set phase  {from: random guy}
    // + set phase  {from: tokenManager}
    // + sale start time is set
    // + sale start time is > block.timestamp before Phase.Running
    // - set migration manager {from: random guy}
    // + set migration manager {from: tokenManager}
    // - destroy {from: random guy}
    // + destroy {from: tokenManager}
    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    blockNumber = web3.eth.blockNumber;
    timestamp = web3.eth.getBlock(blockNumber).timestamp;

    ok(Phase.Created, Phase.Running);

    it("random guy should fail to call setPhase in Phase.Running", () =>
        token.setPhase(Phase.Paused, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("saleStart should be > 0 in Phase.Running", () =>
        token.saleStart.call().then(res => 
            assert(res.gt(0), "saleStart time is invalid")))

    it("saleStart should be >= block.timestamp in Phase.Running", () =>
        token.saleStart.call().then(res => {
            //console.log("saleStart = "+res.toFixed());
            assert(res.gte(timestamp), "can't buy tokens, sale start time is invalid")
        }))

    no(Phase.Running, Phase.Created);
    no(Phase.Running, Phase.Running);
    no(Phase.Running, Phase.Refunding);
    no(Phase.Running, Phase.Finalized);
    no(Phase.Running, Phase.Migrating);
    no(Phase.Running, Phase.Migrated);

    ok(Phase.Running, Phase.Paused);
    ok(Phase.Paused, Phase.Running);

    it("tokenManager can call setMigrationManager in Phase.Running", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it("random guy should fail to call setMigrationManager in Phase.Running", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("random guy should not be able to destroy token in Phase.Running", () =>
        token.destroy({from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager should be able to successfully destroy token in Phase.Running", () =>
        token.destroy({from: tokenManager})
            .then(res => {}));


    // At phase Paused
    // + create token
    // - set phase  {from: random guy}
    // + set phase  {from: tokenManager}
    // + set migration manager {from: tokenManager}
    // - set migration manager {from: random guy}
    // - destroy {from: random guy}
    // + destroy {from: tokenManager}
    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    ok(Phase.Created, Phase.Running);
    ok(Phase.Running, Phase.Paused);

    it("random guy should fail to call setPhase in Phase.Paused", () =>
        token.setPhase(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    no(Phase.Paused, Phase.Created);
    no(Phase.Paused, Phase.Paused);
    no(Phase.Paused, Phase.Refunding);
    no(Phase.Paused, Phase.Finalized);
    no(Phase.Paused, Phase.Migrating);
    no(Phase.Paused, Phase.Migrated);

    ok(Phase.Paused, Phase.Running);
    ok(Phase.Running, Phase.Paused);

    it("tokenManager can call setMigrationManager in Phase.Paused)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it("random guy should fail to call setMigrationManager in Phase.Paused", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("random guy should not be able to destroy token in Phase.Paused", () =>
        token.destroy({from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager should be able to successfully destroy token in Phase.Paused", () =>
        token.destroy({from: tokenManager})
            .then(res => {}));

    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    ok(Phase.Created, Phase.Running);
    ok(Phase.Running, Phase.Paused);

    it("tokenManager can call setMigrationManager in Phase.Paused)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    ok(Phase.Paused, Phase.Finalizing);

    it("should be in phase Finalized", () =>
        token.currentPhase.call().then(res => {
            assert.equal(Phase.Finalized, res.toFixed(), "not Phase.Finalized")}));


    // At phase Finalized
    // see additional finalized phase tests under PurchasableToken, RefundableToken
    // + create token
    // - set phase  {from: random guy}
    // + set phase  {from: tokenManager}
    // + set migration manager {from: tokenManager}
    // - set migration manager {from: random guy}
    // - destroy {from: random guy}
    // + destroy {from: tokenManager}
    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    ok(Phase.Created, Phase.Running);
    ok(Phase.Running, Phase.Finalizing);

    it("should be in phase Finalized", () =>
        token.currentPhase.call().then(res => {
            assert.equal(Phase.Finalized, res.toFixed(), "not Phase.Finalized")}));

    no(Phase.Finalized, Phase.Created);
    no(Phase.Finalized, Phase.Paused);
    no(Phase.Finalized, Phase.Running);
    no(Phase.Finalized, Phase.Finalizing);
    no(Phase.Finalized, Phase.Refunding);
    no(Phase.Finalized, Phase.Finalized);
    no(Phase.Finalized, Phase.Migrated);

    it("random guy should fail to call setPhase in Phase.Finalized", () =>
        token.setPhase(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager can call setMigrationManager in Phase.Finalized", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    it("random guy should fail to call setMigrationManager in Phase.Finalized", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("random guy should not be able to destroy token in Phase.Finalized", () =>
        token.destroy({from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager should be able to successfully destroy token in Phase.Finalized", () =>
        token.destroy({from: tokenManager})
            .then(res => {}));


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
    // + create token
    // - set phase  {from: random guy}
    // + set phase  {from: tokenManager}
    // - set migration manager {from: tokenManager}
    // - set migration manager {from: random guy}
    // - destroy {from: random guy}
    // + destroy {from: tokenManager}
    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    ok(Phase.Created, Phase.Running);
    ok(Phase.Running, Phase.Finalizing);

    it("should be in phase Finalized", () =>
        token.currentPhase.call().then(res => {
            assert.equal(Phase.Finalized, res.toFixed(), "not Phase.Finalized")}));

    it("tokenManager can call setMigrationManager in Phase.Finalized", () =>
        token.setMigrationManager('0x0', {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal('0x0000000000000000000000000000000000000000', res, "Invalid migrationManager"))))

    no(Phase.Finalized, Phase.Migrating);  // when migrationManager == 0x0

    it("tokenManager can call setMigrationManager in Phase.Finalized)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    ok(Phase.Finalized, Phase.Migrating);

    it("random guy should fail to call setPhase in Phase.Migrating", () =>
        token.setPhase(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    no(Phase.Migrating, Phase.Created);
    no(Phase.Migrating, Phase.Paused);
    no(Phase.Migrating, Phase.Running);
    no(Phase.Migrating, Phase.Finalizing);
    no(Phase.Migrating, Phase.Refunding);
    no(Phase.Migrating, Phase.Finalized);
    no(Phase.Migrating, Phase.Migrating);

    it("random guy should fail to call setMigrationManager in Phase.Migrating", () =>
        token.setMigrationManager(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it("random guy should not be able to destroy token in Phase.Migrating", () =>
        token.destroy({from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager should be able to successfully destroy token in Phase.Migrating", () =>
        token.destroy({from: tokenManager})
            .then(res => {}));

    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    ok(Phase.Created, Phase.Running);
    ok(Phase.Running, Phase.Finalizing);

    it("tokenManager can call setMigrationManager in Phase.Finalized)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    ok(Phase.Finalized, Phase.Migrating);
    ok(Phase.Migrating, Phase.Migrated);


    // At phase Migrated
    // + create token
    // - set phase  {from: random guy}
    // + set phase  {from: tokenManager}
    // - set migration manager {from: tokenManager}
    // - set migration manager {from: random guy}
    // - destroy {from: random guy}
    // + destroy {from: tokenManager}
    it("can succesfully create TokenLifecycle", async function() {
        token = await TokenLifecycleMock.new(tokenManager)
    });

    ok(Phase.Created, Phase.Running);
    ok(Phase.Running, Phase.Finalizing);

    it("tokenManager can call setMigrationManager in Phase.Finalized)", () =>
        token.setMigrationManager(migrationManager, {from: tokenManager})
            .then(() => token.migrationManager.call().then(res =>
                assert.equal(migrationManager, res, "Invalid migrationManager"))))

    ok(Phase.Finalized, Phase.Migrating);
    ok(Phase.Migrating, Phase.Migrated);

    it("random guy should fail to call setPhase in Phase.Migrated", () =>
        token.setPhase(migrationManager, {from: investor1})
            .then(assert.fail).catch(evmThrow))

    it('should fail to call setMigrationManager in Phase.Migrated', async function () {
        await token.setMigrationManager(migrationManager, {from: tokenManager}).should.be.rejectedWith(EVMThrow)
    })

    no(Phase.Migrated, Phase.Created);
    no(Phase.Migrated, Phase.Paused);
    no(Phase.Migrated, Phase.Running);
    no(Phase.Migrated, Phase.Finalizing);
    no(Phase.Migrated, Phase.Refunding);
    no(Phase.Migrated, Phase.Finalized);
    no(Phase.Migrated, Phase.Migrating);
    no(Phase.Migrated, Phase.Migrated);

    it("random guy should not be able to destroy token in Phase.Migrated", () =>
        token.destroy({from: migrationManager})
            .then(assert.fail).catch(evmThrow))

    it("tokenManager should be able to successfully destroy token in Phase.Migrated", () =>
        token.destroy({from: tokenManager})
            .then(res => {}));

});

