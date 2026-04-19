<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🧭</text>
      <view class="step-title">⑦ 实验步骤</view>
    </view>
    <view class="step-desc">
      小探究家请按顺序完成 4 个大步骤。每点击一步，系统会自动生成对应的小步骤。点击已选步骤可回退修改。
    </view>

    <view class="progress-card">
      <view class="progress-head">
        <text class="progress-title">闯关进度</text>
        <text class="progress-text">{{ progressPercent }}%</text>
      </view>
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      <view class="progress-tip">{{ progressTip }}</view>
    </view>

    <view class="major-list">
      <view
        class="major-item"
        :class="majorItemClass(step)"
        v-for="step in majorStepsConfig"
        :key="step.key"
        @click="selectMajorStep(step)"
      >
        <view class="major-order" :class="{ empty: !selectedOrder(step.key) }">
          {{ selectedOrder(step.key) || '' }}
        </view>
        <view class="major-content">
          <view class="major-title">{{ step.title }}</view>
          <view class="major-sub">{{ step.summary }}</view>
        </view>
        <view class="major-badge" v-if="selectedOrder(step.key)">序号 {{ selectedOrder(step.key) }}</view>
      </view>
    </view>

    <view class="detail-card" v-if="selectedSections.length > 0">
      <view class="detail-title">自动生成的小项内容</view>

      <view class="section-card" v-for="section in selectedSections" :key="section.key">
        <view class="section-head">
          <text class="section-index">{{ section.order }}.</text>
          <text class="section-title">{{ section.title }}</text>
        </view>

        <template v-if="section.key === 'step1'">
          <view class="line" v-for="(line, lineIndex) in section.lines" :key="`${section.key}-${lineIndex}`">
            {{ line }}
          </view>

          <view class="step1-layout">
            <view class="section-image image-panel">
              <image
                v-if="showMaterialImage"
                class="material-image"
                :src="materialImageUrl"
                mode="aspectFit"
                @error="onMaterialImageError"
              />
              <view class="image-fallback" v-else>全部材料图片（待上传）</view>
            </view>

            <view class="material-table step1-table">
              <view class="material-head">
                <text class="col name">材料名称</text>
                <text class="col spec">规格</text>
                <text class="col qty">数量</text>
                <text class="col use">场景应用</text>
              </view>
              <view class="material-row" v-for="(item, idx) in materialItems" :key="`m-${idx}`">
                <text class="col name">{{ item.name }}</text>
                <text class="col spec">{{ item.spec }}</text>
                <text class="col qty">{{ item.qty }}</text>
                <text class="col use">{{ item.usage }}</text>
              </view>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="line" v-for="(line, lineIndex) in section.lines" :key="`${section.key}-${lineIndex}`">
            {{ line }}
          </view>
        </template>
      </view>
    </view>

    <view class="generate-row">
      <view class="generate-btn" @click="generatePlanDesign">生成实验方案设计</view>
    </view>

    <view class="sync-tip" v-if="value.planGenerated">
      已同步更新到“我的实验 -> 实验方案设计”
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const DEFAULT_MATERIAL_IMAGE_URL = '/static/experiments/science-01/images/virtual-lab/0全部材料.jpg';

const DEFAULT_MATERIALS = [
  { name: '塑料瓶', spec: '1000ml', qty: '1个', usage: '圆形底座（旋转飞椅底座）' },
  { name: '减速电机', spec: '130小电机', qty: '1个', usage: '提供旋转动力' },
  { name: '变速电路板', spec: '3v', qty: '1个', usage: '控制旋转速度' },
  { name: '电池', spec: '5号', qty: '3节', usage: '驱动电机转动的电源' },
  { name: '电池盒', spec: '3节5号', qty: '1个', usage: '装电池' },
  { name: '木棒', spec: '5mm*15cm', qty: '6支', usage: '支撑飞椅' },
  { name: '尼龙线', spec: '15cm', qty: '6根', usage: '连接飞椅和木棒' },
  { name: '五角星', spec: '3cm', qty: '6个', usage: '模拟飞椅' },
  { name: '塑料固定件', spec: '3cm', qty: '1个', usage: '固定木棒在电机上' },
  { name: '电线', spec: '15cm', qty: '2条', usage: '连接电机和电路板' },
  { name: '彩色吸管', spec: '6mm', qty: '2根', usage: '用于装饰电线' },
  { name: '橡胶圈', spec: '4mm', qty: '6个', usage: '连接尼龙线便于安装在木棒上' },
  { name: '泡棉胶', spec: '2.5cm带孔', qty: '2个', usage: '用于安装电机在瓶子上' }
];

const DEFAULT_MAJOR_STEPS = [
  {
    key: 'step1',
    title: '准备实验材料、实验工具',
    summary: '先把材料和工具准备齐全。',
    lines: [
      '环节 1：准备实验材料（参考上一步材料清单）。',
      '环节 2：准备实验工具：剪刀。',
      '环节 3：核对材料完整性，确认每一项都能找到。'
    ]
  },
  {
    key: 'step2',
    title: '搭建旋转飞椅模拟装置',
    summary: '完成实验场景和模型搭建。',
    lines: [
      '环节 1：组装动力装置，将电机和电池盒安装在电路板上。',
      '环节 2：用瓶子做底座，将电机安装在瓶盖上。',
      '环节 3：组装旋转装置，用尼龙线连接五角星和橡胶圈，并将橡胶圈套在木棒的一端；木棒另一端插入塑料固定件中，隔孔插入。',
      '环节 4：将旋转装置安装在电机上。'
    ]
  },
  {
    key: 'step3',
    title: '控制旋转速度并观察现象',
    summary: '操作装置获取实验现象。',
    lines: [
      '环节 1：在电池盒里安装电池。',
      '环节 2：打开速度控制板旋转按钮，先低速观察。',
      '环节 3：逐步提高速度，再次观察五角星飞行状态变化。'
    ]
  },
  {
    key: 'step4',
    title: '总结现象并记录分析',
    summary: '完成数据记录和思考总结。',
    lines: [
      '环节 1：小朋友们，你们观察到了什么？请把现象写进数据记录表。',
      '环节 2：根据记录表分析和总结：五角星飞行状态和什么有关系？',
      '环节 3：说一说你们的结论：速度变化怎样影响飞行状态？'
    ]
  }
];

const MAJOR_STEP_ORDER = ['step1', 'step2', 'step3', 'step4'];

const shuffleMajorSteps = (source = []) => {
  const list = [...source];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
};

const resolveMajorStepKey = (value) => {
  if (typeof value !== 'string') return '';
  if (MAJOR_STEP_ORDER.includes(value)) return value;
  if (value.includes('第一步')) return 'step1';
  if (value.includes('第二步')) return 'step2';
  if (value.includes('第三步')) return 'step3';
  if (value.includes('第四步')) return 'step4';
  return '';
};

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
  data() {
    return {
      majorStepsConfig: shuffleMajorSteps(DEFAULT_MAJOR_STEPS),
      materialImageUrl: DEFAULT_MATERIAL_IMAGE_URL,
      showMaterialImage: true
    };
  },
  computed: {
    template() {
      return getScienceFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep7() {
      return (this.template && this.template.step7) || {};
    },
    activeMajorSteps() {
      const steps = this.templateStep7.majorSteps;
      if (Array.isArray(steps) && steps.length === 4) return steps;
      return DEFAULT_MAJOR_STEPS;
    },
    selectedMajorSteps() {
      const raw = Array.isArray(this.value.majorSteps) ? this.value.majorSteps : [];
      const normalized = [];
      raw.forEach((item) => {
        const key = resolveMajorStepKey(item);
        if (!key || normalized.includes(key)) return;
        normalized.push(key);
      });
      return normalized.slice(0, 4);
    },
    progressPercent() {
      const done = Math.min(this.selectedMajorSteps.length, 4);
      return done * 25;
    },
    progressTip() {
      const done = Math.min(this.selectedMajorSteps.length, 4);
      if (done === 0) return '开始闯关吧，先完成第 1 步。';
      if (done === 4) return '4 个步骤已完成，点击“生成实验方案设计”。';
      return `已完成 ${done}/4 步，继续完成第 ${done + 1} 步。`;
    },
    nextExpectedKey() {
      return MAJOR_STEP_ORDER[this.selectedMajorSteps.length] || '';
    },
    materialItems() {
      const step5 = this.flowData && this.flowData.step5 ? this.flowData.step5 : {};
      const fromStep5 = step5.materialItems;
      if (Array.isArray(fromStep5) && fromStep5.length > 0) return fromStep5;
      const templateStep5 = (this.template && this.template.step5) || {};
      const fromTemplate = templateStep5.baseMaterials;
      if (Array.isArray(fromTemplate) && fromTemplate.length > 0) return fromTemplate;
      return DEFAULT_MATERIALS;
    },
    selectedSections() {
      return this.selectedMajorSteps
        .map((key, index) => {
          const def = this.activeMajorSteps.find((item) => item.key === key);
          if (!def) return null;
          return {
            ...def,
            order: index + 1
          };
        })
        .filter(Boolean);
    }
  },
  watch: {
    activeMajorSteps: {
      immediate: true,
      handler(nextSteps) {
        this.majorStepsConfig = shuffleMajorSteps(nextSteps);
      }
    },
    templateStep7: {
      immediate: true,
      deep: true,
      handler(nextValue) {
        this.materialImageUrl = nextValue.materialImageUrl || DEFAULT_MATERIAL_IMAGE_URL;
        this.showMaterialImage = true;
      }
    }
  },
  mounted() {
    this.syncLegacyMajorSteps();
  },
  methods: {
    syncLegacyMajorSteps() {
      const raw = Array.isArray(this.value.majorSteps) ? this.value.majorSteps : [];
      const normalized = this.selectedMajorSteps;
      const changed =
        raw.length !== normalized.length || raw.some((item, idx) => item !== normalized[idx]);
      if (!changed) return;
      this.patch({
        majorSteps: normalized,
        planGenerated: normalized.length === 4 ? !!this.value.planGenerated : false,
        detailSteps: normalized.length === 4 ? this.value.detailSteps || '' : ''
      });
    },
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    selectedOrder(key) {
      const index = this.selectedMajorSteps.indexOf(key);
      return index >= 0 ? index + 1 : '';
    },
    majorItemClass(step) {
      const order = this.selectedOrder(step.key);
      return {
        selected: !!order,
        next: !order && step.key === this.nextExpectedKey
      };
    },
    selectMajorStep(step) {
      const current = [...this.selectedMajorSteps];
      const expectedKey = this.nextExpectedKey;

      if (current.includes(step.key)) {
        const selectedIndex = current.indexOf(step.key);
        const rollback = current.slice(0, selectedIndex);
        const hint = selectedIndex === 0 ? '已清空已选步骤，请重新选择' : `已回退到第 ${selectedIndex} 步`;
        this.patch({
          majorSteps: rollback,
          planGenerated: false,
          detailSteps: ''
        });
        uni.showToast({
          title: hint,
          icon: 'none'
        });
        return;
      }

      if (step.key !== expectedKey) {
        const expectedStep = this.activeMajorSteps.find((item) => item.key === expectedKey);
        uni.showToast({
          title: `请先选择：${expectedStep ? expectedStep.title : '下一步'}`,
          icon: 'none'
        });
        return;
      }

      current.push(step.key);
      this.patch({
        majorSteps: current,
        planGenerated: false,
        detailSteps: ''
      });
    },
    buildPlanText() {
      const lines = ['【实验方案设计】', `生成时间：${nowText()}`];
      this.selectedSections.forEach((section) => {
        lines.push('');
        lines.push(`${section.order}. ${section.title}`);
        section.lines.forEach((line) => lines.push(`- ${line}`));
      });
      return lines.join('\n');
    },
    generatePlanDesign() {
      if (this.selectedMajorSteps.length < 4) {
        uni.showToast({
          title: '请先按顺序完成 4 个大步骤',
          icon: 'none'
        });
        return;
      }

      const text = this.buildPlanText();
      const generatedAt = nowText();
      this.patch({
        detailSteps: text,
        planGenerated: true,
        generatedAt
      });
      this.$emit('sync-plan', {
        detailSteps: text,
        generatedAt
      });
      uni.showToast({
        title: '已同步到我的实验',
        icon: 'none',
        duration: 1400
      });
    },
    onMaterialImageError() {
      this.showMaterialImage = false;
    }
  }
};
</script>

<style scoped>
.step-card {
  background: linear-gradient(135deg, #fff9e6, #fff5f8);
  border-radius: 24rpx;
  padding: 20rpx;
  border: 2rpx solid rgba(255, 200, 87, 0.35);
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
  color: #e67e22;
  font-weight: 700;
}

.step-desc {
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #8b5a2b;
  line-height: 1.6;
}

.major-list {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.progress-card {
  margin-top: 12rpx;
  border-radius: 14rpx;
  padding: 10rpx 12rpx;
  background: #fff;
  border: 2rpx solid rgba(255, 205, 103, 0.35);
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-title {
  font-size: 22rpx;
  color: #b76a1f;
  font-weight: 700;
}

.progress-text {
  font-size: 22rpx;
  color: #2e8b57;
  font-weight: 700;
}

.progress-track {
  margin-top: 8rpx;
  height: 14rpx;
  border-radius: 999rpx;
  background: #fff3dc;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffb347, #ff8c42);
  transition: width 0.35s ease;
}

.progress-tip {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #8b5a2b;
  line-height: 1.45;
}

.major-item {
  border-radius: 14rpx;
  background: #fff;
  border: 2rpx solid rgba(255, 200, 87, 0.25);
  padding: 12rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.major-item.next {
  border-color: rgba(255, 154, 86, 0.6);
}

.major-item.selected {
  border-color: rgba(46, 139, 87, 0.55);
  background: linear-gradient(135deg, #f7fff8, #fffef8);
}

.major-order {
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #fff4df;
  color: #b76a1f;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.major-order.empty {
  color: transparent;
  background: #fff;
  border: 2rpx dashed rgba(183, 106, 31, 0.3);
}

.major-content {
  flex: 1;
  min-width: 0;
}

.major-title {
  font-size: 23rpx;
  color: #6b4521;
  line-height: 1.45;
  font-weight: 700;
}

.major-sub {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #8b5a2b;
  line-height: 1.45;
}

.major-badge {
  font-size: 20rpx;
  color: #fff;
  border-radius: 999rpx;
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, #2e8b57, #4fbf73);
  flex-shrink: 0;
}

.detail-card {
  margin-top: 14rpx;
  border-radius: 14rpx;
  background: #fff;
  border: 2rpx solid rgba(255, 200, 87, 0.22);
  padding: 12rpx;
}

.detail-title {
  font-size: 23rpx;
  color: #6a5acd;
  font-weight: 700;
}

.section-card {
  margin-top: 10rpx;
  border-radius: 12rpx;
  background: #fffdfa;
  border: 1px solid rgba(255, 200, 87, 0.3);
  padding: 10rpx;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.section-index {
  font-size: 22rpx;
  color: #2e8b57;
  font-weight: 700;
}

.section-title {
  font-size: 22rpx;
  color: #5a3a20;
  font-weight: 700;
}

.line {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #4f5b66;
  line-height: 1.55;
}

.step1-layout {
  margin-top: 10rpx;
  display: flex;
  gap: 8rpx;
  align-items: stretch;
  width: 100%;
}

.section-image {
  border-radius: 10rpx;
  border: 1px dashed rgba(79, 172, 254, 0.45);
  background: #f8fbff;
  padding: 8rpx;
  box-sizing: border-box;
}

.image-panel {
  width: 44%;
  flex-shrink: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.material-image {
  width: 100%;
  height: auto;
  min-height: 500rpx;
  flex: 1;
}

.image-fallback {
  width: 100%;
  height: auto;
  min-height: 500rpx;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6f7e90;
  font-size: 21rpx;
}

.material-table {
  border: 1px solid #d3dce8;
  border-bottom: none;
  background: #fff;
  box-sizing: border-box;
}

.step1-table {
  width: 56%;
  margin-top: 0;
}

.material-head,
.material-row {
  display: flex;
  border-bottom: 1px solid #d3dce8;
  min-height: 56rpx;
  align-items: center;
}

.material-head .col {
  background: #f3f6fa;
  font-weight: 700;
}

.col {
  font-size: 19rpx;
  color: #3f4e61;
  line-height: 1.45;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  border-right: 1px solid #d3dce8;
}

.material-row .col:last-child,
.material-head .col:last-child {
  border-right: none;
}

.name {
  width: 20%;
}

.spec {
  width: 18%;
}

.qty {
  width: 14%;
}

.use {
  width: 48%;
}

.generate-row {
  margin-top: 14rpx;
}

.generate-btn {
  width: 100%;
  border-radius: 12rpx;
  text-align: center;
  padding: 12rpx 0;
  font-size: 23rpx;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, #ff9a56, #ffcd67);
}

.sync-tip {
  margin-top: 12rpx;
  border-radius: 12rpx;
  border: 2rpx solid rgba(46, 139, 87, 0.3);
  background: #f6fff8;
  color: #2d6b43;
  font-size: 21rpx;
  line-height: 1.5;
  padding: 10rpx 12rpx;
}

@media (max-width: 720px) {
  .step1-layout {
    flex-direction: column;
    gap: 10rpx;
  }

  .image-panel,
  .step1-table {
    width: 100%;
  }

  .material-image,
  .image-fallback {
    min-height: 340rpx;
  }
}
</style>




