pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TokenLifecycle.sol';
import './PurchasableToken.sol';
import './BurnableToken.sol';
import './FinalizableToken.sol';
import './RefundVault.sol';


/**
 * @title A Refundable Token
 * @author Tavit Ohanian
 * @dev Adapted from the OpenZeppelin library (RefundableCrowdsale).
 * @dev Extension of FinalizableToken that adds a funding goal, and
 * @dev the possibility of users getting a refund if goal is not met.
 * @dev Uses a RefundVault as a token sale vault.
 */
contract RefundableToken is PurchasableToken, RefundVault {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */

    /**
     * @notice minimum amount of funds to be raised in weis
     * @notice from token purchases
     */
    uint256 public goal;


    /**
     * @dev Event definitions
     */

    /**
     * @dev Constructor
     */

    /**
     * @notice RefundableToken(address _previousToken, address _tokenManager, 
     *                            address _escrow, uint256 _rate, uint256 _goal)
     * @param _previousToken Presale token contract address.
     * @param _tokenManager Token manager address.
     * @param _escrow MultiSig account address that will withdraw Ether from token purchases.
     * @param _rate base purchase rate.
     * @param _goal fundraiser minimum goal
     */
    function RefundableToken(address _previousToken, address _tokenManager, 
      address _escrow, uint256 _rate, uint256 _goal) public 
        BasicToken(_tokenManager)
        PurchasableToken(_previousToken, _escrow, _rate)
        RefundVault(_escrow)
        BurnableToken()
        StandardToken()
        MintableToken()
        FinalizableToken()
    {
        require(_goal > 0);
        // goal in wei = (_goal in ether) * (1 ether / 1 wei)
        goal = _goal * (1 ether / 1 wei); 
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
     * @notice depositEther()
     * @notice Deposit ether to cover [migrated token] presale purchase refunds.
     * @notice When presale tokens are migrated, weiRaised is updated but no ether is deposited.
     */
    function depositEther() public payable {
        require(msg.value > 0);
    }

    /**
     * @notice Function to forward funds from token purchase
     * @notice overrides default token implementation to use refund vault
     */
    function forwardFunds() internal {
      //deposit(msg.sender);
      this.deposit.value(msg.value)(msg.sender);
    }

    /**
     * @dev if crowdsale is unsuccessful, investors can claim refunds here
     */
    function claimRefund() public {
      require(isFinalized);
      require(!goalReached());

      refund(msg.sender);
    }

    /**
     * @dev checks if crowdsale is successful
     */
    function goalReached() public constant returns (bool) {
      return weiRaised >= goal;
    }


    /**
     * @dev Internal functions
     */

    /**
     * @dev vault finalization task, called when owner calls finalize()
     */
    function finalize() internal {
      if (goalReached()) {
        close();
        // mint additional tokens for defined allocation pools
        mintDefinedPools();
        currentPhase = Phase.Finalized; // token is finalized
      } else {
        enableRefunds();
        currentPhase = Phase.Refunding; // token is refunding
      }

      LogPhaseSwitch(currentPhase);
      super.finalization(); // declare finalization complete
    }


    /**
     * @dev Private functions
     */

    /**
     * @dev goal is reached: 
     * @dev - on successful sale, additional pools of token are minted and initially 
     * @dev   allocated to token manager:
     * @dev   1) Management and Advisors Pool ==> 10% of totalSupply
     * @dev   2) Founders and Project Team ==> 25% of totalSupply
     * @dev   3) Bounty and other Pool ==> 10% of totalSupply
     * @dev      - 4,500,000 VMT issued to the contributors of earlier developed Vectavi assets
     * @dev      - remaining VMT is reserved for bounty (exchanged for ether to fund bounty 
     * @dev        contracts). bounty is separate contract funded with ether by token manager 
     */
    function mintDefinedPools() private {
        require(tokenManager != 0x0);
        //
        // sale (current totalSupply) represents 55% of final token supply
        // need to mint additional poolSupply tokens representing 45% of 
        // final token totalSupply: poolSupply = totalSupply * (45 / 55)
        // the minted poolSupply is initially allocated to the token manager
        // 
        uint256 poolSupply = SafeMath.div(SafeMath.mul(totalSupply, 45),55);
        // grant/revoke of vested tokens must be from same msg.sender
        mint(wallet, poolSupply);
    }

}

