import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 创建Vue实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  console.error('错误组件:', vm)
  console.error('错误信息:', info)
}

// 挂载Vue应用
app.use(store).use(router).mount('#app')