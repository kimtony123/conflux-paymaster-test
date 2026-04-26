import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { ConfluxPaymaster } from "@conflux-paymaster/conflux-paymaster-sdk";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RPC_URL = "https://evmtestnet.confluxrpc.com";
const PAYMASTER_CONFIG = {
  rpcUrl: RPC_URL,
  paymasterAddress: "0x0cDE16Cf1fD5Bf2536069Aec8a2eF0832A27577B",
  signingServiceUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:3001",
  chainId: 71 as 71,
  apiKey: import.meta.env.VITE_API_KEY || "",
};

const FACTORY_ADDRESS = "0x011497Bb8E0DEbBD3cde2408D75D0d3504d12E7e";
const USDT_TOKEN = "0x4d1beB67e8f0102d5c983c26FDf0b7C6FFF37a0c";

const USDT_ABI = ["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"];

export interface AccountBalances {
  cfx: string;
  usdt: string;
}

interface WalletContextType {
  isConnected: boolean;
  eoaAddress: string | null;
  smartAccount: string | null;
  chainId: number | null;
  eoaBalances: AccountBalances;
  smartBalances: AccountBalances;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (to: string, data: string, value: bigint) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [eoaAddress, setEoaAddress] = useState<string | null>(null);
  const [smartAccount, setSmartAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [eoaBalances, setEoaBalances] = useState<AccountBalances>({ cfx: "0", usdt: "0" });
  const [smartBalances, setSmartBalances] = useState<AccountBalances>({ cfx: "0", usdt: "0" });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymaster, setPaymaster] = useState<ConfluxPaymaster | null>(null);

  const fetchBalances = useCallback(async (eoa: string, smart: string) => {
    try {
      console.log("[DEBUG] Fetching balances for:");
      console.log("[DEBUG]   EOA:", eoa);
      console.log("[DEBUG]   Smart:", smart);
      
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const [eoaCfx, smartCfx] = await Promise.all([
        provider.getBalance(eoa),
        provider.getBalance(smart),
      ]);
      
      const usdt = new ethers.Contract(USDT_TOKEN, USDT_ABI, provider);
      const [eoaUsdtRaw, smartUsdtRaw] = await Promise.all([
        usdt.balanceOf(eoa),
        usdt.balanceOf(smart),
      ]);
      
      const eoaUsdt = eoaUsdtRaw.toString();
      const smartUsdt = smartUsdtRaw.toString();
      
      console.log("[DEBUG] EOA USDT raw:", eoaUsdt);
      console.log("[DEBUG] Smart USDT raw:", smartUsdt);
      
      setEoaBalances({
        cfx: ethers.formatEther(eoaCfx),
        usdt: ethers.formatUnits(eoaUsdtRaw, 6),
      });
      setSmartBalances({
        cfx: ethers.formatEther(smartCfx),
        usdt: ethers.formatUnits(smartUsdtRaw, 6),
      });
      
      console.log("[DEBUG] EOA display:", { cfx: ethers.formatEther(eoaCfx), usdt: ethers.formatUnits(eoaUsdtRaw, 6) });
      console.log("[DEBUG] Smart display:", { cfx: ethers.formatEther(smartCfx), usdt: ethers.formatUnits(smartUsdtRaw, 6) });
    } catch (e) {
      console.error("Balance fetch error:", e);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;
    
    const savedEoa = localStorage.getItem("walletAddress");
    const savedSmart = localStorage.getItem("smartAccount");
    
    if (savedEoa && savedSmart) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0 && accounts[0].toLowerCase() === savedEoa.toLowerCase()) {
          const pm = new ConfluxPaymaster({ ...PAYMASTER_CONFIG });
          const chain = await window.ethereum.request({ method: "eth_chainId" });
          
          setPaymaster(pm);
          setEoaAddress(savedEoa);
          setSmartAccount(savedSmart);
          setChainId(parseInt(chain, 16));
          
          await fetchBalances(savedEoa, savedSmart);
          return true;
        }
      } catch (e) {}
    }
    return false;
  }, [fetchBalances]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed!");
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) throw new Error("No accounts");
      
      const chain = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(chain, 16));
      
      const pm = new ConfluxPaymaster({ ...PAYMASTER_CONFIG });
      
      const walletSigner = {
        address: accounts[0],
        signMessage: async (msg: string | Uint8Array) => {
          const message = typeof msg === "string" ? msg : new TextDecoder().decode(msg);
          return window.ethereum.request({
            method: "personal_sign",
            params: [message, accounts[0]],
          });
        },
      };
      
      await pm.connectWallet(walletSigner);
      await pm.setFactory(FACTORY_ADDRESS);
      const sa = await pm.getSmartAccountAddress(accounts[0], 0n);
      
      setPaymaster(pm);
      setEoaAddress(accounts[0]);
      setSmartAccount(sa);
      
      localStorage.setItem("walletAddress", accounts[0]);
      localStorage.setItem("smartAccount", sa);
      
      await fetchBalances(accounts[0], sa);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalances]);

  const disconnect = useCallback(() => {
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("smartAccount");
    setEoaAddress(null);
    setSmartAccount(null);
    setEoaBalances({ cfx: "0", usdt: "0" });
    setSmartBalances({ cfx: "0", usdt: "0" });
    setPaymaster(null);
  }, []);

  const sendTransaction = useCallback(async (to: string, data: string, value: bigint) => {
    if (!paymaster) throw new Error("Wallet not connected");
    
    const result = await paymaster.sendTransaction({ to, data, value });
    
    if (eoaAddress && smartAccount) {
      await fetchBalances(eoaAddress, smartAccount);
    }
    
    return result;
  }, [paymaster, eoaAddress, smartAccount, fetchBalances]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <WalletContext.Provider value={{
      isConnected: !!eoaAddress,
      eoaAddress,
      smartAccount,
      chainId,
      eoaBalances,
      smartBalances,
      isConnecting,
      error,
      connect,
      disconnect,
      sendTransaction,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}