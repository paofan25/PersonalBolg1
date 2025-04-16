const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 确保用户只能给同一篇文章点赞一次
likeSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema); 