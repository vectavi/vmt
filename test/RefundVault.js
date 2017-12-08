'use strict'

const ether = require('./helpers/ether.js')
const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines vault lifecycle phases
const RefundVaultMock = artifacts.require("./helpers/RefundVaultMock.sol")
const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('RefundVault', function (accounts) {
    const investor1 = accounts[0];
    const investor2 = accounts[1];
    const investor3 = accounts[2];
    const presaleOwners = [accounts[3], accounts[4], accounts[5]];
    const requiredOwners = 2;
    const escrow = accounts[7];
    const migrationManager = accounts[8];
    const tokenManager = accounts[9];
    const investorNone = 0x0;
    const value = ether(42);

    let vault, ret, phase, currentPhase

    beforeEach(async function () {
        vault = await RefundVaultMock.new(escrow)
        assert(vault != null, "should be able to create refund vault")
    })


    it('should accept contributions', async function () {
        await vault.deposit(investor1).should.be.fulfilled
    })

    it('should not refund contribution during active state', async function () {
        await vault.deposit(investor1)
        await vault.refund(investor1).should.be.rejectedWith(EVMThrow)
    })

    it('should not refund contribution during closed state', async function () {
        await vault.deposit(investor1)
        await vault.closeVault().should.be.fulfilled
        await vault.refund(investor1).should.be.rejectedWith(EVMThrow)
    })

    it('should refund contribution after entering refund mode', async function () {
        await vault.deposit(investor1, {value, from: tokenManager})
        await vault.refundVault()

        const pre = web3.eth.getBalance(investor1)
        await vault.refund(investor1, {from: investor2})
        const post = web3.eth.getBalance(investor1)

        post.minus(pre).should.be.bignumber.equal(value)
    })

    it('should forward funds to escrow after closing', async function () {
        await vault.deposit(investor1, {value, from: tokenManager})

        const pre = web3.eth.getBalance(escrow)
        await vault.closeVault({from: tokenManager})
        const post = web3.eth.getBalance(escrow)

        post.minus(pre).should.be.bignumber.equal(value)
    })

})

