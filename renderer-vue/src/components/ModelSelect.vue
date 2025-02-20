<script setup>
import { computed } from 'vue'
import { RadioGroup, Radio } from '@arco-design/web-vue'
import { CircleHelp } from 'lucide-vue-next'

const props = defineProps({
  platform: String,
  model: String,
})

const emit = defineEmits(['update:platform', 'update:model'])

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
    {
      value: 'gpt-4o-mini',
      label: '4o-mini',
      desc: ['131k 输入 · 4k 输出', 'Free 150次/天', 'Copilot Business 300次/天', '支持流式输出'],
    },
    {
      value: 'gpt-4o',
      label: '4o',
      desc: ['131k 输入 · 16k 输出', 'Free 50次/天', 'Copilot Business 100次/天', '支持流式输出'],
    },
    {
      value: 'o1-mini',
      label: 'o1-mini',
      desc: ['128k 输入 · 66k 输出', 'Free 12次/天', 'Copilot Business 15次/天'],
    },
    {
      value: 'o1',
      label: 'o1',
      desc: ['200k 输入 · 100k 输出', 'Free 8次/天', 'Copilot Business 10次/天'],
    },
  ]
})
</script>

<template>
  <div class="model-select">
    <RadioGroup v-model="model" size="small" type="button">
      <Radio v-for="option in modelOptions" :key="option.value" :value="option.value">
        <span class="model-select-label">
          <span class="model-select-label-text">{{ option.label }}</span>
          <a-tooltip position="top">
            <template #content>
              <div v-for="item in option.desc" :key="item">{{ item }}</div>
            </template>
            <CircleHelp size="14" />
          </a-tooltip>
        </span>
      </Radio>
    </RadioGroup>
  </div>
</template>

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

.model-select-label {
  display: flex;
  align-items: center;
}

.model-select-label-text {
  margin-right: 4px;
}
</style>
