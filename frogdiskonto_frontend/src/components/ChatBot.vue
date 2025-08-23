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

    <div class="flex-1 p-4">
      <div class="space-y-4">
        <div v-for="message in messages" :key="message.id">
          <ChatMessage
            :message="message.text"
            :isUser="message.isUser"
            :timestamp="message.timestamp"
          />
        </div>

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
import { ref, onMounted, watch } from 'vue';
import  ChatMessage  from './ChatMessage.vue';
import  ChatInput  from './ChatInput.vue';
import Rectangle1 from '../imports/Rectangle1.vue';

const mockResponses = [
  "Basierend auf deinen Ausgabendaten vom letzten Monat sehe ich tatsächlich eine Verbesserung! Du hast 12% weniger für Restaurants ausgegeben und deine Lebensmittelkosten um 8% reduziert. Soll ich dir eine detaillierte Analyse als Podcast erstellen?",
  "Ja, definitiv! Deine Ausgaben für Transport sind um 15% gesunken. Das entspricht einer Ersparnis von CHF 89. Möchtest du, dass ich dir das als Rapsong zusammenfasse?",
  "Interessante Frage! Lass mich deine Ausgabenmuster analysieren... Ich sehe positive Trends bei deinen Fixkosten. Soll ich dir ein Comic dazu erstellen?",
  "Deine Sparrate hat sich um 6% verbessert! Das zeigt, dass du bewusster mit deinem Geld umgehst. Möchtest du ein Video mit Tipps für weitere Verbesserungen?",
  "Großartig, dass du deine Finanzen reflektierst! Deine Ausgaben für Online-Shopping sind deutlich gesunken. Welches Format bevorzugst du für die Analyse?",
  "Ich kann eine Verbesserung bei deinen variablen Ausgaben feststellen. 18% weniger Impulskäufe als letzten Monat! Soll ich dir das als Podcast erklären?",
  "Deine Budgetdisziplin zahlt sich aus! Die Ausgaben für Unterhaltung sind im Rahmen geblieben. Möchtest du einen Rapsong über deine Erfolge?",
  "Absolut! Besonders bei den Nebenkategorien sehe ich Verbesserungen. Soll ich dir ein Comic mit deinen Top 3 Sparerfolgen erstellen?",
];

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
    const scrollAreaRef = ref(null);

    const scrollToBottom = () => {
      if (scrollAreaRef.value) {
        const scrollContainer = scrollAreaRef.value.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
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
      isTyping.value = true;

      // Simulate bot response delay
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
        messages.value.push(botMessage)

        // messages.value.push(botMessage);
        isTyping.value = false;
      }, 1000 + Math.random() * 2000);
    };

    return {
      messages,
      isTyping,
      scrollAreaRef,
      handleSendMessage,
    };
  },
};
</script>
