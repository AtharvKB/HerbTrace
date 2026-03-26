const hre = require("hardhat");

async function main() {
  console.log("--- STARTING V2 TEST (New Contract) ---");

  // 1. Deploy
  const HerbChain = await hre.ethers.getContractFactory("HerbChain");
  const herbChain = await HerbChain.deploy();
  await herbChain.waitForDeployment();
  console.log("✅ V2 Contract deployed.");

  // 2. Create Batch (Now with 4 arguments!)
  console.log("\nTesting: Create Batch...");
  
  // createBatch(Name, Location, Date, ImageCID)
  const txn = await herbChain.createBatch(
      "Ashwagandha",       // Name
      "Nagpur, MH",        // Location
      "2026-01-26",        // Date (New!)
      "QmHash12345..."     // Image CID (New!)
  );
  
  await txn.wait();
  console.log("✅ Batch #101 Created!");

  // 3. Read Data
  console.log("\nTesting: Read Data...");
  const details = await herbChain.getBatchDetails(101); // ID starts at 101 now
  
  console.log("--- BATCH #101 DETAILS ---");
  console.log("Name:", details[0]);
  console.log("Location:", details[1]);
  console.log("Harvest Date:", details[2]); // Validating new field
  console.log("Image CID:", details[3]);    // Validating new field
  console.log("Farmer:", details[4]);
  console.log("Stage:", details[5].toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});