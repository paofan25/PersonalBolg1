import CryptoJS from 'crypto-js';

class XfyunService {
  constructor() {
    // 检查环境变量
    if (typeof import.meta.env === 'undefined') {
      console.error('环境变量未正确加载');
    }

    // 使用环境变量
    this.appid = import.meta.env?.VITE_APP_XFYUN_APPID;
    this.apiKey = import.meta.env?.VITE_APP_XFYUN_API_KEY;
    this.apiSecret = import.meta.env?.VITE_APP_XFYUN_API_SECRET;

    if (!this.appid || !this.apiKey || !this.apiSecret) {
      console.error('讯飞服务配置缺失，使用默认值');
      // 使用默认值作为后备
      this.appid = 'bb840282';
      this.apiKey = '178baf6c846eaeb5ea632cdab055b9cd';
      this.apiSecret = 'YjMzMmE3NzczOWExZjQ3ZWI1NWY3OWJi';
    }

    console.log('XfyunService initialized with:', {
      appid: this.appid,
      apiKey: this.apiKey?.substring(0, 10) + '...',
      hasSecret: !!this.apiSecret
    });

    // 使用 Spark Lite 版本
    this.domain = 'lite';
    this.url = 'wss://spark-api.xf-yun.com/v1.1/chat';
  }

  // 生成鉴权url
  getAuthUrl() {
    const host = 'spark-api.xf-yun.com/v1.1/chat';
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);
    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = btoa(authorizationOrigin);
    return `${this.url}?authorization=${authorization}&date=${date}&host=${host}`;
  }

  // 建立WebSocket连接
  createWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getAuthUrl();
        console.log('Creating WebSocket connection...');
        const ws = new WebSocket(url);
        
        ws.onopen = () => {
          console.log('WebSocket连接已建立');
          resolve(ws);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket连接错误:', error);
          reject(error);
        };

        ws.onclose = (event) => {
          console.log('WebSocket连接关闭:', event);
        };
      } catch (error) {
        console.error('创建WebSocket失败:', error);
        reject(error);
      }
    });
  }

  // 发送消息并获取回复
  async chat(messages) {
    try {
      console.log('Starting chat with messages:', messages);
      const ws = await this.createWebSocket();
      
      return new Promise((resolve, reject) => {
        let responseText = '';
        
        ws.onmessage = (event) => {
          try {
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
              ws.close();
              resolve(responseText);
            }
          } catch (error) {
            console.error('处理消息失败:', error);
            ws.close();
            reject(error);
          }
        };
        
        const data = {
          header: {
            app_id: this.appid,
            uid: '12345'
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
              text: messages
            }
          }
        };
        
        console.log('Sending data:', data);
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
      
      const response = await this.chat([{ role: 'user', content: prompt }]);
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