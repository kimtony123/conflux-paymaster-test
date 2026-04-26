import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

const USDT_TOKEN = "0x4d1beB67e8f0102d5c983c26FDf0b7C6FFF37a0c";
const USDT_ABI = ["function transfer(address,uint256) returns (bool)"];

export function TransferPage() {
  const { 
    eoaAddress, 
    smartAccount, 
    eoaBalances, 
    smartBalances, 
    chainId,
    sendTransaction,
    isConnected,
    error,
  } = useWallet();
  
  const [recipient, setRecipient] = useState("0xe4966b6CE320a88065c5Be2F6036a36a90d2f6b8");
  const [amount, setAmount] = useState("1");
  const [token, setToken] = useState<"CFX" | "USDT">("USDT");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Redirect if not connected
  if (!isConnected) {
    return (
      <div className="page transfer-page">
        <div className="not-connected">
          <p>Please connect your wallet first</p>
        </div>
      </div>
    );
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!recipient || !amount) return;
    
    setSending(true);
    setError(null);
    setStatus(null);
    setTxResult(null);
    
    try {
      let result;
      const value = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      if (token === "CFX") {
        result = await sendTransaction(recipient, "0x", value);
      } else {
        const usdt = new ethers.Contract(USDT_TOKEN, USDT_ABI, new ethers.JsonRpcProvider("https://evmtestnet.confluxrpc.com"));
        const data = usdt.interface.encodeFunctionData("transfer", [recipient, ethers.parseUnits(amount, 6)]);
        result = await sendTransaction(USDT_TOKEN, data, 0n);
      }
      
      setTxResult(result);
      setStatus("✅ Transaction submitted!");
    } catch (e: any) {
      setStatus("Error: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const setError = (msg: string | null) => setStatus(msg);

  return (
    <div className="page transfer-page">
      {/* Smart Account - Primary */}
      <section className="account-card smart-account">
        <div className="card-header">
          <h3>🔐 Smart Account</h3>
          <button 
            onClick={() => smartAccount && handleCopy(smartAccount)}
            className="btn-copy"
          >
            {copied ? "✅ Copied!" : "📋 Copy"}
          </button>
        </div>
        <p className="address">{smartAccount}</p>
        <p className="hint">Send USDT here for gasless transfers</p>
        
        <div className="balances">
          <div className="balance">
            <span>CFX</span>
            <span className="amount">{parseFloat(smartBalances.cfx).toFixed(4)}</span>
          </div>
          <div className="balance">
            <span>USDT</span>
            <span className="amount">{parseFloat(smartBalances.usdt).toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* EOA - Secondary */}
      <section className="account-card eoa-account">
        <div className="card-header">
          <h3>🦊 Wallet (EOA)</h3>
        </div>
        <p className="address small">{eoaAddress}</p>
        
        <div className="balances">
          <div className="balance">
            <span>CFX</span>
            <span className="amount">{parseFloat(eoaBalances.cfx).toFixed(4)}</span>
          </div>
          <div className="balance">
            <span>USDT</span>
            <span className="amount">{parseFloat(eoaBalances.usdt).toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Transfer Form */}
      <section className="transfer-form">
        <h2>Send Token</h2>
        <p className="hint">You pay 0 CFX gas!</p>
        
        <div className="token-selector">
          <button 
            className={token === "CFX" ? "active" : ""} 
            onClick={() => setToken("CFX")}
          >
            CFX
          </button>
          <button 
            className={token === "USDT" ? "active" : ""} 
            onClick={() => setToken("USDT")}
          >
            USDT
          </button>
        </div>
        
        <div className="form-group">
          <label>Recipient</label>
          <input 
            type="text" 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
          />
        </div>
        
        <div className="form-group">
          <label>Amount ({token})</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step={token === "CFX" ? "0.0001" : "0.000001"}
          />
        </div>
        
        <button 
          onClick={handleSend} 
          disabled={sending || !recipient || !amount}
          className="btn-send"
        >
          {sending ? "Sending..." : `Send ${token} (Gasless)`}
        </button>
        
        {status && <p className={status.includes("Error") ? "error" : "status"}>{status}</p>}
        
        {txResult && (
          <div className="result">
            <p>✅ Success!</p>
            <a 
              href={`https://evmtestnet.confluxscan.io/tx/${txResult.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on ConfluxScan →
            </a>
          </div>
        )}
      </section>

      {/* Network Info */}
      <div className="network-info">
        <span>Network:</span>
        <span>{chainId === 71 ? 'Conflux Testnet' : `Chain ${chainId}`}</span>
      </div>
    </div>
  );
}