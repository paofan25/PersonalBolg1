/**
 * 游戏分数模块 - 管理游戏得分和排行榜
 */
import db from './db.js';
import authService from './auth.js';

class ScoreService {
    // 提交游戏分数
    submitScore(gameId, score) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        if (!gameId || typeof score !== 'number') {
            throw new Error('游戏ID和分数格式不正确');
        }
        
        const userId = authService.getCurrentUser().id;
        
        // 查找用户之前的记录
        const existingScore = db.query('scores', s => 
            s.gameId === gameId && s.userId === userId
        )[0];
        
        // 如果存在记录且新分数更高，更新记录
        if (existingScore) {
            if (score > existingScore.score) {
                existingScore.score = score;
                existingScore.updatedAt = new Date().toISOString();
                return db.save('scores', existingScore);
            }
            return existingScore;
        }
        
        // 创建新记录
        const newScore = {
            gameId,
            userId,
            score,
            timestamp: new Date().toISOString()
        };
        
        return db.save('scores', newScore);
    }

    // 获取游戏排行榜
    getLeaderboard(gameId, limit = 10) {
        if (!gameId) {
            throw new Error('游戏ID不能为空');
        }
        
        // 获取指定游戏的所有分数
        const scores = db.query('scores', score => score.gameId === gameId);
        
        // 按分数降序排序
        scores.sort((a, b) => b.score - a.score);
        
        // 限制数量
        const topScores = scores.slice(0, limit);
        
        // 添加用户信息
        return topScores.map(score => {
            const user = db.getById('users', score.userId);
            if (user) {
                score.user = {
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar
                };
            }
            return score;
        });
    }

    // 获取用户在某游戏的最高分
    getUserBestScore(gameId, userId) {
        if (!gameId) {
            throw new Error('游戏ID不能为空');
        }
        
        // 如果没有提供用户ID，使用当前登录用户
        if (!userId && authService.isLoggedIn()) {
            userId = authService.getCurrentUser().id;
        }
        
        if (!userId) {
            throw new Error('用户未登录');
        }
        
        // 查询用户在该游戏的所有分数
        const scores = db.query('scores', score => 
            score.gameId === gameId && score.userId === userId
        );
        
        // 按分数降序排序
        scores.sort((a, b) => b.score - a.score);
        
        // 返回最高分或null
        return scores.length > 0 ? scores[0] : null;
    }

    // 获取用户在所有游戏的最高分
    getUserScores(userId) {
        // 如果没有提供用户ID，使用当前登录用户
        if (!userId && authService.isLoggedIn()) {
            userId = authService.getCurrentUser().id;
        }
        
        if (!userId) {
            throw new Error('用户未登录');
        }
        
        // 按游戏分组获取用户的最高分
        const allScores = db.query('scores', score => score.userId === userId);
        
        // 创建游戏ID到最高分的映射
        const gameScores = {};
        
        allScores.forEach(score => {
            if (!gameScores[score.gameId] || score.score > gameScores[score.gameId].score) {
                gameScores[score.gameId] = score;
            }
        });
        
        return Object.values(gameScores);
    }

    // 获取游戏的总体统计信息
    getGameStats(gameId) {
        if (!gameId) {
            throw new Error('游戏ID不能为空');
        }
        
        const scores = db.query('scores', score => score.gameId === gameId);
        
        if (scores.length === 0) {
            return {
                totalPlayers: 0,
                highestScore: 0,
                averageScore: 0,
                totalPlays: 0
            };
        }
        
        // 计算统计信息
        const highestScore = Math.max(...scores.map(s => s.score));
        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        const averageScore = totalScore / scores.length;
        const uniquePlayers = new Set(scores.map(s => s.userId)).size;
        
        return {
            totalPlayers: uniquePlayers,
            highestScore,
            averageScore,
            totalPlays: scores.length
        };
    }
}

// 导出单例
const scoreService = new ScoreService();
export default scoreService;