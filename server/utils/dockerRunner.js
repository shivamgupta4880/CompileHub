const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '..', 'temp_runs');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Configuration details for Docker-based executions per language
const DOCKER_CONFIGS = {
  javascript: {
    image: 'node:20-alpine',
    fileName: 'main.js',
    command: ['node', '/code/main.js'],
    isCompiled: false
  },
  typescript: {
    image: 'denoland/deno:alpine',
    fileName: 'main.ts',
    command: ['deno', 'run', '--allow-all', '/code/main.ts'],
    isCompiled: false
  },
  python: {
    image: 'python:3.11-slim',
    fileName: 'main.py',
    command: ['python3', '/code/main.py'],
    isCompiled: false
  },
  php: {
    image: 'php:8.2-cli-alpine',
    fileName: 'main.php',
    command: ['php', '/code/main.php'],
    isCompiled: false
  },
  ruby: {
    image: 'ruby:3.2-alpine',
    fileName: 'main.rb',
    command: ['ruby', '/code/main.rb'],
    isCompiled: false
  },
  c: {
    image: 'gcc:12',
    fileName: 'main.c',
    command: ['sh', '-c', 'cp /code/main.c . && gcc -O3 main.c -o main && ./main'],
    isCompiled: true
  },
  cpp: {
    image: 'gcc:12',
    fileName: 'main.cpp',
    command: ['sh', '-c', 'cp /code/main.cpp . && g++ -O3 main.cpp -o main && ./main'],
    isCompiled: true
  },
  go: {
    image: 'golang:1.21-alpine',
    fileName: 'main.go',
    command: ['sh', '-c', 'cp /code/main.go . && GO111MODULE=off CGO_ENABLED=0 GOPROXY=off GOSUMDB=off GOCACHE=/app/.cache GOTMPDIR=/app GOPATH=/app/go go build -o main main.go && ./main'],
    isCompiled: true
  },
  java: {
    image: 'eclipse-temurin:17-alpine',
    fileName: 'Main.java', // Default fallback filename, parsed dynamically
    command: null, // Set dynamically in execution flow based on public class name
    isCompiled: true
  }
};

/**
 * Execute code inside a highly secure and resource-limited Docker container
 * @param {string} language - Target programming language key
 * @param {string} sourceCode - User source code
 * @param {string} stdin - Standard input string
 * @param {number} timeoutMs - Timeout limit (default 6000ms)
 * @returns {Promise<Object>} Execution result (success, output, stdout, stderr, exitCode)
 */
const runInContainer = (language, sourceCode, stdin = '', timeoutMs = 15000) => {
  return new Promise((resolve) => {
    const lang = language.toLowerCase();
    const config = DOCKER_CONFIGS[lang];

    if (!config) {
      return resolve({
        success: false,
        output: `Unsupported language: ${language}`,
        stdout: '',
        stderr: `Language ${language} is not supported by the Docker sandbox execution engine.`,
        exitCode: -1
      });
    }

    const runId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const hostRunDir = path.join(TEMP_DIR, `run_${runId}`);
    
    // Determine dynamic Java class / file name
    let codeFileName = config.fileName;
    let javaClassName = 'Main';
    if (lang === 'java') {
      const cleanCode = sourceCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const matchedClass = cleanCode.match(/public\s+class\s+([A-Za-z0-9_]+)/) || cleanCode.match(/class\s+([A-Za-z0-9_]+)/);
      if (matchedClass && matchedClass[1]) {
        javaClassName = matchedClass[1];
        codeFileName = `${javaClassName}.java`;
      }
    }

    try {
      // 1. Create temporary directory on host
      fs.mkdirSync(hostRunDir, { recursive: true });
      fs.writeFileSync(path.join(hostRunDir, codeFileName), sourceCode);
    } catch (err) {
      cleanupHostDir(hostRunDir);
      return resolve({
        success: false,
        output: `Execution Initialization Failed: ${err.message}`,
        stdout: '',
        stderr: err.message,
        exitCode: -1
      });
    }

    // Determine target docker command
    let dockerCmdArgs = [];
    const containerName = `compilehub_sandbox_${runId}`;

    // Base Docker security arguments
    const baseArgs = [
      'run',
      '--rm',
      '--name', containerName,
      '--network', 'none',            // Block RCE internet callouts
      '--user', '1000:1000',          // Prevent root escalations
      '--cpus', '1.0',                // Throttle CPU exhaustion
      '--memory', '256m',             // Throttle memory OOM limits
      '--memory-swap', '256m',
      '-v', `${hostRunDir}:/code:ro`  // Mount host temp dir as Read-Only volume
    ];

    if (config.isCompiled) {
      // Mount a writeable tmpfs (/app) in memory for compiler outputs
      baseArgs.push('--tmpfs', '/app:size=64m,exec,uid=1000,gid=1000,mode=1777');
      baseArgs.push('-w', '/app');
      
      let compileAndRunCmds = [];
      if (lang === 'java') {
        compileAndRunCmds = ['sh', '-c', `cp /code/${codeFileName} . && javac ${codeFileName} && java ${javaClassName}`];
      } else {
        compileAndRunCmds = config.command;
      }
      dockerCmdArgs = [...baseArgs, config.image, ...compileAndRunCmds];
    } else {
      // Interpreted flows do not require executable compilation files
      baseArgs.push('--tmpfs', '/tmp:size=16m,exec,uid=1000,gid=1000,mode=1777');
      baseArgs.push('-w', '/code');
      dockerCmdArgs = [...baseArgs, config.image, ...config.command];
    }

    let stdoutData = '';
    let stderrData = '';
    let hasTimedOut = false;

    console.log(`🐳 Spawning Docker container: ${containerName} for ${lang}...`);
    
    // Resolve cross-platform Docker binary path
    let dockerPath = 'docker';
    if (process.platform === 'win32') {
      const defaultWinPath = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe';
      if (fs.existsSync(defaultWinPath)) {
        dockerPath = defaultWinPath;
      }
    } else {
      const defaultLinuxPath = '/usr/bin/docker';
      if (fs.existsSync(defaultLinuxPath)) {
        dockerPath = defaultLinuxPath;
      }
    }

    // Spawn the docker process
    const dockerProcess = spawn(dockerPath, dockerCmdArgs);

    // Prevent EPIPE stream uncaught exception crashes
    if (dockerProcess.stdin) {
      dockerProcess.stdin.on('error', () => {});
    }
    if (dockerProcess.stdout) {
      dockerProcess.stdout.on('error', () => {});
    }
    if (dockerProcess.stderr) {
      dockerProcess.stderr.on('error', () => {});
    }

    // Enforce execution timeout
    const timeoutTimer = setTimeout(() => {
      hasTimedOut = true;
      console.warn(`🛑 Docker container execution exceeded ${timeoutMs}ms limit. Killing container ${containerName}...`);
      try {
        // Forcefully kill container
        execSync(`docker kill ${containerName}`, { stdio: 'ignore' });
      } catch (err) {
        // Container might have already exited
      }
    }, timeoutMs);

    // Handle standard input (stdin)
    if (stdin && dockerProcess.stdin) {
      try {
        dockerProcess.stdin.write(stdin);
        dockerProcess.stdin.end();
      } catch (err) {
        // Error writing to stdin
      }
    }

    dockerProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    dockerProcess.stderr.on('data', (data) => {
      // Capture build/execution errors
      stderrData += data.toString();
    });

    dockerProcess.on('error', (err) => {
      clearTimeout(timeoutTimer);
      cleanupHostDir(hostRunDir);
      
      resolve({
        success: false,
        output: `Docker execution engine error: ${err.message}`,
        stdout: '',
        stderr: err.message,
        exitCode: -1
      });
    });

    dockerProcess.on('close', (code) => {
      clearTimeout(timeoutTimer);
      cleanupHostDir(hostRunDir);

      if (hasTimedOut) {
        return resolve({
          success: false,
          output: `Time Limit Exceeded: Code execution timed out (${timeoutMs / 1000}s limit)`,
          stdout: stdoutData,
          stderr: `${stderrData}\n[Execution Timed Out after ${timeoutMs / 1000} seconds]`,
          exitCode: 124 // Standard timeout exit code
        });
      }

      // Check if container was terminated due to memory OOM
      const isOOM = stderrData.includes('Killed') || stderrData.includes('Out of memory') || code === 137;
      let finalOutput = stdoutData + stderrData;
      if (isOOM) {
        finalOutput += '\n[Process terminated: Memory Limit Exceeded (128MB max)]';
        stderrData += '\n[Process terminated: Memory Limit Exceeded (128MB max)]';
      }

      resolve({
        success: code === 0 && !isOOM,
        output: finalOutput,
        stdout: stdoutData,
        stderr: stderrData,
        exitCode: code ?? -1
      });
    });
  });
};

/**
 * Remove host temporary workspace directory cleanly
 */
function cleanupHostDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    // Suppress deletion errors
  }
}

module.exports = { runInContainer, DOCKER_CONFIGS };
