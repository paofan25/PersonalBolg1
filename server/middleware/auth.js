const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 保护路由
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从 Bearer token 中提取 token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 从 cookie 中提取 token
    token = req.cookies.token;
  }

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权，请登录'
    });
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户添加到请求对象
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '未授权，请登录'
    });
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