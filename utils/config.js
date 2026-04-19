/**
 * AI 服务真实配置（本地使用）
 *
 * 注意：
 * 1. 请勿将真实 API Key 提交到公开仓库
 * 2. 推荐生产环境走后端代理，前端不直连三方大模型
 */

// 当前平台：'mock' | 'aliyun' | 'baidu' | 'xfyun'
export const AI_PLATFORM = 'aliyun';

// 阿里云通义千问（DashScope）
export const ALIYUN_CONFIG = {
  apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
  model: 'qwen-turbo',
  // 当前实现使用 text-generation 接口
  baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
};

// 百度文心一言
export const BAIDU_CONFIG = {
  apiKey: 'your-baidu-api-key',
  secretKey: 'your-baidu-secret-key',
  // 例如：ernie-lite-8k / ernie-4.0-8k-latest（以你开通的模型为准）
  model: 'ernie-lite-8k',
  baseUrl: 'https://aip.baidubce.com'
};

// 讯飞星火（当前 aiService 未实现直连，建议走后端代理）
export const XFYUN_CONFIG = {
  apiKey: 'your-xf-api-key',
  apiSecret: 'your-xf-api-secret',
  appId: 'your-xf-app-id',
  baseUrl: 'https://spark-api-open.xf-yun.com'
};

export const COMMON_CONFIG = {
  timeout: 30000,
  temperature: 0.7,
  maxTokens: 500,
  enableStreaming: true,
  rateLimit: 10,
  // 真实 API 失败时自动降级到本地 mock 回复
  enableFallback: true
};

// 后端代理配置（推荐 H5/浏览器环境使用）
// 启用后，前端不再直连第三方大模型，而是请求你自己的后端接口
export const PROXY_CONFIG = {
  enabled: true,
  // 本地代理服务地址（推荐用 127.0.0.1，避免部分环境 DNS 解析问题）
  baseUrl: 'http://127.0.0.1:3000',
  // 示例：/api/ai/chat
  chatPath: '/api/ai/chat',
  streamPath: '/api/ai/chat/stream'
};

export default {
  AI_PLATFORM,
  ALIYUN_CONFIG,
  BAIDU_CONFIG,
  XFYUN_CONFIG,
  COMMON_CONFIG,
  PROXY_CONFIG
};
