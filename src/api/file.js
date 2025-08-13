import request from '@/utils/request'

// 获取文件列表
export function getFileList(params) {
  return request({
    url: '/api/file/list',
    method: 'get',
    params: {
      page: params.page,
      pageSize: params.pageSize,
      category: params.category || undefined,
      tags: params.tags || undefined
    }
  })
}

// 获取文件详情
export function getFileDetail(fileId) {
  return request({
    url: `/api/file/info/${fileId}`,
    method: 'get'
  })
}

// 删除文件
export function deleteFile(fileId) {
  return request({
    url: `/api/file/${fileId}`,
    method: 'delete'
  })
}

// 批量删除文件
export function batchDeleteFiles(fileIds) {
  // 由于后端没有批量删除接口，这里使用Promise.all来并行删除
  const promises = fileIds.map(id => deleteFile(id))
  return Promise.all(promises)
}

// 上传文件
export function uploadFile(file, tags = []) {
  const formData = new FormData()
  formData.append('file', file)

  // 添加标签信息
  if (tags && tags.length > 0) {
    formData.append('tags', JSON.stringify(tags))
  }

  return request({
    url: '/api/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载文件
export function downloadFile(fileId) {
  return request({
    url: `/api/file/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}
