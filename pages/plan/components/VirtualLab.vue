﻿<template>
  <view class="virtual-lab-component">
    <view class="build-area">
      <view class="area-title">{{ modelName }}</view>
      <view class="feedback-banner" :class="feedbackState.type">{{ feedbackState.message }}</view>
      
      <!-- AI 引导气泡 -->
      <view class="ai-guide-bubble" v-if="showAiGuide && aiGuideEnabled">
        <view class="ai-avatar">🤖</view>
        <view class="ai-content">
          <view class="ai-message">{{ aiGuideMessage }}</view>
          <view class="ai-close" @click="closeAiGuide">×</view>
        </view>
      </view>
      
      <view class="build-platform" :class="{ completed: isBuildCompleted }">
        <!-- 搭建提示 -->
        <view class="build-hint" v-if="placedParts.length === 0 && !isBuildCompleted">
          <text>拖动器材进行搭建模型</text>
        </view>

        <!-- 放置的零件 -->
        <view
          v-for="(part, index) in placedParts"
          :key="index"
          class="model-part"
          :class="{
            'is-dragging': part.isDragging,
            'is-placed': part.isPlaced,
            'near-fusion': part.isNearFusion,
            'fusing': part.isFusing,
            'is-step': isStepPart(part.id)
          }"
          :style="{
            top: part.top + 'px',
            left: part.left + 'px',
            width: isStepPart(part.id) ? '220px' : '90px',
            height: isStepPart(part.id) ? '220px' : '90px',
            zIndex: part.isDragging ? 100 : (isStepPart(part.id) ? 5 : 10)
          }"
          @touchstart="startDrag(index, $event)"
          @touchmove="drag(index, $event)"
          @touchend="endDrag(index)"
          @mousedown="startDrag(index, $event)"
          @mousemove="drag(index, $event)"
          @mouseup="endDrag(index)"
          @mouseleave="endDrag(index)"
        >
          <image :src="getPartImage(part.id)" mode="aspectFit" class="part-image" />
          <view v-if="!isStepPart(part.id)" class="part-remove" @click.stop="removePart(index)">×</view>
          <view v-else class="part-disassemble" @click.stop="disassemblePart(index)">↩️</view>
        </view>

        <!-- 操作气泡 -->
        <view
          v-if="currentAction"
          class="action-bubble"
          :style="{ top: currentAction.y + 'px', left: currentAction.x + 'px' }"
          @click.stop="performAction"
        >
          <view class="tool-icon">{{ getToolIcon(currentAction.tool) }}</view>
          <text class="action-text">{{ currentAction.text }}</text>
        </view>

        <!-- 融合光环效果 -->
        <view class="fusion-glow" v-if="showFusionGlow" :style="fusionGlowStyle"></view>

        <!-- 粒子效果 -->
        <view
          v-for="(particle, index) in particles"
          :key="index"
          class="particle"
          :style="{
            top: particle.top + 'px',
            left: particle.left + 'px',
            backgroundColor: particle.color,
            animationDelay: particle.delay + 'ms'
          }"
        ></view>
      </view>

      <!-- 实验按钮 -->
      <view class="experiment-section" v-if="isBuildCompleted">
        <button class="experiment-btn" @click="startExperiment">开始实验</button>
        <button class="upload-result-btn" @click="goToResultUpload">📸 上传实验结果</button>
      </view>

      <!-- 搭建状态 -->
      <view class="build-status">{{ buildStatus }}</view>

      <!-- 视频播放器 -->
      <view class="video-container" v-if="showVideo && experimentVideo">
        <video
          id="experimentVideo"
          :src="experimentVideo"
          class="video-player"
          controls
          @ended="videoEnded"
        ></video>
        <button class="close-video-btn" @click="closeVideo">关闭视频</button>
      </view>
    </view>
  </view>
</template>

<script>
import virtualLabMixin from '@/pages/mixins/virtual-lab-mixin.js';

const AI_MEDIA_LOCK_FLAG = '__STEM_AI_MEDIA_LOCK__';

export default {
  mixins: [virtualLabMixin],
  props: {
    projectId: {
      type: String,
      required: true
    },
    modelName: {
      type: String,
      default: ''
    },
    experimentVideo: {
      type: String,
      default: ''
    },
    experimentId: {
      type: String,
      default: ''
    },
    initialParts: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      aiGuideEnabled: true,
      currentStep: 0,
      aiGuideMessage: '',
      showAiGuide: false,
      aiGuideTimer: null,
      aiGuideQueue: [],
      isAiGuideQueueRunning: false,
      lastEncouragementAt: 0,
      speechTaskId: 0
    };
  },
  mounted() {
    this.initBuild();
    this.initAiGuide();
  },
  beforeDestroy() {
    this.resetAiGuideFlow();
  },
  beforeUnmount() {
    this.resetAiGuideFlow();
  },
  methods: {
    lockMediaPlayback() {
      if (typeof window === 'undefined') return;
      window[AI_MEDIA_LOCK_FLAG] = true;
      if (typeof document === 'undefined') return;
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        try {
          if (!video.paused) video.pause();
        } catch (e) {
          // ignore runtime pause errors
        }
      });
    },
    unlockMediaPlayback() {
      if (typeof window === 'undefined') return;
      window[AI_MEDIA_LOCK_FLAG] = false;
    },
    initBuild() {
      this.buildPhase = 0;
      this.isBuildCompleted = false;
      this.$nextTick(() => {
        // 使用真实搭建容器尺寸初始化，避免估算高度与样式高度不一致导致底部截断
        if (typeof uni !== 'undefined' && uni.createSelectorQuery) {
          const query = uni.createSelectorQuery().in(this);
          query.select('.build-platform').boundingClientRect((rect) => {
            if (rect && Number(rect.width) > 0 && Number(rect.height) > 0) {
              this.placedParts = this.buildInitialParts(this.initialParts, {
                containerWidth: Number(rect.width),
                containerHeight: Number(rect.height)
              });
            } else {
              this.placedParts = this.buildInitialParts(this.initialParts);
            }
            this.updateBuildStatus();
          }).exec();
          return;
        }

        this.placedParts = this.buildInitialParts(this.initialParts);
        this.updateBuildStatus();
      });
    },
    initAiGuide() {
      if (!this.aiGuideEnabled) return;

      this.resetAiGuideFlow();
      this.currentStep = 0;

      const message = this.aiGuideMessages.welcome[this.projectId] || '欢迎来到虚拟实验室！我是你的 AI 助手，会陪伴你完成整个搭建过程。加油！';

      // 闭环引导：欢迎 -> 当前步骤
      this.queueAiGuideMessage(message, 3600);
      this.showStepGuide(0);
    },

    showStepGuide(stepIndex) {
      if (!this.aiGuideEnabled) return;

      const messages = this.aiGuideMessages.steps[this.projectId];
      if (messages && messages[stepIndex]) {
        this.queueAiGuideMessage(messages[stepIndex], 3200);
      }
    },

    // Mixin hook
    onPartPlaced(part) {
      if (!this.aiGuideEnabled || !part) return;

      // 限流鼓励提示，避免打断主引导链路
      if (this.isBuildCompleted || this.currentAction) return;
      const now = Date.now();
      if (now - this.lastEncouragementAt < 6000) return;
      this.lastEncouragementAt = now;

      const encouragementMessages = this.aiGuideMessages.encouragements;

      const randomMsg = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
      this.queueAiGuideMessage(randomMsg, 1800);
    },

    // Mixin hook
    onFusionComplete(resultId) {
      if (!this.aiGuideEnabled) return;

      // 闭环引导：融合成功 -> 下一步
      const completionMessages = this.aiGuideMessages.fusionCompletion[this.projectId];
      if (completionMessages && completionMessages[resultId]) {
        this.queueAiGuideMessage(completionMessages[resultId], 3800);
      }

      const stepMessages = this.aiGuideMessages.steps[this.projectId] || [];
      const nextStepIndex = this.buildPhase;
      this.currentStep = nextStepIndex;

      if (!this.isBuildCompleted && stepMessages[nextStepIndex]) {
        this.queueAiGuideMessage(stepMessages[nextStepIndex], 3200);
      }
    },

    queueAiGuideMessage(message, duration = 3500) {
      if (!this.aiGuideEnabled || !message) return;
      this.aiGuideQueue.push({ message, duration });
      if (!this.isAiGuideQueueRunning) {
        this.playNextAiGuideMessage();
      }
    },

    playNextAiGuideMessage() {
      if (!this.aiGuideQueue.length) {
        this.isAiGuideQueueRunning = false;
        return;
      }
      this.isAiGuideQueueRunning = true;
      const current = this.aiGuideQueue.shift();
      this.showAiGuideMessage(current.message, current.duration, () => {
        this.playNextAiGuideMessage();
      });
    },

    showAiGuideMessage(message, duration = 3500, onFinish = null) {
      if (this.aiGuideTimer) {
        clearTimeout(this.aiGuideTimer);
        this.aiGuideTimer = null;
      }

      this.aiGuideMessage = message;
      this.showAiGuide = true;
      this.speakGuideText(message);

      this.aiGuideTimer = setTimeout(() => {
        this.showAiGuide = false;
        this.aiGuideTimer = null;
        if (onFinish) {
          onFinish();
        }
      }, duration);
    },

    speakGuideText(text) {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const content = String(text || '')
        .replace(/[`*_~#]/g, '')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/[ ]{2,}/g, ' ')
        .trim();

      if (!content) return;

      try {
        const speechTaskId = ++this.speechTaskId;
        const isTaskActive = () => speechTaskId === this.speechTaskId;
        this.lockMediaPlayback();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content);

        // 与 AIChat 保持一致：固定优先使用微软晓晓音色
        const forceUseVoiceName = 'Microsoft 晓晓 Online (Natural) - Chinese (Mandarin, Simplified)';
        const voiceList = window.speechSynthesis.getVoices ? (window.speechSynthesis.getVoices() || []) : [];
        const selectedVoice = voiceList.find(voice => voice && voice.name === forceUseVoiceName)
          || voiceList.find(voice => {
            const lang = String((voice && voice.lang) || '').toLowerCase();
            return lang.includes('zh') || lang.includes('cmn');
          })
          || null;

        utterance.lang = selectedVoice && selectedVoice.lang ? selectedVoice.lang : 'zh-CN';
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 1;
        utterance.onend = () => {
          if (!isTaskActive()) return;
          this.unlockMediaPlayback();
        };
        utterance.onerror = () => {
          if (!isTaskActive()) return;
          this.unlockMediaPlayback();
        };
        if (!isTaskActive()) return;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        this.unlockMediaPlayback();
        console.error('虚拟实验引导语音播放失败:', error);
      }
    },

    resetAiGuideFlow() {
      this.speechTaskId += 1;
      if (this.aiGuideTimer) {
        clearTimeout(this.aiGuideTimer);
        this.aiGuideTimer = null;
      }
      this.aiGuideQueue = [];
      this.isAiGuideQueueRunning = false;
      this.showAiGuide = false;
      this.unlockMediaPlayback();

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },

    closeAiGuide() {
      this.resetAiGuideFlow();
    },

    goToResultUpload() {
      // 这里的 projectId 可能是 'centrifugal', 'electric' 等 
      // 映射到 data-record 页面的 id (1-9)
      const projectIdMap = {
        'centrifugal': '1',
        'electric': '6',
        'centrifugal-release': '2',
        'water-ring': '3'
      };
      const expId = projectIdMap[this.projectId] || this.experimentId || '1';
      uni.navigateTo({
        url: `/pages/data-record/data-record?id=${expId}`
      });
    }
  }
};
</script>

<style scoped>
.virtual-lab-component {
  width: 100%;
}
.build-area {
  background: white;
  border-radius: 25px;
  padding: 20px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.1);
}
.area-title {
  font-size: 24px;
  font-weight: 800;
  color: #56AB2F;
  margin-bottom: 15px;
  border-left: 8px solid #A8E063;
  padding-left: 15px;
}
.feedback-banner {
  border-radius: 12px;
  padding: 10px 15px;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 700;
}
.feedback-banner.info { background: #E3F2FD; color: #0D47A1; }
.feedback-banner.success { background: #E8F5E9; color: #1B5E20; }
.feedback-banner.warning { background: #FFF8E1; color: #E65100; }
.ai-guide-bubble {
  display: flex;
  align-items: flex-start;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 15px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  animation: ai-slide-in 0.4s ease-out;
  position: relative;
}
@keyframes ai-slide-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ai-avatar {
  font-size: 28px;
  margin-right: 12px;
  flex-shrink: 0;
  animation: ai-bounce 1s ease-in-out infinite;
}
@keyframes ai-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.ai-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.ai-message {
  color: white;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 600;
  flex: 1;
}
.ai-close {
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s;
}
.ai-close:hover {
  color: white;
}
.build-platform {
  width: 100%;
  height: 450px;
  background: #FFFDE7;
  border-radius: 20px;
  position: relative;
  margin-bottom: 15px;
  border: 4px dashed #FFD93D;
  overflow: hidden;
}
.build-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #888;
  font-size: 16px;
}
.model-part {
  position: absolute;
  width: 90px;
  height: 90px;
  z-index: 10;
  touch-action: none;
}
.model-part image { width: 100%; height: 100%; border-radius: 10px; }
.part-remove, .part-disassemble {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 26px;
  height: 26px;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid white;
}
.part-remove { background: #FF6B6B; }
.part-disassemble { background: #4FACFE; }
.action-bubble {
  position: absolute;
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border: 2px solid #56AB2F;
}
.experiment-btn {
  background: #56AB2F;
  color: white;
  border-radius: 15px;
  padding: 12px;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.upload-result-btn {
  width: 100%;
  background: linear-gradient(135deg, #FFD93D 0%, #FF9F1C 100%);
  color: white;
  border: 4px solid white;
  border-radius: 20px;
  padding: 12px 40px;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 217, 61, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.upload-result-btn:active {
  transform: translateY(2px);
  box-shadow: 0 3px 10px rgba(255, 217, 61, 0.4);
}
.video-container {
  background: #000;
  border-radius: 15px;
  padding: 15px;
}
.video-player { width: 100%; height: 240px; }
.close-video-btn { background: #FF6B6B; color: white; margin-top: 10px; }
.particle { position: absolute; width: 10px; height: 10px; border-radius: 50%; pointer-events: none; }
@keyframes pop-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
