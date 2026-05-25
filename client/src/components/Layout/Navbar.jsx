import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiGrid, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../UI/ThemeToggle';
import { APP_NAME } from '../../utils/constants';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header
      className="navbar"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <FiCode />
          </div>
          <span className="navbar-title">{APP_NAME}</span>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
          >
            <FiCode size={16} />
            <span>Editor</span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
            >
              <FiGrid size={16} />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="navbar-username">
                <FiUser size={14} />
                {user?.username}
              </span>
              <motion.button
                className="btn btn-ghost btn-sm"
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiLogOut size={14} />
                <span className="hide-mobile">Logout</span>
              </motion.button>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                className="btn btn-primary btn-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiLogIn size={14} />
                <span>Sign In</span>
              </motion.button>
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-height);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 100;
          display: flex;
          align-items: center;
        }
        .navbar-inner {
          width: 100%;
          max-width: 100%;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-primary);
          flex-shrink: 0;
        }
        .navbar-logo {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: var(--radius-md);
          color: #fff;
          font-size: 1.1rem;
        }
        .navbar-title {
          font-size: 1.15rem;
          font-weight: 800;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px;
        }
        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }
        .nav-link-active {
          color: var(--primary);
          background: var(--primary-glow);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .navbar-username {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .navbar-inner { padding: 0 12px; }
          .navbar-title { display: none; }
          .navbar-username { display: none; }
        }
      `}</style>
    </motion.header>
  );
};

export default Navbar;
