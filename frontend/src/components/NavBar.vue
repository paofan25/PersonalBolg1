<template>
  <el-header class="nav-header">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/" class="logo">
          个人博客
        </router-link>
        <el-menu mode="horizontal" :router="true" class="nav-menu">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/articles">文章</el-menu-item>
          <el-menu-item index="/tags">标签</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>
      </div>
      
      <div class="nav-right">
        <template v-if="isLoggedIn">
          <UserDropdown />
        </template>
        <template v-else>
          <el-button type="primary" @click="goToLogin">登录</el-button>
          <el-button @click="goToRegister">注册</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import UserDropdown from './UserDropdown.vue'

export default {
  name: 'NavBar',
  components: {
    UserDropdown
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])

    const goToLogin = () => {
      router.push('/login')
    }

    const goToRegister = () => {
      router.push('/register')
    }

    return {
      isLoggedIn,
      goToLogin,
      goToRegister
    }
  }
}
</script>

<style scoped>
.nav-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
}

.nav-menu {
  border-bottom: none;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item) {
  font-size: 14px;
}
</style> 