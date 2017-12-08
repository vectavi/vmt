pragma solidity ^0.4.15;

import '../../contracts/FinalizableToken.sol';

contract FinalizableTokenMock is FinalizableToken {

  function FinalizableTokenMock(address tokenManager, address initialAccount, uint initialBalance) public 
    BasicToken(tokenManager)
  {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

  function fin() public {
    super.finalize();
  }

}
