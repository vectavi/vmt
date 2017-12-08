//
// - Rinkeby: Fri 08 Dec 2017 01:29:10 PM EST
//   - ICOTokenManager: 0x6ed9ae994486192c240da724665c45be469c5eb0
//     - "blockHash": "0xa6645235e24ade49bb68810e0c0e98b24be5b2686db99bd24a96146e799dc0e3",
//     - "blockNumber": "0x150d78",
//     - "status": "0x1",
//     - "transactionHash": "0x47f423f234df2ff2cee087bc1f1076b49b50bbd8b9fb6fa17de7d9df0200ad3b",
//
//   - RefundableToken: 0x8ade43388d04946ae635f9699f2353cf320e4ae2
//     - "blockHash": "0xb90f7b6c18d415a3dcbd2b063f8f9ff24d9526d810c2007b6a26d3214d5855cb",
//     - "blockNumber": "0x150d7a",
//     - "status": "0x1",
//     - "transactionHash": "0x7953c315cf96ee11c1c875d88a7d9dbe2f4ed2a310e410429af17c8adb340810",
//

export default {
  "*": {
    NETWORK_NAME: "testrpc",
    TOKEN_ADDRESS: "",
    // check if this is our token
    EXPECTED_TOKEN_NAME: "Vectavi Market Token",
    // Block number when token was deployed (this is used to filter events).
    DEPLOYMENT_BLOCK_NUMBER: 1
  },

  1: {
    NETWORK_NAME: "Main",
    TOKEN_ADDRESS: "",
    EXPECTED_TOKEN_NAME: "Vectavi Market Token",
    DEPLOYMENT_BLOCK_NUMBER: 1
  },

  4: {
    NETWORK_NAME: "Rinkeby",
    TOKEN_ADDRESS: "0x8ade43388d04946ae635f9699f2353cf320e4ae2",
    EXPECTED_TOKEN_NAME: "Vectavi Market Token",
    DEPLOYMENT_BLOCK_NUMBER: 1253202 // "0x150d78"
  },
}
