const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入作品标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请输入作品描述']
  },
  cover: {
    type: String,
    required: [true, '请上传作品封面']
  },
  images: [{
    type: String
  }],
  link: {
    type: String,
    required: [true, '请输入作品链接']
  },
  github: {
    type: String
  },
  technologies: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, '请选择作品分类'],
    enum: ['Web', 'Mobile', 'Desktop', 'Other']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
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

module.exports = mongoose.model('Work', WorkSchema);