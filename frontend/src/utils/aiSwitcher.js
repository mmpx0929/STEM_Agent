/**
 * Backend API helper for local debugging.
 *
 * The frontend no longer switches between third-party model providers. Model
 * provider routing is owned by the FastAPI backend.
 */

import {
  AI_PLATFORM,
  API_BASE_URL,
  CHAT_API_PATH,
  CHAT_STREAM_API_PATH,
  COMMON_CONFIG
} from './config.js';
import { sendChatRequest } from './aiService.js';

export const showCurrentConfig = () => {
  console.log('AI platform:', AI_PLATFORM);
  console.log('Backend base URL:', API_BASE_URL);
  console.log('Chat path:', CHAT_API_PATH);
  console.log('Stream path:', CHAT_STREAM_API_PATH);
  console.log('Streaming:', COMMON_CONFIG.enableStreaming ? 'enabled' : 'disabled');
  console.log('Fallback:', COMMON_CONFIG.enableFallback ? 'enabled' : 'disabled');
};

export const testAIConnection = async () => {
  console.log('Testing backend AI connection...');
  const startTime = Date.now();
  const response = await sendChatRequest({
    message: '你好，请用一句话介绍你能帮助我做什么。',
    scene: 'general'
  });
  console.log('Backend response time:', `${Date.now() - startTime}ms`);
  console.log('Backend response:', response);
  return response;
};

export default {
  showCurrentConfig,
  testAIConnection
};
