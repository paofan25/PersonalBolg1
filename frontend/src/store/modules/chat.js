/**
 * 聊天功能Vuex模块
 */
import SparkService from '@/services/sparkAI'

// 初始状态
const state = {
  messages: [],
  isTyping: false,
  currentEmotion: 'neutral',
  weatherInfo: null,
  soundEnabled: true
}

// Getter函数
const getters = {
  messages: state => state.messages,
  isTyping: state => state.isTyping,
  currentEmotion: state => state.currentEmotion,
  weatherInfo: state => state.weatherInfo,
  soundEnabled: state => state.soundEnabled
}

// 修改状态的函数
const mutations = {
  // 添加新消息
  ADD_MESSAGE(state, message) {
    state.messages.push(message)
  },
  
  // 设置输入状态
  SET_TYPING(state, isTyping) {
    state.isTyping = isTyping
  },
  
  // 更改情绪
  CHANGE_EMOTION(state, emotion) {
    state.currentEmotion = emotion
  },
  
  // 设置天气信息
  SET_WEATHER_INFO(state, weatherInfo) {
    state.weatherInfo = weatherInfo
  },
  
  // 切换声音效果
  TOGGLE_SOUND(state) {
    state.soundEnabled = !state.soundEnabled
  },
  
  // 清空消息记录
  CLEAR_MESSAGES(state) {
    state.messages = []
  }
}

// 异步操作
const actions = {
  /**
   * 发送用户消息并获取回复
   * @param {Object} context Vuex上下文
   * @param {string} content 用户消息内容
   */
  async sendMessage({ commit, state }, content) {
    try {
      // 添加用户消息
      commit('ADD_MESSAGE', {
        id: Date.now(),
        sender: 'user',
        content,
        timestamp: new Date().toISOString()
      })
      
      // 设置输入状态
      commit('SET_TYPING', true)
      
      // 分析情绪
      const emotion = analyzeEmotion(content)
      commit('CHANGE_EMOTION', emotion)
      
      // 检查是否询问天气
      const isWeatherQuery = checkWeatherQuery(content)
      if (isWeatherQuery) {
        try {
          const weatherData = await getWeatherInfo()
          commit('SET_WEATHER_INFO', weatherData)
        } catch (error) {
          console.error('获取天气信息失败', error)
        }
      }
      
      let response = ''
      
      // 尝试从星火API获取回复
      try {
        response = await SparkService.generateResponse(content, emotion)
      } catch (error) {
        console.error('星火API调用失败，使用本地回复', error)
        // 如果API调用失败，使用本地生成的回复
        response = generateResponse(content, emotion)
      }
      
      // 添加助手回复
      setTimeout(() => {
        commit('ADD_MESSAGE', {
          id: Date.now(),
          sender: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
          emotion: state.currentEmotion
        })
        
        // 取消输入状态
        commit('SET_TYPING', false)
      }, 1000)
    } catch (error) {
      console.error('处理消息时出错', error)
      commit('SET_TYPING', false)
    }
  },
  
  /**
   * 清空聊天记录
   */
  clearChat({ commit }) {
    commit('CLEAR_MESSAGES')
  }
}

/**
 * 分析消息中的情绪
 * @param {string} message 用户消息
 * @returns {string} 情绪类型
 */
function analyzeEmotion(message) {
  // 关键词匹配
  const happyKeywords = ['开心', '高兴', '快乐', '好', '棒', '喜欢', '爱', '哈哈']
  const sadKeywords = ['难过', '伤心', '悲伤', '哭', '痛苦', '不开心', '失望']
  const angryKeywords = ['生气', '愤怒', '烦', '讨厌', '恨', '滚', '不爽']
  const excitedKeywords = ['激动', '兴奋', '期待', '太好了', '太棒了', '太厉害了', '不得了']
  
  // 检查关键词
  for (const keyword of happyKeywords) {
    if (message.includes(keyword)) return 'happy'
  }
  
  for (const keyword of sadKeywords) {
    if (message.includes(keyword)) return 'sad'
  }
  
  for (const keyword of angryKeywords) {
    if (message.includes(keyword)) return 'angry'
  }
  
  for (const keyword of excitedKeywords) {
    if (message.includes(keyword)) return 'excited'
  }
  
  return 'neutral'
}

/**
 * 检查是否询问天气
 * @param {string} message 用户消息
 * @returns {boolean} 是否是天气查询
 */
function checkWeatherQuery(message) {
  const weatherKeywords = ['天气', '下雨', '晴天', '阴天', '温度', '多少度', '冷', '热']
  return weatherKeywords.some(keyword => message.includes(keyword))
}

/**
 * 获取天气信息(模拟)
 * @returns {Promise<Object>} 天气数据
 */
function getWeatherInfo() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟天气数据
      const weatherTypes = ['晴朗', '多云', '阴天', '小雨', '中雨', '大雨', '雷阵雨', '小雪', '中雪', '大雪']
      const randomType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]
      const randomTemp = Math.floor(Math.random() * 35) + 5 // 5-40度
      
      resolve({
        type: randomType,
        temperature: randomTemp,
        humidity: Math.floor(Math.random() * 60) + 40, // 40-100%
        windSpeed: Math.floor(Math.random() * 10) + 1, // 1-10级
        updated: new Date().toISOString(),
        description: `今天${randomType}，气温${randomTemp}℃`
      })
    }, 500)
  })
}

/**
 * 生成回复(本地)
 * @param {string} message 用户消息
 * @param {string} emotion 情绪状态
 * @returns {string} 生成的回复
 */
function generateResponse(message, emotion) {
  // 根据不同情绪和关键词生成不同回复
  if (checkWeatherQuery(message)) {
    return '我看了看窗外呢，今天天气不错哦！阳光明媚的，适合出去玩耍呢~ 🌞'
  }
  
  if (message.includes('你好') || message.includes('嗨') || message.includes('hi') || message.includes('hello')) {
    return '你好呀！今天过得怎么样呢？我是糖球，很高兴能和你聊天哦~ 😊'
  }
  
  if (message.includes('名字') || message.includes('谁')) {
    return '我是糖球呀！来自甜梦星球的小助手，很高兴认识你哦~ 🌈✨'
  }
  
  if (message.includes('谢谢') || message.includes('感谢')) {
    return '不客气呀！能帮到你我很开心呢~ 🥰'
  }
  
  // 根据情绪生成回复
  switch (emotion) {
    case 'happy':
      return '看到你这么开心，我也跟着高兴起来了呢！继续保持这样的好心情吧~ 😊✨'
    case 'sad':
      return '别难过啦，糖球在这里陪着你呢。要来一个温暖的抱抱吗？🤗💕'
    case 'angry':
      return '深呼吸，慢慢来~糖球陪你一起度过这个不开心的时刻哦。要不要听点轻松的音乐？🎵'
    case 'excited':
      return '哇！你好兴奋呀！发生了什么好事情吗？真为你感到高兴呢~ 🎉✨'
    default:
      return '嗯嗯，我在听呢~有什么想跟糖球分享的吗？ 😊'
  }
}

// 导出模块
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}