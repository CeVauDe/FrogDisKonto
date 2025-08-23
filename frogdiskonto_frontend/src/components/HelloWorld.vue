<template>
  <div class="chatbot">
    <div class="chat-window">
      <div class="messages" ref="messages">
        <div v-for="(msg, index) in messages" :key="index" class="message" :class="{'user': msg.isUser, 'bot': !msg.isUser}">
          {{ msg.text }}
        </div>
      </div>
      <div class="input-area">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: '',
      messages: []
    };
  },
  methods: {
    sendMessage() {
      if (this.userInput.trim() === '') return;
      this.messages.push({ text: this.userInput, isUser: true });

      this.messages.push({ text: "Bot: ", isUser: false });

      this.userInput = '';

      // Scroll to the bottom of the chat
      this.$nextTick(() => {
        const messagesContainer = this.$refs.messages;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
.chatbot {
  width: 400px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message {
  margin: 5px 0;
  padding: 8px;
  border-radius: 5px;
}

.user {
  background-color: #d1e7dd;
  align-self: flex-end;
}

.bot {
  background-color: #f8d7da;
  align-self: flex-start;
}

.input-area {
  display: flex;
  padding: 10px;
  background-color: #fff;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  margin-left: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
