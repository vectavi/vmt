pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';


/**
 * @title A Refund Vault
 * @author Tavit Ohanian
 * @dev Adapted from the OpenZeppelin library (RefundVault).
 * @dev This contract is used for storing funds while a crowdsale
 * @dev is in progress. Supports refunding the money if crowdsale fails,
 * @dev and forwarding it if crowdsale is successful.
 */
contract RefundVault {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */

    /**
     * @notice Vault state definitions
     */
    enum State { Active, Refunding, Closed }
    State public state;

    /**
     * @notice depositer amounts in wei
     */
    mapping (address => uint256) public deposited;

    /**
     * @notice where to forward funds when vault is closed
     */
    address public wallet;


    /**
     * @dev Event definitions
     */

    /**
     * @dev This event indicates the vault has been closed
     */ 
    event Closed();

    /**
     * @dev This event indicates the vault is refunding token purchases
     */ 
    event RefundsEnabled();

    /**
     * @dev This event logs a specific refund
     * @param beneficiary who received the refund
     * @param weiAmount amount of refund received
     */ 
    event Refunded(address indexed beneficiary, uint256 weiAmount);


    /**
     * @dev Constructor
     */
    function RefundVault(address _wallet) public {
      require(_wallet != 0x0);
      wallet = _wallet;
      state = State.Active;
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
     * @dev deposit token purchase funds
     */
    function deposit(address investor) public payable {
      require(state == State.Active);
      deposited[investor] = deposited[investor].add(msg.value);
    }

    /**
     * @dev close the vault
     */
    function close() internal {
      require(state == State.Active);
      state = State.Closed;
      Closed();
      wallet.transfer(this.balance);
    }

    /**
     * @dev enable refunds from the vault
     */
    function enableRefunds() internal {
      require(state == State.Active);
      state = State.Refunding;
      RefundsEnabled();
    }

    /**
     * @dev refund an investor
     */
    function refund(address investor) public {
      require(state == State.Refunding);
      uint256 depositedValue = deposited[investor];
      require(depositedValue > 0);
      deposited[investor] = 0;
      investor.transfer(depositedValue);
      Refunded(investor, depositedValue);
    }

}

