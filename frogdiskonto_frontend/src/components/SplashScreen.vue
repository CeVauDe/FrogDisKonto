<template>
  <motion.div
    class="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center z-50"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :exit="{ opacity: 0 }"
    :transition="{ duration: 0.5, ease: 'easeOut' }"
  >
    <div class="flex flex-col items-center justify-center space-y-8 px-8">
      <motion.div
        class="relative"
        :initial="{ scale: 0, opacity: 0 }"
        :animate="showContent ? { scale: 1, opacity: 1 } : {}"
        :transition="{
          duration: 0.8,
          ease: 'easeOut',
          type: 'spring',
          stiffness: 100,
          damping: 15
        }"
      >
        <motion.div
          class="w-24 h-24 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20"
          :animate="showContent ? { boxShadow: [
            '0 10px 25px rgba(255, 215, 0, 0.15)',
            '0 15px 35px rgba(255, 215, 0, 0.25)',
            '0 10px 25px rgba(255, 215, 0, 0.15)'
          ] } : {}"
          :transition="{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }"
        >
          <motion.img
            :src="spendCastLogo"
            alt="SpendCast Logo"
            class="w-16 h-16 object-contain"
            :animate="{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }"
            :transition="{ duration: 3, repeat: Infinity, ease: 'easeInOut' }"
          />
        </motion.div>

        <motion.div
          class="absolute inset-0 rounded-xl border-2 border-yellow-400/40"
          :initial="{ scale: 1, opacity: 1 }"
          :animate="showContent ? { scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] } : {}"
          :transition="{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }"
        />

        <motion.div
          class="absolute inset-0 rounded-xl border border-yellow-300/30"
          :initial="{ scale: 1, opacity: 1 }"
          :animate="showContent ? { scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] } : {}"
          :transition="{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }"
        />
      </motion.div>

      <motion.div
        class="text-center space-y-2"
        :initial="{ y: 20, opacity: 0 }"
        :animate="showContent ? { y: 0, opacity: 1 } : {}"
        :transition="{ duration: 0.8, delay: 0.4, ease: 'easeOut' }"
      >
        <motion.h1
          class="text-3xl font-medium text-primary tracking-tight"
          :animate="showContent ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}"
          :style="{
            background: 'linear-gradient(90deg, var(--primary), var(--primary), var(--primary))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text'
          }"
          :transition="{ duration: 3, repeat: Infinity, ease: 'easeInOut' }"
        >
          SpendCast
        </motion.h1>

        <motion.p
          class="text-muted-foreground text-sm"
          :initial="{ opacity: 0 }"
          :animate="showContent ? { opacity: 1 } : {}"
          :transition="{ duration: 0.6, delay: 0.8 }"
        >
          Intelligente Ausgaben-Einblicke
        </motion.p>
      </motion.div>

      <motion.div
        class="flex space-x-1"
        :initial="{ opacity: 0 }"
        :animate="showContent ? { opacity: 1 } : {}"
        :transition="{ duration: 0.6, delay: 1.2 }"
      >
        <motion.div
          v-for="index in 3"
          :key="index"
          class="w-2 h-2 bg-yellow-500 rounded-full"
          :animate="{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }"
          :transition="{ duration: 1, repeat: Infinity, delay: (index - 1) * 0.2, ease: 'easeInOut' }"
        />
      </motion.div>
    </div>

    <motion.div
      class="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-xl"
      :animate="{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }"
      :transition="{ duration: 4, repeat: Infinity, ease: 'easeInOut' }"
    />

    <motion.div
      class="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-yellow-300/30 to-transparent rounded-full blur-xl"
      :animate="{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }"
      :transition="{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }"
    />

    <motion.div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-yellow-400/10 via-yellow-400/5 to-transparent rounded-full blur-3xl pointer-events-none"
      :animate="{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }"
      :transition="{ duration: 6, repeat: Infinity, ease: 'easeInOut' }"
    />
  </motion.div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { motion } from "motion-v"
import spendCastLogo from '../assets/pf_logo.png'

const props = defineProps({
  onComplete: { type: Function, required: true }
})

const showContent = ref(false)

onMounted(() => {
  const contentTimer = setTimeout(() => (showContent.value = true), 300)
  const completeTimer = setTimeout(() => props.onComplete(), 3500)
  onUnmounted(() => {
    clearTimeout(contentTimer)
    clearTimeout(completeTimer)
  })
})
</script>

<style scoped>
/* nothing to add; tailwind classes used */
</style>
