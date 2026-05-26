import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTerminal,
  FiAlertCircle,
  FiClock,
  FiCopy,
  FiTrash2,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

const OutputPanel = ({ output, executionTime, isRunning, onClear }) => {
  const [activeTab, setActiveTab] = useState('output');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (output) {
      if (output.stderr && (!output.stdout || output.exitCode !== 0)) {
        setActiveTab('errors');
      } else {
        setActiveTab('output');
      }
    }
  }, [output]);

  const hasError = output?.stderr && output.stderr.length > 0;
  const hasOutput = output?.stdout && output.stdout.length > 0;

  const copyOutput = () => {
    const text = activeTab === 'output' ? output?.stdout : output?.stderr;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`output-panel ${collapsed ? 'collapsed' : ''}`}>
      {/* Tab Bar */}
      <div className="output-header">
        <div className="output-tabs">
          <button
            className={`output-tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <FiTerminal size={13} />
            <span>Output</span>
            {hasOutput && <span className="tab-dot success" />}
          </button>
          <button
            className={`output-tab ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            <FiAlertCircle size={13} />
            <span>Errors</span>
            {hasError && <span className="tab-dot error" />}
          </button>
        </div>

        <div className="output-actions">
          {executionTime !== null && (
            <span className="execution-time">
              <FiClock size={12} />
              {executionTime}ms
            </span>
          )}
          {output && (
            <span className={`exit-code ${output.success ? 'success' : 'error'}`}>
              Exit: {output.exitCode}
            </span>
          )}
          <button
            className="btn btn-ghost btn-icon"
            onClick={copyOutput}
            title="Copy output"
            style={{ width: 28, height: 28 }}
          >
            {copied ? <FiCheck size={13} color="var(--success)" /> : <FiCopy size={13} />}
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClear}
            title="Clear output"
            style={{ width: 28, height: 28 }}
          >
            <FiTrash2 size={13} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{ width: 28, height: 28 }}
          >
            {collapsed ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Output Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="output-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isRunning ? (
              <div className="output-running">
                <div className="loader" />
                <span>Executing code...</span>
              </div>
            ) : output ? (
              <pre className="output-text">
                {activeTab === 'output'
                  ? output.stdout || '(no output)'
                  : output.stderr || '(no errors)'}
              </pre>
            ) : (
              <div className="output-empty">
                <FiTerminal size={24} />
                <span>Run your code to see output here</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .output-panel {
          height: 35%;
          min-height: 48px;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          transition: height var(--transition-base);
        }
        .output-panel.collapsed {
          height: 40px;
          min-height: 40px;
        }
        .output-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 12px;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
          min-height: 38px;
        }
        .output-tabs {
          display: flex;
          gap: 2px;
        }
        .output-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .output-tab:hover {
          color: var(--text-secondary);
          background: var(--bg-card);
        }
        .output-tab.active {
          color: var(--text-primary);
          background: var(--bg-card);
        }
        .tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .tab-dot.success { background: var(--success); }
        .tab-dot.error { background: var(--error); }
        .output-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .execution-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-weight: 500;
        }
        .exit-code {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }
        .exit-code.success {
          color: var(--success);
          background: var(--success-bg);
        }
        .exit-code.error {
          color: var(--error);
          background: var(--error-bg);
        }
        .output-content {
          flex: 1;
          overflow: auto;
          padding: 12px 16px;
          min-height: 0;
        }
        .output-text {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          line-height: 1.7;
          color: var(--text-primary);
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
        }
        .output-empty,
        .output-running {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          min-height: 80px;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        @media (max-width: 768px) {
          .output-panel { height: auto; min-height: 30vh; }
        }
      `}</style>
    </div>
  );
};

export default OutputPanel;
