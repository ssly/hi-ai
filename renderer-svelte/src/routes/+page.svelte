<script>
  import { onMount } from 'svelte';
  import { copyText, datebase, open } from '$lib/utils'
  
  let showInitialPage = true;
  let sessions = {};
  let messages = [];
  let newMessage = ''
  let token = ''
  let selectedModel = 'gpt-4o-mini'; // 默认选中 GPT-4o

  let isComposition = false;

  let sendMessageLoadingMap = {};

  $: sessionList = Object.entries(sessions)
    .filter(([key, _]) => key !== '_rev')
    .map(([_, session]) => session)
    .sort((a, b) => Number(a.id) - Number(b.id));

  // 监听selectedModel变化设置到configDbData
  $: if (selectedModel) {
    setConfigDbData({
      selectedModel,
    })
  }

  let selectedSessionId = null;

  $: if (selectedSessionId && sessions[selectedSessionId]) {
    messages = sessions[selectedSessionId].messages || [];
  } else {
    messages = [];
  }

//   const renderer = new marked.Renderer()
//   // 添加一个复制功能
//   renderer.code = ({ raw, lang, text }) => {
//     const content = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
//     return `<code class="${lang}">${lang}</code><button class="copy-button">复制</button><br>
// <pre>${content}</pre>`
//   }
//   marked.setOptions({
//     renderer,
//   })
  function renderMarkdown(content) {
    console.log('renderMarkdown', content)
    if (!content) return ''
    return marked.parse(content);
  }

  function setButtonsCopyFu() {
    const copyButtons = document.querySelectorAll('.copy-button');
    console.log('copyButtons', copyButtons)
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const codeBlock = button.nextElementSibling.nextElementSibling;
        const code = codeBlock.textContent;
        copyText(code)
      })
    })
  }

  onMount(async () => {
    const configDbData = datebase.get('aiConfig')
    console.log('configDbData', configDbData)
    if (configDbData && configDbData.githubToken) {
      token = configDbData.githubToken || ''  
      showInitialPage = false;
      selectedModel = configDbData.selectedModel || 'gpt-4o-mini'
      selectedSessionId = configDbData.selectedSessionId || null
      setTimeout(() => {
        scrollToBottom()
      });
    }

    // 初始化
    const dbData = await datebase.get('aiSessions')
    console.log('dbData', dbData)
    try {
      if (dbData) {
        sessions = dbData.sessions
        sessions._rev = dbData._rev
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      datebase.remove('aiSessions')
    }
  });

  function setConfigDbData(options) {
    const aiConfigDbData = datebase.get('aiConfig')
    console.log('setConfigDbData', options, aiConfigDbData)
    if (aiConfigDbData) {
      datebase.put({
        _id: 'aiConfig',
        githubToken: options.githubToken || aiConfigDbData.githubToken,
        selectedModel: options.selectedModel || aiConfigDbData.selectedModel,
        selectedSessionId: options.selectedSessionId || aiConfigDbData.selectedSessionId,
        _rev: aiConfigDbData._rev,
      })
    } else {
      datebase.put({
        _id: 'aiConfig',
        ...options,
      })
    }
  }

  function selectSession(id) {
    selectedSessionId = id;

    setConfigDbData({
      selectedSessionId: id,
    })

    newMessage = ''; // 切换会话时清空发送框
    scrollToBottom();
    setTimeout(() => {
      setButtonsCopyFu();
    });
  }

  let editingSessionId = null;

  async function startEditSessionName(id, event) {
    event.stopPropagation();
    editingSessionId = id;
  }

  async function finishEditSessionName(id) {
    editingSessionId = null;
    await updateDatabase();
  }

  async function updateDatabase() {
    const _rev = sessions._rev;
    delete sessions._rev;
    try {
      const result = await datebase.put({
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
    const id = Date.now();
    sessions[id] = {
      id,
      name: '',
      messages: [],
    };
    selectedSessionId = id
    await updateDatabase();
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

  function createGithubToken() {
    setConfigDbData({
      githubToken: token,
    })
    showInitialPage = false;
  }

  function modifyToken() {
    showInitialPage = true;
  }

  function cancelModifyToken() {
    showInitialPage = false;
  }

  async function sendMessage() {
    // 空方法,您可以在这里实现发送消息的逻辑
    console.log('发送消息:', newMessage);

    const message = newMessage.trim();
    if (!message) {
      return;
    }

    const userMessage = {
      role: 'user',
      content: message,
    };

    if (!selectedSessionId) {
      createNewSession();
    }

    const session = sessions[selectedSessionId];

    // 如果没有设置 name，则默认取message的前10个字符
    if (!session.name) {
      session.name = message.slice(0, 10);
    }

    session.messages.push(userMessage);

    const thinkingMessage = {
      role: 'assistant',
      content: 'AI正在加速思考中,请等一会~',
      model: selectedModel,
    };

    session.messages.push(thinkingMessage);

    // 发送后清空输入框
    newMessage = '';

    await updateDatabase();
    scrollToBottom();

    // 发送消息，获取回答
    sendMessageLoadingMap = { ...sendMessageLoadingMap, [selectedSessionId]: true };
    console.log('session', session, session.messages, userMessage);



    let assistantMessage = {
      role: 'assistant',
      content: '',
      model: selectedModel,
    }
    session.messages.splice(session.messages.length - 1, 1, assistantMessage);

    const responseStream = await window.services.queryAnswerStream(session.messages.slice(0, -1), selectedModel, data => {
      assistantMessage.content += data.content
      console.log('responseStream', assistantMessage.content)
      
      if (!data.finished) {
        console.log('session.messages', session.messages, assistantMessage) 
        // requestAnimationFrame(scrollToBottom);        
      } else {
        requestAnimationFrame(scrollToBottom); 
        sendMessageLoadingMap = { ...sendMessageLoadingMap, [selectedSessionId]: false };
        updateDatabase();
      }
    });
    // 要删除上一条thinkingMessage
    // session.messages.splice(session.messages.length - 1, 1, assistantMessage);
    // const response = await window.services.queryAnswer(session.messages.slice(0, -1), selectedModel);
    // console.log('response', response);

    // const assistantMessage = {
    //   role: 'assistant',
    //   content: response.content,
    //   model: response.model,
    // };
    // // 要删除上一条thinkingMessage
    // session.messages.splice(session.messages.length - 1, 1, assistantMessage);

    // await updateDatabase();
    // sendMessageLoadingMap = { ...sendMessageLoadingMap, [selectedSessionId]: false };

    // scrollToBottom();
  }

  function handleOpenUrl(url) {
    console.log('url', url)
    open(url)
  }

  function handleKeydown(event) {
    // 处理中文输入法
    if (isComposition) {
      return
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 阻止默认的换行为
      sendMessage();
    }
  }

  // 其他功能函数...
  function autoFocus(node) {
    node.focus();
  }

  function scrollToBottom(time = 100) {
    const chatContainer = document.querySelector('.messages-container-wrapper');
    console.log('chatContainer', chatContainer)
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, time);
  }
</script>

<main>
  {#if showInitialPage}
    <div class="initial-page">
      <h2>设置 GitHub Token</h2>
      <ul>
        <li>
          <a href="https://github.com/marketplace/models" target="_blank" on:click={() =>handleOpenUrl('https://github.com/marketplace/models')}>Github Models 申请地址</a>
        </li>
        <li>
          <a href="https://github.com/settings/tokens" target="_blank" on:click={() => handleOpenUrl('https://github.com/settings/tokens')}>Github Token获取地址</a>
          申请一个Tokens(classic)
        </li>
      </ul>
      <input class="token-input" type="password" bind:value={token} placeholder="输入你的 GitHub Token">
      <div class="token-actions">
        <button class="btn btn-primary" on:click={createGithubToken}>确认</button>
        <button class="btn btn-secondary" on:click={cancelModifyToken}>取消</button>
      </div>
    </div>
  {:else}
    <div class="main-page">
      <div class="left-panel">
        <div class="left-panel-header">
          <button class="btn btn-secondary" on:click={modifyToken}>修改 GITHUB_TOKEN</button>
          <div class="model-selection">
            <label>
              <input type="radio" bind:group={selectedModel} value="gpt-4o">
              4o
            </label>
            <label>
              <input type="radio" bind:group={selectedModel} value="gpt-4o-mini">
              4o-mini
            </label>
          </div>
          <button class="btn btn-primary" on:click={createNewSession}>创建新会话</button>
        </div>
        <div class="sessions-list-wrapper">
          <div class="sessions-list">
            {#each Object.entries(sessions) as [id, session] (id)}
              {#if id !== '_rev'}
                <div 
                  class="session-item" 
                  class:selected={selectedSessionId === id}
                  on:click={() => selectSession(id)}
                >
                  {#if editingSessionId === id}
                    <input 
                      class="session-input"
                      type="text" 
                      bind:value={session.name}
                      on:change={() => finishEditSessionName(id)}
                      use:autoFocus
                    />
                  {:else}
                    <span class="session-
                    ">{session.name || '新会话'}</span>
                  {/if}
                  {#if editingSessionId !== id}
                    <div class="session-actions">
                      <button class="icon-button" on:click={(event) => startEditSessionName(id, event)}>
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
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="messages-container-wrapper">
          <div class="messages-container">
            {#each messages as message}
              <div class="message-wrapper {message.role === 'user' ? 'user' : 'ai'}">
                <div class="message-bubble">
                  {@html renderMarkdown(message.content)}
                  {#if message.role === 'assistant'}
                    <div class="model-tag">{message.model}</div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="input-area">
          <textarea 
            bind:value={newMessage} 
            placeholder="输入消息...(Enter发送，Shift+Enter换行)" 
            on:keydown={handleKeydown}
            on:compositionstart={() => isComposition = true}
            on:compositionend={() => isComposition = false}
          ></textarea>
          <button 
            disabled={sendMessageLoadingMap[selectedSessionId] || !newMessage} 
            class="btn btn-primary send-button" 
            on:click={sendMessage}
          >发送</button>
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
  .initial-page .token-input {
    width: 300px;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 0 10px;
  }
  .initial-page .token-actions {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .initial-page .token-actions .btn {
    margin: 0 12px;
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

  .left-panel-header {
    padding: 10px 10px 0 10px;
  }

  .left-panel {
    border-right: 1px solid #ccc;
    position: fixed;
    top: 0;
    left: -180px;
    width: 200px;
    height: 100%;
    flex: none;
    border-right: 1px solid #ccc;
    transition: left 0.3s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1;
    background-color: #fff;
  }

  .left-panel:hover {
    left: 0;
  }

  .left-panel.hidden {
    /* left: -180px; */
    /* margin-left: -200px; */
  }

  .toggle-button {
    display: none;
    position: absolute;
    left: 200px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-left: none;
    cursor: pointer;
    transition: left 0.3s;
    z-index: 10;
    display: flex;
    align-items: center;
  }

  .left-panel.hidden + .toggle-button {
    left: 0;
  }

  .right-panel {
    margin-left: 20px;
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 0;
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
    position: relative;
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

  .send-button {
    height: 100%;
  }

  .btn {
    padding: 4px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background-color: green;
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

  .btn:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
  }
  .btn[disabled] {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
  }

  .left-panel .btn {
    margin-top: 8px;
    width: 100%;
  }

  input[type="text"] {
    border-radius: 4px;
    font-size: 14px;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: green;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }

  /* 添加更多样式... */

  .sessions-list {
    padding: 10px;
  }

  .session-item {
    margin-top: 4px;
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    padding: 0 10px;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.2s ease;
    box-sizing: border-box;
  }
  .session-item:hover {
    background-color: #e0e0e0;
  }

  .session-item.selected {
    background-color: #d0d0d0;
    font-weight: bold;
  }

  .session-input {
    display: inline-flex;
    border: none;
    background: none;
    outline: none;
    flex: 1;
  }
  .session-name {
    display: inline-block;
    align-items: center;
    height: 32px;
    flex: 1;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .session-actions {
    display: none;
    transition: opacity 0.2s ease;
    background: #ddd;
    border-radius: 4px;
    flex: none;
  }

  .session-item:hover .session-actions {
    display: inline-flex;
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    margin-left: 5px;
    transition: opacity 0.2s ease;
  }

  .icon-button:hover {
    opacity: 0.8;
  }

  .icon-button svg {
    fill: #333;
    width: 18px;
    height: 18px;
  }

  .session-item input {
    flex: 1;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
    margin-right: 10px;
  }

  .sessions-list-wrapper {
    flex: 1;
    overflow-y: auto;
  }

  .messages-container-wrapper {
    flex: 1;
    overflow-y: auto;
  }

  .model-selection {
    margin-top: 4px;
    display: flex;
    justify-content: center;
    /* padding: 4px 0; */
  }

  .model-selection label {
    margin: 0 10px;
    display: inline-flex;
    align-items: center;
  }

  /* 修改 radio 按钮颜色 */
  input[type="radio"] {
    accent-color: green;
    margin: 0 4px 0 0;
  }

  .model-tag {
    position: absolute;
    bottom: -10px;
    right: 0px;
    background-color: #ddd;
    padding: 2px 5px;
    font-size: 12px;
    border-radius: 3px;
  }


</style>
