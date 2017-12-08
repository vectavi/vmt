// Copyright (C) 2017  DappHub, LLC

// Licensed under the Apache License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License.

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).

pragma solidity ^0.4.13;

//import "ds-test/test.sol";
import "../contracts/DSTest.sol";
import "../contracts/DSWarp.sol";
import "truffle/Assert.sol";

// adapted from:
//   https://github.com/dapphub/ds-warp
// references:
//   https://ethereum.stackexchange.com/questions/15596/how-can-i-mock-the-time-for-solidity-tests
//   http://truffleframework.com/tutorials/testing-for-throws-in-solidity-tests

// Proxy contract for testing throws
contract ThrowProxy {
  address public target;
  bytes data;

  function ThrowProxy(address _target) public {
    target = _target;
  }

  //prime the data using the fallback function.
  function() public {
    data = msg.data;
  }

  function execute() public returns (bool) {
    return target.call(data);
  }
}


//contract DSWarpTest is DSTest {
contract TestDSWarp is DSTest {
    DSWarp warp;

    function beforeAll() public {
        setUp();
    }

    function setUp() public {
        warp = new DSWarp();
    }
    function testInit() public {
        assertEq(warp.era(), now);
    }
    function testWarp() public {
        var tic = now;
        warp.warp(1);
        assertEq(warp.era(), tic + 1);
    }
    function testWarpLock() public {
        warp.warp(0);
        assertEq(warp.era(), now);
    }
    function testFailAfterWarpLock() public {
        DSWarp thrower = new DSWarp();
        //set Thrower as the contract to forward requests to. The target.
        ThrowProxy throwProxy = new ThrowProxy(address(thrower)); 

        //prime the proxy.
        DSWarp(address(throwProxy)).warp(0);
        //execute the call that is NOT supposed to throw.
        //r will be false if it threw. r will be true if it didn't.
        //make sure you send enough gas for your contract method.
        bool r = throwProxy.execute();

        Assert.isTrue(r, "Should be true, as it should NOT throw");

        //prime the proxy.
        DSWarp(address(throwProxy)).warp(1);
        //execute the call that is supposed to throw.
        //r will be false if it threw. r will be true if it didn't.
        //make sure you send enough gas for your contract method.
        r = throwProxy.execute();

        Assert.isFalse(r, "Should be false, as it should throw");

    }
}
