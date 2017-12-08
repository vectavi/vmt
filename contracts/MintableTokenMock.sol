pragma solidity ^0.4.15;

import './MintableToken.sol';

contract MintableTokenMock is MintableToken {

  function MintableTokenMock(address tokenManager, address initialAccount, uint initialBalance) public 
    BasicToken(tokenManager)
  {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

  function fin() public {
    super.finalize();
  }

  function pint(address _to, uint256 _amount) public returns (bool) {
    return super.mint(_to, _amount);
  }

  function fint() public returns (bool) {
    return super.finishMinting();
  }

}


