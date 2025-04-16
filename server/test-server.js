const express = require('express');
const app = express();

// 配置跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '服务器运行正常!' });
});

// 测试API路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API测试成功!' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`测试服务器运行在端口 ${PORT}`);
});