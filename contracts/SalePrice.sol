pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TokenLifecycle.sol';
import "./DSWarp.sol";


/**
 * @title SalePrice
 * @author Tavit Ohanian
 * @notice Allows determination of discounted sale price of token purchase
 */
contract SalePrice is TokenLifecycle {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */

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

    /// @dev Used to compute purchase price
    uint prevPeriod;
    uint currPeriod;
    uint256 price; // in units of ether

    /**
     * @notice rate how many token units a buyer gets per wei
     */
    uint256 public rate;


    /**
     * @dev Event definitions
     */

    /**
     * @notice token purchase event
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value wei paid for purchase
     * @param amount amount of tokens purchased
     */
    event PriceChangePurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);


    /**
     * @dev Constructor
     */

    /**
     * @notice SalePrice(uint256 _rate)
     * @param _rate base purchase rate.
     */
    function SalePrice(uint256 _rate) public {
        require(_rate > 0);
        rate = _rate;
        
        prevPeriod = 0;
        currPeriod = 0;
        price = PRICE + INITIAL_DISCOUNT; // in ether units
    }


    /**
     * @dev Fallback function (if exists)
     */


    /**
     * @dev External functions
     */


    /**
     * @dev Public functions
     */

    /**
     * @notice validPurchase()
     * @return true if sale is running and period has not expired
     */
    function validPurchase() public view returns (bool) {
        bool _active =
            saleStart > 0 &&
            currentTime() >= saleStart &&
            (currentTime() - saleStart) < (SALE_PERIOD * 1 days);

        return _active;
    }

    /**
     * @notice salePrice()
     * @notice Calculate price in tokens per wei.
     * @notice Available at any token phase state.
     */
    function salePrice() public returns (uint256) {
        // called only when running and purchase is valid
        currPeriod = (currentTime() - saleStart) / (DISCOUNT_PERIOD * 1 days);
        if (currPeriod > prevPeriod) {
            prevPeriod = currPeriod;
            if (price >= SafeMath.add(PRICE, DISCOUNT_REDUCTION_AMOUNT)) {
                price = price.sub(DISCOUNT_REDUCTION_AMOUNT);
            } else {
                price = PRICE; // latch at non-discounted price
            }
        }
        return price;
    }


    /**
     * @dev Administrative functions
     */


    /**
     * @dev Internal functions
     */

    /**
     * @notice currentTime()
     * @notice override to warp time for sale discount testing
     * @return block.timestamp
     */
    function  currentTime() internal view returns (uint) {
        return block.timestamp;
    }


    /**
     * @dev Private functions
     */

}

