const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, '标题不能为空'],
        trim: true,
        maxlength: [100, '标题不能超过100个字符']
    },
    content: {
        type: String,
        required: [true, '内容不能为空']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImage: {
        type: String,
        required: [true, '封面图片不能为空']
    },
    images: [{
        type: String
    }],
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: [true, '分类不能为空'],
        enum: ['生活', '技术', '随想', '其他']
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    favoriteCount: {
        type: Number,
        default: 0
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
});

// 更新时自动更新updatedAt字段
articleSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// 创建文章索引
articleSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Article', articleSchema); 