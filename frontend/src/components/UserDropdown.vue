<template>
  <el-dropdown class="user-dropdown" trigger="click">
    <div class="user-info">
      <el-avatar 
        :size="40" 
        :src="userAvatar" 
        :style="{ backgroundColor: avatarColor }"
      >
        {{ userInitial }}
      </el-avatar>
      <span v-if="shouldShowUsername" class="username">{{ username }}</span>
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
    </div>
    
    <template #dropdown>
      <el-dropdown-menu>
        <div class="dropdown-user-info">
          <strong>{{ username }}</strong>
          <small>{{ userEmail }}</small>
        </div>
        <el-dropdown-item @click="goToProfile">
          <el-icon><User /></el-icon>
          个人中心
        </el-dropdown-item>
        <el-dropdown-item @click="goToSettings">
          <el-icon><Setting /></el-icon>
          设置
        </el-dropdown-item>
        <el-dropdown-item divided @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { User, Setting, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserDropdown',
  components: {
    User,
    Setting,
    SwitchButton,
    ArrowDown
  },
  props: {
    showUsername: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    
    // 生成随机颜色
    const getRandomColor = () => {
      const hue = Math.floor(Math.random() * 360)
      return `hsl(${hue}, 70%, 75%)`
    }
    
    const avatarColor = ref(getRandomColor())

    // 用户信息
    const username = computed(() => store.state.auth.user?.username || '用户')
    const userEmail = computed(() => store.state.auth.user?.email || '')
    const userAvatar = computed(() => store.state.auth.user?.avatar || '')
    const userInitial = computed(() => username.value.charAt(0).toUpperCase())
    
    // 显示用户名（根据props控制）
    const shouldShowUsername = computed(() => props.showUsername)

    // 导航方法
    const goToProfile = () => {
      router.push('/profile')
    }

    const goToSettings = () => {
      router.push('/settings')
    }

    // 退出登录
    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        ElMessage({
          type: 'success',
          message: '已成功退出登录'
        })
        router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
        ElMessage({
          type: 'error',
          message: '退出登录失败，请重试'
        })
      }
    }

    return {
      username,
      userEmail,
      userAvatar,
      userInitial,
      avatarColor,
      shouldShowUsername,
      goToProfile,
      goToSettings,
      handleLogout
    }
  }
}
</script>

<style scoped>
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-user-info {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-user-info strong {
  font-size: 14px;
  color: var(--text-color-dark);
}

.dropdown-user-info small {
  font-size: 12px;
  color: var(--text-color-light);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
}

:deep(.el-icon) {
  margin-right: 4px;
}
</style> 