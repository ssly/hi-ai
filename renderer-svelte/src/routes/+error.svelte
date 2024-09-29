<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    // 由于 utools 插件必须是打开 index.html 文件，所以这里需要重定向到 /
    if (window.location.pathname.endsWith('/index.html')) {
      goto('/');
    }
  });
</script>

<slot />