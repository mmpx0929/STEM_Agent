<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">📋</text>
      <view class="step-title">⑤ 生成工程方案表</view>
    </view>
    <view class="step-desc">整理好前面的步骤，填写好基础信息后，就完成了《工程模型方案设计表单》哦。</view>

    <view class="base-form">
      <view class="label">工程标题</view>
      <input
        class="input"
        :value="value.engineeringTitle"
        @input="patch({ engineeringTitle: $event.detail.value })"
        placeholder="请输入工程标题"
      />

      <view class="label">设计人</view>
      <input
        class="input"
        :value="value.designer"
        @input="patch({ designer: $event.detail.value })"
        placeholder="请输入设计人"
      />

      <view class="label">设计日期</view>
      <picker mode="date" :value="value.designDate" @change="patch({ designDate: $event.detail.value })">
        <view class="picker-box">{{ value.designDate || '选择设计日期' }}</view>
      </picker>
    </view>

    <view class="action-row">
      <view class="generate-btn" @click="generatePlan">一键生成工程模型方案设计表</view>
    </view>

    <view class="sync-tip" v-if="value.planGenerated">
      已同步到“我的实验记录 -> 方案设计”
    </view>
  </view>
</template>

<script>
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';

const nowText = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

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
      return getEngineeringFlowTemplate(this.experiment && this.experiment.id);
    }
  },
  mounted() {
    const patch = {};
    if (!this.value.engineeringTitle) {
      patch.engineeringTitle = (this.template.step5 && this.template.step5.defaultTitle) || '手动离心甩干机工程方案设计';
    }
    if (!this.value.designDate) patch.designDate = nowText().slice(0, 10);
    if (Object.keys(patch).length > 0) this.patch(patch);
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    generatePlan() {
      if (!this.value.designer) {
        uni.showToast({ title: '请先填写设计人', icon: 'none' });
        return;
      }
      if (!this.value.designDate) {
        uni.showToast({ title: '请先填写设计日期', icon: 'none' });
        return;
      }
      const generatedAt = nowText();
      this.patch({
        planGenerated: true,
        generatedAt
      });
      this.$emit('sync-plan', {
        generatedAt,
        engineeringTitle: this.value.engineeringTitle,
        designer: this.value.designer,
        designDate: this.value.designDate
      });
      uni.showToast({ title: '方案表已生成', icon: 'none' });
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
  color: #5f4b2c;
  line-height: 1.6;
}
.base-form {
  margin-top: 14rpx;
  background: #fff;
  border: 1rpx solid #d8e5f7;
  border-radius: 16rpx;
  padding: 12rpx;
}
.label {
  margin-top: 8rpx;
  margin-bottom: 6rpx;
  font-size: 22rpx;
  color: #3a5f91;
  font-weight: 600;
}
.input {
  width: 100%;
  height: 72rpx;
  background: #fdfefe;
  border: 1rpx solid #d2e2f6;
  border-radius: 12rpx;
  padding: 0 12rpx;
  box-sizing: border-box;
  font-size: 22rpx;
  color: #3a5a84;
}
.picker-box {
  height: 72rpx;
  line-height: 72rpx;
  background: #fdfefe;
  border: 1rpx solid #d2e2f6;
  border-radius: 12rpx;
  padding: 0 12rpx;
  box-sizing: border-box;
  font-size: 22rpx;
  color: #3a5a84;
}
.action-row {
  margin-top: 14rpx;
}
.generate-btn {
  text-align: center;
  font-size: 24rpx;
  color: #fff;
  background: linear-gradient(135deg, #53a2ff, #5f89ff);
  border-radius: 14rpx;
  padding: 14rpx 16rpx;
}
.sync-tip {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #2f8a4b;
}
</style>
