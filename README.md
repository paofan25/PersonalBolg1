# 个人博客网站

一个美观的个人博客网站，包含博客、作品展示、留言板和小游戏等功能。

## 功能特点

- 用户认证系统（注册、登录、个人资料管理）
- 博客文章管理（发布、编辑、删除文章）
- 作品展示（项目作品展示）
- 留言板（访客留言）
- 小游戏（贪吃蛇、记忆配对、拼图游戏）
- 游戏分数排行榜

## 技术栈

### 前端
- HTML5, CSS3, JavaScript
- 纯原生实现，无框架依赖

### 后端
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT认证

## 开始使用

### 前提条件

- Node.js (v14+)
- MongoDB

### 安装

1. 克隆仓库
```
git clone <仓库地址>
cd PersonalBolg1
```

2. 安装后端依赖
```
cd server
npm install
```

3. 配置环境变量
在`server`目录下创建`.env`文件，配置以下变量：
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/personal_blog
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

### 运行

1. 启动MongoDB数据库

2. 启动后端服务器
```
cd server
npm run dev
```

3. 启动前端（使用任意HTTP服务器）
```
# 如果使用http-server
npm install -g http-server
cd ..  # 回到项目根目录
http-server
```

4. 访问网站
打开浏览器，访问 http://localhost:8080

## 使用指南

### 用户功能
- 注册/登录：点击右上角的"登录/注册"按钮
- 个人资料：登录后点击用户头像进入个人资料页面

### 博客功能
- 浏览文章：访问"博客"页面
- 发布文章：登录后在博客页面点击右下角的"+"按钮

### 游戏功能
- 选择游戏：点击导航栏中的"小游戏"下拉菜单
- 查看排行榜：在游戏页面中查看排行榜

## 部署

### 后端部署
1. 配置生产环境变量（修改`server/.env`文件）
```
NODE_ENV=production
```

2. 构建并启动服务器
```
cd server
npm start
```

### 前端部署
将前端文件（HTML、CSS、JS）部署到任意静态文件服务器。

## 贡献

欢迎贡献代码或提出建议，请提交Issue或Pull Request。

## 许可证

MIT