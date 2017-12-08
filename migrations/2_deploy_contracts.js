const TokenManager = artifacts.require("./ICOTokenManager.sol");
const Token = artifacts.require("./RefundableToken.sol");
/*
const Crowdsale = artifacts.require("./VectaviICO.sol");
*/

module.exports = (deployer, network) => {

  let team, presaleTokenAddress, escrow;

  if (network === "development") {
    team =
      [ //  "0x0cd146b091085eb0292404f131e5f1f91c2c47f6" // accounts[0]
      /*,*/ "0x9521d13ebb19a8fe3e1bf927dcf4800b4acb30f2" // accounts[1]
      , "0x78ce609b2267796f05ac3ee94909c2afd65439ad" // accounts[2]
      , "0xbf9b7155320c6e6316409fd579d345d2338b5837" // accounts[3]
//    , "0xc8c0999d9ddff905ee3f492c6ec37a7c93024637" // accounts[4]
//    , "0x57eb7d444998d47e32e9b7af50ad175384b4591e" // accounts[5]
//    , "0x9a08a9f92411814359b0d852540964f551fc761b" // accounts[6]
//    , "0xdfb21549305e73591eefec352057b3a31eed3187" // accounts[7]
//    , "0xd05df44e90c3b6becec9fae66a36d4bad8a4c427" // accounts[8]
//    , "0x51e5d3b312300fdb8d165702562d6a5f068de487" // accounts[9]

      ];


    // send some ether to the team
    team.forEach(addr => web3.eth.sendTransaction({
      from: web3.eth.accounts[9],
      to: addr,
      //value: web3.toWei(20, 'ether')
      value: web3.toWei(2, 'ether')
    }));
    presaleTokenAddress = "0x9a8e3fb88e19d563fd1176645d1f34641b8a166f";
    escrow = "0x7db5cc0fc2d3352615ffbf51653100132fd4b4d7"; // TestRPC/v1.1.2/ethereum-js net 1504209198017 accounts[0]

  }
  else if (network === "rinkeby") {
    team =
      [ "0x47cD92b0824E06ACCd9805bebEB89b676beDB79F" // primary, Main account (Etherbase, owner 1)
      , "0x6b385cE594d12d4C4EfD5e19FF34c8eabb78d531" // secondary, Account 2 (owner 2)
      , "0xAfc411ab664F9c38044510D9fd40F62E79460594" // secondary, Account 3 (owner 3)
      ];
    presaleTokenAddress = "0x6500478ce87b1fd9e2cd8501e3b01bfd25a5d6d3";
    escrow = "0x6C2266C3B89e0e07bD1d7e02f18AD581Bf2b933F"; // rinkeby (Account 4, escrow)

  }
  else if (network === "mainnet") {
    team =
      [ 
      
      ];
  }
  const requiredConfirmations = 2;
  const rate = 5000;
  const goal = 7500000 / 300; // goal in ether (assume USD$300/Ether)

  deployer.deploy(TokenManager, team, requiredConfirmations)
    .then(TokenManager.deployed)
    .then(tokenMgr => deployer.deploy(Token, presaleTokenAddress, tokenMgr.address, escrow, rate, goal));

};

