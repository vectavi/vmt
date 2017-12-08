pragma solidity ^0.4.17;


import './TokenLifecycle.sol';


// mock class using TokenLifecycle
contract TokenLifecycleMock is TokenLifecycle {

  function TokenLifecycleMock(address _tokenManager) public {
    require(_tokenManager != 0x0);
    tokenManager = _tokenManager;
  }

}


