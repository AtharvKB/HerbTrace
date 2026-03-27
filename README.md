<div align="center">
  <h1 align="center">🌱 HerbTrace</h1>
  <p align="center">
    <strong>A Decentralized and Transparent Supply Chain for Herbal Products</strong>
  </p>
</div>
## 📖 About The Project
HerbTrace is a full-stack Web3 application designed to bring complete transparency to the herbal medicine supply chain. By leveraging blockchain technology, we track herbs from the farmer, through laboratory testing, to the distributor and finally the consumer. This ensures authenticity, purity, and fair trade at every step.
## 🏗️ Architecture & Repository Structure
This repository is a **Monorepo** containing all three core components of the HerbTrace ecosystem. Each directory acts as a standalone service with its own specific documentation.
* 🖥️ **`/frontend`** - The React.js user interface where farmers, labs, and distributors interact with the system. ([Read Frontend Docs](./frontend/README.md))
* ⚙️ **`/backend`** - The Node.js/Express server that handles off-chain data (like user profiles, IPFS image uploads via Pinata, and relational data). ([Read Backend Docs](./backend/README.md))
* ⛓️ **`/blockchain`** - The Solidity smart contracts deployed on the Ethereum (Sepolia) network that permanently record supply chain events and batch purities. ([Read Blockchain Docs](./blockchain/README.md))
*(Note: Click the links above to see the specific setup instructions for each individual component.)*
## 🚀 Getting Started
To run the entire HerbTrace application locally, you will need to open three separate terminal windows to start each service.
### 1. Start the Blockchain Local Node (optional if using Testnet)
If you are developing smart contracts locally, start your Hardhat/Truffle node:
```bash
cd blockchain
npm install
# Example command to run local node
npx hardhat node 
```
### 2. Start the Backend Server
```bash
cd backend
npm install
npm run dev
# Server generally starts on http://localhost:5000 (check console)
```
### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev # or npm start
# App generally starts on http://localhost:5173 or 3000
```
## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, TailwindCSS (or Vanilla CSS), Ethers.js / Web3.js
* **Backend:** Node.js, Express, MongoDB (or PostgreSQL), Pinata (IPFS)
* **Blockchain:** Solidity, Hardhat/Foundry, Ethereum Testnet (Sepolia)
## 👥 The Team
We built this project collaboratively!
* **[Your Name]** - Frontend Developer & Integrator ([@AtharvKB](https://github.com/AtharvKB))
* **[Backend Dev Name]** - Backend Developer ([@LittleGod2005](https://github.com/LittleGod2005))
* **[Blockchain Dev Name]** - Smart Contract Developer ([@aryabhagwat-cloud](https://github.com/aryabhagwat-cloud))
---
*Built for trust, transparency, and the future of herbal medicine.*
