

Required Functionality
----------------------

  - sale token contract must conform to ERC20 spec.
  - Investors are able to exchange Ether for sale tokens at fixed rate with 
    discount schedule encouraging earlier investment.
  - Investors are able to migrate/convert their previous sale tokens to 
    current sale tokens after dev team provides new contract address.
  - Investors are not able to buy tokens when total amount of sold tokens has
    reached its limit, or sale is in finalizing, refunding, finalized, migrating, 
    or migrated.
  - Investors can transfer their sale tokens only when phase is finalized.
  - sale manager contract is administered by joint decisions of dev team 
    (members of the multisig contract).
  - Dev team is able to withdraw all Ether from the token contract to the
    multisig contract.
  - Dev team is able to pause/resume token sale at any time:
    - any non-administrative action (buy, finalize, migrate) is rejected 
      if contract is paused.
  - Dev team is able to start previous sale token conversion by providing 
    current token contract address.
  - Dev team is able to destroy sale token contract only if all tokens are
    migrated/converted.


Deliverables
------------

  - Modified multisig contract.
  - sale token contract.
  - sale token manager contract.
  - Test suite for all contracts.
  - Deployment scripts.
  - User's guide for investors and admins.
  - Example of using sale contract from web page.



