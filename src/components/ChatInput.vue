<script setup>
import { ref } from 'vue';
import { Promotion } from '@element-plus/icons-vue';

const emit = defineEmits(['send']);

const input = ref('');
const loading = ref(false);

const handleSend = () => {
  if (!input.value.trim() || loading.value) return;
  emit('send', input.value);
  input.value = '';
};

const setLoading = (val) => {
  loading.value = val;
};

defineExpose({ setLoading });
</script>

<template>
  <div class="chat-input">
    <el-input
      v-model="input"
      type="textarea"
      :rows="3"
      placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
      :disabled="loading"
      @keydown.enter.exact.prevent="handleSend"
    />
    <el-button
      type="primary"
      :icon="Promotion"
      :loading="loading"
      @click="handleSend"
    >
      发送
    </el-button>
  </div>
</template>

<style scoped>
.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.chat-input :deep(.el-textarea__inner) {
  resize: none;
  font-family: inherit;
}
</style>