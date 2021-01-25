require("dotenv").config(); const HDWalletProvider = require("@truffle/hdwallet-provider");
module.exports = {
  networks: {
    red1: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: "<mnemonic>",
          },
          providerOrUrl:
            "http://localhost:8545",
        }),
      network_id: "*",
      gas: 0x47b759,
      gasPrice: 0,
    },
  },
};
