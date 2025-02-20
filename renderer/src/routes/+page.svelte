<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  let showInitialPage = true;
  let sessions = {};
  let selectedSession = null;
  let messages = [];
  let newMessage = '';
  let showLeftPanel = true;
  let token = localStorage.getItem('github_token');

  $: sessionList = Object.entries(sessions)
    .filter(([key, _]) => key !== '_rev')
    .map(([_, session]) => session)
    .sort((a, b) => Number(a.id) - Number(b.id));

  let selectedSessionId = null;

  $: if (selectedSessionId && sessions[selectedSessionId]) {
    messages = sessions[selectedSessionId].messages || [];
  } else {
    messages = [];
  }

  function renderMarkdown(content) {
    return marked.parse(content);
  }

  onMount(async () => {
    if (token) {
      showInitialPage = false;
    }

    // 初始化会话
    const dbData = await window.services.db.get('aiSessions')
    console.log('dbData', dbData)
    try {
      if (dbData) {
        sessions = dbData.sessions
        sessions._rev = dbData._rev
  
        console.log('sessions', sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      window.services.db.remove('aiSessions')
    }
  });

  function selectSession(id) {
    selectedSessionId = id;
  }

  async function editSessionName(id) {
    const newName = prompt("请输入新的会话名称:", sessions[id].name);
    if (newName && newName !== sessions[id].name) {
      sessions[id].name = newName;
      await updateDatabase();
    }
  }

  async function deleteSession(id) {
    if (confirm("确定要删除这个会话吗?")) {
      delete sessions[id];
      if (selectedSessionId === id) {
        selectedSessionId = null;
      }
      await updateDatabase();
    }
  }

  async function updateDatabase() {
    const _rev = sessions._rev;
    delete sessions._rev;
    try {
      const result = await window.services.db.put({
        _id: 'aiSessions',
        sessions,
        _rev,
      });
      sessions._rev = result.rev;
    } catch (error) {
      console.error('Error updating database:', error);
    }
  }

  async function createNewSession() {
    const id = Date.now().toString();
    sessions[id] = {
      id,
      name: '新会话',
      messages: [],
    };
    await updateDatabase();
  }

  function createGithubToken() {
    // 调用 createGithubToken() 方法
    token = 'new_token'; // 假设这是返回的 token
    localStorage.setItem('github_token', token);
    showInitialPage = false;
  }

  function modifyToken() {
    showInitialPage = true;
  }

  function cancelModifyToken() {
    showInitialPage = false;
  }

  function toggleLeftPanel() {
    showLeftPanel = !showLeftPanel;
  }

  function sendMessage() {
    // 空方法,您可以在这里实现发送消息的逻辑
    console.log('发送消息:', newMessage);
    // 发送后清空输入框
    newMessage = '';
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault(); // 阻止默认的换行行为
      sendMessage();
    }
  }

  // 其他功能函数...

</script>

<main>
  {#if showInitialPage}
    <div class="initial-page" transition:fade={{duration: 300}}>
      <h2>设置 GitHub Token</h2>
      <input type="text" bind:value={token} placeholder="输入你的 GitHub Token">
      <button class="btn btn-primary" on:click={createGithubToken}>确认</button>
      {#if !showInitialPage}
        <button class="btn btn-secondary" on:click={cancelModifyToken}>取消</button>
      {/if}
    </div>
  {:else}
    <div class="main-page" transition:fade={{duration: 300}}>
      <div class="left-panel" class:hidden={!showLeftPanel}>
        <button class="btn btn-secondary" on:click={modifyToken}>修改 GITHUB_TOKEN</button>
        <button class="btn btn-primary" on:click={createNewSession}>创建新会话</button>
        <div class="sessions-list">
          {#each Object.entries(sessions) as [id, session] (id)}
            {#if id !== '_rev'}
              <div 
                class="session-item" 
                class:selected={selectedSessionId === id}
                on:click={() => selectSession(id)}
              >
                {session.name}
                <div class="session-actions">
                  <button class="icon-button" on:click|stopPropagation={() => editSessionName(id)}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button class="icon-button" on:click|stopPropagation={() => deleteSession(id)}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
      <div class="toggle-button" on:click={toggleLeftPanel}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d={showLeftPanel ? "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" : "M10.59 6L12 7.41 8.83 12 12 16.59 10.59 18l-6-6z"} />
        </svg>
      </div>
      <div class="right-panel">
        <div class="messages-container">
          {#each messages as message}
            <div class="message-wrapper {message.role === 'user' ? 'user' : 'ai'}">
              <div class="message-bubble">
                {@html renderMarkdown(message.content)}
              </div>
            </div>
          {/each}
        </div>
        <div class="input-area">
          <textarea 
            bind:value={newMessage} 
            placeholder="输入消息..." 
            on:keydown={handleKeydown}
          ></textarea>
          <button class="btn btn-primary" on:click={sendMessage}>发送</button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    display: flex;
  }

  .initial-page, .main-page {
    width: 100%;
    height: 100%;
  }

  .initial-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .main-page {
    display: flex;
    position: relative;
  }

  .left-panel {
    width: 200px;
    border-right: 1px solid #ccc;
    transition: width 0.3s, margin-left 0.3s;
    overflow: hidden;
  }

  .left-panel.hidden {
    width: 0;
    margin-left: -200px;
  }

  .toggle-button {
    position: absolute;
    left: 200px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-left: none;
    padding: 10px 5px;
    cursor: pointer;
    transition: left 0.3s;
    z-index: 10;
  }

  .left-panel.hidden + .toggle-button {
    left: 0;
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  .message-wrapper {
    display: flex;
    margin-bottom: 10px;
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message-bubble {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.4;
  }

  .user .message-bubble {
    background-color: #95ec69;
    color: #000;
  }

  .ai .message-bubble {
    background-color: #f0f0f0;
    color: #000;
  }

  .message-bubble :global(p) {
    margin: 0;
  }

  .message-bubble :global(pre) {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
  }

  .input-area {
    display: flex;
    padding: 10px;
    background-color: #f9f9f9;
    border-top: 1px solid #e0e0e0;
  }

  .input-area textarea {
    flex: 1;
    margin-right: 10px;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    resize: vertical;
    min-height: 40px;
  }

  .input-area .btn {
    align-self: flex-end;
  }

  .btn {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    margin: 5px 0;
  }

  .btn-primary {
    background-color: #4CAF50;
    color: white;
  }

  .btn-primary:hover {
    background-color: #45a049;
  }

  .btn-secondary {
    background-color: #f1f1f1;
    color: #333;
  }

  .btn-secondary:hover {
    background-color: #ddd;
  }

  .left-panel .btn {
    width: 100%;
    margin-bottom: 10px;
  }

  input[type="text"] {
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }

  /* 添加更多样式... */

  .sessions-list {
    margin-top: 10px;
  }

  .session-item {
    padding: 10px;
    margin-bottom: 5px;
    background-color: #f9f9f9;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;  /* 添加这行 */
  }

  .session-item:hover {
    background-color: #f0f0f0;
  }

  .session-item.selected {
    background-color: #e0e0e0;
    font-weight: bold;
  }

  .session-actions {
    position: absolute;  /* 改为绝对定位 */
    right: 10px;  /* 距离右边的距离 */
    top: 50%;  /* 垂直居中 */
    transform: translateY(-50%);  /* 精确垂直居中 */
    display: flex;
    opacity: 0;  /* 默认隐藏 */
    transition: opacity 0.3s ease;
  }

  .session-item:hover .session-actions {
    opacity: 1;  /* 悬浮时显示 */
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    margin-left: 5px;
    transition: opacity 0.3s ease;
  }

  .icon-button:hover {
    opacity: 0.8;
  }

  .icon-button svg {
    fill: #333;
    width: 18px;
    height: 18px;
  }
</style>
