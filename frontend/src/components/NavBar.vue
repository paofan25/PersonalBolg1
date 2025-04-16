<template>
  <el-menu
    :default-active="activeIndex"
    class="nav-menu"
    mode="horizontal"
    router
  >
    <div class="nav-brand">
      <router-link to="/" class="brand-link">
        <img src="@/assets/logo.png" alt="Logo" class="brand-logo">
        <span class="brand-text">个人博客</span>
      </router-link>
    </div>

    <div class="nav-links">
      <el-menu-item index="/">首页</el-menu-item>
      <el-menu-item index="/articles">文章</el-menu-item>
      <el-menu-item index="/about">关于</el-menu-item>
    </div>

    <div class="nav-right">
      <template v-if="isLoggedIn">
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="user-avatar">
            <el-avatar :size="32" :src="currentUser?.avatar">
              {{ currentUser?.username?.charAt(0).toUpperCase() }}
            </el-avatar>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人主页</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <router-link to="/login" custom v-slot="{ navigate }">
          <el-button @click="navigate" text>登录</el-button>
        </router-link>
        <router-link to="/register" custom v-slot="{ navigate }">
          <el-button @click="navigate" type="primary">注册</el-button>
        </router-link>
      </template>
    </div>
  </el-menu>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'NavBar',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const activeIndex = computed(() => route.path)
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const currentUser = computed(() => store.getters['auth/currentUser'])

    const handleCommand = async (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'settings':
          router.push('/settings')
          break
        case 'logout':
          try {
            await store.dispatch('auth/logout')
            ElMessage.success('退出登录成功')
            router.push('/login')
          } catch (error) {
            console.error('退出登录失败:', error)
            ElMessage.error('退出登录失败')
          }
          break
      }
    }

    return {
      activeIndex,
      isLoggedIn,
      currentUser,
      handleCommand
    }
  }
}
</script>

<style scoped>
.nav-menu {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.nav-brand {
  margin-right: 40px;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary);
}

.brand-logo {
  height: 32px;
  margin-right: 10px;
}

.brand-text {
  font-size: 18px;
  font-weight: bold;
}

.nav-links {
  flex-grow: 1;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  cursor: pointer;
  padding: 2px;
}

.user-avatar:hover {
  background-color: var(--el-color-primary-light-9);
  border-radius: 50%;
}

@media (max-width: 768px) {
  .nav-menu {
    padding: 0 10px;
  }

  .brand-text {
    display: none;
  }

  .nav-brand {
    margin-right: 20px;
  }
}
</style>