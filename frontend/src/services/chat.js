import weatherService from './weather';
import xfyunService from './xfyun';

class ChatService {
  constructor() {
    this.messages = [];
  }

  // 分析用户输入的情绪
  async analyzeEmotion(text) {
    try {
      console.log('开始分析情绪:', text);
      
      // 使用讯飞API进行情绪分析
      const prompt = `请分析以下文本的情绪，只返回一个词："happy"、"sad"、"worried"、"excited"或"neutral"，不要返回其他内容。\n文本：${text}`;
      const response = await xfyunService.sendMessage(prompt);
      console.log('情绪分析结果:', response);
      
      const emotion = response.trim().toLowerCase();
      
      // 确保返回的是有效的情绪类型
      const validEmotions = ['happy', 'sad', 'worried', 'excited', 'neutral'];
      return validEmotions.includes(emotion) ? emotion : 'neutral';
    } catch (error) {
      console.error('情绪分析失败:', error);
      return 'neutral';
    }
  }

  // 生成回复
  async generateResponse(text, emotion) {
    try {
      console.log('开始生成回复:', { text, emotion });
      
      // 检查是否是天气相关询问
      if (this.isWeatherQuery(text)) {
        const weather = await weatherService.getNowWeather('auto_ip');
        if (weather) {
          return {
            text: weatherService.generateWeatherDescription(weather),
            weather,
            actions: []
          };
        }
      }

      // 使用讯飞API生成回复
      const prompt = `你是一个可爱的AI助手"糖球"，性格温柔活泼。请根据以下要求回复：
1. 使用可爱、治愈的语气
2. 每句话结尾加上可爱的颜文字，如(◕‿◕✿)
3. 回复长度控制在100字以内
4. 当前用户情绪：${emotion}，请相应调整回复语气
5. 可以适当使用emoji表情

用户说：${text}`;

      console.log('发送到讯飞的提示词:', prompt);
      const response = await xfyunService.sendMessage(prompt);
      console.log('讯飞返回的回复:', response);

      // 根据情绪添加互动动作
      const actions = this.generateActions(emotion);

      return {
        text: response,
        actions
      };
    } catch (error) {
      console.error('生成回复失败:', error);
      return {
        text: '啊哦，我好像遇到了一点小问题... (｡•́︿•̀｡)',
        actions: []
      };
    }
  }

  // 检查是否是天气相关询问
  isWeatherQuery(text) {
    const weatherKeywords = ['天气', '下雨', '温度', '冷', '热', '气温', '预报'];
    return weatherKeywords.some(keyword => text.includes(keyword));
  }

  // 根据情绪生成互动动作
  generateActions(emotion) {
    const actions = [];

    switch (emotion) {
      case 'happy':
        actions.push(
          { type: 'animation', name: 'bounce' },
          { type: 'sound', sound: 'purr' }
        );
        break;
      case 'sad':
        actions.push(
          { type: 'sound', sound: 'rain' },
          { type: 'animation', name: 'float' }
        );
        break;
      case 'worried':
        actions.push(
          { type: 'animation', name: 'wave' },
          { type: 'sound', sound: 'music' }
        );
        break;
      case 'excited':
        actions.push(
          { type: 'animation', name: 'spin' },
          { type: 'sound', sound: 'purr' }
        );
        break;
      case 'neutral':
        actions.push(
          { type: 'animation', name: 'float' }
        );
        break;
    }

    return actions;
  }
}

export default new ChatService();