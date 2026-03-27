// server.js
require('dotenv').config();
console.log("My Key is:", process.env.PINATA_JWT ? "LOADED OK ✅" : "NOT FOUND ❌");
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

// Import your automation script from the previous step
// (Make sure ipfsService.js is in the same folder!)
const { processHerbBatch } = require('./ipfsService');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow Frontend to talk to us
app.use(express.json()); // Allow reading JSON data

// Setup Multer (To temporarily save the image uploaded by Farmer)
const upload = multer({ dest: 'uploads/' });

// --- THE CRITICAL ROUTE ---
// This is the "Door" the frontend will knock on
app.post('/api/add-batch', upload.single('image'), async (req, res) => {
    try {
        console.log("📩 Request received from Frontend...");

        // 1. Grab the file and text data sent by Member 1
        const imagePath = req.file.path;
        const herbData = req.body; 

        console.log(`Processing batch for: ${herbData.name}`);

        // 2. CALL YOUR AUTOMATION SCRIPT
        // This runs the "processHerbBatch" function we wrote earlier
        const ipfsCid = await processHerbBatch(herbData, imagePath);

        // 3. Cleanup: Delete the temp file to save space
        fs.unlinkSync(imagePath);

        // 4. SEND RESPONSE (The Hand-off)
        // We send the CID back to the frontend so they can Mint it
        res.json({ 
            success: true, 
            message: "Uploaded to IPFS successfully!",
            cid: ipfsCid 
        });

    } catch (error) {
        console.error("❌ Error in server:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});