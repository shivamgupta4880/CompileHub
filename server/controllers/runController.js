const { executeCode } = require('../utils/pistonClient');
const { recordExecution } = require('../utils/metrics');

// @desc    Execute code
// @route   POST /api/run
exports.run = async (req, res, next) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide language and code.',
      });
    }

    if (code.length > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Code exceeds maximum length of 50,000 characters.',
      });
    }

    const startTime = process.hrtime.bigint();
    const result = await executeCode(language, code, stdin || '');
    const durationSec = Number(process.hrtime.bigint() - startTime) / 1e9;

    // Record Prometheus metrics
    recordExecution(language, result.success, durationSec);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
