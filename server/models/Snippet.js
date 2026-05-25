const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Snippet title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  code: {
    type: String,
    required: [true, 'Code content is required'],
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    lowercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  output: {
    type: String,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp on save
snippetSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

snippetSchema.pre('findOneAndUpdate', function () {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Snippet', snippetSchema);
