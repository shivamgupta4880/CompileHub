import { useState, useCallback } from 'react';
import { codeAPI } from '../services/api';

const useCodeExecution = () => {
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  const executeCode = useCallback(async (language, code, stdin = '') => {
    setIsRunning(true);
    setOutput(null);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const res = await codeAPI.run({ language, code, stdin });
      const elapsed = Date.now() - startTime;
      setExecutionTime(elapsed);

      const result = res.data.result;
      setOutput({
        stdout: result.stdout || result.output || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode,
        success: result.exitCode === 0,
        language: result.language,
        version: result.version,
      });

      return result;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      setExecutionTime(elapsed);

      const errorResult = {
        stdout: '',
        stderr: error.response?.data?.message || error.message || 'Execution failed.',
        exitCode: -1,
        success: false,
      };
      setOutput(errorResult);
      return errorResult;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setOutput(null);
    setExecutionTime(null);
  }, []);

  return { output, isRunning, executionTime, executeCode, clearOutput };
};

export default useCodeExecution;
