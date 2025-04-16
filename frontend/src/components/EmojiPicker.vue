<template>
  <div class="emoji-picker" v-show="visible" :style="position">
    <div class="emoji-categories">
      <button 
        v-for="category in categories" 
        :key="category.name"
        class="category-btn"
        :class="{ active: currentCategory === category.name }"
        @click="currentCategory = category.name">
        {{ category.icon }}
      </button>
    </div>
    <div class="emoji-list">
      <button 
        v-for="emoji in currentEmojis" 
        :key="emoji.char"
        class="emoji-btn"
        @click="selectEmoji(emoji)">
        {{ emoji.char }}
      </button>
    </div>
    <div class="recently-used" v-if="recentEmojis.length">
      <div class="section-title">最近使用</div>
      <div class="emoji-list">
        <button 
          v-for="emoji in recentEmojis" 
          :key="emoji.char"
          class="emoji-btn"
          @click="selectEmoji(emoji)">
          {{ emoji.char }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const CATEGORIES = [
  {
    name: 'faces',
    icon: '😊',
    emojis: [
      { char: '😊', name: 'smile' },
      { char: '😂', name: 'joy' },
      { char: '🥰', name: 'love' },
      { char: '😴', name: 'sleepy' },
      { char: '😢', name: 'cry' },
      { char: '😍', name: 'heart_eyes' },
      { char: '🤔', name: 'thinking' },
      { char: '😮', name: 'wow' },
      { char: '🥺', name: 'pleading' },
      { char: '😋', name: 'yum' }
    ]
  },
  {
    name: 'animals',
    icon: '🐱',
    emojis: [
      { char: '🐱', name: 'cat' },
      { char: '🐰', name: 'rabbit' },
      { char: '🐶', name: 'dog' },
      { char: '🦊', name: 'fox' },
      { char: '🐼', name: 'panda' },
      { char: '🐨', name: 'koala' },
      { char: '🦁', name: 'lion' },
      { char: '🐯', name: 'tiger' },
      { char: '🐭', name: 'mouse' },
      { char: '🦄', name: 'unicorn' }
    ]
  },
  {
    name: 'food',
    icon: '🍰',
    emojis: [
      { char: '🍰', name: 'cake' },
      { char: '🍪', name: 'cookie' },
      { char: '🍦', name: 'icecream' },
      { char: '🍡', name: 'dango' },
      { char: '🍫', name: 'chocolate' },
      { char: '🧁', name: 'cupcake' },
      { char: '🍮', name: 'pudding' },
      { char: '🍭', name: 'lollipop' },
      { char: '🍬', name: 'candy' },
      { char: '🍯', name: 'honey' }
    ]
  },
  {
    name: 'weather',
    icon: '☀️',
    emojis: [
      { char: '☀️', name: 'sun' },
      { char: '☁️', name: 'cloud' },
      { char: '🌧️', name: 'rain' },
      { char: '⛈️', name: 'storm' },
      { char: '🌈', name: 'rainbow' },
      { char: '❄️', name: 'snow' },
      { char: '🌙', name: 'moon' },
      { char: '⭐', name: 'star' },
      { char: '✨', name: 'sparkles' },
      { char: '🌸', name: 'flower' }
    ]
  }
];

const MAX_RECENT = 20;

export default {
  name: 'EmojiPicker',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      categories: CATEGORIES,
      currentCategory: 'faces',
      recentEmojis: []
    };
  },
  computed: {
    currentEmojis() {
      const category = this.categories.find(c => c.name === this.currentCategory);
      return category ? category.emojis : [];
    }
  },
  methods: {
    selectEmoji(emoji) {
      this.$emit('select', emoji);
      this.addToRecent(emoji);
    },
    addToRecent(emoji) {
      const index = this.recentEmojis.findIndex(e => e.char === emoji.char);
      if (index > -1) {
        this.recentEmojis.splice(index, 1);
      }
      this.recentEmojis.unshift(emoji);
      if (this.recentEmojis.length > MAX_RECENT) {
        this.recentEmojis.pop();
      }
      this.saveRecent();
    },
    saveRecent() {
      localStorage.setItem('recentEmojis', JSON.stringify(this.recentEmojis));
    },
    loadRecent() {
      const saved = localStorage.getItem('recentEmojis');
      if (saved) {
        try {
          this.recentEmojis = JSON.parse(saved);
        } catch (e) {
          console.error('Error loading recent emojis:', e);
        }
      }
    }
  },
  mounted() {
    this.loadRecent();
  }
};
</script>

<style scoped>
.emoji-picker {
  position: absolute;
  width: 300px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  padding: 10px;
  z-index: 1000;
}

.emoji-categories {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.category-btn {
  background: none;
  border: none;
  padding: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: all var(--transition-fast);
}

.category-btn.active {
  opacity: 1;
  transform: scale(1.1);
}

.category-btn:hover {
  opacity: 1;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 8px 0;
}

.emoji-btn {
  background: none;
  border: none;
  padding: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform var(--transition-fast);
  border-radius: 4px;
}

.emoji-btn:hover {
  background: var(--bg-secondary);
  transform: scale(1.2);
}

.section-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 8px 0 4px;
}

.recently-used {
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
  padding-top: 8px;
}
</style>