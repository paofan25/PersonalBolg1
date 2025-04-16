import { authAPI } from '@/api'

// 初始状态
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null
}

// getters
const getters = {
  isLoggedIn: state => !!state.token,
  currentUser: state => state.user,
  isAdmin: state => state.user && state.user.role === 'admin'
}

// mutations
const mutations = {
  SET_AUTH(state, { token, user }) {
    state.token = token
    state.user = user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },
  CLEAR_AUTH(state) {
    state.token = null
    state.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

// actions
const actions = {
  async login({ commit }, { username, password }) {
    try {
      const response = await authAPI.login(username, password)
      const { token, user } = response.data
      commit('SET_AUTH', { token, user })
      return user
    } catch (error) {
      throw error
    }
  },
  
  async register({ commit }, userData) {
    try {
      const response = await authAPI.register(userData)
      const { token, user } = response.data
      commit('SET_AUTH', { token, user })
      return user
    } catch (error) {
      throw error
    }
  },
  
  async getProfile({ commit }) {
    try {
      const response = await authAPI.getProfile()
      const user = response.data
      commit('SET_AUTH', { token: state.token, user })
      return user
    } catch (error) {
      throw error
    }
  },
  
  async updateProfile({ commit }, userData) {
    try {
      const response = await authAPI.updateProfile(userData)
      const user = response.data
      commit('SET_AUTH', { token: state.token, user })
      return user
    } catch (error) {
      throw error
    }
  },
  
  logout({ commit }) {
    commit('CLEAR_AUTH')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}