const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入博客标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  content: {
    type: String,
    required: [true, '请输入博客内容']
  },
  summary: {
    type: String,
    maxlength: [200, '摘要不能超过200个字符']
  },
  cover: {
    type: String,
    default: 'default-blog-cover.jpg'
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, '请选择博客分类'],
    enum: ['技术', '生活', '随笔', '其他']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 更新时自动更新updatedAt字段
BlogSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', BlogSchema); 