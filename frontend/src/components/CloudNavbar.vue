<template>
  <nav class="cloud-navbar">
    <div class="cloud-container">
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
      <div class="auth-buttons">
        <button class="sweet-btn login-btn" @click="navigateTo('/login')">登录</button>
        <button class="sweet-btn register-btn" @click="navigateTo('/register')">注册</button>
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
      <div class="mobile-auth-buttons">
        <button class="sweet-btn login-btn" @click="navigateToMobile('/login')">登录</button>
        <button class="sweet-btn register-btn" @click="navigateToMobile('/register')">注册</button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'CloudNavbar',
  data() {
    return {
      navLinks: [
        { text: '首页', path: '/', icon: '🏠' },
        { text: '博客', path: '/blog', icon: '📝' },
        { text: '聊天助手', path: '/chat', icon: '🍡' },
        { text: '小游戏', path: '/games', icon: '🎮' },
        { text: '关于', path: '/about', icon: '✨' }
      ],
      activeLink: '/',
      mobileMenuOpen: false
    };
  },
  mounted() {
    // 根据当前路由设置活动链接
    this.activeLink = this.$route.path;
    
    // 监听路由变化
    this.$router.afterEach((to) => {
      this.activeLink = to.path;
    });
    
    // 添加窗口大小变化事件监听
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  beforeUnmount() {
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    setActiveLink(path) {
      this.activeLink = path;
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    navigateToMobile(path) {
      this.navigateTo(path);
      this.closeMobileMenu();
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      // 当菜单打开时阻止body滚动
      document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
      document.body.style.overflow = '';
    },
    handleResize() {
      // 如果窗口宽度大于768px，关闭移动菜单
      if (window.innerWidth > 768 && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    }
  }
};
</script>

<style scoped>
.cloud-navbar {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 10px 0;
}

.cloud-container {
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
  background-color: var(--primary-purple);
  border-radius: 25px;
  transition: all 0.3s ease;
}

.cloud-link:hover {
  background-color: var(--primary-pink);
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
  border: 2px solid var(--primary-pink);
  color: var(--text-primary);
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
  background-color: var(--primary-pink);
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
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
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
  
  .cloud-container {
    padding: 0 15px;
  }
}

/* 活动链接样式 */
.router-link-active .cloud-link {
  background-color: var(--primary-pink);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>