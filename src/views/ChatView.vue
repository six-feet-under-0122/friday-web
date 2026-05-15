<script setup>
import { ref, nextTick } from 'vue';
import { useUserStore } from '@/stores/user';
import { chatAPI } from '@/api';
import SessionList from '@/components/SessionList.vue';
import DocumentPanel from '@/components/DocumentPanel.vue';
import ChatMessage from '@/components/ChatMessage.vue';
import ChatInput from '@/components/ChatInput.vue';
import LoginDialog from '@/components/LoginDialog.vue';
import { ElMessage } from 'element-plus';
import { SwitchButton } from '@element-plus/icons-vue';

const userStore = useUserStore();
const showLogin = ref(!userStore.isLoggedIn);

const messages = ref([]);
const currentSession = ref(null);
const chatContainer = ref();
const chatInputRef = ref();
const sessionListRef = ref();

const handleSessionSelect = async (session) => {
  currentSession.value = session;
  try {
    const res = await chatAPI.getHistory(session.id);
    messages.value = res.messages || [];
    scrollToBottom();
  } catch (error) {
    messages.value = [];
  }
};

const handleSendMessage = async (text) => {
  if (!currentSession.value) {
    ElMessage.warning('请先选择或创建一个会话');
    return;
  }

  const userMessage = {
    type: 'user',
    text,
    time: new Date().toLocaleTimeString()
  };
  messages.value.push(userMessage);
  scrollToBottom();

  const aiMessage = {
    type: 'assistant',
    text: 'AI 正在思考中...',
    time: new Date().toLocaleTimeString()
  };
  messages.value.push(aiMessage);
  scrollToBottom();

  chatInputRef.value?.setLoading(true);

  try {
    const res = await chatAPI.sendMessage({
      session_id: currentSession.value.id,
      message: text
    });
    aiMessage.text = res.reply || '抱歉，我没有理解你的问题';
  } catch (error) {
    aiMessage.text = '网络错误，请稍后重试';
  } finally {
    chatInputRef.value?.setLoading(false);
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const handleLogout = () => {
  userStore.logout();
  showLogin.value = true;
  messages.value = [];
  currentSession.value = null;
};

const handleLoginSuccess = () => {
  sessionListRef.value?.loadSessions();
};
</script>

<template>
  <div class="chat-view">
    <LoginDialog
      v-model:visible="showLogin"
      @success="handleLoginSuccess"
    />

    <div class="header">
      <h1>RAG 智能助手</h1>
      <div class="user-info">
        <span>{{ userStore.username }}</span>
        <el-button :icon="SwitchButton" @click="handleLogout">退出</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="sidebar left">
        <SessionList ref="sessionListRef" @select="handleSessionSelect" />
      </div>

      <div class="chat-area">
        <div ref="chatContainer" class="messages">
          <el-empty
            v-if="messages.length === 0"
            description="开始新的对话吧"
            :image-size="120"
          />
          <ChatMessage
            v-for="(msg, index) in messages"
            :key="index"
            :message="msg"
          />
        </div>
        <ChatInput ref="chatInputRef" @send="handleSendMessage" />
      </div>

      <div class="sidebar right">
        <DocumentPanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  height: 100%;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>