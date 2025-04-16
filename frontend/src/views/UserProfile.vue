<template>
  <div class="profile-container">
    <!-- 背景动画 -->
    <div class="floating-jellyfish"></div>
    
    <!-- 用户信息卡片 -->
    <div class="profile-header sweet-card">
      <div class="profile-avatar-wrapper">
        <div class="profile-avatar" :style="{ backgroundColor: avatarColor }">
          {{ userInitials }}
        </div>
        <div class="online-status" :class="{ online: isOnline }"></div>
      </div>
      
      <div class="profile-info">
        <h1 class="username">{{ user.username }}</h1>
        <p class="bio">{{ user.bio || '这个人很懒，什么都没写~' }}</p>
        
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ user.posts }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ user.followers }}</span>
            <span class="stat-label">粉丝</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ user.following }}</span>
            <span class="stat-label">关注</span>
          </div>
        </div>
        
        <div class="badges">
          <div v-for="badge in user.badges" 
               :key="badge.id" 
               class="badge" 
               :title="badge.description">
            {{ badge.emoji }}
          </div>
        </div>
      </div>
    </div>

    <!-- 内容标签页 -->
    <div class="content-tabs sweet-card">
      <div class="tab-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 文章列表 -->
      <div v-if="currentTab === 'posts'" class="posts-grid">
        <div v-for="post in posts" 
             :key="post.id" 
             class="post-card sweet-card"
             @click="viewPost(post.id)">
          <div class="post-image" v-if="post.coverImage">
            <img :src="post.coverImage" :alt="post.title">
          </div>
          <div class="post-content">
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt }}</p>
            <div class="post-meta">
              <span>{{ formatDate(post.createdAt) }}</span>
              <div class="post-stats">
                <span>👍 {{ post.likes }}</span>
                <span>💭 {{ post.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收藏列表 -->
      <div v-else-if="currentTab === 'favorites'" class="favorites-grid">
        <div v-for="favorite in favorites" 
             :key="favorite.id" 
             class="favorite-card sweet-card">
          <div class="favorite-content">
            <h3>{{ favorite.title }}</h3>
            <p>{{ favorite.description }}</p>
          </div>
        </div>
      </div>

      <!-- 动态列表 -->
      <div v-else class="activities-list">
        <div v-for="activity in activities" 
             :key="activity.id" 
             class="activity-item sweet-card">
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <p>{{ activity.description }}</p>
            <span class="activity-time">{{ formatDate(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'UserProfile',
  setup() {
    const store = useStore()
    const currentTab = ref('posts')
    
    // 模拟用户数据
    const user = ref({
      username: '甜梦用户',
      bio: '热爱分享的小甜饼~',
      posts: 42,
      followers: 128,
      following: 96,
      badges: [
        { id: 1, emoji: '⭐', description: '优质创作者' },
        { id: 2, emoji: '🎨', description: '设计达人' },
        { id: 3, emoji: '🎮', description: '游戏高手' }
      ]
    })

    const isOnline = ref(true)
    
    const tabs = [
      { id: 'posts', label: '文章' },
      { id: 'favorites', label: '收藏' },
      { id: 'activities', label: '动态' }
    ]

    // 模拟文章数据
    const posts = ref([
      {
        id: 1,
        title: '我的第一篇博客',
        excerpt: '今天是个特别的日子...',
        coverImage: null,
        likes: 24,
        comments: 6,
        createdAt: new Date('2024-03-15')
      },
      // 更多文章...
    ])

    // 模拟收藏数据
    const favorites = ref([
      {
        id: 1,
        title: '有趣的设计灵感',
        description: '收集了一些很棒的设计案例'
      },
      // 更多收藏...
    ])

    // 模拟动态数据
    const activities = ref([
      {
        id: 1,
        icon: '✍️',
        description: '发布了新文章《创意无限》',
        timestamp: new Date('2024-03-16')
      },
      // 更多动态...
    ])

    const userInitials = computed(() => {
      return user.value.username.slice(0, 2)
    })

    const avatarColor = computed(() => {
      return `hsl(${Math.random() * 360}, 70%, 80%)`
    })

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const viewPost = (postId) => {
      // 跳转到文章详情页
      console.log('查看文章:', postId)
    }

    return {
      user,
      isOnline,
      currentTab,
      tabs,
      posts,
      favorites,
      activities,
      userInitials,
      avatarColor,
      formatDate,
      viewPost
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: calc(100vh - 60px);
}

.floating-jellyfish {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: 
    radial-gradient(circle at 30% 20%, rgba(255, 182, 193, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(176, 224, 230, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite alternate;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 30px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
  position: relative;
  overflow: hidden;
}

.profile-avatar-wrapper {
  position: relative;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.online-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ccc;
  border: 3px solid white;
}

.online-status.online {
  background-color: #4CAF50;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 2rem;
  margin: 0 0 10px;
  background: linear-gradient(45deg, var(--primary-purple), var(--primary-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bio {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-purple);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.badges {
  display: flex;
  gap: 10px;
}

.badge {
  font-size: 1.5rem;
  padding: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: help;
  transition: transform 0.3s ease;
}

.badge:hover {
  transform: scale(1.2);
}

.content-tabs {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
}

.tab-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--bg-secondary);
  padding-bottom: 10px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-pink);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-btn.active {
  color: var(--primary-pink);
}

.tab-btn.active::after {
  transform: scaleX(1);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.post-image {
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 20px;
}

.post-content h3 {
  margin: 0 0 10px;
  color: var(--text-primary);
}

.post-content p {
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.post-stats {
  display: flex;
  gap: 15px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.favorite-card {
  padding: 20px;
  transition: transform 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-5px);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
}

.activity-icon {
  font-size: 1.5rem;
}

.activity-content {
  flex: 1;
}

.activity-time {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-30px, 20px);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .stats {
    justify-content: center;
  }

  .badges {
    justify-content: center;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }
}

.sweet-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.sweet-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
</style> 