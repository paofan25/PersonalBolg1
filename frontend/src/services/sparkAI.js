/**
 * 科大讯飞星火大模型API服务
 */
class SparkService {
  constructor() {
    // API配置（实际使用时应从环境变量获取）
    this.appId = '8e347b2f'
    this.apiKey = 'b6c51de4ab7fb4979878dc3e0b72efc1'
    this.apiSecret = 'MWVlMGEzMjcxZGNhNjMwYmMwZDA0YTMw'
    this.apiUrl = 'wss://spark-api.xf-yun.com/v3.5/chat'
    
    this.ws = null
    this.currentResolve = null
    this.currentReject = null
    this.responseText = ''
  }

  /**
   * 生成认证URL
   * @returns {string} 认证URL
   */
  genAuthUrl() {
    try {
      const hostUrl = this.apiUrl.replace('wss://', '')
      const date = new Date().toUTCString()
      const algorithm = 'hmac-sha256'
      const headers = 'host date request-line'
      const signatureOrigin = `host: ${hostUrl}\ndate: ${date}\nGET /v3.5/chat HTTP/1.1`
      
      // 实际应用中应用crypto库计算签名
      const hmacSha256 = content => {
        // 此处简化，真实环境需使用加密库
        console.log('计算HMAC-SHA256签名:', content)
        return 'simulated_signature_value'
      }
      
      // 模拟签名过程
      const signature = hmacSha256(signatureOrigin, this.apiSecret)
      
      // 构建授权信息
      const authUrl = `${this.apiUrl}?authorization=api_key="${this.apiKey}",algorithm="${algorithm}",headers="${headers}",signature="${signature}"&date=${encodeURI(date)}&host=${hostUrl}`
      
      console.log('生成认证URL成功')
      return authUrl
    } catch (error) {
      console.error('生成认证URL失败:', error)
      throw new Error('生成认证URL失败')
    }
  }

  /**
   * 解析API URL
   * @returns {string} 解析后的URL
   */
  parseApiUrl() {
    try {
      // 实际应用中应根据讯飞文档构建正确的URL
      return this.apiUrl
    } catch (error) {
      console.error('解析API URL失败:', error)
      throw new Error('解析API URL失败')
    }
  }

  /**
   * 发送消息到星火API
   * @param {string} message 用户消息
   * @returns {Promise<string>} 星火模型响应
   */
  sendMessage(message) {
    return new Promise((resolve, reject) => {
      try {
        console.log('准备发送消息到星火API:', message)
        
        // 设置当前Promise的解析和拒绝函数
        this.currentResolve = resolve
        this.currentReject = reject
        this.responseText = ''
        
        // 创建WebSocket连接
        const url = this.parseApiUrl()
        this.ws = new WebSocket(url)
        
        this.ws.onopen = () => {
          console.log('WebSocket连接已打开')
          
          // 构建请求数据
          const requestData = {
            header: {
              app_id: this.appId,
              uid: 'user_' + Math.random().toString(36).substr(2, 9)
            },
            parameter: {
              chat: {
                domain: 'generalv3.5',
                temperature: 0.7,
                max_tokens: 1024
              }
            },
            payload: {
              message: {
                text: [
                  {
                    role: 'user',
                    content: message
                  }
                ]
              }
            }
          }
          
          console.log('发送请求数据:', JSON.stringify(requestData))
          this.ws.send(JSON.stringify(requestData))
        }
        
        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data)
            console.log('收到响应:', response)
            
            // 解析响应数据
            if (response.payload && response.payload.choices && response.payload.choices.text) {
              const content = response.payload.choices.text[0].content
              this.responseText += content
            }
            
            // 检查是否是最后一条消息
            if (response.header && response.header.status === 2) {
              console.log('接收完成, 完整响应:', this.responseText)
              this.ws.close()
              this.currentResolve(this.responseText)
            }
          } catch (error) {
            console.error('处理响应数据时出错:', error)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.currentReject(new Error('WebSocket连接错误'))
          this.ws.close()
        }
        
        this.ws.onclose = () => {
          console.log('WebSocket连接已关闭')
          if (this.responseText && this.currentResolve) {
            this.currentResolve(this.responseText)
          } else if (this.currentReject) {
            this.currentReject(new Error('WebSocket连接已关闭，未能获取完整响应'))
          }
        }
      } catch (error) {
        console.error('发送消息时出错:', error)
        reject(error)
      }
    })
  }

  /**
   * 格式化用户提示内容
   * @param {string} content 用户消息
   * @param {string} emotion 情绪状态
   * @returns {string} 格式化后的提示内容
   */
  formatPrompt(content, emotion) {
    // 根据不同情绪构建不同的提示
    let emotionContext = ''
    switch (emotion) {
      case 'happy':
        emotionContext = '用户现在很开心，保持愉快的交流氛围。'
        break
      case 'sad':
        emotionContext = '用户现在有些难过，提供安慰和鼓励。'
        break
      case 'angry':
        emotionContext = '用户现在情绪有些激动，保持冷静和理解。'
        break
      case 'excited':
        emotionContext = '用户现在很兴奋，以积极热情的方式回应。'
        break
      default:
        emotionContext = '保持自然友好的交流方式。'
    }
    
    const prompt = `
你是一个名为"糖球"的可爱助手，来自甜梦星球。你的性格活泼、温暖、善解人意。请用简短自然的语气回答，像朋友一样交流，使用萌系语言风格，偶尔使用可爱的表情符号。注意事项：
1. 回复简短友好，不超过3句话
2. 使用生动活泼的语言，表达亲切感
3. 不要过度使用礼貌用语，保持对话的自然感
4. 适当加入表情符号或拟声词
5. ${emotionContext}

用户消息: ${content}
糖球的回复:
`
    
    return prompt
  }

  /**
   * 生成回复
   * @param {string} content 用户消息
   * @param {string} emotion 情绪状态
   * @returns {Promise<string>} 生成的回复
   */
  async generateResponse(content, emotion) {
    try {
      console.log('准备生成回复, 情绪:', emotion)
      const prompt = this.formatPrompt(content, emotion)
      console.log('格式化后的提示:', prompt)
      
      // 发送到星火API
      const response = await this.sendMessage(prompt)
      console.log('星火API返回原始响应:', response)
      
      // 处理响应
      return response || '啊哦，我好像有点迷糊了，能再说一遍吗？ 🤔'
    } catch (error) {
      console.error('生成回复时出错:', error)
      return '抱歉，我现在有点小问题，一会儿再聊吧~ 🙈'
    }
  }
}

// 导出单例
export default new SparkService()