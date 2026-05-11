<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🏁</text>
      <view class="step-title">⑨ 工程成果结论与反思</view>
    </view>
    <view class="step-desc">填写成果结论与反思，一键生成工程实践报告并保存到记录中心。</view>

    <view class="input-block">
      <view class="label">工程实践的成果结论</view>
      <textarea
        class="textarea"
        :value="value.conclusion"
        placeholder="请填写你的工程成果结论"
        @input="patch({ conclusion: $event.detail.value, reportGenerated: false })"
      />
    </view>

    <view class="input-block">
      <view class="label">工程实践的反思</view>
      <textarea
        class="textarea"
        :value="value.reflection"
        placeholder="请填写你的反思"
        @input="patch({ reflection: $event.detail.value, reportGenerated: false })"
      />
    </view>

    <view class="input-block">
      <view class="label">其他感受（选填）</view>
      <textarea
        class="textarea"
        :value="value.extraFeeling"
        placeholder="你还想补充什么感受？"
        @input="patch({ extraFeeling: $event.detail.value, reportGenerated: false })"
      />
    </view>

    <view class="btn-row">
      <view class="generate-btn" @click="generateReport">一键生成工程实践报告</view>
    </view>
    <view class="done-tip" v-if="value.reportGenerated">
      恭喜你已经成为一名了不起的工程师！报告已同步到“我的实验记录 -> 结论报告”。
    </view>
  </view>
</template>

<script>
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
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    generateReport() {
      if (!this.value.conclusion || !this.value.reflection) {
        uni.showToast({ title: '请先填写成果结论和反思', icon: 'none' });
        return;
      }
      const generatedAt = nowText();
      this.patch({
        reportGenerated: true,
        generatedAt
      });
      this.$emit('sync-report', {
        generatedAt,
        conclusion: this.value.conclusion,
        reflection: this.value.reflection,
        extraFeeling: this.value.extraFeeling || ''
      });
      uni.showToast({ title: '工程实践报告已生成', icon: 'none' });
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
.input-block {
  margin-top: 12rpx;
  background: #fff;
  border: 1rpx solid #d8e5f7;
  border-radius: 14rpx;
  padding: 10rpx;
}
.label {
  font-size: 22rpx;
  color: #365c90;
  font-weight: 700;
}
.textarea {
  margin-top: 8rpx;
  width: 100%;
  min-height: 150rpx;
  border: 1rpx solid #d2e2f6;
  border-radius: 12rpx;
  padding: 10rpx;
  box-sizing: border-box;
  font-size: 22rpx;
  color: #3f618d;
  line-height: 1.6;
}
.btn-row {
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
.done-tip {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #2f8a4b;
  line-height: 1.6;
}
</style>

