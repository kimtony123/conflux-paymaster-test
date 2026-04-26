import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { connect, isConnecting, error } = useWallet();
  const [wallets, setWallets] = useState([
    { id: 'metamask', name: 'MetaMask', icon: '🦊', available: true },
    { id: 'web3auth', name: 'Web3Auth', icon: '🔐', available: false },
  ]);
  const isMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);

  const handleConnect = async (walletId: string) => {
    if (walletId === 'web3auth') {
      alert('Web3Auth Coming Soon!');
      return;
    }
    await connect();
    navigate('/transfer');
  };

  return (
    <div className="page login-page">
      <Link to="/" className="back-link">← Back</Link>
      
      <header className="page-header">
        <h1>Connect Wallet</h1>
        <p>Choose your wallet to continue</p>
      </header>
      
      <section className="wallets">
        {wallets.map(wallet => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            disabled={!wallet.available || (wallet.id === 'metamask' && !isMetaMask) || isConnecting}
            className={`wallet-option ${wallet.id}`}
          >
            <span className="wallet-icon">{wallet.icon}</span>
            <span className="wallet-name">{wallet.name}</span>
            {!wallet.available && <span className="coming-soon">Coming Soon</span>}
          </button>
        ))}
      </section>
      
      {error && <p className="error">{error}</p>}
      
      {!isMetaMask && (
        <a 
          href="https://metamask.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="install-link"
        >
          Install MetaMask →
        </a>
      )}
      
      <div className="divider">
        <span>OR</span>
      </div>
      
      <p className="guest-text">
        Continue as guest (no gasless transactions)
        <Link to="/transfer" className="guest-link">Try Demo →</Link>
      </p>
    </div>
  );
}