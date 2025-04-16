const express = require('express');
const { check } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 注册路由
router.post(
  '/register',
  [
    check('username', '用户名不能为空').not().isEmpty(),
    check('email', '请提供有效的邮箱').isEmail(),
    check('password', '密码至少需要6个字符').isLength({ min: 6 })
  ],
  register
);

// 登录路由
router.post(
  '/login',
  [
    check('username', '用户名不能为空').not().isEmpty(),
    check('password', '密码不能为空').exists()
  ],
  login
);

// 受保护的路由
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put(
  '/password',
  [
    protect,
    check('currentPassword', '当前密码不能为空').not().isEmpty(),
    check('newPassword', '新密码至少需要6个字符').isLength({ min: 6 })
  ],
  updatePassword
);

module.exports = router;