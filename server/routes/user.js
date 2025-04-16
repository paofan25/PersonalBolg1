const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const {
  getCurrentUser,
  updateProfile,
  updatePassword,
  updateAvatar,
  updateNotificationSettings
} = require('../controllers/userController')

// 获取当前用户信息
router.get('/me', auth, getCurrentUser)

// 更新用户个人信息
router.put('/profile', auth, updateProfile)

// 更新用户密码
router.put('/password', auth, updatePassword)

// 更新用户头像
router.put('/avatar', auth, updateAvatar)

// 更新通知设置
router.put('/notifications', auth, updateNotificationSettings)

module.exports = router