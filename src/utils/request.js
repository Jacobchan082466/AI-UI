import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8399', // 指向Go后端地址
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('发送请求:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
      params: config.params,
      data: config.data
    })

    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }

    return config
  },
  error => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 如果是文件下载，直接返回响应
    if (response.config.responseType === 'blob') {
      return response.data
    }

    // 检查响应状态
    if (response.status >= 200 && response.status < 300) {
      return response.data
    } else {
      return Promise.reject(new Error(`HTTP ${response.status}: ${response.statusText}`))
    }
  },
  error => {
    console.error('Response error:', error)

    // 处理不同类型的错误
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          // 禁止访问
          console.error('Access forbidden:', data)
          break
        case 404:
          // 资源不存在
          console.error('Resource not found:', data)
          break
        case 500:
          // 服务器内部错误
          console.error('Internal server error:', data)
          break
        default:
          console.error(`HTTP ${status} error:`, data)
      }

      return Promise.reject(new Error(data?.message || `HTTP ${status} 错误`))
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('No response received:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查网络设置'))
    } else {
      // 请求配置错误
      console.error('Request config error:', error.message)
      return Promise.reject(new Error('请求配置错误：' + error.message))
    }
  }
)

export default service
