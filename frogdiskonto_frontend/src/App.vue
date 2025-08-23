<template>
  <div class="min-h-screen bg-background">
    <ChatBot />
  </div>
</template>

<script>
import ChatBot from './components/ChatBot.vue';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  name: 'App',
  components: {
    ChatBot,
  },
};
</script>
