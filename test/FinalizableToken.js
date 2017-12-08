'use strict'

const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines token lifecycle phases
const FinalizableTokenMock = artifacts.require("./helpers/FinalizableTokenMock.sol")
const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('FinalizableToken', function (accounts) {
    let token, ret 

    beforeEach(async function () {
        token = await FinalizableTokenMock.new(accounts[9], accounts[0], 1000)
    })

    it('finalizable token should initialize isFinalized as false ', async function () {
        ret = await token.isFinalized.call()
        ret.should.be.false
    })

    it('finalize() call should emit Finalized event', async function () {
        const { logs } = await token.fin();
        const event = logs.find(e => e.event === 'Finalized')
        expect(event).to.exist
    })

    it('finalize() call should transition isFinalized to true', async function () {
        await token.fin();
        ret = await token.isFinalized.call()
        ret.should.be.true
    })

    it('cannot finalize() when isFinalized has already transitioned to true', async function () {
        await token.fin();
        await token.fin().should.be.rejectedWith(EVMThrow) 
    })
})
