
Vectavi ICO Contracts
=====================

These smart contracts are designed to handle initial distribution 
of Vectavi Market Tokens (VMT). Please check that you understand 
the major features before investing or interacting with these contracts:

  - tokens are provided at fixed price of 5000 @ 20% to 0% discount 
    ==> 6000 to 5000 VMT per 1 ETH;
  - maximum amount of tokens distributed during ICO is unlimited to 
    allow broad participation.
  - dev team is able to stop ICO at any time;
  - you cannot transfer VMT tokens during ICO sale;
  - you will be able to exchange/convert VPT tokens to Vectavi VMT 
    tokens after the Vectavi ICO
  - when ICO sale ends without meeting goal, you can claim a refund;
    - dev team must depositEther for migrated presale tokens
  - dev team is able to withdraw Ether after ICO when goal is met;
    - those funds are moved to escrow's address


Refer to [Administrator's Guide](docs/admins-guide.md)
for more details on how to interact with the contracts.


Reference Contract Sources
--------------------------
Token Manager is an implementation of the [Gnosis multisig wallet](https://github.com/gnosis/MultiSigWallet)
also see the blog [Release of new Multisig Wallet](https://blog.gnosis.pm/release-of-new-multisig-wallet-59b6811f7edc)

Token and Sale Manager contracts adapted from the [SONM project](https://github.com/sonm-io/presale-token.git)
and from the [OpenZeppelin project](https://github.com/OpenZeppelin/zeppelin-solidity)


Compile, Test, Deploy
---------------------

Requires Node.js version >= 6.5.1 and truffle@^3.1.1.
run testrpc in a terminal window as documented elsewhere 
this is to allocate ether to 10 accounts used by the tests.
See README.rpctest.md for example, used for my testing.

**Contracts**

```
$ truffle install
$ 
$ 
$ rm -v build/contracts/*.json
removed ‘build/contracts/BasicToken.json’
removed ‘build/contracts/BasicTokenMock.json’
removed ‘build/contracts/BurnableToken.json’
removed ‘build/contracts/BurnableTokenMock.json’
removed ‘build/contracts/DSNote.json’
removed ‘build/contracts/DSTest.json’
removed ‘build/contracts/DSWarp.json’
removed ‘build/contracts/ERC20Basic.json’
removed ‘build/contracts/ERC20.json’
removed ‘build/contracts/FinalizableToken.json’
removed ‘build/contracts/FinalizableTokenMock.json’
removed ‘build/contracts/ICOTokenManager.json’
removed ‘build/contracts/LimitedTransferToken.json’
removed ‘build/contracts/Math.json’
removed ‘build/contracts/Migrations.json’
removed ‘build/contracts/MintableToken.json’
removed ‘build/contracts/MintableTokenMock.json’
removed ‘build/contracts/MultiSigWallet.json’
removed ‘build/contracts/PresaleToken.json’
removed ‘build/contracts/PresaleTokenManagerMock.json’
removed ‘build/contracts/PresaleTokenMock.json’
removed ‘build/contracts/PurchasableToken.json’
removed ‘build/contracts/PurchasableTokenMock.json’
removed ‘build/contracts/ReentrancyAttack.json’
removed ‘build/contracts/ReentrancyGuard.json’
removed ‘build/contracts/ReentrancyMock.json’
removed ‘build/contracts/RefundableToken.json’
removed ‘build/contracts/RefundableTokenMock.json’
removed ‘build/contracts/RefundVault.json’
removed ‘build/contracts/RefundVaultMock.json’
removed ‘build/contracts/SafeMath.json’
removed ‘build/contracts/SafeMathMock.json’
removed ‘build/contracts/SalePrice.json’
removed ‘build/contracts/SalePriceMock.json’
removed ‘build/contracts/StandardToken.json’
removed ‘build/contracts/StandardTokenMock.json’
removed ‘build/contracts/TokenLifecycle.json’
removed ‘build/contracts/TokenLifecycleMock.json’
removed ‘build/contracts/TokenManager.json’
removed ‘build/contracts/VestedToken.json’
removed ‘build/contracts/VestedTokenMock.json’
$ 
$ 
$ 
$ #
$ # note: compiler warnings below are against some zeppelin 
$ # modules that are released using an older solc compiler 
$ # than ours they should be addressed by the zeppelin team
$ #
$ uptime; truffle compile --all; uptime
 14:33:08 up 41 days,  7:42, 17 users,  load average: 1.67, 1.53, 1.42
No secrets.json found. If you are trying to publish EPM this will fail. Otherwise, you can ignore this message!
Compiling ./contracts/BasicToken.sol...
Compiling ./contracts/BasicTokenMock.sol...
Compiling ./contracts/BurnableToken.sol...
Compiling ./contracts/BurnableTokenMock.sol...
Compiling ./contracts/DSNote.sol...
Compiling ./contracts/DSTest.sol...
Compiling ./contracts/DSWarp.sol...
Compiling ./contracts/FinalizableToken.sol...
Compiling ./contracts/FinalizableTokenMock.sol...
Compiling ./contracts/ICOTokenManager.sol...
Compiling ./contracts/LimitedTransferToken.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/MintableToken.sol...
Compiling ./contracts/MintableTokenMock.sol...
Compiling ./contracts/MultiSigWallet.sol...
Compiling ./contracts/PresaleTokenManagerMock.sol...
Compiling ./contracts/PresaleTokenMock.sol...
Compiling ./contracts/PurchasableToken.sol...
Compiling ./contracts/PurchasableTokenMock.sol...
Compiling ./contracts/ReentrancyAttack.sol...
Compiling ./contracts/ReentrancyMock.sol...
Compiling ./contracts/RefundVault.sol...
Compiling ./contracts/RefundVaultMock.sol...
Compiling ./contracts/RefundableToken.sol...
Compiling ./contracts/RefundableTokenMock.sol...
Compiling ./contracts/SafeMathMock.sol...
Compiling ./contracts/SalePrice.sol...
Compiling ./contracts/SalePriceMock.sol...
Compiling ./contracts/StandardToken.sol...
Compiling ./contracts/StandardTokenMock.sol...
Compiling ./contracts/TokenLifecycle.sol...
Compiling ./contracts/TokenLifecycleMock.sol...
Compiling ./contracts/VestedToken.sol...
Compiling ./contracts/VestedTokenMock.sol...
Compiling ./../vpt/contracts/MultiSigWallet.sol...
Compiling ./../vpt/contracts/PresaleToken.sol...
Compiling ./../vpt/contracts/TokenManager.sol...
Compiling zeppelin-solidity/contracts/ReentrancyGuard.sol...
Compiling zeppelin-solidity/contracts/math/Math.sol...
Compiling zeppelin-solidity/contracts/math/SafeMath.sol...
Compiling zeppelin-solidity/contracts/token/ERC20.sol...
Compiling zeppelin-solidity/contracts/token/ERC20Basic.sol...

Compilation warnings encountered:

zeppelin-solidity/contracts/token/ERC20Basic.sol:11:3: Warning: No visibility specified. Defaulting to "public".
  function balanceOf(address who) constant returns (uint256);
  ^---------------------------------------------------------^
,zeppelin-solidity/contracts/token/ERC20Basic.sol:12:3: Warning: No visibility specified. Defaulting to "public".
  function transfer(address to, uint256 value) returns (bool);
  ^----------------------------------------------------------^
,zeppelin-solidity/contracts/token/ERC20.sol:12:3: Warning: No visibility specified. Defaulting to "public".
  function allowance(address owner, address spender) constant returns (uint256);
  ^----------------------------------------------------------------------------^
,zeppelin-solidity/contracts/token/ERC20.sol:13:3: Warning: No visibility specified. Defaulting to "public".
  function transferFrom(address from, address to, uint256 value) returns (bool);
  ^----------------------------------------------------------------------------^
,zeppelin-solidity/contracts/token/ERC20.sol:14:3: Warning: No visibility specified. Defaulting to "public".
  function approve(address spender, uint256 value) returns (bool);
  ^--------------------------------------------------------------^
,zeppelin-solidity/contracts/math/Math.sol:9:3: Warning: Function state mutability can be restricted to pure
  function max64(uint64 a, uint64 b) internal constant returns (uint64) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/Math.sol:13:3: Warning: Function state mutability can be restricted to pure
  function min64(uint64 a, uint64 b) internal constant returns (uint64) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/Math.sol:17:3: Warning: Function state mutability can be restricted to pure
  function max256(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/Math.sol:21:3: Warning: Function state mutability can be restricted to pure
  function min256(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/SafeMath.sol:9:3: Warning: Function state mutability can be restricted to pure
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/SafeMath.sol:15:3: Warning: Function state mutability can be restricted to pure
  function div(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/SafeMath.sol:22:3: Warning: Function state mutability can be restricted to pure
  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/SafeMath.sol:27:3: Warning: Function state mutability can be restricted to pure
  function add(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.

Writing artifacts to ./build/contracts

 14:38:05 up 41 days,  7:47, 17 users,  load average: 1.42, 1.51, 1.44
$ 
$ # run testrpc in a different terminal
$ 
$ #// 
$ #// Use for testing with: truffle test
$ #// account 3 = investor1 needs more ether than the presale token limit to ensure one cannot buy past the token limit
$ #// Note: restart testrpc before each run, as a second 'truffle test' results in failures with testrpc 5.3.0
$ #// 
testrpc --account="0x75c291fb0c3f4efece1f9b56eb29e56d09646dcf3519fdcac5545d7ca1dd8c65,10000000000000000000000000000000000" --account=xe9b60ad53b8e36e6920070fa1da2db6ff54373db3b8c61917ee456f184b3a83e,2000000000000000000000000000000000" --account="0x92cdba5059083067c915c120d1599349f3c56289ac2282fff85a34a18f771145,30000000000000000000000000000000000000000000000000"  --account="0xb4902b789ae14a4a4eecc30ed11980303c50d49dbe078e4366776020d602d6f1,4000000000000000000000000000000000"  --account="0xc99897153628ad2a8710c6d4365b5b3d66501719afe10b0e463eb1eeed313c7f,5000000000000000000000000000000000" --account="0x5a36bfaaa7124a52c682daa7d476ccd16786d955ca759d0dd10e3c4e81b78f82,6000000000000000000000000000000000" --account="0xce8b13290437e4d01b723f169df495a2289087c35b58651017b2aa5e3cbdc08c,7000000000000000000000000000000000" --account="0x0e0312c10357a7a60095b22f1bf444ac04ab4fdab6cb8ffdc40fe2088638c145,8000000000000000000000000000000000" --account="0x353a365ef1b4ba78f30b6956b7e8603d70f39718adbe7cea39f4daa02bc8fc2e,9000000000000000000000000000000000" --account="0x5558b1b2b31c43a9204478025040a67116b9f0b9671a58221d8758d56a2c09e5,10000000000000000000000000000000000"
$ 
$ 
$ uptime; truffle test test/*sol && truffle test test/BasicToken.js test/BurnableToken.js test/FinalizableToken.js test/ICOTokenManager.js test/MintableToken.js test/PurchasableToken.js test/ReentrancyGuard.js test/RefundableToken.js && truffle test test/SafeMath.js test/StandardToken.js test/RefundVault.js test/TokenLifecycle.js test/VestedToken.js ; uptime
 15:03:43 up 41 days,  8:13, 17 users,  load average: 0.59, 0.78, 0.98
No secrets.json found. If you are trying to publish EPM this will fail. Otherwise, you can ignore this message!
Using network 'development'.

Compiling ./contracts/DSNote.sol...
Compiling ./contracts/DSTest.sol...
Compiling ./contracts/DSWarp.sol...
Compiling ./contracts/MultiSigWallet.sol...
Compiling ./contracts/SalePrice.sol...
Compiling ./contracts/SalePriceMock.sol...
Compiling ./contracts/TokenLifecycle.sol...
Compiling ./test/TestDSWarp.sol...
Compiling ./test/TestSalePrice.sol...
Compiling truffle/Assert.sol...
Compiling zeppelin-solidity/contracts/math/SafeMath.sol...

Compilation warnings encountered:

zeppelin-solidity/contracts/math/SafeMath.sol:9:3: Warning: Function state mutability can be restricted to pure
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/SafeMath.sol:15:3: Warning: Function state mutability can be restricted to pure
  function div(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/SafeMath.sol:22:3: Warning: Function state mutability can be restricted to pure
  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.
,zeppelin-solidity/contracts/math/SafeMath.sol:27:3: Warning: Function state mutability can be restricted to pure
  function add(uint256 a, uint256 b) internal constant returns (uint256) {
  ^
Spanning multiple lines.



  TestDSWarp
    ✓ testInit (38ms)
    ✓ testWarp (43ms)
    ✓ testWarpLock
    ✓ testFailAfterWarpLock (64ms)

  TestSalePrice
    ✓ testSaleStarted (43ms)
    ✓ testPriceAtDayOneStart
    ✓ testPriceAtDayOneEnd (39ms)
    ✓ testPriceAtDayTwoStart
    ✓ testPriceAtDayTwoEnd (67ms)
    ✓ testPriceAtDayThreeStart (51ms)
    ✓ testPriceAtDayThreeEnd
    ✓ testPriceAtDayFourStart
    ✓ testPriceAtDayFourEnd
    ✓ testPriceAtDayFiveStart (38ms)
    ✓ testPriceAtDayFiveEnd
    ✓ testPriceAtDaySixStart (40ms)
    ✓ testPriceAtDaySixEnd
    ✓ testPriceAtDaySevenStart (41ms)
    ✓ testPriceAtDaySevenEnd
    ✓ testPriceAtDayEightStart (42ms)
    ✓ testPriceAtDayEightEnd
    ✓ testPriceAtDayNineStart (44ms)
    ✓ testPriceAtDayNineEnd (53ms)
    ✓ testPriceAtDayTenStart
    ✓ testPriceAtDayTenEnd
    ✓ testSaleEnded (44ms)


  26 passing (3s)

No secrets.json found. If you are trying to publish EPM this will fail. Otherwise, you can ignore this message!
Using network 'development'.

Compiling ./contracts/MultiSigWallet.sol...


  Contract: BasicToken
    ✓ token manager should be properly set after construction (86ms)
    ✓ should return the correct totalSupply after construction (79ms)
    ✓ should return correct balances after transfer (153ms)
    ✓ should throw an error when trying to transfer more than balance (65ms)
    ✓ should throw an error when trying to transfer to 0x0 (65ms)

  Contract: BurnableToken
    ✓ burnable token should be in created phase (44ms)
    ✓ burnable token should transition to finalized phase (43ms)
    ✓ should reject migration manager address unless request is from token manager
    ✓ should accept migration manager address when request is from token manager (72ms)
    ✓ should reject transition to migrating phase unless request is from token manager (61ms)
    ✓ should transition to migrating phase when request is from token manager (93ms)
    ✓ should reject token burn unless request is from migration manager (82ms)
    ✓ migration manager should be able to burn tokens (166ms)
    ✓ cannot burn more tokens than your balance

  Contract: FinalizableToken
    ✓ finalizable token should initialize isFinalized as false 
    ✓ finalize() call should emit Finalized event
    ✓ finalize() call should transition isFinalized to true (45ms)
    ✓ cannot finalize() when isFinalized has already transitioned to true (46ms)

  Contract: ICOTokenManager
    ✓ can succesfully create PresaleTokenManager (46ms)
    ✓ can succesfully create PresaleToken (47ms)
    ✓ can succesfully create ICOTokenManager with 3 members (113ms)
    ✓ can succesfully create ICO RefundableToken (69ms)
    ✓ should be able to switch ICO token to Phase.Running (100ms)
    ✓ should be able to set ICO token migration manager (103ms)
    ✓ investor1 can buy ICO tokens
    ✓ weiRaised should be 1000000000000000000 (58ms)
    ✓ investor2 can buy ICO tokens
    ✓ weiRaised should be 24999000000000000000000 (49ms)
    ✓ investor1 can buy ICO tokens (43ms)
    ✓ should have met weiGoal: 2.5e+22 (77ms)
    ✓ weiRaised should equal weiGoal
    ✓ should be able to switch presale to Phase.Running (123ms)
    ✓ investor1 can buy presale tokens
    ✓ investor2 can buy presale tokens
    ✓ should be able to set presale token crowdsale manager (124ms)
    ✓ should be able to withdraw funds from presale token (292ms)
    ✓ should be able to switch presale to Phase.Migrating (999ms)
    ✓ migrate/convert investor1 presale tokens to ICO tokens (131ms)
    ✓ migrate/convert investor2 presale tokens to ICO tokens (114ms)
    ✓ migrate/convert investorA presale tokens to ICO tokens (132ms)
    ✓ should be able to switch ICO token to Phase.Finalizing
    ✓ should automatically switch phase after burning all presale tokens to Phase.Migrated (102ms)
    ✓ goal is met, verify additional pool allocations (55ms)
    ✓ should be able to switch ICO token to Phase.Migrating (89ms)
    ✓ should be able to burn all ICO tokens {from: c} in Phase.Migrating (210ms)
    ✓ should automatically switch phase after burning all ICO tokens to Phase.Migrated (46ms)
    ✓ should be able to destroy ICO token to Phase.Migrated (82ms)

  Contract: MintableToken
    ✓ token manager should be properly set after construction
    ✓ burnable token should be in created phase
    ✓ burnable token should transition to running phase (56ms)
    ✓ should start with a totalSupply of 1000
    ✓ should return mintingFinished false after construction
    ✓ should mint a given amount of tokens to a given address (97ms)
    ✓ should fail to mint after call to finishMinting (67ms)

  Contract: PurchasableToken
    ✓ can succesfully create PresaleTokenManager (77ms)
    ✓ can succesfully create PresaleToken (62ms)
    ✓ can succesfully create PurchasableToken (57ms)
    ✓ should start in phase Created
    ✓ should fail to buyTokens in Phase.Created
    ✓ should fail to call burnTokens in Phase.Created
    ✓ tokenManager can call withdrawEther in Phase.Created
    ✓ tokenManager can call setMigrationManager in Phase.Created (54ms)
    ✓ random guy should fail to call setMigrationManager in Phase.Created
    ✓ can succesfully create another PurchasableToken (66ms)
    ✓ should throw an error when trying to transfer in Phase.Created
    ✓ should throw an error when trying to approve transfer in Phase.Created
    ✓ should throw an error when trying to transferFrom in Phase.Created
    ✓ can't move from Created to Created (46ms)
    ✓ can't move from Created to Paused
    ✓ can't move from Created to Finalizing (38ms)
    ✓ can't move from Created to Refunding (46ms)
    ✓ can't move from Created to Finalized
    ✓ can't move from Created to Migrating (47ms)
    ✓ can't move from Created to Migrated
    ✓ can move from Created to Running (49ms)
    ✓ saleStart should be > 0 in Phase.Running
    ✓ saleStart should be >= block.timestamp in Phase.Running
    ✓ can call buyTokens in Phase.Running (285ms)
    ✓ should fail to call burnTokens in Phase.Running (331ms)
    ✓ tokenManager can call withdrawEther in Phase.Running (286ms)
    ✓ tokenManager can call setMigrationManager in Phase.Running (635ms)
    ✓ random guy should fail to call setMigrationManager in Phase.Running (44ms)
    ✓ can call buyTokens in Phase.Running again
    ✓ should throw an error when trying to transfer in Phase.Running
    ✓ should throw an error when trying to approve transfer in Phase.Running
    ✓ should throw an error when trying to transferFrom in Phase.Running
    ✓ presale token should start in phase Created
    ✓ presale token totalSupply should start at zero
    ✓ should be able to switch presale to Phase.Running (117ms)
    ✓ investor1 can buy presale token
    ✓ presale token totalSupply should reflect purchased tokens
    ✓ investor2 can buy presale token
    ✓ presale token totalSupply should match total purchases
    ✓ should be able to set crowdsale manager (105ms)
    ✓ should be able to switch presale to Phase.Migrating (102ms)
    ✓ should throw an error when non-investor tries to migrate presale tokens
    ✓ migrate investor1 presale tokens (39ms)
    ✓ verify presale token is still in phase Migrating
    ✓ migrate investor2 presale tokens (61ms)
    ✓ verify presale token is in phase Migrated (62ms)
    ✓ can't move from Running to Created (79ms)
    ✓ can't move from Running to Running (54ms)
    ✓ can't move from Running to Refunding
    ✓ can't move from Running to Finalized (48ms)
    ✓ can't move from Running to Migrating (45ms)
    ✓ can't move from Running to Migrated
    ✓ can move from Running to Paused (62ms)
    ✓ should fail to call buyTokens in Phase.Paused
    ✓ should fail to call burnTokens in Phase.Paused
    ✓ tokenManager can call withdrawEther in Phase.Paused (307ms)
    ✓ random guy should fail to call setMigrationManager in Phase.Paused (620ms)
    ✓ should throw an error when trying to transfer in Phase.Paused
    ✓ should throw an error when trying to approve transfer in Phase.Paused
    ✓ should throw an error when trying to transferFrom in Phase.Paused
    ✓ can't move from Paused to Created (45ms)
    ✓ can't move from Paused to Paused (45ms)
    ✓ can't move from Paused to Refunding (38ms)
    ✓ can't move from Paused to Finalized (59ms)
    ✓ can't move from Paused to Migrating (51ms)
    ✓ can't move from Paused to Migrated (42ms)
    ✓ can move from Paused to Running (57ms)
    ✓ can call buyTokens in Phase.Running again
    ✓ tokenManager can call setMigrationManager in Phase.Running (71ms)
    ✓ tokenManager can call setMigrationManager in Phase.Running (54ms)
    ✓ should throw an error when trying to transfer in Phase.Running again
    ✓ should throw an error when trying to approve transfer in Phase.Running again
    ✓ should throw an error when trying to transferFrom in Phase.Running again
    ✓ can't move from Running to Migrating (41ms)
    ✓ can move from Running to Finalizing (49ms)
    ✓ can succesfully create another PurchasableToken (60ms)
    ✓ can move from Created to Running (41ms)
    ✓ can move from Running to Paused (47ms)
    ✓ tokenManager can call setMigrationManager in Phase.Paused) (41ms)
    ✓ Finalizing phase should transition isFinalized to true
    ✓ can move from Paused to Finalizing (62ms)
    ✓ Finalizing phase should transition isFinalized to true
    ✓ should be in phase Finalized
    ✓ should fail to call buyTokens in Phase.Finalized (46ms)
    ✓ should fail to call burnTokens in Phase.Finalized
    ✓ tokenManager can call withdrawEther in Phase.Finalized
    ✓ tokenManager can call setMigrationManager in Phase.Finalized (44ms)
    ✓ can succesfully create another PurchasableToken (58ms)
    ✓ can move from Created to Running (43ms)
    ✓ Finalizing phase should transition isFinalized to true
    ✓ can move from Running to Finalizing (50ms)
    ✓ Finalizing phase should transition isFinalized to true
    ✓ should be in phase Finalized
    ✓ should return the correct totalSupply after construction
    ✓ should throw an error when trying to transfer more than balance in Phase.Finalized
    ✓ should return correct balances after transfer in Phase.Finalized (104ms)
    ✓ should return the correct allowance amount after approval in Phase.Finalized (53ms)
    ✓ should return correct balances after transfering from another account in Phase.Finalized (157ms)
    ✓ should return correct allowance after transfer from a spender in Phase.Finalized
    ✓ should throw an error when trying to transfer to 0x0 in Phase.Finalized
    ✓ should throw an error when trying to transferFrom to 0x0 in Phase.Finalized (68ms)
    ✓ can't move from Finalized to Created
    ✓ can't move from Finalized to Paused (38ms)
    ✓ can't move from Finalized to Running
    ✓ can't move from Finalized to Finalizing (48ms)
    ✓ can't move from Finalized to Refunding (45ms)
    ✓ can't move from Finalized to Finalized
    ✓ can't move from Finalized to Migrated (44ms)
    ✓ tokenManager can call setMigrationManager in Phase.Finalized
    ✓ can move from Finalized to Migrating (48ms)
    ✓ should fail to call buyTokens in Phase.Migrating
    ✓ should be able to successfully burnTokens in Phase.Migrating (41ms)
    ✓ tokenManager can call withdrawEther in Phase.Migrating
    ✓ should fail to call setMigrationManager in Phase.Migrating
    ✓ should throw an error when trying to transfer in Phase.Migrating
    ✓ should throw an error when trying to approve transfer in Phase.Migrating
    ✓ should throw an error when trying to transferFrom in Phase.Migrating
    ✓ can't move from Migrating to Created
    ✓ can't move from Migrating to Paused (38ms)
    ✓ can't move from Migrating to Running (43ms)
    ✓ can't move from Migrating to Finalizing
    ✓ can't move from Migrating to Refunding (41ms)
    ✓ can't move from Migrating to Finalized (42ms)
    ✓ can't move from Migrating to Migrating (61ms)
    ✓ can move from Migrating to Migrated (39ms)
    ✓ should fail to call buyTokens in Phase.Migrated
    ✓ should fail to call burnTokens in Phase.Migrated
    ✓ tokenManager can call withdrawEther in Phase.Migrated
    ✓ should fail to call setMigrationManager in Phase.Migrated
    ✓ should throw an error when trying to transfer in Phase.Migrated
    ✓ should throw an error when trying to approve transfer in Phase.Migrated
    ✓ should throw an error when trying to transferFrom in Phase.Migrated
    ✓ can't move from Migrated to Created (39ms)
    ✓ can't move from Migrated to Paused (43ms)
    ✓ can't move from Migrated to Running (39ms)
    ✓ can't move from Migrated to Finalizing (38ms)
    ✓ can't move from Migrated to Refunding (40ms)
    ✓ can't move from Migrated to Finalized
    ✓ can't move from Migrated to Migrating (50ms)
    ✓ can't move from Migrated to Migrated (46ms)
    ✓ random guy should not be able to destroy token
    ✓ tokenManager should be able to successfully destroy token

  Contract: ReentrancyGuard
    ✓ should not allow remote callback (57ms)
    ✓ should not allow local recursion
    ✓ should not allow indirect local recursion

  Contract: RefundableToken
    ✓ can succesfully create PresaleTokenManager (55ms)
    ✓ can succesfully create PresaleToken (40ms)
    ✓ can succesfully create RefundableToken (70ms)
    ✓ should start in phase Created
    ✓ should be initialized with etherGoal: 25000
    ✓ weiRaised should be zero
    ✓ should deny refunds before sale start
    ✓ should be able to depositEther 1000000000000000000 to cover presale refund (332ms)
    ✓ weiRaised should be zero
    ✓ can move from Created to Running (59ms)
    ✓ should deny refunds when sale running
    ✓ investor1 can buy ICO tokens
    ✓ weiRaised should be 1000000000000000000 (46ms)
    ✓ investor2 can buy ICO tokens (40ms)
    ✓ weiRaised should be 24999000000000000000000
    ✓ can move from Running to Paused (47ms)
    ✓ should deny refunds when sale paused
    ✓ tokenManager can call setMigrationManager in Phase.Paused) (47ms)
    ✓ should not have met weiGoal: 2.5e+22 (48ms)
    ✓ can move from Paused to Finalizing (81ms)
    ✓ finalize() call should transition isFinalized to true
    ✓ should be in phase Refunding
    ✓ vault should be in State.Refunding
    ✓ should refund investor1 saleWeiAmount: 1000000000000000000 (611ms)
    ✓ should refund investor2 saleWeiAmountLessThanGoal: 2.4998e+22 (603ms)
    ✓ should deny refund when already refunded
    ✓ can succesfully create RefundableToken again (347ms)
    ✓ should start in phase Created
    ✓ should be initialized with etherGoal: 25000
    ✓ weiRaised should be zero
    ✓ should deny refunds before sale start
    ✓ can move from Created to Running (52ms)
    ✓ should deny refunds when sale running
    ✓ investor1 can buy ICO tokens
    ✓ weiRaised should be 1000000000000000000 (40ms)
    ✓ investor2 can buy ICO tokens
    ✓ weiRaised should be 24999000000000000000000 (49ms)
    ✓ investor1 can buy ICO tokens
    ✓ can move from Running to Paused (94ms)
    ✓ should deny refunds when sale paused
    ✓ tokenManager can call setMigrationManager in Phase.Paused) (51ms)
    ✓ should have met weiGoal: 2.5e+22 (48ms)
    ✓ token contract inflow should equal weiGoal (286ms)
    ✓ token contract inflow should equal weiRaised (288ms)
    ✓ weiRaised should equal weiGoal
    ✓ weiRaised should equal escrow inflow (329ms)
    ✓ should have transitioned isFinalized to true (300ms)
    ✓ should be in phase Finalized
    ✓ vault should be in State.Closed
    ✓ should transition mintingFinished to true
    ✓ should deny refunds when goal met


  250 passing (20s)

No secrets.json found. If you are trying to publish EPM this will fail. Otherwise, you can ignore this message!
Using network 'development'.

Compiling ./contracts/MultiSigWallet.sol...


  Contract: SafeMath
    ✓ multiplies correctly (40ms)
    ✓ adds correctly (49ms)
    ✓ subtracts correctly (40ms)
    ✓ should throw an error if subtraction result would be negative
    ✓ should throw an error on addition overflow
    ✓ should throw an error on multiplication overflow

  Contract: StandardToken
    ✓ finalize() should transition token phase to Finalized (44ms)
    ✓ should return the correct totalSupply after construction
    ✓ should return the correct allowance amount after approval (64ms)
    ✓ should return correct balances after transfer (86ms)
    ✓ should throw an error when trying to transfer more than balance (41ms)
    ✓ initial spender allowance should be zero
    ✓ verify spender allowance after approval (68ms)
    ✓ should return correct balances after transfering from another account (145ms)
    ✓ should throw an error when trying to transfer more than allowed (67ms)
    ✓ should throw an error when trying to transfer to 0x0 (39ms)
    ✓ should throw an error when trying to transferFrom to 0x0 (54ms)
    ✓ should throw an error when trying to transferFrom from 0x0 (53ms)

  Contract: RefundVault
    ✓ should accept contributions
    ✓ should not refund contribution during active state
    ✓ should not refund contribution during closed state (84ms)
    ✓ should refund contribution after entering refund mode (651ms)
    ✓ should forward funds to escrow after closing (619ms)

  Contract: TokenLifecycle
    ✓ can succesfully create TokenLifecycle (69ms)
    ✓ should start in phase Created
    ✓ random guy should fail to call setPhase in Phase.Created
    ✓ can't move from Created to Created
    ✓ can't move from Created to Paused (48ms)
    ✓ can't move from Created to Finalizing
    ✓ can't move from Created to Refunding (41ms)
    ✓ can't move from Created to Finalized (40ms)
    ✓ can't move from Created to Migrating (38ms)
    ✓ can't move from Created to Migrated
    ✓ tokenManager can call setMigrationManager in Phase.Created (40ms)
    ✓ random guy should fail to call setMigrationManager in Phase.Created
    ✓ random guy should not be able to destroy token in Phase.Created
    ✓ tokenManager should be able to successfully destroy token in Phase.Created
    ✓ can succesfully create TokenLifecycle
    ✓ can move from Created to Running (39ms)
    ✓ random guy should fail to call setPhase in Phase.Running
    ✓ saleStart should be > 0 in Phase.Running
    ✓ saleStart should be >= block.timestamp in Phase.Running
    ✓ can't move from Running to Created
    ✓ can't move from Running to Running
    ✓ can't move from Running to Refunding
    ✓ can't move from Running to Finalized (46ms)
    ✓ can't move from Running to Migrating (48ms)
    ✓ can't move from Running to Migrated
    ✓ can move from Running to Paused
    ✓ can move from Paused to Running
    ✓ tokenManager can call setMigrationManager in Phase.Running (48ms)
    ✓ random guy should fail to call setMigrationManager in Phase.Running
    ✓ random guy should not be able to destroy token in Phase.Running
    ✓ tokenManager should be able to successfully destroy token in Phase.Running
    ✓ can succesfully create TokenLifecycle
    ✓ can move from Created to Running
    ✓ can move from Running to Paused (44ms)
    ✓ random guy should fail to call setPhase in Phase.Paused
    ✓ can't move from Paused to Created
    ✓ can't move from Paused to Paused (54ms)
    ✓ can't move from Paused to Refunding
    ✓ can't move from Paused to Finalized
    ✓ can't move from Paused to Migrating (38ms)
    ✓ can't move from Paused to Migrated
    ✓ can move from Paused to Running
    ✓ can move from Running to Paused
    ✓ tokenManager can call setMigrationManager in Phase.Paused) (52ms)
    ✓ random guy should fail to call setMigrationManager in Phase.Paused
    ✓ random guy should not be able to destroy token in Phase.Paused
    ✓ tokenManager should be able to successfully destroy token in Phase.Paused
    ✓ can succesfully create TokenLifecycle (39ms)
    ✓ can move from Created to Running
    ✓ can move from Running to Paused
    ✓ tokenManager can call setMigrationManager in Phase.Paused) (49ms)
    ✓ can move from Paused to Finalizing
    ✓ should be in phase Finalized
    ✓ can succesfully create TokenLifecycle (50ms)
    ✓ can move from Created to Running
    ✓ can move from Running to Finalizing (40ms)
    ✓ should be in phase Finalized
    ✓ can't move from Finalized to Created (46ms)
    ✓ can't move from Finalized to Paused (39ms)
    ✓ can't move from Finalized to Running (39ms)
    ✓ can't move from Finalized to Finalizing
    ✓ can't move from Finalized to Refunding (41ms)
    ✓ can't move from Finalized to Finalized (64ms)
    ✓ can't move from Finalized to Migrated
    ✓ random guy should fail to call setPhase in Phase.Finalized
    ✓ tokenManager can call setMigrationManager in Phase.Finalized
    ✓ random guy should fail to call setMigrationManager in Phase.Finalized
    ✓ random guy should not be able to destroy token in Phase.Finalized
    ✓ tokenManager should be able to successfully destroy token in Phase.Finalized
    ✓ can succesfully create TokenLifecycle
    ✓ can move from Created to Running
    ✓ can move from Running to Finalizing
    ✓ should be in phase Finalized
    ✓ tokenManager can call setMigrationManager in Phase.Finalized (40ms)
    ✓ can't move from Finalized to Migrating (38ms)
    ✓ tokenManager can call setMigrationManager in Phase.Finalized) (53ms)
    ✓ can move from Finalized to Migrating
    ✓ random guy should fail to call setPhase in Phase.Migrating
    ✓ can't move from Migrating to Created
    ✓ can't move from Migrating to Paused
    ✓ can't move from Migrating to Running (38ms)
    ✓ can't move from Migrating to Finalizing
    ✓ can't move from Migrating to Refunding
    ✓ can't move from Migrating to Finalized (45ms)
    ✓ can't move from Migrating to Migrating
    ✓ random guy should fail to call setMigrationManager in Phase.Migrating
    ✓ random guy should not be able to destroy token in Phase.Migrating
    ✓ tokenManager should be able to successfully destroy token in Phase.Migrating
    ✓ can succesfully create TokenLifecycle
    ✓ can move from Created to Running
    ✓ can move from Running to Finalizing (40ms)
    ✓ tokenManager can call setMigrationManager in Phase.Finalized) (69ms)
    ✓ can move from Finalized to Migrating
    ✓ can move from Migrating to Migrated (39ms)
    ✓ can succesfully create TokenLifecycle (40ms)
    ✓ can move from Created to Running
    ✓ can move from Running to Finalizing (48ms)
    ✓ tokenManager can call setMigrationManager in Phase.Finalized) (44ms)
    ✓ can move from Finalized to Migrating
    ✓ can move from Migrating to Migrated
    ✓ random guy should fail to call setPhase in Phase.Migrated
    ✓ should fail to call setMigrationManager in Phase.Migrated
    ✓ can't move from Migrated to Created
    ✓ can't move from Migrated to Paused (47ms)
    ✓ can't move from Migrated to Running (41ms)
    ✓ can't move from Migrated to Finalizing (81ms)
    ✓ can't move from Migrated to Refunding
    ✓ can't move from Migrated to Finalized (38ms)
    ✓ can't move from Migrated to Migrating (45ms)
    ✓ can't move from Migrated to Migrated (39ms)
    ✓ random guy should not be able to destroy token in Phase.Migrated
    ✓ tokenManager should be able to successfully destroy token in Phase.Migrated

  Contract: VestedToken
    ✓ granter can grant tokens without vesting (74ms)
    getting a revokable/non-burnable token grant
      ✓ tokens are received
      ✓ has 0 transferable tokens before cliff (51ms)
      ✓ all tokens are transferable after vesting (50ms)
      ✓ throws when trying to transfer non vested tokens
      ✓ throws when trying to transfer from non vested tokens (83ms)
      ✓ can be revoked by granter (108ms)
      ✓ cannot be revoked by non granter
      ✓ can be revoked by granter and non vested tokens are returned (55ms)
      ✓ can transfer all tokens after vesting ends (50ms)
      ✓ can approve and transferFrom all tokens after vesting ends (88ms)
      ✓ can handle composed vesting schedules (848ms)
    getting a non-revokable token grant
      ✓ tokens are received
      ✓ throws when granter attempts to revoke
    getting a revokable/burnable token grant
      ✓ tokens are received
      ✓ can be revoked by granter and tokens are burned (80ms)
      ✓ cannot be revoked by non granter
      ✓ can be revoked by granter and non vested tokens are returned (58ms)


  153 passing (22s)

 15:06:13 up 41 days,  8:15, 17 users,  load average: 2.30, 1.32, 1.15
$ 
$ # on debian linux
$ # stop rpctest in other terminal window
$ # run mist on rinkeby test network (or start geth)
$ mist --node-rinkeby --node-networkid 4 --node-rpc --node-rpcapi="db,eth,net,web3,personal" --node-rpccorsdomain "*"
$ # use geth to unlock coinbase account to pay for deployment gas - make sure your coinbase has ether
$ cd :~/.config/Mist/binaries/Geth/unpacked
$ ./geth --rinkeby attach "~/.ethereum/geth.ipc"
Welcome to the Geth JavaScript console!

instance: Geth/v1.7.2-stable-1db4ecdc/linux-amd64/go1.9
coinbase: 0x47cd92b0824e06accd9805bebeb89b676bedb79f
at block: 1252048 (Thu, 16 Nov 2017 07:14:18 EST)
 datadir: ~/.ethereum/rinkeby
 modules: admin:1.0 clique:1.0 debug:1.0 eth:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

> personal.unlockAccount(eth.accounts[0], "type-your-wallet-passphrase-here", 0);
true
> 
$ 
$ # back in test terminal window
$ # truffle migrate --verbose-rpc --network rinkeby
$ # or uptime; truffle migrate --network rinkeby -f 2; uptime
$ # verbose to capture transaction id and block# supplied to webui
$ truffle migrate --verbose-rpc --network rinkeby --reset
Using network 'rinkeby'.
.
.
.
# 
# grab vital data, note tx status 1 => success:
# Rinkeby: Fri 08 Dec 2017 01:29:10 PM EST 
  - ICOTokenManager: 0x6ed9ae994486192c240da724665c45be469c5eb0
    - "blockHash": "0xa6645235e24ade49bb68810e0c0e98b24be5b2686db99bd24a96146e799dc0e3",
    - "blockNumber": "0x150d78",
    - "status": "0x1",
    - "transactionHash": "0x47f423f234df2ff2cee087bc1f1076b49b50bbd8b9fb6fa17de7d9df0200ad3b",

  - RefundableToken: 0x8ade43388d04946ae635f9699f2353cf320e4ae2
    - "blockHash": "0xb90f7b6c18d415a3dcbd2b063f8f9ff24d9526d810c2007b6a26d3214d5855cb",
    - "blockNumber": "0x150d7a",
    - "status": "0x1",
    - "transactionHash": "0x7953c315cf96ee11c1c875d88a7d9dbe2f4ed2a310e410429af17c8adb340810",
# 
# you can verify deployment tx and contract here:
# https://rinkeby.etherscan.io/tx/0x47f423f234df2ff2cee087bc1f1076b49b50bbd8b9fb6fa17de7d9df0200ad3b
# https://rinkeby.etherscan.io/tx/0x7953c315cf96ee11c1c875d88a7d9dbe2f4ed2a310e410429af17c8adb340810
# 
# 
# Update this readme with the data above
# update the successor token migration script with current 
# token address (dapp/vmt/migrations/2_deploy_contracts.js)
# Update web-ui/src/constants.js (part of web-ui discussed below) with data grabbed above.
# Copy contract json files into web-ui (assuming the were changed):
$ cp -v build/contracts/RefundableToken.json web-ui/src/
‘build/contracts/RefundableToken.json’ -> ‘web-ui/src/RefundableToken.json’
$ cp -v build/contracts/ICOTokenManager.json web-ui/src/
‘build/contracts/ICOTokenManager.json’ -> ‘web-ui/src/ICOTokenManager.json’
```


**UI**

```
$ cd web-ui
$ npm install
$ npm start
```

###### not yet, maybe later
You can also deploy UI to gh-pages with `npm run deploy`.

