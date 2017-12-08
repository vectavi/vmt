pragma solidity ^0.4.15;

//import "multisig-wallet/MultiSigWallet.sol";
import "./MultiSigWallet.sol";
import './TokenLifecycle.sol';
import './BasicToken.sol';
import './StandardToken.sol';
import './MintableToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


/**
 * @title TokenManager
 * @author Tavit Ohanian
 * @notice Token sale manager contract. 
 * @notice Adapted from zeppelin Crowdsale and SONM Token manager contracts. 
 * @dev Extends a Gnosis MultiSigWallet with proxy functions to control token sale.
 * 
 */
contract TokenManager is MultiSigWallet {

    using SafeMath for uint256;

    /**
     * @dev State definitions
     */


    /**
     * @dev Event definitions
     */
    event LogTokenWithdrawEther(uint txId);
    event LogTokenSetPhase(TokenLifecycle.Phase indexed _phase, uint _txId);
    event LogTokenSetMigrationManager(address indexed _address, uint _txId);
    event LogTokenGrantVestedTokens(
            address indexed _to,
            uint256 _value,
            uint64 _start,
            uint64 _cliff,
            uint64 _vesting,
            bool _revokable,
            bool _burnsOnRevoke,
            uint txId
          );
    event LogTokenRevokeTokenGrant(address indexed _holder, uint256 _grantId, uint txId);
    event LogTokenDestroy(uint txId);


    /**
     * @dev Constructor
     */

    /**
     * @notice TokenManager(address[] _owners, uint _required)
     * @param _owners Array of token manager owner addresses.
     * @param _required Number of confirmation required for administration function.
     */
    function TokenManager(address[] _owners, uint _required) public 
        MultiSigWallet(_owners, _required)
    { }


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
     * @dev Public withdraw administrative functions
     */
    function tokenWithdrawEther(address _token) public
        ownerExists(msg.sender)
    {
        // bytes4(sha3('withdrawEther()'))
        // in truffle console:
        //   web3.sha3('withdrawEther()').substring(0, 10);
        bytes memory data = hex"7362377b";
        uint txId = super.submitTransaction(_token, 0, data);
        LogTokenWithdrawEther(txId);
    }

    /**
     * @dev Public phase change administrative functions
     */
    function tokenSetPhase(
        address _token,
        TokenLifecycle.Phase _nextPhase
    ) public
        ownerExists(msg.sender)
    {
        // bytes4(sha3('setPhase(uint8)'))
        // in truffle console:
        //   web3.sha3('setPhase(uint8)').substring(0, 10);
        bytes memory data =
          hex"c03afb590000000000000000000000000000000000000000000000000000000000000000";
        data[35] = bytes1(uint8(_nextPhase));
        uint txId = super.submitTransaction(_token, 0, data);
        LogTokenSetPhase(_nextPhase, txId);
    }

    /**
     * @dev Public set migration manager administrative functions
     */
    function tokenSetMigrationManager(address _token, address _mgr) public
        ownerExists(msg.sender)
    {
        // bytes4(sha3('setMigrationManager(address)'))
        // in truffle console:
        //   web3.sha3('setMigrationManager(address)').substring(0, 10);
        bytes memory data =
          hex"025cf89f0000000000000000000000000000000000000000000000000000000000000000";

        // 36 = 4 bytes of signature hash + 32 bytes of array length
        assembly { mstore(add(data, 36), _mgr) }

        uint txId = super.submitTransaction(_token, 0, data);
        LogTokenSetMigrationManager(_mgr, txId);
    }
    
    /**
     * @dev Public grant tokens administrative function
     */
    function tokenGrantVestedTokens(
      address _token,
      address _to,
      uint256 _value,
      uint64 _start,
      uint64 _cliff,
      uint64 _vesting,
      bool _revokable,
      bool _burnsOnRevoke
    ) public 
        ownerExists(msg.sender)
    {
        // bytes4(sha3('grantVestedTokens(address,uint256,uint64,uint64,uint64,bool,bool)'))
        // in truffle console:
        //   web3.sha3('grantVestedTokens(address,uint256,uint64,uint64,uint64,bool,bool)').substring(0, 10);
        bytes memory data =
          hex"9754a4d90000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

        // 36 = 4 bytes of signature hash + 32 bytes of array length
        assembly { mstore(add(data, 36), _to) }
        // 68 = 36 as above + 32 bytes of address length
        assembly { mstore(add(data, 68), _value) }
        // 100 = 68 as above + 32 bytes of uint256 length
        assembly { mstore(add(data, 100), _start) }
        // 132 = 100 as above + 32 bytes of uint64 length
        assembly { mstore(add(data, 132), _cliff) }
        // 164 = 132 as above + 32 bytes of uint64 length
        assembly { mstore(add(data, 164), _vesting) }
        // 196 = 164 as above + 32 bytes of uint64 length
        assembly { mstore(add(data, 196), _revokable) }
        // 228 = 196 as above + 32 bytes of bool length
        assembly { mstore(add(data, 228), _burnsOnRevoke) }

        uint txId = super.submitTransaction(_token, 0, data);
        LogTokenGrantVestedTokens(_to, _value, _start, _cliff, _vesting, _revokable, _burnsOnRevoke, txId);
    }

    /**
     * @dev Public revoke granted tokens administrative function
     */
    function tokenRevokeTokenGrant(address _token, address _holder, uint256 _grantId) public 
        ownerExists(msg.sender)
    {
        // bytes4(sha3('tokenRevokeTokenGrant(address,uint256)'));
        // in truffle console:
        //   web3.sha3('tokenRevokeTokenGrant(address,uint256)').substring(0, 10);
        bytes memory data =
          hex"cda41ed700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

        // 36 = 4 bytes of signature hash + 32 bytes of array length
        assembly { mstore(add(data, 36), _holder) }
        // 68 = 36 as above + 32 bytes of address length
        assembly { mstore(add(data, 68), _grantId) }

        uint txId = super.submitTransaction(_token, 0, data);
        LogTokenRevokeTokenGrant(_holder, _grantId, txId);
    }

    /** 
     * @dev Public terminate token contract and refund to token manager
     */
    function tokenDestroy(address _token) public 
        ownerExists(msg.sender)
    {
        // bytes4(sha3('destroy()'))
        // in truffle console:
        //   web3.sha3('destroy()').substring(0, 10);
        bytes memory data = hex"83197ef0";
        uint txId = super.submitTransaction(_token, 0, data);
        LogTokenDestroy(txId);
    }


    /**
     * @dev Internal functions
     */


    /**
     * @dev Private functions
     */

}

