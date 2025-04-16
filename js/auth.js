// 用户认证相关功能
class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        // 检查本地存储中的登录状态
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isLoggedIn = true;
            this.updateUI();
        }
    }

    async register(username, email, password) {
        try {
            // 这里应该是实际的API调用
            // 示例实现使用本地存储
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // 检查用户是否已存在
            if (users.some(user => user.username === username || user.email === email)) {
                throw new Error('用户名或邮箱已存在');
            }

            const newUser = {
                id: Date.now(),
                username,
                email,
                password: await this.hashPassword(password), // 实际应用中应该在后端进行加密
                avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + username,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // 自动登录
            return this.login(username, password);
        } catch (error) {
            throw new Error('注册失败：' + error.message);
        }
    }

    async login(username, password) {
        try {
            // 这里应该是实际的API调用
            // 示例实现使用本地存储
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === username);

            if (!user || !(await this.verifyPassword(password, user.password))) {
                throw new Error('用户名或密码错误');
            }

            // 存储用户信息（不包含密码）
            const userData = { ...user };
            delete userData.password;
            
            localStorage.setItem('userData', JSON.stringify(userData));
            this.currentUser = userData;
            this.isLoggedIn = true;
            this.updateUI();

            return userData;
        } catch (error) {
            throw new Error('登录失败：' + error.message);
        }
    }

    logout() {
        localStorage.removeItem('userData');
        this.currentUser = null;
        this.isLoggedIn = false;
        this.updateUI();
        showToast('已成功退出登录', 'success');
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userAvatar = document.getElementById('userAvatar');

        if (this.isLoggedIn && this.currentUser) {
            loginBtn.style.display = 'none';
            userMenu.style.display = 'flex';
            userAvatar.src = this.currentUser.avatar;
            userAvatar.alt = this.currentUser.username;
        } else {
            loginBtn.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    // 模拟密码加密（实际应用中应该在后端进行）
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // 模拟密码验证
    async verifyPassword(password, hashedPassword) {
        const hash = await this.hashPassword(password);
        return hash === hashedPassword;
    }
}

// 创建 Auth 实例
const auth = new Auth();

// 表单提交处理
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('[name="username"]').value;
            const password = loginForm.querySelector('[name="password"]').value;

            try {
                await auth.login(username, password);
                closeModal('loginModal');
                showToast('登录成功！', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('[name="username"]').value;
            const email = registerForm.querySelector('[name="email"]').value;
            const password = registerForm.querySelector('[name="password"]').value;
            const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;

            if (password !== confirmPassword) {
                showToast('两次输入的密码不一致', 'error');
                return;
            }

            try {
                await auth.register(username, email, password);
                closeModal('registerModal');
                showToast('注册成功！', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
});

// 工具函数
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}