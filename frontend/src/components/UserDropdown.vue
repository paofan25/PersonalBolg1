<template>
  <el-dropdown class="user-dropdown" trigger="click">
    <div class="user-info">
      <el-avatar :size="32" :src="userAvatar">
        {{ userInitial }}
      </el-avatar>
      <span class="username">{{ username }}</span>
    </div>
    
    <template #dropdown>
      <el-dropdown-menu>
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
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { User, Setting, SwitchButton } from '@element-plus/icons-vue'

export default {
  name: 'UserDropdown',
  components: {
    User,
    Setting,
    SwitchButton
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const username = computed(() => store.state.auth.user?.username || '用户')
    const userAvatar = computed(() => store.state.auth.user?.avatar || '')
    const userInitial = computed(() => username.value.charAt(0).toUpperCase())

    const goToProfile = () => {
      router.push('/profile')
    }

    const goToSettings = () => {
      router.push('/settings')
    }

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    }

    return {
      username,
      userAvatar,
      userInitial,
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
}

.username {
  font-size: 14px;
  color: var(--text-color);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-icon) {
  margin-right: 4px;
}
</style> 