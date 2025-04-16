// ... existing code ...
app.use('/api/auth', require('./routes/auth'))
app.use('/api/user', require('./routes/user'))
app.use('/api/upload', require('./routes/upload'))

// 配置静态文件服务
app.use('/uploads', express.static('uploads'))
// ... existing code ... 