<template>
  <div class="blog">
    <div class="blog-header sweet-card">
      <h1 class="blog-title gradient-text">博客文章</h1>
      <p class="blog-description">分享甜蜜的创意和生活点滴</p>
    </div>
    
    <div class="blog-content">
      <div class="blog-main">
        <div v-if="loading" class="loading-container">
          <div class="loading-animation"></div>
          <p>正在加载文章...</p>
        </div>
        
        <div v-else-if="posts.length" class="posts-grid">
          <div v-for="post in posts" :key="post._id" class="post-card sweet-card"
               @click="goToPost(post._id)">
            <div class="post-image-container">
              <div class="post-image" :style="{ backgroundImage: `url(${post.coverImage || './placeholder.jpg'})` }"></div>
            </div>
            <div class="post-content">
              <h2 class="post-title">{{ post.title }}</h2>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                <span class="post-category">{{ post.category }}</span>
              </div>
              <p class="post-excerpt">{{ post.excerpt }}</p>
              <div class="post-footer">
                <div class="post-tags">
                  <span v-for="(tag, index) in post.tags" :key="index" class="post-tag">
                    {{ tag }}
                  </span>
                </div>
                <button class="read-more sweet-btn">阅读全文</button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-posts sweet-card">
          <div class="empty-icon">📝</div>
          <p>暂无文章</p>
          <p class="empty-suggestion">成为第一个发布文章的人吧！</p>
          <router-link to="/posts/create" class="sweet-btn create-post-btn">创建文章</router-link>
        </div>
      </div>
      
      <div class="blog-sidebar">
        <div class="sidebar-section sweet-card">
          <h3 class="sidebar-title gradient-text">分类</h3>
          <ul class="categories-list">
            <li class="category-item" :class="{ active: activeCategory === null }" 
                @click="filterByCategory(null)">
              <span class="category-icon">📚</span>
              <span class="category-name">全部</span>
            </li>
            <li v-for="category in categories" :key="category._id" class="category-item"
                :class="{ active: activeCategory === category._id }"
                @click="filterByCategory(category._id)">
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </li>
          </ul>
        </div>
        
        <div class="sidebar-section sweet-card">
          <h3 class="sidebar-title gradient-text">标签云</h3>
          <div class="tags-cloud">
            <span v-for="(tag, index) in popularTags" :key="index" class="tag-item"
                  :class="{ active: activeTag === tag }" 
                  @click="filterByTag(tag)">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlogView',
  data() {
    return {
      posts: [],
      loading: true,
      activeCategory: null,
      activeTag: null,
      categories: [
        { _id: '1', name: '旅行日记', icon: '🧳' },
        { _id: '2', name: '美食探索', icon: '🍰' },
        { _id: '3', name: '手工制作', icon: '🧶' },
        { _id: '4', name: '生活随笔', icon: '✏️' }
      ],
      popularTags: ['甜点', '旅行', '手工', '阅读', '音乐', '电影', '宠物', '心情']
    };
  },
  mounted() {
    // 模拟获取文章数据
    setTimeout(() => {
      this.posts = this.getDummyPosts();
      this.loading = false;
    }, 1000);
  },
  methods: {
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
    filterByCategory(categoryId) {
      this.activeCategory = categoryId;
      // 在实际应用中，这里会重新获取筛选后的文章
    },
    filterByTag(tag) {
      this.activeTag = this.activeTag === tag ? null : tag;
      // 在实际应用中，这里会重新获取筛选后的文章
    },
    getDummyPosts() {
      // 模拟文章数据
      return [
        {
          _id: '1',
          title: '樱花季的京都之旅',
          excerpt: '春季的京都被樱花装点得如梦似幻，漫步在古老的街道上，感受千年文化与自然的完美融合...',
          coverImage: 'https://via.placeholder.com/600x400?text=樱花季的京都之旅',
          category: '旅行日记',
          tags: ['旅行', '日本', '樱花'],
          createdAt: '2023-04-12T08:00:00.000Z'
        },
        {
          _id: '2',
          title: '自制云朵棉花糖食谱',
          excerpt: '用简单的材料在家制作蓬松柔软的云朵棉花糖，为下午茶时光增添一抹甜蜜...',
          coverImage: 'https://via.placeholder.com/600x400?text=自制云朵棉花糖食谱',
          category: '美食探索',
          tags: ['甜点', '食谱', '手工'],
          createdAt: '2023-05-06T10:30:00.000Z'
        },
        {
          _id: '3',
          title: '星空主题钩针小物',
          excerpt: '分享一款简单的星星图案钩针小包教程，适合初学者尝试的可爱手工项目...',
          coverImage: 'https://via.placeholder.com/600x400?text=星空主题钩针小物',
          category: '手工制作',
          tags: ['手工', '钩针', '教程'],
          createdAt: '2023-06-18T14:15:00.000Z'
        }
      ];
    }
  }
};
</script>

<style scoped>
.blog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.blog-header {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 30px;
}

.blog-title {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.blog-description {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.blog-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 30px;
}

/* 主内容区 */
.blog-main {
  min-height: 600px;
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

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.post-card {
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.post-image-container {
  flex: 1;
}

.post-image {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.5s ease;
}

.post-card:hover .post-image {
  transform: scale(1.05);
}

.post-content {
  flex: 2;
  padding: 20px;
}

.post-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.post-card:hover .post-title {
  color: var(--primary-pink);
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.post-excerpt {
  color: var(--text-secondary);
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.post-tag {
  padding: 5px 10px;
  background-color: var(--primary-yellow);
  border-radius: 15px;
  font-size: 0.8rem;
}

.read-more {
  padding: 8px 15px;
  font-size: 0.9rem;
}

.empty-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.empty-suggestion {
  color: var(--text-secondary);
  margin: 15px 0;
}

.create-post-btn {
  margin-top: 10px;
}

/* 侧边栏 */
.blog-sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.sidebar-section {
  padding: 20px;
  height: fit-content;
}

.sidebar-title {
  font-size: 1.2rem;
  margin-bottom: 15px;
  text-align: center;
}

.categories-list {
  list-style: none;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.category-item:hover {
  background-color: var(--primary-purple);
  transform: translateX(5px);
}

.category-item.active {
  background-color: var(--primary-pink);
  color: var(--text-light);
}

.category-icon {
  font-size: 1.2rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 5px 10px;
  background-color: var(--primary-yellow);
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.tag-item:hover {
  background-color: var(--primary-purple);
  transform: translateY(-2px);
}

.tag-item.active {
  background-color: var(--primary-pink);
  color: var(--text-light);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .blog-content {
    grid-template-columns: 1fr;
  }
  
  .blog-sidebar {
    order: 1;
  }
  
  .blog-main {
    order: 2;
  }
}

@media (max-width: 768px) {
  .post-card {
    flex-direction: column;
  }
  
  .post-image {
    min-height: 200px;
  }
}
</style>