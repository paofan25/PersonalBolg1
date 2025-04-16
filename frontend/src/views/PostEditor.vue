<template>
  <div class="post-editor">
    <div class="editor-header sweet-card">
      <h1 class="editor-title gradient-text">
        {{ isEditing ? '编辑文章' : '创建新文章' }}
      </h1>
      <div class="editor-actions">
        <button class="sweet-btn preview-btn" @click="togglePreview">
          {{ showPreview ? '继续编辑' : '预览文章' }}
        </button>
        <button class="sweet-btn cancel-btn" @click="cancelEditing">取消</button>
        <button class="sweet-btn save-btn" @click="savePost" :disabled="!isValid">保存</button>
      </div>
    </div>
    
    <div v-if="!showPreview" class="editor-form sweet-card">
      <!-- 标题输入 -->
      <div class="form-group">
        <label for="title">文章标题</label>
        <input 
          type="text" 
          id="title" 
          v-model="postForm.title" 
          placeholder="输入文章标题..." 
          class="form-control"
        />
      </div>
      
      <!-- 封面图片 -->
      <div class="form-group">
        <label>封面图片</label>
        <div class="cover-upload">
          <div 
            class="cover-preview" 
            :class="{ 'has-image': postForm.coverImage }"
            :style="coverStyle"
          >
            <div v-if="!postForm.coverImage" class="upload-placeholder">
              <span class="upload-icon">🖼️</span>
              <span>上传封面图片</span>
            </div>
            <button v-else class="remove-image-btn" @click="removeCoverImage">移除</button>
          </div>
          <input 
            type="file" 
            id="cover-image" 
            accept="image/*" 
            @change="handleImageUpload" 
            ref="fileInput"
            class="file-input"
          />
          <button class="sweet-btn upload-btn" @click="triggerFileInput">
            {{ postForm.coverImage ? '更换图片' : '选择图片' }}
          </button>
          <button class="sweet-btn ai-image-btn" @click="showAiImagePrompt = true">
            AI生成插画
          </button>
        </div>
      </div>
      
      <!-- AI图片生成提示框 -->
      <div v-if="showAiImagePrompt" class="ai-prompt-overlay">
        <div class="ai-prompt-modal sweet-card">
          <h3>AI生成插画</h3>
          <p>输入描述关键词，AI将为你生成匹配的插画</p>
          <input 
            type="text" 
            v-model="aiImagePrompt" 
            placeholder="例如：樱花森林、星空下的小屋..."
            class="form-control"
          />
          <div class="ai-prompt-actions">
            <button class="sweet-btn cancel-btn" @click="showAiImagePrompt = false">取消</button>
            <button 
              class="sweet-btn generate-btn" 
              @click="generateAiImage" 
              :disabled="!aiImagePrompt.trim()"
            >
              生成
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分类和标签 -->
      <div class="form-row">
        <div class="form-group half">
          <label for="category">分类</label>
          <select id="category" v-model="postForm.categoryId" class="form-control">
            <option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.icon }} {{ category.name }}
            </option>
          </select>
        </div>
        <div class="form-group half">
          <label for="tags">标签</label>
          <div class="tags-input">
            <div class="tags-container">
              <div 
                v-for="(tag, index) in postForm.tags" 
                :key="index"
                class="tag-item"
              >
                <span>{{ tag }}</span>
                <button class="remove-tag" @click="removeTag(index)">×</button>
              </div>
              <input 
                type="text" 
                v-model="tagInput" 
                placeholder="添加标签..." 
                @keydown.enter.prevent="addTag"
                class="tag-input form-control"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 文章内容 -->
      <div class="form-group">
        <label for="content">文章内容</label>
        <div class="editor-toolbar">
          <button 
            v-for="(tool, index) in editorTools" 
            :key="index" 
            class="toolbar-btn" 
            @click="applyFormatting(tool.action)"
          >
            {{ tool.icon }}
          </button>
          <button class="toolbar-btn emoji-btn" @click="toggleEmojiPicker">
            😊
          </button>
          <div v-if="showEmojiPicker" class="emoji-container">
            <div 
              v-for="emoji in emojis" 
              :key="emoji" 
              class="emoji-item"
              @click="insertEmoji(emoji)"
            >{{ emoji }}</div>
          </div>
        </div>
        <textarea 
          id="content" 
          v-model="postForm.content" 
          placeholder="写下你的故事..." 
          class="form-control content-editor"
          ref="contentEditor"
        ></textarea>
      </div>
    </div>
    
    <!-- 预览模式 -->
    <div v-else class="post-preview sweet-card">
      <h2 class="preview-title gradient-text">{{ postForm.title || '无标题文章' }}</h2>
      <div v-if="postForm.coverImage" class="preview-cover">
        <img :src="postForm.coverImage" :alt="postForm.title" />
      </div>
      <div class="preview-meta">
        <span class="preview-category">
          {{ getCategoryName(postForm.categoryId) }}
        </span>
        <div class="preview-tags">
          <span 
            v-for="(tag, index) in postForm.tags" 
            :key="index" 
            class="preview-tag"
          >{{ tag }}</span>
        </div>
      </div>
      <div class="preview-content" v-html="formattedContent"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { marked } from 'marked'; // 需要安装marked包

export default {
  name: 'PostEditor',
  data() {
    return {
      postForm: {
        id: null,
        title: '',
        categoryId: 1,
        content: '',
        coverImage: '',
        tags: [],
        date: '',
        author: '当前用户', // 实际应用中应从用户信息获取
        authorAvatar: '', // 实际应用中应从用户信息获取
        likes: 0,
        views: 0,
        comments: []
      },
      tagInput: '',
      showPreview: false,
      showEmojiPicker: false,
      showAiImagePrompt: false,
      aiImagePrompt: '',
      emojis: ['😊', '🥰', '😂', '👍', '❤️', '✨', '🎉', '🍰', '🐱', '⭐', '🌈', '🍦'],
      categories: [
        { id: 1, name: '全部文章', icon: '📚' },
        { id: 2, name: '旅行日记', icon: '🧳' },
        { id: 3, name: '美食探索', icon: '🍰' },
        { id: 4, name: '手工制作', icon: '🧶' },
        { id: 5, name: '生活随笔', icon: '✏️' }
      ],
      editorTools: [
        { icon: 'H', action: 'heading' },
        { icon: 'B', action: 'bold' },
        { icon: 'I', action: 'italic' },
        { icon: '—', action: 'strikethrough' },
        { icon: '•', action: 'list' },
        { icon: '1.', action: 'orderedList' },
        { icon: '»', action: 'quote' },
        { icon: '🔗', action: 'link' },
        { icon: '🖼️', action: 'image' }
      ]
    };
  },
  computed: {
    ...mapGetters({
      allPosts: 'getAllPosts',
      loading: 'getLoading'
    }),
    isEditing() {
      return !!this.postForm.id;
    },
    isValid() {
      return this.postForm.title.trim() && this.postForm.content.trim();
    },
    formattedContent() {
      return this.postForm.content ? marked(this.postForm.content) : '';
    },
    coverStyle() {
      return this.postForm.coverImage 
        ? { backgroundImage: `url(${this.postForm.coverImage})` }
        : {};
    }
  },
  created() {
    // 检查是否是编辑模式
    const postId = this.$route.params.id;
    if (postId) {
      this.loadPost(postId);
    }
  },
  methods: {
    ...mapActions(['createPost', 'updatePost']),
    loadPost(postId) {
      const post = this.allPosts.find(p => p.id === parseInt(postId));
      if (post) {
        this.postForm = { ...post };
      } else {
        this.$router.push({ name: 'BlogHome' });
      }
    },
    cancelEditing() {
      if (confirm('确定要取消编辑吗？未保存的内容将会丢失。')) {
        this.$router.go(-1);
      }
    },
    savePost() {
      if (!this.isValid) return;
      
      // 准备保存的数据
      const postData = { ...this.postForm };
      
      // 如果是新文章，设置日期和初始数据
      if (!this.isEditing) {
        postData.id = Date.now();
        postData.date = new Date().toISOString();
        postData.likes = 0;
        postData.views = 0;
        postData.comments = [];
        
        // 创建新文章
        this.createPost(postData);
      } else {
        // 更新文章
        this.updatePost({ id: postData.id, post: postData });
      }
      
      // 保存后返回博客主页
      this.$router.push({ name: 'BlogHome' });
    },
    togglePreview() {
      this.showPreview = !this.showPreview;
    },
    addTag() {
      const tag = this.tagInput.trim();
      if (tag && !this.postForm.tags.includes(tag)) {
        this.postForm.tags.push(tag);
        this.tagInput = '';
      }
    },
    removeTag(index) {
      this.postForm.tags.splice(index, 1);
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.postForm.coverImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    removeCoverImage() {
      this.postForm.coverImage = '';
      this.$refs.fileInput.value = '';
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    insertEmoji(emoji) {
      // 在光标位置插入表情
      const textArea = this.$refs.contentEditor;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = this.postForm.content;
      
      this.postForm.content = text.substring(0, start) + emoji + text.substring(end);
      
      // 设置光标位置
      this.$nextTick(() => {
        textArea.selectionStart = textArea.selectionEnd = start + emoji.length;
        textArea.focus();
      });
      
      this.showEmojiPicker = false;
    },
    applyFormatting(action) {
      const textArea = this.$refs.contentEditor;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const selectedText = this.postForm.content.substring(start, end);
      let formatted = '';
      
      switch (action) {
        case 'heading':
          formatted = `# ${selectedText}`;
          break;
        case 'bold':
          formatted = `**${selectedText}**`;
          break;
        case 'italic':
          formatted = `*${selectedText}*`;
          break;
        case 'strikethrough':
          formatted = `~~${selectedText}~~`;
          break;
        case 'list':
          formatted = `- ${selectedText}`;
          break;
        case 'orderedList':
          formatted = `1. ${selectedText}`;
          break;
        case 'quote':
          formatted = `> ${selectedText}`;
          break;
        case 'link':
          formatted = `[${selectedText}](链接URL)`;
          break;
        case 'image':
          formatted = `![${selectedText || '图片描述'}](图片URL)`;
          break;
      }
      
      this.postForm.content = this.postForm.content.substring(0, start) + formatted + this.postForm.content.substring(end);
      
      // 设置光标位置
      this.$nextTick(() => {
        textArea.selectionStart = start + formatted.length;
        textArea.selectionEnd = start + formatted.length;
        textArea.focus();
      });
    },
    generateAiImage() {
      // 实际应用中，这里应该调用AI图像生成API
      // 模拟生成图像的过程
      this.showAiImagePrompt = false;
      alert(`正在生成关键词为"${this.aiImagePrompt}"的图像，请稍候...`);
      
      // 模拟异步操作
      setTimeout(() => {
        // 这里应替换为实际生成的图像URL
        this.postForm.coverImage = 'https://via.placeholder.com/800x400?text=AI生成图像';
        this.aiImagePrompt = '';
      }, 2000);
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? `${category.icon} ${category.name}` : '未分类';
    }
  }
};
</script>

<style scoped>
.post-editor {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
}

.editor-title {
  font-size: 1.8rem;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.preview-btn, .cancel-btn, .save-btn {
  padding: 10px 15px;
}

.cancel-btn {
  background: transparent;
  border: 2px solid var(--primary-pink);
  color: var(--text-primary);
}

.editor-form, .post-preview {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--primary-purple);
  border-radius: var(--border-radius);
  font-family: var(--font-primary);
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: var(--primary-pink);
  outline: none;
}

/* 封面图片上传 */
.cover-upload {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.cover-preview {
  width: 200px;
  height: 120px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
}

.cover-preview.has-image {
  background-color: transparent;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 5px;
}

.file-input {
  display: none;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: none;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.cover-preview.has-image:hover .remove-image-btn {
  display: flex;
}

/* 标签输入 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border: 2px solid var(--primary-purple);
  border-radius: var(--border-radius);
  padding: 10px;
  min-height: 46px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background-color: var(--primary-yellow);
  border-radius: 15px;
  font-size: 0.8rem;
}

.remove-tag {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-input {
  flex: 1;
  border: none;
  padding: 5px;
  min-width: 100px;
}

.tag-input:focus {
  outline: none;
}

/* 编辑器工具栏 */
.editor-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  position: relative;
}

.toolbar-btn {
  width: 35px;
  height: 35px;
  border-radius: 5px;
  background-color: white;
  border: 1px solid var(--primary-purple);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background-color: var(--primary-purple);
}

.emoji-container {
  position: absolute;
  top: 50px;
  right: 10px;
  width: 250px;
  padding: 10px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  z-index: 10;
}

.emoji-item {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.2rem;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.emoji-item:hover {
  background-color: var(--primary-purple);
  transform: scale(1.1);
}

.content-editor {
  min-height: 300px;
  resize: vertical;
}

/* AI图片生成 */
.ai-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ai-prompt-modal {
  width: 90%;
  max-width: 500px;
  padding: 30px;
  background-color: white;
}

.ai-prompt-modal h3 {
  margin-bottom: 15px;
}

.ai-prompt-modal p {
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.ai-prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 预览模式 */
.preview-title {
  font-size: 2.2rem;
  margin-bottom: 20px;
  text-align: center;
}

.preview-cover {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
}

.preview-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.preview-category {
  padding: 5px 12px;
  background-color: var(--primary-purple);
  border-radius: 20px;
}

.preview-tags {
  display: flex;
  gap: 8px;
}

.preview-tag {
  padding: 5px 10px;
  background-color: var(--primary-yellow);
  border-radius: 15px;
  font-size: 0.8rem;
}

.preview-content {
  line-height: 1.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .cover-upload {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cover-preview {
    width: 100%;
  }
  
  .editor-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>