const assertJump = require('./helpers/assertJump');
const Phase = require('./helpers/phase'); // our flavor defines token lifecycle phases

var BasicTokenMock = artifacts.require("./helpers/BasicTokenMock.sol");

contract('BasicToken', function(accounts) {

  it("token manager should be properly set after construction", async function() {
    let token = await BasicTokenMock.new(accounts[9], accounts[0], 100);
    let ret = await token.tokenManager.call()

    assert.equal(ret, accounts[9]);
  })

  it("should return the correct totalSupply after construction", async function() {
    let token = await BasicTokenMock.new(accounts[9], accounts[0], 100);
    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply, 100);
  })

  it("should return correct balances after transfer", async function(){
    let token = await BasicTokenMock.new(accounts[9], accounts[0], 100);
    let phase = await token.fin();
    let transfer = await token.transfer(accounts[1], 100);

    let firstAccountBalance = await token.balanceOf(accounts[0]);
    assert.equal(firstAccountBalance, 0);

    let secondAccountBalance = await token.balanceOf(accounts[1]);
    assert.equal(secondAccountBalance, 100);
  });

  it('should throw an error when trying to transfer more than balance', async function() {
    let token = await BasicTokenMock.new(accounts[9], accounts[0], 100);
    try {
      let transfer = await token.transfer(accounts[1], 101);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }    
  });

  it('should throw an error when trying to transfer to 0x0', async function() {
    let token = await BasicTokenMock.new(accounts[9], accounts[0], 100);
    try {
      let transfer = await token.transfer(0x0, 100);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

});
