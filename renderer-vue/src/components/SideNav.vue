<!-- SideNav.vue -->
<script setup>
import { ref, defineProps, computed, nextTick } from 'vue'

const props = defineProps({
  currentSessionId: {
    type: Number,
    required: true,
  },
  sessions: {
    type: Object,
    required: true,
  },
})

const sessionsArray = computed(() => {
  const list = Object.values(props.sessions)
  console.log('list', list)
  console.log(
    'props.sessions',
    list.sort((a, b) => b.updateTime - a.updateTime),
  )
  return list.sort((a, b) => b.updateTime - a.updateTime)
})

const emit = defineEmits([
  'update:currentSessionId',
  'update:sessions',
  'create-session',
  'change-token',
  'change-session-id',
])

const currentEditSessionId = ref(null)
const inputRef = ref(null)

const hanleRemove = (row) => {
  if (confirm(`确定要删除 ${row.name} 吗?`)) {
    const newSessions = { ...props.sessions }
    delete newSessions[row.id]
    emit('update:sessions', newSessions)
    emit('remove', newSessions)
  }
}

const handleEditSession = async (session) => {
  currentEditSessionId.value = session.id
  await nextTick()
  setTimeout(() => {
    inputRef.value[0].focus()
  }, 0)
}

const handleChangeSessionName = () => {
  currentEditSessionId.value = null
}
</script>

<template>
  <nav class="side-nav">
    <div class="opt">
      <button @click="emit('change-token')">修改密钥</button>
      <button @click="emit('create-session')">创建会话</button>
    </div>

    <ul>
      <li
        v-for="session in sessionsArray"
        :class="{ 'session-active': currentSessionId === session.id }"
        :key="session.id"
        @click="emit('update:currentSessionId', session.id)"
      >
        <span class="session-name">
          <input
            v-if="currentEditSessionId === session.id"
            ref="inputRef"
            class="session-name-input"
            type="text"
            v-model="session.name"
            @change="handleChangeSessionName(session)"
            @blur="handleChangeSessionName(session)"
          />
          <span v-else>{{ session.name || '新会话' }}</span>
        </span>
        <div v-if="currentEditSessionId !== session.id" class="session-actions">
          <button class="icon-button" @click.stop="handleEditSession(session)">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
              />
            </svg>
          </button>
          <button class="icon-button" @click="hanleRemove(session)">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
          </button>
        </div>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.side-nav {
  position: fixed;
  top: 0;
  /* left: 0; */
  left: -180px;
  width: 200px;
  min-width: 200px;
  background-color: #f8f8f8;
  border-right: 1px solid #ddd;
  height: 100%;
  z-index: 1;
  transition: left 0.2s;
  display: flex;
  flex-direction: column;
}
.side-nav:after {
  position: absolute;
  top: 0;
  width: 20px;
  right: -20px;
  height: 100%;
  background-color: transparent;
  content: '';
}
.side-nav:after:hover {
  opacity: 0;
}
.side-nav:hover {
  left: 0;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

li {
  border-radius: 4px;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  width: 100%;
  height: 40px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s;
  cursor: pointer;
}
li:hover {
  background-color: #e0e0e0;
}

.opt {
  margin-top: 8px;
  display: flex;
  flex: none;
  padding: 0 12px;
}
.session-active {
  background-color: #ddd;
}
li:hover .session-actions {
  display: inline-flex;
  align-items: center;
}

.session-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-name-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
}

.session-actions {
  display: none;
  transition: opacity 0.2s ease;
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
  margin: 0 0 0 4px;
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

button {
  display: block;
  width: 100%;
  padding: 4px 8px;
  margin-bottom: 10px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color);
}

button + button {
  margin-left: 4px;
}
</style>
