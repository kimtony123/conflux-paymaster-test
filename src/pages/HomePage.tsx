import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export function HomePage() {
  const { connect, isConnecting, error } = useWallet();
  
  return (
    <div className="page home-page">
      <section className="hero">
        <h1>Conflux Paymaster</h1>
        <p className="subtitle">Gasless Transactions for Everyone</p>
        <p className="description">
          Send CFX and USDT without paying any gas fees. 
          Your dApp sponsors the transaction costs.
        </p>
      </section>
      
      <section className="features">
        <div className="feature">
          <span className="icon">🔗</span>
          <h3>Connect Wallet</h3>
          <p>Use MetaMask or Web3Auth</p>
        </div>
        
        <div className="feature">
          <span className="icon">💸</span>
          <h3>Zero Gas Fees</h3>
          <p>Your dApp pays for you</p>
        </div>
        
        <div className="feature">
          <span className="icon">🔒</span>
          <h3>Smart Accounts</h3>
          <p>ERC-4337 proxy</p>
        </div>
      </section>
      
      <section className="cta">
        <Link to="/login" className="btn-primary">
          {isConnecting ? 'Connecting...' : 'Get Started'}
        </Link>
        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}