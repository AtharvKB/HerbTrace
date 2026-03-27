⚙️ HerbTrace Backend Service
Java & IPFS (Pinata) integration handling the off-chain storage layer for the HerbTrace platform.

📖 Overview
This is the backend service for HerbTrace built with Java. It is primarily responsible for securely handling and uploading sensitive image files (like Farmer's herb batch images) to IPFS via the Pinata API. Once the files are successfully uploaded and pinned to IPFS, this backend returns the decentralized Content Identifier (CID).

This CID is then sent back to the frontend, which permanently writes it to the Ethereum Sepolia Blockchain, ensuring that heavy media files do not bloat the smart contracts.

🏗️ Architecture
Component	Technology
Language Framework	Java
Decentralized Storage	IPFS
IPFS Gateway/Provider	Pinata
Network Tunneling	ngrok (for local frontend integration)
🚀 Local Development Setup
1. Requirements
Java JDK (version 11 or higher)
Maven / Gradle (depending on the build tool used)
A Pinata account for IPFS API Keys
2. Environment Variables
Create the necessary configuration file (e.g. application.properties or .env equivalent) to safely store your Pinata credentials:

properties
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_API_KEY=your_secret_key_here
PINATA_JWT=your_jwt_here
3. Running the Server
Compile and run the Java backend:

bash
# Example command (adjust based on your build system)
./mvnw spring-boot:run
4. Exposing to the Frontend
Because the frontend connects to this backend locally, you may need to run ngrok so the React application can make HTTP requests to it without CORS/localhost issues.

bash
ngrok http 8080
Note: Make sure to update the Farmer.jsx file in the frontend repository with your newly generated ngrok URL.

🔗 Endpoints
HTTP Method	Endpoint	Description
POST	/api/upload/image	Accepts a multipart image file, uploads it to Pinata, and returns the IPFS CID string.
(Please keep endpoints documented here as the API grows.)
