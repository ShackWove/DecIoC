import { ethers } from "ethers";
import ThreatIntelFeed from "../contracts/ThreatIntelFeed.json";
import addresses from "../contracts/contract-address.json";

export function useContract() {
    if (!window.ethereum) throw new Error("MetaMask not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
        addresses.ThreatIntelFeed,
        ThreatIntelFeed.abi,
        signer
    );

    return { contract, provider, signer };
}
