import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import "./App.css";
import ThreatIntelFeed from "./contracts/ThreatIntelFeed.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface Indicator {
  id: string;
  name: string;
  value: string;
  types: string;
  confidence: string;
  source: string;
  first_seen: string;
  last_seen: string;
  tags: string[];
  description: string;
}

export default function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [account, setAccount] = useState<string>();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [types, setTypes] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ThreatIntelFeed.abi, signer);
    setProvider(provider);
    setContract(contract);
    setAccount(await signer.getAddress());
  }

  async function loadIndicators() {
    if (!contract) return;
    const data = await contract.getIndicators();
    const parsed: Indicator[] = data.map((i: any) => ({
      id: i.id.toString(),
                                                      name: i.name,
                                                      value: i.value,
                                                      types: i.types,
                                                      confidence: i.confidence.toString(),
                                                      source: i.source,
                                                      first_seen: new Date(Number(i.first_seen) * 1000).toLocaleString(),
                                                      last_seen: new Date(Number(i.last_seen) * 1000).toLocaleString(),
                                                      tags: i.tags,
                                                      description: i.description,
    }));
    setIndicators(parsed);
  }

  async function addIndicator(e: React.FormEvent) {
    e.preventDefault();
    if (!contract) return;
    const tagsArray = tags.split(",").map(t => t.trim());
    const tx = await contract.addIndicator(name, value, types, tagsArray, description);
    await tx.wait();
    setName(""); setValue(""); setTypes(""); setTags(""); setDescription("");
    loadIndicators();
  }

  async function increment(id: string) {
    if (!contract) return;
    const tx = await contract.incrementConfidence(id);
    await tx.wait();
    loadIndicators();
  }

  async function decrement(id: string) {
    if (!contract) return;
    const tx = await contract.decrementConfidence(id);
    await tx.wait();
    loadIndicators();
  }

  useEffect(() => {
    if (contract) loadIndicators();
  }, [contract]);

    const filteredIndicators = indicators.filter(ind =>
    [ind.name, ind.value, ind.types, ind.tags.join(",")].some(field =>
    field.toLowerCase().includes(searchTerm.toLowerCase())
    )
    );

    return (
      <div className="app">
      <header className="header">
      <motion.h1
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      >
      DecIoC
      </motion.h1>
      </header>

      {!account ? (
        <div className="center">
        <button className="btn connect" onClick={connectWallet}>
        Connect MetaMask
        </button>
        </div>
      ) : (
        <>
        <div className="form-container">
        <h2>Add New Indicator</h2>
        <form onSubmit={addIndicator}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Value" value={value} onChange={e => setValue(e.target.value)} />
        <input placeholder="Type" value={types} onChange={e => setTypes(e.target.value)} />
        <input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <button className="btn add" type="submit">Add Indicator</button>
        </form>
        </div>

        <div className="search-box">
        <input
        type="text"
        placeholder="🔍 Search indicators..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        />
        </div>

        <div className="cards">
        {filteredIndicators.length === 0 ? (
          <p>No indicators found</p>
        ) : (
          filteredIndicators.map(ind => (
            <motion.div
            key={ind.id}
            className="card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            >
            <h3>{ind.name} <span>({ind.types})</span></h3>
            <hr />
            <p><strong>Value:</strong> {ind.value}</p>
            <p><strong>Confidence:</strong> {ind.confidence}</p>
            <p><strong>Source:</strong> {ind.source}</p>
            <p><strong>First Seen:</strong> {ind.first_seen}</p>
            <p><strong>Last Seen:</strong> {ind.last_seen}</p>
            <p><strong>Description:</strong> {ind.description || "No description"}</p>
            <p><strong>Tags:</strong> {ind.tags.join(", ") || "No tags"}</p>
            <div className="card-buttons">
            <button className="btn inc" onClick={() => increment(ind.id)}>👍 Increment</button>
            <button className="btn dec" onClick={() => decrement(ind.id)}>👎 Decrement</button>
            </div>
            </motion.div>
          ))
        )}
        </div>
        </>
      )}
      </div>
    );
}
