/**
 * 留言板模块 - 处理访客留言
 */
import db from './db.js';
import authService from './auth.js';

class MessageService {
    // 获取所有留言
    getAllMessages(page = 1, limit = 10) {
        const messages = db.getAll('messages');
        
        // 按创建时间降序排序
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 实现分页
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedMessages = messages.slice(startIndex, endIndex);
        
        // 添加作者信息
        const messagesWithAuthor = paginatedMessages.map(message => {
            // 匿名留言没有作者ID
            if (!message.authorId) return message;
            
            const author = db.getById('users', message.authorId);
            if (author) {
                message.author = {
                    id: author.id,
                    username: author.username,
                    avatar: author.avatar
                };
            }
            return message;
        });
        
        return {
            messages: messagesWithAuthor,
            totalMessages: messages.length,
            currentPage: page,
            totalPages: Math.ceil(messages.length / limit)
        };
    }

    // 添加留言
    addMessage(content, isAnonymous = false) {
        if (!content) {
            throw new Error('留言内容不能为空');
        }
        
        const newMessage = {
            content,
            isAnonymous
        };
        
        // 如果用户已登录且不是匿名留言，添加作者ID
        if (authService.isLoggedIn() && !isAnonymous) {
            newMessage.authorId = authService.getCurrentUser().id;
        }
        
        return db.save('messages', newMessage);
    }

    // 删除留言
    deleteMessage(id) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        const message = db.getById('messages', id);
        if (!message) {
            throw new Error('留言不存在');
        }
        
        // 检查权限（只有留言作者或管理员可以删除）
        const currentUser = authService.getCurrentUser();
        if (message.authorId !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('无权限删除此留言');
        }
        
        return db.delete('messages', id);
    }

    // 回复留言
    replyToMessage(messageId, content) {
        if (!authService.isLoggedIn()) {
            throw new Error('请先登录');
        }
        
        if (!content) {
            throw new Error('回复内容不能为空');
        }
        
        const message = db.getById('messages', messageId);
        if (!message) {
            throw new Error('留言不存在');
        }
        
        // 创建回复
        const reply = {
            messageId,
            content,
            authorId: authService.getCurrentUser().id
        };
        
        // 保存回复
        const savedReply = db.save('replies', reply);
        
        // 更新留言，添加回复ID
        if (!message.replyIds) {
            message.replyIds = [];
        }
        message.replyIds.push(savedReply.id);
        db.save('messages', message);
        
        return savedReply;
    }

    // 获取留言的所有回复
    getRepliesByMessageId(messageId) {
        const replies = db.query('replies', reply => reply.messageId === messageId);
        
        // 按时间排序
        replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // 添加作者信息
        return replies.map(reply => {
            const author = db.getById('users', reply.authorId);
            if (author) {
                reply.author = {
                    id: author.id,
                    username: author.username,
                    avatar: author.avatar
                };
            }
            return reply;
        });
    }
}

// 导出单例
const messageService = new MessageService();
export default messageService;