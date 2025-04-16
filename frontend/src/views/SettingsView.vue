<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>设置</h1>
    </div>

    <el-card class="settings-card">
      <el-tabs v-model="activeTab">
        <!-- 个人信息设置 -->
        <el-tab-pane label="个人信息" name="profile">
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="settings-form"
          >
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar">
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" disabled />
            </el-form-item>

            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="写点什么介绍一下自己吧..."
              />
            </el-form-item>

            <el-form-item label="社交链接">
              <div class="social-links">
                <el-input
                  v-model="profileForm.github"
                  placeholder="GitHub"
                >
                  <template #prefix>
                    <i class="fab fa-github"></i>
                  </template>
                </el-input>

                <el-input
                  v-model="profileForm.website"
                  placeholder="个人网站"
                >
                  <template #prefix>
                    <i class="fas fa-globe"></i>
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="updateProfile" :loading="loading">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 账户安全设置 -->
        <el-tab-pane label="账户安全" name="security">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="settings-form"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="updatePassword" :loading="loading">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notifications">
          <el-form class="settings-form">
            <el-form-item label="邮件通知">
              <el-switch
                v-model="notificationSettings.email"
                @change="updateNotificationSettings"
              />
              <div class="setting-description">
                接收与您的文章相关的评论和点赞通知
              </div>
            </el-form-item>

            <el-form-item label="系统通知">
              <el-switch
                v-model="notificationSettings.system"
                @change="updateNotificationSettings"
              />
              <div class="setting-description">
                接收系统更新和重要公告
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { updateUserProfile, updateUserPassword } from '@/api/user'

export default {
  name: 'SettingsView',
  components: { Plus },

  setup() {
    const store = useStore()
    const activeTab = ref('profile')
    const loading = ref(false)
    const profileFormRef = ref(null)
    const passwordFormRef = ref(null)

    // 个人信息表单
    const profileForm = reactive({
      username: '',
      email: '',
      avatar: '',
      bio: '',
      github: '',
      website: ''
    })

    // 修改密码表单
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 通知设置
    const notificationSettings = reactive({
      email: true,
      system: true
    })

    // 表单验证规则
    const profileRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      bio: [
        { max: 200, message: '不能超过200个字符', trigger: 'blur' }
      ]
    }

    const passwordRules = {
      currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    // 上传相关配置
    const uploadUrl = `${process.env.VUE_APP_BASE_API}/upload`
    const uploadHeaders = {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }

    // 初始化用户数据
    const initUserData = () => {
      const user = store.getters['auth/currentUser']
      if (user) {
        profileForm.username = user.username
        profileForm.email = user.email
        profileForm.avatar = user.avatar
        profileForm.bio = user.bio || ''
        profileForm.github = user.github || ''
        profileForm.website = user.website || ''
      }
    }

    // 更新个人信息
    const updateProfile = async () => {
      if (!profileFormRef.value) return

      try {
        await profileFormRef.value.validate()
        loading.value = true
        
        const response = await updateUserProfile(profileForm)
        await store.dispatch('auth/updateUser', response.data.data)
        
        ElMessage.success('个人信息更新成功')
      } catch (error) {
        console.error('更新个人信息失败:', error)
        ElMessage.error(error.response?.data?.message || '更新失败')
      } finally {
        loading.value = false
      }
    }

    // 更新密码
    const updatePassword = async () => {
      if (!passwordFormRef.value) return

      try {
        await passwordFormRef.value.validate()
        loading.value = true

        await updateUserPassword(passwordForm)
        ElMessage.success('密码修改成功')
        
        // 清空表单
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        passwordFormRef.value.resetFields()
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error(error.response?.data?.message || '修改失败')
      } finally {
        loading.value = false
      }
    }

    // 更新通知设置
    const updateNotificationSettings = () => {
      // TODO: 实现通知设置的保存
      ElMessage.success('通知设置已更新')
    }

    // 头像上传相关方法
    const handleAvatarSuccess = (response) => {
      profileForm.avatar = response.data.url
    }

    const beforeAvatarUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    }

    onMounted(() => {
      initUserData()
    })

    return {
      activeTab,
      loading,
      profileFormRef,
      passwordFormRef,
      profileForm,
      passwordForm,
      notificationSettings,
      profileRules,
      passwordRules,
      uploadUrl,
      uploadHeaders,
      updateProfile,
      updatePassword,
      updateNotificationSettings,
      handleAvatarSuccess,
      beforeAvatarUpload
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-header h1 {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0;
}

.settings-card {
  margin-bottom: 20px;
}

.settings-form {
  max-width: 500px;
  margin: 20px auto;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed var(--border-color);
  border-radius: 50%;
}

.avatar-uploader .avatar-uploader-icon:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-links .el-input {
  width: 100%;
}

.setting-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 5px;
}

@media (max-width: 768px) {
  .settings-page {
    padding: 10px;
  }

  .settings-form {
    padding: 0 10px;
  }

  .social-links {
    flex-direction: column;
  }
}
</style>