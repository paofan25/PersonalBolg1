<template>
  <div class="post-detail">
    <div v-if="loading" class="loading-container">
      <div class="loading-animation">
        <div class="cloud-loading float-animation">☁️</div>
        <p>正在加载文章...</p>
      </div>
    </div>
    
    <div v-else-if="post" class="post-content-wrapper">
      <!-- 返回按钮 -->
      <div class="back-button" @click="goBack">
        <span class="back-icon">🏠</span>
        <span>返回博客</span>
      </div>
      
      <!-- 文章头部 -->
      <div class="post-header sweet-card">
        <h1 class="post-title gradient-text">{{ post.title }}</h1>
        <div class="post-meta">
          <div class="post-author">
            <img :src="post.authorAvatar" alt="作者头像" class="author-avatar" />
            <span>{{ post.author }}</span>
          </div>
          <div class="post-info">
            <span class="post-date">📅 {{ formatDate(post.date) }}</span>
            <span class="post-category">
              <span class="category-icon">{{ getCategoryIcon(post.categoryId) }}</span>
              {{ getCategoryName(post.categoryId) }}
            </span>
          </div>
        </div>
        
        <!-- 封面图 -->
        <div v-if="post.coverImage" class="post-cover">
          <img :src="post.coverImage" :alt="post.title" />
        </div>
      </div>
      
      <!-- 文章主体 -->
      <div class="post-body sweet-card">
        <!-- 文章内容 -->
        <div class="post-content" v-html="post.content"></div>
        
        <!-- 文章标签 -->
        <div class="post-tags">
          <span class="tags-title">标签:</span>
          <div class="tags-list">
            <span 
              v-for="tag in post.tags" 
              :key="tag" 
              class="post-tag"
            >{{ tag }}</span>
          </div>
        </div>
        
        <!-- 点赞分享区 -->
        <div class="post-actions">
          <button class="like-btn sweet-btn" @click="likePost" :class="{ 'liked': hasLiked }">
            <span class="like-icon" :class="{ 'pulse-animation': hasLiked }">❤️</span>
            <span>{{ post.likes }} 喜欢</span>
          </button>
          <div class="share-btns">
            <button class="share-btn" @click="shareOnWeChat">
              <span class="share-icon">💬</span>
            </button>
            <button class="share-btn" @click="shareOnWeibo">
              <span class="share-icon">🔖</span>
            </button>
            <button class="share-btn" @click="copyLink">
              <span class="share-icon">🔗</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 评论区 -->
      <div class="comments-section sweet-card">
        <h2 class="comments-title gradient-text">留言板</h2>
        
        <!-- 评论表单 -->
        <div class="comment-form">
          <div class="form-avatar">
            <img src="@/assets/images/avatar-placeholder.png" alt="当前用户头像" />
          </div>
          <div class="form-content">
            <textarea 
              v-model="commentText" 
              placeholder="写下你的评论..." 
              class="comment-textarea"
            ></textarea>
            <div class="form-actions">
              <div class="emoji-picker">
                <button class="emoji-btn" @click="toggleEmojiPicker">
                  <span>😊</span>
                </button>
                <div v-if="showEmojiPicker" class="emoji-container">
                  <div 
                    v-for="emoji in emojis" 
                    :key="emoji" 
                    class="emoji-item"
                    @click="addEmoji(emoji)"
                  >{{ emoji }}</div>
                </div>
              </div>
              <button class="submit-btn sweet-btn" @click="submitComment" :disabled="!commentText.trim()">
                发送
              </button>
            </div>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-if="post.comments && post.comments.length > 0">
            <div 
              v-for="comment in post.comments" 
              :key="comment.id" 
              class="comment-item"
            >
              <div class="comment-avatar">
                <img :src="comment.avatar" :alt="comment.author" />
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-date">{{ formatDate(comment.date) }}</span>
                </div>
                <div class="comment-text">{{ comment.text }}</div>
                <div class="comment-actions">
                  <button class="comment-like" @click="likeComment(comment.id)">
                    ❤️ {{ comment.likes || 0 }}
                  </button>
                  <button class="comment-reply" @click="replyToComment(comment.id)">
                    回复
                  </button>
                </div>
                
                <!-- 回复表单 -->
                <div v-if="replyingTo === comment.id" class="reply-form">
                  <textarea 
                    v-model="replyText" 
                    placeholder="回复..." 
                    class="reply-textarea"
                  ></textarea>
                  <div class="reply-actions">
                    <button class="cancel-btn" @click="cancelReply">取消</button>
                    <button 
                      class="submit-btn sweet-btn" 
                      @click="submitReply(comment.id)" 
                      :disabled="!replyText.trim()"
                    >
                      回复
                    </button>
                  </div>
                </div>
                
                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                  <div 
                    v-for="reply in comment.replies" 
                    :key="reply.id" 
                    class="reply-item"
                  >
                    <div class="reply-avatar">
                      <img :src="reply.avatar" :alt="reply.author" />
                    </div>
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-author">{{ reply.author }}</span>
                        <span class="reply-date">{{ formatDate(reply.date) }}</span>
                      </div>
                      <div class="reply-text">{{ reply.text }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无评论提示 -->
          <div v-else class="no-comments">
            <div class="empty-comment-icon float-animation">💭</div>
            <p>还没有评论，来说点什么吧~</p>
          </div>
        </div>
      </div>
      
      <!-- 相关文章推荐 -->
      <div class="related-posts sweet-card">
        <h2 class="related-title gradient-text">你可能也喜欢</h2>
        <div class="related-list">
          <div 
            v-for="related in relatedPosts" 
            :key="related.id" 
            class="related-item"
            @click="navigateToPost(related.id)"
          >
            <div class="related-cover">
              <img :src="related.coverImage" :alt="related.title" />
            </div>
            <div class="related-info">
              <h3 class="related-post-title">{{ related.title }}</h3>
              <span class="related-date">{{ formatDate(related.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-else class="error-container sweet-card">
      <div class="error-icon float-animation">☁️</div>
      <h2>糟糕，找不到这篇文章</h2>
      <p>这篇文章可能已经被删除或移动到别处了</p>
      <button class="sweet-btn" @click="goBack">返回博客</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'PostDetail',
  data() {
    return {
      commentText: '',
      replyText: '',
      replyingTo: null,
      showEmojiPicker: false,
      hasLiked: false,
      emojis: ['😊', '🥰', '😂', '👍', '❤️', '✨', '🎉', '🍰', '🐱', '⭐', '🌈', '🍦'],
      categories: [
        { id: 1, name: '全部文章', icon: '📚' },
        { id: 2, name: '旅行日记', icon: '🧳' },
        { id: 3, name: '美食探索', icon: '🍰' },
        { id: 4, name: '手工制作', icon: '🧶' },
        { id: 5, name: '生活随笔', icon: '✏️' }
      ]
    };
  },
  computed: {
    ...mapGetters({
      post: 'getCurrentPost',
      loading: 'getLoading',
      allPosts: 'getAllPosts'
    }),
    postId() {
      return parseInt(this.$route.params.id);
    },
    relatedPosts() {
      if (!this.post || !this.allPosts.length) return [];
      
      // 获取相同分类的其他文章
      return this.allPosts
        .filter(p => p.id !== this.postId && p.categoryId === this.post.categoryId)
        .slice(0, 3); // 最多显示3篇
    }
  },
  created() {
    this.fetchPostById(this.postId);
    
    // 检查本地存储是否已经点赞
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    this.hasLiked = likedPosts.includes(this.postId);
  },
  methods: {
    ...mapActions([
      'fetchPostById', 
      'updatePost', 
      'addComment',
      'deleteComment'
    ]),
    goBack() {
      this.$router.push({ name: 'BlogHome' });
    },
    navigateToPost(postId) {
      if (postId !== this.postId) {
        this.$router.push({ name: 'PostDetail', params: { id: postId } });
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : '未分类';
    },
    getCategoryIcon(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.icon : '📄';
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    addEmoji(emoji) {
      this.commentText += emoji;
      this.showEmojiPicker = false;
    },
    likePost() {
      if (this.hasLiked) return;
      
      // 更新点赞数
      const updatedPost = { ...this.post, likes: this.post.likes + 1 };
      this.updatePost({ id: this.postId, post: updatedPost });
      
      // 保存到本地存储
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      likedPosts.push(this.postId);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      
      this.hasLiked = true;
    },
    shareOnWeChat() {
      alert('复制链接成功，请打开微信分享');
    },
    shareOnWeibo() {
      window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(this.post.title)}`, '_blank');
    },
    copyLink() {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('链接已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败: ', err);
        });
    },
    submitComment() {
      if (!this.commentText.trim()) return;
      
      const newComment = {
        id: Date.now(),
        author: '当前用户', // 实际应用中从用户信息获取
        avatar: '@/assets/images/avatar-placeholder.png', // 实际应用中从用户信息获取
        text: this.commentText,
        date: new Date().toISOString(),
        likes: 0,
        replies: []
      };
      
      this.addComment({ postId: this.postId, comment: newComment });
      this.commentText = '';
    },
    likeComment(commentId) {
      // 实现评论点赞功能
      const updatedComments = this.post.comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: (comment.likes || 0) + 1 };
        }
        return comment;
      });
      
      const updatedPost = { ...this.post, comments: updatedComments };
      this.updatePost({ id: this.postId, post: updatedPost });
    },
    replyToComment(commentId) {
      this.replyingTo = commentId;
      this.replyText = '';
    },
    cancelReply() {
      this.replyingTo = null;
      this.replyText = '';
    },
    submitReply(commentId) {
      if (!this.replyText.trim()) return;
      
      const newReply = {
        id: Date.now(),
        author: '当前用户', // 实际应用中从用户信息获取
        avatar: '@/assets/images/avatar-placeholder.png', // 实际应用中从用户信息获取
        text: this.replyText,
        date: new Date().toISOString()
      };
      
      const updatedComments = this.post.comments.map(comment => {
        if (comment.id === commentId) {
          const replies = comment.replies || [];
          return { ...comment, replies: [...replies, newReply] };
        }
        return comment;
      });
      
      const updatedPost = { ...this.post, comments: updatedComments };
      this.updatePost({ id: this.postId, post: updatedPost });
      
      this.cancelReply();
    }
  }
};
</script>

<style scoped>
.post-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 加载动画 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-animation {
  text-align: center;
}

.cloud-loading {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* 返回按钮 */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  margin-bottom: 20px;
  background-color: var(--primary-purple);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: var(--primary-pink);
  transform: translateY(-2px);
}

.back-icon {
  font-size: 1.2rem;
}

/* 文章头部 */
.post-header {
  margin-bottom: 20px;
  padding: 30px;
}

.post-title {
  font-size: 2.2rem;
  margin-bottom: 20px;
  text-align: center;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.post-info {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.post-date, .post-category {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
}

.category-icon {
  font-size: 1.2rem;
}

.post-cover {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius);
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 文章主体 */
.post-body {
  margin-bottom: 20px;
  padding: 30px;
}

.post-content {
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.post-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.tags-title {
  font-weight: bold;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-tag {
  padding: 5px 10px;
  background-color: var(--primary-yellow);
  border-radius: 15px;
  font-size: 0.8rem;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
}

.like-icon {
  font-size: 1.2rem;
}

.like-btn.liked {
  background-color: var(--primary-pink);
}

.share-btns {
  display: flex;
  gap: 10px;
}

.share-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-purple);
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn:hover {
  background-color: var(--primary-pink);
  transform: translateY(-2px);
}

.share-icon {
  font-size: 1.2rem;
}

/* 评论区 */
.comments-section {
  margin-bottom: 20px;
  padding: 30px;
}

.comments-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.comment-form {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.form-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.form-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-content {
  flex: 1;
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 15px;
  border: 2px solid var(--primary-purple);
  border-radius: var(--border-radius);
  margin-bottom: 10px;
  resize: vertical;
  font-family: var(--font-primary);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.emoji-picker {
  position: relative;
}

.emoji-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-purple);
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.2rem;
}

.emoji-container {
  position: absolute;
  bottom: 50px;
  left: 0;
  width: 200px;
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

.submit-btn {
  padding: 10px 20px;
}

/* 评论列表 */
.comments-list {
  margin-top: 30px;
}

.comment-item {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.comment-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
}

.comment-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.comment-text {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.comment-like, .comment-reply {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.comment-like:hover, .comment-reply:hover {
  color: var(--primary-pink);
}

/* 回复表单 */
.reply-form {
  margin: 10px 0 15px 0;
  padding: 15px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.reply-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 2px solid var(--primary-purple);
  border-radius: var(--border-radius);
  margin-bottom: 10px;
  resize: vertical;
  font-family: var(--font-primary);
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 8px 15px;
  background: transparent;
  border: 1px solid var(--text-secondary);
  border-radius: var(--border-radius);
  cursor: pointer;
}

/* 回复列表 */
.replies-list {
  margin-left: 20px;
  margin-top: 15px;
  padding-left: 15px;
  border-left: 2px solid var(--primary-purple);
}

.reply-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.reply-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
}

.reply-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.reply-author {
  font-weight: bold;
  font-size: 0.9rem;
}

.reply-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.reply-text {
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 无评论提示 */
.no-comments {
  text-align: center;
  padding: 30px 0;
}

.empty-comment-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* 相关文章 */
.related-posts {
  padding: 30px;
}

.related-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.related-item {
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.related-item:hover {
  transform: translateY(-5px);
}

.related-cover {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.related-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.related-item:hover .related-cover img {
  transform: scale(1.05);
}

.related-info {
  padding: 15px;
}

.related-post-title {
  margin-bottom: 5px;
  font-size: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* 错误提示 */
.error-container {
  text-align: center;
  padding: 50px 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .post-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .related-list {
    grid-template-columns: 1fr;
  }
  
  .comment-form {
    flex-direction: column;
  }
  
  .form-avatar {
    display: none;
  }
}
</style>