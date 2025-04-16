const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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

// 确保用户只能收藏同一篇文章一次
favoriteSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema); 