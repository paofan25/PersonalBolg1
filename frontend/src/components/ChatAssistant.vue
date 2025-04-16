<template>
  <div class="chat-assistant-container">
    <div class="chat-header">
      <div class="assistant-info">
        <div class="avatar">
          <div class="avatar-face" :class="currentEmotion">
            <div class="eyes">
              <div class="eye left"></div>
              <div class="eye right"></div>
            </div>
            <div class="mouth" :class="currentEmotion"></div>
          </div>
        </div>
        <div class="status">
          <h3>糖球助手</h3>
          <p>{{ getEmotionText() }}</p>
        </div>
      </div>
      <div class="weather-box" v-if="weatherInfo">
        <div class="weather-icon">{{ getWeatherEmoji() }}</div>
        <div class="weather-text">
          <p>{{ weatherInfo.city }}</p>
          <p>{{ weatherInfo.temp }}°C {{ weatherInfo.condition }}</p>
        </div>
      </div>
    </div>
    
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <h3>欢迎来到甜梦星球！</h3>
        <p>我是你的糖球助手，有什么我能帮你的吗？</p>
        <div class="suggestion-chips">
          <button @click="sendSuggestion('介绍一下甜梦星球')">介绍一下甜梦星球</button>
          <button @click="sendSuggestion('今天天气怎么样')">天气怎么样</button>
          <button @click="sendSuggestion('有什么游戏可以玩')">有什么游戏可以玩</button>
        </div>
      </div>
      
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="['message', message.isUser ? 'user-message' : 'assistant-message']"
      >
        <div class="message-avatar" v-if="!message.isUser">
          <div class="mini-sugar-ball" :class="message.emotion || currentEmotion"></div>
        </div>
        <div class="message-content">
          <p v-html="formatMessage(message.text)"></p>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-avatar user" v-if="message.isUser">
          <div class="user-icon">👤</div>
        </div>
      </div>
      
      <div class="typing-indicator" v-if="isTyping">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    
    <div class="input-container">
      <div class="emoji-picker" v-if="showEmojiPicker">
        <div class="emoji-grid">
          <span 
            v-for="(emoji, index) in emojiList" 
            :key="index" 
            class="emoji-item" 
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
      
      <input 
        type="text" 
        v-model="userInput" 
        @keyup.enter="handleSendMessage" 
        placeholder="和糖球聊聊吧..." 
        :disabled="isTyping"
      />
      <button @click="toggleEmojiPicker" class="emoji-toggle">
        😊
      </button>
      <button @click="handleSendMessage" :disabled="!userInput.trim() || isTyping">
        发送
      </button>
      <button class="sound-toggle" @click="toggleSound" :class="{active: soundEnabled}">
        {{ soundEnabled ? '🔊' : '🔇' }}
      </button>
      <button class="clear-chat" @click="clearChat">
        🗑️
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

export default {
  name: 'ChatAssistant',
  data() {
    return {
      userInput: '',
      messageAudio: null,
      typingAudio: null,
      showEmojiPicker: false,
      emojiList: [
        '😊', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', 
        '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', 
        '🥲', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', 
        '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', 
        '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', 
        '😩', '🥺', '😢', '😭', '😮', '😱', '😳', '🥴',
        '❤️', '💕', '💖', '💗', '🌟', '✨', '🌈', '🎀'
      ]
    };
  },
  computed: {
    ...mapState('chat', ['isTyping', 'weatherInfo', 'soundEnabled']),
    ...mapGetters('chat', ['messages', 'currentEmotion'])
  },
  methods: {
    ...mapActions('chat', ['sendMessage', 'clearMessages']),
    ...mapMutations('chat', ['toggleSoundEffects']),
    
    formatMessage(text) {
      if (typeof text !== 'string') return '';
      
      // 使用HTML标签标记emoji表情，使它们更显眼
      let formattedText = text;
      
      // 匹配emoji表情的正则表达式
      const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      
      // 将emoji用span包裹
      formattedText = formattedText.replace(emojiRegex, match => {
        return `<span class="emoji-highlight">${match}</span>`;
      });
      
      return formattedText;
    },
    
    getEmotionText() {
      const emotions = {
        happy: '开心 😊',
        sad: '难过 😢',
        angry: '生气 😠',
        surprised: '惊讶 😲',
        confused: '困惑 🤔',
        tired: '疲倦 😴',
        excited: '兴奋 😃',
        neutral: '平静 😌'
      };
      return emotions[this.currentEmotion] || '平静 😌';
    },
    
    getWeatherEmoji() {
      if (!this.weatherInfo) return '🌈';
      
      const condition = this.weatherInfo.condition && typeof this.weatherInfo.condition === 'string' 
        ? this.weatherInfo.condition.toLowerCase() 
        : '';
      
      if (condition.includes('晴')) return '☀️';
      if (condition.includes('云') || condition.includes('阴')) return '☁️';
      if (condition.includes('雨')) return '🌧️';
      if (condition.includes('雪')) return '❄️';
      if (condition.includes('雷') || condition.includes('电')) return '⛈️';
      if (condition.includes('雾')) return '🌫️';
      
      return '🌈';
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    handleSendMessage() {
      if (!this.userInput.trim() || this.isTyping) return;
      
      this.sendMessage(this.userInput);
      this.playSound('message');
      this.userInput = '';
      this.showEmojiPicker = false;
      
      if (this.isTyping) {
        this.playSound('typing');
      }
    },
    
    sendSuggestion(text) {
      this.userInput = text;
      this.handleSendMessage();
    },
    
    playSound(type) {
      if (!this.soundEnabled) return;
      
      // 在真实环境中，这里应该播放音频
      console.log(`Playing ${type} sound`);
    },
    
    toggleSound() {
      this.toggleSoundEffects();
    },
    
    clearChat() {
      if (confirm('确定要清除所有聊天记录吗？')) {
        this.clearMessages();
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },
    
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    
    insertEmoji(emoji) {
      this.userInput += emoji;
      this.$nextTick(() => {
        document.querySelector('.input-container input').focus();
      });
    }
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
      deep: true
    },
    isTyping(newVal) {
      if (newVal && this.soundEnabled) {
        this.playSound('typing');
      }
    }
  },
  mounted() {
    this.scrollToBottom();
  },
  beforeUnmount() {
    // 清理资源
    if (this.messageAudio) {
      this.messageAudio = null;
    }
    if (this.typingAudio) {
      this.typingAudio = null;
    }
  }
};
</script>

<style scoped>
.chat-assistant-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  max-width: 1000px;
  margin: 0 auto;
  background-color: #fff9fc;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #ffcaf2 0%, #c4b0ff 100%);
  color: #fff;
}

.assistant-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  position: relative;
}

.avatar-face {
  width: 100%;
  height: 100%;
  background-color: #ffcaf2;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-face.happy {
  background-color: #ffcaf2;
}

.avatar-face.sad {
  background-color: #c4b0ff;
}

.avatar-face.angry {
  background-color: #ffb7b7;
}

.avatar-face.confused {
  background-color: #b8e4ff;
}

.eyes {
  display: flex;
  margin-bottom: 8px;
}

.eye {
  width: 10px;
  height: 10px;
  background-color: #333;
  border-radius: 50%;
  margin: 0 5px;
}

.mouth {
  width: 20px;
  height: 10px;
  border-radius: 0 0 10px 10px;
  background-color: #333;
  transition: all 0.3s ease;
}

.mouth.happy {
  border-radius: 0 0 10px 10px;
}

.mouth.sad {
  border-radius: 10px 10px 0 0;
  transform: translateY(5px);
}

.mouth.angry {
  border-radius: 0;
  transform: scaleY(0.5);
}

.mouth.confused {
  width: 10px;
  border-radius: 50%;
}

.status h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.status p {
  margin: 5px 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.weather-box {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8px 15px;
  border-radius: 30px;
}

.weather-icon {
  font-size: 2rem;
  margin-right: 10px;
}

.weather-text p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.2;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff9fc;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.welcome-message h3 {
  color: #c4b0ff;
  margin-top: 0;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.suggestion-chips button {
  background-color: #c4b0ff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chips button:hover {
  background-color: #ffcaf2;
  transform: translateY(-2px);
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-sugar-ball {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #ffcaf2;
  position: relative;
}

.mini-sugar-ball:after {
  content: '';
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 15px;
  height: 10px;
  border-radius: 50%;
  background-color: #333;
}

.mini-sugar-ball.happy {
  background-color: #ffcaf2;
}

.mini-sugar-ball.sad {
  background-color: #c4b0ff;
}

.mini-sugar-ball.angry {
  background-color: #ffb7b7;
}

.user-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.message-content {
  max-width: 70%;
  padding: 12px 15px;
  border-radius: 18px;
  position: relative;
  margin: 0 10px;
}

.user-message .message-content {
  background-color: #c4b0ff;
  color: white;
  border-bottom-right-radius: 5px;
}

.assistant-message .message-content {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-content p {
  margin: 0;
  line-height: 1.4;
}

.emoji-highlight {
  display: inline-block;
  font-size: 1.1em;
  margin: 0 1px;
}

.timestamp {
  font-size: 0.7rem;
  opacity: 0.7;
  position: absolute;
  bottom: -18px;
  right: 5px;
}

.user-message .timestamp {
  left: 5px;
}

.typing-indicator {
  padding: 12px 15px;
  background-color: white;
  border-radius: 18px;
  width: 60px;
  display: flex;
  justify-content: center;
  margin-left: 50px;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: #c4b0ff;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.3s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}

.input-container {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #f0f0f0;
  position: relative;
}

.emoji-picker {
  position: absolute;
  bottom: 70px;
  left: 15px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  padding: 10px;
  z-index: 10;
  width: 280px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 1.5rem;
  cursor: pointer;
  text-align: center;
  padding: 5px;
  transition: all 0.2s;
  border-radius: 5px;
}

.emoji-item:hover {
  background-color: #f5f5f5;
  transform: scale(1.2);
}

.input-container input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #f0f0f0;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-container input:focus {
  outline: none;
  border-color: #c4b0ff;
}

.input-container button {
  margin-left: 10px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ffcaf2 0%, #c4b0ff 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.input-container button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.input-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.emoji-toggle, .sound-toggle, .clear-chat {
  width: 40px;
  height: 40px;
  border-radius: 50% !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem !important;
  background: #f5f5f5 !important;
  color: #666 !important;
}

.emoji-toggle:hover, .sound-toggle:hover, .clear-chat:hover {
  background: #e5e5e5 !important;
}

.sound-toggle.active {
  background: linear-gradient(135deg, #ffcaf2 0%, #c4b0ff 100%) !important;
  color: white !important;
}

@media (max-width: 768px) {
  .chat-assistant-container {
    height: calc(100vh - 80px);
    border-radius: 0;
  }
  
  .message-content {
    max-width: 80%;
  }
  
  .weather-text {
    display: none;
  }

  .emoji-picker {
    width: 200px;
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 10px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
  
  .status h3 {
    font-size: 1rem;
  }
  
  .input-container {
    padding: 10px;
  }
  
  .input-container input {
    padding: 10px 15px;
  }
  
  .emoji-toggle, .sound-toggle, .clear-chat {
    width: 36px;
    height: 36px;
  }

  .emoji-picker {
    width: 180px;
  }

  .emoji-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>