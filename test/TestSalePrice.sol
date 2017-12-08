pragma solidity ^0.4.17;

import '../contracts/SalePriceMock.sol';
import "../contracts/DSTest.sol";
import "../contracts/DSWarp.sol";
import "truffle/Assert.sol";


contract TestSalePrice is DSTest {
    SalePriceMock sale;
    address public constant _tokenManager = 0x0303030303030303030303030303030303030303;

    /// @dev ICO Price in units of tokens per ether
    /// @dev 5000 VMTs per Ether 
    uint256 public constant PRICE = 5000;

    /// @dev Initial discount in units of tokens per ether
    /// @dev 20% initial discount on VMTs per Ether 
    uint256 public constant INITIAL_DISCOUNT = 1000;

    /// @dev Days in token sale
    uint public constant SALE_PERIOD = 10;

    /// @dev Days discount is fixed at a specific level
    uint public constant DISCOUNT_PERIOD = 2;

    /// @dev No discount during last period
    uint public constant TOTAL_DISCOUNT_PERIODS = (SALE_PERIOD / DISCOUNT_PERIOD) - 1;

    /// @dev Uniform reduction of discount amount in units of ether
    uint256 public constant DISCOUNT_REDUCTION_AMOUNT = INITIAL_DISCOUNT / TOTAL_DISCOUNT_PERIODS;

    uint public constant POS_LAST_TO_1 = 1; // position from last sec in day to 1st sec in next day
    uint public constant POS_1_TO_LAST = (1 * 1 days) - 1;  // position from 1st sec to last sec in day


    function beforeAll() public {
        setUp();
    }

    function setUp() public {
        sale = new SalePriceMock(_tokenManager, 5000);
        sale.startSale();
    }

    function testSaleStarted() public {
        bool r;

        r = sale.validPurchase();
        Assert.isTrue(r, "Should be true, as it should NOT throw - sale is running");
    }

    function testPriceAtDayOneStart() public {
        uint256 price;

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT));
    }

    function testPriceAtDayOneEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT));
    }

    function testPriceAtDayTwoStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT));
    }

    function testPriceAtDayTwoEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT));
    }

    function testPriceAtDayThreeStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - DISCOUNT_REDUCTION_AMOUNT));
    }

    function testPriceAtDayThreeEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - DISCOUNT_REDUCTION_AMOUNT));
    }

    function testPriceAtDayFourStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - DISCOUNT_REDUCTION_AMOUNT));
    }

    function testPriceAtDayFourEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - DISCOUNT_REDUCTION_AMOUNT));
    }

    function testPriceAtDayFiveStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (2 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDayFiveEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (2 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDaySixStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (2 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDaySixEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (2 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDaySevenStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (3 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDaySevenEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (3 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDayEightStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (3 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDayEightEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (3 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDayNineStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (4 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDayNineEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (4 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDayTenStart() public {
        uint256 price;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (4 * DISCOUNT_REDUCTION_AMOUNT)));
    }

    function testPriceAtDayTenEnd() public {
        uint256 price;
        uint period = POS_1_TO_LAST; // move to last sec in day

        sale.warpAhead(period);

        price = sale.salePrice();
        assertEq(uint(price), uint(PRICE + INITIAL_DISCOUNT - (4 * DISCOUNT_REDUCTION_AMOUNT)));
         
    }

    function testSaleEnded() public {
        bool r;
        uint period = POS_LAST_TO_1; // move to 1st sec in next day

        sale.warpAhead(period);
        sale.endSale();

        r = sale.validPurchase();
        Assert.isFalse(r, "Should be False, as it should throw - sale has ended");
    }

}


