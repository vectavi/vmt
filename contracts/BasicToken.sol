pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TokenLifecycle.sol';


/**
 * @title BasicToken
 * @author Tavit Ohanian
 * @notice Vectavi Token
 * @notice ERC20 compliant token
 * @dev OpenZeppelin Basic token
 * @dev Basic version of StandardToken, with no allowances
 */
contract BasicToken is ERC20Basic, TokenLifecycle {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */

    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) balances;


    /**
     * @dev Event definitions
     */


    /**
     * @dev Constructor
     */

    /**
     * @notice BasicToken(address _tokenManager)
     * @param _tokenManager Token manager address.
     */
    function BasicToken(address _tokenManager) public {
        require(_tokenManager != 0x0);
        tokenManager = _tokenManager;
        name = "Vectavi Market Token";
        symbol = "VMT";
        decimals = 18;
        totalSupply = 0;
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
     * @dev transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value) public onlyWhenFinalized returns (bool) {
      require(_to != 0);
      balances[msg.sender] = balances[msg.sender].sub(_value);
      balances[_to] = balances[_to].add(_value);
      Transfer(msg.sender, _to, _value);
      return true;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param _owner The address to query the the balance of. 
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address _owner) public constant returns (uint256 balance) {
      return balances[_owner];
    }

    /**
     * @dev Administrative functions
     */


    /**
     * @dev Internal functions
     */


    /**
     * @dev Private functions
     */

}
