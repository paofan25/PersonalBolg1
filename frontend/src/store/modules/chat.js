import xfyun from '@/services/xfyun';
import weather from '@/services/weather';

const state = {
  messages: [],
  isTyping: false,
  currentEmotion: 'neutral',
  weatherInfo: null,
  soundEnabled: true
};

const getters = {
  getAllMessages: state => state.messages,
  getIsTyping: state => state.isTyping,
  getCurrentEmotion: state => state.currentEmotion,
  getWeatherInfo: state => state.weatherInfo,
  getSoundEnabled: state => state.soundEnabled
};

const mutations = {
  ADD_MESSAGE(state, message) {
    state.messages.push({
      id: Date.now(),
      timestamp: new Date(),
      ...message
    });
  },
  SET_TYPING(state, status) {
    state.isTyping = status;
  },
  SET_EMOTION(state, emotion) {
    state.currentEmotion = emotion;
  },
  SET_WEATHER_INFO(state, info) {
    state.weatherInfo = info;
  },
  TOGGLE_SOUND(state) {
    state.soundEnabled = !state.soundEnabled;
  },
  CLEAR_MESSAGES(state) {
    state.messages = [];
  }
};

const actions = {
  async sendMessage({ commit }, text) {
    // 添加用户消息
    commit('ADD_MESSAGE', {
      type: 'user',
      text
    });

    // 设置正在输入状态
    commit('SET_TYPING', true);

    try {
      // 分析情绪
      const emotion = await xfyun.analyzeEmotion(text);
      commit('SET_EMOTION', emotion);

      // 检查是否是天气相关问题
      const weatherKeywords = ['天气', '下雨', '温度', '气温', '热', '冷'];
      const isWeatherQuestion = weatherKeywords.some(keyword => text.includes(keyword));

      let response;
      let weatherInfo = null;

      if (isWeatherQuestion) {
        // 获取天气信息
        weatherInfo = await weather.getNowWeather();
        const weatherDescription = weather.generateWeatherDescription(weatherInfo);
        response = weatherDescription;
      } else {
        // 使用讯飞服务获取回复
        response = await xfyun.chat([
          { role: 'system', content: '你是一个可爱的AI助手糖球，性格活泼开朗，说话方式可爱温暖。你会用emoji表情，会关心用户的情绪状态。' },
          { role: 'user', content: text }
        ]);
      }

      // 添加助手回复
      commit('ADD_MESSAGE', {
        type: 'assistant',
        text: response,
        weather: weatherInfo,
        actions: generateActions(text, emotion)
      });

    } catch (error) {
      console.error('发送消息失败:', error);
      commit('ADD_MESSAGE', {
        type: 'assistant',
        text: '抱歉，我现在有点累了，待会再聊吧~ 😴'
      });
    } finally {
      commit('SET_TYPING', false);
    }
  },

  clearChat({ commit }) {
    commit('CLEAR_MESSAGES');
  }
};

// 根据用户输入和情绪生成互动动作
function generateActions(text, emotion) {
  const actions = [];

  // 根据情绪添加安抚动作
  if (emotion === 'sad' || emotion === 'worried') {
    actions.push({ type: 'sound', sound: 'purr' });
    actions.push({ type: 'animation', name: 'bounce' });
  }

  // 根据关键词添加特定动作
  if (text.includes('跳舞')) {
    actions.push({ type: 'animation', name: 'bounce' });
  }
  if (text.includes('音乐') || text.includes('听歌')) {
    actions.push({ type: 'sound', sound: 'music' });
  }
  if (text.includes('下雨')) {
    actions.push({ type: 'sound', sound: 'rain' });
  }

  return actions.length > 0 ? actions : null;
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};