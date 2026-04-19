<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🎬</text>
      <view class="step-title">① 观察思考与假设</view>
    </view>
    <view class="step-desc">先观察视频里的现象，再说说你的想法并提出假设。</view>

    <view class="video-block">
      <view class="video-wrap" v-if="guideVideoUrl">
        <video
          class="guide-video"
          :src="guideVideoUrl"
          controls
          show-center-play-btn
          object-fit="contain"
          @ended="handleVideoEnded"
          @error="handleVideoError"
        />
      </view>
      <view class="video-empty" v-else>
        <text>未配置引导视频，请先在配置文件中设置视频地址。</text>
      </view>

      <view class="video-tip">
        <text v-if="value.videoWatched">✅ 视频观看完成，可以开始观察思考并填写假设。</text>
        <text v-else>▶️ 请先完整播放视频，播放结束后自动解锁下方内容。</text>
      </view>
    </view>

    <view class="discovery-card" v-if="discoveryQuestion">
      <view class="discovery-title">❓ 发现问题</view>
      <view class="discovery-text">{{ discoveryQuestion }}</view>
    </view>

    <view class="hypothesis-panel" :class="{ locked: !value.videoWatched }">
      <view class="panel-title">🔍 观察思考与假设</view>
      <view class="lock-mask" v-if="!value.videoWatched">观看完成后解锁</view>

      <view class="option-row">
        <view
          class="option-chip"
          :class="{ active: value.selectedHypothesis === item }"
          v-for="item in options"
          :key="item"
          @click="selectOption(item)"
        >
          <text class="chip-icon">{{ getOptionIcon(item) }}</text>
          <text class="option-text">{{ item }}</text>
        </view>
      </view>

      <view class="textarea-wrap">
        <text class="textarea-label">✍️ 自定义假设</text>
        <textarea
          class="step-textarea"
          :value="value.customHypothesis"
          @input="patch({ customHypothesis: $event.detail.value })"
          placeholder="如果你有自己的新想法，也可以写在这里..."
        />
      </view>

      <view class="ai-row">
        <view class="ai-btn" @click="makeAiHypothesis">
          <text class="ai-icon">🤖</text>
          <text>AI 小课堂</text>
        </view>
      </view>

      <view class="ai-result-card" v-if="hasAiResult">
        <view class="result-title">🤖 AI 小课堂：假设分析</view>

        <view class="result-block">
          <view class="result-tag">{{ aiResultTitleA }}</view>
          <view class="result-line">
            <text class="line-label">假设：</text>
            <text class="line-text">{{ aiResult.a.hypothesis }}</text>
          </view>
          <view class="result-line">
            <text class="line-label">理由：</text>
            <text class="line-text">{{ aiResult.a.reason }}</text>
          </view>
          <view class="result-line">
            <text class="line-label">解释：</text>
            <text class="line-text">{{ aiResult.a.explanation }}</text>
          </view>
        </view>

        <view class="result-block">
          <view class="result-tag">{{ aiResultTitleB }}</view>
          <view class="result-line">
            <text class="line-label">假设：</text>
            <text class="line-text">{{ aiResult.b.hypothesis }}</text>
          </view>
          <view class="result-line">
            <text class="line-label">理由：</text>
            <text class="line-text">{{ aiResult.b.reason }}</text>
          </view>
          <view class="result-line">
            <text class="line-label">解释：</text>
            <text class="line-text">{{ aiResult.b.explanation }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const DEFAULT_OPTIONS = [
  '假设 A（离心力方向）：洗衣机滚筒快速旋转时，水会被“甩”到滚筒外面，转速越快，甩出去的水越多，所以衣服就不怎么滴水了。',
  '假设 B（风力 / 吹风方向）：洗衣机快速转动时会产生很大的风，风把衣服上的水吹干了，就像风扇吹湿衣服一样，所以衣服摸起来快干了。'
];

const DEFAULT_AI_RESULT = {
  a: {
    title: '假设 A（离心力方向）',
    hypothesis: '在“{experiment}”中，滚筒转速越高，衣物上的水更容易沿切线方向被甩出，残留水分更少。',
    reason: '离心运动会使水滴难以继续附着在衣物纤维上，转速越高该效应越明显。',
    explanation:
      '快速旋转时，衣物和水都在做圆周运动。水受到的约束不足，会从滚筒孔和衣物表面分离，因此脱水效率随转速提升。'
  },
  b: {
    title: '假设 B（风力 / 吹风方向）',
    hypothesis: '在“{experiment}”中，旋转引起的气流可以辅助带走部分表面水分，但主要脱水机制不是风干。',
    reason: '风力对衣物表面水分有帮助，但无法解释短时间内大量脱水现象。',
    explanation:
      '风主要作用于蒸发过程，通常更慢；洗衣机甩干阶段的快速去水，核心还是旋转带来的离心分离，风力属于辅助因素。'
  }
};

const hasText = (value) => String(value || '').trim().length > 0;

const replaceExperimentToken = (text, experimentTitle) =>
  String(text || '').replace(/\{experiment\}/g, experimentTitle || '本次实验');

const inferDiscoveryQuestionFromOption = (optionText) => {
  const text = String(optionText || '').trim();
  if (!text) return '';
  const body = text.includes('：') ? text.split('：').slice(1).join('：') : text;
  const brief = String(body || '').replace(/。+$/g, '').trim();
  if (!brief) return '';
  return `发现问题：${brief}？`;
};

export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    experiment: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      options: DEFAULT_OPTIONS
    };
  },
  computed: {
    template() {
      return getScienceFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep1() {
      return (this.template && this.template.step1) || {};
    },
    discoveryQuestion() {
      const fromStep1 = this.templateStep1.discoveryQuestion;
      if (hasText(fromStep1)) return fromStep1;
      const fromStep3 = this.template && this.template.step3 && this.template.step3.defaultQuestion;
      if (hasText(fromStep3)) return `发现问题：${fromStep3}`;
      const options = this.hypothesisOptions;
      return inferDiscoveryQuestionFromOption(Array.isArray(options) ? options[0] : '');
    },
    hypothesisOptions() {
      const options = this.templateStep1.options;
      if (Array.isArray(options) && options.length > 0) return options;
      return DEFAULT_OPTIONS;
    },
    aiResultTemplate() {
      const raw = this.templateStep1.aiResult || {};
      return {
        a: {
          ...DEFAULT_AI_RESULT.a,
          ...(raw.a || {})
        },
        b: {
          ...DEFAULT_AI_RESULT.b,
          ...(raw.b || {})
        }
      };
    },
    guideVideoUrl() {
      return this.experiment.step1VideoUrl || '/static/project-common/videos/featured-intro.mp4';
    },
    aiResult() {
      return this.value.aiResult || null;
    },
    hasAiResult() {
      return !!(
        this.aiResult &&
        this.aiResult.a &&
        this.aiResult.b &&
        this.aiResult.a.hypothesis &&
        this.aiResult.b.hypothesis
      );
    },
    aiResultTitleA() {
      return (this.aiResult && this.aiResult.a && this.aiResult.a.title) || this.aiResultTemplate.a.title;
    },
    aiResultTitleB() {
      return (this.aiResult && this.aiResult.b && this.aiResult.b.title) || this.aiResultTemplate.b.title;
    }
  },
  watch: {
    hypothesisOptions: {
      immediate: true,
      handler(nextOptions) {
        if (!Array.isArray(nextOptions) || nextOptions.length === 0) return;
        this.options = nextOptions;
        const selected = String(this.value.selectedHypothesis || '');
        if (!hasText(selected) || nextOptions.includes(selected)) return;
        this.patch({ selectedHypothesis: '' });
      }
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    selectOption(item) {
      if (!this.value.videoWatched) return;
      this.patch({ selectedHypothesis: item });
    },
    handleVideoEnded() {
      if (this.value.videoWatched) return;
      this.patch({ videoWatched: true });
      uni.showToast({
        title: '视频已看完，请完成观察思考与假设',
        icon: 'none',
        duration: 1400
      });
    },
    handleVideoError() {
      uni.showToast({
        title: '视频加载失败，请检查地址',
        icon: 'none'
      });
    },
    makeAiHypothesis() {
      if (!this.value.videoWatched) {
        uni.showToast({
          title: '请先看完视频，再进入 AI 小课堂',
          icon: 'none'
        });
        return;
      }

      const result = this.buildAiHypothesis();
      this.patch({
        aiResult: result
      });
      uni.showToast({
        title: 'AI 小课堂内容已生成',
        icon: 'none',
        duration: 1200
      });
    },
    buildAiHypothesis() {
      const title = this.experiment.title || '本次实验';
      const aiTemplate = this.aiResultTemplate;
      return {
        generatedAt: Date.now(),
        a: {
          title: aiTemplate.a.title,
          hypothesis: replaceExperimentToken(aiTemplate.a.hypothesis, title),
          reason: replaceExperimentToken(aiTemplate.a.reason, title),
          explanation: replaceExperimentToken(aiTemplate.a.explanation, title)
        },
        b: {
          title: aiTemplate.b.title,
          hypothesis: replaceExperimentToken(aiTemplate.b.hypothesis, title),
          reason: replaceExperimentToken(aiTemplate.b.reason, title),
          explanation: replaceExperimentToken(aiTemplate.b.explanation, title)
        }
      };
    },
    getOptionIcon(option) {
      const text = String(option || '');
      if (text.includes('A')) return '🌀';
      if (text.includes('B')) return '🌬️';
      return '🔩';
    }
  }
};
</script>

<style scoped>
.step-card {
  background: linear-gradient(135deg, #fff5f8, #f0f8ff);
  border-radius: 24rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(255, 182, 193, 0.4);
  position: relative;
  overflow: hidden;
}

.step-card::before {
  content: '✨';
  position: absolute;
  top: 8rpx;
  right: 12rpx;
  font-size: 20rpx;
  opacity: 0.5;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.step-icon {
  font-size: 36rpx;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

.step-title {
  font-size: 30rpx;
  color: #d63384;
  font-weight: 700;
}

.step-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8b5a2b;
  line-height: 1.6;
}

.video-block {
  margin-top: 16rpx;
  border-radius: 20rpx;
  padding: 14rpx;
  background: linear-gradient(135deg, #fff0f5, #f0fff0);
  border: 2rpx dashed rgba(255, 107, 157, 0.4);
}

.video-wrap {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  position: relative;
  padding-top: 56.25%;
  border-radius: 14rpx;
  overflow: hidden;
  background: #000;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.22);
}

.guide-video {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #000;
}

.video-empty {
  border-radius: 14rpx;
  padding: 24rpx;
  text-align: center;
  font-size: 22rpx;
  color: #8b5a2b;
  background: rgba(255, 255, 255, 0.75);
}

.video-tip {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #8b5a2b;
  line-height: 1.6;
  text-align: center;
}

@media (max-width: 900px) {
  .video-wrap {
    max-width: 100%;
  }
}

.hypothesis-panel {
  margin-top: 16rpx;
  position: relative;
  border-radius: 18rpx;
  padding: 14rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}

.hypothesis-panel.locked {
  opacity: 0.7;
}

.panel-title {
  font-size: 25rpx;
  color: #d63384;
  font-weight: 700;
}

.lock-mask {
  position: absolute;
  z-index: 10;
  top: 52rpx;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0 0 18rpx 18rpx;
  background: rgba(255, 255, 255, 0.66);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5a2b;
  font-size: 24rpx;
  font-weight: 600;
}

.discovery-card {
  margin-top: 12rpx;
  border-radius: 14rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #fff7e9, #fff2f7);
  border: 2rpx solid rgba(255, 164, 67, 0.35);
}

.discovery-title {
  font-size: 22rpx;
  color: #c75a00;
  font-weight: 700;
}

.discovery-text {
  margin-top: 6rpx;
  font-size: 23rpx;
  color: #8b4513;
  line-height: 1.58;
}

.option-row {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.option-chip {
  display: flex;
  align-items: flex-start;
  gap: 6rpx;
  width: 100%;
  padding: 12rpx 18rpx;
  font-size: 23rpx;
  color: #8b4513;
  background: linear-gradient(135deg, #fff0f5, #f0fff0);
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.option-chip.active {
  color: #fff;
  background: linear-gradient(135deg, #ff6b9d, #ffb347);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.4);
  transform: scale(1.03);
}

.chip-icon {
  font-size: 20rpx;
  margin-top: 2rpx;
}

.option-text {
  flex: 1;
  line-height: 1.55;
}

.textarea-wrap {
  margin-top: 16rpx;
}

.textarea-label {
  display: block;
  font-size: 22rpx;
  color: #8b5a2b;
  margin-bottom: 8rpx;
}

.step-textarea {
  width: 100%;
  min-height: 140rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 14rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}

.ai-row {
  margin-top: 12rpx;
}

.ai-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  width: 100%;
  padding: 10rpx 16rpx;
  border-radius: 14rpx;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #fff;
  font-size: 23rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.35);
  box-sizing: border-box;
}

.ai-icon {
  font-size: 20rpx;
}

.ai-result-card {
  margin-top: 10rpx;
  border-radius: 14rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #e8f4fd, #f5fffa);
  border: 2rpx solid rgba(79, 172, 254, 0.2);
}

.result-title {
  font-size: 23rpx;
  color: #1f6fb2;
  font-weight: 700;
}

.result-block {
  margin-top: 10rpx;
  border-radius: 12rpx;
  padding: 10rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(79, 172, 254, 0.15);
}

.result-tag {
  font-size: 22rpx;
  color: #0f6cb8;
  font-weight: 700;
}

.result-line {
  margin-top: 6rpx;
}

.line-label {
  font-size: 22rpx;
  color: #1d6aab;
  font-weight: 700;
}

.line-text {
  font-size: 22rpx;
  color: #21507a;
  line-height: 1.6;
}
</style>





