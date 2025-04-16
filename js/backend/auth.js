/**
 * 认证模块 - 处理用户注册、登录和会话管理
 */
import db from './db.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.loadSession();
    }

    // 从本地存储加载会话
    loadSession() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            return true;
        }
        return false;
    }

    // 注册新用户
    async register(userData) {
        const { username, email, password, confirmPassword, avatar } = userData;
        
        // 验证数据
        if (!username || !email || !password) {
            throw new Error('用户名、邮箱和密码不能为空');
        }
        
        if (password !== confirmPassword) {
            throw new Error('两次输入的密码不一致');
        }
        
        // 检查用户名和邮箱是否已存在
        const existingUser = db.query('users', user => 
            user.username === username || user.email === email
        );
        
        if (existingUser.length > 0) {
            throw new Error('用户名或邮箱已被注册');
        }
        
        // 创建用户对象
        const newUser = {
            username,
            email,
            // 实际应用中应使用加密密码
            password: await this.hashPassword(password),
            avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        // 保存用户
        const savedUser = db.save('users', newUser);
        
        // 删除密码字段
        const { password: _, ...userWithoutPassword } = savedUser;
        
        // 设置当前用户
        this.currentUser = userWithoutPassword;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        return userWithoutPassword;
    }

    // 用户登录
    async login(username, password) {
        if (!username || !password) {
            throw new Error('用户名和密码不能为空');
        }
        
        // 查找用户
        const users = db.getAll('users');
        const user = users.find(u => u.username === username);
        
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        
        // 验证密码
        const isPasswordValid = await this.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('用户名或密码错误');
        }
        
        // 删除密码字段
        const { password: _, ...userWithoutPassword } = user;
        
        // 设置当前用户
        this.currentUser = userWithoutPassword;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        return userWithoutPassword;
    }

    // 注销
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        return true;
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否已登录
    isLoggedIn() {
        return !!this.currentUser;
    }

    // 更新用户信息
    async updateProfile(userData) {
        if (!this.isLoggedIn()) {
            throw new Error('未登录');
        }
        
        const updatedUser = {
            ...this.currentUser,
            ...userData,
            id: this.currentUser.id
        };
        
        // 保存更新后的用户信息
        const savedUser = db.save('users', updatedUser);
        
        // 更新当前用户
        this.currentUser = savedUser;
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        
        return savedUser;
    }

    // 密码哈希（简化版，实际应用中应使用bcrypt等）
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 验证密码
    async verifyPassword(password, hashedPassword) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hashedPassword;
    }
}

// 导出单例
const authService = new AuthService();
export default authService;