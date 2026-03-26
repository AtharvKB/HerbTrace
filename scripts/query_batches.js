const hre = require("hardhat");

const CONTRACT_ADDRESS = "0x437B1696B0E67a1430f5486583971D4520af93e1";

async function main() {
    const HerbChain = await hre.ethers.getContractAt("HerbChain", CONTRACT_ADDRESS);

    // Check the next batch ID to know how many batches exist
    const nextId = await HerbChain.nextBatchId();
    console.log("===========================================");
    console.log("  HerbChain Contract Query Results");
    console.log("  Contract: " + CONTRACT_ADDRESS);
    console.log("  Next Batch ID: " + nextId.toString());
    console.log("===========================================\n");

    if (nextId <= 101n) {
        console.log("No batches have been created yet.");
        console.log("Batch IDs will start from 101.");
        return;
    }

    const totalBatches = Number(nextId) - 101;
    console.log(`Total batches created: ${totalBatches}\n`);

    // Query each batch from 101 to nextId - 1
    for (let id = 101; id < Number(nextId); id++) {
        try {
            const batch = await HerbChain.getBatch(id);
            const stages = ["Harvested", "Processed", "Verified", "Sold"];

            console.log(`--- Batch #${id} ---`);
            console.log(`  Metadata CID : ${batch.metadataCID}`);
            console.log(`  Farmer       : ${batch.farmer}`);
            console.log(`  Stage        : ${stages[batch.stage]} (${batch.stage})`);

            // Check for lab report
            try {
                const lab = await HerbChain.getLabReport(id);
                console.log(`  Lab Report   : YES`);
                console.log(`    Report IPFS: ${lab.reportIPFS}`);
                console.log(`    Purity     : ${lab.purity}`);
                console.log(`    Notes      : ${lab.notes}`);
                console.log(`    Lab Tech   : ${lab.labTech}`);
                console.log(`    Timestamp  : ${new Date(Number(lab.timestamp) * 1000).toISOString()}`);
            } catch {
                console.log(`  Lab Report   : None`);
            }
            console.log("");
        } catch (err) {
            console.log(`--- Batch #${id} --- ERROR: ${err.message}\n`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
