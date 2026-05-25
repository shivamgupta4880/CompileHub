const Snippet = require('../models/Snippet');

// @desc    Get all snippets for logged-in user
// @route   GET /api/snippets
exports.getSnippets = async (req, res, next) => {
  try {
    const snippets = await Snippet.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: snippets.length,
      snippets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single snippet
// @route   GET /api/snippets/:id
exports.getSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found.',
      });
    }

    res.json({
      success: true,
      snippet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new snippet
// @route   POST /api/snippets
exports.createSnippet = async (req, res, next) => {
  try {
    const { title, code, language, output, isPublic } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, code, and language.',
      });
    }

    const snippet = await Snippet.create({
      title,
      code,
      language,
      output: output || '',
      isPublic: isPublic || false,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      snippet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update snippet
// @route   PUT /api/snippets/:id
exports.updateSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found.',
      });
    }

    res.json({
      success: true,
      snippet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete snippet
// @route   DELETE /api/snippets/:id
exports.deleteSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found.',
      });
    }

    res.json({
      success: true,
      message: 'Snippet deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
