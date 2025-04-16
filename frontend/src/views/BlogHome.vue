<template>
  <div class="blog-home">
    <!-- 头部轮播图 -->
    <div class="hero-banner">
      <div class="hero-content">
        <h1 class="gradient-text float-animation">欢迎来到甜梦星球博客</h1>
        <p class="subtitle">✨ 每一篇文章都是一场奇妙的冒险 ✨</p>
        <div class="weather-effect">
          <div v-for="i in 20" :key="i" class="falling-item" :style="randomFallingStyle()"></div>
        </div>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="blog-content">
      <!-- 左侧博主信息 -->
      <div class="author-section sweet-card">
        <div class="author-avatar pulse-animation">
          <img src="@/assets/images/avatar-placeholder.png" alt="博主头像" />
        </div>
        <h2 class="author-name gradient-text">甜心博主</h2>
        <p class="author-bio">一只喜欢分享生活点滴的云朵猫🐱，喜欢甜品、旅行和手工艺术✨</p>
        <div class="author-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.posts }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.views }}</span>
            <span class="stat-label">阅读</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.likes }}</span>
            <span class="stat-label">喜欢</span>
          </div>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">🎮</a>
          <a href="#" class="social-link">📷</a>
          <a href="#" class="social-link">🎵</a>
          <a href="#" class="social-link">💬</a>
        </div>
      </div>
      
      <!-- 右侧文章列表 -->
      <div class="posts-section">
        <!-- 分类筛选 -->
        <div class="categories-container sweet-card">
          <div class="category-title gradient-text">文章分类</div>
          <div class="categories-list">
            <div 
              v-for="category in categories" 
              :key="category.id" 
              class="category-item"
              :class="{ 'active': selectedCategory === category.id }"
              @click="filterByCategory(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- 文章列表 -->
        <div v-if="filteredPosts.length" class="posts-list">
          <div 
            v-for="post in filteredPosts" 
            :key="post.id" 
            class="post-card sweet-card"
            @mouseenter="animatePostIcon(post.id)"
            @mouseleave="stopPostIconAnimation(post.id)"
          >
            <div class="post-header">
              <h3 class="post-title" @click="navigateToPost(post.id)">
                {{ post.title }}
                <span 
                  class="post-icon" 
                  :class="{ 'animated': animatedPostId === post.id }"
                >{{ post.icon }}</span>
              </h3>
              <span class="post-date">{{ formatDate(post.date) }}</span>
            </div>
            <div class="post-cover" v-if="post.coverImage">
              <img :src="post.coverImage" :alt="post.title" />
            </div>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            <div class="post-footer">
              <div class="post-tags">
                <span 
                  v-for="tag in post.tags" 
                  :key="tag" 
                  class="post-tag"
                >{{ tag }}</span>
              </div>
              <div class="post-stats">
                <span class="post-stat">👁️ {{ post.views }}</span>
                <span class="post-stat">❤️ {{ post.likes }}</span>
                <span class="post-stat">💬 {{ post.comments }}</span>
              </div>
              <button class="sweet-btn read-more-btn" @click="navigateToPost(post.id)">阅读全文</button>
            </div>
          </div>
        </div>
        
        <!-- 无文章提示 -->
        <div v-else class="no-posts-message sweet-card">
          <div class="sad-cloud float-animation">☁️</div>
          <p>抱歉，找不到符合条件的文章~</p>
          <button class="sweet-btn" @click="resetFilters">查看全部文章</button>
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <button 
            class="pagination-btn" 
            :class="{ 'disabled': currentPage === 1 }"
            @click="prevPage" 
            :disabled="currentPage === 1"
          >上一页</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            class="pagination-btn" 
            :class="{ 'disabled': currentPage === totalPages }"
            @click="nextPage" 
            :disabled="currentPage === totalPages"
          >下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'BlogHome',
  data() {
    return {
      selectedCategory: null,
      currentPage: 1,
      postsPerPage: 5,
      animatedPostId: null,
      stats: {
        posts: 0,
        views: 0,
        likes: 0
      },
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
      allPosts: 'getAllPosts',
      loading: 'getLoading'
    }),
    filteredPosts() {
      let filtered = this.allPosts;
      
      // 按分类筛选
      if (this.selectedCategory && this.selectedCategory !== 1) {
        filtered = filtered.filter(post => post.categoryId === this.selectedCategory);
      }
      
      // 计算总页数
      this.calculateTotalPages(filtered.length);
      
      // 分页
      const startIndex = (this.currentPage - 1) * this.postsPerPage;
      return filtered.slice(startIndex, startIndex + this.postsPerPage);
    },
    totalPages() {
      return Math.ceil(this.allPosts.length / this.postsPerPage);
    }
  },
  created() {
    // 加载文章数据
    this.fetchPosts();
    
    // 默认选择全部分类
    this.selectedCategory = 1;
    
    // 计算统计数据
    this.calculateStats();
  },
  methods: {
    ...mapActions(['fetchPosts']),
    filterByCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.currentPage = 1; // 重置页码
    },
    navigateToPost(postId) {
      this.$router.push({ name: 'PostDetail', params: { id: postId } });
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        window.scrollTo(0, 0);
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
        window.scrollTo(0, 0);
      }
    },
    calculateTotalPages(filteredLength) {
      return Math.ceil(filteredLength / this.postsPerPage);
    },
    resetFilters() {
      this.selectedCategory = 1;
      this.currentPage = 1;
    },
    calculateStats() {
      if (this.allPosts.length > 0) {
        this.stats.posts = this.allPosts.length;
        this.stats.views = this.allPosts.reduce((sum, post) => sum + post.views, 0);
        this.stats.likes = this.allPosts.reduce((sum, post) => sum + post.likes, 0);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    animatePostIcon(postId) {
      this.animatedPostId = postId;
    },
    stopPostIconAnimation(postId) {
      if (this.animatedPostId === postId) {
        this.animatedPostId = null;
      }
    },
    randomFallingStyle() {
      const randomLeft = Math.floor(Math.random() * 100);
      const randomDelay = Math.random() * 5;
      const randomDuration = 5 + Math.random() * 10;
      const randomSize = 10 + Math.random() * 20;
      
      return {
        left: `${randomLeft}%`,
        animationDelay: `${randomDelay}s`,
        animationDuration: `${randomDuration}s`,
        width: `${randomSize}px`,
        height: `${randomSize}px`
      };
    }
  }
};
</script>

<style scoped>
.blog-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部横幅 */
.hero-banner {
  position: relative;
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, var(--primary-pink), var(--primary-blue));
  border-radius: var(--border-radius);
  margin-bottom: 30px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-content {
  text-align: center;
  color: var(--text-light);
  z-index: 2;
  padding: 20px;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* 天气特效 */
.weather-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.falling-item {
  position: absolute;
  top: -20px;
  background-image: url('@/assets/images/petal-placeholder.png');
  background-size: contain;
  opacity: 0.7;
  animation: falling linear infinite;
}

@keyframes falling {
  0% { 
    transform: translateY(-20px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  100% { 
    transform: translateY(320px) rotate(360deg);
    opacity: 0;
  }
}

/* 内容区域 */
.blog-content {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 30px;
}

/* 博主信息区 */
.author-section {
  height: fit-content;
  text-align: center;
  padding: 30px 20px;
}

.author-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 15px;
  border: 5px solid var(--primary-purple);
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.author-bio {
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

.author-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-pink);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.social-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-purple);
  font-size: 1.2rem;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.social-link:hover {
  transform: scale(1.1);
  background-color: var(--primary-pink);
}

/* 文章列表区 */
.posts-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 分类筛选 */
.categories-container {
  padding: 15px;
}

.category-title {
  font-size: 1.2rem;
  margin-bottom: 15px;
  text-align: center;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  background-color: var(--primary-purple);
  transform: translateY(-2px);
}

.category-item.active {
  background-color: var(--primary-pink);
  color: var(--text-light);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 1.1rem;
}

/* 文章卡片 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  padding: 20px;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-title {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: color 0.3s ease;
}

.post-title:hover {
  color: var(--primary-pink);
}

.post-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.post-icon.animated {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
}

.post-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.post-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-bottom: 15px;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.post-card:hover .post-cover img {
  transform: scale(1.05);
}

.post-excerpt {
  margin-bottom: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.post-footer {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-tags {
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

.post-stats {
  display: flex;
  gap: 15px;
}

.post-stat {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.read-more-btn {
  align-self: flex-end;
}

/* 无文章提示 */
.no-posts-message {
  text-align: center;
  padding: 40px 20px;
}

.sad-cloud {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 8px 15px;
  background-color: var(--primary-purple);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(.disabled) {
  background-color: var(--primary-pink);
  transform: translateY(-2px);
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .blog-content {
    grid-template-columns: 1fr;
  }
  
  .hero-banner {
    height: 250px;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>