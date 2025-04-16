<template>
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header sweet-card">
      <div class="assistant-info">
        <div class="assistant-avatar" :class="currentEmotion" ref="assistantAvatar">
          <div class="mochi-body">
            <div class="mochi-face">
              <div class="eyes">
                <div class="eye"></div>
                <div class="eye"></div>
              </div>
              <div class="mouth" :class="currentEmotion"></div>
            </div>
          </div>
        </div>
        <div class="assistant-status">
          <h2>糖球助手</h2>
          <p class="status" v-if="isTyping">正在输入中...</p>
          <p class="status" v-else>在线</p>
        </div>
      </div>
    </div>

    <!-- 聊天内容区 -->
    <div class="chat-messages" ref="messageContainer">
      <div v-for="(message, index) in messages" 
           :key="index" 
           class="message-wrapper"
           :class="message.type">
        <div class="message sweet-card">
          <!-- 用户消息 -->
          <template v-if="message.type === 'user'">
            <div class="message-content">{{ message.text }}</div>
            <div class="message-time">{{ formatTime(message.timestamp || new Date()) }}</div>
          </template>
          
          <!-- 助手消息 -->
          <template v-else>
            <div class="message-content">
              <div class="text">{{ message.text }}</div>
              
              <!-- 天气信息卡片 -->
              <div v-if="message.weather" class="weather-card">
                <div class="weather-icon" :class="message.weather.condition"></div>
                <div class="weather-info">
                  <div class="temperature">{{ message.weather.temperature }}°C</div>
                  <div class="description">{{ message.weather.description }}</div>
                </div>
              </div>
            </div>
            
            <!-- 动作按钮 -->
            <div v-if="message.actions" class="message-actions">
              <button v-for="(action, index) in message.actions"
                      :key="index"
                      class="action-btn"
                      @click="handleAction(action)">
                {{ getActionLabel(action) }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input sweet-card">
      <textarea v-model="inputText"
                @keyup.enter.exact="sendMessage"
                placeholder="和糖球说说话吧..."
                :disabled="isTyping"
                ref="inputArea"></textarea>
      <div class="input-actions">
        <div class="emoji-picker-wrapper">
          <button class="emoji-btn" @click="emojiPickerVisible = !emojiPickerVisible">
            <span class="emoji-icon">😊</span>
          </button>
          <!-- 表情选择器组件占位符 -->
        </div>
        <button class="send-btn"
                :disabled="!inputText.trim() || isTyping"
                @click="sendMessage">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ChatAssistant',
  components: {
    // 暂时移除表情选择器组件
  },
  setup() {
    const store = useStore();
    const inputText = ref('');
    const emojiPickerVisible = ref(false);
    const messageContainer = ref(null);
    const assistantAvatar = ref(null);
    const inputArea = ref(null);
    
    // Vuex 状态
    const messages = computed(() => store.getters['chat/messages']);
    const isTyping = computed(() => store.getters['chat/isTyping']);
    const currentEmotion = computed(() => store.getters['chat/currentEmotion']);

    // 发送欢迎消息
    onMounted(() => {
      console.log('[ChatView] 组件挂载，当前消息列表:', messages.value);
      // 仅当没有消息时添加欢迎消息
      if (messages.value.length === 0) {
        console.log('[ChatView] 发送欢迎消息');
        store.commit('chat/addMessage', {
          text: '你好呀！我是糖球助手，有什么可以帮到你的吗？可以问我天气哦~ 😊',
          type: 'assistant',
          timestamp: new Date()
        });
      }
      scrollToBottom();
    });
    
    // 发送消息方法
    const sendMessage = () => {
      const text = inputText.value.trim();
      console.log('[ChatView] 准备发送消息:', text);
      
      if (!text || isTyping.value) return;
      
      try {
        // 添加用户消息
        store.commit('chat/addMessage', {
          text,
          type: 'user',
          timestamp: new Date()
        });
        
        // 处理消息并生成回复
        store.dispatch('chat/sendMessage', {
          text,
          type: 'user'
        });
        
        // 清空输入框
        inputText.value = '';
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
      } catch (error) {
        console.error('[ChatView] 发送消息失败:', error);
      }
    };
    
    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messageContainer.value) {
          messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
        }
      });
    };
    
    // 处理动作按钮点击
    const handleAction = (action) => {
      console.log('[ChatView] 处理动作:', action);
      // 这里可以扩展各种交互动作
    };
    
    // 获取动作按钮标签
    const getActionLabel = (action) => {
      const labels = {
        'sound-purr': '听呼噜声',
        'sound-rain': '听雨声',
        'sound-music': '听音乐',
        'animation-bounce': '一起跳舞',
        'animation-think': '思考中'
      };
      return labels[`${action.type}-${action.name || action.sound}`] || '互动';
    };
    
    // 插入表情符号
    const insertEmoji = (emoji) => {
      if (!emoji) return;
      
      const textarea = inputArea.value;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        inputText.value = inputText.value.substring(0, start) + emoji.char + inputText.value.substring(end);
        nextTick(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + emoji.char.length;
        });
      }
      emojiPickerVisible.value = false;
    };
    
    // 监听消息变化
    watch(() => messages.value.length, () => {
      scrollToBottom();
    });

    return {
      inputText,
      emojiPickerVisible,
      messageContainer,
      assistantAvatar,
      inputArea,
      messages,
      isTyping,
      currentEmotion,
      sendMessage,
      formatTime,
      scrollToBottom,
      handleAction,
      getActionLabel,
      insertEmoji
    };
  }
};
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-header {
  padding: 15px;
  margin-bottom: 20px;
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.assistant-avatar {
  width: 60px;
  height: 60px;
  position: relative;
}

.mochi-body {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  position: relative;
  animation: bounce 2s ease-in-out infinite;
}

.mochi-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
}

.eyes {
  display: flex;
  justify-content: space-around;
  margin-top: 30%;
}

.eye {
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
}

.mouth {
  width: 16px;
  height: 8px;
  border-bottom: 2px solid #333;
  border-radius: 50%;
  margin: 8px auto 0;
}

.mouth.happy {
  border-bottom-color: transparent;
  border-top: 2px solid #333;
  transform: translateY(2px);
}

.mouth.sad {
  transform: translateY(-2px);
}

.assistant-status h2 {
  margin: 0;
  color: var(--text-primary, #333);
}

.status {
  margin: 5px 0 0;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-wrapper {
  display: flex;
  margin-bottom: 10px;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message {
  max-width: 70%;
  padding: 12px;
}

.message-content {
  margin-bottom: 5px;
}

.message-time {
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  text-align: right;
}

.weather-card {
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius, 8px);
  display: flex;
  align-items: center;
  gap: 10px;
}

.weather-icon {
  font-size: 2rem;
}

.weather-icon.sunny::after {
  content: '☀️';
}

.weather-icon.cloudy::after {
  content: '☁️';
}

.weather-icon.rainy::after {
  content: '🌧️';
}

.message-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-btn {
  padding: 5px 10px;
  background: var(--primary-purple, #7b68ee);
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--primary-pink, #ff69b4);
  transform: translateY(-2px);
}

.chat-input {
  margin-top: 20px;
  padding: 15px;
}

textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 2px solid var(--primary-purple, #7b68ee);
  border-radius: var(--border-radius, 8px);
  resize: none;
  font-family: inherit;
  margin-bottom: 10px;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-pink, #ff69b4);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.emoji-btn, .send-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.emoji-btn {
  background: none;
  font-size: 1.2rem;
}

.send-btn {
  background: var(--primary-purple, #7b68ee);
  color: white;
}

.send-btn:hover {
  background: var(--primary-pink, #ff69b4);
  transform: translateY(-2px);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 动画 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes think {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.assistant-avatar.thinking .mochi-body {
  animation: think 2s ease-in-out infinite;
}

.assistant-avatar.happy .mouth {
  border-bottom-color: transparent;
  border-top: 2px solid #333;
  transform: translateY(2px);
}

.assistant-avatar.sad .mouth {
  transform: translateY(-2px);
}

.assistant-avatar.sleepy .eyes {
  height: 2px;
  background: #333;
  border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 80px);
    padding: 10px;
  }
  
  .message {
    max-width: 85%;
  }
  
  .chat-input {
    margin-top: 10px;
  }
  
  textarea {
    height: 60px;
  }
}

.sweet-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>