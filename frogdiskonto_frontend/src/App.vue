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

      // Add user message
      this.messages.push({ text: this.userInput, isUser: true });

      // Simulate bot response
      this.messages.push({ text: "Bot: " + this.userInput, isUser: false });

      // Clear input
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
  width: 100%;
  max-width: 400px;
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full height for mobile */
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
  max-width: 80%; /* Limit message width */
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
  font-size: 16px; /* Larger font for better readability */
}

button {
  margin-left: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px; /* Larger button for better usability */
}

button:hover {
  background-color: #0056b3;
}

/* Responsive styles */
@media (max-width: 600px) {
  .chatbot {
    width: 100%;
    max-width: 100%;
  }

  .input-area {
    flex-direction: column; /* Stack input and button */
  }

  button {
    margin-left: 0;
    margin-top: 5px; /* Space between input and button */
  }
}
</style>
