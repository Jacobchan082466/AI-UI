<template>
  <div class="camera-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">拍摄管理</h1>
      <p class="page-description">连接电脑摄像头，进行拍照和录制</p>
    </div>

    <!-- 摄像头控制区域 -->
    <el-row :gutter="20" class="camera-controls">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>摄像头控制</span>
              <div class="control-buttons">
                <el-button
                  type="primary"
                  :icon="VideoPlay"
                  @click="startCamera"
                  :disabled="isCameraActive"
                >
                  启动摄像头
                </el-button>
                <el-button
                  type="danger"
                  :icon="VideoPause"
                  @click="stopCamera"
                  :disabled="!isCameraActive"
                >
                  停止摄像头
                </el-button>
                <el-button
                  type="success"
                  :icon="Camera"
                  @click="takePhoto"
                  :disabled="!isCameraActive"
                >
                  拍照
                </el-button>
                <el-button
                  type="warning"
                  :icon="VideoCamera"
                  @click="toggleRecording"
                  :disabled="!isCameraActive"
                >
                  {{ isRecording ? '停止录制' : '开始录制' }}
                </el-button>
              </div>
            </div>
          </template>

          <!-- 摄像头状态信息 -->
          <div class="camera-status">
            <el-alert
              :title="cameraStatus.title"
              :type="cameraStatus.type"
              :description="cameraStatus.description"
              show-icon
              :closable="false"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 视频显示区域 -->
    <el-row :gutter="20" class="video-section">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>实时视频</span>
          </template>

          <div class="video-container">
            <video ref="videoElement" class="camera-video" autoplay muted playsinline></video>

            <!-- 摄像头未启动时的占位符 -->
            <div v-if="!isCameraActive" class="video-placeholder">
              <el-icon size="80" color="#ddd">
                <VideoCamera />
              </el-icon>
              <p>请点击"启动摄像头"按钮开始使用</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>拍照预览</span>
          </template>

          <div class="photo-preview">
            <img v-if="capturedPhoto" :src="capturedPhoto" class="preview-image" alt="拍照预览" />
            <div v-else class="no-photo">
              <el-icon size="60" color="#ddd">
                <Picture />
              </el-icon>
              <p>暂无照片</p>
            </div>

            <div class="photo-actions" v-if="capturedPhoto">
              <el-button size="small" type="primary" @click="downloadPhoto"> 下载照片 </el-button>
              <el-button size="small" type="danger" @click="clearPhoto"> 清除照片 </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 录制状态和文件管理 -->
    <el-row :gutter="20" class="recording-section" v-if="isCameraActive">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>录制管理</span>
          </template>

          <div class="recording-info">
            <div class="recording-status">
              <el-tag :type="isRecording ? 'danger' : 'success'" size="large">
                {{ isRecording ? '录制中...' : '未录制' }}
              </el-tag>
              <span v-if="isRecording" class="recording-time"> 录制时长: {{ recordingTime }} </span>
            </div>

            <div class="recording-controls">
              <el-button v-if="recordedVideos.length > 0" type="info" @click="showVideoList">
                查看录制文件 ({{ recordedVideos.length }})
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 录制文件列表对话框 -->
    <el-dialog v-model="videoListVisible" title="录制文件列表" width="60%">
      <div class="video-list">
        <el-table :data="recordedVideos" style="width: 100%">
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="size" label="文件大小" width="120" />
          <el-table-column prop="date" label="录制时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" type="primary" @click="playVideo(scope.row)">
                播放
              </el-button>
              <el-button size="small" type="success" @click="downloadVideo(scope.row)">
                下载
              </el-button>
              <el-button size="small" type="danger" @click="deleteVideo(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, VideoPause, Camera, VideoCamera, Picture } from '@element-plus/icons-vue'

// 响应式数据
const videoElement = ref(null)
const isCameraActive = ref(false)
const isRecording = ref(false)
const capturedPhoto = ref(null)
const videoListVisible = ref(false)
const recordingTime = ref('00:00')
const recordedVideos = ref([])

// 摄像头流
let mediaStream = null
let mediaRecorder = null
let recordingChunks = []
let recordingTimer = null

// 摄像头状态
const cameraStatus = ref({
  title: '摄像头未启动',
  type: 'info',
  description: '请点击"启动摄像头"按钮连接您的电脑摄像头',
})

// 启动摄像头
const startCamera = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream
      isCameraActive.value = true
      cameraStatus.value = {
        title: '摄像头已启动',
        type: 'success',
        description: '摄像头连接成功，可以进行拍照和录制',
      }
      ElMessage.success('摄像头启动成功！')
    }
  } catch (error) {
    console.error('摄像头启动失败:', error)
    ElMessage.error('摄像头启动失败，请检查权限设置')
    cameraStatus.value = {
      title: '摄像头启动失败',
      type: 'error',
      description: '无法访问摄像头，请检查浏览器权限设置',
    }
  }
}

// 停止摄像头
const stopCamera = () => {
  if (isRecording.value) {
    stopRecording()
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null
  }

  isCameraActive.value = false
  cameraStatus.value = {
    title: '摄像头已停止',
    type: 'info',
    description: '摄像头已断开连接',
  }

  ElMessage.info('摄像头已停止')
}

// 拍照
const takePhoto = () => {
  if (!isCameraActive.value) return

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = videoElement.value.videoWidth
  canvas.height = videoElement.value.videoHeight

  context.drawImage(videoElement.value, 0, 0)

  capturedPhoto.value = canvas.toDataURL('image/jpeg')
  ElMessage.success('拍照成功！')
}

// 清除照片
const clearPhoto = () => {
  capturedPhoto.value = null
  ElMessage.info('照片已清除')
}

// 下载照片
const downloadPhoto = () => {
  if (!capturedPhoto.value) return

  const link = document.createElement('a')
  link.download = `photo_${new Date().getTime()}.jpg`
  link.href = capturedPhoto.value
  link.click()

  ElMessage.success('照片下载成功！')
}

// 开始/停止录制
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 开始录制
const startRecording = () => {
  if (!mediaStream) return

  recordingChunks = []
  mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType: 'video/webm;codecs=vp9',
  })

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordingChunks.push(event.data)
    }
  }

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordingChunks, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)

    recordedVideos.value.push({
      name: `recording_${new Date().getTime()}.webm`,
      size: formatFileSize(blob.size),
      date: new Date().toLocaleString(),
      url: url,
      blob: blob,
    })

    ElMessage.success('录制完成！')
  }

  mediaRecorder.start()
  isRecording.value = true

  // 开始计时
  let seconds = 0
  recordingTimer = setInterval(() => {
    seconds++
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    recordingTime.value = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, 1000)

  ElMessage.success('开始录制...')
}

// 停止录制
const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false

    if (recordingTimer) {
      clearInterval(recordingTimer)
      recordingTimer = null
    }

    recordingTime.value = '00:00'
    ElMessage.info('录制已停止')
  }
}

// 显示视频列表
const showVideoList = () => {
  videoListVisible.value = true
}

// 播放视频
const playVideo = (video) => {
  const videoWindow = window.open('', '_blank')
  videoWindow.document.write(`
    <html>
      <head><title>播放视频</title></head>
      <body style="margin:0;padding:20px;background:#000;">
        <video controls autoplay style="width:100%;max-width:800px;">
          <source src="${video.url}" type="video/webm">
        </video>
      </body>
    </html>
  `)
}

// 下载视频
const downloadVideo = (video) => {
  const link = document.createElement('a')
  link.download = video.name
  link.href = video.url
  link.click()

  ElMessage.success('视频下载成功！')
}

// 删除视频
const deleteVideo = (video) => {
  ElMessageBox.confirm('确定要删除这个录制文件吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = recordedVideos.value.findIndex((v) => v.name === video.name)
    if (index > -1) {
      recordedVideos.value.splice(index, 1)
      URL.revokeObjectURL(video.url)
      ElMessage.success('文件已删除')
    }
  })
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件卸载时清理资源
onUnmounted(() => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
  }
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }
})
</script>

<style scoped>
.camera-page {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.camera-controls {
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

.camera-status {
  margin-bottom: 16px;
}

.video-section {
  margin-bottom: 24px;
}

.video-container {
  position: relative;
  width: 100%;
  height: 400px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  background-color: #f5f5f5;
}

.video-placeholder p {
  margin-top: 16px;
  font-size: 16px;
}

.photo-preview {
  text-align: center;
}

.preview-image {
  width: 100%;
  max-width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.no-photo {
  padding: 40px 20px;
  color: #999;
}

.no-photo p {
  margin-top: 16px;
  font-size: 14px;
}

.photo-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.recording-section {
  margin-bottom: 24px;
}

.recording-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recording-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.recording-time {
  font-size: 16px;
  color: #666;
}

.recording-controls {
  display: flex;
  gap: 12px;
}

.video-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
