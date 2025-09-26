require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    flowTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      chainId: 545,
      accounts: [
        "608af6459d5079104a4b60d3b3dfd43530b2ae97c86165f5de810b46f11f2933",
      ], // Replace with your private key securely
    },
  },
};
