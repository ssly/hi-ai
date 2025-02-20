/**
 * token store
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'

const inUtools = typeof window.services === 'object'

export const useTokenStore = defineStore('token', () => {
  const token = ref('')
  const tokenfromDB = inUtools ? window.services.getToken() : localStorage.getItem('HI_AI_TOKEN')
  token.value = tokenfromDB

  function updateToken(src) {
    if (inUtools) {
      window.services.setToken(src)
    } else {
      localStorage.setItem('HI_AI_TOKEN', src)
    }
    token.value = src
  }

  return { token, updateToken }
})
