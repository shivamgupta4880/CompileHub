const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '..', 'temp_runs');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Run code locally inside a unique subdirectory using system compilers/interpreters
 */
const runLocally = (language, sourceCode, stdin = '') => {
  return new Promise((resolve) => {
    const lang = language.toLowerCase();
    const runId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const runDir = path.join(TEMP_DIR, `run_${runId}`);

    let cmd = '';
    let args = [];
    let fileName = '';
    let isCompiled = false;
    let runCmd = '';
    let runArgs = [];

    // Map languages to system commands, file extensions, and execution methods
    switch (lang) {
      case 'javascript':
        cmd = 'node';
        fileName = 'main.js';
        args = ['main.js'];
        break;
      case 'python':
        cmd = process.platform === 'win32' ? 'python' : 'python3';
        fileName = 'main.py';
        args = ['main.py'];
        break;
      case 'typescript':
        cmd = 'npx';
        fileName = 'main.ts';
        args = ['ts-node', 'main.ts'];
        break;
      case 'java':
        cmd = 'javac';
        const cleanCode = sourceCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        const javaClassName = (cleanCode.match(/public\s+class\s+([A-Za-z0-9_]+)/) || cleanCode.match(/class\s+([A-Za-z0-9_]+)/) || [])[1] || 'Main';
        fileName = `${javaClassName}.java`;
        args = [fileName];
        isCompiled = true;
        runCmd = 'java';
        runArgs = [javaClassName];
        break;
      case 'c':
        cmd = 'gcc';
        fileName = 'main.c';
        args = ['main.c', '-o', 'main'];
        isCompiled = true;
        runCmd = process.platform === 'win32' ? 'main.exe' : './main';
        runArgs = [];
        break;
      case 'cpp':
        cmd = 'g++';
        fileName = 'main.cpp';
        args = ['main.cpp', '-o', 'main'];
        isCompiled = true;
        runCmd = process.platform === 'win32' ? 'main.exe' : './main';
        runArgs = [];
        break;
      case 'go':
        cmd = 'go';
        fileName = 'main.go';
        args = ['run', 'main.go'];
        break;
      case 'rust':
        cmd = 'rustc';
        fileName = 'main.rs';
        args = ['main.rs', '-o', 'main'];
        isCompiled = true;
        runCmd = process.platform === 'win32' ? 'main.exe' : './main';
        runArgs = [];
        break;
      default:
        return resolve({
          success: false,
          output: `Local execution is not supported for ${language} yet.`,
          stdout: '',
          stderr: `Unsupported local language: ${language}`,
          exitCode: -1,
        });
    }

    try {
      // Create sub-directory for this execution
      fs.mkdirSync(runDir, { recursive: true });
      // Write source code file
      fs.writeFileSync(path.join(runDir, fileName), sourceCode);
    } catch (err) {
      cleanupDir();
      return resolve({
        success: false,
        output: `Failed to initialize temp directory: ${err.message}`,
        stdout: '',
        stderr: err.message,
        exitCode: -1,
      });
    }

    let processKilled = false;

    if (isCompiled) {
      // --- COMPILED LANGUAGES FLOW ---
      console.log(`🔨 Compiling ${lang} locally in ${runDir}...`);
      
      const compileProcess = spawn(cmd, args, { cwd: runDir });
      let compileStderr = '';

      compileProcess.stderr.on('data', (data) => {
        compileStderr += data.toString();
      });

      compileProcess.on('error', (err) => {
        cleanupDir();
        resolve({
          success: false,
          output: `Compiler not found: Make sure '${cmd}' is installed and in your system PATH to run ${language} locally.`,
          stdout: '',
          stderr: `System error: ${err.message}`,
          exitCode: -1,
        });
      });

      compileProcess.on('close', (code) => {
        if (code !== 0) {
          cleanupDir();
          resolve({
            success: false,
            output: `Compilation Failed:\n${compileStderr}`,
            stdout: '',
            stderr: compileStderr,
            exitCode: code ?? -1,
          });
        } else {
          // Compilation Succeeded -> Run the binary
          executeBinary();
        }
      });
    } else {
      // --- INTERPRETED LANGUAGES FLOW ---
      executeInterpreter(cmd, args);
    }

    // Helper to execute compiled binaries
    function executeBinary() {
      let stdoutData = '';
      let stderrData = '';

      const child = spawn(runCmd, runArgs, {
        cwd: runDir,
        env: { ...process.env, NODE_ENV: 'production' }
      });

      handleStdin(child);

      const timer = setTimeout(() => {
        processKilled = true;
        try { child.kill('SIGKILL'); } catch (e) {}
        cleanupDir();
        resolve({
          success: false,
          output: 'Execution timed out (5s limit exceeded)',
          stdout: stdoutData,
          stderr: stderrData + '\n[Process terminated due to timeout]',
          exitCode: -1,
        });
      }, 5000);

      child.stdout.on('data', (data) => { stdoutData += data.toString(); });
      child.stderr.on('data', (data) => { stderrData += data.toString(); });

      child.on('error', (err) => {
        clearTimeout(timer);
        cleanupDir();
        resolve({
          success: false,
          output: `Failed to run compiled binary: ${err.message}`,
          stdout: stdoutData,
          stderr: err.message,
          exitCode: -1,
        });
      });

      child.on('close', (code, signal) => {
        if (processKilled) return;
        clearTimeout(timer);
        cleanupDir();
        resolve({
          success: code === 0,
          output: stdoutData + stderrData,
          stdout: stdoutData,
          stderr: stderrData,
          exitCode: code ?? -1,
          signal,
        });
      });
    }

    // Helper to execute interpreted scripts
    function executeInterpreter(interpreterCmd, interpreterArgs) {
      let stdoutData = '';
      let stderrData = '';

      const child = spawn(interpreterCmd, interpreterArgs, {
        cwd: runDir,
        env: { ...process.env, NODE_ENV: 'production' }
      });

      handleStdin(child);

      const timer = setTimeout(() => {
        processKilled = true;
        try { child.kill('SIGKILL'); } catch (e) {}
        cleanupDir();
        resolve({
          success: false,
          output: 'Execution timed out (5s limit exceeded)',
          stdout: stdoutData,
          stderr: stderrData + '\n[Process terminated due to timeout]',
          exitCode: -1,
        });
      }, 5000);

      child.stdout.on('data', (data) => { stdoutData += data.toString(); });
      child.stderr.on('data', (data) => { stderrData += data.toString(); });

      child.on('error', (err) => {
        clearTimeout(timer);
        cleanupDir();
        
        // Fallback for python vs python3 on Windows
        if (lang === 'python' && err.code === 'ENOENT' && interpreterCmd === 'python') {
          resolve(runLocallyWithCmd('py', ['main.py'], runDir, stdin));
        } else {
          resolve({
            success: false,
            output: `Local interpreter not found: Make sure '${interpreterCmd}' is installed and in your system PATH to run ${language} locally.`,
            stdout: stdoutData,
            stderr: `System error: ${err.message}`,
            exitCode: -1,
          });
        }
      });

      child.on('close', (code, signal) => {
        if (processKilled) return;
        clearTimeout(timer);
        cleanupDir();
        resolve({
          success: code === 0,
          output: stdoutData + stderrData,
          stdout: stdoutData,
          stderr: stderrData,
          exitCode: code ?? -1,
          signal,
        });
      });
    }

    // Handle stdin writes
    function handleStdin(childProcess) {
      if (stdin && childProcess.stdin) {
        try {
          childProcess.stdin.write(stdin);
          childProcess.stdin.end();
        } catch (e) {}
      }
    }

    // Cleanup entire temp subdirectory recursively
    function cleanupDir() {
      try {
        if (fs.existsSync(runDir)) {
          fs.rmSync(runDir, { recursive: true, force: true });
        }
      } catch (e) {
        // Failed to delete directory
      }
    }
  });
};

/**
 * Secondary helper to retry interpreted scripts (e.g., python fallback)
 */
const runLocallyWithCmd = (cmd, args, runDir, stdin) => {
  return new Promise((resolve) => {
    let stdoutData = '';
    let stderrData = '';
    let processKilled = false;

    const child = spawn(cmd, args, { cwd: runDir });

    if (stdin && child.stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch (e) {}
    }

    const timer = setTimeout(() => {
      processKilled = true;
      try { child.kill('SIGKILL'); } catch (e) {}
      cleanupDir();
      resolve({
        success: false,
        output: 'Execution timed out (5s limit exceeded)',
        stdout: stdoutData,
        stderr: stderrData + '\n[Process terminated due to timeout]',
        exitCode: -1,
      });
    }, 5000);

    child.stdout.on('data', (data) => { stdoutData += data.toString(); });
    child.stderr.on('data', (data) => { stderrData += data.toString(); });

    child.on('error', (err) => {
      if (processKilled) return;
      clearTimeout(timer);
      cleanupDir();
      resolve({
        success: false,
        output: `Local interpreter not found: Make sure '${cmd}' is installed.`,
        stdout: stdoutData,
        stderr: `System error: ${err.message}`,
        exitCode: -1,
      });
    });

    child.on('close', (code, signal) => {
      if (processKilled) return;
      clearTimeout(timer);
      cleanupDir();
      resolve({
        success: code === 0,
        output: stdoutData + stderrData,
        stdout: stdoutData,
        stderr: stderrData,
        exitCode: code ?? -1,
        signal,
      });
    });

    function cleanupDir() {
      try {
        if (fs.existsSync(runDir)) {
          fs.rmSync(runDir, { recursive: true, force: true });
        }
      } catch (e) {}
    }
  });
};

module.exports = { runLocally };
