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
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="loginForm.email"
            placeholder="请输入邮箱"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
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
          <el-button 
            type="primary" 
            native-type="submit"
            :loading="isLoading"
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
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Message, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'LoginView',
  components: {
    Message,
    Lock
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const formRef = ref(null)
    const isLoading = ref(false)
    
    const loginForm = ref({
      email: '',
      password: ''
    })
    
    const rules = {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少6个字符', trigger: 'blur' }
      ]
    }
    
    const handleLogin = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            isLoading.value = true
            const result = await store.dispatch('auth/login', loginForm.value)
            ElMessage({
              type: 'success',
              message: '登录成功！'
            })

            if (result && result.redirectTo) {
              router.push(result.redirectTo)
            } else {
              router.push('/')
            }
            
            if (result && result.infoError) {
              ElMessage({
                type: 'warning',
                message: `用户信息获取不完整: ${result.infoError}，部分功能可能受限`
              })
            }
          } catch (error) {
            ElMessage({
              type: 'error',
              message: error.message || '登录失败，请重试'
            })
          } finally {
            isLoading.value = false
          }
        }
      })
    }
    
    return {
      formRef,
      loginForm,
      isLoading,
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