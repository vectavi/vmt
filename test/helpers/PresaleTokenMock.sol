pragma solidity ^0.4.17;

import '../../../vpt/contracts/PresaleToken.sol';


contract PresaleTokenMock is PresaleToken {

  function PresaleTokenMock(address _tokenManager, address _escrow) public 
    PresaleToken(_tokenManager, _escrow)
  {
  }

}


