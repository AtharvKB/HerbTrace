const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying HerbChain contract...");

  // 1. Get the contract to deploy
  const HerbChain = await hre.ethers.getContractFactory("HerbChain");

  // 2. Deploy it
  const herbChain = await HerbChain.deploy();

  // 3. Wait for the transaction to finish
  await herbChain.waitForDeployment();

  // 4. Get and save the address
  const address = await herbChain.getAddress();
  console.log("CONTRACT_ADDRESS=" + address);
  fs.writeFileSync("deployed_address.txt", address);
  console.log("Address also saved to deployed_address.txt");
}

// This pattern handles errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});