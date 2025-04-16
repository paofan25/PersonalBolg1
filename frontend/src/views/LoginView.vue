<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">登录</h2>
      </template>
      
      <el-form 
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            native-type="submit"
            :loading="loading"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-links">
        <router-link to="/forgot-password">忘记密码？</router-link>
        <router-link to="/register">注册新账号</router-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'LoginView',
  components: {
    User,
    Lock
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const formRef = ref(null)
    
    const loginForm = ref({
      username: '',
      password: '',
      remember: false
    })
    
    const loading = computed(() => store.state.auth.loading)
    const error = computed(() => store.state.auth.error)
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少6个字符', trigger: 'blur' }
      ]
    }
    
    const handleLogin = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        await store.dispatch('auth/login', loginForm.value)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请重试')
      }
    }
    
    return {
      formRef,
      loginForm,
      loading,
      error,
      rules,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 20px;
}

.login-title {
  text-align: center;
  color: var(--text-color);
  margin: 0;
}

.login-button {
  width: 100%;
}

.login-links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.login-links a {
  color: var(--primary-color);
  text-decoration: none;
}

.login-links a:hover {
  text-decoration: underline;
}

:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
}
</style>