<!-- SideNav.vue -->
<script setup>
import { ref, computed } from 'vue'
import { CircleX, ChevronsRight, ChevronsLeft } from 'lucide-vue-next'

import { useSessionsStore } from '../stores/sessions'

const sessionsStore = useSessionsStore()

const sessionsArray = computed(() => {
  const list = Object.values(sessionsStore.sessions)
  return list?.sort((a, b) => b.updateTime - a.updateTime)
})

const emit = defineEmits(['create-session', 'change-token'])

const inputRef = ref(null)

const isCollopse = ref(true)

const hanleRemove = row => {
  console.log('hanleRemove', row, row._isRemove, row.id)
  sessionsStore.removeSession(row)
}

const handleEditSession = async session => {
  session._isRename = true
  setTimeout(() => {
    inputRef.value[0].focus()
  }, 0)
}

function handleSelectSession(session) {
  sessionsStore.selectSession(session.id)
}

const handleChangeSessionName = (event, session) => {
  delete session._isRename

  sessionsStore.updateSession(session.id, {
    name: session.name,
  })
}
</script>

<template>
  <nav :class="isCollopse ? 'side-nav is-collapse' : 'side-nav'">
    <ChevronsRight
      v-show="!isCollopse"
      class="side-nav-toggle"
      size="32"
      color="#ccc"
      stroke-width="1"
      @click="(isCollopse = !isCollopse)"
    />
    <ChevronsLeft
      v-show="isCollopse"
      class="side-nav-toggle"
      size="32"
      color="#ccc"
      stroke-width="1"
      @click="(isCollopse = !isCollopse)"
    />

    <div v-show="isCollopse" class="opt">
      <button @click="emit('change-token')">修改密钥</button>
      <button @click="emit('create-session')">创建会话</button>
    </div>

    <div class="side-nav-content">
      <ul v-show="isCollopse">
        <li
          v-for="session in sessionsArray"
          :class="{ 'session-active': sessionsStore.currentSessionId === session.id }"
          :key="session.id"
          @click="handleSelectSession(session)"
        >
          <span class="session-name">
            <input
              v-if="session._isRename"
              ref="inputRef"
              class="session-name-input"
              type="text"
              v-model="session.name"
              @change="handleChangeSessionName($event, session)"
              @blur="handleChangeSessionName($event, session)"
            />
            <span v-else>{{ session.name || '新会话' }}</span>
          </span>
          <div class="session-actions">
            <button class="icon-button" @click.stop="handleEditSession(session)">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                />
              </svg>
            </button>
            <button class="icon-button" @click.stop="hanleRemove(session)">
              <svg v-if="session._isRemove" viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
              <CircleX v-else />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.side-nav {
  position: relative;
  border-right: 1px solid var(--border-color);
  width: 20px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.side-nav.is-collapse {
  width: 200px;
}
.side-nav:after {
  /* position: absolute;
  top: 0;
  width: 20px;
  right: -20px;
  height: 100%;
  background-color: transparent;
  content: ''; */
}
.side-nav:after:hover {
  /* opacity: 0; */
}
.side-nav:hover {
  /* left: 0; */
}

.side-nav-content {
  overflow-y: auto;
}

.side-nav-toggle {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
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
