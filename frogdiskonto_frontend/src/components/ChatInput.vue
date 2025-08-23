<template>
  <form @submit.prevent="handleSubmit" class="flex gap-2 p-4 border-t bg-card">
    <input
      v-model="message"
      @keypress="handleKeyPress"
      placeholder="Type your message..."
      :disabled="disabled"
      class="flex-1"
    />
    <button :disabled="!message.trim() || disabled">Send</button>
  </form>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ChatInput',
  props: {
    onSendMessage: {
      type: Function,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const message = ref('');

    const handleSubmit = () => {
      if (message.value.trim() && !props.disabled) {
        props.onSendMessage(message.value.trim());
        message.value = '';
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return {
      message,
      handleSubmit,
      handleKeyPress,
    };
  },
};
</script>
