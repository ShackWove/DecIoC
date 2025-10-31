import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ThreatIntelFeed from "./contracts/ThreatIntelFeed.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center py-10 px-6">
      <div className="w-full max-w-[1600px] mx-auto space-y-10 text-center">
      <h1 className="text-5xl font-bold mb-10">
      🧠 Threat Intelligence Feed (Blockchain)
      </h1>

      {!account ? (
        <button
        onClick={connectWallet}
        className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-xl font-semibold shadow-lg"
        >
        Connect MetaMask
        </button>
      ) : (
        <>
        {/* --- FORM --- */}
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl mx-auto w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6">Add New Indicator</h2>
        <form onSubmit={addIndicator} className="space-y-4 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input className="p-3 bg-gray-700 rounded-lg" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="p-3 bg-gray-700 rounded-lg" placeholder="Value (e.g. IP, domain)" value={value} onChange={e => setValue(e.target.value)} />
        <input className="p-3 bg-gray-700 rounded-lg" placeholder="Type (e.g. network, dns)" value={types} onChange={e => setTypes(e.target.value)} />
        <input className="p-3 bg-gray-700 rounded-lg" placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
        </div>
        <textarea className="p-3 bg-gray-700 rounded-lg w-full h-28 resize-none" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="text-center">
        <button type="submit" className="bg-green-600 hover:bg-green-700 px-10 py-3 rounded-lg font-semibold">
        Add Indicator
        </button>
        </div>
        </form>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-gray-800 p-10 rounded-2xl shadow-xl w-full flex justify-center">
        <div className="w-full max-w-[1200px] space-y-8">
        <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-center w-full">Indicators</h2>
        </div>

        <div className="flex justify-center mb-6">
        <input
        type="text"
        placeholder="🔍 Search indicators..."
        className="p-4 bg-gray-700 rounded-lg w-96 text-center"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        />
        </div>

        {filteredIndicators.length === 0 ? (
          <p className="text-gray-400 text-center">No indicators found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredIndicators.map(ind => (
            <div
            key={ind.id}
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 text-left hover:shadow-2xl transition-all"
            >
            <h3 className="text-2xl font-semibold mb-4 text-blue-400 text-center">
            {ind.name} <span className="text-gray-400 text-lg">({ind.types})</span>
            </h3>

            <div className="border-t border-gray-700 my-3"></div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div><strong>ID:</strong> {ind.id}</div>
            <div><strong>Value:</strong> {ind.value}</div>
            <div><strong>Confidence:</strong> <span className="text-blue-400 font-semibold">{ind.confidence}</span></div>
            <div><strong>Source:</strong> <span className="break-all">{ind.source}</span></div>
            <div><strong>First Seen:</strong> {ind.first_seen}</div>
            <div><strong>Last Seen:</strong> {ind.last_seen}</div>
            </div>

            <div className="border-t border-gray-700 my-3"></div>

            <div>
            <strong>Description:</strong>
            <p className="text-gray-300 mt-2">{ind.description || "No description"}</p>
            </div>

            <div className="border-t border-gray-700 my-3"></div>

            <div>
            <strong>Tags:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
            {ind.tags.length > 0 ? (
              ind.tags.map((tag, idx) => (
                <span key={idx} className="bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-medium">
                {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400">No tags</span>
            )}
            </div>
            </div>

            <div className="border-t border-gray-700 my-4"></div>

            <div className="flex justify-center gap-4">
            <button
            onClick={() => increment(ind.id)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
            👍 Increment
            </button>
            <button
            onClick={() => decrement(ind.id)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
            👎 Decrement
            </button>
            </div>
            </div>
          ))}
          </div>
        )}
        </div>
        </div>
        </>
      )}
      </div>
      </div>
    );
}
