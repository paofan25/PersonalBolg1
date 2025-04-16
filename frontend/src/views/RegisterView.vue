<template>
  <div class="register">
    <div class="register-container sweet-card">
      <h1 class="register-title gradient-text">加入甜梦星球</h1>
      
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="请输入用户名"
            required
            class="form-control"
          />
        </div>
        
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
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="请再次输入密码"
            required
            class="form-control"
          />
        </div>
        
        <div class="form-agreement">
          <input type="checkbox" id="agreement" v-model="agreeTerms" required />
          <label for="agreement">我已阅读并同意<a href="#">服务条款</a>和<a href="#">隐私政策</a></label>
        </div>
        
        <button type="submit" class="sweet-btn register-btn" :disabled="isLoading || !formValid">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <div class="login-link">
        已有账号? <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      isLoading: false
    }
  },
  computed: {
    formValid() {
      return this.username &&
             this.email &&
             this.password &&
             this.confirmPassword === this.password &&
             this.agreeTerms;
    }
  },
  methods: {
    handleRegister() {
      if (!this.formValid) return;
      
      this.isLoading = true;
      
      // 模拟注册请求
      setTimeout(() => {
        this.isLoading = false;
        
        // 重定向到登录页
        this.$router.push('/login');
      }, 1500);
    }
  }
}
</script>

<style scoped>
.register {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.register-container {
  max-width: 500px;
  width: 100%;
  padding: 40px;
}

.register-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 30px;
}

.register-form {
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

.form-agreement {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 25px;
  font-size: 0.9rem;
}

.form-agreement a {
  color: var(--primary-pink);
  text-decoration: none;
}

.form-agreement a:hover {
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: var(--text-secondary);
}

.login-link a {
  color: var(--primary-pink);
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>