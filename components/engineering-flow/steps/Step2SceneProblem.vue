<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🎯</text>
      <view class="step-title">② 明确场景问题</view>
    </view>
    <view class="step-desc">请选择最符合本次工程任务所要解决的场景问题。</view>

    <view class="option-list">
      <view
        class="option-item"
        :class="{ active: value.sceneProblemChoice === item.key }"
        v-for="item in options"
        :key="item.key"
        @click="selectOption(item)"
      >
        <view class="option-key">{{ item.key }}</view>
        <view class="option-text">{{ item.text }}</view>
      </view>
    </view>

    <view class="action-row">
      <view class="ai-btn" @click="runAIAnalysis">🤖	AI 小助手</view>
    </view>

    <view class="analysis-card" v-if="value.aiAnalysis">
      <view class="analysis-title" :class="{ pass: value.aiChecked, fail: !value.aiChecked }">
        {{ value.aiChecked ? '分析通过：问题定位正确' : '分析建议：请再想一想' }}
      </view>
      <view class="analysis-text">{{ value.aiAnalysis }}</view>
    </view>
  </view>
</template>

<script>
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';

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
    options() {
      const tpl = getEngineeringFlowTemplate(this.experiment && this.experiment.id);
      return (tpl.step2 && tpl.step2.options) || [];
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    selectOption(item) {
      this.patch({
        sceneProblemChoice: item.key,
        sceneProblemText: item.text,
        aiChecked: false,
        aiAnalysis: ''
      });
    },
    runAIAnalysis() {
      if (!this.value.sceneProblemChoice) {
        uni.showToast({ title: '请先选择一个选项', icon: 'none' });
        return;
      }
      const hit = this.options.find((item) => item.key === this.value.sceneProblemChoice);
      const pass = !!(hit && hit.isCorrect);
      const msg = pass
        ? '你选中了真正需要工程解决的问题：手拧袜子费力且不干，目标是快速脱水。'
        : '这个选项更偏“清洁和耐穿”，不是本节模型要解决的核心问题。建议选择与“脱水效率”直接相关的选项。';
      this.patch({
        aiChecked: pass,
        aiAnalysis: msg
      });
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
.option-list {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.option-item {
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid #d7e6f9;
  padding: 12rpx;
  display: flex;
  gap: 10rpx;
}
.option-item.active {
  border-color: #4b8ef2;
  background: #f2f7ff;
}
.option-key {
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #eff4ff;
  color: #365f9a;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.option-text {
  font-size: 23rpx;
  color: #35557f;
  line-height: 1.6;
}
.action-row {
  margin-top: 16rpx;
  display: flex;
  justify-content: flex-end;
}
.ai-btn {
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, #53a2ff, #5f89ff);
  border-radius: 999rpx;
  padding: 8rpx 18rpx;
}
.analysis-card {
  margin-top: 12rpx;
  border-radius: 14rpx;
  background: #fff;
  border: 1rpx solid #d3e2f5;
  padding: 12rpx;
}
.analysis-title {
  font-size: 23rpx;
  font-weight: 700;
}
.analysis-title.pass {
  color: #2f8a4b;
}
.analysis-title.fail {
  color: #c25f3b;
}
.analysis-text {
  margin-top: 8rpx;
  color: #44688f;
  font-size: 22rpx;
  line-height: 1.6;
}
</style>

