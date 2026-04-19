/**
 * AI API 快速切换脚本
 * 
 * 功能：
 * 1. 在模拟模式和真实 API 之间快速切换
 * 2. 测试 API 连接
 * 3. 查看 API 使用状态
 */

import { 
  AI_PLATFORM,
  ALIYUN_CONFIG,
  BAIDU_CONFIG,
  XFYUN_CONFIG,
  COMMON_CONFIG
} from './config.js';
import {
  sendChatRequest,
  callRealAIAPI
} from './aiService.js';

// ==================== 快速切换函数 ====================

/**
 * 切换到模拟模式
 */
export const switchToMock = () => {
  console.log('✅ 已切换到模拟模式');
  console.log('📝 提示：编辑 utils/config.js 中的 AI_PLATFORM 为 "mock"');
};

/**
 * 切换到通义千问
 */
export const switchToAliyun = () => {
  console.log('✅ 已切换到通义千问');
  console.log('📝 下一步：');
  console.log('1. 访问 https://dashscope.console.aliyun.com/ 注册账号');
  console.log('2. 获取 API Key');
  console.log('3. 编辑 utils/config.js，填写 ALIYUN_CONFIG.apiKey');
  console.log('4. 将 AI_PLATFORM 改为 "aliyun"');
};

/**
 * 切换到文心一言
 */
export const switchToBaidu = () => {
  console.log('✅ 已切换到文心一言');
  console.log('📝 下一步：');
  console.log('1. 访问 https://cloud.baidu.com/product/wenxinworkshop 注册账号');
  console.log('2. 获取 API Key 和 Secret Key');
  console.log('3. 编辑 utils/config.js，填写 BAIDU_CONFIG');
  console.log('4. 将 AI_PLATFORM 改为 "baidu"');
};

/**
 * 切换到讯飞星火
 */
export const switchToXfyun = () => {
  console.log('✅ 已切换到讯飞星火');
  console.log('📝 下一步：');
  console.log('1. 访问 https://www.xfyun.cn/spark 注册账号');
  console.log('2. 获取 API Key、Secret 和 App ID');
  console.log('3. 编辑 utils/config.js，填写 XFYUN_CONFIG');
  console.log('4. 将 AI_PLATFORM 改为 "xfyun"');
};

// ==================== 测试函数 ====================

/**
 * 测试 API 连接
 */
export const testAIConnection = async () => {
  console.log('🧪 开始测试 AI 连接...');
  console.log('当前平台:', AI_PLATFORM);
  
  if (AI_PLATFORM === 'mock') {
    console.log('ℹ️ 当前为模拟模式，不测试真实 API');
    return;
  }
  
  try {
    const startTime = Date.now();
    
    const response = await callRealAIAPI(
      '你好，请简单介绍一下自己',
      [],
      '你是一位友好的科学实验助手'
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ API 连接成功！');
    console.log('⏱️  响应时间:', duration, 'ms');
    console.log('📝 AI 回复:', response);
    
    return {
      success: true,
      duration,
      response
    };
  } catch (error) {
    console.error('❌ API 连接失败:', error.message);
    console.error('💡 建议：');
    console.error('1. 检查 API Key 是否正确');
    console.error('2. 检查网络连接');
    console.error('3. 确认 API 服务状态');
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 测试对话功能
 */
export const testChatFunction = async () => {
  console.log('🧪 开始测试对话功能...');
  
  const testMessages = [
    '离心力的原理是什么？',
    '为什么洗衣机脱水时衣服会贴在桶壁上？',
    '如何设计一个公平的科学实验？'
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    console.log(`\n📤 问题 ${i + 1}:`, testMessages[i]);
    
    try {
      const response = await sendChatRequest({
        message: testMessages[i],
        scene: 'principle'
      });
      
      if (response.success) {
        console.log('📥 AI 回复:', response.message);
      } else {
        console.log('❌ 回复失败:', response.error);
      }
    } catch (error) {
      console.error('❌ 对话失败:', error);
    }
    
    // 避免请求过快
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// ==================== 状态查看 ====================

/**
 * 查看当前配置状态
 */
export const showStatus = () => {
  console.log('📊 AI 服务状态');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('当前平台:', AI_PLATFORM);
  console.log('');
  
  switch (AI_PLATFORM) {
    case 'mock':
      console.log('🎭 模式：模拟回复');
      console.log('💰 费用：免费');
      console.log('⚡ 速度：快速');
      console.log('🔧 状态：就绪');
      break;
      
    case 'aliyun':
      console.log('☁️  平台：通义千问（阿里云）');
      console.log('🔑 API Key:', ALIYUN_CONFIG.apiKey ? '已配置 ✓' : '未配置 ✗');
      console.log('📦 模型:', ALIYUN_CONFIG.model || 'qwen-turbo');
      console.log('💰 免费额度：每月 100 万 tokens');
      console.log('⚡ 速度：快');
      console.log('🔧 状态:', ALIYUN_CONFIG.apiKey !== 'sk-xxxxxxxxxxxxxxxxxxxxxxxx' ? '就绪 ✓' : '需要配置 ✗');
      break;
      
    case 'baidu':
      console.log('🔵 平台：文心一言（百度）');
      console.log('🔑 API Key:', BAIDU_CONFIG.apiKey ? '已配置 ✓' : '未配置 ✗');
      console.log('🔐 Secret Key:', BAIDU_CONFIG.secretKey ? '已配置 ✓' : '未配置 ✗');
      console.log('💰 免费额度：每月一定额度');
      console.log('⚡ 速度：快');
      console.log('🔧 状态:', BAIDU_CONFIG.apiKey !== 'your-baidu-api-key' ? '就绪 ✓' : '需要配置 ✗');
      break;
      
    case 'xfyun':
      console.log('🚀 平台：讯飞星火');
      console.log('🔑 API Key:', XFYUN_CONFIG.apiKey ? '已配置 ✓' : '未配置 ✗');
      console.log('🔐 Secret:', XFYUN_CONFIG.apiSecret ? '已配置 ✓' : '未配置 ✗');
      console.log('📱 App ID:', XFYUN_CONFIG.appId ? '已配置 ✓' : '未配置 ✗');
      console.log('💰 免费额度：有限');
      console.log('⚡ 速度：中等');
      console.log('🔧 状态:', XFYUN_CONFIG.apiKey !== 'your-xf-api-key' ? '就绪 ✓' : '需要配置 ✗');
      break;
      
    default:
      console.log('⚠️  未知平台');
  }
  
  console.log('');
  console.log('通用配置:');
  console.log('⏱️  超时时间:', COMMON_CONFIG.timeout, 'ms');
  console.log('🌡️  温度参数:', COMMON_CONFIG.temperature);
  console.log('📏 最大 Tokens:', COMMON_CONFIG.maxTokens);
  console.log('🔄 频率限制:', COMMON_CONFIG.rateLimit, '次/分钟');
  console.log('🛡️  降级保护:', COMMON_CONFIG.enableFallback ? '开启 ✓' : '关闭 ✗');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

// ==================== 使用指南 ====================

/**
 * 显示使用指南
 */
export const showGuide = () => {
  console.log('\n📖 AI API 快速入门指南');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('1️⃣  选择 AI 平台');
  console.log('   - 推荐：通义千问（免费额度高）');
  console.log('   - 备选：文心一言、讯飞星火');
  console.log('');
  
  console.log('2️⃣  注册账号');
  console.log('   - 通义千问：https://dashscope.console.aliyun.com/');
  console.log('   - 文心一言：https://cloud.baidu.com/product/wenxinworkshop');
  console.log('   - 讯飞星火：https://www.xfyun.cn/spark');
  console.log('');
  
  console.log('3️⃣  获取 API Key');
  console.log('   - 完成实名认证（需要家长或老师协助）');
  console.log('   - 创建应用，获取 API Key');
  console.log('');
  
  console.log('4️⃣  配置项目');
  console.log('   - 编辑 utils/config.js');
  console.log('   - 填写对应的 API Key');
  console.log('   - 修改 AI_PLATFORM 为对应平台');
  console.log('');
  
  console.log('5️⃣  测试连接');
  console.log('   - 运行：testAIConnection()');
  console.log('   - 确认响应正常');
  console.log('');
  
  console.log('6️⃣  开始使用');
  console.log('   - AI 功能会自动使用真实 API');
  console.log('   - 如需切换回模拟模式，设置 AI_PLATFORM = "mock"');
  console.log('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('💡 常用命令:');
  console.log('  showStatus()        - 查看当前状态');
  console.log('  testAIConnection()  - 测试 API 连接');
  console.log('  testChatFunction()  - 测试对话功能');
  console.log('  switchToAliyun()    - 切换到通义千问');
  console.log('  switchToBaidu()     - 切换到文心一言');
  console.log('  switchToXfyun()     - 切换到讯飞星火');
  console.log('  switchToMock()      - 切换到模拟模式');
  console.log('');
};

// 导出所有函数
export default {
  switchToMock,
  switchToAliyun,
  switchToBaidu,
  switchToXfyun,
  testAIConnection,
  testChatFunction,
  showStatus,
  showGuide
};
