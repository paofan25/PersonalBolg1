const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  game: {
    type: String,
    required: [true, '请提供游戏ID'],
    enum: ['snake', 'memory', 'puzzle', 'tetris']
  },
  score: {
    type: Number,
    required: [true, '请提供分数']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引以加快查询速度
ScoreSchema.index({ game: 1, score: -1 });
ScoreSchema.index({ user: 1, game: 1 });

module.exports = mongoose.model('Score', ScoreSchema);