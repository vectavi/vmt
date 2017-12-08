pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TokenLifecycle.sol';
import './MintableToken.sol';


/**
 * @title A Burnable Token
 * @author Tavit Ohanian
 * @dev Token manager can burn tokens during migration
 */
contract BurnableToken is MintableToken {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */


    /**
     * @dev Event definitions
     */

    /**
     * @notice token burn event
     * @param burner who burned the tokens
     * @param owner who was the owner of the tokens
     * @param amount amount of tokens burned
     */
    event TokenBurn(address indexed burner, address indexed owner, uint256 amount);


    /**
     * @dev Constructor
     */


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
     * @dev Administrative functions
     */

    /**
     * @notice burnTokens(address _owner)
     * @notice Use to burn migrated tokens.
     * @notice Migration manager has exclusive priveleges to burn older version tokens.
     * @notice Available only during migration phase.
     * @param _owner Address of token owner whose migrated tokens are to be burned.
     */
    function burnTokens(address _owner) public onlyMigrationManager onlyWhenMigrating {
        uint256 tokens = balances[_owner];
        require(tokens > 0);
        balances[_owner] = 0;

        totalSupply = totalSupply.sub(tokens);
        TokenBurn(msg.sender, _owner, tokens);

        // Automatically switch phase when migration is done.
        if(totalSupply == 0) {
            // onlyTokenManager (not MigrationManager) may call setPhase()
            //setPhase(Phase.Migrated);
            currentPhase = Phase.Migrated;
            LogPhaseSwitch(Phase.Migrated);
        }
    }


    /**
     * @dev Internal functions
     */


    /**
     * @dev Private functions
     */

}
