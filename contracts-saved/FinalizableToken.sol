pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TokenLifecycle.sol';
import './BurnableToken.sol';
import './VestedToken.sol';


/**
 * @title A Finalizable Token
 * @author Tavit Ohanian
 * @dev Adapted from the OpenZeppelin library (FinalizableCrowdsale).
 * @dev Extension of MintableToken where an owner can do extra work
 * @dev after finishing. By default, it will end token minting.
 */
contract FinalizableToken is BurnableToken, VestedToken {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */

    bool public isFinalized;


    /**
     * @dev Event definitions
     */

    /**
     * @dev This event indicates the token is finalized
     */ 
    event Finalized();


    /**
     * @dev Constructor
     */
    function FinalizableToken() public {
        isFinalized = false;
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
     * @dev Internal functions
     */

    /**
     * @dev should be called after crowdsale ends, 
     * @dev to do some extra finalization work
     */
    function finalize() internal {

      require(!isFinalized);
      // finalize called only when sale hasEnded
      //require(hasEnded());

      finalization();
      Finalized();

      isFinalized = true;

    }

    /**
     * @dev end token minting on finalization
     * @dev override this with custom logic if needed
     */
    function finalization() internal {
      finishMinting();
    }


    /**
     * @dev Private functions
     */

}

