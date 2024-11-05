<template>
  <div class="model-select">
    <!-- <select v-model="platform" @change="onPlatformChange">
      <option value="github">Github Models</option>
      <option value="groq">Groq</option>
    </select> -->
    <select v-model="model">
      <option v-for="option in modelOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  platform: String,
  model: String,
})

const emit = defineEmits(['update:platform', 'update:model'])

const platform = computed({
  get() {
    return props.platform
  },
  set(value) {
    emit('update:platform', value)
  },
})

const model = computed({
  get() {
    return props.model
  },
  set(value) {
    emit('update:model', value)
  },
})

const modelOptions = computed(() => {
  return [
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'gpt-4o', label: 'gpt-4o' },
    { value: 'o1-mini', label: 'o1-mini' },
    { value: 'o1-preview', label: 'o1-preview' },
  ]
})
</script>

<style scoped>
.model-select {
  display: flex;
  align-items: center;
}

select {
  margin-right: 10px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}
</style>
