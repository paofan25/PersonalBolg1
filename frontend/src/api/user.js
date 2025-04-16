import request from '@/utils/request'

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export function getInfo() {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}

/**
 * 更新用户个人资料
 * @param {Object} data - 用户资料数据
 * @returns {Promise}
 */
export function updateProfile(data) {
  return request({
    url: '/auth/profile',
    method: 'put',
    data
  })
}

/**
 * 用户登出
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 重置密码
 * @param {Object} data - 重置密码数据
 * @returns {Promise}
 */
export function resetPassword(data) {
  return request({
    url: '/auth/reset-password',
    method: 'post',
    data
  })
}

/**
 * 发送密码重置邮件
 * @param {Object} data - 包含用户邮箱
 * @returns {Promise}
 */
export function forgotPassword(data) {
  return request({
    url: '/auth/forgot-password',
    method: 'post',
    data
  })
}

/**
 * 更新用户头像
 * @param {FormData} data - 包含头像文件的FormData
 * @returns {Promise}
 */
export function updateAvatar(data) {
  return request({
    url: '/auth/avatar',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 