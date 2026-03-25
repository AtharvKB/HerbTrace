# 🌿 Decentralized Storage Service (IPFS)

This microservice handles the **off-chain storage** for the Ayurvedic Herb Traceability project. It interfaces with **Pinata (IPFS)** to ensure data immutability while keeping blockchain gas costs low.

## 🚀 Tech Stack
* **Node.js & Express:** API Server
* **Multer:** File Handling
* **Pinata SDK:** Decentralized Storage Interaction
* **Axios:** HTTP Requests

## ⚙️ Setup & Run
1.  Clone repo and install dependencies:
    ```bash
    npm install
    ```
2.  Add `.env` file with `PINATA_JWT`.
3.  Start server:
    ```bash
    node server.js
    ```

## 📡 API Endpoint
**POST** `/api/add-batch`
* **Input:** `multipart/form-data` (image file + text fields)
* **Output:** JSON with IPFS Hash (CID)
* **Success Response:**
    ```json
    {
      "success": true,
      "cid": "QmNaZnc..."
    }
    ```