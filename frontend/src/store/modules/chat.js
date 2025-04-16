import weather from '@/services/weather';
import chat from '@/services/chat';

const state = {
  messages: [],
  isTyping: false,
  currentEmotion: 'neutral',
  weatherInfo: null,
  soundEnabled: true,
  lastWeatherQuery: null
};

const getters = {
  getAllMessages: state => state.messages,
  getIsTyping: state => state.isTyping,
  getCurrentEmotion: state => state.currentEmotion,
  getWeatherInfo: state => state.weatherInfo,
  getSoundEnabled: state => state.soundEnabled,
  getLastWeatherQuery: state => state.lastWeatherQuery
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
    if (info) {
      state.lastWeatherQuery = {
        cityName: info.cityName,
        timestamp: Date.now()
      };
    }
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
      const emotion = await chat.analyzeEmotion(text);
      commit('SET_EMOTION', emotion);

      // 生成回复
      const response = await chat.generateResponse(text, emotion);

      // 如果是天气查询，更新天气信息
      if (response.type === 'weather' && response.data) {
        commit('SET_WEATHER_INFO', response.data);
      }

      // 添加助手回复
      commit('ADD_MESSAGE', {
        type: 'assistant',
        ...response
      });

    } catch (error) {
      console.error('发送消息失败:', error);
      commit('ADD_MESSAGE', {
        type: 'error',
        text: '抱歉，我现在有点累了，待会再聊吧~ 😴'
      });
    } finally {
      commit('SET_TYPING', false);
    }
  },

  async initializeWeather({ commit }) {
    try {
      console.log('初始化天气信息');
      const weatherData = await weather.getLocationWeather();
      if (weatherData) {
        commit('SET_WEATHER_INFO', weatherData);
        // 添加欢迎消息和天气信息
        commit('ADD_MESSAGE', {
          type: 'assistant',
          text: `欢迎回来！让我告诉你${weatherData.cityName}的天气情况~`,
        });
        commit('ADD_MESSAGE', {
          type: 'weather',
          text: weather.generateWeatherDescription(weatherData),
          data: weatherData
        });
      }
    } catch (error) {
      console.error('初始化天气失败:', error);
    }
  },

  clearChat({ commit }) {
    commit('CLEAR_MESSAGES');
    commit('SET_WEATHER_INFO', null);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};