<template>
  <div class="chat-view">
    <div class="page-header">
      <h1>梦梦助手</h1>
      <p>你在甜梦星球的贴心小助手</p>
    </div>

    <div class="chat-container">
      <div class="chat-intro">
        <div class="intro-avatar">
          <div class="intro-avatar-face happy">
            <div class="intro-eyes">
              <div class="intro-eye"></div>
              <div class="intro-eye"></div>
            </div>
            <div class="intro-mouth"></div>
          </div>
        </div>
        <div class="intro-content">
          <h2>你好，我是梦梦！</h2>
          <p>我是你在甜梦星球的AI助手，可以陪你聊天、提供天气信息、回答问题，或者只是陪伴你度过时光。</p>
          <p>我喜欢甜点、云朵和小动物。很高兴认识你！</p>
          <div class="intro-features">
            <div class="feature">
              <div class="feature-icon">💬</div>
              <div class="feature-text">聊天陪伴</div>
            </div>
            <div class="feature">
              <div class="feature-icon">☁️</div>
              <div class="feature-text">天气查询</div>
            </div>
            <div class="feature">
              <div class="feature-icon">🎮</div>
              <div class="feature-text">游戏推荐</div>
            </div>
          </div>
        </div>
      </div>
      
      <chat-assistant />
    </div>
  </div>
</template>

<script>
import ChatAssistant from '@/components/ChatAssistant.vue';

export default {
  name: 'ChatAssistantView',
  components: {
    ChatAssistant
  }
}
</script>

<style scoped>
.chat-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #ff9ab7;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.2rem;
  color: #666;
}

.chat-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chat-intro {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  max-width: 800px;
  width: 100%;
}

.intro-avatar {
  width: 120px;
  height: 120px;
  margin-right: 30px;
  position: relative;
  flex-shrink: 0;
}

.intro-avatar-face {
  width: 100%;
  height: 100%;
  background-color: #ffefef;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.intro-eyes {
  position: absolute;
  top: 40%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0 20px;
}

.intro-eye {
  width: 15px;
  height: 15px;
  background-color: #333;
  border-radius: 50%;
}

.intro-mouth {
  position: absolute;
  bottom: 30%;
  left: 30%;
  right: 30%;
  height: 10px;
  background-color: #333;
  border-radius: 10px;
}

.intro-avatar-face.happy .intro-mouth {
  border-radius: 0 0 10px 10px;
  height: 15px;
  bottom: 25%;
}

.intro-content {
  flex: 1;
}

.intro-content h2 {
  color: #ff9ab7;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.intro-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
  font-size: 1rem;
}

.intro-features {
  display: flex;
  margin-top: 20px;
  justify-content: space-between;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 10px;
  width: 30%;
}

.feature-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.feature-text {
  font-size: 14px;
  color: #666;
  text-align: center;
}

@media (max-width: 768px) {
  .chat-intro {
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  .intro-avatar {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .intro-content {
    text-align: center;
  }
}
</style>