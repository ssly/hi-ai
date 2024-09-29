<script>
  import { onMount } from 'svelte';
  import { getMessages, clearMessages } from './MessageManager';

  let messages = [];

  const unsubscribe = getMessages().subscribe(value => {
    messages = value;
    if (messages.length > 0) {
      // 清除前一条消息
      clearTimeout(timeout);
      // 设置定时器在2秒后清除当前消息
      timeout = setTimeout(() => {
        clearMessages();
      }, 1500); // 2秒后清除消息
    }
  });

  let timeout; // 定时器变量
</script>

<style>
  .message {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    transition: opacity 0.5s;
    opacity: 1;
  }
</style>

{#if messages.length > 0}
  <div class="message">{messages[0]}</div>
{/if}
