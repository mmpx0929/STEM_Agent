import { API_BASE_URL, API_TIMEOUT } from './config.js';

const trimString = (value) => (typeof value === 'string' ? value.trim() : '');

export const joinUrl = (base, path) => {
  const normalizedBase = trimString(base || API_BASE_URL).replace(/\/$/, '');
  const normalizedPath = trimString(path);
  if (!normalizedBase) return normalizedPath || '';
  if (!normalizedPath) return normalizedBase;
  return `${normalizedBase}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
};

export const requestJSON = ({
  url = '',
  baseUrl = API_BASE_URL,
  path = '',
  method = 'GET',
  header = {},
  data = {},
  timeout = API_TIMEOUT
}) => {
  const finalUrl = url || joinUrl(baseUrl, path);

  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
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
        if (errMsg.includes('request:fail') && finalUrl.includes('127.0.0.1')) {
          reject(new Error('连接本地后端失败，请先在项目根目录运行 start_backend.bat 启动服务。'));
          return;
        }
        reject(new Error(`请求失败: ${method} ${finalUrl} -> ${errMsg}`));
      }
    });
  });
};

export const canUseFetchStream = () => (
  typeof fetch === 'function' &&
  typeof ReadableStream !== 'undefined' &&
  typeof TextDecoder !== 'undefined'
);
