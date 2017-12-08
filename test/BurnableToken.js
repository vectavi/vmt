'use strict'

const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines token lifecycle phases
const BurnableTokenMock = artifacts.require("./helpers/BurnableTokenMock.sol")
const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('BurnableToken', function (accounts) {
    let token 
    let expectedTokenSupply = new BigNumber(0) // zeppeling flavor: (999)
    let phase, mimgr, currentPhase

    beforeEach(async function () {
        token = await BurnableTokenMock.new(accounts[9], accounts[0], 1000)
    })

    it('burnable token should be in created phase', async function () {
        currentPhase = await token.currentPhase.call()
        currentPhase.toFixed().should.equal(Phase.Created.toFixed())
    })

    it('burnable token should transition to finalized phase', async function () {
        phase = await token.fin();
        currentPhase = await token.currentPhase.call()
        currentPhase.toFixed().should.equal(Phase.Finalized.toFixed())
    })

    it('should reject migration manager address unless request is from token manager', async function () {
        phase = await token.fin();
        await token.setMigrationManager(accounts[8], {from: accounts[8]}).should.be.rejectedWith(EVMThrow)
    })

    it('should accept migration manager address when request is from token manager', async function () {
        phase = await token.fin();
        mimgr = await token.setMigrationManager(accounts[8], {from: accounts[9]});
        mimgr = await token.migrationManager.call()
        mimgr.toString().should.equal(accounts[8].toString())
    })

    it('should reject transition to migrating phase unless request is from token manager', async function () {
        phase = await token.fin();
        mimgr = await token.setMigrationManager(accounts[8], {from: accounts[9]});
        await token.setPhase(Phase.Migrating, {from: accounts[8]}).should.be.rejectedWith(EVMThrow)
    })

    it('should transition to migrating phase when request is from token manager', async function () {
        phase = await token.fin();
        mimgr = await token.setMigrationManager(accounts[8], {from: accounts[9]});
        phase = await token.setPhase(Phase.Migrating, {from: accounts[9]});
        currentPhase = await token.currentPhase.call()
        currentPhase.toFixed().should.equal(Phase.Migrating.toFixed())
    })

    it('should reject token burn unless request is from migration manager', async function () {
        phase = await token.fin();
        mimgr = await token.setMigrationManager(accounts[8], {from: accounts[9]});
        phase = await token.setPhase(Phase.Migrating, {from: accounts[9]});
        await token.burnTokens(accounts[0], { from: accounts[9] }).should.be.rejectedWith(EVMThrow)
    })

    it('migration manager should be able to burn tokens', async function () {
        phase = await token.fin();
        mimgr = await token.setMigrationManager(accounts[8], {from: accounts[9]});
        phase = await token.setPhase(Phase.Migrating, {from: accounts[9]});

        // zeppelin behavior is to burn value tokens from message sender balance
        //const { logs } = await token.burnTokens(1, { from: accounts[0] })
        // our behavior is to burn all tokens for specified investor
        const { logs } = await token.burnTokens(accounts[0], { from: accounts[8] })

        const balance = await token.balanceOf(accounts[0])
        balance.should.be.bignumber.equal((expectedTokenSupply))

        const totalSupply = await token.totalSupply()
        totalSupply.should.be.bignumber.equal((expectedTokenSupply))

        // our flavor: verify automatic phase change to Migrated when all tokens are burned
        currentPhase = await token.currentPhase.call()
        assert.equal(7, currentPhase.toFixed(), "not Phase.Migrated")

        const event = logs.find(e => e.event === 'TokenBurn') // zeppelin flavor: === 'Burn'
        expect(event).to.exist
    })

    it('cannot burn more tokens than your balance', async function () {
        await token.burnTokens(2000, { from: accounts[0] })
        .should.be.rejectedWith(EVMThrow) 
    })
})
