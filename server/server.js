const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 初始化Express
const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 根路由 - 添加一个简单的欢迎消息
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '欢迎使用个人博客API',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts'
    }
  });
});

// API路由
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

// 处理静态资源
app.use('/uploads', express.static('uploads'));

// 错误处理中间件
app.use(errorHandler);

// 设置端口
const PORT = process.env.PORT || 5000;

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err, promise) => {
  console.error(`错误: ${err.message}`);
  // 关闭服务器并退出进程
  server.close(() => process.exit(1));
});