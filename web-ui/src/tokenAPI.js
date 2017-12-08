
import Truffle              from 'truffle-contract';
//import RefundableToken_json    from '../../build/contracts/RefundableToken';
//import ICOTokenManager_json    from '../../build/contracts/ICOTokenManager';
import RefundableToken_json    from './RefundableToken';
import ICOTokenManager_json    from './ICOTokenManager';
import Const                from './constants';

import Phase from './phase';
import Web3 from 'web3';
import PROVIDER_URL         from './provider';

const RefundableToken = Truffle(RefundableToken_json);
const ICOTokenManager = Truffle(ICOTokenManager_json);

if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  var web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
}
const _isReadOnly = !(PROVIDER_URL && /localhost/gi.test(PROVIDER_URL));


if(web3) {
  RefundableToken.setProvider(web3.currentProvider);
  ICOTokenManager.setProvider(web3.currentProvider);
}

const fromWei = x => {
  const y = web3.fromWei(x, 'ether');
  if(y.toNumber) return y.toNumber();
  else return y;
}

const PhaseStr = {};
Object.keys(Phase).forEach(k => PhaseStr[Phase[k]] = k);

let net;


// TODO:
//  - check if networkId changed

const API = {
  getBalance: address => new Promise((resolve, reject) =>
    web3.eth.getBalance(
      address,
      (err, res) => err
        ? reject({message: err, arg: address})
        : resolve(fromWei(res)))
  ),


  checkNetwork: () => new Promise((resolve, reject) =>
    web3.version.getNetwork((err,res) => {
      if(err)
        return reject({UNKNOWN_ERROR: true, more: err});
      net = res in Const ? res : "*";
      resolve({
        tokenAddress: Const[net].TOKEN_ADDRESS,
        networkName: Const[net].NETWORK_NAME
      });
    })
  ),


  getTokenInfo: tokenAddress => new Promise((resolve, reject) => {
    try {
      resolve(RefundableToken.at(tokenAddress));
    } catch(err) {
      reject({INVALID_TOKEN_ADDRESS: true});
    }
  })
    .then(token =>
      token.name.call()
        .then(name => name === Const[net].EXPECTED_TOKEN_NAME
            ? Promise.resolve(name)
            : Promise.reject({INVALID_TOKEN_NAME: true, arg: name}))
        .then(name => Promise.all(
          [ Promise.resolve(name)
          , token.PRICE.call()
          , API.getBalance(token.address)
          , token.symbol.call()
          , token.totalSupply.call()
          , token.currentPhase.call()
          , token.tokenManager.call()
          , token.migrationManager.call()
          ]))
        .then(([name, price, balance, symbol, supply, phase, mgr1, mgr2]) =>
          Promise.resolve({
            name, price, balance, symbol,
            supply: fromWei(supply),
            currentPhase: phase.toNumber(),
            tokenManager: {address: mgr1},
            migrationManager: {address: mgr2},
            address: tokenAddress,
          }))
        .then(info => ICOTokenManager.at(info.tokenManager.address)
          .then(mgr => Promise.all(
            [ API.getBalance(mgr.address)
            , mgr.getOwners.call()
            , API.getManagerActions(mgr)
            ])
          .then(([balance, managers, pendingActions]) => {
            Object.assign(info.tokenManager, {balance, managers, pendingActions});
            return Promise.resolve(info);
          })))
      ),

  getTokenEvents: address => new Promise((resolve, reject) => {
    if (_isReadOnly) return resolve([]);
    const t = ICOTokenManager.at(address);
    const filter = t.allEvents({
      fromBlock: Const[net].DEPLOYMENT_BLOCK_NUMBER,
      toBlock: "latest"});
    filter.get((err, res) => err ? reject(err) : resolve(res));
  }),


  getManagerActions: m => new Promise((resolve, reject) => {
    if (_isReadOnly) return resolve([]);
    const filter = m.allEvents({
      fromBlock: Const[net].DEPLOYMENT_BLOCK_NUMBER,
      toBlock: "latest"
    });

    filter.get((err, events) => {
      if(err) return reject(err);
      const txMap = {};
      events.forEach(e => {
        const txId = e.args._txId === undefined ? e.args.transactionId : e.args._txId;
        txMap[txId] || (txMap[txId] = {txId, confirmations: []});

        switch(e.event) {
          case "LogTokenSetPhase": {
            txMap[txId].action = "setPhase";
            txMap[txId].newPhase = e.args._phase;
            txMap[txId].name = `Switch to phase: ${PhaseStr[e.args._phase]}`;
            break;
          }
          case "LogTokenWithdrawEther": {
            txMap[txId].action = "withdrawEther";
            txMap[txId].name = "Withdraw Ether to multisig";
            break;
          }
          case "LogTokenSetMigrationManager": {
            txMap[txId].action = "setMigrationManager";
            txMap[txId].migrationManager = e.args._address;
            txMap[txId].name = `Set migration manager address to ${e.args._address}`;
            break;
          }
          case "Confirmation": {
            txMap[txId].confirmations.push(e.args.sender);
            break;
          }
          case "Execution": {
            txMap[txId].executed = true;
            break;
          }
          case "ExecutionFailure": {
            txMap[txId].failed = true;
            break;
          }
          default: break;
        }
      });

      resolve(Object.values(txMap).filter(tx => !tx.executed && !tx.failed));
    })
  }),

  buyTokens: (tokenAddress, value) => new Promise((resolve, reject) => {
    web3.eth.sendTransaction(
      { to: tokenAddress,
        value: web3.toWei(value, "ether"),
        gas: 500000,
      },
      (err, res) => err ? reject(err) : resolve({tx: res})
    )
  }),

  claimRefund: (tokenAddress, address) => {
    const token = RefundableToken.at(tokenAddress);
    return token.claimRefund(
      {gas: 500000, from: address}
    );
  },

  migrateToken: (tokenAddress, address) => {
    const token = RefundableToken.at(tokenAddress);
    return token.migrateToken(address,
      {gas: 500000}
    );
  },

  setPhase: (tokenAddr, phase, mgrAddr) => {
    const m = ICOTokenManager.at(mgrAddr);
    return m.tokenSetPhase(
      tokenAddr, phase,
      {gas: 500000, from: web3.eth.accounts[0]}
    );
  },

  withdrawEther: (tokenAddr, mgrAddr) => {
    const m = ICOTokenManager.at(mgrAddr);
    return m.tokenWithdrawEther(
      tokenAddr,
      {gas: 500000, from: web3.eth.accounts[0]}
    );
  },

  confirmTransaction: (txId, mgrAddr) => {
    const m = ICOTokenManager.at(mgrAddr);
    return m.confirmTransaction(
      txId,
      {gas: 500000, from: web3.eth.accounts[0]}
    );
  },

  setMigrationManager: (tokenAddr, address, mgrAddr) => {
    const m = ICOTokenManager.at(mgrAddr);
    return m.tokenSetMigrationManager(
      tokenAddr, address,
      {gas: 500000, from: web3.eth.accounts[0]}
    );
  },


};

export default API;
