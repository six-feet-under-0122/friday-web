<script setup>
import { computed } from 'vue';
import { Avatar } from '@element-plus/icons-vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const isUser = computed(() => props.message.type === 'user');
</script>

<template>
  <div :class="['message-wrapper', message.type]">
    <div class="avatar">
      <el-avatar v-if="isUser" :icon="Avatar" />
      <el-avatar v-else style="background: #67c23a;">AI</el-avatar>
    </div>
    <div class="bubble">
      <div class="text">{{ message.text }}</div>
      
      <div v-if="message.sources?.length" class="sources">
        <div class="source-title">来源</div>
        <ul>
          <li v-for="(s, i) in message.sources" :key="i">
            {{ s.filename }} (p{{ s.page }})
          </li>
        </ul>
      </div>

  <div class="time">{{ message.time }}</div>
</div>
  </div>
</template>

<style scoped>
.message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
}

.bubble {
  max-width: 60%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f0f0f0;
}

.message-wrapper.user .bubble {
  background: #409eff;
  color: white;
}

.text {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.6;
}

.time {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.message-wrapper.user .time {
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}
</style>