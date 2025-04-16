const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  register,
  login,
  getMe
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// 注册用户
router.post(
  '/register',
  [
    check('username', '用户名是必需的').not().isEmpty(),
    check('username', '用户名长度应在2-50个字符之间').isLength({ min: 2, max: 50 }),
    check('email', '请提供有效的邮箱').isEmail(),
    check('password', '密码至少需要6个字符').isLength({ min: 6 })
  ],
  register
);

// 用户登录
router.post(
  '/login',
  [
    check('email', '请提供有效的邮箱').isEmail(),
    check('password', '密码是必需的').exists()
  ],
  login
);

// 获取当前用户信息
router.get('/me', auth, getMe);

module.exports = router; 