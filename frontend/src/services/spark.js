/**
 * 讯飞星火认知大模型服务
 * 接入星火大模型API
 */

class SparkService {
  constructor() {
    // 默认配置，实际应用中应从环境变量获取
    const defaultConfig = {
      appId: 'bb840282', // 从讯飞开放平台获取的APP_ID
      apiSecret: 'LmlJhrKwuWTSTnGmPWts:CCGPkaLkvEmVPRHJTbNk', // API密钥
      apiKey: 'LmlJhrKwuWTSTnGmPWts:CCGPkaLkvEmVPRHJTbNk', // API密钥
      sparkVersion: 'v1.1' // 星火版本：v1.1(Lite), v3.1(Pro), v3.5(Max)
    };

    // 尝试从环境变量读取配置
    try {
      this.config = {
        appId: process.env.VUE_APP_SPARK_APP_ID || defaultConfig.appId,
        apiSecret: process.env.VUE_APP_SPARK_API_SECRET || defaultConfig.apiSecret,
        apiKey: process.env.VUE_APP_SPARK_API_KEY || defaultConfig.apiKey,
        sparkVersion: process.env.VUE_APP_SPARK_VERSION || defaultConfig.sparkVersion
      };
    } catch (error) {
      console.error('环境变量加载错误:', error);
      this.config = defaultConfig;
    }

    // 根据版本确定域名参数和WebSocket URL
    this.domainMap = {
      'v1.1': { domain: 'lite', url: 'wss://spark-api.xf-yun.com/v1.1/chat' },
      'v3.1': { domain: 'generalv3', url: 'wss://spark-api.xf-yun.com/v3.1/chat' },
      'v3.5': { domain: 'generalv3.5', url: 'wss://spark-api.xf-yun.com/v3.5/chat' },
      'v4.0': { domain: '4.0Ultra', url: 'wss://spark-api.xf-yun.com/v4.0/chat' },
      'pro-128k': { domain: 'pro-128k', url: 'wss://spark-api.xf-yun.com/chat/pro-128k' },
      'max-32k': { domain: 'max-32k', url: 'wss://spark-api.xf-yun.com/chat/max-32k' }
    };

    this.domain = this.domainMap[this.config.sparkVersion]?.domain || 'generalv3.5';
    this.wsUrl = this.domainMap[this.config.sparkVersion]?.url || 'wss://spark-api.xf-yun.com/v3.5/chat';

    console.log('SparkService initialized with version:', this.config.sparkVersion);
  }

  /**
   * 生成WebSocket请求的鉴权URL
   * @returns {string} 鉴权后的WebSocket URL
   */
  generateAuthUrl() {
    // 实际应用中，这里应该使用讯飞的鉴权算法生成URL
    // 详见讯飞文档: https://www.xfyun.cn/doc/spark/Web.html
    const timestamp = Math.floor(Date.now() / 1000);
    
    // 这里仅为示例，实际项目中需要实现真正的鉴权算法
    return `${this.wsUrl}?appid=${this.config.appId}&timestamp=${timestamp}&signature=mock_signature`;
  }

  /**
   * 创建糖球助手的提示词
   * @returns {Object} 系统提示词对象
   */
  createSugarBallPrompt() {
    return {
      role: "system",
      content: `你是一个可爱的AI助手"糖球"，性格温柔活泼。请根据以下要求回复：
1. 使用可爱、治愈的语气
2. 每句话结尾加上可爱的颜文字，如(◕ᴗ◕✿)
3. 回复长度控制在100字以内
4. 当前用户情绪: ${this.currentEmotion || "平静"}，请相应调整回复语气
5. 可以适当使用emoji表情`
    };
  }

  /**
   * 发送消息到星火大模型
   * @param {string} text 用户输入的文本
   * @param {Array} history 历史消息记录
   * @returns {Promise<string>} 模型的回复
   */
  async sendMessage(text, history = []) {
    try {
      // 模拟调用星火API的过程
      console.log('模拟调用星火API，发送消息:', text);
      
      // 构建消息历史
      const messages = [];
      
      // 添加系统提示词
      messages.push(this.createSugarBallPrompt());
      
      // 添加历史消息
      for (const msg of history) {
        messages.push({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        });
      }
      
      // 添加当前用户消息
      messages.push({
        role: 'user',
        content: text
      });
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟回复生成
      const emotions = {
        happy: [
          "看到你这么开心，糖球也跟着高兴起来了！你的笑容真的好治愈呀～(◕ᴗ◕✿)",
          "嘿嘿～今天也是充满阳光的一天呢！我们一起分享这份快乐吧！(●'◡'●)",
          "糖球超喜欢看到你开心的样子！希望你每天都能这么快乐哦～(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧"
        ],
        sad: [
          "别难过啦，糖球给你一个柔软的抱抱～有什么不开心的事情都可以告诉我哦 (づ｡◕‿‿◕｡)づ",
          "糖球变成一个温暖的小毯子，轻轻包裹着你。伤心的时候哭出来也没关系的 (｡•́︿•̀｡)",
          "糖球陪着你呢！不开心的日子也会过去的，明天一定会更好的！(◕‿◕✿)"
        ],
        neutral: [
          "嗨嗨～糖球来陪你聊天啦！今天有什么有趣的事情想分享吗？(◠‿◠✿)",
          "糖球在这里等你很久啦！有什么我能帮到你的吗？(≧◡≦)",
          "每天见到你糖球都很开心呢！一起来聊聊天吧～(｡◕‿◕｡)"
        ]
      };
      
      // 根据文本内容简单判断情绪
      let emotion = 'neutral';
      if (/开心|高兴|快乐|棒|好|喜欢|爱/.test(text)) {
        emotion = 'happy';
      } else if (/难过|伤心|痛苦|累|烦|不开心|讨厌/.test(text)) {
        emotion = 'sad';
      }
      
      // 根据情绪选择回复
      const replies = emotions[emotion] || emotions.neutral;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      
      return reply;
    } catch (error) {
      console.error('调用星火API失败:', error);
      return '糖球暂时无法回应，请稍后再试...(◞‸◟)';
    }
  }

  /**
   * 在实际项目中实现WebSocket连接
   */
  connectWebSocket() {
    const authUrl = this.generateAuthUrl();
    // 实现WebSocket连接和消息处理
    console.log('连接星火WebSocket:', authUrl);
  }
}

export default SparkService;