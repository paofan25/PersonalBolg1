<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="gradient-text float-animation">欢迎来到甜梦星球</h1>
        <p class="hero-subtitle">一个充满可爱与创意的梦幻空间 ✨</p>
        <div class="hero-buttons">
          <router-link to="/blog" class="sweet-btn">浏览博客</router-link>
          <router-link to="/chat" class="sweet-btn chat-btn">聊天助手</router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="placeholder-image float-animation"></div>
      </div>
    </div>
    
    <div class="features-section">
      <h2 class="section-title gradient-text">探索梦幻世界</h2>
      <div class="features-grid">
        <div class="feature-card sweet-card">
          <div class="feature-icon">📝</div>
          <h3>创意博客</h3>
          <p>分享生活点滴，记录美好瞬间</p>
        </div>
        <div class="feature-card sweet-card">
          <div class="feature-icon">🍡</div>
          <h3>糖球助手</h3>
          <p>一个会变形的糯米团子陪你聊天</p>
        </div>
        <div class="feature-card sweet-card">
          <div class="feature-icon">🎮</div>
          <h3>趣味游戏</h3>
          <p>放松心情，享受小游戏的乐趣</p>
        </div>
        <div class="feature-card sweet-card">
          <div class="feature-icon">✨</div>
          <h3>梦幻设计</h3>
          <p>沉浸在柔和的马卡龙色彩世界</p>
        </div>
      </div>
    </div>
    
    <div class="recent-posts-section">
      <h2 class="section-title gradient-text">最新文章</h2>
      <div class="recent-posts-container">
        <p class="empty-message">博客内容即将上线...</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
  padding: 40px 0;
}

.hero-content {
  flex: 1;
  padding-right: 40px;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--text-secondary);
}

.hero-buttons {
  display: flex;
  gap: 20px;
}

.chat-btn {
  background: transparent;
  border: 2px solid var(--primary-pink);
  color: var(--text-primary);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-image {
  width: 300px;
  height: 300px;
  background: linear-gradient(145deg, var(--primary-pink), var(--primary-blue));
  border-radius: 50%;
  position: relative;
  opacity: 0.8;
}

.placeholder-image::before,
.placeholder-image::after {
  content: '';
  position: absolute;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.placeholder-image::before {
  width: 100px;
  height: 100px;
  top: 50px;
  left: 50px;
}

.placeholder-image::after {
  width: 70px;
  height: 70px;
  bottom: 70px;
  right: 50px;
}

.features-section {
  margin-bottom: 60px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin-bottom: 15px;
  color: var(--primary-pink);
}

.feature-card p {
  color: var(--text-secondary);
}

.recent-posts-section {
  margin-bottom: 60px;
}

.empty-message {
  text-align: center;
  padding: 40px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-content {
    padding-right: 0;
    margin-bottom: 40px;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .placeholder-image {
    width: 250px;
    height: 250px;
  }
}

@media (max-width: 576px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-buttons .sweet-btn {
    width: 100%;
  }
}
</style>