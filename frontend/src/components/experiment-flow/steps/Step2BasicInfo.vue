﻿<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">📝</text>
      <view class="step-title">② 基础信息</view>
    </view>
    <view class="step-desc">填写参与人员、实验日期和实验环境。</view>

    <view class="input-group">
      <text class="input-label">👥 参与人员</text>
      <input
        class="step-input"
        :value="value.participants"
        @input="patch({ participants: $event.detail.value })"
        placeholder="请输入参与人员"
      />
    </view>

    <view class="input-group">
      <text class="input-label">📅 实验日期</text>
      <picker mode="date" :value="value.date" @change="patch({ date: $event.detail.value })">
        <view class="picker-box">
          <text class="picker-icon">📆</text>
          <text>{{ value.date || '选择实验日期' }}</text>
        </view>
      </picker>
    </view>

    <view class="input-group">
      <text class="input-label">🏫 实验环境</text>
      <input
        class="step-input"
        :value="value.environment"
        @input="patch({ environment: $event.detail.value })"
        placeholder="实验环境（教室/家里/实验室/温度、湿度、风速等）"
      />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    }
  }
};
</script>

<style scoped>
.step-card {
  background: linear-gradient(135deg, #E8F4FD, #FFF5F8);
  border-radius: 24rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(135, 206, 250, 0.4);
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
  color: #4169E1;
  font-weight: 700;
}

.step-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8B5A2B;
  line-height: 1.6;
}

.input-group {
  margin-top: 16rpx;
}

.input-label {
  display: block;
  font-size: 22rpx;
  color: #6A5ACD;
  margin-bottom: 8rpx;
}

.step-input {
  width: 100%;
  height: 76rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  border: 2rpx solid rgba(255, 182, 193, 0.3);
  transition: all 0.3s ease;
}

.step-input:focus {
  border-color: #FF6B9D;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 157, 0.2);
}

.picker-box {
  height: 76rpx;
  line-height: 76rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
  color: #8B5A2B;
  display: flex;
  align-items: center;
  gap: 8rpx;
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}

</style>


