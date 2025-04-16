const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   POST /api/users/register
// @desc    注册用户
// @access  Public
router.post(
  '/register',
  [
    check('username', '用户名是必需的').not().isEmpty(),
    check('email', '请输入有效的邮箱').isEmail(),
    check('password', '密码至少需要6个字符').isLength({ min: 6 })
  ],
  userController.register
);

// @route   POST /api/users/login
// @desc    用户登录
// @access  Public
router.post(
  '/login',
  [
    check('email', '请输入有效的邮箱').isEmail(),
    check('password', '密码是必需的').exists()
  ],
  userController.login
);

// @route   GET /api/users/me
// @desc    获取当前用户信息
// @access  Private
router.get('/me', auth, userController.getMe);

module.exports = router; 