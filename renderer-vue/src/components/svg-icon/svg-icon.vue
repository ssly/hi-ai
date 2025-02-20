<script setup>
import { computed } from 'vue'
import { minus, circleMinus, closeX } from './icon'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
})

const svgContent = computed(() => {
  const svgIcons = {
    minus,
    // 你可以在这里添加更多的图标
    circleMinus,
    closeX,
  }

  return svgIcons[props.icon] || ''
})
</script>

<template>
  <span class="svg-icon" v-html="svgContent"></span>
</template>
