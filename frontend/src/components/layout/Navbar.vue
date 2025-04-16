<template>
  <nav class="navbar">
    <div class="container">
      <!-- 网站Logo -->
      <div class="logo-container">
        <router-link to="/">
          <div class="logo float-animation">
            <img src="@/assets/images/logo-placeholder.png" alt="甜梦星球" />
            <span class="logo-text gradient-text">甜梦星球</span>
          </div>
        </router-link>
      </div>
      
      <!-- 导航链接 -->
      <div class="nav-links">
        <div v-for="(link, index) in navLinks" :key="index" class="nav-item" 
             :class="{'pulse-animation': activeLink === link.path}">
          <router-link :to="link.path" @click="setActiveLink(link.path)">
            <div class="cloud-link">
              <span class="link-icon">{{ link.icon }}</span>
              <span class="link-text">{{ link.text }}</span>
            </div>
          </router-link>
        </div>
      </div>
      
      <!-- 登录/注册按钮 -->
      <div class="auth-buttons" v-if="!isLoggedIn">
        <button class="btn login-btn" @click="navigateTo('/login')">登录</button>
        <button class="btn btn-primary register-btn" @click="navigateTo('/register')">注册</button>
      </div>
      
      <!-- 用户头像下拉菜单 -->
      <div v-else>
        <UserDropdown />
      </div>
      
      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" @click="toggleMobileMenu">
        <div class="menu-icon" :class="{ 'open': mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ 'open': mobileMenuOpen }">
      <div v-for="(link, index) in navLinks" :key="index" class="mobile-nav-item">
        <router-link :to="link.path" @click="closeMobileMenu">
          <span class="link-icon">{{ link.icon }}</span>
          <span class="link-text">{{ link.text }}</span>
        </router-link>
      </div>
      
      <!-- 移动端认证按钮 -->
      <div class="mobile-auth-buttons" v-if="!isLoggedIn">
        <button class="btn login-btn" @click="navigateToMobile('/login')">登录</button>
        <button class="btn btn-primary register-btn" @click="navigateToMobile('/register')">注册</button>
      </div>
      
      <!-- 移动端用户信息 -->
      <div class="mobile-user-info" v-else>
        <div class="mobile-user-avatar" @click="navigateToMobile('/profile')">
          <UserDropdown :showUsername="false" />
        </div>
        <div class="mobile-user-actions">
          <button class="mobile-action-btn" @click="navigateToMobile('/profile')">
            <span class="action-icon">👤</span>
            <span>个人中心</span>
          </button>
          <button class="mobile-action-btn" @click="handleLogout">
            <span class="action-icon">🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import UserDropdown from '@/components/UserDropdown.vue';

export default {
  name: 'NavigationBar',
  components: {
    UserDropdown
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // 状态
    const navLinks = ref([
      { text: '首页', path: '/', icon: '🏠' },
      { text: '博客', path: '/blog', icon: '📝' },
      { text: '聊天助手', path: '/chat', icon: '🍡' },
      { text: '小游戏', path: '/games', icon: '🎮' },
      { text: '关于', path: '/about', icon: '✨' }
    ]);
    const activeLink = ref('/');
    const mobileMenuOpen = ref(false);
    
    // 计算属性
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn']);
    
    // 方法
    const setActiveLink = (path) => {
      activeLink.value = path;
    };
    
    const navigateTo = (path) => {
      router.push(path);
    };
    
    const navigateToMobile = (path) => {
      router.push(path);
      closeMobileMenu();
    };
    
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
      // 当菜单打开时阻止body滚动
      document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : '';
    };
    
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false;
      document.body.style.overflow = '';
    };
    
    const handleResize = () => {
      // 如果窗口宽度大于768px，关闭移动菜单
      if (window.innerWidth > 768 && mobileMenuOpen.value) {
        closeMobileMenu();
      }
    };
    
    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/login');
        closeMobileMenu();
      } catch (error) {
        console.error('退出登录失败:', error);
      }
    };
    
    // 生命周期钩子
    onMounted(() => {
      // 根据当前路由设置活动链接
      activeLink.value = router.currentRoute.value.path;
      
      // 监听路由变化
      router.afterEach((to) => {
        activeLink.value = to.path;
      });
      
      // 添加窗口大小变化事件监听
      window.addEventListener('resize', handleResize);
      handleResize();
    });
    
    onBeforeUnmount(() => {
      // 移除事件监听器
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      navLinks,
      activeLink,
      mobileMenuOpen,
      isLoggedIn,
      setActiveLink,
      navigateTo,
      navigateToMobile,
      toggleMobileMenu,
      closeMobileMenu,
      handleLogout
    };
  }
};
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 10px 0;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo img {
  width: 50px;
  height: 50px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #FFB6C1, #87CEEB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-item {
  position: relative;
}

.cloud-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #E6E6FA;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.cloud-link:hover {
  background-color: #FFB6C1;
  transform: translateY(-2px);
}

.link-icon {
  font-size: 1.2rem;
}

.link-text {
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.login-btn, .register-btn {
  padding: 8px 15px;
}

.login-btn {
  background: transparent;
  border: 2px solid #FFB6C1;
  color: #5A5A5A;
}

.mobile-menu-btn {
  display: none;
  cursor: pointer;
}

.menu-icon {
  width: 30px;
  height: 24px;
  position: relative;
}

.menu-icon span {
  display: block;
  width: 100%;
  height: 4px;
  background-color: #FFB6C1;
  border-radius: 4px;
  position: absolute;
  transition: all 0.3s ease;
}

.menu-icon span:nth-child(1) {
  top: 0;
}

.menu-icon span:nth-child(2) {
  top: 10px;
}

.menu-icon span:nth-child(3) {
  top: 20px;
}

.menu-icon.open span:nth-child(1) {
  transform: rotate(45deg);
  top: 10px;
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
}

.menu-icon.open span:nth-child(3) {
  transform: rotate(-45deg);
  top: 10px;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: height 0.3s ease;
  z-index: 999;
  flex-direction: column;
  padding: 0 20px;
}

.mobile-menu.open {
  height: calc(100vh - 70px);
  display: flex;
  padding-top: 20px;
}

.mobile-nav-item {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #F8F9FA;
  border-radius: 20px;
  text-align: center;
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.mobile-auth-buttons button {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-links, .auth-buttons {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .container {
    padding: 0 15px;
  }
}

/* 活动链接样式 */
.router-link-active .cloud-link {
  background-color: #FFB6C1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 自定义动画 */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.float-animation {
  animation: float 4s ease-in-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

/* 移动端用户信息 */
.mobile-user-info {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-user-avatar {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 12px;
  color: #000;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.mobile-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.action-icon {
  font-size: 18px;
}

/* 用户下拉菜单 */
:deep(.el-dropdown-menu) {
  padding: 8px 0;
}

:deep(.el-avatar) {
  border: 2px solid #FFB6C1;
  box-shadow: 0 0 10px rgba(255, 182, 193, 0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}

:deep(.el-avatar:hover) {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 182, 193, 0.7);
}
</style>