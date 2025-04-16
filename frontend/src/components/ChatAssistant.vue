<template>
  <div class="chat-container">
    <!-- ... 其他现有代码 ... -->
    
    <div class="input-area">
      <div class="input-wrapper">
        <input 
          type="text" 
          v-model="inputMessage" 
          @keyup.enter="sendMessage"
          placeholder="和糖球聊天吧~"
          class="chat-input"
        >
        <div class="input-actions">
          <button class="emoji-trigger" @click.stop="toggleEmojiPicker">
            😊
          </button>
          <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">
            发送
          </button>
        </div>
      </div>
      <EmojiPicker
        v-if="showEmojiPicker"
        :is-visible="showEmojiPicker"
        @select="insertEmoji"
        @close="showEmojiPicker = false"
      />
    </div>
  </div>
</template>

<script>
import EmojiPicker from './EmojiPicker.vue'

export default {
  name: 'ChatAssistant',
  components: {
    EmojiPicker
  },
  data() {
    return {
      // ... 其他现有数据 ...
      showEmojiPicker: false,
      inputMessage: ''
    }
  },
  methods: {
    // ... 其他现有方法 ...
    
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    
    insertEmoji(emoji) {
      const textarea = this.$refs.messageInput;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      this.inputMessage = this.inputMessage.substring(0, start) + emoji + this.inputMessage.substring(end);
      this.$nextTick(() => {
        textarea.focus();
        const newCursor = start + emoji.length;
        textarea.setSelectionRange(newCursor, newCursor);
      });
    }
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  }
}
</script>

<style scoped>
/* ... 其他现有样式 ... */

.input-area {
  position: relative;
  padding: 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 8px;
}

textarea {
  flex: 1;
  border: none;
  background: none;
  resize: none;
  padding: 8px;
  font-size: 1em;
  line-height: 1.5;
  color: var(--text-primary);
  min-height: 24px;
  max-height: 120px;
}

textarea:focus {
  outline: none;
}

.input-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.emoji-trigger {
  background: none;
  border: none;
  padding: 6px;
  font-size: 1.2em;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.emoji-trigger:hover {
  background: var(--bg-hover);
  transform: scale(1.1);
}

.send-btn {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>