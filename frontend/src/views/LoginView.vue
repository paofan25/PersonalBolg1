<template>
  <div class="login">
    <div class="login-container sweet-card">
      <h1 class="login-title gradient-text">欢迎回来</h1>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="请输入您的邮箱"
            required
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="请输入密码"
            required
            class="form-control"
          />
        </div>
        
        <div class="form-actions">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="rememberMe" />
            <label for="remember">记住我</label>
          </div>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>
        
        <button type="submit" class="sweet-btn login-btn" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="register-link">
        还没有账号? <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      isLoading: false
    }
  },
  methods: {
    handleLogin() {
      this.isLoading = true;
      
      // 模拟登录请求
      setTimeout(() => {
        this.isLoading = false;
        
        // 重定向到首页
        this.$router.push('/');
      }, 1500);
    }
  }
}
</script>

<style scoped>
.login {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-container {
  max-width: 450px;
  width: 100%;
  padding: 40px;
}

.login-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 30px;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--primary-purple);
  border-radius: var(--border-radius);
  font-family: var(--font-primary);
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-pink);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 5px;
}

.forgot-password {
  color: var(--primary-pink);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: var(--text-secondary);
}

.register-link a {
  color: var(--primary-pink);
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>