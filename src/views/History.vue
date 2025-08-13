<template>
  <div class="history-page">
    <div class="page-header">
      <h2>历史记录</h2>
      <p>查看所有拍摄和识别的历史记录</p>
    </div>

    <!-- 历史记录列表 -->
    <el-card>
      <template #header>
        <div class="records-header">
          <span>历史记录列表</span>
          <el-button type="primary" :icon="Download">导出记录</el-button>
        </div>
      </template>

      <el-table :data="historyRecords" style="width: 100%">
        <el-table-column prop="date" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeColor(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="size" label="文件大小" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="previewRecord(scope.row)">
              预览
            </el-button>
            <el-button size="small" type="success" @click="downloadRecord(scope.row)">
              下载
            </el-button>
            <el-button size="small" type="danger" @click="deleteRecord(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const historyRecords = ref([
  {
    id: 1,
    date: '2024-01-15 14:30:25',
    type: '拍摄',
    title: '产品照片',
    description: '产品外观拍摄，用于质量检查',
    size: '2.5 MB',
  },
  {
    id: 2,
    date: '2024-01-15 14:25:10',
    type: '录制',
    title: '操作演示',
    description: '产品使用操作演示视频',
    size: '15.8 MB',
  },
  {
    id: 3,
    date: '2024-01-15 14:20:05',
    type: '识别',
    title: '文字识别',
    description: '识别结果：产品编号 ABC123，生产日期 2024-01-15',
    size: '0.1 KB',
  },
])

const getTypeColor = (type) => {
  const colors = {
    拍摄: 'primary',
    录制: 'success',
    识别: 'warning',
  }
  return colors[type] || 'info'
}

const previewRecord = (record) => {
  ElMessage.info(`预览记录：${record.title}`)
}

const downloadRecord = (record) => {
  ElMessage.success(`下载记录：${record.title}`)
}

const deleteRecord = (record) => {
  ElMessage.success(`删除记录：${record.title}`)
}
</script>

<style scoped>
.history-page {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
