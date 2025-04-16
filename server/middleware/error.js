const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose 错误处理
  let error = { ...err };
  error.message = err.message;

  // Mongoose 重复键
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field === 'email' ? '邮箱' : '用户名'}已被使用`;
    error = { message };
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message };
  }

  // Mongoose 无效 ID
  if (err.name === 'CastError') {
    const message = `找不到ID为 ${err.value} 的资源`;
    error = { message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服务器错误'
  });
};

module.exports = errorHandler;