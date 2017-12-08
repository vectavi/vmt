pragma solidity ^0.4.17;


import '../../contracts/StandardToken.sol';


// mock class using StandardToken
contract StandardTokenMock is StandardToken {

  function StandardTokenMock(address tokenManager, address initialAccount, uint256 initialBalance) public 
    BasicToken(tokenManager)
  {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

  function fin() public {
    super.finalize();
  }

}


