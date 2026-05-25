import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCode, FiPlus, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useSnippets from '../../hooks/useSnippets';
import SnippetCard from './SnippetCard';
import Loader from '../UI/Loader';
import { LANGUAGES } from '../../utils/languageConfig';

const Dashboard = () => {
  const { snippets, loading, error, deleteSnippet } = useSnippets();
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const navigate = useNavigate();

  const filteredSnippets = useMemo(() => {
    return snippets.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase());
      const matchesLang = filterLang === 'all' || s.language === filterLang;
      return matchesSearch && matchesLang;
    });
  }, [snippets, search, filterLang]);

  const handleEdit = (snippet) => {
    navigate('/', { state: { snippet } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    const result = await deleteSnippet(id);
    if (result.success) {
      toast.success('Snippet deleted!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="dashboard-page page-container">
      <div className="page-bg" />

      <div className="dashboard-content animate-fade-in">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Snippets</h1>
            <p className="dashboard-subtitle">
              {snippets.length} saved snippet{snippets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <motion.button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus size={16} />
            New Snippet
          </motion.button>
        </div>

        {/* Filters */}
        <div className="dashboard-filters">
          <div className="search-box">
            <FiSearch size={16} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Search snippets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FiFilter size={14} />
            <select
              className="input select filter-select"
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
            >
              <option value="all">All Languages</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loader size="lg" text="Loading snippets..." />
        ) : error ? (
          <div className="dashboard-empty">
            <p style={{ color: 'var(--error)' }}>{error}</p>
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="dashboard-empty">
            <FiCode size={48} />
            <h3>No snippets found</h3>
            <p>
              {snippets.length === 0
                ? 'Write some code and save it to see it here!'
                : 'Try adjusting your search or filter.'}
            </p>
            {snippets.length === 0 && (
              <motion.button
                className="btn btn-primary"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ marginTop: '12px' }}
              >
                <FiPlus size={16} />
                Start Coding
              </motion.button>
            )}
          </div>
        ) : (
          <motion.div className="snippets-grid" layout>
            <AnimatePresence>
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet._id}
                  snippet={snippet}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
        }
        .dashboard-content {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
        }
        .dashboard-title {
          font-size: 1.8rem;
          font-weight: 800;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dashboard-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 4px;
        }
        .dashboard-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .search-box {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-input {
          padding-left: 40px;
        }
        .filter-box {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        .filter-select {
          min-width: 160px;
        }
        .snippets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .dashboard-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          color: var(--text-muted);
          text-align: center;
          gap: 12px;
        }
        .dashboard-empty h3 {
          color: var(--text-secondary);
          font-size: 1.2rem;
        }
        @media (max-width: 768px) {
          .dashboard-content { padding: 20px 14px; }
          .dashboard-header { flex-direction: column; }
          .snippets-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
