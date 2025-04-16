/**
 * 作品展示模块 - 管理个人作品集
 */
import db from './db.js';
import authService from './auth.js';

class WorksService {
    // 获取所有作品
    getAllWorks(category = null) {
        let works = db.getAll('works');
        
        // 按创建时间降序排序
        works.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 如果指定了分类，过滤结果
        if (category) {
            works = works.filter(work => work.category === category);
        }
        
        return works;
    }

    // 获取单个作品详情
    getWorkById(id) {
        const work = db.getById('works', id);
        if (!work) {
            throw new Error('作品不存在');
        }
        
        // 获取作者信息
        const author = db.getById('users', work.authorId);
        if (author) {
            work.author = {
                id: author.id,
                username: author.username,
                avatar: author.avatar
            };
        }
        
        return work;
    }

    // 添加新作品
    createWork(workData) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const { title, description, coverImage, content, category, tags, link } = workData;
        
        if (!title || !description) {
            throw new Error('标题和描述不能为空');
        }
        
        const newWork = {
            title,
            description,
            coverImage: coverImage || '',
            content: content || '',
            category: category || 'other',
            tags: tags || [],
            link: link || '',
            authorId: authService.getCurrentUser().id,
            likes: 0,
            views: 0
        };
        
        return db.save('works', newWork);
    }

    // 更新作品
    updateWork(id, workData) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const work = db.getById('works', id);
        if (!work) {
            throw new Error('作品不存在');
        }
        
        // 检查权限
        if (work.authorId !== authService.getCurrentUser().id) {
            throw new Error('无权限修改此作品');
        }
        
        const { title, description, coverImage, content, category, tags, link } = workData;
        
        if (!title || !description) {
            throw new Error('标题和描述不能为空');
        }
        
        const updatedWork = {
            ...work,
            title,
            description,
            coverImage: coverImage || work.coverImage,
            content: content || work.content,
            category: category || work.category,
            tags: tags || work.tags,
            link: link || work.link,
            updatedAt: new Date().toISOString()
        };
        
        return db.save('works', updatedWork);
    }

    // 删除作品
    deleteWork(id) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const work = db.getById('works', id);
        if (!work) {
            throw new Error('作品不存在');
        }
        
        // 检查权限
        if (work.authorId !== authService.getCurrentUser().id) {
            throw new Error('无权限删除此作品');
        }
        
        return db.delete('works', id);
    }

    // 点赞作品
    likeWork(id) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const work = db.getById('works', id);
        if (!work) {
            throw new Error('作品不存在');
        }
        
        // 检查是否已点赞
        const userId = authService.getCurrentUser().id;
        const likeKey = `work_${id}_likes`;
        const likedUsers = JSON.parse(localStorage.getItem(likeKey) || '[]');
        
        if (likedUsers.includes(userId)) {
            // 取消点赞
            work.likes--;
            const index = likedUsers.indexOf(userId);
            likedUsers.splice(index, 1);
        } else {
            // 添加点赞
            work.likes++;
            likedUsers.push(userId);
        }
        
        localStorage.setItem(likeKey, JSON.stringify(likedUsers));
        return db.save('works', work);
    }

    // 增加浏览量
    increaseViews(id) {
        const work = db.getById('works', id);
        if (!work) {
            throw new Error('作品不存在');
        }
        
        work.views = (work.views || 0) + 1;
        return db.save('works', work);
    }

    // 获取作品分类
    getCategories() {
        const works = db.getAll('works');
        const categories = [...new Set(works.map(work => work.category))];
        return categories;
    }
}

// 导出单例
const worksService = new WorksService();
export default worksService;