import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back! 🚀');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page page-container">
      <div className="page-bg" />

      <motion.div
        className="auth-card glass-strong"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <FiCode size={24} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to {APP_NAME}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <FiMail size={16} className="input-icon" />
              <input
                type="email"
                className="input input-with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <FiLock size={16} className="input-icon" />
              <input
                type="password"
                className="input input-with-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.02 }}
            whileTap={loading ? {} : { scale: 0.98 }}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? (
              <>
                <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn size={16} />
                Sign In
              </>
            )}
          </motion.button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </motion.div>

      <style>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 40px 36px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-logo {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          color: #fff;
        }
        .auth-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .auth-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 4px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon {
          padding-left: 40px;
        }
        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .auth-link {
          color: var(--primary);
          font-weight: 600;
        }
        .auth-link:hover {
          color: var(--primary-hover);
        }
      `}</style>
    </div>
  );
};

export default Login;
