pragma solidity ^0.4.15;

/**
 * @title A Token Lifecycle Manager
 * @author Tavit Ohanian
 * @dev Use to extend a token contract with lifecycle management.
 * @dev Designed to integrate with OpenZeppelin library.
 * @dev Adapted from the SONM project: 
 * @dev https://github.com/sonm-io/presale-token.git
 * 
 */
contract TokenLifecycle {

    /**
     * @dev State definitions
     */

    /**
     * @notice Token lifecycle state values
     */
    enum Phase {
        Created,
        Running,
        Paused,
        Finalizing,
        Refunding,
        Finalized,
        Migrating,
        Migrated
    }

    /**
     * @notice Current state of the token
     */
    Phase public currentPhase;

    /**
     * @notice The token manager is a contract with exclusive 
     * @notice priveleges to administer the token sale state
     */
    address public tokenManager;

    /**
     * @notice Migration manager is a contract with exclusive priveleges to migrate,
     * @notice convert, or upgrade this token (ex: migrate presale token to ICO token).
     */
    address public migrationManager;

    /**
     * @notice saleStart Timestamp when token sale started running phase
     * @notice saleEnd Timestamp when token sale switched to finalization phase
     */
    uint public saleStart;
    uint public saleEnd;


    /**
     * @dev Event definitions
     */

    /**
     * @dev This event indicates a token state change.
     * @param newPhase the new phase state of the token
     */ 
    event LogPhaseSwitch(Phase newPhase);


    /**
     * @dev Constructor
     */
    function TokenLifecycle() public {
        currentPhase = Phase.Created;
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
     * @dev Only token manager should be allowed administrative access
     */
    modifier onlyTokenManager() { 
        require((tokenManager != 0x0) && (msg.sender == tokenManager)); _; 
    }

    /**
     * @dev Only migration manager should be allowed to migrate, convert, 
     * @dev or upgrade this token to a new token.
     */
    modifier onlyMigrationManager() { 
        require((migrationManager != 0x0) && (msg.sender == migrationManager)); _; 
    }

    /**
     * @dev Use this modifier to define when a specific token function is applicable.
     */
    modifier onlyWhenCreated() { require(currentPhase == Phase.Created); _; }
    modifier onlyWhenRunning() { require(currentPhase == Phase.Running); _; }
    modifier onlyWhenPaused() { require(currentPhase == Phase.Paused); _; }
    modifier onlyWhenFinalizing() { require(currentPhase == Phase.Finalizing); _; }
    modifier onlyWhenRefunding() { require(currentPhase == Phase.Refunding); _; }
    modifier onlyWhenFinalized() { require(currentPhase == Phase.Finalized); _; }
    modifier onlyWhenMigrating() { require(currentPhase == Phase.Migrating); _; }
    modifier onlyWhenMigrated() { require(currentPhase == Phase.Migrated); _; }

    modifier onlyWhenMintable() { 
        require((currentPhase == Phase.Running) || (currentPhase == Phase.Finalizing)); _; 
    }


    /**
     * @dev Public phase change administrative functions.
     */

    /**
     * @dev phase change administrative function
     */
    function setPhase(Phase _nextPhase) public onlyTokenManager {
        bool canSwitchPhase
            =  (currentPhase == Phase.Created && _nextPhase == Phase.Running)
            || (currentPhase == Phase.Running && _nextPhase == Phase.Paused)
            || (currentPhase == Phase.Paused && _nextPhase == Phase.Running)
            || (currentPhase == Phase.Running || currentPhase == Phase.Paused 
                && _nextPhase == Phase.Finalizing)
            || (currentPhase == Phase.Refunding && _nextPhase == Phase.Finalized)
                // switch to migration phase only if migration manager is set
            || (currentPhase == Phase.Finalized && _nextPhase == Phase.Migrating
                && migrationManager != 0x0)
                // override switch to migrated when migration is held up
                // - should not be needed in normal use case
            || (currentPhase == Phase.Migrating && _nextPhase == Phase.Migrated);
        require(canSwitchPhase);
/*
*/
        currentPhase = _nextPhase;
        if (_nextPhase == Phase.Running && saleStart == 0) {
            saleStart = block.timestamp;
        }
        if (_nextPhase == Phase.Finalizing) {
            if (saleEnd == 0) saleEnd = block.timestamp;
            finalize();
        }
        LogPhaseSwitch(_nextPhase);
    }

    /**
     * @dev Set token migration manager contract address prior to migrating
     * @dev You can't change migration manager when migration is in progress or has completed.
     */
    function setMigrationManager(address _mgr) public onlyTokenManager {
        require((currentPhase != Phase.Migrated) && (currentPhase != Phase.Migrating));

        migrationManager = _mgr;
    }

    /** 
     * @dev Terminate token contract and refund to token manager
     */
    function destroy() public onlyTokenManager {
        require(tokenManager != 0x0);
        // Transfer Eth to token manager and terminate contract
        selfdestruct(tokenManager);
    }


    /**
     * @dev Internal functions
     */

    /**
     * @dev Internal phase change administrative functions.
     */

    /**
     * @dev called after crowdsale ends, 
     * @dev override to do finalization work
     */
    function finalize() internal {
        currentPhase = Phase.Finalized;
        LogPhaseSwitch(Phase.Finalized);
    }


    /**
     * @dev Private functions
     */

}


