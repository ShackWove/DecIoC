import { ethers } from "hardhat";
import contractJson from "../artifacts/contracts/ThreatIntelFeed.sol/ThreatIntelFeed.json";
import { readFileSync } from "fs";

async function main() {

    const addressFile = "./frontend/src/contracts/contract-address.json";
    const addresses = JSON.parse(readFileSync(addressFile, "utf-8"));
    const contractAddress = addresses.ThreatIntelFeed;

    console.log("📡 Connecting to contract at:", contractAddress);


    const [owner, user1] = await ethers.getSigners();

    const contract = new ethers.Contract(
        contractAddress,
        contractJson.abi,
        owner
    );


    console.log("🧩 Adding new indicator...");
    const tx = await contract.addIndicator(
        "domain",               // _name
        "malicious.com",        // _value
        "dns",                  // _types
        ["phishing", "C2"],     // _tags
        "Known malicious domain"// _description
    );

    await tx.wait();
    console.log("✅ Indicator added!");


    const indicator = await contract.getIndicator(1);
    console.log("🔍 Indicator #1:");
    console.log({
        id: indicator.id.toString(),
                name: indicator.name,
                value: indicator.value,
                types: indicator.types,
                confidence: indicator.confidence.toString(),
                creator: indicator.source,
    });

    console.log("⬆️ Incrementing confidence...");
    const tx2 = await contract.connect(user1).incrementConfidence(1);
    await tx2.wait();

    const updated = await contract.getIndicator(1);
    console.log("📈 Updated confidence:", updated.confidence.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
