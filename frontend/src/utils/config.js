/**
 * Frontend API configuration.
 *
 * The frontend only talks to the STEM_Agent backend. Real model provider
 * keys and model routing stay in backend environment variables.
 */

const envApiBaseUrl = (import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? String(import.meta.env.VITE_API_BASE_URL).trim()
  : '';
const defaultApiBaseUrl = import.meta.env && import.meta.env.PROD
  ? ''
  : 'http://127.0.0.1:3000';

export const API_BASE_URL = envApiBaseUrl || defaultApiBaseUrl;
export const CHAT_API_PATH = '/api/v1/chat';
export const CHAT_STREAM_API_PATH = '/api/v1/chat/stream';
export const API_TIMEOUT = 30000;
export const ENABLE_STREAMING = true;
export const ENABLE_FALLBACK = true;

// Compatibility exports used by the existing aiService module.
export const AI_PLATFORM = 'backend';

export const COMMON_CONFIG = {
  timeout: API_TIMEOUT,
  enableStreaming: ENABLE_STREAMING,
  enableFallback: ENABLE_FALLBACK
};

export const PROXY_CONFIG = {
  enabled: true,
  baseUrl: API_BASE_URL,
  chatPath: CHAT_API_PATH,
  streamPath: CHAT_STREAM_API_PATH
};

export default {
  API_BASE_URL,
  CHAT_API_PATH,
  CHAT_STREAM_API_PATH,
  API_TIMEOUT,
  ENABLE_STREAMING,
  ENABLE_FALLBACK,
  AI_PLATFORM,
  COMMON_CONFIG,
  PROXY_CONFIG
};
