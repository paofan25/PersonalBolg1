/**
 * 后端API整合
 */
import authService from './auth.js';
import blogService from './blog.js';
import messageService from './message.js';
import worksService from './works.js';
import scoreService from './score.js';
import db from './db.js';

// 导出所有服务
export {
    authService,
    blogService,
    messageService,
    worksService,
    scoreService,
    db
};

// 初始化演示数据
function initDemoData() {
    // 检查是否已初始化
    if (localStorage.getItem('demoDataInitialized')) {
        return;
    }
    
    try {
        // 创建默认管理员用户
        const adminUser = {
            username: 'admin',
            email: 'admin@example.com',
            password: '21232f297a57a5a743894a0e4a801fc3', // 'admin'的MD5哈希
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        // 保存到用户集合
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (!users.some(u => u.username === adminUser.username)) {
            adminUser.id = Date.now();
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // 创建示例博客文章
        const samplePosts = [
            {
                title: '欢迎来到我的博客',
                content: '<p>这是我的第一篇博客文章！我会在这里分享我的编程经验和生活点滴。</p><p>敬请期待更多内容！</p>',
                coverImage: 'https://source.unsplash.com/random/800x600/?blog',
                tags: ['欢迎', '博客', '介绍'],
                authorId: adminUser.id,
                likes: 5,
                views: 20,
                createdAt: new Date().toISOString()
            },
            {
                title: '我最喜欢的前端框架',
                content: '<p>作为一名前端开发者，我尝试过多种不同的框架。在这篇文章中，我会分享我的使用体验和个人偏好。</p><h3>React</h3><p>React是我的最爱，因为它的组件化设计非常符合我的思维方式。</p><h3>Vue</h3><p>Vue的学习曲线平缓，非常适合初学者。</p>',
                coverImage: 'https://source.unsplash.com/random/800x600/?coding',
                tags: ['前端', '框架', 'React', 'Vue'],
                authorId: adminUser.id,
                likes: 12,
                views: 45,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
            }
        ];
        
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        if (posts.length === 0) {
            samplePosts.forEach((post, index) => {
                post.id = Date.now() + index;
                posts.push(post);
            });
            localStorage.setItem('posts', JSON.stringify(posts));
        }
        
        // 创建示例作品
        const sampleWorks = [
            {
                title: '个人博客网站',
                description: '使用HTML、CSS和JavaScript构建的响应式个人博客网站。',
                coverImage: 'https://source.unsplash.com/random/800x600/?website',
                content: '<p>这是我的第一个完整前端项目，我通过这个项目学习了很多前端开发技术。</p><p>主要功能包括：</p><ul><li>响应式设计</li><li>博客文章展示</li><li>评论系统</li></ul>',
                category: '网站',
                tags: ['HTML', 'CSS', 'JavaScript'],
                link: '#',
                authorId: adminUser.id,
                likes: 8,
                views: 30,
                createdAt: new Date().toISOString()
            },
            {
                title: '贪吃蛇小游戏',
                description: '使用JavaScript实现的经典贪吃蛇游戏，有多种难度级别。',
                coverImage: 'https://source.unsplash.com/random/800x600/?game',
                content: '<p>这是一个简单但有趣的JavaScript小游戏，我在开发过程中学习了很多关于游戏循环和碰撞检测的知识。</p>',
                category: '游戏',
                tags: ['JavaScript', '游戏开发'],
                link: './games/snake.html',
                authorId: adminUser.id,
                likes: 15,
                views: 42,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5天前
            }
        ];
        
        const works = JSON.parse(localStorage.getItem('works') || '[]');
        if (works.length === 0) {
            sampleWorks.forEach((work, index) => {
                work.id = Date.now() + index;
                works.push(work);
            });
            localStorage.setItem('works', JSON.stringify(works));
        }
        
        // 创建示例留言
        const sampleMessages = [
            {
                content: '你的网站设计得真漂亮，很有创意！',
                authorId: null, // 匿名留言
                isAnonymous: true,
                createdAt: new Date().toISOString()
            },
            {
                content: '期待看到更多你的作品和文章！',
                authorId: adminUser.id,
                isAnonymous: false,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2天前
            }
        ];
        
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        if (messages.length === 0) {
            sampleMessages.forEach((message, index) => {
                message.id = Date.now() + index;
                messages.push(message);
            });
            localStorage.setItem('messages', JSON.stringify(messages));
        }
        
        // 初始化游戏分数
        const sampleScores = [
            {
                gameId: 'snake',
                userId: adminUser.id,
                score: 87,
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7天前
            },
            {
                gameId: 'memory',
                userId: adminUser.id,
                score: 120,
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
            }
        ];
        
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        if (scores.length === 0) {
            sampleScores.forEach((score, index) => {
                score.id = Date.now() + index;
                scores.push(score);
            });
            localStorage.setItem('scores', JSON.stringify(scores));
        }
        
        // 标记为已初始化
        localStorage.setItem('demoDataInitialized', 'true');
        
    } catch (error) {
        console.error('初始化演示数据失败:', error);
    }
}

// 在模块加载时初始化演示数据
initDemoData();

// 提供一个全局API对象
window.api = {
    auth: authService,
    blog: blogService,
    message: messageService,
    works: worksService,
    score: scoreService
};