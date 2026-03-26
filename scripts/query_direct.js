const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const CONTRACT_ADDRESS = "0x437B1696B0E67a1430f5486583971D4520af93e1";

// Load ABI from compiled artifacts
const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/HerbChain.sol/HerbChain.json", "utf8")
);
const ABI = artifact.abi;

async function main() {
    // Connect to Sepolia via Alchemy
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // Check the next batch ID
    const nextId = await contract.nextBatchId();
    console.log("===========================================");
    console.log("  HerbChain - Sepolia Batch Query");
    console.log("  Contract: " + CONTRACT_ADDRESS);
    console.log("  Next Batch ID: " + nextId.toString());
    console.log("===========================================\n");

    if (nextId <= 101n) {
        console.log("No batches have been created yet.");
        console.log("Batch IDs will start from 101.");
        return;
    }

    const totalBatches = Number(nextId) - 101;
    console.log("Total batches created: " + totalBatches + "\n");

    const stages = ["Harvested", "Processed", "Verified", "Sold"];

    for (let id = 101; id < Number(nextId); id++) {
        try {
            const batch = await contract.getBatch(id);
            console.log("--- Batch #" + id + " ---");
            console.log("  Metadata CID : " + batch.metadataCID);
            console.log("  Farmer       : " + batch.farmer);
            console.log("  Stage        : " + stages[Number(batch.stage)] + " (" + batch.stage + ")");

            // Check for lab report
            try {
                const lab = await contract.getLabReport(id);
                console.log("  Lab Report   : YES");
                console.log("    Report IPFS: " + lab.reportIPFS);
                console.log("    Purity     : " + lab.purity);
                console.log("    Notes      : " + lab.notes);
                console.log("    Lab Tech   : " + lab.labTech);
                console.log("    Timestamp  : " + new Date(Number(lab.timestamp) * 1000).toISOString());
            } catch (e) {
                console.log("  Lab Report   : None");
            }
            console.log("");
        } catch (err) {
            console.log("--- Batch #" + id + " --- ERROR: " + err.reason + "\n");
        }
    }
}

main().catch(console.error);
