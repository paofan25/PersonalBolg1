import CryptoJS from 'crypto-js';

// 配置信息
const CONFIG = {
  appid: 'bb840282',
  apiKey: '178baf6c846eaeb5ea632cdab055b9cd',
  apiSecret: 'YjMzMmE3NzczOWExZjQ3ZWI1NWY3OWJi',
  domain: 'lite',
  url: 'wss://spark-api.xf-yun.com/v1.1/chat'
};

class XfyunService {
  constructor() {
    // 尝试从环境变量获取配置
    this.appid = process.env.VUE_APP_XFYUN_APPID || CONFIG.appid;
    this.apiKey = process.env.VUE_APP_XFYUN_API_KEY || CONFIG.apiKey;
    this.apiSecret = process.env.VUE_APP_XFYUN_API_SECRET || CONFIG.apiSecret;
    this.domain = CONFIG.domain;
    this.url = CONFIG.url;

    console.log('XfyunService initialized with:', {
      appid: this.appid,
      apiKey: this.apiKey?.substring(0, 10) + '...',
      hasSecret: !!this.apiSecret
    });
  }

  // 生成鉴权url
  getAuthUrl() {
    try {
      const host = 'spark-api.xf-yun.com/v1.1/chat';
      const date = new Date().toUTCString();
      const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
      const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret);
      const signature = CryptoJS.enc.Base64.stringify(signatureSha);
      const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
      const authorization = btoa(authorizationOrigin);
      return `${this.url}?authorization=${authorization}&date=${date}&host=${host}`;
    } catch (error) {
      console.error('生成鉴权URL失败:', error);
      throw new Error('生成鉴权URL失败');
    }
  }

  // 建立WebSocket连接
  createWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getAuthUrl();
        console.log('Creating WebSocket connection...');
        const ws = new WebSocket(url);
        
        let connectionTimeout = setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket连接超时'));
        }, 10000);
        
        ws.onopen = () => {
          console.log('WebSocket连接已建立');
          clearTimeout(connectionTimeout);
          resolve(ws);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket连接错误:', error);
          clearTimeout(connectionTimeout);
          reject(new Error('WebSocket连接失败'));
        };

        ws.onclose = (event) => {
          console.log('WebSocket连接关闭:', event);
          clearTimeout(connectionTimeout);
        };
      } catch (error) {
        console.error('创建WebSocket失败:', error);
        reject(new Error('创建WebSocket失败'));
      }
    });
  }

  // 发送消息并获取回复
  async sendMessage(text) {
    try {
      console.log('Sending message:', text);
      const messages = [{ role: 'user', content: text }];
      return await this.chat(messages);
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  // 聊天核心方法
  async chat(messages) {
    try {
      console.log('Starting chat with messages:', messages);
      const ws = await this.createWebSocket();
      
      return new Promise((resolve, reject) => {
        let responseText = '';
        let messageTimeout;
        
        const resetMessageTimeout = () => {
          clearTimeout(messageTimeout);
          messageTimeout = setTimeout(() => {
            ws.close();
            reject(new Error('消息接收超时'));
          }, 30000);
        };
        
        ws.onmessage = (event) => {
          try {
            resetMessageTimeout();
            const response = JSON.parse(event.data);
            console.log('Received message:', response);
            
            if (response.header.code !== 0) {
              console.error('请求错误:', response.header.message);
              ws.close();
              reject(new Error(response.header.message));
              return;
            }
            
            const payload = response.payload;
            const choices = payload.choices;
            const status = choices.status;
            const text = choices.text?.[0]?.content || '';
            
            responseText += text;
            
            if (status === 2) {
              console.log('Chat completed:', responseText);
              clearTimeout(messageTimeout);
              ws.close();
              resolve(responseText);
            }
          } catch (error) {
            console.error('处理消息失败:', error);
            clearTimeout(messageTimeout);
            ws.close();
            reject(new Error('处理消息失败'));
          }
        };
        
        const data = {
          header: {
            app_id: this.appid,
            uid: 'user_' + Date.now()
          },
          parameter: {
            chat: {
              domain: this.domain,
              temperature: 0.5,
              max_tokens: 2048
            }
          },
          payload: {
            message: {
              text: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            }
          }
        };
        
        console.log('Sending data:', data);
        resetMessageTimeout();
        ws.send(JSON.stringify(data));
      });
    } catch (error) {
      console.error('聊天请求失败:', error);
      throw error;
    }
  }

  // 分析情绪
  async analyzeEmotion(text) {
    try {
      console.log('Analyzing emotion for text:', text);
      const prompt = `请分析以下文本的情绪，只返回以下情绪类型之一：happy（开心）、sad（伤心）、worried（担忧）、excited（兴奋）、neutral（平静）。
文本：${text}
情绪：`;
      
      const response = await this.sendMessage(prompt);
      const emotion = response.toLowerCase().trim();
      
      console.log('Emotion analysis result:', emotion);
      
      if (['happy', 'sad', 'worried', 'excited', 'neutral'].includes(emotion)) {
        return emotion;
      }
      return 'neutral';
    } catch (error) {
      console.error('情绪分析失败:', error);
      return 'neutral';
    }
  }
}

// 创建单例实例
const xfyunService = new XfyunService();
console.log('XfyunService instance created');

export default xfyunService;