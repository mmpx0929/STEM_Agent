// utils/aiChatState.js - AI 聊天窗口全局状态管理
// 用于在页面切换时保持 AI 聊天窗口的状态（位置、对话历史、窗口开关等）

const STORAGE_KEY_UI = 'ai_chat_ui_state_global';
const STORAGE_KEY_MESSAGES = 'ai_chat_messages_global';
const STORAGE_KEY_SESSION = 'ai_chat_session_global';

// 全局共享状态（运行时内存）
const globalState = {
  // UI 状态
  ui: {
    x: 0,
    y: 0,
    isOpen: false,
    initialized: false
  },
  // 消息历史
  messages: [],
  // 会话信息
  session: null
};

/**
 * 从本地存储加载 UI 状态
 */
const loadUiState = () => {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY_UI);
    if (saved && typeof saved === 'object') {
      globalState.ui = {
        ...globalState.ui,
        ...saved,
        initialized: true
      };
    }
  } catch (e) {
    console.error('加载 UI 状态失败:', e);
  }
  return globalState.ui;
};

/**
 * 保存 UI 状态到本地存储
 */
const saveUiState = (uiState) => {
  try {
    globalState.ui = { ...globalState.ui, ...uiState, initialized: true };
    uni.setStorageSync(STORAGE_KEY_UI, globalState.ui);
  } catch (e) {
    console.error('保存 UI 状态失败:', e);
  }
};

/**
 * 从本地存储加载消息历史
 */
const loadMessages = () => {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY_MESSAGES);
    if (saved && Array.isArray(saved)) {
      globalState.messages = saved;
    }
  } catch (e) {
    console.error('加载消息历史失败:', e);
  }
  return globalState.messages;
};

/**
 * 保存消息历史到本地存储
 */
const saveMessages = (messages) => {
  try {
    globalState.messages = messages || [];
    uni.setStorageSync(STORAGE_KEY_MESSAGES, globalState.messages);
  } catch (e) {
    console.error('保存消息历史失败:', e);
  }
};

/**
 * 从本地存储加载会话信息
 */
const loadSession = () => {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY_SESSION);
    if (saved && typeof saved === 'object') {
      globalState.session = saved;
    }
  } catch (e) {
    console.error('加载会话信息失败:', e);
  }
  return globalState.session;
};

/**
 * 保存会话信息到本地存储
 */
const saveSession = (session) => {
  try {
    globalState.session = session;
    uni.setStorageSync(STORAGE_KEY_SESSION, globalState.session);
  } catch (e) {
    console.error('保存会话信息失败:', e);
  }
};

/**
 * 清除所有本地存储状态
 */
const clearAllStorage = () => {
  try {
    uni.removeStorageSync(STORAGE_KEY_UI);
    uni.removeStorageSync(STORAGE_KEY_MESSAGES);
    uni.removeStorageSync(STORAGE_KEY_SESSION);
    globalState.ui = { x: 0, y: 0, isOpen: false, initialized: false };
    globalState.messages = [];
    globalState.session = null;
  } catch (e) {
    console.error('清除存储失败:', e);
  }
};

/**
 * 获取全局 UI 状态
 */
const getUiState = () => {
  if (!globalState.ui.initialized) {
    return loadUiState();
  }
  return globalState.ui;
};

/**
 * 更新全局 UI 状态
 */
const updateUiState = (updates) => {
  saveUiState(updates);
};

/**
 * 获取全局消息历史
 */
const getMessages = () => {
  return globalState.messages;
};

/**
 * 更新全局消息历史
 */
const updateMessages = (messages) => {
  saveMessages(messages);
};

/**
 * 获取全局会话
 */
const getSession = () => {
  return globalState.session;
};

/**
 * 更新全局会话
 */
const updateSession = (session) => {
  saveSession(session);
};

// 初始化时加载所有状态
loadUiState();
loadMessages();
loadSession();

export default {
  getUiState,
  updateUiState,
  getMessages,
  updateMessages,
  getSession,
  updateSession,
  clearAllStorage
};
