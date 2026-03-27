# ⛓️ HerbTrace Blockchain Service
> **Solidity smart contracts that secure the supply chain data for Ayurvedic herbs.**
---
## 📖 Overview
The HerbTrace blockchain service contains the core immutable logic of the supply chain. Because storing large files (like images or PDF certificates) directly on Ethereum is impossibly expensive, this contract stores lightweight metadata: IPFS Content Identifiers (CIDs) and verification booleans/percentages.
This repository uses Hardhat to compile, test, and deploy the `HerbChain` smart contract to the Sepolia Ethereum Testnet.
---
## 🏗️ Architecture
| Component | Technology |
| :--- | :--- |
| **Language** | Solidity (`^0.8.0`) |
| **Development Frame.**| Hardhat / Ethers.js |
| **Test Network**| Sepolia Testnet |
| **Contract Interactions**| `createBatch`, `verifyBatch`, `updateStage` |
---
## 🚀 Local Development Setup
### 1. Requirements
* Node.js
* NPM / Yarn
* A [MetaMask](https://metamask.io/) Wallet connected to Sepolia
* Testnet Sepolia ETH (from a faucet, e.g. Alchemy)
* An Infura/Alchemy API Key
### 2. Environment Variables
Create a `.env` file in the root of the blockchain folder:
```env
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
PRIVATE_KEY="your_metamask_private_key_here" # NEVER COMMIT THIS
ETHERSCAN_API_KEY="your_etherscan_key_for_verification"
```
### 3. Installation
Install the project dependencies (like Hardhat and OpenZeppelin if used):
```bash
npm install
```
### 4. Compile & Test
Compile the Solidity smart contracts to ensure there are no syntax errors:
```bash
npx hardhat compile
```
Run your local test suite (if writing unit tests):
```bash
npx hardhat test
```
### 5. Deployment
To deploy your compiled smart contract out to the Sepolia Testnet, run your deployment script:
```bash
# Example
npx hardhat run scripts/deploy.js --network sepolia
```
*Note: Once deployed, make sure to update the `contract.js` file in the `/frontend` repository so the React app points to your new contract address!*
---
## 🔗 Deployed Contracts
| Name | Address |
| :--- | :--- |
| **HerbChainMain** | `0x437B1696B0E67a1430f5486583971D4520af93e1` |
*(Always update this address when you push a new contract update.)*
