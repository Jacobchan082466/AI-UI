<template>
  <div class="review-page">
    <div class="page-header">
      <h2>识别复检</h2>
      <p>重新检查和验证识别结果</p>
    </div>

    <!-- 复检控制区域 -->
    <el-row :gutter="20" class="review-controls">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>复检控制</span>
              <div class="control-buttons">
                <el-button type="primary" :icon="Upload" @click="uploadImage"> 上传图片 </el-button>
                <el-button type="success" :icon="Camera" @click="captureImage">
                  拍摄图片
                </el-button>
                <el-button type="warning" :icon="Refresh" @click="reprocessImage">
                  重新识别
                </el-button>
              </div>
            </div>
          </template>

          <!-- 识别状态 -->
          <div class="recognition-status">
            <el-alert
              :title="recognitionStatus.title"
              :type="recognitionStatus.type"
              :description="recognitionStatus.description"
              show-icon
              :closable="false"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图片和识别结果区域 -->
    <el-row :gutter="20" class="review-section">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>原始图片</span>
          </template>

          <div class="image-container">
            <img v-if="currentImage" :src="currentImage" class="review-image" alt="复检图片" />
            <div v-else class="no-image">
              <el-icon size="80" color="#ddd">
                <Picture />
              </el-icon>
              <p>请上传或拍摄图片进行识别</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>识别结果</span>
          </template>

          <div class="recognition-results">
            <div v-if="recognitionResults.length > 0" class="results-list">
              <div v-for="(result, index) in recognitionResults" :key="index" class="result-item">
                <div class="result-header">
                  <span class="result-type">{{ result.type }}</span>
                  <el-tag :type="result.confidence > 0.8 ? 'success' : 'warning'" size="small">
                    {{ (result.confidence * 100).toFixed(1) }}%
                  </el-tag>
                </div>
                <div class="result-content">
                  <p class="result-text">{{ result.text }}</p>
                  <div class="result-actions">
                    <el-button size="small" type="primary" @click="editResult(result, index)">
                      编辑
                    </el-button>
                    <el-button size="small" type="success" @click="confirmResult(result, index)">
                      确认
                    </el-button>
                    <el-button size="small" type="danger" @click="rejectResult(result, index)">
                      拒绝
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-results">
              <el-icon size="60" color="#ddd">
                <Document />
              </el-icon>
              <p>暂无识别结果</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 复检历史 -->
    <el-row :gutter="20" class="history-section">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>复检历史</span>
          </template>

          <el-table :data="reviewHistory" style="width: 100%">
            <el-table-column prop="date" label="时间" width="180" />
            <el-table-column prop="imageName" label="图片名称" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusColor(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="resultCount" label="识别数量" width="100" />
            <el-table-column prop="accuracy" label="准确率" width="100" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" type="primary" @click="viewHistory(scope.row)">
                  查看
                </el-button>
                <el-button size="small" type="success" @click="reuseHistory(scope.row)">
                  复用
                </el-button>
                <el-button size="small" type="danger" @click="deleteHistory(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑结果对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑识别结果" width="50%">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="识别类型">
          <el-input v-model="editForm.type" />
        </el-form-item>
        <el-form-item label="识别文本">
          <el-input v-model="editForm.text" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="置信度">
          <el-slider v-model="editForm.confidence" :min="0" :max="1" :step="0.01" />
          <span>{{ (editForm.confidence * 100).toFixed(1) }}%</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Camera, Refresh, Picture, Document } from '@element-plus/icons-vue'

// 响应式数据
const currentImage = ref(null)
const recognitionResults = ref([])
const reviewHistory = ref([])
const editDialogVisible = ref(false)
const editForm = ref({})
const editIndex = ref(-1)

// 识别状态
const recognitionStatus = ref({
  title: '等待图片',
  type: 'info',
  description: '请上传或拍摄图片开始识别复检',
})

// 示例数据
const sampleResults = [
  {
    type: '文字识别',
    text: '产品编号：ABC123456',
    confidence: 0.95,
  },
  {
    type: '日期识别',
    text: '生产日期：2024-01-15',
    confidence: 0.88,
  },
  {
    type: '条码识别',
    text: '条码：1234567890123',
    confidence: 0.92,
  },
]

const sampleHistory = [
  {
    id: 1,
    date: '2024-01-15 14:30:25',
    imageName: 'product_001.jpg',
    status: '已完成',
    resultCount: 3,
    accuracy: '95.2%',
  },
  {
    id: 2,
    date: '2024-01-15 14:25:10',
    imageName: 'product_002.jpg',
    status: '待确认',
    resultCount: 2,
    accuracy: '87.5%',
  },
]

// 上传图片
const uploadImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        currentImage.value = e.target.result
        startRecognition()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 拍摄图片
const captureImage = () => {
  ElMessage.info('调用摄像头拍摄功能')
  // 这里可以集成摄像头拍摄功能
}

// 开始识别
const startRecognition = () => {
  recognitionStatus.value = {
    title: '识别中...',
    type: 'warning',
    description: '正在分析图片内容，请稍候',
  }

  // 模拟识别过程
  setTimeout(() => {
    recognitionResults.value = [...sampleResults]
    recognitionStatus.value = {
      title: '识别完成',
      type: 'success',
      description: `识别完成，共找到 ${recognitionResults.value.length} 个结果`,
    }
    ElMessage.success('识别完成！')
  }, 2000)
}

// 重新处理图片
const reprocessImage = () => {
  if (!currentImage.value) {
    ElMessage.warning('请先上传图片')
    return
  }
  startRecognition()
}

// 编辑结果
const editResult = (result, index) => {
  editForm.value = { ...result }
  editIndex.value = index
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = () => {
  if (editIndex.value >= 0) {
    recognitionResults.value[editIndex.value] = { ...editForm.value }
    ElMessage.success('结果已更新')
  }
  editDialogVisible.value = false
}

// 确认结果
const confirmResult = (result, index) => {
  ElMessage.success(`已确认：${result.text}`)
  // 这里可以添加确认逻辑
}

// 拒绝结果
const rejectResult = (result, index) => {
  recognitionResults.value.splice(index, 1)
  ElMessage.info(`已拒绝：${result.text}`)
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    已完成: 'success',
    待确认: 'warning',
    处理中: 'primary',
  }
  return colors[status] || 'info'
}

// 查看历史
const viewHistory = (record) => {
  ElMessage.info(`查看历史记录：${record.imageName}`)
}

// 复用历史
const reuseHistory = (record) => {
  ElMessage.success(`复用历史记录：${record.imageName}`)
}

// 删除历史
const deleteHistory = (record) => {
  ElMessage.success(`删除历史记录：${record.imageName}`)
}

// 初始化数据
reviewHistory.value = sampleHistory
</script>

<style scoped>
.review-page {
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

.review-controls {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-buttons {
  display: flex;
  gap: 12px;
}

.recognition-status {
  margin-bottom: 16px;
}

.review-section {
  margin-bottom: 24px;
}

.image-container {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.review-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-image {
  text-align: center;
  color: #999;
}

.no-image p {
  margin-top: 16px;
  font-size: 16px;
}

.recognition-results {
  height: 300px;
  overflow-y: auto;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-type {
  font-weight: 600;
  color: #333;
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.result-text {
  flex: 1;
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.no-results {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.no-results p {
  margin-top: 16px;
  font-size: 16px;
}

.history-section {
  margin-bottom: 24px;
}
</style>
