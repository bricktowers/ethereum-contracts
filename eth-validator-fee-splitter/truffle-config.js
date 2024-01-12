require('dotenv').config();
const {MNEMONIC, PROJECT_ID, ETHERSCAN_API_TOKEN} = process.env;

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        goerli: {
            provider: () => new HDWalletProvider(MNEMONIC, `https://goerli.infura.io/v3/${PROJECT_ID}`),
            network_id: 5,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: false
        },
        mainnet: {
            provider: () => new HDWalletProvider(MNEMONIC, `https://mainnet.infura.io/v3/${PROJECT_ID}`),
            network_id: 1,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: false
        },
        holesky: {
            provider: () => new HDWalletProvider(MNEMONIC, `https://ethereum-holesky.publicnode.com`),
            network_id: 17000,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: false
        },
    },
    compilers: {
        solc: {
            version: "0.8.21",
        }
    },
    plugins: ['truffle-plugin-verify'],
    api_keys: {
        etherscan: ETHERSCAN_API_TOKEN,
    },
};
