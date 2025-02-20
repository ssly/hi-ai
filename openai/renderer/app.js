const conversationList = document.getElementById('conversation-list');
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let conversations = [];
let currentConversationId = null;

// 公共请求方法
async function request(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (result.c === '0000') {
    return result.d;
  } else {
    throw new Error('请求失败');
  }
}

// 获取会话列表
async function getConversations() {
  try {
    const data = await request('/api/session');
    conversations = data.map(item => ({
      id: item.sessionId,
      title: item.sessionName || `会话 ${item.sessionId}`,
      messages: item.messages || []
    }));
    renderConversationList();
    if (currentConversationId) {
      renderChatWindow();
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
  }
}

// 创建新会话
async function createConversation() {
  try {
    const data = await request('/api/session', 'POST');
    const newConversation = {
      id: data.sessionId,
      title: `会话 ${data.sessionId}`,
      messages: []
    };
    conversations.push(newConversation);
    currentConversationId = newConversation.id; // 将新创建的会话设置为当前选中的会话
    renderConversationList();
    renderChatWindow(); // 渲染新创建的会话的聊天窗口
  } catch (error) {
    console.error('创建会话失败:', error);
  }
}

// 渲染会话列表
function renderConversationList() {
  conversationList.innerHTML = `
    <li><button id="create-conversation">创建会话</button></li>
  `;
  conversations.forEach(conversation => {
    const li = document.createElement('li');
    li.textContent = conversation.title;
    li.classList.add('conversation-item');
    if (conversation.id === currentConversationId) {
      li.classList.add('active');
    }
    li.addEventListener('click', async () => {
      currentConversationId = conversation.id;
      await getConversations(); // 点击会话时重新获取会话列表
      renderConversationList();
    });
    conversationList.appendChild(li);
  });

  const createButton = document.getElementById('create-conversation');
  createButton.addEventListener('click', createConversation);
}

// 渲染聊天窗口
function renderChatWindow() {
  const conversation = conversations.find(c => c.id === currentConversationId);
  const emptyMessage = document.getElementById('empty-message');
  const chatContainer = document.getElementById('chat-container');

  if (!conversation) {
    emptyMessage.style.display = 'flex';
    chatContainer.classList.remove('active');
    return;
  }

  emptyMessage.style.display = 'none';
  chatContainer.classList.add('active');

  chatWindow.innerHTML = '';
  conversation.messages.forEach(message => {
    const div = document.createElement('div');
    div.innerHTML = marked.parse(message.content);
    div.classList.add('message');
    if (message.role === 'user') {
      div.classList.add('user-message');
    } else {
      div.classList.add('assistant-message');
      const modelDiv = document.createElement('div');
      modelDiv.classList.add('model');
      modelDiv.textContent = message.model || 'gpt-4o-mini';
      div.appendChild(modelDiv); // 将模型信息添加到消息框体内
    }

    chatWindow.appendChild(div);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 发送消息
async function sendMessage() {
  const messageContent = userInput.value.trim();
  const selectedModel = document.getElementById('model-select').value;
  if (messageContent !== '') {
    const userMessage = { role: 'user', content: messageContent };
    const conversation = conversations.find(c => c.id === currentConversationId);
    conversation.messages.push(userMessage);
    renderChatWindow();
    userInput.value = '';

    const thinkingMessage = {
      role: 'assistant',
      content: 'AI正在加速思考中,请等一会~'
    };
    conversation.messages.push(thinkingMessage);
    renderChatWindow();

    try {
      const data = await request('/api/chat', 'POST', {
        sessionId: currentConversationId,
        message: messageContent,
        model: selectedModel
      });

      const assistantMessage = {
        role: data.role,
        content: data.content,
        model: data.model
      };
      conversation.messages = conversation.messages.slice(0, -1); // 移除 "AI正在加速思考中" 的消息
      conversation.messages.push(assistantMessage);
      renderChatWindow();
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }
}

sendButton.addEventListener('click', sendMessage);

getConversations();

// 添加 Shift + Enter 的事件监听
userInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});