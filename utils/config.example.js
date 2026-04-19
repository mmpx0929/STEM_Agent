/**
 * AI 服务配置
 * 
 * 使用说明：
 * 1. 选择一个 AI 平台（推荐通义千问）
 * 2. 注册账号并获取 API Key
 * 3. 在下方填写你的 API Key
 * 4. 在 aiService.js 中导入此配置
 * 
 * 注意：
 * - API Key 需要妥善保管，不要提交到代码仓库
 * - 建议使用环境变量或后端转发来保护 API Key
 * - 学生项目推荐先使用模拟模式测试
 */

// ==================== 配置选择 ====================

// 当前使用的平台：'mock' | 'aliyun' | 'baidu' | 'xfyun'
// 'mock' - 模拟模式（默认，不消耗 API 额度）
// 'aliyun' - 通义千问（推荐）
// 'baidu' - 文心一言
// 'xfyun' - 讯飞星火
export const AI_PLATFORM = 'mock';

// ==================== 通义千问配置（推荐） ====================
// 获取地址：https://dashscope.console.aliyun.com/
export const ALIYUN_CONFIG = {
  apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx', // 替换为你的 API Key
  model: 'qwen-turbo', // 可选：qwen-turbo, qwen-plus, qwen-max
  baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
};

// ==================== 文心一言配置 ====================
// 获取地址：https://cloud.baidu.com/product/wenxinworkshop
export const BAIDU_CONFIG = {
  apiKey: 'your-baidu-api-key', // 替换为你的 API Key
  secretKey: 'your-baidu-secret-key', // 替换为你的 Secret Key
  baseUrl: 'https://aip.baidubce.com'
};

// ==================== 讯飞星火配置 ====================
// 获取地址：https://www.xfyun.cn/spark
export const XFYUN_CONFIG = {
  apiKey: 'your-xf-api-key', // 替换为你的 API Key
  apiSecret: 'your-xf-api-secret', // 替换为你的 API Secret
  appId: 'your-xf-app-id', // 替换为你的 App ID
  baseUrl: 'https://spark-api-open.xf-yun.com'
};

// ==================== 通用配置 ====================

export const COMMON_CONFIG = {
  // 请求超时时间（毫秒）
  timeout: 30000,
  
  // 温度参数（0-1，越高越随机）
  temperature: 0.7,
  
  // 最大生成 token 数
  maxTokens: 500,
  
  // 是否启用流式响应（如果平台支持）
  enableStreaming: false,
  
  // 请求频率限制（每分钟最大请求数）
  rateLimit: 10,
  
  // 是否启用降级（API 失败时使用模拟回复）
  enableFallback: true
};

// ==================== 使用示例 ====================

/**
 * 在 aiService.js 中使用：
 * 
 * import { AI_PLATFORM, ALIYUN_CONFIG, COMMON_CONFIG } from './config.js';
 * 
 * // 根据平台选择配置
 * const API_CONFIG = {
 *   platform: AI_PLATFORM,
 *   ... (AI_PLATFORM === 'aliyun' ? ALIYUN_CONFIG : 
 *       AI_PLATFORM === 'baidu' ? BAIDU_CONFIG : 
 *       AI_PLATFORM === 'xfyun' ? XFYUN_CONFIG : {}),
 *   ...COMMON_CONFIG
 * };
 */

// ==================== 安全提示 ====================

/**
 * ⚠️ 重要安全提示：
 * 
 * 1. 不要在公开的代码仓库中存储真实的 API Key
 * 2. 建议使用 git 忽略此文件，使用 config.example.js 作为模板
 * 3. 生产环境应该通过后端服务器转发请求
 * 4. 设置合理的请求频率限制，避免 API Key 被盗用
 * 
 * Git 忽略配置（.gitignore）：
 * utils/config.js
 * 
 * 只提交示例文件：
 * utils/config.example.js
 */

export default {
  AI_PLATFORM,
  ALIYUN_CONFIG,
  BAIDU_CONFIG,
  XFYUN_CONFIG,
  COMMON_CONFIG
};
