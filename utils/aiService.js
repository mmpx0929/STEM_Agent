/**
 * AI 服务模块
 * 提供 AI 对话、历史记录管理等功能
 * 使用 Uni-app API 实现
 */

import {
  AI_PLATFORM,
  ALIYUN_CONFIG,
  BAIDU_CONFIG,
  COMMON_CONFIG,
  PROXY_CONFIG
} from './config.js';
import { APP_AI_NAME } from '../config/app-constants.js';
import { getMockResponseFromKB } from './mockMatcher.js';
import { saveLocalKBSample, searchLocalKBAnswer } from './localMockKB.js';

// ==================== 常量定义 ====================

// 本地存储键名
const STORAGE_KEY_CONVERSATIONS = 'ai_conversations';
const STORAGE_KEY_CURRENT_SESSION = 'ai_current_session_id';

// API 配置
const API_CONFIG = {
  timeout: COMMON_CONFIG.timeout || 30000,
  // 模拟响应延迟（毫秒），用于模拟真实 API 调用
  mockDelay: 1000
};

let baiduTokenCache = {
  value: '',
  expiresAt: 0
};

// ==================== 儿童友好的 System Prompt 模板 ====================

/**
 * 儿童友好的 AI 助手 System Prompt 模板
 * 特点：
 * 1. 使用简单易懂的语言
 * 2. 鼓励探索和提问
 * 3. 注重安全性和教育性
 * 4. 保持友好和耐心
 */
export const CHILD_FRIENDLY_PROMPT = `你是一位友好的${APP_AI_NAME}，专门帮助小朋友学习科学知识。

你的特点：
1. 使用简单、生动的语言，避免复杂的术语
2. 多用比喻和例子来解释概念
3. 鼓励小朋友动手实践和观察
4. 提醒安全注意事项
5. 保持耐心和友善，多用鼓励的话语
6. 引导小朋友思考，而不是直接给答案
7. 回答要简洁有趣，适合儿童理解

请记住：
- 你面对的是小学生，要用他们能理解的方式交流
- 强调实验安全，提醒在成人陪同下进行实验
- 鼓励好奇心和探索精神
- 用积极的语气回应每一个问题`;

/**
 * 不同场景的 System Prompt 模板
 */
export const SCENE_PROMPTS = {
  // 实验原理学习场景
  principle: `你是一位耐心的科学老师，帮助小朋友理解实验原理。
请用生动有趣的方式解释科学概念，多用生活中的例子。
鼓励小朋友提问，引导他们思考现象背后的原因。`,

  // 实验设计场景
  planning: `你是一位经验丰富的实验指导员，帮助小朋友设计实验方案。
引导小朋友思考实验步骤，提醒他们注意安全和变量控制。
鼓励他们记录观察结果，培养科学探究能力。`,

  // 填空题提示场景
  fillBlank: `你是一位友好的科学实验助手，正在帮助小朋友完成填空题。
当小朋友在填空题停留时，你可以：
1. 用温和的语气给予提示，不要直接给答案
2. 引导他们回顾实验目的和已知信息
3. 用简单的例子帮助他们理解
4. 鼓励他们大胆猜测，培养科学思维
请记住：提示要循序渐进，先给少量提示，如果还需要帮助再给更多提示。`,

  // 连线题提示场景
  matching: `你是一位耐心的科学实验助手，正在帮助小朋友完成连线题（变量分类）。
当小朋友在连线题停留时，你可以：
1. 解释自变量、因变量、不变量的概念（用简单易懂的语言）
2. 用生活中的例子帮助他们理解变量之间的关系
3. 引导他们思考：哪个是我主动改变的？哪个是随之变化的？哪个需要保持不变？
4. 鼓励他们，告诉他们犯错是学习的一部分
请记住：用比喻和例子来解释抽象概念，保持耐心和友善。`,

  // 虚拟实验场景
  virtualLab: `你是一位虚拟实验助手，陪伴小朋友进行虚拟实验。
指导他们操作虚拟设备，解释实验现象。
当他们遇到困难时，给予适当的提示和鼓励。`,

  // 数据分析场景
  dataAnalysis: `你是一位数据分析小助手，帮助小朋友理解实验数据。
教他们如何记录、整理和分析数据。
用简单的方式解释数据背后的科学规律。`,

  // 数据记录分析场景 - 定性数据分析
  qualitativeAnalysis: `你是一位科学实验数据分析助手，正在帮助小朋友分析定性观察数据。
请根据学生提供的定性观察记录（如旋转速度、五角星运动状态等），给出有启发性的分析建议。

你的分析应该：
1. 用简单易懂的语言描述观察到的现象
2. 引导学生思考现象背后的原因
3. 对比不同模型的差异
4. 鼓励深入观察和记录
5. 语言要友好、鼓励性强，适合小学生理解

注意：不要直接给答案，而是引导思考。`,

  // 数据记录分析场景 - 定量数据分析
  quantitativeAnalysis: `你是一位科学实验数据分析助手，正在帮助小朋友分析定量测量数据。
请根据学生提供的定量数据（如转速、高度、距离等），给出趋势分析和发现建议。

你的分析应该：
1. 指出数据中的趋势和规律（如转速与高度的关系）
2. 用简单的语言解释数据变化
3. 引导学生思考为什么会这样
4. 提醒学生注意异常数据
5. 语言要友好、鼓励性强，适合小学生理解

注意：用具体的数据例子来说明，让学生更容易理解。`,

  // 实验总结辅助场景
  experimentSummary: `你是一位科学实验总结助手，正在帮助小朋友完成实验总结。
请根据学生的实验数据、发现和感想，给出总结建议。

你的总结应该：
1. 概括实验的主要发现
2. 引导学生反思实验过程
3. 鼓励表达真实感受
4. 提出改进建议或延伸思考
5. 语言要友好、鼓励性强，适合小学生理解

注意：总结要简洁明了，突出重点，避免过于复杂。`
};

// ==================== 会话管理 ====================

/**
 * 创建新的对话会话
 * @param {string} title 会话标题
 * @param {string} scene 场景类型 (principle/planning/virtualLab/dataAnalysis)
 * @returns {Object} 新建的会话对象
 */
export const createSession = (title = '新对话', scene = 'general') => {
  const sessionId = Date.now().toString();
  const session = {
    id: sessionId,
    title: title,
    scene: scene,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // 保存到存储
  saveSession(session);
  
  // 设置为当前会话
  setCurrentSessionId(sessionId);
  
  return session;
};

/**
 * 获取所有对话会话
 * @returns {Array} 会话列表
 */
export const getAllSessions = () => {
  try {
    const sessions = uni.getStorageSync(STORAGE_KEY_CONVERSATIONS);
    return sessions || [];
  } catch (e) {
    console.error('获取会话列表失败', e);
    return [];
  }
};

/**
 * 获取指定会话
 * @param {string} sessionId 会话 ID
 * @returns {Object|null} 会话对象
 */
export const getSession = (sessionId) => {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === sessionId) || null;
};

/**
 * 获取当前会话
 * @returns {Object|null} 当前会话对象
 */
export const getCurrentSession = () => {
  const sessionId = getCurrentSessionId();
  if (!sessionId) return null;
  return getSession(sessionId);
};

/**
 * 保存会话
 * @param {Object} session 会话对象
 */
export const saveSession = (session) => {
  try {
    const sessions = getAllSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    
    uni.setStorageSync(STORAGE_KEY_CONVERSATIONS, sessions);
  } catch (e) {
    console.error('保存会话失败', e);
  }
};

/**
 * 删除会话
 * @param {string} sessionId 会话 ID
 * @returns {boolean} 是否删除成功
 */
export const deleteSession = (sessionId) => {
  try {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    uni.setStorageSync(STORAGE_KEY_CONVERSATIONS, filtered);
    
    // 如果删除的是当前会话，清除当前会话 ID
    const currentId = getCurrentSessionId();
    if (currentId === sessionId) {
      clearCurrentSessionId();
    }
    
    return true;
  } catch (e) {
    console.error('删除会话失败', e);
    return false;
  }
};

/**
 * 清空所有会话
 */
export const clearAllSessions = () => {
  try {
    uni.removeStorageSync(STORAGE_KEY_CONVERSATIONS);
    clearCurrentSessionId();
  } catch (e) {
    console.error('清空会话失败', e);
  }
};

// ==================== 当前会话管理 ====================

/**
 * 获取当前会话 ID
 * @returns {string|null} 当前会话 ID
 */
export const getCurrentSessionId = () => {
  try {
    return uni.getStorageSync(STORAGE_KEY_CURRENT_SESSION) || null;
  } catch (e) {
    console.error('获取当前会话 ID 失败', e);
    return null;
  }
};

/**
 * 设置当前会话 ID
 * @param {string} sessionId 会话 ID
 */
export const setCurrentSessionId = (sessionId) => {
  try {
    uni.setStorageSync(STORAGE_KEY_CURRENT_SESSION, sessionId);
  } catch (e) {
    console.error('设置当前会话 ID 失败', e);
  }
};

/**
 * 清除当前会话 ID
 */
export const clearCurrentSessionId = () => {
  try {
    uni.removeStorageSync(STORAGE_KEY_CURRENT_SESSION);
  } catch (e) {
    console.error('清除当前会话 ID 失败', e);
  }
};

// ==================== 消息管理 ====================

/**
 * 添加消息到会话
 * @param {string} sessionId 会话 ID
 * @param {string} role 角色 (user/assistant/system)
 * @param {string} content 消息内容
 * @param {Object} meta 附加元数据（可选）
 * @returns {Object} 更新后的会话
 */
export const addMessage = (sessionId, role, content, meta = {}) => {
  const session = getSession(sessionId);
  if (!session) {
    throw new Error('会话不存在');
  }
  
  const message = {
    role: role,
    content: content,
    timestamp: Date.now(),
    ...meta
  };
  
  session.messages.push(message);
  session.updatedAt = Date.now();
  
  // 如果只有系统消息，更新标题
  if (session.messages.length === 1 && role === 'user') {
    session.title = content.substring(0, 20) + (content.length > 20 ? '...' : '');
  }
  
  saveSession(session);
  return session;
};

/**
 * 获取会话历史消息
 * @param {string} sessionId 会话 ID
 * @returns {Array} 消息列表
 */
export const getHistory = (sessionId) => {
  const session = getSession(sessionId);
  return session ? session.messages : [];
};

/**
 * 清空会话历史
 * @param {string} sessionId 会话 ID
 * @returns {boolean} 是否清空成功
 */
export const clearHistory = (sessionId) => {
  const session = getSession(sessionId);
  if (!session) return false;
  
  session.messages = [];
  session.updatedAt = Date.now();
  saveSession(session);
  return true;
};

// ==================== AI 对话接口 ====================

/**
 * 模拟 AI API 响应
 * 根据用户消息生成回复
 * @param {string} userMessage 用户消息
 * @param {Array} history 历史消息
 * @param {string} systemPrompt 系统提示词
 * @returns {Promise<string>} AI 回复
 */
const mockAIResponse = (userMessage, history, systemPrompt, scene = 'general') => {
  return new Promise((resolve) => {
    // 模拟思考延迟
    setTimeout(() => {
      const response = getMockResponseFromKB({
        message: userMessage,
        history,
        scene
      });
      resolve(response || '这是个很好的问题，我们一步一步来分析。');
    }, API_CONFIG.mockDelay);
  });
};

const requestJSON = ({ url, method = 'GET', header = {}, data = {}, timeout = API_CONFIG.timeout }) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      data,
      timeout,
      success: (res) => resolve(res),
      fail: (err) => {
        const errMsg = err && err.errMsg ? err.errMsg : (err && err.message ? err.message : 'request failed');
        if (errMsg.includes('request:fail') && url.includes('127.0.0.1')) {
          reject(new Error(`连接本地代理失败。请运行项目根目录下的 start_ai_proxy.bat 启动服务！`));
        } else {
          reject(new Error(`请求失败: ${method} ${url} -> ${errMsg}`));
        }
      }
    });
  });
};

const safeTrim = (value) => (typeof value === 'string' ? value.trim() : '');

const isLikelyOfflineError = (error) => {
  const message = safeTrim(error && error.message ? error.message : '').toLowerCase();
  if (!message) return false;
  const offlineHints = [
    'request:fail',
    'network',
    'timeout',
    'timed out',
    'failed to fetch',
    'dns',
    'socket',
    'connection',
    'offline',
    '连接',
    '网络',
    '超时',
    '断网'
  ];
  return offlineHints.some((hint) => message.includes(hint));
};

const normalizeHistoryMessages = (history = []) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      role: item.role,
      content: safeTrim(item.content)
    }))
    .filter(item => (item.role === 'user' || item.role === 'assistant' || item.role === 'system') && item.content);
};

const buildChatMessages = (message, history, systemPrompt) => {
  const normalized = normalizeHistoryMessages(history);
  const messages = [];
  if (safeTrim(systemPrompt)) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  normalized.forEach(msg => {
    // 历史中若已有 system，则优先保留显式传入的 systemPrompt
    if (msg.role !== 'system') {
      messages.push(msg);
    }
  });
  const userMessage = safeTrim(message);
  if (userMessage) {
    const last = messages[messages.length - 1];
    const isDuplicatedUser = last && last.role === 'user' && last.content === userMessage;
    if (!isDuplicatedUser) {
      messages.push({ role: 'user', content: userMessage });
    }
  }
  return messages;
};

const extractAliyunMessage = (data) => {
  const message = data && data.output && data.output.choices && data.output.choices[0]
    ? data.output.choices[0].message
    : null;
  if (message && message.content) return message.content;
  if (data && data.output && data.output.text) return data.output.text;
  return '';
};

const stringifyBrief = (value) => {
  try {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  } catch (e) {
    return '[unserializable response]';
  }
};

const isBrowserH5 = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const joinUrl = (base, path) => {
  const b = safeTrim(base).replace(/\/$/, '');
  const p = safeTrim(path);
  if (!b) return p || '';
  if (!p) return b;
  return `${b}${p.startsWith('/') ? '' : '/'}${p}`;
};

const callProxyAPI = async ({ message, history, systemPrompt, scene, messages, pageContext, experimentId, currentStep, stepId }) => {
  const url = joinUrl(PROXY_CONFIG.baseUrl, PROXY_CONFIG.chatPath || '/api/ai/chat');
  if (!url) {
    throw new Error('代理配置不完整：请在 utils/config.js 中设置 PROXY_CONFIG.baseUrl');
  }

  const res = await requestJSON({
    url,
    method: 'POST',
    data: {
      platform: AI_PLATFORM,
      model: AI_PLATFORM === 'aliyun' ? ALIYUN_CONFIG.model : (AI_PLATFORM === 'baidu' ? BAIDU_CONFIG.model : ''),
      message,
      history,
      systemPrompt,
      scene,
      messages,
      pageContext,
      experiment_id: experimentId,
      current_step: currentStep,
      step_id: stepId
    }
  });

  if (res.statusCode !== 200) {
    throw new Error(`代理接口调用失败: HTTP ${res.statusCode}; body=${stringifyBrief(res.data)}`);
  }

  const content = res.data && (res.data.message || res.data.content || (res.data.data && (res.data.data.message || res.data.data.content)));
  if (!safeTrim(content)) {
    throw new Error(`代理接口返回为空: body=${stringifyBrief(res.data)}`);
  }
  return {
    content,
    platform: res.data && res.data.platform,
    model: res.data && res.data.model,
    sources: (res.data && res.data.sources) || [],
    retrieval: res.data && res.data.retrieval,
    raw: res.data
  };
};

const parseSSEBuffer = (buffer, onEvent) => {
  const events = buffer.split('\n\n');
  const rest = events.pop() || '';
  events.forEach((rawEvent) => {
    const lines = rawEvent.split('\n');
    let eventName = 'message';
    const dataLines = [];
    lines.forEach((line) => {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim() || 'message';
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    });
    if (!dataLines.length) return;
    const rawData = dataLines.join('\n');
    let data = rawData;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      // keep raw string
    }
    onEvent(eventName, data);
  });
  return rest;
};

const canUseFetchStream = () => (
  typeof fetch === 'function' &&
  typeof ReadableStream !== 'undefined' &&
  typeof TextDecoder !== 'undefined'
);

const callProxyStreamAPI = async ({
  message,
  history,
  systemPrompt,
  scene,
  messages,
  pageContext,
  experimentId,
  currentStep,
  stepId,
  onToken,
  onMetadata,
  onSources,
  onStatus
}) => {
  const url = joinUrl(PROXY_CONFIG.baseUrl, PROXY_CONFIG.streamPath || '/api/ai/chat/stream');
  if (!url) {
    throw new Error('代理配置不完整：请在 utils/config.js 中设置 PROXY_CONFIG.baseUrl');
  }
  if (!canUseFetchStream()) {
    throw new Error('当前运行环境不支持 fetch stream');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      platform: AI_PLATFORM,
      model: AI_PLATFORM === 'aliyun' ? ALIYUN_CONFIG.model : (AI_PLATFORM === 'baidu' ? BAIDU_CONFIG.model : ''),
      message,
      history,
      systemPrompt,
      scene,
      messages,
      pageContext,
      experiment_id: experimentId,
      current_step: currentStep,
      step_id: stepId
    })
  });

  if (!response.ok || !response.body) {
    throw new Error(`流式代理接口调用失败: HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullContent = '';
  let finalPayload = null;
  let metadata = {};

  const handleEvent = (eventName, data) => {
    if (eventName === 'status') {
      onStatus && onStatus(data);
    } else if (eventName === 'metadata') {
      metadata = { ...metadata, ...(data || {}) };
      onMetadata && onMetadata(metadata);
    } else if (eventName === 'token') {
      const token = data && data.content ? String(data.content) : '';
      if (!token) return;
      fullContent += token;
      onToken && onToken(token, fullContent);
    } else if (eventName === 'sources') {
      onSources && onSources(data && data.sources ? data.sources : []);
    } else if (eventName === 'done') {
      finalPayload = data || {};
    } else if (eventName === 'error') {
      throw new Error(data && data.error ? data.error : '流式接口返回错误');
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = parseSSEBuffer(buffer, handleEvent);
  }
  buffer += decoder.decode();
  if (buffer.trim()) {
    parseSSEBuffer(`${buffer}\n\n`, handleEvent);
  }

  return {
    content: fullContent || (finalPayload && finalPayload.message) || '',
    platform: (finalPayload && finalPayload.platform) || metadata.platform,
    model: (finalPayload && finalPayload.model) || metadata.model,
    sources: (finalPayload && finalPayload.sources) || [],
    retrieval: (finalPayload && finalPayload.retrieval) || metadata.retrieval,
    raw: finalPayload
  };
};

const normalizeAIResult = (result, fallbackPlatform = AI_PLATFORM) => {
  if (typeof result === 'string') {
    return {
      content: result,
      platform: fallbackPlatform,
      model: '',
      sources: [],
      retrieval: null,
      raw: null
    };
  }

  const content = result && (result.content || result.message || (result.raw && result.raw.message));
  return {
    content: safeTrim(content) ? content : '',
    platform: (result && result.platform) || fallbackPlatform,
    model: (result && result.model) || '',
    sources: (result && Array.isArray(result.sources)) ? result.sources : [],
    retrieval: result ? result.retrieval : null,
    raw: result ? result.raw : null
  };
};

const getAliyunCompatibleBaseUrl = () => {
  const base = safeTrim(ALIYUN_CONFIG.baseUrl);
  if (!base) return 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  if (base.includes('/compatible-mode/')) return base.replace(/\/$/, '');
  if (base.endsWith('/api/v1')) {
    return base.replace(/\/api\/v1$/, '/compatible-mode/v1');
  }
  return 'https://dashscope.aliyuncs.com/compatible-mode/v1';
};

const callAliyunCompatibleAPI = async (messages) => {
  const url = `${getAliyunCompatibleBaseUrl()}/chat/completions`;
  const res = await requestJSON({
    url,
    method: 'POST',
    header: {
      Authorization: `Bearer ${ALIYUN_CONFIG.apiKey}`
    },
    data: {
      model: ALIYUN_CONFIG.model || 'qwen-turbo',
      messages,
      temperature: COMMON_CONFIG.temperature,
      max_tokens: COMMON_CONFIG.maxTokens,
      stream: false
    }
  });
  if (res.statusCode !== 200) {
    const nestedErrorMessage = res.data && res.data.error && res.data.error.message ? res.data.error.message : '';
    const errMsg = (res.data && (res.data.message || res.data.code || nestedErrorMessage)) || `HTTP ${res.statusCode}`;
    throw new Error(`通义千问兼容接口调用失败: HTTP ${res.statusCode}; ${errMsg}; body=${stringifyBrief(res.data)}`);
  }
  const content = res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message
    ? res.data.choices[0].message.content
    : '';
  if (!safeTrim(content)) {
    throw new Error('通义千问兼容接口返回内容为空');
  }
  return content;
};

const callAliyunAPI = async (messages) => {
  if (!ALIYUN_CONFIG.apiKey || ALIYUN_CONFIG.apiKey.includes('xxxxxxxx')) {
    throw new Error('通义千问 API Key 未配置，请先在 utils/config.js 中填写 ALIYUN_CONFIG.apiKey');
  }
  // 优先走官方推荐的 OpenAI 兼容接口；失败后再尝试 DashScope 原生接口
  try {
    return await callAliyunCompatibleAPI(messages);
  } catch (compatError) {
    const url = `${ALIYUN_CONFIG.baseUrl}/services/aigc/text-generation/generation`;
    const res = await requestJSON({
      url,
      method: 'POST',
      header: {
        Authorization: `Bearer ${ALIYUN_CONFIG.apiKey}`
      },
      data: {
        model: ALIYUN_CONFIG.model,
        input: { messages },
        parameters: {
          result_format: 'message',
          temperature: COMMON_CONFIG.temperature,
          max_tokens: COMMON_CONFIG.maxTokens
        }
      }
    });
    if (res.statusCode !== 200) {
      const errMsg = (res.data && (res.data.message || res.data.code)) || `HTTP ${res.statusCode}`;
      throw new Error(`通义千问调用失败: HTTP ${res.statusCode}; ${errMsg}; body=${stringifyBrief(res.data)}; 兼容接口错误: ${compatError.message}`);
    }
    const content = extractAliyunMessage(res.data);
    if (!safeTrim(content)) {
      throw new Error(`通义千问返回内容为空; 兼容接口错误: ${compatError.message}`);
    }
    return content;
  }
};

const getBaiduAccessToken = async () => {
  const now = Date.now();
  if (baiduTokenCache.value && baiduTokenCache.expiresAt > now + 60000) {
    return baiduTokenCache.value;
  }
  if (!BAIDU_CONFIG.apiKey || !BAIDU_CONFIG.secretKey || BAIDU_CONFIG.apiKey.includes('your-')) {
    throw new Error('文心一言密钥未配置，请先在 utils/config.js 中填写 BAIDU_CONFIG.apiKey/secretKey');
  }
  const tokenUrl = `${BAIDU_CONFIG.baseUrl}/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(BAIDU_CONFIG.apiKey)}&client_secret=${encodeURIComponent(BAIDU_CONFIG.secretKey)}`;
  const res = await requestJSON({
    url: tokenUrl,
    method: 'POST'
  });
  const token = res.data && res.data.access_token;
  if (!token) {
    const err = (res.data && (res.data.error_description || res.data.error)) || '获取 access_token 失败';
    throw new Error(err);
  }
  const expiresIn = (res.data && res.data.expires_in) ? Number(res.data.expires_in) : 0;
  baiduTokenCache = {
    value: token,
    expiresAt: now + Math.max(0, expiresIn - 120) * 1000
  };
  return token;
};

const callBaiduAPI = async (messages) => {
  const accessToken = await getBaiduAccessToken();
  const model = BAIDU_CONFIG.model || 'ernie-lite-8k';
  const url = `${BAIDU_CONFIG.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}?access_token=${encodeURIComponent(accessToken)}`;
  const res = await requestJSON({
    url,
    method: 'POST',
    data: {
      messages,
      temperature: COMMON_CONFIG.temperature,
      max_output_tokens: COMMON_CONFIG.maxTokens
    }
  });
  if (res.statusCode !== 200) {
    throw new Error(`文心一言调用失败: HTTP ${res.statusCode}; body=${stringifyBrief(res.data)}`);
  }
  if (res.data && res.data.error_code) {
    throw new Error(`文心一言调用失败: ${res.data.error_msg || res.data.error_code}`);
  }
  const content = res.data && res.data.result ? res.data.result : '';
  if (!safeTrim(content)) {
    throw new Error('文心一言返回内容为空');
  }
  return content;
};

/**
 * 发送 AI 对话请求
 * @param {Object} options 配置选项
 * @param {string} options.sessionId 会话 ID（可选，不提供则使用当前会话）
 * @param {string} options.message 用户消息
 * @param {string} options.systemPrompt 系统提示词（可选）
 * @param {string} options.scene 场景类型（可选，用于自动选择 system prompt）
 * @returns {Promise<Object>} 包含 AI 回复的响应对象
 */
export const sendChatRequest = async (options) => {
  const {
    sessionId = getCurrentSessionId(),
    message,
    systemPrompt,
    scene = 'general',
    pageContext = '',
    experimentId = '',
    currentStep = '',
    stepId = '',
    attachments = []
  } = options;
  
  if (!message || !message.trim()) {
    throw new Error('消息内容不能为空');
  }
  
  // 如果没有会话 ID，创建新会话
  let currentSessionId = sessionId;
  if (!currentSessionId) {
    const newSession = createSession(message, scene);
    currentSessionId = newSession.id;
  }
  
  // 获取或设置 system prompt
  let finalSystemPrompt = systemPrompt;
  if (!finalSystemPrompt) {
    // 根据场景选择 system prompt
    finalSystemPrompt = SCENE_PROMPTS[scene] || CHILD_FRIENDLY_PROMPT;
  }
  
  // 添加用户消息到历史
  addMessage(currentSessionId, 'user', message, { attachments });
  
  // 准备 API 请求数据
  const history = getHistory(currentSessionId);
  
  try {
    const useRealAPI = AI_PLATFORM !== 'mock';
    const rawAIResponse = useRealAPI
      ? await callRealAIAPI(message, history, finalSystemPrompt, scene, {
        pageContext,
        experimentId,
        currentStep,
        stepId
      })
      : await mockAIResponse(message, history, finalSystemPrompt, scene);
    const aiResult = normalizeAIResult(rawAIResponse);

    if (useRealAPI) {
      saveLocalKBSample({
        scene,
        question: message,
        answer: aiResult.content,
        source: aiResult.platform
      });
    }

    // 添加 AI 回复到历史
    addMessage(currentSessionId, 'assistant', aiResult.content, {
      platform: aiResult.platform,
      model: aiResult.model,
      sources: aiResult.sources,
      retrieval: aiResult.retrieval
    });

    return {
      success: true,
      sessionId: currentSessionId,
      message: aiResult.content,
      timestamp: Date.now(),
      platform: aiResult.platform,
      model: aiResult.model,
      sources: aiResult.sources,
      retrieval: aiResult.retrieval
    };
  } catch (error) {
    console.error('AI 对话请求失败', error);

    // 可选降级：真实 API 失败时，回退到本地 mock，保证课堂流程不中断
    if (AI_PLATFORM !== 'mock' && COMMON_CONFIG.enableFallback) {
      const fallbackMode = isLikelyOfflineError(error) ? 'offline' : 'degraded';
      const fallbackReason = error && error.message ? error.message : 'real-api-failed';
      try {
        const localKBMessage = searchLocalKBAnswer({ scene, message });
        if (safeTrim(localKBMessage)) {
          addMessage(currentSessionId, 'assistant', localKBMessage);
          return {
            success: true,
            sessionId: currentSessionId,
            message: localKBMessage,
            timestamp: Date.now(),
            platform: 'local-kb-fallback',
            fallbackMode,
            fallbackReason
          };
        }

        const fallbackMessage = await mockAIResponse(message, history, finalSystemPrompt, scene);
        addMessage(currentSessionId, 'assistant', fallbackMessage);
        return {
          success: true,
          sessionId: currentSessionId,
          message: fallbackMessage,
          timestamp: Date.now(),
          platform: 'mock-fallback',
          fallbackMode,
          fallbackReason: error && error.message ? error.message : '真实 API 调用失败'
        };
      } catch (fallbackError) {
        console.error('AI 降级失败', fallbackError);
      }
    }

    return {
      success: false,
      error: error.message || 'AI 响应失败，请稍后重试'
    };
  }
};

/**
 * 调用真实 AI API（示例实现）
 * 实际使用时需要根据具体 API 提供商进行调整
 * @param {string} message 用户消息
 * @param {Array} history 历史消息
 * @param {string} systemPrompt 系统提示词
 * @returns {Promise<string>} AI 回复
 */
export const callRealAIAPI = async (message, history, systemPrompt, scene = 'general', requestContext = {}) => {
  const messages = buildChatMessages(message, history, systemPrompt);
  if (!messages.length) {
    throw new Error('请求消息为空，无法调用真实 API');
  }

  if (PROXY_CONFIG && PROXY_CONFIG.enabled) {
    return callProxyAPI({ message, history, systemPrompt, scene, messages, ...requestContext });
  }

  if (isBrowserH5()) {
    throw new Error('当前为 Edge/H5 浏览器环境，直连第三方模型通常会被 CORS 拦截。请启用 PROXY_CONFIG 使用后端代理。');
  }

  if (AI_PLATFORM === 'aliyun') {
    return callAliyunAPI(messages);
  }
  if (AI_PLATFORM === 'baidu') {
    return callBaiduAPI(messages);
  }
  if (AI_PLATFORM === 'xfyun') {
    throw new Error('当前版本未实现讯飞星火前端直连，请改用后端代理或先切换 aliyun/baidu');
  }
  if (AI_PLATFORM === 'mock') {
    return mockAIResponse(message, history, systemPrompt, scene);
  }

  throw new Error(`不支持的 AI 平台配置: ${AI_PLATFORM}`);
};

/**
 * 流式对话请求（如果 API 支持）
 * @param {Object} options 配置选项
 * @param {Function} options.onMessage 接收到消息时的回调
 * @param {Function} options.onComplete 完成时的回调
 * @param {Function} options.onError 错误时的回调
 */
export const sendStreamingChatRequest = (options) => {
  const {
    sessionId = getCurrentSessionId(),
    message,
    systemPrompt,
    scene = 'general',
    pageContext = '',
    experimentId = '',
    currentStep = '',
    stepId = '',
    attachments = [],
    onMessage,
    onDelta,
    onMetadata,
    onSources,
    onStatus,
    onComplete,
    onError
  } = options;

  const run = async () => {
    if (!message || !message.trim()) {
      throw new Error('消息内容不能为空');
    }

    if (!COMMON_CONFIG.enableStreaming || !PROXY_CONFIG.enabled || !canUseFetchStream()) {
      const fallback = await sendChatRequest({
        sessionId,
        message,
        systemPrompt,
        scene,
        pageContext,
        experimentId,
        currentStep,
        stepId,
        attachments
      });
      if (fallback.success) {
        onMessage && onMessage(fallback.message);
        onComplete && onComplete(fallback);
      } else {
        onError && onError(fallback.error || '发送失败');
      }
      return fallback;
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = createSession(message, scene);
      currentSessionId = newSession.id;
    }

    let finalSystemPrompt = systemPrompt;
    if (!finalSystemPrompt) {
      finalSystemPrompt = SCENE_PROMPTS[scene] || CHILD_FRIENDLY_PROMPT;
    }

    addMessage(currentSessionId, 'user', message, { attachments });
    const history = getHistory(currentSessionId);
    const requestMessages = buildChatMessages(message, history, finalSystemPrompt);

    const streamed = await callProxyStreamAPI({
      message,
      history,
      systemPrompt: finalSystemPrompt,
      scene,
      messages: requestMessages,
      pageContext,
      experimentId,
      currentStep,
      stepId,
      onToken: (delta, fullContent) => {
        onDelta && onDelta(delta, fullContent);
        onMessage && onMessage(fullContent);
      },
      onMetadata,
      onSources,
      onStatus
    });

    const aiResult = normalizeAIResult(streamed);
    addMessage(currentSessionId, 'assistant', aiResult.content, {
      platform: aiResult.platform,
      model: aiResult.model,
      sources: aiResult.sources,
      retrieval: aiResult.retrieval
    });

    const result = {
      success: true,
      sessionId: currentSessionId,
      message: aiResult.content,
      timestamp: Date.now(),
      platform: aiResult.platform,
      model: aiResult.model,
      sources: aiResult.sources,
      retrieval: aiResult.retrieval
    };
    onComplete && onComplete(result);
    return result;
  };

  return run().catch((error) => {
    console.error('流式 AI 对话请求失败', error);
    onError && onError(error.message || '流式响应失败');
    return {
      success: false,
      error: error.message || '流式响应失败'
    };
  });
};

// ==================== 工具函数 ====================

/**
 * 格式化时间戳
 * @param {number} timestamp 时间戳
 * @returns {string} 格式化后的时间字符串
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 小于 1 分钟
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 小于 1 小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }
  
  // 小于 24 小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  
  // 小于 7 天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }
  
  // 超过 7 天，显示具体日期
  return date.toLocaleDateString('zh-CN');
};

/**
 * 导出会话数据
 * @param {string} sessionId 会话 ID
 * @returns {Object} 导出的数据对象
 */
export const exportSession = (sessionId) => {
  const session = getSession(sessionId);
  if (!session) return null;
  
  return {
    id: session.id,
    title: session.title,
    scene: session.scene,
    createdAt: new Date(session.createdAt).toISOString(),
    messages: session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toISOString()
    }))
  };
};

/**
 * 获取智能提示信息
 * @param {string} questionType 题目类型 (fillBlank/matching)
 * @returns {string} 提示信息
 */
export const getHintForQuestion = (questionType) => {
  const hints = {
    fillBlank: [
      '想一想，这个空应该填什么呢？回顾一下我们的实验目的~',
      '别着急，可以先想想我们要研究什么问题？',
      '你的猜测是什么呢？科学探究就是从猜测开始的！'
    ],
    matching: [
      '变量分类有点难，让我来帮你：自变量是你主动改变的，因变量是随之变化的，不变量是要保持不变的~',
      '想一想：哪个因素是你想要测试的？那就是自变量！',
      '观察结果会随着什么变化？那个就是因变量哦~',
      '为了保证实验公平，我们需要保持什么不变？那就是不变量！'
    ]
  };
  
  const questionHints = hints[questionType] || [];
  if (questionHints.length === 0) return '';
  
  // 随机返回一个提示
  return questionHints[Math.floor(Math.random() * questionHints.length)];
};

/**
 * 触发智能提示（自动添加到当前会话）
 * @param {string} questionType 题目类型 (fillBlank/matching)
 * @param {string} sessionId 会话 ID（可选）
 * @returns {Promise<Object>} 提示结果
 */
export const triggerHint = async (questionType, sessionId = null) => {
  try {
    const hintMessage = getHintForQuestion(questionType);
    
    if (!hintMessage) {
      return {
        success: false,
        error: '未知的题目类型'
      };
    }
    
    // 使用对应的 system prompt
    const scene = questionType === 'fillBlank' ? 'fillBlank' : 'matching';
    
    // 添加 AI 提示消息到会话
    const currentSessionId = sessionId || getCurrentSessionId();
    
    if (!currentSessionId) {
      // 创建新会话
      const newSession = createSession('智能提示', scene);
      return {
        success: true,
        sessionId: newSession.id,
        message: hintMessage,
        timestamp: Date.now()
      };
    }
    
    // 直接添加 AI 消息（不通过 API，避免重复调用）
    const session = getSession(currentSessionId);
    if (session) {
      const message = {
        role: 'assistant',
        content: hintMessage,
        timestamp: Date.now()
      };
      session.messages.push(message);
      session.updatedAt = Date.now();
      saveSession(session);
    }
    
    return {
      success: true,
      sessionId: currentSessionId,
      message: hintMessage,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('触发智能提示失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ==================== 默认导出 ====================

export default {
  // 常量
  CHILD_FRIENDLY_PROMPT,
  SCENE_PROMPTS,
  API_CONFIG,
  
  // 会话管理
  createSession,
  getAllSessions,
  getSession,
  getCurrentSession,
  saveSession,
  deleteSession,
  clearAllSessions,
  
  // 当前会话管理
  getCurrentSessionId,
  setCurrentSessionId,
  clearCurrentSessionId,
  
  // 消息管理
  addMessage,
  getHistory,
  clearHistory,
  
  // AI 对话
  sendChatRequest,
  callRealAIAPI,
  sendStreamingChatRequest,
  
  // 智能提示
  getHintForQuestion,
  triggerHint,
  
  // 工具函数
  formatTimestamp,
  exportSession
};
