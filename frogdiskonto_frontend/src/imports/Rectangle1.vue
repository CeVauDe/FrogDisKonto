<template>
  <div class="size-full flex justify-end items-center">
    <img :src="logo" alt="PostFinance SpendCast Microphone" class="h-full object-contain" />
  </div>
</template>

<script>
import logo from '../assets/pf_logo.png';

export default {
  name: 'Rectangle1',
  data() {
    return {
    logo
    };
  },
};
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>
