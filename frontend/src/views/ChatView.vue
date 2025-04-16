<template>
  <div class="chat">
    <div class="chat-header sweet-card">
      <h1 class="chat-title gradient-text">糖球助手</h1>
      <p class="chat-description">一只会变形的糯米团子，随时陪你聊天解闷~</p>
    </div>
    
    <div class="coming-soon sweet-card">
      <div class="coming-soon-icon float-animation">🍡</div>
      <h2>功能即将上线</h2>
      <p>糖球助手正在赶来的路上，请耐心等待~</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatView'
}
</script>

<style scoped>
.chat {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.chat-header {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 30px;
}

.chat-title {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.chat-description {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.coming-soon {
  text-align: center;
  padding: 60px 20px;
}

.coming-soon-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.coming-soon h2 {
  margin-bottom: 15px;
  color: var(--primary-pink);
}

.coming-soon p {
  color: var(--text-secondary);
}
</style>