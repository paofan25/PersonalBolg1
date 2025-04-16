/**
 * 数据库模块 - 使用本地存储实现
 * 实际应用中应该使用真正的后端数据库
 */
class Database {
    constructor() {
        this.initDB();
    }

    initDB() {
        // 初始化数据结构
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('posts')) {
            localStorage.setItem('posts', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('comments')) {
            localStorage.setItem('comments', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('works')) {
            localStorage.setItem('works', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('messages')) {
            localStorage.setItem('messages', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('scores')) {
            localStorage.setItem('scores', JSON.stringify([]));
        }
    }

    // 通用CRUD操作
    getAll(collection) {
        return JSON.parse(localStorage.getItem(collection) || '[]');
    }

    getById(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === id);
    }

    save(collection, item) {
        const items = this.getAll(collection);
        
        if (item.id) {
            // 更新现有项目
            const index = items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                items[index] = {...items[index], ...item};
            }
        } else {
            // 创建新项目
            item.id = Date.now();
            item.createdAt = new Date().toISOString();
            items.push(item);
        }
        
        localStorage.setItem(collection, JSON.stringify(items));
        return item;
    }

    delete(collection, id) {
        const items = this.getAll(collection);
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(collection, JSON.stringify(filteredItems));
        return id;
    }

    query(collection, predicate) {
        const items = this.getAll(collection);
        return items.filter(predicate);
    }
}

// 导出单例
const db = new Database();
export default db;