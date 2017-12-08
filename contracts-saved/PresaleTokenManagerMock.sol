pragma solidity ^0.4.17;

import '../../vpt/contracts/TokenManager.sol';


// mock class using presale TokenManager
contract PresaleTokenManagerMock is TokenManager {

  function PresaleTokenManagerMock(address[] _owners, uint _required) public 
    TokenManager(_owners, _required)
  {
  }

}


