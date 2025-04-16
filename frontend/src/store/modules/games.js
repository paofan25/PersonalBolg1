// 游戏状态管理模块
export default {
  namespaced: true,
  
  state: {
    // 记忆游戏状态
    memoryGame: {
      highScore: localStorage.getItem('memoryGameHighScore') || 0,
      playCount: parseInt(localStorage.getItem('memoryGamePlayCount')) || 0,
      lastScore: 0
    },
    
    // 云朵农场状态
    cloudFarm: {
      level: parseInt(localStorage.getItem('cloudFarmLevel')) || 1,
      experience: parseInt(localStorage.getItem('cloudFarmExp')) || 0,
      coins: parseInt(localStorage.getItem('cloudFarmCoins')) || 100,
      harvestCount: parseInt(localStorage.getItem('cloudFarmHarvest')) || 0,
      crops: JSON.parse(localStorage.getItem('cloudFarmCrops')) || [],
      inventory: JSON.parse(localStorage.getItem('cloudFarmInventory')) || [],
      decorations: JSON.parse(localStorage.getItem('cloudFarmDecorations')) || []
    },
    
    // 成就系统
    achievements: JSON.parse(localStorage.getItem('gameAchievements')) || {
      memoryMaster: false,
      farmExpert: false,
      collector: false
    }
  },
  
  getters: {
    // 记忆游戏
    memoryGameStats: state => state.memoryGame,
    
    // 云朵农场
    cloudFarmStats: state => state.cloudFarm,
    farmProgress: state => {
      const currentLevelExp = state.cloudFarm.level * 1000;
      return (state.cloudFarm.experience / currentLevelExp) * 100;
    },
    
    // 成就
    unlockedAchievements: state => {
      return Object.values(state.achievements).filter(unlocked => unlocked).length;
    },
    achievementProgress: state => {
      return Object.entries(state.achievements).map(([key, unlocked]) => ({
        id: key,
        unlocked
      }));
    }
  },
  
  mutations: {
    // 记忆游戏
    UPDATE_MEMORY_SCORE(state, score) {
      state.memoryGame.lastScore = score;
      if (score > state.memoryGame.highScore) {
        state.memoryGame.highScore = score;
        localStorage.setItem('memoryGameHighScore', score);
      }
    },
    INCREMENT_MEMORY_PLAYS(state) {
      state.memoryGame.playCount++;
      localStorage.setItem('memoryGamePlayCount', state.memoryGame.playCount);
    },
    
    // 云朵农场
    UPDATE_FARM_LEVEL(state, { level, experience }) {
      state.cloudFarm.level = level;
      state.cloudFarm.experience = experience;
      localStorage.setItem('cloudFarmLevel', level);
      localStorage.setItem('cloudFarmExp', experience);
    },
    UPDATE_FARM_COINS(state, coins) {
      state.cloudFarm.coins = coins;
      localStorage.setItem('cloudFarmCoins', coins);
    },
    UPDATE_CROPS(state, crops) {
      state.cloudFarm.crops = crops;
      localStorage.setItem('cloudFarmCrops', JSON.stringify(crops));
    },
    ADD_TO_INVENTORY(state, item) {
      state.cloudFarm.inventory.push(item);
      localStorage.setItem('cloudFarmInventory', JSON.stringify(state.cloudFarm.inventory));
    },
    INCREMENT_HARVEST_COUNT(state) {
      state.cloudFarm.harvestCount++;
      localStorage.setItem('cloudFarmHarvest', state.cloudFarm.harvestCount);
    },
    
    // 成就
    UNLOCK_ACHIEVEMENT(state, achievementId) {
      if (!state.achievements[achievementId]) {
        state.achievements[achievementId] = true;
        localStorage.setItem('gameAchievements', JSON.stringify(state.achievements));
      }
    }
  },
  
  actions: {
    // 记忆游戏
    submitMemoryScore({ commit }, score) {
      commit('UPDATE_MEMORY_SCORE', score);
      commit('INCREMENT_MEMORY_PLAYS');
      
      // 检查成就
      if (score >= 3000) {
        commit('UNLOCK_ACHIEVEMENT', 'memoryMaster');
      }
    },
    
    // 云朵农场
    harvestCrop({ commit, state }, { cropId, reward }) {
      // 更新金币
      const newCoins = state.cloudFarm.coins + reward.coins;
      commit('UPDATE_FARM_COINS', newCoins);
      
      // 更新经验
      const currentExp = state.cloudFarm.experience + reward.experience;
      const currentLevel = state.cloudFarm.level;
      const expNeeded = currentLevel * 1000;
      
      if (currentExp >= expNeeded) {
        // 升级
        commit('UPDATE_FARM_LEVEL', {
          level: currentLevel + 1,
          experience: currentExp - expNeeded
        });
        
        // 检查成就
        if (currentLevel + 1 >= 5) {
          commit('UNLOCK_ACHIEVEMENT', 'farmExpert');
        }
      } else {
        commit('UPDATE_FARM_LEVEL', {
          level: currentLevel,
          experience: currentExp
        });
      }
      
      // 更新作物状态
      const updatedCrops = state.cloudFarm.crops.filter(crop => crop.id !== cropId);
      commit('UPDATE_CROPS', updatedCrops);
      
      // 添加收获物品到背包
      if (reward.item) {
        commit('ADD_TO_INVENTORY', reward.item);
      }
      
      // 更新收获计数
      commit('INCREMENT_HARVEST_COUNT');
      
      // 检查收藏家成就
      const uniqueItems = new Set(state.cloudFarm.inventory.map(item => item.id));
      if (uniqueItems.size >= 20) {
        commit('UNLOCK_ACHIEVEMENT', 'collector');
      }
    }
  }
};