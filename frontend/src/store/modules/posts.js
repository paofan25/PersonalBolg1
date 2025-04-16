import { blogAPI } from '@/api'

// 初始状态
const state = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null
}

// getters
const getters = {
  allPosts: state => state.posts,
  currentPost: state => state.currentPost,
  isLoading: state => state.loading
}

// mutations
const mutations = {
  SET_POSTS(state, posts) {
    state.posts = posts
  },
  SET_CURRENT_POST(state, post) {
    state.currentPost = post
  },
  ADD_POST(state, post) {
    state.posts.unshift(post)
  },
  UPDATE_POST(state, updatedPost) {
    const index = state.posts.findIndex(post => post.id === updatedPost.id)
    if (index !== -1) {
      state.posts.splice(index, 1, updatedPost)
    }
    if (state.currentPost && state.currentPost.id === updatedPost.id) {
      state.currentPost = updatedPost
    }
  },
  REMOVE_POST(state, id) {
    state.posts = state.posts.filter(post => post.id !== id)
    if (state.currentPost && state.currentPost.id === id) {
      state.currentPost = null
    }
  },
  ADD_COMMENT(state, { postId, comment }) {
    if (state.currentPost && state.currentPost.id === postId) {
      if (!state.currentPost.comments) {
        state.currentPost.comments = []
      }
      state.currentPost.comments.push(comment)
    }
  },
  REMOVE_COMMENT(state, { postId, commentId }) {
    if (state.currentPost && state.currentPost.id === postId) {
      state.currentPost.comments = state.currentPost.comments.filter(
        comment => comment.id !== commentId
      )
    }
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

// actions
const actions = {
  async fetchPosts({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await blogAPI.getPosts()
      commit('SET_POSTS', response.data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async fetchPost({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const response = await blogAPI.getPost(id)
      commit('SET_CURRENT_POST', response.data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createPost({ commit }, postData) {
    commit('SET_LOADING', true)
    try {
      const response = await blogAPI.createPost(postData)
      commit('ADD_POST', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updatePost({ commit }, { id, postData }) {
    commit('SET_LOADING', true)
    try {
      const response = await blogAPI.updatePost(id, postData)
      commit('UPDATE_POST', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async deletePost({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      await blogAPI.deletePost(id)
      commit('REMOVE_POST', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async addComment({ commit }, { postId, commentData }) {
    try {
      const response = await blogAPI.addComment(postId, commentData)
      commit('ADD_COMMENT', { postId, comment: response.data })
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  async deleteComment({ commit }, { postId, commentId }) {
    try {
      await blogAPI.deleteComment(postId, commentId)
      commit('REMOVE_COMMENT', { postId, commentId })
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}