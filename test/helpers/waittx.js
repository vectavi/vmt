
/**
 * 
 * reference: https://github.com/ethereum/web3.js/issues/393
 * 
 * @dev waitTx(uint256 txHash, function(result) callback
 * @dev wait for transaction completion
 * @param txHash hash of transaction of interest
 * @param callback(result) callback function to call
 * @return result true ==> tx complete, false ==> wait expired
 * 
 */
module.exports = function(txHash, callback) {
  /*
  * Watch for a particular transaction hash and call the awaiting function when done;
  * Ether-pudding uses another method, with web3.eth.getTransaction(...) and checking the txHash;
  * on https://github.com/ConsenSys/ether-pudding/blob/master/index.js
  */
  var blockCounter = 3;
  // Wait for tx to be finished
  var filter = web3.eth.filter('latest').watch(function(err, blockHash) {
    if (blockCounter<=0) {
      filter.stopWatching();
      filter = null;
      console.warn('!! Tx expired !!');
      if (callback)
        return callback(false);
      else
        return false;
    }
    // TODO: this is syncronous, use web3js 1.0 when released
    // TODO: http://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
    // Get info about latest Ethereum block
    var block = web3.eth.getBlock(blockHash);
    --blockCounter;
    // Found tx hash?
    if (block.transactions.indexOf(txHash) > -1) {
      // Tx is finished
      filter.stopWatching();
      filter = null;
      if (callback)
        return callback(true);
      else
        return true;
    // Tx hash not found yet?
    } else {
      console.log('Waiting tx..', blockCounter);
    }
  });
};


