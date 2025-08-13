// 环境配置
const env = import.meta.env.MODE || 'development'

// 配置文件
const config = {
  development: {
    // 开发环境
    baseURL: 'http://localhost:8399', // Go后端地址
    uploadURL: 'http://localhost:8399/api/file/upload',
    timeout: 30000
  },
  production: {
    // 生产环境
    baseURL: window.location.origin, // 使用当前域名
    uploadURL: '/api/file/upload',
    timeout: 30000
  },
  test: {
    // 测试环境
    baseURL: 'http://test-api.example.com',
    uploadURL: 'http://test-api.example.com/api/file/upload',
    timeout: 30000
  }
}

// 导出当前环境的配置
export default config[env]

// 导出环境变量
export const isDev = env === 'development'
export const isProd = env === 'production'
export const isTest = env === 'test'
