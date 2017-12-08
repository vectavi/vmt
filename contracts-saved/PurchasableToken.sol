pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ReentrancyGuard.sol';
import './TokenLifecycle.sol';
import './FinalizableToken.sol';
import './SalePrice.sol';
import '../../vpt/contracts/PresaleToken.sol';


/**
 * @title A Purchasable Token
 * @author Tavit Ohanian
 * @notice Allows token purchase only while sale is running
 */
contract PurchasableToken is FinalizableToken, SalePrice, ReentrancyGuard {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */

    /**
     * @notice Gathered funds can be withdrawn only to wallet/escrow's address.
     */
    address public  wallet;

    /**
     * @notice weiRaised amount of sale raised money in wei
     */
    uint256 public weiRaised;

    /// @dev presale price in units of tokens per ether
    /// @dev 5000 VMTs @ 25% discount per Ether 
    uint256 public constant DISCOUNTED_PRESALE_PRICE = 6250;

    /// @dev Token conversion rate: one new token for each old token
    uint256 public constant TOKEN_CONVERSION_RATE = 1;
    
    /// @dev Token contract interface of old tokens to be converted
    PresaleToken prevToken;


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
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    /**
     * @notice token migration event
     * @param holder address holding the migrated tokens
     * @param newtokens number of new tokens minted
     * @param oldtokens number of older tokens burned
     */
    event TokenMigration(address indexed holder, uint256 newtokens, uint256 oldtokens);


    /**
     * @dev Constructor
     */

    /**
     * @notice PurchasableToken(address _prevToken, address _escrow, uint256 _rate)
     * @param _prevToken contract address of previously purchased tokens.
     * @param _escrow MultiSig account address that will withdraw Ether from token purchases.
     * @param _rate base purchase rate.
     */
    function PurchasableToken(address _prevToken, address _escrow, uint256 _rate) public 
        SalePrice(_rate)
    {
        require(_prevToken != 0x0);
        require(_escrow != 0x0);
        prevToken = PresaleToken(_prevToken);
        wallet = _escrow;
    }


    /**
     * @dev Fallback function (if exists)
     */
    function() public payable {
        buyTokens(msg.sender);
    }


    /**
     * @dev External functions
     */

    /**
     * @notice Function to migrate/convert/upgrade tokens purchased
     * @notice during a previous sale (ex: presale) into tokens
     * @notice purchased in the current sale (ex: ICO)
     */
    function migrateToken(address _investor) external onlyWhenMintable nonReentrant { 
        uint256 _oldTokens = prevToken.balanceOf(_investor);
        require(_oldTokens > 0);
        prevToken.burnTokens(_investor);

        // 
        // compute wei paid during presale (offered at 25% discount)
        // price = 5000 tokens / ether
        // 25% discount = 5000 / 4 = 1250 tokens / ether
        // discounted presale price = 6250 tokens / ether
        // weiRaised = presale tokens / discounted presale price
        // 
        uint256 weiAmount = _oldTokens.div(DISCOUNTED_PRESALE_PRICE);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        // calculate token amount to be created
        uint256 _newTokens = _oldTokens.mul(TOKEN_CONVERSION_RATE);

        mint(_investor, _newTokens);
        TokenPurchase(msg.sender, _investor, weiAmount, _newTokens);
        TokenMigration(_investor, _newTokens, _oldTokens);

        forwardFunds();

    }


    /**
     * @dev Public functions
     */

    /**
     * @notice buyTokens(address beneficiary)
     * @notice Lets buy you some tokens.
     * @notice Available only if sale is running.
     */
    function buyTokens(address beneficiary) public payable onlyWhenRunning {
        require(beneficiary != 0x0);
        require(msg.value > 0);
        require(validPurchase());

        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 tokens = weiAmount.mul(salePrice());

        // update state
        weiRaised = weiRaised.add(weiAmount);

        mint(beneficiary, tokens);
        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

        forwardFunds();
    }

    /**
     * @notice hasEnded()
     * @notice check if token sale has ended.
     * @return true if crowdsale event has ended
     */
    function hasEnded() public constant returns (bool) {
      return !validPurchase();
    }


    /**
     * @dev Administrative functions
     */

    /**
     * @dev withdraw ether administrative function
     */
    function withdrawEther() public
        onlyTokenManager
    {
        // Available at any phase.
        if(this.balance > 0) {
            require(wallet.send(this.balance));
        }
    }


    /**
     * @dev Internal functions
     */

    /**
     * @notice forwardFunds()
     * @notice send ether to the fund collection  wallet
     * @notice override to create custom fund forwarding mechanisms
     */
    function forwardFunds() internal {
         wallet.transfer(msg.value);
    }


    /**
     * @dev Private functions
     */

}
