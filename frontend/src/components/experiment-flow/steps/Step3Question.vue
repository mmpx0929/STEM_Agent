<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">❓</text>
      <view class="step-title">③ 问题与假设</view>
    </view>
    <view class="step-desc">把科学问题说具体，再写下假设。问题越清晰，实验才会高效哦。</view>

    <view class="input-group">
      <text class="input-label">🧠 明确科学问题（也可以记录下你自己的思考哦）</text>
      <textarea
        class="step-textarea"
        :value="value.question"
        @input="patch({ question: $event.detail.value })"
        placeholder="把你最想验证的问题写在这里..."
      />
    </view>

    <view class="hypothesis-panel">
      <view class="panel-title">🔍 合理的推理与假设</view>

      <view class="carry-box">
        <view class="carry-title">✅ 合理的假设</view>
        <view class="carry-text">{{ correctHypothesisText }}</view>
      </view>

      <view class="result-block">
        <view class="result-line">
          <text class="line-label">原因：</text>
          <text class="line-text">{{ correctReasonText }}</text>
        </view>
        <view class="result-line">
          <text class="line-label">解释：</text>
          <text class="line-text">{{ correctExplanationText }}</text>
        </view>
      </view>

      <view class="input-group">
        <text class="input-label">✍️ 我的推理与假设（也可以记录下你自己的思考哦）</text>
        <textarea
          class="step-textarea"
          :value="value.hypothesisText"
          @input="patch({ hypothesisText: $event.detail.value })"
          placeholder="这里已填入正确的假设，你也可以补充自己的理解。"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const DEFAULT_QUESTION =
  '为什么洗衣机最后会转得那么快？为什么衣服从洗衣机里拿出来后不怎么滴水，感觉快要干了？';

const DEFAULT_HYPOTHESIS_OPTIONS = [
  {
    key: 'A',
    icon: '🌀',
    text: '假设 A（离心力方向）：洗衣机滚筒快速旋转时，水会被“甩”到滚筒外面，转速越快，甩出去的水越多，所以衣服就不怎么滴水了。'
  },
  {
    key: 'B',
    icon: '🌬️',
    text: '假设 B（风力 / 吹风方向）：洗衣机快速转动时会产生很大的风，风把衣服上的水吹干了，就像风扇吹湿衣服一样，所以衣服摸起来快干了。'
  }
];

const hasText = (value) => String(value || '').trim().length > 0;

const DEFAULT_REASON_TEXT =
  '旋转速度提升后，离心分离效应会增强，水更难继续附着在材料表面。';

const DEFAULT_EXPLANATION_TEXT =
  '本实验重点验证“速度变化对现象变化”的关系。用正确假设可以让观察、记录与结论保持一致。';

export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    flowData: {
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
      return getScienceFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep3() {
      return (this.template && this.template.step3) || {};
    },
    hypothesisOptions() {
      const options = this.templateStep3.hypothesisOptions;
      if (Array.isArray(options) && options.length > 0) return options;
      return DEFAULT_HYPOTHESIS_OPTIONS;
    },
    defaultQuestion() {
      return this.templateStep3.defaultQuestion || DEFAULT_QUESTION;
    },
    correctHypothesisOption() {
      const options = this.hypothesisOptions;
      if (!Array.isArray(options) || options.length === 0) return null;
      return options[0];
    },
    correctHypothesisText() {
      const option = this.correctHypothesisOption;
      return (option && option.text) || '';
    },
    correctReasonText() {
      const fromStep3 = this.templateStep3.correctReason;
      if (hasText(fromStep3)) return fromStep3;
      const fromStep1 = this.template && this.template.step1 && this.template.step1.aiResult
        && this.template.step1.aiResult.a && this.template.step1.aiResult.a.reason;
      return hasText(fromStep1) ? fromStep1 : DEFAULT_REASON_TEXT;
    },
    correctExplanationText() {
      const fromStep3 = this.templateStep3.correctExplanation;
      if (hasText(fromStep3)) return fromStep3;
      const fromStep1 = this.template && this.template.step1 && this.template.step1.aiResult
        && this.template.step1.aiResult.a && this.template.step1.aiResult.a.explanation;
      return hasText(fromStep1) ? fromStep1 : DEFAULT_EXPLANATION_TEXT;
    }
  },
  mounted() {
    this.prefillQuestionAndHypothesis();
  },
  watch: {
    flowData: {
      deep: true,
      handler() {
        this.prefillQuestionAndHypothesis();
      }
    },
    experiment: {
      deep: true,
      handler() {
        this.prefillQuestionAndHypothesis();
      }
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    prefillQuestionAndHypothesis() {
      const next = {};

      if (!hasText(this.value.question)) {
        next.question = this.defaultQuestion;
      }

      if (this.correctHypothesisText && this.value.hypothesisText !== this.correctHypothesisText) {
        next.hypothesisText = this.correctHypothesisText;
      }

      if (Object.keys(next).length > 0) {
        this.patch(next);
      }
    }
  }
};
</script>

<style scoped>
.step-card {
  background: linear-gradient(135deg, #f5f0ff, #fff5f8);
  border-radius: 24rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(186, 85, 211, 0.35);
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
  color: #9b59b6;
  font-weight: 700;
}

.step-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8b5a2b;
  line-height: 1.6;
}

.input-group {
  margin-top: 16rpx;
}

.input-label {
  display: block;
  font-size: 22rpx;
  color: #6a5acd;
  margin-bottom: 8rpx;
}

.step-textarea {
  width: 100%;
  min-height: 130rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 14rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  border: 2rpx solid rgba(155, 89, 182, 0.25);
}

.hypothesis-panel {
  margin-top: 16rpx;
  border-radius: 18rpx;
  padding: 14rpx;
  background: rgba(255, 255, 255, 0.75);
  border: 2rpx solid rgba(155, 89, 182, 0.18);
}

.panel-title {
  font-size: 24rpx;
  color: #7d45a8;
  font-weight: 700;
}

.carry-box {
  margin-top: 10rpx;
  border-radius: 14rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #e8f4fd, #f5fffa);
  border: 2rpx solid rgba(79, 172, 254, 0.2);
}

.carry-title {
  font-size: 22rpx;
  color: #1f6fb2;
  font-weight: 700;
}

.carry-text {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #21507a;
  line-height: 1.55;
}

.result-block {
  margin-top: 12rpx;
  border-radius: 14rpx;
  padding: 12rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(155, 89, 182, 0.12);
}

.result-line + .result-line {
  margin-top: 8rpx;
}

.line-label {
  font-size: 22rpx;
  color: #6d4aa1;
  font-weight: 700;
}

.line-text {
  font-size: 22rpx;
  color: #5d4b7e;
  line-height: 1.55;
}
</style>



