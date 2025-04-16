import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BlogView from '../views/BlogView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import GamesView from '../views/GamesView.vue'
import MemoryGame from '../views/games/MemoryGame.vue'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/blog',
    name: 'blog',
    component: BlogView
  },
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: PostDetailView
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatAssistant.vue')
  },
  {
    path: '/games',
    name: 'games',
    component: GamesView
  },
  {
    path: '/games/memory',
    name: 'memory-game',
    component: MemoryGame
  },
  {
    path: '/games/farm',
    name: 'cloud-farm',
    component: () => import('../views/games/CloudFarm.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: {
      requiresAuth: true,
      title: '个人中心 - 甜梦星球'
    }
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('@/views/ArticleList.vue'),
    meta: { title: '文章列表' }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/ArticleDetail.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/article/create',
    name: 'ArticleCreate',
    component: () => import('@/views/ArticleEdit.vue'),
    meta: {
      title: '创建文章',
      requiresAuth: true
    }
  },
  {
    path: '/article/edit/:id',
    name: 'ArticleEdit',
    component: () => import('@/views/ArticleEdit.vue'),
    meta: {
      title: '编辑文章',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      title: '设置'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '甜梦星球'

  // 检查是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果路由需要登录但用户未登录，重定向到登录页面
    if (!store.getters['auth/isLoggedIn']) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router