<!-- AIChat.vue - AI 对话浮窗组件 -->
<template>
  <view class="ai-chat-container">
    <view
      class="ai-guide-bubble"
      v-if="showGuideBubble"
      :style="guideBubbleStyle"
      @click="playGuide"
    >
      <text class="guide-text">{{ activeGuideText || '点我就能听语音引导哦' }}</text>
      <text class="guide-icon">{{ guideBubbleIcon }}</text>
      <view class="guide-close" @click.stop="closeGuideBubble">×</view>
    </view>
    
    <view
      class="ai-float-btn"
      :class="{ 
        'is-open': isOpen, 
        'is-listening': isListening, 
        dragging: dragging && dragTarget === 'button',
        'no-transition': !enableTransition
      }"
      :style="floatBtnStyle"
      @touchstart.stop="startDrag($event, 'button')"
      @touchmove.stop="onDrag"
      @touchend.stop="endDrag"
      @touchcancel.stop="endDrag"
      @mousedown.stop="startDrag($event, 'button')"
      @mousemove.stop="onDrag"
      @mouseup.stop="endDrag"
      @mouseleave="endDrag"
    >
      <view class="ai-avatar">
        <text class="ai-icon">&#129302;</text>
      </view>
      <view class="ai-badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
    </view>

    <view
      class="ai-chat-window"
      :class="{ 
        show: isOpen, 
        dragging: dragging && dragTarget === 'window',
        'no-transition': !enableTransition
      }"
      :style="chatWindowStyle"
    >
      <view
        class="chat-header"
        @touchstart.stop.prevent="startDrag($event, 'window')"
        @mousedown.stop.prevent="startDrag($event, 'window')"
      >
        <view class="header-left">
          <view class="header-avatar">&#129302;</view>
          <view class="header-info">
            <text class="header-title">{{ appAiName }}</text>
            <text class="header-subtitle">会听语音，也支持文字提问</text>
          </view>
        </view>
        <view class="header-actions" @touchstart.stop @mousedown.stop>
          <view class="action-btn" @click.stop="resetFloatPosition" title="回到原位">
            <text class="action-icon">↺</text>
          </view>
          <view class="action-btn" @click.stop="clearHistory" title="清空历史">
            <text class="action-icon">&#128465;</text>
          </view>
          <view class="action-btn close-btn" @click.stop="closeChat" title="关闭">
            <text class="action-icon">✕</text>
          </view>
        </view>
      </view>

      <view
        v-if="runtimeStatusText"
        class="runtime-status"
        :class="`runtime-status-${runtimeStatusType}`"
      >
        <text class="runtime-status-text">{{ runtimeStatusText }}</text>
      </view>

      <scroll-view
        class="message-list"
        :style="{ height: messageListHeight + 'px' }"
        scroll-y
        :scroll-with-animation="true"
        :scroll-into-view="scrollIntoView"
      >
        <view class="empty-state" v-if="messages.length === 0">
          <view class="empty-icon">&#129302;</view>
          <text class="empty-text">你好呀，我是你的 {{ appAiName }}</text>
          <text class="empty-hint">你可以直接打字提问，也可以先说话再让我帮你整理问题。</text>
        </view>

        <view class="message-wrapper" v-for="(msg, index) in messages" :key="index">
          <view class="message-item" :class="msg.role">
            <view class="message-content" v-if="msg.role === 'assistant'">
              <view class="avatar ai-msg-avatar">&#129302;</view>
              <view class="bubble">
                <text class="bubble-text">{{ msg.content }}</text>
                <view class="source-panel" v-if="msg.sources && msg.sources.length">
                  <text class="source-title">回答来源：{{ msg.platform || 'unknown' }}</text>
                  <view class="source-item" v-for="(source, sourceIndex) in msg.sources.slice(0, 3)" :key="source.chunk_id || sourceIndex">
                    <text class="source-text">{{ formatSource(source) }}</text>
                  </view>
                </view>
                <view class="bubble-footer">
                  <text class="bubble-time">{{ formatTime(msg.timestamp) }}</text>
                  <text class="speak-btn" @click="speakText(msg.content)">&#128266;</text>
                </view>
              </view>
            </view>

            <view class="message-content user" v-else-if="msg.role === 'user'">
              <view class="bubble user-bubble">
                <text class="bubble-text">{{ msg.content }}</text>
                <text class="bubble-time user-time">{{ formatTime(msg.timestamp) }}</text>
              </view>
              <view class="avatar user-msg-avatar">我</view>
            </view>
          </view>
        </view>

        <view class="loading-wrapper" v-if="isLoading">
          <view class="loading-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
          <text class="loading-text">我来想一想怎么回答你...</text>
        </view>

        <view id="chat-bottom-anchor"></view>
      </scroll-view>

      <view class="input-area">
        <view class="tool-row">
          <view class="tool-btn" :class="{ active: isListening }" @click="toggleVoiceInput">
            <text class="tool-emoji">🎤</text>
            <text class="tool-label">语音</text>
          </view>
          <view class="tool-tip" v-if="isListening">我正在认真听你说话...</view>
        </view>

        <view class="input-wrapper">
          <textarea
            v-model="inputMessage"
            placeholder="把你的问题告诉我吧..."
            class="message-input"
            :maxlength="500"
            :auto-height="true"
            :fixed="false"
            @focus="onFocus"
            @blur="onBlur"
          />
          <view
            class="send-btn"
            :class="{ disabled: !inputMessage.trim() || isLoading }"
            @click="sendMessage"
          >
            <text class="send-icon">发送</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import aiService from '@/utils/aiService.js';
import aiChatState from '@/utils/aiChatState.js';
import { resolveGuideScript } from '@/utils/guideScript.js';
import { APP_AI_NAME } from '@/config/app-constants.js';

const DEFAULT_BTN_SIZE = 70;
const DEFAULT_CHAT_WIDTH = 380;
const DEFAULT_CHAT_HEIGHT = 600;
const DEFAULT_EDGE_GAP = 10;
const AI_MEDIA_LOCK_FLAG = '__STEM_AI_MEDIA_LOCK__';

const clampValue = (value, min, max) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const getSafeSystemInfo = () => {
  try {
    const info = uni.getSystemInfoSync();
    return {
      windowWidth: info.windowWidth || 375,
      windowHeight: info.windowHeight || 667
    };
  } catch (e) {
    return {
      windowWidth: 375,
      windowHeight: 667
    };
  }
};

const resolveInitialUiState = () => {
  const { windowWidth, windowHeight } = getSafeSystemInfo();
  const chatWidth = Math.min(DEFAULT_CHAT_WIDTH, Math.max(300, windowWidth - 20));
  const chatHeight = Math.min(DEFAULT_CHAT_HEIGHT, Math.max(420, windowHeight - 80));
  const maxX = Math.max(DEFAULT_EDGE_GAP, windowWidth - DEFAULT_BTN_SIZE - DEFAULT_EDGE_GAP);
  const maxY = Math.max(80, windowHeight - DEFAULT_BTN_SIZE - 20);
  const defaultX = Math.max(DEFAULT_EDGE_GAP, windowWidth - DEFAULT_BTN_SIZE - 20);
  const defaultY = Math.max(100, windowHeight - DEFAULT_BTN_SIZE - 140);

  // 从全局状态读取 UI 状态
  const stored = aiChatState.getUiState();
  const rawX = stored && Number.isFinite(stored.x) ? stored.x : defaultX;
  const rawY = stored && Number.isFinite(stored.y) ? stored.y : defaultY;
  // 对话框默认关闭，不保存 isOpen 状态
  // 切换页面时保持关闭，避免自动弹出干扰
  const rawOpen = false;

  return {
    windowWidth,
    windowHeight,
    chatWidth,
    chatHeight,
    x: clampValue(rawX, DEFAULT_EDGE_GAP, maxX),
    y: clampValue(rawY, 80, maxY),
    isOpen: rawOpen
  };
};

export default {
  name: 'AIChat',
  props: {
    scene: {
      type: String,
      default: 'general'
    },
    pageContext: {
      type: String,
      default: ''
    },
    experimentId: {
      type: String,
      default: ''
    },
    currentStep: {
      type: String,
      default: ''
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    guideKey: {
      type: String,
      default: ''
    },
    guideText: {
      type: String,
      default: ''
    },
    guideAudio: {
      type: String,
      default: ''
    },
    autoPlay: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const initialUi = resolveInitialUiState();
    // 检查是否存在已保存的 UI 状态
    const stored = aiChatState.getUiState();
    const shouldEnableTransition = stored && stored.initialized;
    
    return {
      isOpen: initialUi.isOpen,
      enableTransition: shouldEnableTransition, // 有保存状态时立即启用动画
      isLoading: false,
      inputMessage: '',
      messages: [],
      sessionId: null,
      unreadCount: 0,
      isFocus: false,
      scrollIntoView: '',

      // 引导气泡状态
      showGuideBubble: false,
      isGuidePlaying: false,
      isGuidePaused: false,
      guidePlaybackMode: '',
      innerAudioContext: null,
      activeGuideText: '',
      activeGuideAudio: '',
      activeGuideRepeatPolicy: 'always',

      // 悬浮窗拖拽状态
      windowWidth: initialUi.windowWidth,
      windowHeight: initialUi.windowHeight,
      chatWidth: initialUi.chatWidth,
      chatHeight: initialUi.chatHeight,
      btnSize: DEFAULT_BTN_SIZE,
      floatX: initialUi.x,
      floatY: initialUi.y,
      initialUi: initialUi, // 保存初始位置，用于一键复位
      dragging: false,
      dragMoved: false,
      suppressClick: false,
      dragTarget: '',
      startPointerX: 0,
      startPointerY: 0,
      startFloatX: 0,
      startFloatY: 0,
      mouseListenersBound: false,
      touchListenersBound: false,

      // 语音能力状态
      speechSupported: false,
      speechRecognition: null,
      isListening: false,
      preferredSpeechVoice: null,
      voicesLoaded: false,
      onVoicesChangedHandler: null,
      voicePollingTimer: null,
      autoGuideStartTimer: null,
      autoGuideHideTimer: null,
      speechStartProbeTimer: null,
      speechTaskId: 0,
      guidePlayTaskId: 0,
      hasSpeechUserGesture: false,
      onFirstSpeechGesture: null,

      // 运行时状态提示
      runtimeStatusText: '',
      runtimeStatusType: '',
      runtimeStatusTimer: null,
      mediaGuardRegistered: false,
      lastVideoBlockedAt: 0,
      mediaLockTimer: null
    };
  },
  computed: {
    appAiName() {
      return APP_AI_NAME;
    },
    floatBtnStyle() {
      // 无论开闭都使用 left/top 定位，避免定位方式切换抖动
      return {
        position: 'fixed',
        left: `${this.floatX}px`,
        top: `${this.floatY}px`,
        zIndex: 9999,
        // 初始化阶段先禁用过渡，避免位置闪烁
        transition: this.enableTransition ? '' : 'none'
      };
    },
    chatWindowStyle() {
      const left = this.clamp(
        this.floatX - this.chatWidth + this.btnSize,
        10,
        Math.max(10, this.windowWidth - this.chatWidth - 10)
      );
      const top = this.clamp(
        this.floatY - this.chatHeight + 90,
        10,
        Math.max(10, this.windowHeight - this.chatHeight - 10)
      );
      return {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9998,
        width: `${this.chatWidth}px`,
        height: `${this.chatHeight}px`
      };
    },
    messageListHeight() {
      return Math.max(220, this.chatHeight - 250);
    },
    guideBubbleIcon() {
      if (this.isGuidePlaying && this.isGuidePaused) return '⏵';
      if (this.isGuidePlaying) return '⏸';
      return '▶';
    },
    guideBubbleStyle() {
      const btnX = this.floatX;
      const btnY = this.floatY;
      const onRight = btnX > this.windowWidth / 2;
      
      const style = {
        position: 'fixed',
        zIndex: 9997,
        maxWidth: '220px',
        padding: '12px 16px',
        borderRadius: '16px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        top: `${btnY + 10}px`,
        transition: 'all 0.3s ease',
        opacity: this.showGuideBubble ? 1 : 0,
        transform: this.showGuideBubble ? 'scale(1)' : 'scale(0.9)'
      };

      if (onRight) {
        style.right = `${this.windowWidth - btnX + 15}px`;
        style.transformOrigin = 'right center';
        style.borderTopRightRadius = '4px';
      } else {
        style.left = `${btnX + this.btnSize + 15}px`;
        style.transformOrigin = 'left center';
        style.borderTopLeftRadius = '4px';
      }
      
      return style;
    }
  },
  mounted() {
    this.initViewport();
    this.registerMediaPlaybackGuard();
    this.loadSession();
    this.initSpeech();
    this.initSpeechVoices();
    this.bindSpeechGestureWarmup();
    this.resolveGuideConfig();

    // 首次加载时延迟启用动画，避免初始抖动
    if (!this.enableTransition) {
      setTimeout(() => {
        this.enableTransition = true;
      }, 500);
    }

    if (this.defaultOpen) {
      this.isOpen = true;
      this.$nextTick(() => this.scrollToBottom());
    }

    this.syncUiState();

    if (typeof uni !== 'undefined' && uni.onWindowResize) {
      uni.onWindowResize(this.handleWindowResize);
    }
    if (typeof uni !== 'undefined' && uni.$on) {
      uni.$on('ai-chat:open', this.handleExternalOpen);
    }
    
    // 自动播放语音引导（等待语音列表准备完成）
    this.waitForVoicesAndPlayGuide();
  },
  beforeDestroy() {
    this.stopGuide();
    this.unlockMediaPlayback();
    this.unregisterMediaPlaybackGuard();
    this.cleanupListeners();
    if (typeof uni !== 'undefined' && uni.$off) {
      uni.$off('ai-chat:open', this.handleExternalOpen);
    }
    // 销毁前移除全局事件订阅
    this.saveMessagesToGlobal();
  },
  beforeUnmount() {
    this.stopGuide();
    this.unlockMediaPlayback();
    this.unregisterMediaPlaybackGuard();
    this.cleanupListeners();
    if (typeof uni !== 'undefined' && uni.$off) {
      uni.$off('ai-chat:open', this.handleExternalOpen);
    }
    // 卸载前移除全局事件订阅
    this.saveMessagesToGlobal();
  },
  watch: {
    guideKey() {
      this.resolveGuideConfig();
      this.tryAutoPlayGuide();
    },
    guideText() {
      this.resolveGuideConfig();
    },
    guideAudio() {
      this.resolveGuideConfig();
    },
    messages: {
      handler(newMessages, oldMessages) {
        // 仅在消息内容真正变化时才写入全局状态
        // 使用 JSON.stringify 比较，避免初始化阶段重复写入
        if (JSON.stringify(newMessages) !== JSON.stringify(oldMessages)) {
          this.saveMessagesToGlobal();
        }
      },
      deep: true
    }
  },
  methods: {
    formatSource(source = {}) {
      const step = source.step_id ? ` / ${source.step_id}` : '';
      const title = source.title ? ` / ${source.title}` : '';
      return `${source.experiment_id || 'unknown'} / ${source.doc_type || 'doc'}${step}${title}`;
    },
    handleExternalOpen(payload = {}) {
      if (payload.pageContext && payload.pageContext !== this.pageContext) return;
      this.isOpen = true;
      this.unreadCount = 0;
      this.$nextTick(() => this.scrollToBottom());
    },
    isMediaPlaybackLocked() {
      if (typeof window === 'undefined') return false;
      return window[AI_MEDIA_LOCK_FLAG] === true;
    },
    lockMediaPlayback() {
      if (typeof window === 'undefined') return;
      window[AI_MEDIA_LOCK_FLAG] = true;
      this.pauseAllVideos();
      if (this.mediaLockTimer) {
        clearTimeout(this.mediaLockTimer);
        this.mediaLockTimer = null;
      }
      // 兜底：个别环境语音 onend/onerror 不触发时，避免视频锁死无法播放
      this.mediaLockTimer = setTimeout(() => {
        this.unlockMediaPlayback();
      }, 45000);
    },
    unlockMediaPlayback() {
      if (typeof window === 'undefined') return;
      window[AI_MEDIA_LOCK_FLAG] = false;
      if (this.mediaLockTimer) {
        clearTimeout(this.mediaLockTimer);
        this.mediaLockTimer = null;
      }
    },
    pauseAllVideos() {
      if (typeof document === 'undefined') return;
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        try {
          if (!video.paused) {
            video.pause();
          }
        } catch (e) {
          // ignore runtime pause errors
        }
      });
    },
    handleGlobalVideoPlay(event) {
      if (!this.isMediaPlaybackLocked()) return;
      const target = event && event.target;
      if (!target || target.tagName !== 'VIDEO') return;

      try {
        target.pause();
      } catch (e) {
        // ignore runtime pause errors
      }

      const now = Date.now();
      if (now - this.lastVideoBlockedAt < 1200) return;
      this.lastVideoBlockedAt = now;
      this.showRuntimeStatus('语音播报中，请等播报结束后再点击播放视频。', 'info', 2200);
    },
    registerMediaPlaybackGuard() {
      if (this.mediaGuardRegistered) return;
      if (typeof document === 'undefined') return;
      document.addEventListener('play', this.handleGlobalVideoPlay, true);
      this.mediaGuardRegistered = true;
    },
    unregisterMediaPlaybackGuard() {
      if (!this.mediaGuardRegistered) return;
      if (typeof document === 'undefined') return;
      document.removeEventListener('play', this.handleGlobalVideoPlay, true);
      this.mediaGuardRegistered = false;
    },
    initViewport() {
      try {
        const info = uni.getSystemInfoSync();
        this.windowWidth = info.windowWidth || 375;
        this.windowHeight = info.windowHeight || 667;
        this.chatWidth = Math.min(DEFAULT_CHAT_WIDTH, Math.max(300, this.windowWidth - 20));
        this.chatHeight = Math.min(DEFAULT_CHAT_HEIGHT, Math.max(420, this.windowHeight - 80));
      } catch (e) {
        this.windowWidth = 375;
        this.windowHeight = 667;
      }
      const bounds = this.getDragBounds(this.isOpen ? 'window' : 'button');
      this.floatX = this.clamp(this.floatX, bounds.minX, bounds.maxX);
      this.floatY = this.clamp(this.floatY, bounds.minY, bounds.maxY);
    },
    handleWindowResize(res) {
      const size = res && res.size ? res.size : {};
      this.windowWidth = size.windowWidth || this.windowWidth;
      this.windowHeight = size.windowHeight || this.windowHeight;
      this.chatWidth = Math.min(DEFAULT_CHAT_WIDTH, Math.max(300, this.windowWidth - 20));
      this.chatHeight = Math.min(DEFAULT_CHAT_HEIGHT, Math.max(420, this.windowHeight - 80));
      const bounds = this.getDragBounds(this.isOpen ? 'window' : 'button');
      this.floatX = this.clamp(this.floatX, bounds.minX, bounds.maxX);
      this.floatY = this.clamp(this.floatY, bounds.minY, bounds.maxY);
      this.syncUiState();
    },
    syncUiState() {
      // 不保存 isOpen，确保跨页面切换时默认关闭
      const next = {
        x: this.floatX,
        y: this.floatY
      };
      aiChatState.updateUiState(next);
    },
    resolveGuideConfig() {
      const guideScript = resolveGuideScript(this.guideKey);
      this.activeGuideText = this.guideText || (guideScript && guideScript.guideText) || '';
      this.activeGuideAudio = this.guideAudio || (guideScript && guideScript.guideAudio) || '';
      this.activeGuideRepeatPolicy = (guideScript && guideScript.repeatPolicy) || 'always';
    },
    getGuideRecordKey() {
      if (this.guideKey) return this.guideKey;
      if (this.scene) return `scene:${this.scene}`;
      return '';
    },
    // 初始化语音列表（部分浏览器为异步加载）
    initSpeechVoices() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      const loadVoices = () => {
        try {
          const voices = window.speechSynthesis.getVoices() || [];
          if (voices.length > 0) {
            this.preferredSpeechVoice = this.pickChildFriendlyVoice(voices);
            this.voicesLoaded = true;
            
            // 调试输出：打印当前可用中文语音列表
            console.log('=== 系统可用语音列表 ===');
            const zhVoices = voices.filter(v => {
              const lang = (v && v.lang ? String(v.lang) : '').toLowerCase();
              return lang.includes('zh') || lang.includes('cmn');
            });
            zhVoices.forEach((v, i) => {
              console.log(`${i + 1}. ${v.name} | lang: ${v.lang} | localService: ${v.localService}`);
            });
            console.log('=== 当前优先语音 ===');
            console.log(this.preferredSpeechVoice ? this.preferredSpeechVoice.name : '默认');
          }
        } catch (error) {
          console.error('加载语音列表失败:', error);
        }
      };

      loadVoices();

      // 监听语音列表变化（voiceschanged）
      if (!this.onVoicesChangedHandler && typeof window.speechSynthesis.addEventListener === 'function') {
        this.onVoicesChangedHandler = loadVoices;
        window.speechSynthesis.addEventListener('voiceschanged', this.onVoicesChangedHandler);
      }
    },
    // 等待语音列表后再触发自动播报
    waitForVoicesAndPlayGuide() {
      if (!this.autoPlay) return;
      if (!this.activeGuideText && !this.activeGuideAudio) return;

      // 语音列表已就绪，直接尝试播放
      if (this.voicesLoaded || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.getVoices && window.speechSynthesis.getVoices().length > 0)) {
        this.tryAutoPlayGuide();
        return;
      }

      // 否则轮询等待，最多等待 3 秒
      if (this.voicePollingTimer) {
        clearInterval(this.voicePollingTimer);
        this.voicePollingTimer = null;
      }
      let attempts = 0;
      const maxAttempts = 30;
      this.voicePollingTimer = setInterval(() => {
        attempts++;
        
        if (this.voicesLoaded || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.getVoices && window.speechSynthesis.getVoices().length > 0)) {
          clearInterval(this.voicePollingTimer);
          this.voicePollingTimer = null;
          this.tryAutoPlayGuide();
        } else if (attempts >= maxAttempts) {
          clearInterval(this.voicePollingTimer);
          this.voicePollingTimer = null;
          // 超时后也尝试播放，由 speakText 内部走中文语音降级
          this.tryAutoPlayGuide();
        }
      }, 100);
    },
    tryAutoPlayGuide() {
      if (!this.autoPlay) return;
      if (!this.activeGuideText && !this.activeGuideAudio) return;
      if (this.requiresGestureToAutoPlaySpeech() && !this.hasSpeechUserGesture) {
        this.showGuideBubble = true;
        this.showRuntimeStatus('语音将自动播放，若系统拦截请点一下页面后继续。', 'info', 3000);
      }

      if (this.autoGuideStartTimer) {
        clearTimeout(this.autoGuideStartTimer);
        this.autoGuideStartTimer = null;
      }
      if (this.autoGuideHideTimer) {
        clearTimeout(this.autoGuideHideTimer);
        this.autoGuideHideTimer = null;
      }

      this.autoGuideStartTimer = setTimeout(() => {
        this.autoGuideStartTimer = null;
        this.showGuideBubble = true;
        this.stopGuide();
        this.playGuide();

        // 15 秒后自动关闭气泡（若仍在播放则保持显示）
        this.autoGuideHideTimer = setTimeout(() => {
          this.autoGuideHideTimer = null;
          if (!this.isGuidePlaying) {
            this.showGuideBubble = false;
          }
        }, 15000);
      }, 1000);
    },
    clearRuntimeStatus() {
      if (this.runtimeStatusTimer) {
        clearTimeout(this.runtimeStatusTimer);
        this.runtimeStatusTimer = null;
      }
      this.runtimeStatusText = '';
      this.runtimeStatusType = '';
    },
    showRuntimeStatus(text, type = 'info', duration = 3500) {
      this.runtimeStatusText = text;
      this.runtimeStatusType = type;
      if (this.runtimeStatusTimer) {
        clearTimeout(this.runtimeStatusTimer);
        this.runtimeStatusTimer = null;
      }
      if (duration > 0) {
        this.runtimeStatusTimer = setTimeout(() => {
          this.runtimeStatusText = '';
          this.runtimeStatusType = '';
          this.runtimeStatusTimer = null;
        }, duration);
      }
    },
    saveMessagesToGlobal() {
      // 保存消息历史和会话信息到全局状态
      // 不保存 scene，避免不同页面场景互相污染
      aiChatState.updateMessages(this.messages);
      if (this.sessionId) {
        aiChatState.updateSession({
          id: this.sessionId
          // 不保存 scene 和 pageContext，避免跨页面冲突
        });
      }
    },
    saveFloatPosition() {
      this.syncUiState();
    },
    resetFloatPosition(showToast = true) {
      this.floatX = Math.max(DEFAULT_EDGE_GAP, this.windowWidth - this.btnSize - 20);
      this.floatY = Math.max(100, this.windowHeight - this.btnSize - 140);
      this.syncUiState();
      if (showToast) {
        uni.showToast({
          title: '已重置悬浮窗位置',
          icon: 'none',
          duration: 1400
        });
      }
    },
    clamp(value, min, max) {
      return clampValue(value, min, max);
    },
    getPoint(event) {
      if (event && event.touches && event.touches.length > 0) {
        return {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      }
      if (event && event.changedTouches && event.changedTouches.length > 0) {
        return {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY
        };
      }
      return {
        x: event && typeof event.clientX === 'number' ? event.clientX : 0,
        y: event && typeof event.clientY === 'number' ? event.clientY : 0
      };
    },
    bindMouseListeners() {
      if (this.mouseListenersBound || typeof window === 'undefined') return;
      window.addEventListener('mousemove', this.onDrag, { passive: false });
      window.addEventListener('mouseup', this.endDrag, { passive: false });
      this.mouseListenersBound = true;
    },
    bindTouchListeners() {
      if (this.touchListenersBound || typeof window === 'undefined') return;
      window.addEventListener('touchmove', this.onDrag, { passive: false });
      window.addEventListener('touchend', this.endDrag, { passive: false });
      window.addEventListener('touchcancel', this.endDrag, { passive: false });
      this.touchListenersBound = true;
    },
    unbindMouseListeners() {
      if (!this.mouseListenersBound || typeof window === 'undefined') return;
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.endDrag);
      this.mouseListenersBound = false;
    },
    unbindTouchListeners() {
      if (!this.touchListenersBound || typeof window === 'undefined') return;
      window.removeEventListener('touchmove', this.onDrag);
      window.removeEventListener('touchend', this.endDrag);
      window.removeEventListener('touchcancel', this.endDrag);
      this.touchListenersBound = false;
    },
    getDragBounds(mode) {
      if (mode === 'window') {
        const minX = this.chatWidth - this.btnSize + 10;
        const maxX = this.windowWidth - this.btnSize - 10;
        const minY = this.chatHeight - 80;
        const maxY = this.windowHeight - 100;
        return {
          minX: Math.min(minX, maxX),
          maxX: Math.max(minX, maxX),
          minY: Math.min(minY, maxY),
          maxY: Math.max(minY, maxY)
        };
      }
      return {
        minX: DEFAULT_EDGE_GAP,
        maxX: Math.max(DEFAULT_EDGE_GAP, this.windowWidth - this.btnSize - DEFAULT_EDGE_GAP),
        minY: 80,
        maxY: Math.max(80, this.windowHeight - this.btnSize - 20)
      };
    },
    startDrag(event, target = 'button') {
      // 允许关闭状态下也能拖动悬浮按钮
      const point = this.getPoint(event);
      this.dragTarget = target;
      this.dragging = true;
      this.dragMoved = false;
      this.suppressClick = false; // 重置点击抑制标记
      this.startPointerX = point.x;
      this.startPointerY = point.y;
      this.startFloatX = this.floatX;
      this.startFloatY = this.floatY;
      if (event && event.type && event.type.indexOf('mouse') === 0) {
        this.bindMouseListeners();
      } else {
        this.bindTouchListeners();
      }
    },
    onDrag(event) {
      if (!this.dragging) return;
      
      const point = this.getPoint(event);
      const deltaX = point.x - this.startPointerX;
      const deltaY = point.y - this.startPointerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // 使用 2px 作为拖拽判定阈值，提升拖动响应速度
      // 避免阈值过大导致拖动起步迟滞
      if (distance > 2) {
        this.dragMoved = true;
        if (event && event.preventDefault) {
          event.preventDefault();
        }
      }
      
      if (!this.dragMoved) return;

      const bounds = this.getDragBounds(this.dragTarget);
      this.floatX = this.clamp(
        this.startFloatX + deltaX,
        bounds.minX,
        bounds.maxX
      );
      this.floatY = this.clamp(
        this.startFloatY + deltaY,
        bounds.minY,
        bounds.maxY
      );
    },
    endDrag(event) {
      if (!this.dragging) return;
      
      const moved = this.dragMoved;
      const dragTarget = this.dragTarget;
      
      // 先重置拖拽状态，再执行后续点击逻辑
      this.dragging = false;
      this.dragTarget = '';
      this.dragMoved = false;
      this.suppressClick = false;
      
      this.unbindMouseListeners();
      this.unbindTouchListeners();
      
      if (moved) {
        this.saveFloatPosition();
        return;
      }

      // 未发生拖拽时，将其视为按钮点击
      if (dragTarget === 'button') {
        console.log('endDrag: triggering toggleChat');
        this.toggleChat();
      }
    },
    // 兜底点击处理（用于补充 endDrag 触发失败场景）
    handleFloatClick() {
      if (this.suppressClick) return;
      this.toggleChat();
    },
    cleanupListeners() {
      this.unbindMouseListeners();
      this.unbindTouchListeners();
      this.unbindSpeechGestureWarmup();
      this.clearRuntimeStatus();
      this.clearGuideTimers();
      this.invalidateGuideTasks();
      if (typeof uni !== 'undefined' && uni.offWindowResize) {
        uni.offWindowResize(this.handleWindowResize);
      }
      if (
        this.onVoicesChangedHandler &&
        typeof window !== 'undefined' &&
        window.speechSynthesis &&
        typeof window.speechSynthesis.removeEventListener === 'function'
      ) {
        window.speechSynthesis.removeEventListener('voiceschanged', this.onVoicesChangedHandler);
      }
      this.onVoicesChangedHandler = null;
      if (this.speechRecognition && this.isListening) {
        try {
          this.speechRecognition.stop();
        } catch (e) {
          // 忽略停止识别时的异常
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },
    clearGuideTimers() {
      if (this.voicePollingTimer) {
        clearInterval(this.voicePollingTimer);
        this.voicePollingTimer = null;
      }
      if (this.autoGuideStartTimer) {
        clearTimeout(this.autoGuideStartTimer);
        this.autoGuideStartTimer = null;
      }
      if (this.autoGuideHideTimer) {
        clearTimeout(this.autoGuideHideTimer);
        this.autoGuideHideTimer = null;
      }
      if (this.speechStartProbeTimer) {
        clearTimeout(this.speechStartProbeTimer);
        this.speechStartProbeTimer = null;
      }
    },
    invalidateGuideTasks() {
      this.speechTaskId += 1;
      this.guidePlayTaskId += 1;
      if (this.speechStartProbeTimer) {
        clearTimeout(this.speechStartProbeTimer);
        this.speechStartProbeTimer = null;
      }
    },
    bindSpeechGestureWarmup() {
      if (typeof window === 'undefined') return;
      if (this.onFirstSpeechGesture) return;
      this.onFirstSpeechGesture = () => {
        this.hasSpeechUserGesture = true;
        this.unbindSpeechGestureWarmup();
        if (!window.speechSynthesis) return;
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          if (window.speechSynthesis.getVoices) {
            window.speechSynthesis.getVoices();
          }
        } catch (e) {
          // ignore runtime speech warm-up errors
        }
      };
      window.addEventListener('touchstart', this.onFirstSpeechGesture, { passive: true });
      window.addEventListener('click', this.onFirstSpeechGesture, { passive: true });
    },
    unbindSpeechGestureWarmup() {
      if (typeof window === 'undefined' || !this.onFirstSpeechGesture) return;
      window.removeEventListener('touchstart', this.onFirstSpeechGesture);
      window.removeEventListener('click', this.onFirstSpeechGesture);
      this.onFirstSpeechGesture = null;
    },
    requiresGestureToAutoPlaySpeech() {
      if (typeof window === 'undefined') return false;
      const hasTouchPoints = typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints || 0) > 0;
      return ('ontouchstart' in window) || hasTouchPoints;
    },
    loadSession() {
      // 发生拖拽时不执行开关，避免误触
      const globalMessages = aiChatState.getMessages();
      const globalSession = aiChatState.getSession();
      
      // 优先恢复全局会话（跨 scene 复用）
      if (globalMessages && globalMessages.length > 0 && globalSession) {
        this.messages = globalMessages;
        this.sessionId = globalSession.id;
        aiService.setCurrentSessionId(globalSession.id);
        this.unreadCount = 0;
        this.$nextTick(() => this.scrollToBottom());
        return;
      }
      
      // 全局状态为空时，再从 aiService 历史会话恢复
      try {
        const allSessions = aiService.getAllSessions() || [];
        if (allSessions.length > 0) {
          // 按最近更新时间倒序，优先恢复最新会话
          allSessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          const targetSession = allSessions[0];
          
          if (targetSession) {
            aiService.setCurrentSessionId(targetSession.id);
            this.sessionId = targetSession.id;
            this.messages = targetSession.messages || [];
            this.unreadCount = 0;
            // 回填到全局状态，供其他页面继续使用
            this.saveMessagesToGlobal();
            this.$nextTick(() => this.scrollToBottom());
            return;
          }
        }

        // 没有历史会话时创建新会话
        const newSession = aiService.createSession('新对话', this.scene);
        this.sessionId = newSession.id;
        this.messages = [];
        // 初始化后同步到全局状态
        this.saveMessagesToGlobal();
      } catch (error) {
        console.error('加载会话失败:', error);
        uni.showToast({
          title: '加载会话失败',
          icon: 'none'
        });
      }
    },
    toggleChat() {
      // 拖拽刚结束时忽略点击，避免误开关
      if (this.dragMoved) {
        console.log('toggleChat blocked: dragMoved = true');
        return;
      }
      
      console.log('toggleChat called, isOpen =', this.isOpen);
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    },
    openChat() {
      console.log('openChat called');
      this.isOpen = true;
      this.unreadCount = 0;
      this.syncUiState();
      this.$nextTick(() => this.scrollToBottom());
    },
    closeChat() {
      console.log('closeChat called');
      this.isOpen = false;
      this.syncUiState();
      // 关闭时不重置位置，位置样式由 floatBtnStyle 持续控制
    },
    async sendMessage() {
      if (this.isLoading) return;

      const payload = (this.inputMessage || '').trim();
      if (!payload) return;

      const userMessage = {
        role: 'user',
        content: payload,
        timestamp: Date.now()
      };

      this.messages.push(userMessage);
      this.inputMessage = '';
      this.isLoading = true;
      this.$nextTick(() => this.scrollToBottom());

      try {
        const assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          platform: 'streaming',
          model: '',
          sources: []
        };
        this.messages.push(assistantMessage);
        const assistantIndex = this.messages.length - 1;

        const response = await aiService.sendStreamingChatRequest({
          sessionId: this.sessionId,
          message: payload,
          scene: this.scene,
          pageContext: this.pageContext,
          experimentId: this.experimentId,
          currentStep: this.currentStep,
          onStatus: (status) => {
            if (status && status.message) {
              this.showRuntimeStatus(status.message, 'info', 1800);
            }
          },
          onMetadata: (metadata) => {
            this.messages[assistantIndex].platform = metadata.platform || this.messages[assistantIndex].platform;
            this.messages[assistantIndex].model = metadata.model || this.messages[assistantIndex].model;
            this.messages[assistantIndex].retrieval = metadata.retrieval || this.messages[assistantIndex].retrieval;
          },
          onMessage: (content) => {
            this.messages[assistantIndex].content = content;
            this.$nextTick(() => this.scrollToBottom());
          },
          onSources: (sources) => {
            this.messages[assistantIndex].sources = sources || [];
          }
        });

        if (response.success) {
          if (response.platform === 'mock-fallback' || response.platform === 'local-kb-fallback') {
            const reason = response.fallbackReason || '未知错误';
            console.error('AI fallback activated:', response.platform, reason);
            if (response.fallbackMode === 'offline') {
              this.showRuntimeStatus('网络有点慢，我先用离线模式继续陪你学习。', 'offline', 5000);
            } else {
              this.showRuntimeStatus('现在先用本地小助手陪你，我们继续往下学。', 'fallback', 5000);
            }
          } else if (this.runtimeStatusType === 'offline' || this.runtimeStatusType === 'fallback' || this.runtimeStatusType === 'error') {
            this.showRuntimeStatus('太好了，云端小助手已经回来了。', 'recovered', 2600);
          }

          if (!this.sessionId) {
            this.sessionId = response.sessionId;
          }

          this.messages[assistantIndex] = {
            ...this.messages[assistantIndex],
            content: response.message,
            timestamp: response.timestamp || Date.now(),
            platform: response.platform,
            model: response.model,
            sources: response.sources || [],
            retrieval: response.retrieval
          };

          // 响应后同步保存到全局状态
          this.saveMessagesToGlobal();

          if (!this.isOpen) {
            this.unreadCount += 1;
          }

          this.$nextTick(() => this.scrollToBottom());
        } else {
          const errText = response.error || '发送失败';
          console.error('AI 调用失败:', errText);
          this.messages[assistantIndex].content = '抱歉，我遇到了一些问题，请稍后再试。';
          this.messages[assistantIndex].timestamp = Date.now();
          this.showRuntimeStatus('我这会儿有点忙，过一小会儿再来找我吧。', 'error', 4500);
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        this.messages.push({
          role: 'assistant',
          content: '网络开小差了，请稍后再试。',
          timestamp: Date.now()
        });
        this.showRuntimeStatus('消息还没发出去，检查一下网络后再试试吧。', 'offline', 4500);
      } finally {
        this.isLoading = false;
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    clearHistory() {
      if (this.messages.length === 0) {
        uni.showToast({
          title: '现在还没有聊天记录哦',
          icon: 'none'
        });
        return;
      }

      uni.showModal({
        title: '清空历史',
        content: '确定要清空所有聊天记录吗？清空后就找不回来了。',
        success: (res) => {
          if (res.confirm) {
            try {
              if (this.sessionId) {
                aiService.clearHistory(this.sessionId);
                this.messages = [];
                // 清空后同步更新全局状态
                this.saveMessagesToGlobal();
                uni.showToast({
                  title: '已清空历史记录',
                  icon: 'success'
                });
              }
            } catch (error) {
              console.error('清空历史失败:', error);
              uni.showToast({
                title: '清空失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    formatTime(timestamp) {
      return aiService.formatTimestamp(timestamp);
    },
    scrollToBottom() {
      this.scrollIntoView = '';
      this.$nextTick(() => {
        this.scrollIntoView = 'chat-bottom-anchor';
      });
    },
    onFocus() {
      this.isFocus = true;
    },
    onBlur() {
      this.isFocus = false;
    },
    initSpeech() {
      if (typeof window === 'undefined') return;
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        this.speechSupported = false;
        return;
      }

      const recognition = new Recognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const resultIndex = event.resultIndex || 0;
        const transcript = event.results && event.results[resultIndex] && event.results[resultIndex][0]
          ? event.results[resultIndex][0].transcript
          : '';
        if (transcript) {
          this.inputMessage = this.inputMessage
            ? `${this.inputMessage} ${transcript}`
            : transcript;
        }
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        const message = event && event.error ? `语音识别失败: ${event.error}` : '语音识别失败';
        uni.showToast({
          title: message,
          icon: 'none'
        });
      };

      recognition.onend = () => {
        this.isListening = false;
      };

      this.speechRecognition = recognition;
      this.speechSupported = true;
    },
    toggleVoiceInput() {
      if (!this.speechSupported || !this.speechRecognition) {
        uni.showToast({
          title: '这个环境暂时不能语音输入哦',
          icon: 'none'
        });
        return;
      }

      if (this.isListening) {
        this.speechRecognition.stop();
        this.isListening = false;
        return;
      }

      try {
        this.speechRecognition.start();
        this.isListening = true;
      } catch (e) {
        this.isListening = false;
        uni.showToast({
          title: '语音输入没有打开成功，再试一次吧',
          icon: 'none'
        });
      }
    },
    playGuide() {
      if (this.isGuidePlaying) {
        if (this.isGuidePaused) {
          this.resumeGuide();
        } else {
          this.pauseGuide();
        }
        return;
      }

      const playTaskId = ++this.guidePlayTaskId;
      this.isGuidePlaying = true;
      this.isGuidePaused = false;
      this.showGuideBubble = true;
      this.lockMediaPlayback();

      if (this.activeGuideAudio) {
        this.guidePlaybackMode = 'audio';
        if (this.innerAudioContext) {
          this.innerAudioContext.stop();
          this.innerAudioContext.destroy();
          this.innerAudioContext = null;
        }
        this.innerAudioContext = uni.createInnerAudioContext();
        // 移动端静音开关下，尽量保证引导语音可听见（受机型与系统策略影响）
        this.innerAudioContext.obeyMuteSwitch = false;
        this.innerAudioContext.onEnded(() => {
          if (playTaskId !== this.guidePlayTaskId) return;
          this.isGuidePlaying = false;
          this.isGuidePaused = false;
          this.guidePlaybackMode = '';
          this.unlockMediaPlayback();
        });
        this.innerAudioContext.onError((res) => {
          if (playTaskId !== this.guidePlayTaskId) return;
          console.error('播放语音引导失败', res);
          this.isGuidePlaying = false;
          this.isGuidePaused = false;
          this.guidePlaybackMode = '';
          this.unlockMediaPlayback();
          if (this.activeGuideText) {
            this.guidePlaybackMode = 'tts';
            this.speakText(this.activeGuideText, () => {
              if (playTaskId !== this.guidePlayTaskId) return;
              this.isGuidePlaying = false;
              this.isGuidePaused = false;
              this.guidePlaybackMode = '';
            });
          }
        });
        this.innerAudioContext.src = this.activeGuideAudio;
        this.innerAudioContext.play();
      } else if (this.activeGuideText) {
        this.guidePlaybackMode = 'tts';
        this.speakText(this.activeGuideText, () => {
          this.isGuidePlaying = false;
          this.isGuidePaused = false;
          this.guidePlaybackMode = '';
          this.unlockMediaPlayback();
        });
      } else {
        this.isGuidePlaying = false;
        this.isGuidePaused = false;
        this.guidePlaybackMode = '';
        this.unlockMediaPlayback();
        uni.showToast({
          title: '这一段还没有语音引导哦',
          icon: 'none'
        });
      }
    },
    pauseGuide() {
      if (!this.isGuidePlaying || this.isGuidePaused) return;
      try {
        if (this.guidePlaybackMode === 'audio' && this.innerAudioContext) {
          this.innerAudioContext.pause();
        } else if (
          this.guidePlaybackMode === 'tts' &&
          typeof window !== 'undefined' &&
          window.speechSynthesis &&
          window.speechSynthesis.speaking
        ) {
          window.speechSynthesis.pause();
        }
      } catch (e) {
        console.warn('暂停语音失败:', e);
      }
      this.isGuidePaused = true;
      this.unlockMediaPlayback();
    },
    resumeGuide() {
      if (!this.isGuidePlaying || !this.isGuidePaused) return;
      this.lockMediaPlayback();
      try {
        if (this.guidePlaybackMode === 'audio' && this.innerAudioContext) {
          this.innerAudioContext.play();
        } else if (this.guidePlaybackMode === 'tts' && typeof window !== 'undefined' && window.speechSynthesis) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          } else {
            // 某些环境 pause 状态不可恢复，退化为重新播放当前引导
            this.stopGuide();
            this.playGuide();
            return;
          }
        }
      } catch (e) {
        console.warn('恢复语音失败:', e);
        this.stopGuide();
        this.playGuide();
        return;
      }
      this.isGuidePaused = false;
    },
    stopGuide() {
      this.invalidateGuideTasks();
      this.isGuidePlaying = false;
      this.isGuidePaused = false;
      this.guidePlaybackMode = '';
      this.unlockMediaPlayback();
      if (this.innerAudioContext) {
        this.innerAudioContext.stop();
        this.innerAudioContext.destroy();
        this.innerAudioContext = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },
    closeGuideBubble() {
      this.stopGuide();
      this.showGuideBubble = false;
    },
    // 语音播报
    // 先尝试优选语音，失败后自动降级重试
    // 语音播报：先尝试优选语音，失败后自动降级重试
    speakText(text, onEnd) {
      const content = this.normalizeSpeechText(text);
      if (!content) {
        if (onEnd) onEnd();
        return;
      }
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        uni.showToast({
          title: '这个环境暂时不能语音播报哦',
          icon: 'none'
        });
        if (onEnd) onEnd();
        return;
      }

      this.lockMediaPlayback();
      try {
        const speechTaskId = ++this.speechTaskId;
        const profile = this.getChildFriendlySpeechProfile();
        let finished = false;
        const isTaskActive = () => speechTaskId === this.speechTaskId;

        const finishOnce = () => {
          if (!isTaskActive()) return;
          if (finished) return;
          finished = true;
          if (this.speechStartProbeTimer) {
            clearTimeout(this.speechStartProbeTimer);
            this.speechStartProbeTimer = null;
          }
          this.unlockMediaPlayback();
          if (onEnd) onEnd();
        };

        const buildUtterance = (voiceMode = 'preferred') => {
          const utterance = new SpeechSynthesisUtterance(content);
          const voiceList = window.speechSynthesis.getVoices ? (window.speechSynthesis.getVoices() || []) : [];
          const zhFallbackVoice = voiceList.find((voice) => {
            const lang = String((voice && voice.lang) || '').toLowerCase();
            return lang.includes('zh') || lang.includes('cmn');
          }) || null;
          const selectedVoice = voiceMode === 'preferred'
            ? (this.pickChildFriendlyVoice(voiceList) || this.preferredSpeechVoice || zhFallbackVoice)
            : zhFallbackVoice;

          utterance.lang = selectedVoice && selectedVoice.lang ? selectedVoice.lang : 'zh-CN';
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          utterance.rate = profile.rate;
          utterance.pitch = profile.pitch;
          utterance.volume = profile.volume;
          return utterance;
        };

        const runSpeak = (voiceMode = 'preferred', isRetry = false) => {
          if (!isTaskActive()) return;
          if (finished) return;
          if (this.speechStartProbeTimer) {
            clearTimeout(this.speechStartProbeTimer);
            this.speechStartProbeTimer = null;
          }
          let started = false;
          const utterance = buildUtterance(voiceMode);

          utterance.onstart = () => {
            if (!isTaskActive()) return;
            started = true;
            this.clearRuntimeStatus();
          };
          utterance.onend = () => {
            if (!isTaskActive()) return;
            finishOnce();
          };
          utterance.onerror = (event) => {
            if (!isTaskActive()) return;
            console.error('语音播报错误:', event);
            if (!isRetry) {
              runSpeak('zh-fallback', true);
              return;
            }
            this.showRuntimeStatus('语音没播放出来，点一下小气泡再试试吧。', 'error', 3200);
            finishOnce();
          };

          if (!isTaskActive()) return;
          window.speechSynthesis.cancel();
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);

          this.speechStartProbeTimer = setTimeout(() => {
            this.speechStartProbeTimer = null;
            if (!isTaskActive()) return;
            if (finished || started || window.speechSynthesis.speaking) return;
            if (!isRetry) {
              runSpeak('zh-fallback', true);
              return;
            }
            this.showRuntimeStatus('自动播放可能被系统拦住了，点一下小气泡就能继续听。', 'info', 3600);
            finishOnce();
          }, isRetry ? 700 : 450);
        };

        runSpeak('preferred', false);
      } catch (e) {
        this.unlockMediaPlayback();
        uni.showToast({
          title: '语音播报没有成功',
          icon: 'none'
        });
        if (onEnd) onEnd();
      }
    },

    // 儿童友好语音参数
    // 语速稍慢、音调略高、音量适中
    getChildFriendlySpeechProfile() {
      return {
        rate: 0.95,   // 语速：略慢，便于听清
        pitch: 1.08,  // 音高：略高，更亲和
        volume: 0.95  // 音量：清晰但不过载
      };
    },
    
    // 自动选择更适合儿童引导场景的中文语音
    // 优先级：关键词命中 > 中文语音 > 系统默认
    pickChildFriendlyVoice(voices = []) {
      if (!Array.isArray(voices) || voices.length === 0) return null;
      
      // 如需强制指定语音，可在此填写完整 voice.name；默认留空自动选择
      const forceUseVoiceName = 'Microsoft 晓晓 Online (Natural) - Chinese (Mandarin, Simplified)'; // 留空则自动选择
      // 若需强制指定语音，可填写完整 voice.name
      if (forceUseVoiceName) {
        const forcedVoice = voices.find(v => v.name === forceUseVoiceName);
        if (forcedVoice) {
          console.log('使用指定语音:', forcedVoice.name);
          return forcedVoice;
        }
      }
      
      // 先筛选中文语音
      const zhVoices = voices.filter(voice => {
        const lang = (voice && voice.lang ? String(voice.lang) : '').toLowerCase();
        return lang.includes('zh') || lang.includes('cmn');
      });
      
      if (zhVoices.length === 0) return voices[0] || null;
      
      // 儿童友好语音关键词（按优先级排列）
      // Azure 在线语音质量通常更好，优先考虑
      const childFriendlyKeywords = [
        // Azure 常见中文语音名称
        'xiaoxiao', 'xiaoyi', 'xiaobei', 'xiaomei', 'xiaochen', 'xiaoyan',
        'Microsoft Huihui', 'Microsoft Kangkang', 'Microsoft Yaoyao',
        // 儿童/童声关键词
        '童声', '少儿', '儿童', '孩子', 'kid', 'child', 'boy', 'girl',
        // 女声与亲和类关键词
        'yunxi', 'yunyang', 'tingting', 'female', 'woman', '女声', 'female',
        // 其他友好语气关键词
        'friendly', 'cute', 'sweet', 'soft', 'gentle'
      ];
      
      const scored = zhVoices
        .map((voice) => {
          const name = (voice && voice.name ? String(voice.name) : '').toLowerCase();
          let score = 0;
          
          // 在线语音加分（质量通常更好）
          if (voice && voice.localService === false) score += 3;
          
          // 本地语音加分（稳定性更好）
          if (voice && voice.localService === true) score += 1;
          
          // 按关键词命中进行评分
          childFriendlyKeywords.forEach((keyword, index) => {
            if (name.includes(keyword.toLowerCase())) {
              // 前排关键词权重更高
              const weight = index < 12 ? 5 : 3;
              score += weight;
            }
          });
          
          return { voice, score };
        })
        .sort((left, right) => right.score - left.score);

      const selectedVoice = scored[0] ? scored[0].voice : zhVoices[0];
      console.log('自动选择语音:', selectedVoice ? selectedVoice.name : '默认');
      return selectedVoice;
    },
    
    // 清理语音文本，移除不适合朗读的内容
    normalizeSpeechText(content) {
      return String(content || '')
        .replace(/[`*_~#]/g, '')           // 移除 Markdown 标记
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')  // 将链接转为纯文本
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')  // 移除 emoji
        .replace(/[ ]{2,}/g, ' ')          // 合并多余空格
        .trim();
    }
  }
};
</script>

<style scoped>
.ai-chat-container {
  position: relative;
}

.ai-float-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease, opacity 0.12s ease;
}

.ai-float-btn.dragging,
.ai-float-btn.no-transition {
  transition: none !important;
}

.ai-float-btn:active {
  transform: scale(0.92);
}

.ai-float-btn.is-open {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  opacity: 0;
  pointer-events: none;
}

.ai-float-btn.is-listening {
  box-shadow: 0 0 0 8px rgba(245, 87, 108, 0.25);
}

.ai-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-icon {
  font-size: 28px;
}

.ai-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #ff4b2b;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.ai-chat-window {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.92);
  transition: all 0.2s ease;
  pointer-events: none;
}

.ai-chat-window.dragging,
.ai-chat-window.no-transition {
  transition: none !important;
}

.ai-chat-window.show {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.chat-header {
  height: 72px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  cursor: move;
}

.runtime-status {
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.4;
  border-bottom: 1px solid #edf0f5;
}

.runtime-status-text {
  color: #2f3b52;
}

.runtime-status-offline {
  background: #fff4e5;
}

.runtime-status-fallback {
  background: #eef6ff;
}

.runtime-status-recovered {
  background: #edf8ef;
}

.runtime-status-error {
  background: #ffecec;
}

.runtime-status-info {
  background: #eef6ff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 6px 18px rgba(25, 33, 61, 0.12);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.header-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.header-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.action-icon {
  font-size: 18px;
  color: #fff;
}

.message-list {
  flex: 1;
  background: linear-gradient(180deg, #f8f9fa 0%, #eef1f5 100%);
  padding: 14px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.empty-icon {
  font-size: 72px;
  line-height: 1;
}

.empty-text {
  font-size: 16px;
  color: #667eea;
  font-weight: 700;
  line-height: 1.6;
}

.empty-hint {
  font-size: 13px;
  color: #8b8f99;
  line-height: 1.8;
}

.message-wrapper {
  margin-bottom: 10px;
}

.message-item {
  display: flex;
  width: 100%;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 90%;
}

.message-content.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.avatar {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.ai-msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 12px rgba(25, 33, 61, 0.1);
}

.user-msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f5fbf;
  font-size: 14px;
  font-weight: 700;
}

.bubble {
  background: #fff;
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.bubble-text {
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
  white-space: pre-wrap;
}

.bubble-time {
  font-size: 11px;
  color: #8f95a3;
}

.source-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  background: #f6f8fc;
  border: 1px solid #e4e9f3;
}

.source-title {
  font-size: 11px;
  color: #5a6fd6;
  font-weight: 700;
}

.source-item {
  display: flex;
}

.source-text {
  font-size: 11px;
  line-height: 1.35;
  color: #606879;
  word-break: break-word;
}

.user-time {
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.bubble-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.speak-btn {
  min-width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #f2f5fb;
  color: #5a6fd6;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(103, 126, 234, 0.08);
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-item {
  width: 110px;
}

.attachment-image,
.attachment-video {
  width: 110px;
  height: 80px;
  border-radius: 8px;
  background: #000;
}

.loading-wrapper {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.loading-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: dot-bounce 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 13px;
  color: #667eea;
}

.input-area {
  border-top: 1px solid #edf0f5;
  padding: 10px 12px 12px;
  flex-shrink: 0;
  background: #fff;
}

.tool-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #f2f5fb;
  font-size: 12px;
  box-shadow: inset 0 0 0 1px rgba(103, 126, 234, 0.05);
}

.tool-btn.active {
  background: #ffe3eb;
  color: #d8345f;
}

.tool-emoji {
  font-size: 16px;
  line-height: 1;
}

.tool-label {
  font-size: 12px;
  font-weight: 600;
}

.tool-tip {
  font-size: 12px;
  color: #d8345f;
}

.pending-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.pending-item {
  position: relative;
}

.pending-image,
.pending-video {
  width: 86px;
  height: 64px;
  border-radius: 8px;
  background: #000;
}

.remove-attachment {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  border-radius: 18px;
  background: #f5f7fb;
  border: 1px solid #e1e6f0;
  padding: 10px 12px;
}

.message-input {
  flex: 1;
  min-height: 36px;
  max-height: 120px;
  font-size: 14px;
  line-height: 1.4;
  background: transparent;
}

.send-btn {
  min-width: 54px;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(102, 126, 234, 0.24);
}

.send-btn.disabled {
  background: #d8dde8;
}

.send-icon {
  font-size: 16px;
  color: #fff;
  font-weight: 700;
}

@media (max-width: 768px) {
  .attachment-item {
    width: 96px;
  }

  .attachment-image,
  .attachment-video {
    width: 96px;
    height: 72px;
  }
}

.ai-guide-bubble {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  cursor: pointer;
}

.guide-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.guide-icon {
  font-size: 18px;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

.guide-close {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-left: 4px;
  flex-shrink: 0;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>








