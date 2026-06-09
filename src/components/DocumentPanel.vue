<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { documentAPI } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Delete, Document as DocumentIcon, DataAnalysis } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

const documents = ref([]);
const uploading = ref(false);

// ===== 分析图表相关的状态 =====
const showAnalysis = ref(false);
const analyzing = ref(false);
const keywordChartRef = ref(null);
const clusterChartRef = ref(null);
let keywordChart = null;
let clusterChart = null;

const loadDocuments = async () => {
  if (!localStorage.getItem('token')) return;
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

// ===== 新增：请求分析数据并渲染图表 =====
const handleAnalyze = async () => {
  if (documents.value.length === 0) {
    ElMessage.warning('知识库还是空的，先上传几份 PDF 吧乖~');
    return;
  }
  
  analyzing.value = true;
  try {
    const res = await documentAPI.getAnalysis();
    showAnalysis.value = true;
    await nextTick();
    renderCharts(res.data);
    
  } catch (error) {
    console.error("分析失败:", error);
    ElMessage.error('糟糕，分析失败了QAQ');
  } finally {
    analyzing.value = false;
  }
};

const renderCharts = (data) => {

  if (keywordChart) keywordChart.dispose();
  if (clusterChart) clusterChart.dispose();


  if (keywordChartRef.value) {
    keywordChart = echarts.init(keywordChartRef.value);
    keywordChart.setOption({
      title: { text: '数据集核心高频词 (TF-IDF)', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category', 
        data: data.keywords.map(k => k.name),
        axisLabel: { interval: 0, rotate: 30 }
      },
      yAxis: { type: 'value', name: 'TF-IDF 权重' },
      series: [{
        data: data.keywords.map(k => k.value),
        type: 'bar',
        itemStyle: { color: '#409EFF' },
        barWidth: '40%'
      }]
    });
  }


  if (clusterChartRef.value) {
    clusterChart = echarts.init(clusterChartRef.value);
    clusterChart.setOption({
      title: { text: '文档内容聚类分布', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '占比',
        type: 'pie',
        radius: '50%',
        data: data.clusters, 
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    });
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
      <el-button 
        type="primary" 
        :icon="DataAnalysis" 
        :loading="analyzing"
        @click="handleAnalyze"
        round
      >
        生成数据集分析报告
      </el-button>
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

    <el-dialog v-model="showAnalysis" title="数据集分析报告" width="70%" destroy-on-close>
      <div class="charts-container">
        <!-- 存放柱状图 -->
        <div ref="keywordChartRef" class="chart-box"></div>
        <!-- 存放饼图 -->
        <div ref="clusterChartRef" class="chart-box"></div>
      </div>
    </el-dialog>
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

/* 图表容器样式 */
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-box {
  width: 100%;
  height: 350px;
  background: #fdfdfd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
</style>