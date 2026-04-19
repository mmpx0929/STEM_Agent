<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🎬</text>
      <view class="step-title">① 场景问题引入</view>
    </view>
    <view class="step-desc">{{ introHintText }}</view>

    <view class="video-wrap">
      <video
        class="intro-video"
        :src="introVideoUrl"
        controls
        object-fit="contain"
        @ended="markWatched"
      />
      <view class="video-tip">请先看场景视频，确认我们要解决的真实生活问题。</view>
    </view>

    <view class="question-box">
      <view class="label">核心问题（可编辑）</view>
      <textarea
        class="textarea"
        :value="value.coreQuestionText"
        placeholder="请输入本次工程任务的核心问题"
        @input="patch({ coreQuestionText: $event.detail.value })"
      />
    </view>

  </view>
</template>

<script>
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';

const hasText = (value) => String(value || '').trim().length > 0;

const toQuestionSentence = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.replace(/[。！？!?.，,；;：:]+$/u, '') + '？';
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
  computed: {
    template() {
      return getEngineeringFlowTemplate(this.experiment && this.experiment.id);
    },
    introVideoUrl() {
      return (this.experiment && this.experiment.step1VideoUrl)
        || (this.template.step1 && this.template.step1.introVideoUrl)
        || '/static/Introductory-video/home.mp4';
    },
    introHintText() {
      const step1 = (this.template && this.template.step1) || {};
      if (hasText(step1.introHintText)) return step1.introHintText;
      if (hasText(step1.sceneIntroText)) return step1.sceneIntroText;

      const question = toQuestionSentence(step1.coreQuestion);
      if (question) return `先看生活场景视频，再想一想：${question}`;
      return '先看生活场景视频，再想一想：我们怎么用工程方法，轻松把袜子里的水分离出来？';
    }
  },
  mounted() {
    if (!this.value.coreQuestionText) {
      const text =
        (this.template.step1 && this.template.step1.coreQuestion) ||
        '如何才可以轻松地把袜子里的水分离出来？';
      this.patch({ coreQuestionText: text });
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    markWatched() {
      this.patch({ videoWatched: true });
    }
  }
};
</script>

<style scoped>
.step-card {
  background: linear-gradient(135deg, #fff6ef, #eef8ff);
  border-radius: 24rpx;
  padding: 22rpx;
  border: 2rpx solid rgba(126, 164, 225, 0.35);
}
.step-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.step-icon {
  font-size: 34rpx;
}
.step-title {
  font-size: 30rpx;
  color: #28518a;
  font-weight: 700;
}
.step-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #5f4b2c;
}
.video-wrap {
  margin-top: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 12rpx;
  border: 1rpx solid #cfdff5;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
}
.intro-video {
  width: 100%;
  height: 420px;
  max-height: 52vw;
  min-height: 220px;
  border-radius: 12rpx;
  background: #f0f5ff;
}
.video-tip {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #607aa6;
}
.question-box {
  margin-top: 16rpx;
}
.label {
  font-size: 23rpx;
  color: #35598d;
  margin-bottom: 8rpx;
  font-weight: 600;
}
.textarea {
  width: 100%;
  min-height: 160rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #cfdff5;
  padding: 12rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  color: #304c75;
  line-height: 1.6;
}
@media (max-width: 900px) {
  .video-wrap {
    max-width: 100%;
  }

  .intro-video {
    height: 240px;
    max-height: none;
    min-height: 180px;
  }
}
</style>


