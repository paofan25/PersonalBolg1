module.exports = {
  // JWT密钥
  jwtSecret: process.env.JWT_SECRET || 'mysecretkey',

  // MongoDB连接URL
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/blog',

  // 服务器端口
  port: process.env.PORT || 5000,

  // 其他配置项...
}; 