import request from '@/utils/request'

// 获取文章列表
export function getArticles(params) {
    return request({
        url: '/articles',
        method: 'get',
        params
    })
}

// 获取单篇文章
export function getArticle(id) {
    return request({
        url: `/articles/${id}`,
        method: 'get'
    })
}

// 创建文章
export function createArticle(data) {
    return request({
        url: '/articles',
        method: 'post',
        data
    })
}

// 更新文章
export function updateArticle(id, data) {
    return request({
        url: `/articles/${id}`,
        method: 'put',
        data
    })
}

// 删除文章
export function deleteArticle(id) {
    return request({
        url: `/articles/${id}`,
        method: 'delete'
    })
}

// 点赞文章
export function likeArticle(id) {
    return request({
        url: `/articles/${id}/like`,
        method: 'post'
    })
}

// 取消点赞
export function unlikeArticle(id) {
    return request({
        url: `/articles/${id}/like`,
        method: 'delete'
    })
}

// 收藏文章
export function favoriteArticle(id) {
    return request({
        url: `/articles/${id}/favorite`,
        method: 'post'
    })
}

// 取消收藏
export function unfavoriteArticle(id) {
    return request({
        url: `/articles/${id}/favorite`,
        method: 'delete'
    })
} 