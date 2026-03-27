# 🌱 HerbTrace
**A Decentralized and Transparent Supply Chain for Herbal Products**
## 📖 About The Project
HerbTrace is a full-stack Web3 application designed to bring complete transparency to the herbal medicine supply chain. By leveraging blockchain technology, we track herbs from the farmer, through laboratory testing, to the distributor and finally the consumer. This ensures authenticity, purity, and fair trade at every step.
## 🏗️ Architecture & Repository Structure
This repository is a **Monorepo** containing all three core components of the HerbTrace ecosystem. Each directory acts as a standalone service with its own specific documentation.
* 🖥️ **`/frontend`** - The React.js user interface where farmers, labs, and distributors interact with the system. ([Read Frontend Docs](./frontend/README.md))
* ⚙️ **`/backend`** - The Node.js/Java server that handles off-chain data (like IPFS image uploads via Pinata). ([Read Backend Docs](./backend/README.md))
* ⛓️ **`/blockchain`** - The Solidity smart contracts deployed on the Ethereum (Sepolia) network that permanently record supply chain events and batch purities. ([Read Blockchain Docs](./blockchain/README.md))
*(Note: Click the links above to see the specific setup instructions for each individual component.)*
## 🚀 Getting Started
To run the entire HerbTrace application locally, you will need to open three separate terminal windows to start each service.
### 1. Start the Blockchain Local Node (optional if using Testnet)
If you are developing smart contracts locally, start your Hardhat/Truffle node:
```bash
cd blockchain
npm install
npx hardhat node 
```
### 2. Start the Backend Server
```bash
cd backend
# Follow backend README to start the Java/Node server
```
### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
## 🛠️ Tech Stack
* **Frontend:** React 19, Vite 7, Tailwind CSS v4, Ethers.js v6
* **Backend:** Java, Pinata (IPFS)
* **Blockchain:** Solidity, Hardhat, Sepolia Testnet
## 👥 The Team
We built this project collaboratively!
* **Member 1 - Arya Bhagwat ([@aryabhagwat-cloud](https://github.com/aryabhagwat-cloud))** - Smart Contract/Blockchain Contributions
* **Member 2 - Atharv Bhoir ([@AtharvKB](https://github.com/AtharvKB))** - Frontend (React + Vite) — this repo
* **Member 3 - Atharva gharat ([@LittleGod2005](https://github.com/LittleGod2005))** - IPFS & Backend (Java + Pinata)

