const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供作品标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请提供作品描述'],
    trim: true
  },
  coverImage: {
    type: String,
    default: 'default-work.jpg'
  },
  content: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, '请提供作品分类'],
    enum: ['网站', '游戏', '设计', '其他']
  },
  tags: {
    type: [String],
    default: []
  },
  link: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Work', WorkSchema);