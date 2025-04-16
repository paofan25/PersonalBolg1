import request from '@/utils/request'

// 用户注册
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request({
    url: '/user/me',
    method: 'get'
  })
}

// 更新用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  })
}

// 更新用户密码
export function updateUserPassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/auth/reset-password',
    method: 'post',
    data
  })
}

// 发送重置密码邮件
export function sendResetPasswordEmail(data) {
  return request({
    url: '/auth/forgot-password',
    method: 'post',
    data
  })
}

// 更新用户头像
export function updateUserAvatar(data) {
  return request({
    url: '/user/avatar',
    method: 'put',
    data
  })
}