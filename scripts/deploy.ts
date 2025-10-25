import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  console.log("Deploying ThreatIntelFeed...");

  const FeedFactory = await ethers.getContractFactory("ThreatIntelFeed");

  const feed = await FeedFactory.deploy();
  await feed.waitForDeployment();


  const address = await feed.getAddress();
  console.log(`✅ ThreatIntelFeed deployed to: ${address}`);


  const path = "./frontend/src/contracts/contract-address.json";
  writeFileSync(
    path,
    JSON.stringify({ ThreatIntelFeed: address }, null, 2)
  );
  console.log(`📄 Address saved to ${path}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
