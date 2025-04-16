import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    // 环境变量配置
    envDir: '.',
    // 开发服务器配置
    server: {
      port: 3000,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      // 在这里定义全局变量
      'import.meta.env.VITE_APP_XFYUN_APPID': JSON.stringify(env.VITE_APP_XFYUN_APPID || 'bb840282'),
      'import.meta.env.VITE_APP_XFYUN_API_KEY': JSON.stringify(env.VITE_APP_XFYUN_API_KEY || '178baf6c846eaeb5ea632cdab055b9cd'),
      'import.meta.env.VITE_APP_XFYUN_API_SECRET': JSON.stringify(env.VITE_APP_XFYUN_API_SECRET || 'YjMzMmE3NzczOWExZjQ3ZWI1NWY3OWJi'),
      'import.meta.env.VITE_APP_WEATHER_KEY': JSON.stringify(env.VITE_APP_WEATHER_KEY || '20ad4f9133c94ac69f48192ef755f473'),
      'import.meta.env.VITE_APP_API_URL': JSON.stringify(env.VITE_APP_API_URL || 'http://localhost:5000/api')
    }
  };
});