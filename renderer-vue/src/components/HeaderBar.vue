<!-- HeaderBar.vue -->
<template>
  <header class="header-bar">
    <div class="header-content">
      <img src="../assets/logo.svg" alt="Logo" class="logo" />
      <h1>Claude AI</h1>
    </div>
  </header>
</template>

<style scoped>
.header-bar {
  width: 100%;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  height: 30px;
  margin-right: 10px;
}

h1 {
  font-size: 1.2em;
  color: #333;
}
</style>
