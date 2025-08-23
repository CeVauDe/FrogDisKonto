<template>
  <div class="flex flex-col h-screen w-full max-w-2xl mx-auto">
    <div class="sticky top-0 z-10 p-4 border-b bg-card">
      <div class="flex items-center gap-3">
        <div class="flex-1 pl-2.5">
          <h2 class="font-medium">PostFinance SpendCast</h2>
          <p class="text-sm text-muted-foreground">Rede mit deinen Finanzen.</p>
        </div>
        <div class="w-10 h-10 flex-shrink-0">
          <Rectangle1 />
        </div>
      </div>
    </div>

    <div class="flex-1 p-4 overflow-y-auto" ref="scrollContainer">
      <div class="space-y-4">
        <div v-for="message in messages" :key="message.id">
          <ChatMessage
            :message="message.text"
            :isUser="message.isUser"
            :timestamp="message.timestamp"
          />

        </div>
        <audio v-if="audioUrl" :src="audioUrl" controls autoplay />
        <div v-if="isTyping" class="flex gap-3 justify-start mb-4">
          <div class="bg-muted text-muted-foreground px-4 py-2 rounded-2xl">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ChatInput @sendMessage="handleSendMessage" :disabled="isTyping" />
  </div>
</template>

<script>
import { ref, nextTick, watch } from 'vue';
import  ChatMessage  from './ChatMessage.vue';
import  ChatInput  from './ChatInput.vue';
import Rectangle1 from '../imports/Rectangle1.vue';

export default {
  name: 'ChatBot',
  components: {
    ChatMessage,
    ChatInput,
    Rectangle1,
  },
  setup() {
    const messages = ref([
      {
        id: '1',
        text: "Willkommen bei PostFinance. Ich helfe dir deine Finanzen besser zu verstehen. Wenn du willst kann ich dir auch mit einem Podcast, Video, einem Rapsong oder einem Comic antworten.",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    const isTyping = ref(false);
    const scrollContainer = ref(null);
    const audioUrl = ref(null);

    const scrollToBottom = async () => {
      await nextTick();
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
      }
    };

    watch(messages, () => {
      scrollToBottom();
    });

    const handleSendMessage = async (messageText) => {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      messages.value.push(userMessage);
      scrollToBottom();
      isTyping.value = true;

      setTimeout(async () => {
        const res = await fetch('http://localhost:5000/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: messageText })
        })
        const data = await res.json()
        console.log(data)
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: data.result,
          isUser: false,
          timestamp: new Date(),
        };

        if(data.audio_url !== null) {
          audioUrl.value = data.audio_url;
        } else {
            messages.value.push(botMessage)
        }

        isTyping.value = false;
        scrollToBottom();
      }, 1000 + Math.random() * 2000);
    };

    return {
      messages,
      isTyping,
      handleSendMessage,
      scrollContainer,
      audioUrl
    };
  },
};
</script>
