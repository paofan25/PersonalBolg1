<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view/>
    </main>
    <footer class="footer">
      <div class="container">
        <p>甜梦星球 © {{ new Date().getFullYear() }} - 一个充满可爱与创意的梦幻空间</p>
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from '@/components/layout/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
@import './assets/css/main.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

.footer {
  background-color: #F8F9FA;
  padding: 20px 0;
  text-align: center;
  color: #8A8A8A;
  margin-top: 40px;
}
</style>