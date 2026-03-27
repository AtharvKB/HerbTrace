const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config(); // Load keys immediately

// Get the key from the environment
const PINATA_JWT = process.env.PINATA_JWT;

const uploadFileToIPFS = async (fileStream, fileName) => {
    const formData = new FormData();
    formData.append('file', fileStream, fileName);
    
    // Pinata expects specific metadata format
    const metadata = JSON.stringify({
        name: fileName
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        console.log("📤 Uploading image to Pinata...");
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
                ...formData.getHeaders() // Crucial for sending files
            },
            maxBodyLength: Infinity // Prevents errors with large files
        });
        console.log("✅ Image Uploaded:", res.data.IpfsHash);
        return res.data.IpfsHash;
    } catch (error) {
        console.error("❌ Image Upload Failed:", error.response ? error.response.data : error.message);
        throw error;
    }
};

const uploadJSONToIPFS = async (metadata) => {
    try {
        console.log("uploadiing JSON metadata...");
        const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ JSON Metadata Uploaded:", res.data.IpfsHash);
        return res.data.IpfsHash;
    } catch (error) {
        console.error("❌ JSON Upload Failed:", error.response ? error.response.data : error.message);
        throw error;
    }
};

const processHerbBatch = async (herbData, imageFilePath) => {
    try {
        // 1. Upload the Image
        const fileStream = fs.createReadStream(imageFilePath);
        const imageCID = await uploadFileToIPFS(fileStream, `herb_${Date.now()}.jpg`);

        // 2. Create the Metadata Object
        const finalMetadata = {
            name: herbData.name || "Ayurvedic Herb Batch",
            description: "Authentic batch tracked on blockchain",
            image: `ipfs://${imageCID}`,
            attributes: [
                { trait_type: "Farmer", value: herbData.farmerName || "Unknown" },
                { trait_type: "Location", value: herbData.location || "India" },
                { trait_type: "Date", value: herbData.date || new Date().toISOString() }
            ]
        };

        // 3. Upload the Metadata (JSON)
        const finalCID = await uploadJSONToIPFS(finalMetadata);
        return finalCID;

    } catch (error) {
        console.error("❌ Automation Chain Failed:", error.message);
        throw error;
    }
};

module.exports = { processHerbBatch };