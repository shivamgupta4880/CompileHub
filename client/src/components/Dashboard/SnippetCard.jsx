import { motion } from 'framer-motion';
import { FiCode, FiTrash2, FiEdit3, FiClock } from 'react-icons/fi';

const SnippetCard = ({ snippet, onEdit, onDelete }) => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const previewCode = (code) => {
    const lines = code.split('\n').slice(0, 4);
    return lines.join('\n');
  };

  return (
    <motion.div
      className="snippet-card card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="snippet-card-header">
        <h3 className="snippet-title">{snippet.title}</h3>
        <span className="badge badge-primary">{snippet.language}</span>
      </div>

      <div className="snippet-preview">
        <pre><code>{previewCode(snippet.code)}</code></pre>
      </div>

      <div className="snippet-card-footer">
        <span className="snippet-date">
          <FiClock size={12} />
          {formatDate(snippet.updatedAt)}
        </span>
        <div className="snippet-actions">
          <motion.button
            className="btn btn-ghost btn-icon"
            onClick={() => onEdit(snippet)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Edit snippet"
          >
            <FiEdit3 size={14} />
          </motion.button>
          <motion.button
            className="btn btn-ghost btn-icon"
            onClick={() => onDelete(snippet._id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete snippet"
            style={{ color: 'var(--error)' }}
          >
            <FiTrash2 size={14} />
          </motion.button>
        </div>
      </div>

      <style>{`
        .snippet-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: default;
        }
        .snippet-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .snippet-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .snippet-preview {
          background: var(--bg-input);
          border-radius: var(--radius-md);
          padding: 12px;
          overflow: hidden;
          max-height: 100px;
        }
        .snippet-preview pre {
          margin: 0;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          line-height: 1.5;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .snippet-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .snippet-date {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .snippet-actions {
          display: flex;
          gap: 4px;
        }
      `}</style>
    </motion.div>
  );
};

export default SnippetCard;
