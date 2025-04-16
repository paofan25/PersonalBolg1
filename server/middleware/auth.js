const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

// 保护路由
const authMiddleware = (req, res, next) => {
  // 从header中获取token
  let token = req.header('Authorization');

  // 如果使用Bearer token，需要提取token部分
  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  // 检查是否有token
  if (!token) {
    return res.status(401).json({ msg: '无token，认证失败' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('token验证成功:', decoded);

    // 将用户信息添加到req对象
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('token验证失败:', err);
    res.status(401).json({ msg: 'token无效' });
  }
};

// 授权特定角色
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权，请登录'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '没有权限执行此操作'
      });
    }
    next();
  };
};

module.exports = authMiddleware;