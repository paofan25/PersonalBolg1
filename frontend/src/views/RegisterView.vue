<template>
  <div class="register-container">
    <div class="register-card">
      <div class="card-header">
        <h2>加入甜梦星球</h2>
        <div class="mascot">🌟</div>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <input 
              v-model="username" 
              type="text" 
              required 
              placeholder="请输入用户名"
              :class="{ 'error': errors.username }"
            >
            <span class="input-icon">👤</span>
          </div>
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <div class="input-wrapper">
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="请输入邮箱"
              :class="{ 'error': errors.email }"
            >
            <span class="input-icon">✉️</span>
          </div>
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="请输入密码"
              :class="{ 'error': errors.password }"
            >
            <span 
              class="input-icon clickable" 
              @click="togglePassword"
            >
              {{ showPassword ? '🙈' : '🙊' }}
            </span>
          </div>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <div class="input-wrapper">
            <input 
              v-model="confirmPassword" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="请再次输入密码"
              :class="{ 'error': errors.confirmPassword }"
            >
            <span class="input-icon">🔒</span>
          </div>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-group terms">
          <label class="checkbox-label">
            <input type="checkbox" v-model="agreeTerms">
            <span class="checkbox-text">
              我同意
              <router-link to="/terms" class="terms-link">服务条款</router-link>
              和
              <router-link to="/privacy" class="terms-link">隐私政策</router-link>
            </span>
          </label>
          <span class="error-message" v-if="errors.terms">{{ errors.terms }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading || !agreeTerms">
          {{ isLoading ? '注册中...' : '开启梦幻之旅' }}
          <span class="btn-icon" v-if="!isLoading">✨</span>
          <span class="btn-icon loading" v-else>🌟</span>
        </button>
      </form>

      <div class="card-footer">
        <p>已有账号？ 
          <router-link to="/login" class="login-link">
            立即登录 <span class="link-icon">🎀</span>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterView',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const agreeTerms = ref(false)
    const showPassword = ref(false)
    const isLoading = ref(false)
    const errors = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: ''
    })

    const validateForm = () => {
      let isValid = true
      errors.username = ''
      errors.email = ''
      errors.password = ''
      errors.confirmPassword = ''
      errors.terms = ''

      if (!username.value) {
        errors.username = '请输入用户名'
        isValid = false
      } else if (username.value.length < 2) {
        errors.username = '用户名至少需要2个字符'
        isValid = false
      }

      if (!email.value) {
        errors.email = '请输入邮箱地址'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(email.value)) {
        errors.email = '请输入有效的邮箱地址'
        isValid = false
      }

      if (!password.value) {
        errors.password = '请输入密码'
        isValid = false
      } else if (password.value.length < 6) {
        errors.password = '密码至少需要6个字符'
        isValid = false
      }

      if (!confirmPassword.value) {
        errors.confirmPassword = '请确认密码'
        isValid = false
      } else if (confirmPassword.value !== password.value) {
        errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }

      if (!agreeTerms.value) {
        errors.terms = '请同意服务条款和隐私政策'
        isValid = false
      }

      return isValid
    }

    const handleRegister = async () => {
      if (!validateForm()) return

      isLoading.value = true
      try {
        const result = await store.dispatch('auth/register', {
          username: username.value,
          email: email.value,
          password: password.value
        })
        
        if (result && result.redirectTo) {
          console.log('注册成功，重定向到:', result.redirectTo)
          router.push(result.redirectTo)
        } else {
          console.log('注册成功，但没有重定向信息')
          router.push('/profile')
        }
      } catch (error) {
        console.error('注册出错:', error)
        if (error.response?.data?.message) {
          errors.email = error.response.data.message
        } else {
          errors.email = error.message || '注册失败，请稍后重试'
        }
      } finally {
        isLoading.value = false
      }
    }

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    return {
      username,
      email,
      password,
      confirmPassword,
      agreeTerms,
      showPassword,
      isLoading,
      errors,
      handleRegister,
      togglePassword
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-blue) 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 8%),
    radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 8%),
    radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 8%),
    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 8%);
  animation: twinkle 4s ease-in-out infinite alternate;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 30px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-header h2 {
  color: var(--text-primary);
  font-size: 1.8rem;
  margin-bottom: 10px;
  background: linear-gradient(45deg, var(--primary-purple), var(--primary-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mascot {
  font-size: 3rem;
  animation: bounce 2s ease infinite;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 2px solid var(--primary-purple);
  border-radius: 20px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

input:focus {
  outline: none;
  border-color: var(--primary-pink);
  box-shadow: 0 0 0 3px rgba(255, 182, 193, 0.2);
  transform: translateY(-2px);
}

.input-icon {
  position: absolute;
  right: 15px;
  font-size: 1.2rem;
}

.input-icon.clickable {
  cursor: pointer;
}

.terms {
  margin: 10px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.terms-link {
  color: var(--primary-purple);
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  color: var(--primary-pink);
}

.submit-btn {
  background: linear-gradient(45deg, var(--primary-purple), var(--primary-pink));
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 182, 193, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon.loading {
  animation: spin 1s linear infinite;
}

.card-footer {
  text-align: center;
  margin-top: 20px;
}

.login-link {
  color: var(--primary-purple);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.login-link:hover {
  color: var(--primary-pink);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 5px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes twinkle {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 480px) {
  .register-card {
    padding: 20px;
  }

  .card-header h2 {
    font-size: 1.5rem;
  }

  input {
    font-size: 0.9rem;
  }
}
</style>