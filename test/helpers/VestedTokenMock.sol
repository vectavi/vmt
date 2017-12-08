pragma solidity ^0.4.17;


import '../../contracts/VestedToken.sol';


// mock class using VestedToken
contract VestedTokenMock is VestedToken {

  function VestedTokenMock(address tokenManager, address initialAccount, uint256 initialBalance) public 
    BasicToken(tokenManager)
  {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

  function xferableTokens(address holder, uint64 time) public constant returns (uint256) {
    return super.transferableTokens(holder, time);
  }

  function fin() public {
    super.finalize();
  }

}


