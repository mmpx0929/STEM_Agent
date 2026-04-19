﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🧰</text>
      <view class="step-title">⑤ 实验场景构思与材料设计</view>
    </view>
    <view class="step-desc">{{ stepDesc }}</view>

    <view class="voice-card">
      <view class="voice-title">🤔 请小朋友仔细思考一下</view>
      <view class="voice-text">{{ voiceGuideText }}</view>
    </view>

    <view class="video-block" v-if="isDirectVideoMode">
      <view class="video-wrap" v-if="directVideoItem && directVideoItem.videoUrl">
        <video
          :id="getLogicVideoId(directVideoItem.key)"
          class="guide-video"
          :src="directVideoItem.videoUrl"
          controls
          show-center-play-btn
          object-fit="contain"
          @error="handleDirectVideoError"
        />
      </view>
      <view class="video-empty" v-else>
        <text>未配置场景构思视频，请先在配置文件中设置视频地址。</text>
      </view>
      <view class="video-tip">{{ directVideoItem ? directVideoItem.content : '先看场景构思视频，再生成材料清单。' }}</view>
    </view>

    <view class="logic-list" v-else :class="{ twin: logicOptions.length === 2 }">
      <view
        class="logic-card"
        :class="{ active: isSelected(logic.key) }"
        v-for="logic in logicOptions"
        :key="logic.key"
        @click="handleLogicCardClick(logic.key)"
      >
        <view class="logic-head">
          <text class="logic-no">{{ logic.no }}</text>
          <text class="logic-title">{{ logic.title }}</text>
          <text class="logic-state" v-if="isSelected(logic.key)">已选择</text>
        </view>

        <view class="logic-video-slot" v-if="!logic.videoUrl">
          <text>🎬 视频演示位置预留（待上传）</text>
        </view>
        <view class="logic-video-wrap" v-else>
          <video
            :id="getLogicVideoId(logic.key)"
            class="logic-video"
            :src="logic.videoUrl"
            :controls="isSelected(logic.key)"
            :show-center-play-btn="isSelected(logic.key)"
            object-fit="contain"
          />
        </view>

        <view class="logic-text">{{ logic.content }}</view>
      </view>
    </view>

    <view class="ai-row" v-if="!isDirectVideoMode">
      <view class="ai-btn" @click="runAiAnalysis">
        <text class="ai-icon">🤖</text>
        <text>AI 分析设计逻辑</text>
      </view>
    </view>

    <view class="analysis-card" v-if="analysisText">
      <view class="analysis-title" :class="{ pass: value.aiChecked, fail: !value.aiChecked }">
        {{ value.aiChecked ? '分析通过：逻辑选择正确' : '分析结果：建议调整逻辑' }}
      </view>
      <view class="analysis-text">{{ analysisText }}</view>
    </view>

    <view class="materials-card" v-if="canShowMaterials">
      <view class="materials-title">📦 实验材料清单（已生成）</view>
      <view class="materials-subtitle">后续可增加语音解读与孩子手动补充。</view>

      <view class="table-head">
        <text class="col name">材料名称</text>
        <text class="col spec">规格</text>
        <text class="col qty">数量</text>
        <text class="col usage">场景应用</text>
      </view>

      <view class="table-row" v-for="(item, index) in allMaterialItems" :key="`m-${index}`">
        <input
          class="col-input name"
          :value="item.name"
          @input="updateMaterial(index, 'name', $event.detail.value)"
          placeholder="名称"
        />
        <input
          class="col-input spec"
          :value="item.spec"
          @input="updateMaterial(index, 'spec', $event.detail.value)"
          placeholder="规格"
        />
        <input
          class="col-input qty"
          :value="item.qty"
          @input="updateMaterial(index, 'qty', $event.detail.value)"
          placeholder="数量"
        />
        <input
          class="col-input usage"
          :value="item.usage"
          @input="updateMaterial(index, 'usage', $event.detail.value)"
          placeholder="场景应用"
        />
      </view>

      <view class="add-row">
        <view class="add-btn" @click="appendCustomMaterial">补充 +</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const DEFAULT_LOGIC_OPTIONS = [
  {
    key: 'logic1',
    no: '逻辑1',
    title: '旋转飞椅模型原理',
    content:
      '完全参考游乐园旋转飞椅“中心转轴旋转→带动周边座椅同步圆周转动”的原理，把洗衣机滚筒内壁看成无数个“小座椅”，湿衣物就是“座椅上的乘客”。按照这样的逻辑进行材料的选择与设计。',
    videoUrl: '',
    videoPoster: ''
  },
  {
    key: 'logic2',
    no: '逻辑2',
    title: '敞口杯手动甩动方案',
    content: '用一次性纸杯代替滚筒，湿纸巾放在杯子里面，用手不停旋转。',
    videoUrl: '',
    videoPoster: ''
  }
];

const DEFAULT_BASE_MATERIALS = [
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

const hasText = (value) => String(value || '').trim().length > 0;

const serializeMaterials = (items) =>
  (items || [])
    .map((item) => `${item.name} | ${item.spec} | ${item.qty} | ${item.usage}`)
    .join('\n');

const cloneList = (list) => (Array.isArray(list) ? list.map((item) => ({ ...item })) : []);

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
      playingVideoKey: ''
    };
  },
  computed: {
    template() {
      return getScienceFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep5() {
      return (this.template && this.template.step5) || {};
    },
    logicOptions() {
      const options = this.templateStep5.logicOptions;
      if (Array.isArray(options) && options.length > 0) return options;
      return DEFAULT_LOGIC_OPTIONS;
    },
    baseMaterials() {
      const list = this.templateStep5.baseMaterials;
      if (Array.isArray(list) && list.length > 0) return list;
      return DEFAULT_BASE_MATERIALS;
    },
    correctLogicKey() {
      return this.templateStep5.correctLogicKey || 'logic1';
    },
    voiceGuideText() {
      return this.templateStep5.voiceGuideText || '';
    },
    stepDesc() {
      return this.isDirectVideoMode
        ? '先看场景构思视频，再生成材料清单。'
        : '先选设计思路，再用 AI 帮你分析并生成材料清单。';
    },
    selectedLogicKey() {
      return this.value.sceneChoice || this.value.strategyChoice || '';
    },
    isDirectVideoMode() {
      return this.logicOptions.length === 1;
    },
    directVideoItem() {
      return this.isDirectVideoMode ? (this.logicOptions[0] || null) : null;
    },
    analysisText() {
      return (this.value.aiAnalysis && this.value.aiAnalysis.summary) || '';
    },
    canShowMaterials() {
      return this.selectedLogicKey === this.correctLogicKey;
    },
    allMaterialItems() {
      const base = Array.isArray(this.value.materialItems) ? this.value.materialItems : [];
      const custom = Array.isArray(this.value.customMaterials) ? this.value.customMaterials : [];
      return [...base, ...custom];
    }
  },
  watch: {
    selectedLogicKey: {
      handler(newKey) {
        this.$nextTick(() => {
          this.syncLogicVideos(newKey);
        });
      },
      immediate: true
    }
  },
  mounted() {
    if (this.isDirectVideoMode && !hasText(this.selectedLogicKey)) {
      const key = this.correctLogicKey || (this.logicOptions[0] && this.logicOptions[0].key) || '';
      if (key) {
        this.patch({
          strategyChoice: key,
          sceneChoice: key,
          aiChecked: true,
          aiAnalysis: {
            pass: true,
            summary: '已根据场景构思视频自动生成材料清单。',
            selectedLogic: key,
            timestamp: Date.now()
          }
        });
        this.ensureBaseMaterialsBySelection(key);
      }
    }
    this.ensureBaseMaterialsBySelection(this.selectedLogicKey);
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },

    handleDirectVideoError() {
      uni.showToast({
        title: '场景视频加载失败，请检查地址',
        icon: 'none'
      });
    },
    isSelected(key) {
      return this.selectedLogicKey === key;
    },
    handleLogicCardClick(key) {
      if (this.isDirectVideoMode) {
        this.syncLogicVideos('');
        return;
      }
      if (this.isSelected(key)) {
        if (this.playingVideoKey === key) {
          this.syncLogicVideos('');
          this.playingVideoKey = '';
          return;
        }
        this.syncLogicVideos(key);
        this.playingVideoKey = key;
        return;
      }
      this.selectLogic(key);
    },
    getLogicVideoId(key) {
      return `step5-logic-video-${key}`;
    },
    syncLogicVideos(activeKey = '') {
      this.logicOptions.forEach((logic) => {
        if (!logic || !logic.videoUrl) return;
        const ctx = uni.createVideoContext(this.getLogicVideoId(logic.key), this);
        if (!ctx) return;
        ctx.pause();
        ctx.seek(0);
      });
    },
    selectLogic(key) {
      const next = {
        strategyChoice: key,
        sceneChoice: key,
        aiChecked: false,
        aiAnalysis: null
      };

      if (key === this.correctLogicKey) {
        const baseMaterials = cloneList(this.baseMaterials);
        next.materialItems = baseMaterials;
        next.materialList = serializeMaterials(baseMaterials);
      } else {
        next.materialItems = [];
        next.materialList = '';
      }

      if (!Array.isArray(this.value.customMaterials)) {
        next.customMaterials = [];
      }

      this.patch(next);
      this.$nextTick(() => {
        this.syncLogicVideos(key);
        this.playingVideoKey = key;
      });
    },
    runAiAnalysis() {
      if (!hasText(this.selectedLogicKey)) {
        uni.showToast({
          title: '请先选择一种设计逻辑',
          icon: 'none'
        });
        return;
      }

      const pass = this.selectedLogicKey === this.correctLogicKey;
      const summary = pass
        ? '当前逻辑与本实验目标匹配，已生成材料清单。'
        : '当前逻辑不利于科学对比，建议改选正确逻辑。';

      this.patch({
        aiChecked: pass,
        aiAnalysis: {
          pass,
          summary,
          selectedLogic: this.selectedLogicKey,
          timestamp: Date.now()
        }
      });

      if (pass) {
        this.ensureBaseMaterialsBySelection(this.correctLogicKey);
      }

      uni.showToast({
        title: pass ? '分析通过，已生成材料清单' : '建议改选正确逻辑',
        icon: 'none',
        duration: 1400
      });
    },
    ensureBaseMaterialsBySelection(key) {
      if (key !== this.correctLogicKey) return;
      const baseMaterials = cloneList(this.baseMaterials);
      const existing = Array.isArray(this.value.materialItems) ? [...this.value.materialItems] : [];
      const hasBase = existing.length > 0;

      if (!hasBase) {
        this.patch({
          materialItems: baseMaterials,
          materialList: serializeMaterials(baseMaterials),
          strategyChoice: this.correctLogicKey,
          sceneChoice: this.correctLogicKey
        });
        return;
      }

      const normalized = [...existing];
      baseMaterials.forEach((item) => {
        const exists = normalized.some((it) => String(it.name || '').trim() === String(item.name || '').trim());
        if (!exists) normalized.push({ ...item });
      });

      if (normalized.length !== existing.length) {
        this.patch({
          materialItems: normalized,
          materialList: serializeMaterials(normalized),
          strategyChoice: this.correctLogicKey,
          sceneChoice: this.correctLogicKey
        });
      }
    },
    appendCustomMaterial() {
      const custom = Array.isArray(this.value.customMaterials) ? [...this.value.customMaterials] : [];
      custom.push({ name: '', spec: '', qty: '', usage: '' });
      this.patch({
        customMaterials: custom,
        extraMaterials: serializeMaterials(custom)
      });
    },
    updateMaterial(index, field, text) {
      const base = Array.isArray(this.value.materialItems) ? [...this.value.materialItems] : [];
      const custom = Array.isArray(this.value.customMaterials) ? [...this.value.customMaterials] : [];
      const baseLen = base.length;

      if (index < baseLen) {
        base[index] = { ...base[index], [field]: text };
      } else {
        const customIndex = index - baseLen;
        if (!custom[customIndex]) return;
        custom[customIndex] = { ...custom[customIndex], [field]: text };
      }

      this.patch({
        materialItems: base,
        customMaterials: custom,
        materialList: serializeMaterials(base),
        extraMaterials: serializeMaterials(custom)
      });
    }
  }
};
</script>

<style scoped>
.step-card {
  background: linear-gradient(135deg, #f0fff0, #fff5f8);
  border-radius: 24rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(152, 251, 152, 0.4);
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
  color: #2e8b57;
  font-weight: 700;
}

.step-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8b5a2b;
  line-height: 1.6;
}

.voice-card {
  margin-top: 14rpx;
  border-radius: 16rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #fff9e6, #fff0f5);
  border: 2rpx solid rgba(255, 217, 102, 0.5);
}

.voice-title {
  font-size: 23rpx;
  color: #d4a017;
  font-weight: 700;
}

.voice-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8b6914;
  line-height: 1.6;
}

.voice-btn {
  margin-top: 10rpx;
  display: inline-flex;
  max-width: 100%;
  border-radius: 999rpx;
  padding: 8rpx 14rpx;
  font-size: 21rpx;
  color: #fff;
  background: linear-gradient(135deg, #ff9a9e, #f6b73c);
}

.logic-list {
  margin-top: 14rpx;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12rpx;
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

.logic-list.twin {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.logic-card {
  border-radius: 16rpx;
  padding: 14rpx;
  background: linear-gradient(180deg, #ffffff, #fbfffc);
  border: 2rpx solid rgba(152, 251, 152, 0.25);
  box-shadow: 0 8rpx 20rpx rgba(77, 126, 94, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.logic-card:active {
  transform: scale(0.992);
}

.logic-card.active {
  border-color: #2e8b57;
  background: linear-gradient(135deg, #f5fff6, #f0f8ff);
  box-shadow: 0 12rpx 24rpx rgba(46, 139, 87, 0.14);
}

.logic-head {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.logic-no {
  border-radius: 999rpx;
  padding: 4rpx 10rpx;
  font-size: 20rpx;
  color: #fff;
  background: linear-gradient(135deg, #2e8b57, #3cb371);
}

.logic-title {
  font-size: 23rpx;
  color: #2f6b3a;
  font-weight: 700;
  flex: 1;
  min-width: 0;
}

.logic-state {
  border-radius: 999rpx;
  padding: 5rpx 12rpx;
  font-size: 17rpx;
  color: #2d7d4a;
  background: #e8f8ec;
  line-height: 1;
}

.logic-video-slot {
  margin-top: 10rpx;
  border-radius: 12rpx;
  border: 2rpx dashed rgba(46, 139, 87, 0.35);
  padding: 16rpx;
  text-align: center;
  font-size: 22rpx;
  color: #5c7b62;
  background: rgba(240, 255, 240, 0.8);
  min-height: 360rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.logic-video-wrap {
  margin-top: 10rpx;
  width: 100%;
  position: relative;
  padding-top: 56.25%;
  border-radius: 12rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #eef6ff, #f7fbff);
  box-shadow: 0 10rpx 22rpx rgba(32, 62, 101, 0.16);
}

.logic-video {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.logic-text {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #4f5b66;
  line-height: 1.6;
  padding: 4rpx 2rpx 0;
}

@media (max-width: 960px) {
  .logic-list.twin {
    grid-template-columns: 1fr;
  }
  .video-wrap {
    max-width: 100%;
  }
  .logic-video-slot {
    min-height: 240rpx;
  }
}

.ai-row {
  margin-top: 14rpx;
}

.ai-btn {
  width: 100%;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  box-sizing: border-box;
  color: #fff;
  font-size: 23rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.35);
}

.ai-icon {
  font-size: 20rpx;
}

.analysis-card {
  margin-top: 12rpx;
  border-radius: 14rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #e8f4fd, #f5fffa);
  border: 2rpx solid rgba(79, 172, 254, 0.22);
}

.analysis-title {
  font-size: 23rpx;
  font-weight: 700;
}

.analysis-title.pass {
  color: #2e8b57;
}

.analysis-title.fail {
  color: #cd5c5c;
}

.analysis-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #21507a;
  line-height: 1.6;
}

.materials-card {
  margin-top: 14rpx;
  border-radius: 16rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #fff, #f7fffa);
  border: 2rpx solid rgba(46, 139, 87, 0.2);
}

.materials-title {
  font-size: 23rpx;
  color: #2e8b57;
  font-weight: 700;
}

.materials-subtitle {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #6c7f73;
}

.table-head,
.table-row {
  margin-top: 8rpx;
  display: flex;
  gap: 8rpx;
}

.col {
  font-size: 20rpx;
  color: #2f6b3a;
  font-weight: 700;
}

.col-input {
  height: 64rpx;
  border-radius: 10rpx;
  border: 2rpx solid rgba(152, 251, 152, 0.3);
  padding: 0 10rpx;
  background: #fff;
  font-size: 21rpx;
  box-sizing: border-box;
}

.name {
  width: 20%;
}

.spec {
  width: 20%;
}

.qty {
  width: 14%;
}

.usage {
  width: 46%;
}

.add-row {
  margin-top: 10rpx;
  display: flex;
  justify-content: flex-end;
}

.add-btn {
  border-radius: 999rpx;
  padding: 8rpx 14rpx;
  font-size: 21rpx;
  color: #fff;
  background: linear-gradient(135deg, #2e8b57, #50c878);
}
</style>



