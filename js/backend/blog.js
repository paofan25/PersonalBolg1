/**
 * 博客模块 - 处理文章发布、查询和评论
 */
import db from './db.js';
import authService from './auth.js';

class BlogService {
    // 获取所有文章
    getAllPosts(page = 1, limit = 10) {
        const posts = db.getAll('posts');
        
        // 按创建时间降序排序
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 实现分页
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedPosts = posts.slice(startIndex, endIndex);
        
        return {
            posts: paginatedPosts,
            totalPosts: posts.length,
            currentPage: page,
            totalPages: Math.ceil(posts.length / limit)
        };
    }

    // 获取单篇文章
    getPostById(id) {
        const post = db.getById('posts', id);
        if (!post) {
            throw new Error('文章不存在');
        }
        
        // 获取作者信息
        const author = db.getById('users', post.authorId);
        if (author) {
            post.author = {
                id: author.id,
                username: author.username,
                avatar: author.avatar
            };
        }
        
        // 获取评论
        post.comments = this.getCommentsByPostId(id);
        
        return post;
    }

    // 创建新文章
    createPost(postData) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const { title, content, coverImage, tags } = postData;
        
        if (!title || !content) {
            throw new Error('标题和内容不能为空');
        }
        
        const newPost = {
            title,
            content,
            coverImage: coverImage || '',
            tags: tags || [],
            authorId: authService.getCurrentUser().id,
            likes: 0,
            views: 0
        };
        
        return db.save('posts', newPost);
    }

    // 更新文章
    updatePost(id, postData) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const post = db.getById('posts', id);
        if (!post) {
            throw new Error('文章不存在');
        }
        
        // 检查权限
        if (post.authorId !== authService.getCurrentUser().id) {
            throw new Error('无权限修改此文章');
        }
        
        const { title, content, coverImage, tags } = postData;
        
        if (!title || !content) {
            throw new Error('标题和内容不能为空');
        }
        
        const updatedPost = {
            ...post,
            title,
            content,
            coverImage: coverImage || post.coverImage,
            tags: tags || post.tags,
            updatedAt: new Date().toISOString()
        };
        
        return db.save('posts', updatedPost);
    }

    // 删除文章
    deletePost(id) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const post = db.getById('posts', id);
        if (!post) {
            throw new Error('文章不存在');
        }
        
        // 检查权限
        if (post.authorId !== authService.getCurrentUser().id) {
            throw new Error('无权限删除此文章');
        }
        
        // 删除相关评论
        const comments = db.query('comments', comment => comment.postId === id);
        comments.forEach(comment => db.delete('comments', comment.id));
        
        return db.delete('posts', id);
    }

    // 获取文章评论
    getCommentsByPostId(postId) {
        const comments = db.query('comments', comment => comment.postId === postId);
        
        // 按创建时间排序
        comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // 添加作者信息
        return comments.map(comment => {
            const author = db.getById('users', comment.authorId);
            if (author) {
                comment.author = {
                    id: author.id,
                    username: author.username,
                    avatar: author.avatar
                };
            }
            return comment;
        });
    }

    // 添加评论
    addComment(postId, content) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        if (!content) {
            throw new Error('评论内容不能为空');
        }
        
        const post = db.getById('posts', postId);
        if (!post) {
            throw new Error('文章不存在');
        }
        
        const newComment = {
            postId,
            content,
            authorId: authService.getCurrentUser().id
        };
        
        return db.save('comments', newComment);
    }

    // 删除评论
    deleteComment(id) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const comment = db.getById('comments', id);
        if (!comment) {
            throw new Error('评论不存在');
        }
        
        // 检查权限
        if (comment.authorId !== authService.getCurrentUser().id) {
            throw new Error('无权限删除此评论');
        }
        
        return db.delete('comments', id);
    }

    // 点赞文章
    likePost(id) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const post = db.getById('posts', id);
        if (!post) {
            throw new Error('文章不存在');
        }
        
        // 检查是否已点赞
        const userId = authService.getCurrentUser().id;
        const likeKey = `post_${id}_likes`;
        const likedUsers = JSON.parse(localStorage.getItem(likeKey) || '[]');
        
        if (likedUsers.includes(userId)) {
            // 取消点赞
            post.likes--;
            const index = likedUsers.indexOf(userId);
            likedUsers.splice(index, 1);
        } else {
            // 添加点赞
            post.likes++;
            likedUsers.push(userId);
        }
        
        localStorage.setItem(likeKey, JSON.stringify(likedUsers));
        return db.save('posts', post);
    }

    // 增加浏览量
    increaseViews(id) {
        const post = db.getById('posts', id);
        if (!post) {
            throw new Error('文章不存在');
        }
        
        post.views = (post.views || 0) + 1;
        return db.save('posts', post);
    }
}

// 导出单例
const blogService = new BlogService();
export default blogService;