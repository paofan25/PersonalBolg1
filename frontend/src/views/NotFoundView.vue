<template>
  <div class="not-found">
    <div class="not-found-content sweet-card">
      <div class="not-found-image float-animation">
        <div class="cloud-character"></div>
        <div class="error-code">404</div>
      </div>
      <h1 class="not-found-title gradient-text">哎呀，页面走丢了</h1>
      <p class="not-found-message">我们的云朵猫找不到您想要访问的页面了</p>
      <div class="not-found-actions">
        <router-link to="/" class="sweet-btn home-btn">回到首页</router-link>
        <router-link to="/blog" class="sweet-btn blog-btn">浏览博客</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.not-found-content {
  max-width: 600px;
  width: 100%;
  padding: 40px;
  text-align: center;
}

.not-found-image {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
}

.cloud-character {
  width: 100%;
  height: 100%;
  background-color: #E6E6FA;
  border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%;
  position: relative;
}

.cloud-character::before,
.cloud-character::after {
  content: '';
  position: absolute;
  background-color: #E6E6FA;
  border-radius: 50%;
}

.cloud-character::before {
  width: 80px;
  height: 80px;
  top: -20px;
  left: 20px;
}

.cloud-character::after {
  width: 60px;
  height: 60px;
  top: -10px;
  right: 30px;
}

.error-code {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: #FFB6C1;
}

.not-found-title {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.not-found-message {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.home-btn {
  background: linear-gradient(145deg, var(--primary-pink), var(--primary-blue));
}

.blog-btn {
  background: transparent;
  border: 2px solid var(--primary-pink);
  color: var(--text-primary);
}

@media (max-width: 576px) {
  .not-found-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .not-found-title {
    font-size: 2rem;
  }
}
</style>