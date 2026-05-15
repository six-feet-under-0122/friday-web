<script setup>
import { ref, onMounted } from 'vue';
import { documentAPI } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Delete, Document } from '@element-plus/icons-vue';

const documents = ref([]);
const uploading = ref(false);

const loadDocuments = async () => {
  try {
    const res = await documentAPI.getList();
    documents.value = res.documents || [];
  } catch (error) {
    console.error(error);
  }
};

const handleUpload = async (options) => {
  const { file } = options;
  
  if (!file.name.endsWith('.pdf')) {
    ElMessage.warning('只支持 PDF 文件');
    return;
  }

  uploading.value = true;
  try {
    await documentAPI.upload(file);
    ElMessage.success('上传成功');
    loadDocuments();
  } catch (error) {
    console.error(error);
  } finally {
    uploading.value = false;
  }
};

const handleDelete = async (doc) => {
  try {
    await ElMessageBox.confirm('确定删除这个文档吗？', '提示', {
      type: 'warning'
    });
    await documentAPI.delete(doc.id);
    ElMessage.success('删除成功');
    loadDocuments();
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error);
    }
  }
};

onMounted(() => {
  loadDocuments();
});
</script>

<template>
  <div class="document-panel">
    <div class="header">
      <h3>文档库</h3>
    </div>

    <el-upload
      class="upload-area"
      drag
      :http-request="handleUpload"
      :show-file-list="false"
      accept=".pdf"
    >
      <el-icon class="upload-icon"><Upload /></el-icon>
      <div class="upload-text">拖拽 PDF 文件到这里或点击上传</div>
    </el-upload>

    <el-divider />

    <div class="document-list">
      <el-empty v-if="documents.length === 0" description="暂无文档" :image-size="80" />
      <div v-else>
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="document-item"
        >
          <el-icon><Document /></el-icon>
          <span class="doc-name">{{ doc.name }}</span>
          <el-button
            type="danger"
            :icon="Delete"
            size="small"
            text
            @click="handleDelete(doc)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.header h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.upload-area {
  margin-bottom: 10px;
}

.upload-icon {
  font-size: 50px;
  color: #409eff;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.document-list {
  flex: 1;
  overflow-y: auto;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #f5f7fa;
  transition: all 0.3s;
}

.document-item:hover {
  background: #e8f4ff;
}

.doc-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>