import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import installElementPlus from './plugins/element';
import './assets/styles/main.css';
import request from './utils/request';

const app = createApp(App);

// 全局配置 axios 实例
app.config.globalProperties.$http = request;

// 安装插件
installElementPlus(app);

app.use(store);
app.use(router);

// 初始化认证状态
store.dispatch('auth/initAuth').finally(() => {
    app.mount('#app');
});