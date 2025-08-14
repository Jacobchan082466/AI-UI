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
      <div class="search-grid">
        <div class="search-item">
          <label class="search-label">文件名</label>
          <el-input
            v-model="searchForm.fileName"
            placeholder="请输入文件名（支持模糊查询）"
            clearable
            size="default"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="search-item">
          <label class="search-label">文件类型</label>
          <el-select
            v-model="searchForm.fileType"
            placeholder="请选择文件类型"
            clearable
            size="default"
            style="width: 100%"
            @change="handleSearch"
          >
            <el-option label="全部类型" value="" />
            <el-option label="图片" value="image" />
            <el-option label="文档" value="document" />
            <el-option label="视频" value="video" />
            <el-option label="音频" value="audio" />
            <el-option label="其他" value="other" />
          </el-select>
        </div>

        <div class="search-item">
          <label class="search-label">上传时间</label>
          <el-date-picker
            v-model="searchForm.uploadDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            size="default"
            style="width: 100%"
            @change="handleSearch"
          />
        </div>

        <div class="search-item search-buttons-container">
          <label class="search-label">操作</label>
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch" size="default">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset" size="default">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
      </div>
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

        <el-table-column prop="fileSize" label="文件大小" width="120" class-name="file-size-column">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>

        <el-table-column prop="fileType" label="文件类型" width="100" class-name="file-type-column">
          <template #default="{ row }">
            <el-tag :type="getFileTypeTag(row.fileType)">
              {{ getFileTypeName(row.fileType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="uploadTime"
          label="上传时间"
          width="180"
          class-name="upload-time-column"
        >
          <template #default="{ row }">
            {{ formatDate(row.uploadTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" class-name="status-column">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right" class-name="actions-column">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                type="primary"
                @click="handleView(row)"
                class="action-btn view-btn"
              >
                <el-icon><View /></el-icon>
                <span class="btn-text">查看</span>
              </el-button>
              <el-button
                size="small"
                type="success"
                @click="handleDownload(row)"
                class="action-btn download-btn"
              >
                <el-icon><Download /></el-icon>
                <span class="btn-text">下载</span>
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
                class="action-btn delete-btn"
              >
                <el-icon><Delete /></el-icon>
                <span class="btn-text">删除</span>
              </el-button>
            </div>
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
    <el-dialog v-model="detailDialogVisible" title="文件详情" width="700px">
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
          <div v-else-if="isVideo(currentFile.fileType)" class="video-preview">
            <video controls class="preview-video">
              <source
                :src="getImageUrl(currentFile.filePath)"
                :type="getVideoMimeType(currentFile.extension)"
              />
              您的浏览器不支持视频播放
            </video>
          </div>
          <div v-else-if="isAudio(currentFile.fileType)" class="audio-preview">
            <audio controls class="preview-audio">
              <source
                :src="getImageUrl(currentFile.filePath)"
                :type="getAudioMimeType(currentFile.extension)"
              />
              您的浏览器不支持音频播放
            </audio>
          </div>
          <div v-else-if="isPDF(currentFile.fileType)" class="pdf-preview">
            <iframe
              :src="getImageUrl(currentFile.filePath)"
              width="100%"
              height="400"
              frameborder="0"
            ></iframe>
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
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="500px">
      <el-upload
        class="upload-demo"
        drag
        :http-request="customUpload"
        :before-upload="beforeUpload"
        multiple
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持图片、文档、视频、音频文件，且不超过100MB</div>
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
import { Upload, Search, Refresh, View, Download, Delete } from '@element-plus/icons-vue'
import {
  getFileList,
  deleteFile,
  getFileDetail,
  batchDeleteFiles,
  downloadFile,
  uploadFile,
} from '@/api/file'

// 响应式数据
const searchForm = reactive({
  fileName: '',
  fileType: '',
  uploadDate: [],
})

const fileList = ref([])
const loading = ref(false)
const selectedFiles = ref([])
const searchTimeout = ref(null)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
})

const detailDialogVisible = ref(false)
const currentFile = ref(null)
const uploadDialogVisible = ref(false)

// 移除未使用的uploadHeaders

// 监听搜索条件变化，添加防抖
watch(
  () => [searchForm.fileName, searchForm.fileType, searchForm.uploadDate],
  () => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    searchTimeout.value = setTimeout(() => {
      pagination.currentPage = 1
      fetchFileList()
    }, 500)
  },
  { deep: true },
)

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
      pageSize: pagination.pageSize,
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
      fileList.value = response.data.files.map((file) => ({
        id: file.file_id,
        fileName: file.original_name,
        fileSize: file.file_size,
        fileType: getFileTypeFromExtension(file.extension),
        uploadTime: file.upload_time,
        status: 'success',
        filePath: file.access_url,
        category: file.category,
        tags: file.tags || [],
        extension: file.extension,
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
      config: error.config,
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
        ...response.data,
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
      type: 'warning',
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
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const fileIds = selectedFiles.value.map((file) => file.id)
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
    await ElMessageBox.confirm(
      `确定要下载选中的 ${selectedFiles.value.length} 个文件吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

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
  const isValidType = [
    // 图片格式
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    // 文档格式
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    // 视频格式
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/x-msvideo',
    'video/quicktime',
    'video/x-ms-wmv',
    // 音频格式
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg',
  ].includes(file.type)

  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isValidType) {
    ElMessage.error('只能上传指定格式的文件! 支持：图片、文档、视频、音频')
    return false
  }
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过 100MB!')
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
    image: 'Picture',
    document: 'Document',
    video: 'VideoCamera',
    audio: 'Headphone',
    other: 'Files',
  }
  return iconMap[fileType] || 'Files'
}

const getFileTypeTag = (fileType) => {
  const tagMap = {
    image: 'success',
    document: 'primary',
    video: 'warning',
    audio: 'info',
    other: 'info',
  }
  return tagMap[fileType] || 'info'
}

const getFileTypeName = (fileType) => {
  const nameMap = {
    image: '图片',
    document: '文档',
    video: '视频',
    audio: '音频',
    other: '其他',
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

const isVideo = (fileType) => {
  return fileType === 'video'
}

const isAudio = (fileType) => {
  return fileType === 'audio'
}

const isPDF = (fileType) => {
  return (
    fileType === 'document' &&
    (fileType.toLowerCase().endsWith('pdf') || fileType.toLowerCase().endsWith('pdfx'))
  )
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

const getVideoMimeType = (extension) => {
  if (extension === 'mp4') return 'video/mp4'
  if (extension === 'avi') return 'video/x-msvideo'
  if (extension === 'mov') return 'video/quicktime'
  if (extension === 'wmv') return 'video/x-ms-wmv'
  if (extension === 'flv') return 'video/x-flv'
  if (extension === 'webm') return 'video/webm'
  return 'video/mp4' // 默认类型
}

const getAudioMimeType = (extension) => {
  if (extension === 'mp3') return 'audio/mpeg'
  if (extension === 'wav') return 'audio/wav'
  if (extension === 'flac') return 'audio/flac'
  if (extension === 'aac') return 'audio/aac'
  if (extension === 'ogg') return 'audio/ogg'
  return 'audio/mpeg' // 默认类型
}
</script>

<style scoped>
/* 基础样式优化 */
.file-management {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 搜索栏样式优化 */
.search-bar {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: start;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.search-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1;
  white-space: nowrap;
  height: 20px;
  display: flex;
  align-items: center;
}

.search-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* 搜索按钮样式 */
.search-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.search-buttons .el-button {
  flex: 1;
  min-width: 80px;
  height: 40px !important;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  line-height: 40px;
}

.search-buttons .el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.search-buttons .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.search-buttons .el-button:not(.el-button--primary) {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.search-buttons .el-button:not(.el-button--primary):hover {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
}

/* 搜索输入框美化 */
.search-item :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;
  height: 40px !important;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  line-height: 40px;
}

.search-item :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.search-item :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-color: #409eff;
}

/* 搜索选择框美化 */
.search-item :deep(.el-select) {
  width: 100%;
}

.search-item :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  width: 100%;
  height: 40px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  line-height: 40px;
}

.search-item :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.search-item :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-color: #409eff;
}

/* 选择框下拉箭头美化 */
.search-item :deep(.el-select .el-input__suffix) {
  color: #c0c4cc;
  transition: color 0.3s ease;
}

.search-item :deep(.el-select:hover .el-input__suffix) {
  color: #409eff;
}

/* 选择框选项美化 */
.search-item :deep(.el-select-dropdown) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e4e7ed;
}

.search-item :deep(.el-select-dropdown .el-select-dropdown__item) {
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.search-item :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

.search-item :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

/* 日期选择器美化 */
.search-item :deep(.el-date-editor) {
  border-radius: 8px;
  width: 100% !important;
  height: 40px !important;
}

.search-item :deep(.el-date-editor .el-input__wrapper) {
  border-radius: 8px;
  width: 100%;
  height: 40px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  line-height: 40px;
}

.search-item :deep(.el-date-editor .el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.search-item :deep(.el-date-editor .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-color: #409eff;
}

/* 强制统一所有输入元素的高度 */
.search-item :deep(.el-input),
.search-item :deep(.el-select),
.search-item :deep(.el-date-editor) {
  height: 40px !important;
}

.search-item :deep(.el-input__inner) {
  height: 40px !important;
  line-height: 40px !important;
}

/* 确保按钮高度也一致 */
.search-buttons .el-button {
  flex: 1;
  min-width: 80px;
  height: 40px !important;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  line-height: 40px;
}

/* 表格样式优化 */
.table-container {
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  padding: 16px 0;
}

/* 文件信息样式 */
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

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  min-width: auto;
  padding: 6px 12px;
}

.btn-text {
  margin-left: 4px;
}

/* 响应式列显示控制 */
@media (max-width: 1200px) {
  .file-size-column {
    min-width: 100px;
  }

  .upload-time-column {
    min-width: 150px;
  }
}

@media (max-width: 992px) {
  .status-column {
    display: none;
  }

  .upload-time-column {
    min-width: 120px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .file-size-column {
    display: none;
  }

  .file-type-column {
    min-width: 80px;
  }

  .upload-time-column {
    display: none;
  }

  .actions-column {
    min-width: 120px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
    padding: 8px 12px;
  }

  .btn-text {
    display: none;
  }

  .action-btn .el-icon {
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .file-type-column {
    min-width: 60px;
  }

  .actions-column {
    min-width: 100px;
  }

  .action-btn {
    padding: 6px 8px;
    min-height: 36px;
  }

  .action-btn .el-icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .actions-column {
    min-width: 80px;
  }

  .action-btn {
    padding: 4px 6px;
    min-height: 32px;
  }

  .action-btn .el-icon {
    font-size: 12px;
  }
}

/* 打印时显示所有列 */
@media print {
  .file-size-column,
  .file-type-column,
  .upload-time-column,
  .status-column {
    display: table-cell !important;
  }

  .action-buttons {
    flex-direction: row;
  }

  .btn-text {
    display: inline !important;
  }
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

/* 搜索框样式优化 */
:deep(.el-input__wrapper) {
  border-radius: 6px;
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

/* 响应式设计 */
@media (max-width: 1400px) {
  .file-management {
    padding: 18px;
  }

  .search-bar .el-col {
    margin-bottom: 16px;
  }

  .search-bar .el-col:last-child {
    margin-bottom: 0;
  }

  .table-container {
    margin: 0 -18px;
  }
}

@media (max-width: 1200px) {
  .file-management {
    padding: 16px;
  }

  .search-bar .el-col {
    margin-bottom: 16px;
  }

  .search-bar .el-col:last-child {
    margin-bottom: 0;
  }

  .page-header {
    gap: 20px;
  }

  .page-header h2 {
    font-size: 22px;
  }

  .table-container {
    margin: 0 -16px;
  }
}

@media (max-width: 992px) {
  .file-management {
    padding: 14px;
  }

  .search-bar {
    padding: 20px;
    margin-bottom: 18px;
  }

  .search-row {
    margin: 0;
  }

  .search-col {
    margin-bottom: 20px;
    padding: 0 8px;
  }

  .search-col:last-child {
    margin-bottom: 0;
  }

  .search-buttons {
    justify-content: center;
  }

  .search-buttons .el-button {
    flex: none;
    min-width: 100px;
  }

  .table-container {
    margin: 0 -14px;
    overflow-x: auto;
  }

  :deep(.el-table) {
    min-width: 900px;
  }

  .batch-actions {
    padding: 18px;
    margin-bottom: 18px;
  }

  .batch-actions .el-button {
    margin: 6px 6px 6px 0;
  }

  .pagination-container {
    margin-bottom: 18px;
  }
}

@media (max-width: 768px) {
  .file-management {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding-bottom: 12px;
    margin-bottom: 18px;
  }

  .page-header h2 {
    font-size: 20px;
    margin: 0;
  }

  .page-header .el-button {
    width: 100%;
    justify-content: center;
  }

  .search-bar {
    padding: 18px;
    margin-bottom: 16px;
  }

  .search-col {
    margin-bottom: 16px;
    padding: 0;
  }

  .search-col:last-child {
    margin-bottom: 0;
  }

  .search-label {
    font-size: 13px;
  }

  .search-buttons {
    justify-content: stretch;
  }

  .search-buttons .el-button {
    flex: 1;
    min-width: auto;
    height: 44px;
  }

  .table-container {
    margin: 0 -12px;
    border-radius: 0;
  }

  :deep(.el-table) {
    min-width: 800px;
    font-size: 14px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 12px 8px;
  }

  .batch-actions {
    padding: 16px;
    margin-bottom: 16px;
  }

  .batch-actions .el-button {
    margin: 4px;
    width: 100%;
  }

  .pagination-container {
    padding: 16px;
    text-align: center;
    margin-bottom: 16px;
  }

  :deep(.el-pagination) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.el-pagination .el-pager li) {
    margin: 0 2px;
  }
}

@media (max-width: 576px) {
  .file-management {
    padding: 10px;
  }

  .page-header {
    padding-bottom: 10px;
    margin-bottom: 16px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .search-bar {
    padding: 16px;
    margin-bottom: 14px;
  }

  .search-col {
    margin-bottom: 16px;
  }

  .search-label {
    font-size: 12px;
  }

  .search-item :deep(.el-input),
  .search-item :deep(.el-select),
  .search-item :deep(.el-date-editor) {
    width: 100%;
  }

  .search-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .search-buttons .el-button {
    width: 100%;
    justify-content: center;
    height: 44px;
  }

  .table-container {
    margin: 0 -10px;
  }

  :deep(.el-table) {
    min-width: 700px;
    font-size: 13px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 8px 6px;
  }

  .batch-actions {
    padding: 14px;
    margin-bottom: 14px;
  }

  .pagination-container {
    padding: 14px;
    margin-bottom: 14px;
  }

  :deep(.el-pagination) {
    font-size: 14px;
  }

  :deep(.el-pagination .btn-prev),
  :deep(.el-pagination .btn-next) {
    padding: 8px 12px;
  }

  :deep(.el-pagination .el-pager li) {
    padding: 8px 10px;
    margin: 0 1px;
  }
}

@media (max-width: 480px) {
  .file-management {
    padding: 8px;
  }

  .page-header {
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .page-header h2 {
    font-size: 16px;
  }

  .search-bar {
    padding: 14px;
    margin-bottom: 12px;
  }

  .search-col {
    margin-bottom: 12px;
  }

  .search-label {
    font-size: 11px;
  }

  .table-container {
    margin: 0 -8px;
  }

  :deep(.el-table) {
    min-width: 600px;
    font-size: 12px;
  }

  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 6px 4px;
  }

  .batch-actions {
    padding: 12px;
    margin-bottom: 12px;
  }

  .pagination-container {
    padding: 12px;
    margin-bottom: 12px;
  }

  :deep(.el-pagination) {
    font-size: 13px;
  }

  :deep(.el-pagination .btn-prev),
  :deep(.el-pagination .btn-next) {
    padding: 6px 10px;
  }

  :deep(.el-pagination .el-pager li) {
    padding: 6px 8px;
    margin: 0;
  }
}

/* 文件预览样式 */
.file-preview {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-preview h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.image-preview {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-preview {
  text-align: center;
}

.preview-video {
  width: 100%;
  max-width: 600px;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.audio-preview {
  text-align: center;
  padding: 20px;
}

.preview-audio {
  width: 100%;
  max-width: 400px;
}

.pdf-preview {
  text-align: center;
}

.file-info-preview {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.preview-icon {
  font-size: 60px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.file-info-preview p {
  margin: 8px 0;
  font-size: 14px;
}
</style>
