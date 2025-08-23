<template>
  <div :class="['flex gap-3', isUser ? 'justify-end' : 'justify-start', 'mb-4']">
    <template v-if="!isUser">
        <div class="bg-primary text-primary-foreground h-8 w-8 mt-1 flex items-center justify-center rounded-full">
            <img :src="bot" class="h-4 w-4" />
        </div>
    </template>

    <div :class="['flex flex-col max-w-[70%]', isUser ? 'items-end' : 'items-start']">
      <div :class="['px-4 py-2 rounded-2xl', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">
        <p class="break-words">{{ message }}</p>
      </div>
      <span class="text-xs text-muted-foreground mt-1 px-2">
        {{ formatTimestamp(timestamp) }}
      </span>
    </div>

    <template v-if="isUser">
      <div class="bg-secondary text-secondary-foreground h-8 w-8 mt-1 flex items-center justify-center rounded-full">
        <i class="h-4 w-4 fa-regular fa-user"></i>
      </div>
    </template>

  </div>
</template>

<script>
import bot from '../assets/bot.png';

export default {
  name: 'ChatMessage',
  data() {
    return {
    bot
    };
  },
  props: {
    message: {
      type: String,
      required: true,
    },
    isUser: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  methods: {
    formatTimestamp(timestamp) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>
