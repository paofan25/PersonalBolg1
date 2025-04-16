const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { validatePassword } = require('../utils/validation')

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    })
  }
}

// 更新用户个人信息
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, github, website } = req.body

    // 检查用户名是否已被使用
    const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该用户名已被使用'
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        bio,
        github,
        website,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password')

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    })
  }
}

// 更新用户密码
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // 获取用户信息（包含密码）
    const user = await User.findById(req.user.id)

    // 验证当前密码
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      })
    }

    // 验证新密码格式
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: '新密码必须包含至少6个字符'
      })
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.updatedAt = Date.now()
    await user.save()

    res.json({
      success: true,
      message: '密码更新成功'
    })
  } catch (error) {
    console.error('更新密码失败:', error)
    res.status(500).json({
      success: false,
      message: '更新密码失败'
    })
  }
}

// 更新用户头像
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password')

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('更新头像失败:', error)
    res.status(500).json({
      success: false,
      message: '更新头像失败'
    })
  }
}

// 更新通知设置
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { email, system } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'settings.notifications': {
          email,
          system
        },
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password')

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('更新通知设置失败:', error)
    res.status(500).json({
      success: false,
      message: '更新通知设置失败'
    })
  }
}