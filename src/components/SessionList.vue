<script setup>
import { ref, onMounted } from 'vue';
import { chatAPI } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ChatDotRound, Delete, Plus } from '@element-plus/icons-vue';

const emit = defineEmits(['select']);

const sessions = ref([]);
const activeSessionId = ref(null);

const loadSessions = async () => {
  if (!localStorage.getItem('token')) return;
  try {
    const res = await chatAPI.getSessions();
    sessions.value = res.sessions || [];
    if (sessions.value.length > 0 && !activeSessionId.value) {
      selectSession(sessions.value[0]);
    }
  } catch (error) {
    console.error(error);
  }
};

const createSession = async () => {
  try {
    const res = await chatAPI.createSession();
    sessions.value.unshift(res.session);
    selectSession(res.session);
    ElMessage.success('新建会话成功');
  } catch (error) {
    console.error(error);
  }
};

const deleteSession = async (session, event) => {
  event.stopPropagation();
  try {
    await ElMessageBox.confirm('确定删除这个会话吗？'
    , '提示', {
      type: 'warning'
    });
    await chatAPI.deleteSession(session.id);
    sessions.value = sessions.value.filter(s => s.id !== session.id);
    if (activeSessionId.value === session.id && sessions.value.length > 0) {
      selectSession(sessions.value[0]);
    }
    ElMessage.success('删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error);
    }
  }
};

const selectSession = (session) => {
  activeSessionId.value = session.id;
  emit('select', session);
};

onMounted(() => {
  loadSessions();
});

defineExpose({ loadSessions, createSession });
</script>

<template>
  <div class="session-list">
    <div class="header">
      <h3>对话列表</h3>
      <el-button type="primary" :icon="Plus" size="small" @click="createSession">
        新建
      </el-button>
    </div>

    <div class="sessions">
      <el-empty v-if="sessions.length === 0" description="暂无会话" :image-size="80" />
      <div
        v-for="session in sessions"
        :key="session.id"
        :class="['session-item', { active: session.id === activeSessionId }]"
        @click="selectSession(session)"
      >
        <el-icon><ChatDotRound /></el-icon>
        <span class="session-title">{{ session.title || '新对话' }}</span>
        <el-button
          type="danger"
          :icon="Delete"
          size="small"
          text
          @click="deleteSession(session, $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header h3 {
  margin: 0;
  font-size: 18px;
}

.sessions {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f7fa;
}

.session-item:hover {
  background: #e8f4ff;
}

.session-item.active {
  background: #409eff;
  color: white;
}

.session-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>