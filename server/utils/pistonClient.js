const axios = require('axios');

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

// Language name -> Piston language mapping with versions
const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  typescript: { language: 'typescript', version: '5.0.3' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
  csharp: { language: 'csharp.net', version: '5.0.201' },
  swift: { language: 'swift', version: '5.3.3' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
};

/**
 * Execute code using the Piston API
 * @param {string} language - Programming language key
 * @param {string} sourceCode - Source code to execute
 * @param {string} stdin - Standard input (optional)
 * @returns {Object} Execution result with stdout, stderr, exit code
 */
const executeCode = async (language, sourceCode, stdin = '') => {
  const langConfig = LANGUAGE_MAP[language.toLowerCase()];

  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`);
  }

  try {
    const response = await axios.post(
      `${PISTON_API_URL}/execute`,
      {
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: getFileName(language, sourceCode),
            content: sourceCode,
          },
        ],
        stdin: stdin,
        args: [],
        compile_timeout: 10000,
        run_timeout: 10000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      },
      {
        timeout: 15000, // HTTP timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { run, compile } = response.data;

    return {
      success: true,
      output: run?.output || '',
      stdout: run?.stdout || '',
      stderr: run?.stderr || (compile?.stderr || ''),
      exitCode: run?.code ?? -1,
      signal: run?.signal || null,
      language: language,
      version: langConfig.version,
    };
  } catch (error) {
    console.warn(`⚠️ Piston API restricted or offline (${error.message}). Falling back to local execution...`);
    try {
      const { runLocally } = require('./localRunner');
      const localResult = await runLocally(language, sourceCode, stdin);
      return {
        ...localResult,
        language: language,
        version: langConfig.version + ' (Local)'
      };
    } catch (localError) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          success: false,
          output: '',
          stdout: '',
          stderr: 'Execution timed out (10s limit exceeded)',
          exitCode: -1,
          signal: 'SIGKILL',
          language: language,
          version: langConfig.version,
        };
      }
      throw new Error(`Code execution failed: Piston API error and local fallback failed: ${localError.message}`);
    }
  }
};

/**
 * Get appropriate filename for the language
 */
const getFileName = (language, sourceCode = '') => {
  const lang = language.toLowerCase();
  if (lang === 'java') {
    const cleanCode = sourceCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const javaClassName = (cleanCode.match(/public\s+class\s+([A-Za-z0-9_]+)/) || cleanCode.match(/class\s+([A-Za-z0-9_]+)/) || [])[1] || 'Main';
    return `${javaClassName}.java`;
  }
  const fileNames = {
    javascript: 'main.js',
    python: 'main.py',
    cpp: 'main.cpp',
    c: 'main.c',
    go: 'main.go',
    rust: 'main.rs',
    typescript: 'main.ts',
    ruby: 'main.rb',
    php: 'main.php',
    csharp: 'Main.cs',
    swift: 'main.swift',
    kotlin: 'Main.kt',
  };
  return fileNames[lang] || 'main.txt';
};

/**
 * Get list of supported languages
 */
const getSupportedLanguages = () => {
  return Object.entries(LANGUAGE_MAP).map(([key, value]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    pistonName: value.language,
    version: value.version,
  }));
};

module.exports = { executeCode, getSupportedLanguages, LANGUAGE_MAP };
