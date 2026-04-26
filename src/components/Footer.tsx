import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/">Conflux Paymaster</Link>
          <p>Gasless Transactions for Everyone</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/">Home</Link>
            <Link to="/transfer">Transfer</Link>
          </div>
          
          <div className="footer-section">
            <h4>Documentation</h4>
            <a href="https://docs.conflux-paymaster" target="_blank" rel="noopener noreferrer">Docs</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          
          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} Conflux Paymaster. All rights reserved.</p>
      </div>
    </footer>
  );
}