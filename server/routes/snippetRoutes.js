const express = require('express');
const router = express.Router();
const {
  getSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
} = require('../controllers/snippetController');
const auth = require('../middleware/auth');

// All snippet routes require authentication
router.use(auth);

router.route('/').get(getSnippets).post(createSnippet);
router.route('/:id').get(getSnippet).put(updateSnippet).delete(deleteSnippet);

module.exports = router;
