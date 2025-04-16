<template>
  <div class="chat-view">
    <ChatAssistant />
  </div>
</template>

<script>
import ChatAssistant from '@/components/ChatAssistant.vue';

export default {
  name: 'ChatView',
  components: {
    ChatAssistant
  }
};
</script>

<style scoped>
.chat-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .chat-view {
    padding: 10px;
  }
}
</style>