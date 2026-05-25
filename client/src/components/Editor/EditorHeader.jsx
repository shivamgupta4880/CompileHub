import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlay,
  FiSave,
  FiTrash2,
  FiSettings,
  FiMinus,
  FiPlus,
} from 'react-icons/fi';
import { LANGUAGES } from '../../utils/languageConfig';

const EditorHeader = ({
  language,
  onLanguageChange,
  onRun,
  onSave,
  onClear,
  isRunning,
  fontSize,
  onFontSizeChange,
  isAuthenticated,
}) => {
  const currentLang = useMemo(
    () => LANGUAGES.find((l) => l.id === language) || LANGUAGES[0],
    [language]
  );

  return (
    <div className="editor-header">
      {/* Language Selector */}
      <div className="editor-header-left">
        <div className="language-selector">
          <span className="language-icon">{currentLang.icon}</span>
          <select
            className="input select language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Controls */}
        <div className="font-controls hide-mobile">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
            title="Decrease font size"
          >
            <FiMinus size={14} />
          </button>
          <span className="font-size-label">{fontSize}px</span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
            title="Increase font size"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="editor-header-right">
        <motion.button
          className="btn btn-ghost btn-sm"
          onClick={onClear}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Clear editor"
        >
          <FiTrash2 size={14} />
          <span className="hide-mobile">Clear</span>
        </motion.button>

        {isAuthenticated && (
          <motion.button
            className="btn btn-secondary btn-sm"
            onClick={onSave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Save snippet"
          >
            <FiSave size={14} />
            <span className="hide-mobile">Save</span>
          </motion.button>
        )}

        <motion.button
          className={`btn btn-sm run-btn ${isRunning ? 'running' : ''}`}
          onClick={onRun}
          disabled={isRunning}
          whileHover={isRunning ? {} : { scale: 1.05 }}
          whileTap={isRunning ? {} : { scale: 0.95 }}
          title="Run code (Ctrl+Enter)"
        >
          {isRunning ? (
            <>
              <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
              <span>Running...</span>
            </>
          ) : (
            <>
              <FiPlay size={14} />
              <span>Run</span>
            </>
          )}
        </motion.button>
      </div>

      <style>{`
        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          gap: 12px;
          flex-shrink: 0;
        }
        .editor-header-left,
        .editor-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .language-selector {
          position: relative;
          display: flex;
          align-items: center;
        }
        .language-icon {
          position: absolute;
          left: 10px;
          z-index: 1;
          font-size: 1.1rem;
          pointer-events: none;
        }
        .language-select {
          padding-left: 36px;
          min-width: 160px;
          font-size: 0.85rem;
          height: 36px;
          background: var(--bg-input);
        }
        .font-controls {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 4px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        .font-size-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 36px;
          text-align: center;
          font-family: var(--font-mono);
        }
        .run-btn {
          background: var(--gradient-primary) !important;
          color: #fff !important;
          box-shadow: 0 0 16px var(--primary-glow);
          min-width: 100px;
        }
        .run-btn:hover {
          box-shadow: var(--shadow-glow-strong);
        }
        .run-btn.running {
          opacity: 0.8;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .editor-header { padding: 6px 10px; }
          .language-select { min-width: 120px; }
        }
      `}</style>
    </div>
  );
};

export default EditorHeader;
