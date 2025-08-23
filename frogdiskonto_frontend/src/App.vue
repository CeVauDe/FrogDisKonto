<template>
  <div class="min-h-screen bg-background">
      <SplashScreen v-if="showSplash" :onComplete="handleComplete" />
      <ChatBot v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatBot from './components/ChatBot.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import '@fortawesome/fontawesome-free/css/all.css'

const showSplash = ref(true)
function handleComplete() {
  showSplash.value = false
}
</script>

