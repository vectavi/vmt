pragma solidity ^0.4.17;


import '../../contracts/RefundVault.sol';


// mock class using RefundVault
contract RefundVaultMock is RefundVault {

  function RefundVaultMock(address _escrow) public 
    RefundVault(_escrow)
  {
  }

    function closeVault() public {
      super.close();
    }

    function refundVault() public {
      super.enableRefunds();
    }
}


