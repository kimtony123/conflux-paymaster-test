import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isConnected, disconnect } = useWallet();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">ConfluxPay</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
        {!isConnected && (
          <Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link>
        )}
        {isConnected && (
          <Link to="/transfer" className={isActive('/transfer') ? 'active' : ''}>Transfer</Link>
        )}
      </div>
      
      <div className="nav-actions">
        <button onClick={toggleTheme} className="btn-theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {isConnected && (
          <button onClick={disconnect} className="btn-logout">Logout</button>
        )}
      </div>
    </nav>
  );
}