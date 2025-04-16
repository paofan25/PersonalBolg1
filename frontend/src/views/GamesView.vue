<template>
  <div class="games-view">
    <div class="games-header sweet-card">
      <h1 class="gradient-text">趣味小游戏</h1>
      <p class="subtitle">在这里放松心情，赢取可爱奖励~</p>
    </div>

    <div class="games-grid">
      <!-- 甜品记忆配对 -->
      <div class="game-card sweet-card" @click="goToGame('memory')">
        <div class="game-image">
          <div class="placeholder-image memory-game-bg">
            <span class="emoji-icon">🎮</span>
          </div>
        </div>
        <div class="game-info">
          <h3>甜品记忆配对</h3>
          <p>翻转卡片，寻找相同的甜点！配对成功有特殊动画哦~</p>
          <div class="game-stats">
            <div class="stat">
              <span class="label">最高分</span>
              <span class="value">{{ userStats.memoryGame.highScore || 0 }}</span>
            </div>
            <div class="stat">
              <span class="label">游戏次数</span>
              <span class="value">{{ userStats.memoryGame.playCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 云朵农场 -->
      <div class="game-card sweet-card" @click="goToGame('farm')">
        <div class="game-image">
          <div class="placeholder-image farm-game-bg">
            <span class="emoji-icon">🌱</span>
          </div>
        </div>
        <div class="game-info">
          <h3>云朵农场</h3>
          <p>种植魔法云朵，收获可爱果实！解锁独特装饰物~</p>
          <div class="game-stats">
            <div class="stat">
              <span class="label">农场等级</span>
              <span class="value">{{ userStats.cloudFarm.level || 1 }}</span>
            </div>
            <div class="stat">
              <span class="label">收获次数</span>
              <span class="value">{{ userStats.cloudFarm.harvestCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户成就 -->
    <div class="achievements sweet-card">
      <h2 class="gradient-text">我的成就</h2>
      <div class="achievements-grid">
        <div v-for="achievement in achievements" 
             :key="achievement.id" 
             class="achievement-item"
             :class="{ unlocked: achievement.unlocked }">
          <div class="achievement-icon">
            <span class="achievement-emoji">{{ achievement.emoji }}</span>
          </div>
          <div class="achievement-info">
            <h4>{{ achievement.name }}</h4>
            <p>{{ achievement.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GamesView',
  data() {
    return {
      userStats: {
        memoryGame: {
          highScore: 0,
          playCount: 0
        },
        cloudFarm: {
          level: 1,
          harvestCount: 0
        }
      },
      achievements: [
        {
          id: 'memoryMaster',
          name: '记忆大师',
          description: '在甜品记忆配对中获得3000分以上',
          emoji: '🏆',
          unlocked: false
        },
        {
          id: 'farmExpert',
          name: '农场达人',
          description: '云朵农场达到5级',
          emoji: '👨‍🌾',
          unlocked: false
        },
        {
          id: 'collector',
          name: '收集控',
          description: '解锁所有装饰物',
          emoji: '🎨',
          unlocked: false
        }
      ]
    };
  },
  methods: {
    goToGame(game) {
      this.$router.push(`/games/${game}`);
    }
  }
};
</script>

<style scoped>
.games-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.games-header {
  text-align: center;
  padding: 30px;
  margin-bottom: 30px;
}

.subtitle {
  color: var(--text-secondary);
  margin-top: 10px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.game-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.game-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s ease;
}

.memory-game-bg {
  background: linear-gradient(135deg, #FFB6C1, #87CEEB);
}

.farm-game-bg {
  background: linear-gradient(135deg, #98FB98, #DDA0DD);
}

.emoji-icon {
  font-size: 4rem;
}

.game-card:hover .placeholder-image {
  transform: scale(1.05);
}

.game-info {
  padding: 20px;
}

.game-info h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.game-info p {
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.game-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-purple);
}

.achievements {
  padding: 30px;
}

.achievements h2 {
  text-align: center;
  margin-bottom: 20px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: var(--border-radius);
  background-color: var(--bg-secondary);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  opacity: 1;
  background-color: var(--bg-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.achievement-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-purple);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-emoji {
  font-size: 1.8rem;
}

.achievement-info h4 {
  margin-bottom: 5px;
  color: var(--text-primary);
}

.achievement-info p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>