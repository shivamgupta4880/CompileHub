const { executeCode, getSupportedLanguages } = require('../utils/pistonClient');

// @desc    Execute code
// @route   POST /api/code/execute
exports.execute = async (req, res, next) => {
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

    const result = await executeCode(language, code, stdin || '');

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

// @desc    Get supported languages
// @route   GET /api/code/languages
exports.getLanguages = async (req, res, next) => {
  try {
    const languages = getSupportedLanguages();
    res.json({
      success: true,
      languages,
    });
  } catch (error) {
    next(error);
  }
};
