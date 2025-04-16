const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    用户注册
// @access  Public
router.post('/register', [
  check('username', '用户名是必需的').not().isEmpty(),
  check('email', '请输入有效的邮箱').isEmail(),
  check('password', '密码至少需要6个字符').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      errors: errors.array()
    });
  }

  const { username, email, password } = req.body;

  try {
    // 检查用户是否已存在
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        code: 400,
        message: '该邮箱已被注册'
      });
    }

    // 创建新用户
    user = new User({
      username,
      email,
      password
    });

    console.log('创建新用户:', {
      email,
      originalPassword: password
    });

    // 保存用户
    await user.save();

    console.log('用户保存成功:', {
      id: user._id,
      email: user.email,
      hashedPassword: user.password,
      passwordLength: user.password.length
    });

    // 生成JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      code: 200,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   POST /api/auth/login
// @desc    用户登录
// @access  Public
router.post('/login', [
  check('email', '请输入有效的邮箱').isEmail(),
  check('password', '请输入密码').exists()
], async (req, res) => {
  console.log('登录请求体:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('验证错误:', errors.array());
    return res.status(400).json({
      code: 400,
      errors: errors.array()
    });
  }

  const { email, password } = req.body;
  console.log('提取的邮箱和密码:', { email, password: '***' });

  try {
    // 查找用户
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('用户不存在:', email);
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    console.log('找到用户:', {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      passwordField: user.password
    });

    // 验证密码
    console.log('开始验证密码:', {
      inputPassword: password,
      storedPassword: user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    const isMatch = await user.comparePassword(password);
    console.log('密码验证结果:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 生成JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      code: 200,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    获取当前用户信息
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    用户登出
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: '登出成功'
  });
});

// @route   POST /api/auth/reset-password
// @desc    重置密码（临时接口）
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 设置新密码
    const newPassword = '123456';
    user.password = newPassword;  // 让 pre-save 中间件处理加密

    // 保存用户
    await user.save();
    console.log('密码重置成功，新密码已加密保存');

    res.json({
      code: 200,
      message: '密码已重置为: 123456'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router; 