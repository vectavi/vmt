
// For working with INFURA
const HDWalletProvider = require("truffle-hdwallet-provider")
const fs = require("fs")

// First read in the secrets.json to get our mnemonic
let secrets
let mnemonic
if(fs.existsSync("secrets.json")) {
  secrets = JSON.parse(fs.readFileSync("secrets.json", "utf8"))
  mnemonic = secrets.mnemonic
} else {
  console.log("No secrets.json found. If you are trying to publish EPM " +
              "this will fail. Otherwise, you can ignore this message!")
  mnemonic = ""
}



module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id

    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      from: "0x47cD92b0824E06ACCd9805bebEB89b676beDB79F" // primary, Main account (Etherbase, owner 1)
    },
    mainnet: {
      host: "localhost",
      port: 8545,
      network_id: 1
    }
  }
};
