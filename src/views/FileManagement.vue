<template>
  <div class="file-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>文件管理</h2>
      <el-button type="primary" @click="handleUpload">
        <el-icon><Upload /></el-icon>
        上传文件
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.fileName"
            placeholder="请输入文件名（支持模糊查询）"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.fileType" placeholder="文件类型" clearable @change="handleSearch">
            <el-option label="全部类型" value="" />
            <el-option label="图片" value="image" />
            <el-option label="文档" value="document" />
            <el-option label="视频" value="video" />
            <el-option label="音频" value="audio" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="searchForm.uploadDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 文件列表表格 -->
    <div class="table-container">
      <el-table
        :data="fileList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="fileName" label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="file-info">
              <el-icon :class="getFileIcon(row.fileType)" class="file-icon" />
              <span class="file-name">{{ row.fileName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>

        <el-table-column prop="fileType" label="文件类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getFileTypeTag(row.fileType)">
              {{ getFileTypeName(row.fileType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="uploadTime" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.uploadTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="handleView(row)"
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              size="small"
              type="success"
              @click="handleDownload(row)"
            >
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedFiles.length > 0">
      <el-button type="danger" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除 ({{ selectedFiles.length }})
      </el-button>
      <el-button type="success" @click="handleBatchDownload">
        <el-icon><Download /></el-icon>
        批量下载 ({{ selectedFiles.length }})
      </el-button>
    </div>

    <!-- 文件详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="文件详情"
      width="700px"
    >
      <div class="file-detail" v-if="currentFile">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">
            {{ currentFile.fileName }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ formatFileSize(currentFile.fileSize) }}
          </el-descriptions-item>
          <el-descriptions-item label="文件类型">
            {{ getFileTypeName(currentFile.fileType) }}
          </el-descriptions-item>
          <el-descriptions-item label="上传时间">
            {{ formatDate(currentFile.uploadTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentFile.status === 'success' ? 'success' : 'danger'">
              {{ currentFile.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文件扩展名">
            {{ currentFile.extension || '未知' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 文件预览 -->
        <div class="file-preview" v-if="currentFile.filePath">
          <h4>文件预览</h4>
          <div v-if="isImage(currentFile.fileType)" class="image-preview">
            <img :src="getImageUrl(currentFile.filePath)" alt="文件预览" class="preview-image" />
          </div>
          <div v-else-if="isPDF(currentFile.fileType)" class="pdf-preview">
            <iframe :src="getImageUrl(currentFile.filePath)" width="100%" height="400" frameborder="0"></iframe>
          </div>
          <div v-else class="file-info-preview">
            <el-icon :class="getFileIcon(currentFile.fileType)" class="preview-icon" />
            <p>{{ currentFile.fileName }}</p>
            <p>文件类型：{{ getFileTypeName(currentFile.fileType) }}</p>
            <p>文件大小：{{ formatFileSize(currentFile.fileSize) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleDownload(currentFile)">下载文件</el-button>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上传文件对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文件"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        drag
        :http-request="customUpload"
        :before-upload="beforeUpload"
        multiple
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传jpg/png/gif/pdf/doc/docx/xls/xlsx文件，且不超过10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Search,
  Refresh,
  View,
  Download,
  Delete
} from '@element-plus/icons-vue'
import {
  getFileList,
  deleteFile,
  getFileDetail,
  batchDeleteFiles,
  downloadFile,
  uploadFile
} from '@/api/file'

// 响应式数据
const searchForm = reactive({
  fileName: '',
  fileType: '',
  uploadDate: []
})

const fileList = ref([])
const loading = ref(false)
const selectedFiles = ref([])
const searchTimeout = ref(null)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const detailDialogVisible = ref(false)
const currentFile = ref(null)
const uploadDialogVisible = ref(false)

// 移除未使用的uploadHeaders

// 监听搜索条件变化，添加防抖
watch(() => [searchForm.fileName, searchForm.fileType, searchForm.uploadDate], () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    pagination.currentPage = 1
    fetchFileList()
  }, 500)
}, { deep: true })

// 生命周期
onMounted(() => {
  fetchFileList()
})

// 方法
const fetchFileList = async () => {
  try {
    loading.value = true

    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }

    // 只有当有搜索条件时才添加参数
    if (searchForm.fileType && searchForm.fileType !== '') {
      params.category = searchForm.fileType
    }

    if (searchForm.fileName && searchForm.fileName.trim() !== '') {
      params.tags = [searchForm.fileName.trim()]
    }

    console.log('开始请求文件列表...')
    console.log('请求参数:', params)
    console.log('请求URL:', '/api/file/list')
    console.log('完整URL:', `http://localhost:8399/api/file/list`)

    const response = await getFileList(params)

    console.log('API响应成功:', response)

    if (response.code === 200 && response.data) {
      // 转换后端数据结构为前端需要的格式
      fileList.value = response.data.files.map(file => ({
        id: file.file_id,
        fileName: file.original_name,
        fileSize: file.file_size,
        fileType: getFileTypeFromExtension(file.extension),
        uploadTime: file.upload_time,
        status: 'success',
        filePath: file.access_url,
        category: file.category,
        tags: file.tags || [],
        extension: file.extension
      }))

      pagination.total = response.data.total || fileList.value.length
      console.log('文件列表更新成功，共', fileList.value.length, '个文件')
    } else {
      console.error('API响应异常:', response)
      ElMessage.error(response.message || '获取文件列表失败')
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    })
    ElMessage.error('获取文件列表失败：' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchFileList()
}

const handleReset = () => {
  searchForm.fileName = ''
  searchForm.fileType = ''
  searchForm.uploadDate = []
  pagination.currentPage = 1
  fetchFileList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchFileList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  fetchFileList()
}

const handleSelectionChange = (selection) => {
  selectedFiles.value = selection
}

const handleView = async (file) => {
  try {
    // 获取文件详细信息
    const response = await getFileDetail(file.id)
    if (response.code === 200 && response.data) {
      currentFile.value = {
        ...file,
        ...response.data
      }
      detailDialogVisible.value = true
    } else {
      ElMessage.error('获取文件详情失败')
    }
  } catch (error) {
    console.error('获取文件详情失败:', error)
    ElMessage.error('获取文件详情失败：' + (error.message || '网络错误'))
  }
}

const handleDownload = async (file) => {
  try {
    loading.value = true

    // 使用新的下载API
    const response = await downloadFile(file.id, file.fileName)

    // 创建下载链接
    const blob = new Blob([response])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败：' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

const handleDelete = async (file) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteFile(file.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      fetchFileList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败：' + (error.message || '网络错误'))
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const fileIds = selectedFiles.value.map(file => file.id)
    await batchDeleteFiles(fileIds)

    ElMessage.success('批量删除成功')
    selectedFiles.value = []
    fetchFileList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败：' + (error.message || '网络错误'))
    }
  }
}

const handleBatchDownload = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要下载的文件')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要下载选中的 ${selectedFiles.value.length} 个文件吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    for (const file of selectedFiles.value) {
      await handleDownload(file)
    }
    ElMessage.success('批量下载成功')
    selectedFiles.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量下载失败:', error)
      ElMessage.error('批量下载失败：' + (error.message || '网络错误'))
    }
  }
}

const handleUpload = () => {
  uploadDialogVisible.value = true
}

const beforeUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
                      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传指定格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const customUpload = async (options) => {
  try {
    loading.value = true

    // 调用uploadFile API
    const response = await uploadFile(options.file)

    if (response.code === 200) {
      ElMessage.success('文件上传成功')
      // 刷新文件列表
      fetchFileList()
      // 关闭上传对话框
      uploadDialogVisible.value = false
    } else {
      ElMessage.error(response.message || '文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('文件上传失败：' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

// 工具方法
const getFileTypeFromExtension = (extension) => {
  if (!extension) return 'other'

  const ext = extension.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    return 'image'
  } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return 'document'
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
    return 'video'
  } else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
    return 'audio'
  } else {
    return 'other'
  }
}

const getFileIcon = (fileType) => {
  const iconMap = {
    'image': 'Picture',
    'document': 'Document',
    'video': 'VideoCamera',
    'audio': 'Headphone',
    'other': 'Files'
  }
  return iconMap[fileType] || 'Files'
}

const getFileTypeTag = (fileType) => {
  const tagMap = {
    'image': 'success',
    'document': 'primary',
    'video': 'warning',
    'audio': 'info',
    'other': 'info'
  }
  return tagMap[fileType] || 'info'
}

const getFileTypeName = (fileType) => {
  const nameMap = {
    'image': '图片',
    'document': '文档',
    'video': '视频',
    'audio': '音频',
    'other': '其他'
  }
  return nameMap[fileType] || '其他'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const isImage = (fileType) => {
  return fileType === 'image'
}

const isPDF = (fileType) => {
  return fileType === 'document' && (fileType.toLowerCase().endsWith('pdf') || fileType.toLowerCase().endsWith('pdfx'))
}

// 获取图片URL（用于预览）
const getImageUrl = (filePath) => {
  if (!filePath) return ''

  // 如果是相对路径，添加后端地址
  if (filePath.startsWith('/files/')) {
    // 直接使用Go后端地址
    return `http://localhost:8399${filePath}`
  }

  return filePath
}
</script>

<style scoped>
.file-management {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.search-bar {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.table-container {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.file-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #409eff;
}

.file-name {
  color: #303133;
  font-weight: 500;
  word-break: break-all;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  padding: 16px 0;
}

.batch-actions {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.batch-actions .el-button {
  margin: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.batch-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.file-detail {
  padding: 24px 0;
}

.file-preview {
  margin-top: 24px;
  text-align: center;
}

.image-preview {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.02);
}

.pdf-preview {
  width: 100%;
  height: 400px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pdf-preview iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.file-info-preview {
  padding: 40px 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  text-align: center;
  color: #606266;
  background: #fafafa;
}

.preview-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #409eff;
}

.file-info-preview p {
  margin: 8px 0;
  font-size: 14px;
}

.upload-demo {
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
  border: none;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
  border: none;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
  border: none;
}

/* 搜索框样式优化 */
:deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-date-editor) {
  border-radius: 6px;
}

/* 分页样式优化 */
:deep(.el-pagination) {
  text-align: center;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 4px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-bar .el-col {
    margin-bottom: 16px;
  }

  .search-bar .el-col:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .file-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .search-bar {
    padding: 16px;
  }

  .search-bar .el-col {
    margin-bottom: 12px;
  }

  .batch-actions {
    padding: 16px;
  }

  .batch-actions .el-button {
    margin: 4px;
    width: 100%;
  }

  .table-container {
    overflow-x: auto;
  }

  :deep(.el-table) {
    min-width: 800px;
  }
}

@media (max-width: 480px) {
  .file-management {
    padding: 12px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .search-bar {
    padding: 12px;
  }

  .batch-actions {
    padding: 12px;
  }
}
</style>
