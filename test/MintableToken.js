'use strict';

const EVMThrow = require('./helpers/EVMThrow.js')
const Phase = require('./helpers/phase'); // our flavor defines token lifecycle phases
const MintableTokenMock = artifacts.require("./helpers/MintableTokenMock.sol")
const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect


contract('MintableToken', function(accounts) {
    const investor1 = accounts[0];
    const investor2 = accounts[1];
    const migrationManager = accounts[8];
    const tokenManager = accounts[9];
    const initialSupply = 1000;
    const mintAmount = 100;
    const mintedFrom = 0x0;
    let token, ret, phase
    let mintingFinished, currentPhase

    beforeEach(async function() {
        token = await MintableTokenMock.new(tokenManager, investor1, initialSupply)
    });

    it("token manager should be properly set after construction", async function() {
        let ret = await token.tokenManager.call()

        assert.equal(ret, tokenManager);
    })

    it('burnable token should be in created phase', async function () {
        currentPhase = await token.currentPhase.call()
        currentPhase.toFixed().should.equal(Phase.Created.toFixed())
    })

    it('burnable token should transition to running phase', async function () {
        phase = await token.setPhase(Phase.Running, {from: accounts[9]});
        currentPhase = await token.currentPhase.call()
        currentPhase.toFixed().should.equal(Phase.Running.toFixed())
    })

    it(`should start with a totalSupply of ${initialSupply}`, async function() {
      let totalSupply = await token.totalSupply.call();

      totalSupply.toFixed().should.equal(`${initialSupply}`);
    });

    it('should return mintingFinished false after construction', async function() {
        mintingFinished = await token.mintingFinished.call();

        mintingFinished.should.be.false;
    });

    it('should mint a given amount of tokens to a given address', async function() {
        phase = await token.setPhase(Phase.Running, {from: accounts[9]});
        const result = await token.pint(investor2, mintAmount);
        result.logs[0].event.should.equal('Mint');
        result.logs[0].args.to.valueOf().should.equal(investor2);
        result.logs[0].args.amount.valueOf().should.equal(`${mintAmount}`);
        result.logs[1].event.should.equal('Transfer');
        result.logs[1].args.to.valueOf().should.equal(`${investor2}`);

        let balance0 = await token.balanceOf(investor2);
        balance0.toFixed().should.equal(`${mintAmount}`);
    
        let totalSupply = await token.totalSupply.call();
        totalSupply.toFixed().should.equal(`${initialSupply+mintAmount}`);
    })

    it('should fail to mint after call to finishMinting', async function () {
        await token.fint();
        ret = await token.mintingFinished.call()
        ret.should.be.true
        await token.pint(investor2, mintAmount).should.be.rejectedWith(EVMThrow)
    })

});

