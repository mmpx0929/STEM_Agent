/**
 * 空闲检测工具
 * 用于检测用户在特定区域是否停留过久，从而触发提示
 */
export class IdleTimer {
  constructor(callback, timeout = 10000) {
    this.callback = callback;
    this.timeout = timeout;
    this.timerId = null;
  }

  /**
   * 开始计时
   */
  start() {
    this.stop(); // 清除旧的计时器
    this.timerId = setTimeout(() => {
      if (this.callback) {
        this.callback();
      }
    }, this.timeout);
  }

  /**
   * 停止计时
   */
  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * 重置计时
   */
  reset() {
    this.stop();
    this.start();
  }
}

export default IdleTimer;
