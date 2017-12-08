pragma solidity ^0.4.17;


import '../../contracts/RefundableToken.sol';


// mock class using RefundableToken
contract RefundableTokenMock is RefundableToken {

  function RefundableTokenMock(
      address _previousToken, 
      address _tokenManager, 
      address _escrow, 
      uint256 _rate, 
      uint256 _goal
      ) public 
    RefundableToken(_previousToken, _tokenManager, _escrow, _rate, _goal)
  {
  }

}


