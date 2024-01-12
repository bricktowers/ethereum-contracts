const {WITHDRAWAL_ADDRESS, VAT_ADDRESS, OPERATOR_ADDRESS, CONTRACT} = process.env;

function deployContract(deployer) {
    if (CONTRACT === 'ValidatorFeeSplitter') {
        const validatorFeeSplitter = artifacts.require("ValidatorFeeSplitter.sol");
        deployer.deploy(validatorFeeSplitter, WITHDRAWAL_ADDRESS, OPERATOR_ADDRESS);
    } else if (CONTRACT === 'ValidatorFeeSplitterVAT') {
        const validatorFeeSplitterVAT = artifacts.require("ValidatorFeeSplitterVAT.sol");
        deployer.deploy(validatorFeeSplitterVAT, WITHDRAWAL_ADDRESS, OPERATOR_ADDRESS, VAT_ADDRESS);
    } else throw new Error("Unknown contract: '" + CONTRACT + "'");
}

module.exports = function (deployer, network) {
    if (network === 'goerli' || network === 'goerli-fork') {
        deployContract(deployer);
    } else if (network === 'holesky' || network === 'holesky-fork') {
        deployContract(deployer);
    } else if (network === 'mainnet' || network === 'mainnet-fork') {
        deployContract(deployer);
    } else if (network === 'test') {
        // no deployment is required
    } else {
        throw new Error("Unsupported network: '" + network + "'");
    }
};