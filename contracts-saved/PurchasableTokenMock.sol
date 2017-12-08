pragma solidity ^0.4.17;


import './PurchasableToken.sol';


// mock class using PurchasableToken
contract PurchasableTokenMock is PurchasableToken {

  function PurchasableTokenMock(
      address tokenManager, 
      address initialAccount, 
      uint256 initialBalance, 
      address _prevToken, 
      address _escrow, 
      uint256 _rate
    ) public 
    BasicToken(tokenManager)
    PurchasableToken(_prevToken, _escrow, _rate)
  {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

}


