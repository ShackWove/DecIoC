import { useState } from "react";
import { useContract } from "./hooks/useContract";

function App() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const { contract } = useContract();

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    setConnected(true);
  }

  async function addIndicator() {
    await contract.addIndicator(
      name,
      value,
      "network",
      ["malicious", "feed"],
      "Added via frontend"
    );
    alert("Indicator added!");
  }

  return (
    <div className="p-6">
    {!connected ? (
      <button onClick={connectWallet}>Connect MetaMask</button>
    ) : (
      <div>
      <p>Connected as {account}</p>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Value" onChange={(e) => setValue(e.target.value)} />
      <button onClick={addIndicator}>Add Indicator</button>
      </div>
    )}
    </div>
  );
}

export default App;
