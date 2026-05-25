import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import useCodeExecution from '../hooks/useCodeExecution';
import useSnippets from '../hooks/useSnippets';

import CodeEditor from '../components/Editor/CodeEditor';
import EditorHeader from '../components/Editor/EditorHeader';
import OutputPanel from '../components/Editor/OutputPanel';
import Modal from '../components/UI/Modal';

import { LANGUAGES, getDefaultCode } from '../utils/languageConfig';
import { STORAGE_KEYS } from '../utils/constants';

const EditorPage = () => {
  const { isAuthenticated } = useAuth();
  const { output, isRunning, executionTime, executeCode, clearOutput } = useCodeExecution();
  const { saveSnippet } = useSnippets();
  const location = useLocation();

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'javascript';
  });
  const [code, setCode] = useState(() => getDefaultCode('javascript'));
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEYS.FONT_SIZE)) || 14;
  });
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');

  // Load snippet from navigation state (edit from dashboard)
  useEffect(() => {
    if (location.state?.snippet) {
      const { snippet } = location.state;
      setLanguage(snippet.language);
      setCode(snippet.code);
      // Clear the state so refreshing doesn't reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize.toString());
  }, [fontSize]);

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    setCode(getDefaultCode(newLang));
    clearOutput();
  }, [clearOutput]);

  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }
    await executeCode(language, code);
  }, [language, code, executeCode]);

  const handleClear = useCallback(() => {
    setCode(getDefaultCode(language));
    clearOutput();
  }, [language, clearOutput]);

  const handleSave = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save snippets.');
      return;
    }
    setSnippetTitle('');
    setSaveModalOpen(true);
  }, [isAuthenticated]);

  const handleSaveConfirm = useCallback(async () => {
    if (!snippetTitle.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    const result = await saveSnippet({
      title: snippetTitle,
      code,
      language,
      output: output?.stdout || '',
    });
    if (result.success) {
      toast.success('Snippet saved! ✨');
      setSaveModalOpen(false);
    } else {
      toast.error(result.message);
    }
  }, [snippetTitle, code, language, output, saveSnippet]);

  // Listen for Ctrl+Enter shortcut from Monaco
  useEffect(() => {
    const handler = () => handleRun();
    window.addEventListener('compilehub-run', handler);
    return () => window.removeEventListener('compilehub-run', handler);
  }, [handleRun]);

  // Also handle keyboard shortcut globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleSave]);

  return (
    <motion.div
      className="editor-layout page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="editor-main">
        <EditorHeader
          language={language}
          onLanguageChange={handleLanguageChange}
          onRun={handleRun}
          onSave={handleSave}
          onClear={handleClear}
          isRunning={isRunning}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isAuthenticated={isAuthenticated}
        />

        <div className="editor-panel">
          <CodeEditor
            language={language}
            code={code}
            onChange={(val) => setCode(val || '')}
            fontSize={fontSize}
          />
        </div>

        <OutputPanel
          output={output}
          executionTime={executionTime}
          isRunning={isRunning}
          onClear={clearOutput}
        />
      </div>

      {/* Save Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Snippet"
      >
        <div className="modal-body">
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Give your snippet a name to save it to your collection.
          </p>
          <input
            type="text"
            className="input"
            placeholder="e.g., Fibonacci Function"
            value={snippetTitle}
            onChange={(e) => setSnippetTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveConfirm()}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setSaveModalOpen(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveConfirm}>
            Save
          </button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default EditorPage;
