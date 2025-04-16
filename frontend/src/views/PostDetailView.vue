<template>
  <div class="post-detail">
    <div v-if="loading" class="loading-container">
      <div class="loading-animation"></div>
      <p>正在加载文章...</p>
    </div>
    
    <div v-else-if="post" class="post-content">
      <!-- 文章头部 -->
      <div class="post-header sweet-card">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span> 返回文章列表
        </button>
        
        <h1 class="post-title gradient-text">{{ post.title }}</h1>
        
        <div class="post-meta">
          <div class="author-info">
            <div class="author-avatar">
              <img src="https://via.placeholder.com/40" alt="作者头像" />
            </div>
            <div class="author-name">{{ post.author }}</div>
          </div>
          
          <div class="post-info">
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            <span class="post-category">{{ post.category }}</span>
            <span class="post-views">浏览: {{ post.views }}</span>
          </div>
        </div>
        
        <div v-if="post.coverImage" class="post-cover">
          <img :src="post.coverImage" :alt="post.title" />
        </div>
      </div>
      
      <!-- 文章内容 -->
      <div class="post-body sweet-card">
        <div class="post-text" v-html="post.content"></div>
        
        <div class="post-tags">
          <span v-for="(tag, index) in post.tags" :key="index" class="post-tag">
            {{ tag }}
          </span>
        </div>
        
        <div class="post-actions">
          <button class="like-btn" :class="{ 'liked': liked }" @click="toggleLike">
            <span class="like-icon">♥</span>
            <span class="like-count">{{ post.likes }}</span>
          </button>
          
          <div class="share-btns">
            <button class="share-btn" title="分享到微信">
              <span class="share-icon">🔄</span>
            </button>
            <button class="share-btn" title="复制链接">
              <span class="share-icon">🔗</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 评论区 -->
      <div class="comments-section sweet-card">
        <h3 class="comments-title gradient-text">留言区</h3>
        
        <div class="comment-form">
          <textarea 
            v-model="commentText" 
            placeholder="写下你的评论..." 
            class="comment-input" 
            rows="4"
          ></textarea>
          <button class="submit-btn sweet-btn" :disabled="!commentText.trim()" @click="addComment">
            发表评论
          </button>
        </div>
        
        <div class="comments-list">
          <div v-if="post.comments && post.comments.length > 0">
            <div v-for="comment in post.comments" :key="comment._id" class="comment-item">
              <div class="comment-author">
                <div class="comment-avatar">
                  <img :src="comment.avatar || 'https://via.placeholder.com/40'" :alt="comment.author" />
                </div>
                <div class="comment-info">
                  <div class="comment-name">{{ comment.author }}</div>
                  <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
                </div>
              </div>
              <div class="comment-content">{{ comment.text }}</div>
              <div class="comment-actions">
                <button class="comment-like" @click="likeComment(comment._id)">
                  点赞 {{ comment.likes || 0 }}
                </button>
                <button class="comment-reply" @click="replyToComment">
                  回复
                </button>
              </div>
            </div>
          </div>
          <div v-else class="no-comments">
            <div class="no-comments-icon">💬</div>
            <p>还没有评论，来说些什么吧~</p>
          </div>
        </div>
      </div>
      
      <!-- 相关文章 -->
      <div class="related-posts sweet-card">
        <h3 class="related-title gradient-text">你可能也喜欢</h3>
        <div class="related-list">
          <div v-for="related in relatedPosts" :key="related._id" class="related-item"
               @click="goToPost(related._id)">
            <div class="related-image" 
                 :style="{ backgroundImage: `url(${related.coverImage || 'https://via.placeholder.com/300'})` }">
            </div>
            <div class="related-info">
              <div class="related-title">{{ related.title }}</div>
              <div class="related-date">{{ formatDate(related.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found sweet-card">
      <div class="not-found-icon">😢</div>
      <h2>找不到文章</h2>
      <p>您要查看的文章不存在或已被删除</p>
      <button class="sweet-btn" @click="goBack">返回文章列表</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostDetailView',
  data() {
    return {
      post: null,
      loading: true,
      liked: false,
      commentText: '',
      relatedPosts: []
    };
  },
  mounted() {
    // 获取文章ID
    const postId = this.$route.params.id;
    
    // 模拟获取文章数据
    setTimeout(() => {
      this.post = this.getDummyPost(postId);
      this.relatedPosts = this.getDummyRelatedPosts();
      this.loading = false;
    }, 1000);
  },
  methods: {
    goBack() {
      this.$router.push('/blog');
    },
    goToPost(id) {
      this.$router.push(`/posts/${id}`);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    toggleLike() {
      if (!this.liked) {
        this.post.likes++;
        this.liked = true;
      } else {
        this.post.likes--;
        this.liked = false;
      }
    },
    addComment() {
      if (!this.commentText.trim()) return;
      
      // 创建新评论
      const newComment = {
        _id: Date.now().toString(),
        author: '游客',
        avatar: 'https://via.placeholder.com/40',
        text: this.commentText,
        createdAt: new Date().toISOString(),
        likes: 0
      };
      
      // 添加到评论列表
      if (!this.post.comments) {
        this.post.comments = [];
      }
      
      this.post.comments.unshift(newComment);
      this.commentText = '';
    },
    likeComment(commentId) {
      if (this.post.comments) {
        const comment = this.post.comments.find(c => c._id === commentId);
        if (comment) {
          if (!comment.likes) comment.likes = 0;
          comment.likes++;
        }
      }
    },
    replyToComment() {
      // 在实际应用中，这里会实现回复功能
      alert('回复功能即将上线');
    },
    getDummyPost(id) {
      // 模拟单篇文章数据
      return {
        _id: id,
        title: '樱花季的京都之旅',
        author: '甜心博主',
        createdAt: '2023-04-12T08:00:00.000Z',
        category: '旅行日记',
        tags: ['旅行', '日本', '樱花'],
        likes: 42,
        views: 128,
        coverImage: 'https://via.placeholder.com/800x400?text=樱花季的京都之旅',
        content: `<p>春季的京都被樱花装点得如梦似幻，漫步在古老的街道上，感受千年文化与自然的完美融合...</p>
                 <p>清晨的哲学之道，樱花瓣随风飘落，铺成一条粉色的小路，阳光透过树叶洒下斑驳的光影，仿佛置身于童话世界。</p>
                 <p>游览了著名的清水寺，站在舞台上远眺京都市区，樱花与古老的木质建筑相映成趣。</p>
                 <p>午后在祗园的小茶馆品尝抹茶和和果子，透过窗户看外面的樱花飘舞，时光仿佛停滞。</p>
                 <p>傍晚在鸭川河畔散步，两岸的樱花树在夕阳下泛着金色的光芒，远处传来三味线的声音，沿河的餐厅飘出诱人的香气。</p>
                 <p>这次旅行让我深深体会到了日本人对季节更替的敏感和对自然的敬畏，樱花短暂的盛开也许正是生命美丽与短暂的隐喻。</p>`,
        comments: [
          {
            _id: '1',
            author: '旅行爱好者',
            avatar: 'https://via.placeholder.com/40',
            text: '文章写得好美，仿佛身临其境！我也很想去京都看樱花，请问是几月去的呢？',
            createdAt: '2023-04-13T10:25:00.000Z',
            likes: 5
          },
          {
            _id: '2',
            author: '抹茶控',
            avatar: 'https://via.placeholder.com/40',
            text: '祗园的抹茶是我的最爱！推荐一下您去的那家茶馆的名字吗？',
            createdAt: '2023-04-14T16:40:00.000Z',
            likes: 3
          }
        ]
      };
    },
    getDummyRelatedPosts() {
      // 模拟相关文章数据
      return [
        {
          _id: '2',
          title: '东京迪士尼的奇妙冒险',
          coverImage: 'https://via.placeholder.com/300x200?text=东京迪士尼',
          createdAt: '2023-04-15T08:00:00.000Z'
        },
        {
          _id: '3',
          title: '大阪美食之旅',
          coverImage: 'https://via.placeholder.com/300x200?text=大阪美食',
          createdAt: '2023-04-20T08:00:00.000Z'
        },
        {
          _id: '4',
          title: '富士山下的温泉体验',
          coverImage: 'https://via.placeholder.com/300x200?text=富士山温泉',
          createdAt: '2023-04-25T08:00:00.000Z'
        }
      ];
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-animation {
  width: 50px;
  height: 50px;
  border: 5px solid var(--primary-purple);
  border-radius: 50%;
  border-top-color: var(--primary-pink);
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 文章头部 */
.post-header {
  padding: 30px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-family: inherit;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: var(--primary-pink);
}

.back-icon {
  font-size: 1.2rem;
}

.post-title {
  font-size: 2.5rem;
  text-align: center;
  margin: 30px 0 20px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-info {
  display: flex;
  gap: 15px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.post-cover {
  width: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-top: 20px;
}

.post-cover img {
  width: 100%;
  height: auto;
  display: block;
}

/* 文章内容 */
.post-body {
  padding: 30px;
}

.post-text {
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 30px;
}

.post-text p {
  margin-bottom: 15px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.post-tag {
  padding: 5px 12px;
  background-color: var(--primary-yellow);
  border-radius: 20px;
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
  padding: 10px 15px;
  background: none;
  border: 2px solid var(--primary-pink);
  border-radius: 20px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
}

.like-btn:hover, .like-btn.liked {
  background-color: var(--primary-pink);
  color: white;
}

.like-icon {
  font-size: 1.2rem;
}

.share-btns {
  display: flex;
  gap: 10px;
}

.share-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--primary-purple);
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
  padding: 30px;
}

.comments-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-input {
  width: 100%;
  padding: 15px;
  border: 2px solid var(--primary-purple);
  border-radius: var(--border-radius);
  font-family: inherit;
  resize: vertical;
  margin-bottom: 15px;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary-pink);
}

.submit-btn {
  padding: 10px 20px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 20px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-name {
  font-weight: bold;
}

.comment-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.comment-like, .comment-reply {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px 0;
  transition: color 0.3s ease;
}

.comment-like:hover, .comment-reply:hover {
  color: var(--primary-pink);
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  color: var(--text-secondary);
}

.no-comments-icon {
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
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.related-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.related-image {
  height: 150px;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
}

.related-item:hover .related-image {
  transform: scale(1.05);
}

.related-info {
  padding: 15px;
  background-color: var(--bg-primary);
}

.related-title {
  font-size: 1rem;
  margin-bottom: 8px;
  text-align: left;
}

.related-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* 未找到页面 */
.not-found {
  text-align: center;
  padding: 50px 20px;
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.not-found h2 {
  margin-bottom: 15px;
}

.not-found p {
  color: var(--text-secondary);
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
    gap: 20px;
    align-items: flex-start;
  }
  
  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>