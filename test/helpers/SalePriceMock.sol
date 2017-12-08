pragma solidity ^0.4.17;

import '../../contracts/SalePrice.sol';


// mock class using SalePrice
contract SalePriceMock is SalePrice {

    DSWarp public warp;
    
    function SalePriceMock(address _tokenManager, uint256 _rate) public 
        SalePrice(_rate)
    {
        require(_tokenManager != 0x0);
        tokenManager = _tokenManager;
    }

    function startSale() public {
        // constructor initializes sale start time
        // era() returns sale start time
        warp = new DSWarp();
        saleStart = warp.era();
        runSale();
    }

    function runSale() public {
        currentPhase = Phase.Running;
    }

    function pauseSale() public {
        currentPhase = Phase.Paused;
    }

    function finalizeSale() public {
        currentPhase = Phase.Finalizing;
    }

    function endSale() public {
        saleEnd = warp.era();
        finalizeSale();
    }

    // warp time ahead
    function warpAhead(uint period) public {
        warp.warp(uint64(period));
    }

    /**
     * @notice currentTime()
     * @notice override timer to test sale discount schedule
     * @return block.timestamp
     */
    function  currentTime() internal view returns (uint) {
        return warp.era();
    }

}


