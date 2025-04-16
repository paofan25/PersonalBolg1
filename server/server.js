require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const blogRoutes = require('./routes/blog');
const worksRoutes = require('./routes/works');
// TODO: 待实现的路由
// const messageRoutes = require('./routes/message');
// const scoreRoutes = require('./routes/score');

const app = express();
const port = process.env.PORT || 5000;

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  });

// 中间件配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API前缀
const apiPrefix = '/api';

// 路由
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/blog`, blogRoutes);
app.use(`${apiPrefix}/works`, worksRoutes);
// TODO: 待实现的路由
// app.use(`${apiPrefix}/message`, messageRoutes);
// app.use(`${apiPrefix}/score`, scoreRoutes);

// 测试路由
app.get(`${apiPrefix}/test`, (req, res) => {
  res.json({
    code: 200,
    message: '服务器运行正常',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('[错误]:', err);
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误',
    data: null
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`[服务器] 已启动于: http://localhost:${port}`);
  console.log(`[API] 基础路径: ${apiPrefix}`);
});