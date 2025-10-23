import { expect } from "chai";
import { ethers } from "hardhat";
//const { ethers } = hardhat;

describe("ThreatIntelFeed", function () {
    async function deployContract() {
        const [owner, user1, user2] = await ethers.getSigners();

        const FeedFactory = await ethers.getContractFactory("ThreatIntelFeed");
        const feed = await FeedFactory.deploy();
        await feed.waitForDeployment();

        return { feed, owner, user1, user2 };
    }

    it("should deploy correctly", async function () {
        const { feed } = await deployContract();
        const address = await feed.getAddress();
        expect(address).to.properAddress;
    });

    it("should add a new indicator", async function () {
        const { feed, owner } = await deployContract();

        await feed.connect(owner).addIndicator("ip", "45.155.205.233");

        const indicator = await feed.getIndicator(1);
        expect(indicator.indicatorType).to.equal("ip");
        expect(indicator.indicatorValue).to.equal("45.155.205.233");
        expect(indicator.confidence).to.equal(0);
    });

    it("should increment and decrement confidence", async function () {
        const { feed, user1 } = await deployContract();

        await feed.addIndicator("domain", "malicious.com");

        await feed.connect(user1).incrementConfidence(1);
        let ind = await feed.getIndicator(1);
        expect(ind.confidence).to.equal(1);

        await feed.connect(user1).decrementConfidence(1);
        ind = await feed.getIndicator(1);
        expect(ind.confidence).to.equal(0);
    });

    it("should prevent decrementing below 0", async function () {
        const { feed } = await deployContract();
        await feed.addIndicator("ip", "1.2.3.4");

        await expect(feed.decrementConfidence(1)).to.be.revertedWith("Already at minimum confidence");
    });

    it("should reject invalid IDs", async function () {
        const { feed } = await deployContract();
        await expect(feed.getIndicator(999)).to.be.revertedWith("invalid indicator ID");
    });
});
