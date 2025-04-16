<template>
  <div class="memory-game">
    <div class="game-header sweet-card">
      <h2 class="gradient-text">甜品记忆配对</h2>
      <div class="game-stats">
        <span class="moves">步数: {{ moves }}</span>
        <span class="time">时间: {{ formatTime(time) }}</span>
        <span class="score">得分: {{ score }}</span>
      </div>
      <button class="restart-btn sweet-btn" @click="restartGame">
        重新开始
      </button>
    </div>

    <div class="game-board" :class="{ disabled: !canFlip }">
      <div v-for="(card, index) in cards" 
           :key="index"
           class="card"
           :class="{ flipped: card.isFlipped, matched: card.isMatched }"
           @click="flipCard(index)">
        <div class="card-inner">
          <div class="card-front">
            <div class="card-pattern"></div>
          </div>
          <div class="card-back">
            <div class="card-image" :style="{ backgroundColor: card.color }">
              {{ card.emoji }}
            </div>
            <span class="card-name">{{ card.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 胜利弹窗 -->
    <div class="victory-modal" v-if="showVictory">
      <div class="modal-content sweet-card">
        <h3 class="gradient-text">恭喜通关！</h3>
        <div class="stats">
          <p>用时: {{ formatTime(time) }}</p>
          <p>步数: {{ moves }}</p>
          <p>得分: {{ score }}</p>
        </div>
        <div class="rewards">
          <p>获得奖励:</p>
          <div class="reward-items">
            <div class="reward-item">
              <span class="reward-icon">⭐</span>
              <span>+{{ score }}</span>
            </div>
          </div>
        </div>
        <div class="buttons">
          <button class="sweet-btn" @click="restartGame">再玩一次</button>
          <button class="sweet-btn primary" @click="backToGames">返回游戏列表</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const DESSERTS = [
  { name: '草莓蛋糕', emoji: '🍰', color: '#FFB6C1' },
  { name: '马卡龙', emoji: '🍪', color: '#DDA0DD' },
  { name: '甜甜圈', emoji: '🍩', color: '#FFB347' },
  { name: '冰淇淋', emoji: '🍦', color: '#87CEEB' },
  { name: '布丁', emoji: '🍮', color: '#F4A460' },
  { name: '奶茶', emoji: '🧋', color: '#DEB887' }
];

export default {
  name: 'MemoryGame',
  data() {
    return {
      cards: [],
      flippedCards: [],
      canFlip: true,
      moves: 0,
      time: 0,
      score: 0,
      timer: null,
      showVictory: false,
      matchedPairs: 0
    };
  },
  created() {
    this.initGame();
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    initGame() {
      // 创建配对卡片
      this.cards = [...DESSERTS, ...DESSERTS]
        .map((dessert, index) => ({
          ...dessert,
          id: index,
          isFlipped: false,
          isMatched: false
        }))
        .sort(() => Math.random() - 0.5);

      this.flippedCards = [];
      this.moves = 0;
      this.time = 0;
      this.score = 0;
      this.showVictory = false;
      this.matchedPairs = 0;
      this.canFlip = true;
      
      this.startTimer();
    },
    startTimer() {
      this.stopTimer();
      this.timer = setInterval(() => {
        this.time++;
      }, 1000);
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    async flipCard(index) {
      if (!this.canFlip || this.cards[index].isFlipped || this.cards[index].isMatched) {
        return;
      }

      this.cards[index].isFlipped = true;
      this.flippedCards.push(index);

      if (this.flippedCards.length === 2) {
        this.moves++;
        this.canFlip = false;
        
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];

        if (firstCard.name === secondCard.name) {
          // 匹配成功
          await this.handleMatch(firstIndex, secondIndex);
        } else {
          // 匹配失败
          await this.handleMismatch(firstIndex, secondIndex);
        }

        this.flippedCards = [];
        this.canFlip = true;
      }
    },
    async handleMatch(firstIndex, secondIndex) {
      // 添加匹配动画
      this.cards[firstIndex].isMatched = true;
      this.cards[secondIndex].isMatched = true;
      
      // 更新分数
      this.score += 100;
      this.matchedPairs++;

      // 检查游戏是否结束
      if (this.matchedPairs === DESSERTS.length) {
        this.handleVictory();
      }

      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    async handleMismatch(firstIndex, secondIndex) {
      // 等待一段时间后翻回
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.cards[firstIndex].isFlipped = false;
      this.cards[secondIndex].isFlipped = false;
    },
    handleVictory() {
      this.stopTimer();
      this.showVictory = true;
      
      // 计算最终得分
      const timeBonus = Math.max(0, 3000 - this.time * 10);
      const movesBonus = Math.max(0, 2000 - this.moves * 20);
      this.score += timeBonus + movesBonus;

      // 保存分数到用户数据
      this.$store.dispatch('games/submitMemoryScore', this.score);
    },
    restartGame() {
      this.showVictory = false;
      this.initGame();
    },
    backToGames() {
      this.$router.push('/games');
    }
  }
};
</script>

<style scoped>
.memory-game {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  perspective: 1000px;
}

.game-board.disabled {
  pointer-events: none;
}

.card {
  aspect-ratio: 3/4;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card.matched {
  animation: matched 0.5s ease-out;
}

@keyframes matched {
  0%, 100% { transform: rotateY(180deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.1); }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-front {
  background: linear-gradient(135deg, var(--primary-pink), var(--primary-purple));
}

.card-pattern {
  width: 60%;
  height: 60%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.card-back {
  transform: rotateY(180deg);
  padding: 10px;
}

.card-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.card-name {
  font-size: 0.9rem;
  color: var(--text-primary);
  text-align: center;
}

/* 胜利弹窗 */
.victory-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  padding: 30px;
  text-align: center;
}

.stats {
  margin: 20px 0;
}

.rewards {
  margin: 20px 0;
}

.reward-items {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.reward-icon {
  font-size: 1.5rem;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-board {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .game-board {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .game-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>