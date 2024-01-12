# eth-validator-fee-splitter

Two Ethereum smart contracts, `ValidatorFeeSplitter` and `ValidatorFeeSplitterVAT` for managing and distributing
Ethereum network execution layer fees to multiple recipients, including Maximal Extractable Value (MEV) revenues.

## Contracts

### ValidatorFeeSplitter

`ValidatorFeeSplitter` facilitates the distribution of Ethereum transaction fees between predetermined entities.

#### Features

- **Immutable Addresses**: The contract establishes two immutable payable addresses: `withdrawalAddress` and `operatorAddress`.

- **Fee Distribution**: Automates the distribution of the contract's balance:
    - 30% to `operatorAddress`.
    - 70% to `withdrawalAddress`.

- **Balance Distribution Trigger**: `distributeBalance` function is invoked automatically upon receiving funds, 
pertinent for MEV-related fees. For non-MEV scenarios, a manual invocation is required.

### ValidatorFeeSplitterVAT

An extension of `ValidatorFeeSplitter`, incorporating VAT distribution.

#### Additional Feature

- **VAT Allocation**: Includes a third address, `vatAddress`. Allocates 8.1% of the operator's share to this address. 
This is to enable the automated payment of VAT by Brick Tower clients in Switzerland for the staking fees being charged.

## Special Note on MEV

- **MEV and Automatic Distribution**: When fees are generated with MEV, the contract is designed to automatically call 
the `distributeBalance` function, ensuring immediate distribution of these revenues.
- **Non-MEV Cases**: In scenarios where a block is produced without MEV, the balance will accumulate within the contract. 
Manual intervention is required to call `distributeBalance` for distributing these accumulated fees. 
Alternatively, the Staking operator can wait until the next block with MEV relay is produced which then triggers 
the automatic distribution.


## How to deploy?

* define environment parameters for the deployment in .env file
* Holesky
```sh
$ truffle migrate --network holesky
```
* Mainnet
```sh
$ truffle migrate --network mainnet
```

## How to submit to Etherscan.io verification?

- holesky
```sh
$ truffle run verify ValidatorFeeSplitterVAT.sol --network holesky
$ truffle run verify ValidatorFeeSplitter.sol --network holesky
```
