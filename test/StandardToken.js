'use strict';

const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines token lifecycle phases
const StandardTokenMock = artifacts.require('./helpers/StandardTokenMock.sol');
const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()
const expect = require('chai').expect


contract('StandardToken', function(accounts) {
    const investor1 = accounts[0];
    const investor2 = accounts[1];
    const investor3 = accounts[2];
    const migrationManager = accounts[8];
    const tokenManager = accounts[9];
    const initialSupply = 1000;
    const allowAmount = 100;
    const investorNone = 0x0;
    let token, ret, phase
    let mintingFinished, currentPhase, allowance

    beforeEach(async function() {
        token = await StandardTokenMock.new(tokenManager, investor1, initialSupply)
    });
  
    it('finalize() should transition token phase to Finalized', async function () {
        await token.fin();
        currentPhase = await token.currentPhase.call()
        currentPhase.toFixed().should.equal(Phase.Finalized.toFixed())
    })

    it('should return the correct totalSupply after construction', async function() {
        let totalSupply = await token.totalSupply.call();

        totalSupply.toFixed().should.equal(`${initialSupply}`);
    });

    it('should return the correct allowance amount after approval', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.approve(investor2, allowAmount);
        allowance = await token.allowance(investor1, investor2);

        assert.equal(allowance, allowAmount);
    });

    it('should return correct balances after transfer', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.transfer(investor2, allowAmount);
        let balance0 = await token.balanceOf(investor1);
        assert.equal(balance0, initialSupply-allowAmount);

        let balance1 = await token.balanceOf(investor2);
        assert.equal(balance1, allowAmount);
    });

    it('should throw an error when trying to transfer more than balance', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.transfer(investor1, initialSupply+1).should.be.rejectedWith(EVMThrow)
    });

    it('initial spender allowance should be zero', async function() {
        let preApproved = await token.allowance(investor1, investor2);
        assert.equal(preApproved, 0);
    });

    it('verify spender allowance after approval', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.approve(investor2, allowAmount);
        let preApproved = await token.allowance(investor1, investor2);
        assert.equal(preApproved, allowAmount);
    });

    it('should return correct balances after transfering from another account', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.approve(investor2, allowAmount);
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2});

        let balance0 = await token.balanceOf(investor1);
        assert.equal(balance0, initialSupply-allowAmount);

        let balance1 = await token.balanceOf(investor3);
        assert.equal(balance1, allowAmount);

        let balance2 = await token.balanceOf(investor2);
        assert.equal(balance2, 0);
    });

    it('should throw an error when trying to transfer more than allowed', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.approve(investor2, allowAmount-1);
        await token.transferFrom(investor1, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transfer to 0x0', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.transfer(investorNone, allowAmount).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom to 0x0', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.approve(investor2, allowAmount);
        await token.transferFrom(investor1, investorNone, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

    it('should throw an error when trying to transferFrom from 0x0', async function() {
        await token.fin(); // approve/transfer only enabled when token is finalized
        await token.approve(investor2, allowAmount);
        await token.transferFrom(investorNone, investor3, allowAmount, {from: investor2}).should.be.rejectedWith(EVMThrow)
    });

});
