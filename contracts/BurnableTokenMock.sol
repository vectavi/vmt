pragma solidity ^0.4.15;

import './BurnableToken.sol';

contract BurnableTokenMock is BurnableToken {

  function BurnableTokenMock(address tokenManager, address initialAccount, uint initialBalance) public 
    BasicToken(tokenManager)
  {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

  function fin() public {
    super.finalize();
  }

}
