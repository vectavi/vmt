pragma solidity ^0.4.15;


import './BasicToken.sol';


// mock class using BasicToken
contract BasicTokenMock is BasicToken {

  function BasicTokenMock(address tokenManager, address initialAccount, uint256 initialBalance) public 
    BasicToken(tokenManager)
  {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

  function fin() public {
    super.finalize();
  }
}
