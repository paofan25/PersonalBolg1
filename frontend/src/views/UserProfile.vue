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
        <h1 class="username">{{ user ? user.username : '加载中...' }}</h1>
        <p class="bio">{{ user ? (user.bio || '这个人很懒，什么都没写~') : '加载中...' }}</p>
        
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ userStats.posts }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userStats.followers }}</span>
            <span class="stat-label">粉丝</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userStats.following }}</span>
            <span class="stat-label">关注</span>
          </div>
        </div>
        
        <div class="user-actions">
          <el-button type="primary" @click="openEditProfileDialog">
            <el-icon><Edit /></el-icon>
            编辑资料
          </el-button>
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
        <div v-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>暂无文章</h3>
          <p>您还没有发布任何文章</p>
          <el-button type="primary" @click="navigateTo('/blog/new')">
            写第一篇文章
          </el-button>
        </div>
        <div v-else v-for="post in posts" 
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
        <div v-if="favorites.length === 0" class="empty-state">
          <div class="empty-icon">❤️</div>
          <h3>暂无收藏</h3>
          <p>您还没有收藏任何内容</p>
          <el-button type="primary" @click="navigateTo('/blog')">
            浏览文章
          </el-button>
        </div>
        <div v-else v-for="favorite in favorites" 
             :key="favorite.id" 
             class="favorite-card sweet-card"
             @click="viewPost(favorite.postId)">
          <div class="favorite-content">
            <h3>{{ favorite.title }}</h3>
            <p>{{ favorite.description }}</p>
            <div class="favorite-meta">
              <span>{{ formatDate(favorite.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 动态列表 -->
      <div v-else class="activities-list">
        <div v-if="activities.length === 0" class="empty-state">
          <div class="empty-icon">🔔</div>
          <h3>暂无动态</h3>
          <p>您的动态将在这里显示</p>
        </div>
        <div v-else v-for="activity in activities" 
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
    
    <!-- 编辑个人资料对话框 -->
    <el-dialog
      v-model="editProfileDialogVisible"
      title="编辑个人资料"
      width="500px"
    >
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" />
        </el-form-item>
        
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="profileForm.bio"
            type="textarea"
            :rows="3"
            placeholder="介绍一下自己吧..."
          />
        </el-form-item>
        
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="profileForm.email" disabled />
          <div class="form-hint">邮箱暂不支持修改</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editProfileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProfileForm" :loading="profileSubmitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserProfile',
  components: {
    Edit
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const currentTab = ref('posts')
    const isOnline = ref(true)
    const editProfileDialogVisible = ref(false)
    const profileFormRef = ref(null)
    const profileSubmitting = ref(false)
    
    // 用户数据
    const user = computed(() => store.state.auth.user)
    
    // 用户统计
    const userStats = ref({
      posts: 0,
      followers: 0,
      following: 0
    })
    
    // 用户头像相关
    const avatarColor = computed(() => {
      // 根据用户ID生成固定颜色，避免刷新变化
      if (user.value && user.value.id) {
        const hash = hashCode(user.value.id)
        const hue = hash % 360
        return `hsl(${hue}, 70%, 80%)`
      }
      return `hsl(${Math.random() * 360}, 70%, 80%)`
    })
    
    // 用户名首字母
    const userInitials = computed(() => {
      if (user.value && user.value.username) {
        return user.value.username.slice(0, 2)
      }
      return '用户'
    })
    
    // 生成随机数字的辅助函数
    const hashCode = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return Math.abs(hash)
    }
    
    // 标签页配置
    const tabs = [
      { id: 'posts', label: '文章' },
      { id: 'favorites', label: '收藏' },
      { id: 'activities', label: '动态' }
    ]

    // 文章数据
    const posts = ref([])
    
    // 收藏数据
    const favorites = ref([])
    
    // 动态数据
    const activities = ref([])
    
    // 获取用户信息
    const fetchUserData = async () => {
      try {
        if (!user.value) {
          await store.dispatch('auth/getInfo')
        }
        
        // 模拟获取用户统计数据
        userStats.value = {
          posts: Math.floor(Math.random() * 10),
          followers: Math.floor(Math.random() * 100),
          following: Math.floor(Math.random() * 50)
        }
        
        // 模拟获取文章数据
        posts.value = Array(userStats.value.posts).fill(0).map((_, index) => ({
          id: `post-${index}`,
          title: `我的文章 ${index + 1}`,
          excerpt: '这是一篇精彩的文章，点击查看详情...',
          coverImage: index % 2 === 0 ? `https://picsum.photos/id/${index + 10}/300/200` : null,
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 10000000000)
        }))
        
        // 模拟获取收藏数据
        const favCount = Math.floor(Math.random() * 5)
        favorites.value = Array(favCount).fill(0).map((_, index) => ({
          id: `fav-${index}`,
          postId: `post-${index}`,
          title: `收藏的文章 ${index + 1}`,
          description: '这是我收藏的一篇精彩文章...',
          createdAt: new Date(Date.now() - Math.random() * 10000000000)
        }))
        
        // 模拟获取动态数据
        const actCount = Math.floor(Math.random() * 8)
        const actionTypes = ['发表了文章', '评论了文章', '点赞了文章', '关注了用户']
        const icons = ['✍️', '💬', '👍', '🔔']
        
        activities.value = Array(actCount).fill(0).map((_, index) => {
          const typeIndex = Math.floor(Math.random() * actionTypes.length)
          return {
            id: `act-${index}`,
            icon: icons[typeIndex],
            description: `${actionTypes[typeIndex]}《精彩内容 ${index + 1}》`,
            timestamp: new Date(Date.now() - Math.random() * 10000000000)
          }
        })
        
      } catch (error) {
        console.error('获取用户数据失败:', error)
        ElMessage.error('获取用户数据失败，请刷新重试')
      }
    }
    
    // 编辑资料表单
    const profileForm = ref({
      username: '',
      bio: '',
      email: ''
    })
    
    // 表单验证规则
    const profileRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      bio: [
        { max: 200, message: '简介不能超过200个字符', trigger: 'blur' }
      ]
    }
    
    // 打开编辑资料对话框
    const openEditProfileDialog = () => {
      if (user.value) {
        profileForm.value = {
          username: user.value.username || '',
          bio: user.value.bio || '',
          email: user.value.email || ''
        }
      }
      editProfileDialogVisible.value = true
    }
    
    // 提交个人资料表单
    const submitProfileForm = async () => {
      if (!profileFormRef.value) return
      
      await profileFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            profileSubmitting.value = true
            
            // 调用API更新个人资料
            await store.dispatch('auth/updateProfile', {
              username: profileForm.value.username,
              bio: profileForm.value.bio
            })
            
            ElMessage({
              type: 'success',
              message: '个人资料更新成功'
            })
            
            editProfileDialogVisible.value = false
          } catch (error) {
            console.error('更新资料失败:', error)
            ElMessage({
              type: 'error',
              message: '更新资料失败，请重试'
            })
          } finally {
            profileSubmitting.value = false
          }
        }
      })
    }
    
    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    // 查看文章详情
    const viewPost = (postId) => {
      // 跳转到文章详情页
      router.push(`/blog/post/${postId}`)
    }
    
    // 导航跳转
    const navigateTo = (path) => {
      router.push(path)
    }
    
    // 页面加载时获取数据
    onMounted(() => {
      fetchUserData()
    })

    return {
      user,
      userStats,
      isOnline,
      currentTab,
      tabs,
      posts,
      favorites,
      activities,
      userInitials,
      avatarColor,
      formatDate,
      viewPost,
      navigateTo,
      editProfileDialogVisible,
      profileForm,
      profileFormRef,
      profileRules,
      profileSubmitting,
      openEditProfileDialog,
      submitProfileForm
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
  z-index: -1;
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
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 36px;
  font-weight: 500;
  color: white;
  border: 4px solid white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.online-status {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #ccc;
  border: 3px solid white;
}

.online-status.online {
  background-color: #10b981;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 28px;
  margin-bottom: 5px;
  color: var(--text-color-dark);
}

.bio {
  margin-bottom: 20px;
  color: var(--text-color);
  line-height: 1.5;
  font-size: 16px;
}

.stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  font-size: 14px;
  color: var(--text-color-light);
}

.user-actions {
  display: flex;
  gap: 10px;
}

.content-tabs {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  padding: 20px;
}

.tab-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color-light);
  padding-bottom: 10px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 20px;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: rgba(255, 182, 193, 0.1);
}

.tab-btn.active {
  background-color: var(--primary-pink);
  color: white;
}

.posts-grid, .favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.post-card, .favorite-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.post-card:hover, .favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.post-image {
  height: 160px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.post-card:hover .post-image img {
  transform: scale(1.1);
}

.post-content, .favorite-content {
  padding: 16px;
}

.post-content h3, .favorite-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
  color: var(--text-color-dark);
}

.post-content p, .favorite-content p {
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.5;
}

.post-meta, .favorite-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-color-light);
}

.post-stats {
  display: flex;
  gap: 10px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateX(5px);
}

.activity-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 182, 193, 0.2);
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: var(--text-color);
}

.activity-time {
  font-size: 12px;
  color: var(--text-color-light);
}

.empty-state {
  text-align: center;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-light);
  grid-column: 1 / -1;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: var(--text-color-dark);
}

.empty-state p {
  margin-bottom: 20px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-color-light);
  margin-top: 5px;
}

@keyframes float {
  0% { opacity: 0.5; }
  50% { opacity: 0.8; }
  100% { opacity: 0.5; }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .stats {
    justify-content: center;
  }
  
  .user-actions {
    justify-content: center;
  }
  
  .posts-grid, .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style> 