import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/styles/main.css';
import request from './utils/request';

const app = createApp(App);

// 全局配置 axios 实例
app.config.globalProperties.$http = request;

app.use(store);
app.use(router);
app.use(ElementPlus);

app.mount('#app');