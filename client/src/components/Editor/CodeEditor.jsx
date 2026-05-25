import { useRef, useMemo } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import { getMonacoLanguage } from '../../utils/languageConfig';
import Loader from '../UI/Loader';

// Configure Monaco to load from Cloudflare CDN (cdnjs) for maximum reliability and speed
loader.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
  },
});

const CodeEditor = ({ language, code, onChange, fontSize }) => {
  const editorRef = useRef(null);
  const { isDark } = useTheme();

  const editorOptions = useMemo(
    () => ({
      fontSize: fontSize || 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2,
      renderLineHighlight: 'all',
      lineNumbers: 'on',
      roundedSelection: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggest: {
        showMethods: true,
        showFunctions: true,
        showVariables: true,
        showKeywords: true,
      },
    }),
    [fontSize]
  );

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    // Add keyboard shortcut for running code
    editor.addCommand(
      // Ctrl+Enter
      2048 | 3, // KeyMod.CtrlCmd | KeyCode.Enter
      () => {
        // Dispatch custom event that the parent can listen to
        window.dispatchEvent(new CustomEvent('compilehub-run'));
      }
    );
  };

  return (
    <div className="code-editor-wrapper">
      <div className="monaco-editor-container">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={onChange}
          onMount={handleEditorMount}
          theme={isDark ? 'vs-dark' : 'light'}
          options={editorOptions}
          loading={<Loader text="Loading editor..." />}
        />
      </div>

      <style>{`
        .code-editor-wrapper {
          flex: 1;
          position: relative;
          width: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .monaco-editor-container {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
        }
        .code-editor-wrapper .monaco-editor {
          border-radius: 0;
        }
        .code-editor-wrapper .overflow-guard {
          border-radius: 0;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
