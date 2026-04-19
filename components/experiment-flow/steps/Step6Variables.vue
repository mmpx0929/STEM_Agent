<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">📌</text>
      <view class="step-title">⑥ 变量设计</view>
    </view>
    <view class="step-desc">先完成变量选择，再进入下一步实验流程。</view>

    <view class="intro-card">
      <view class="intro-title">{{ introTitle }}</view>
      <view class="intro-line" v-for="(line, index) in introLines" :key="`intro-${index}`">{{ line }}</view>
    </view>

    <view class="table-card">
      <view class="table-title">变量控制设置表（点击变量材料进行选择）</view>
      <view class="grid-table">
        <view class="row head">
          <text class="cell type">变量类型</text>
          <text class="cell def">定义</text>
          <text class="cell material">变量材料</text>
          <text class="cell content">变量内容</text>
        </view>

        <view class="row" v-for="row in variableRows" :key="row.typeKey">
          <view class="cell type type-cell">
            <text class="type-index">{{ row.order }}</text>
            <text class="type-label">{{ row.label }}</text>
          </view>
          <text class="cell def">{{ row.definition }}</text>
          <view class="cell material pick-cell" :class="statusClass(row.typeKey)" @click="openPicker(row.typeKey)">
            <text class="pick-value">{{ row.material }}</text>
            <text class="picker-tag">{{ row.material === '待选择' ? '选择' : '更换' }}</text>
          </view>
          <view class="cell content pick-cell" :class="statusClass(row.typeKey)" @click="openPicker(row.typeKey)">
            <text class="pick-value">{{ row.content }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="ai-row">
      <view class="ai-btn" @click="runAiAnalysis">
        <text class="ai-icon">🤖</text>
        <text>AI 分析选择结果</text>
      </view>
    </view>

    <view class="analysis-card" v-if="analysisText">
      <view class="analysis-title" :class="{ pass: value.aiChecked, fail: !value.aiChecked }">
        {{ value.aiChecked ? '分析通过：变量选择正确' : '分析结果：还需要调整' }}
      </view>
      <view class="analysis-text">{{ analysisText }}</view>
      <view class="analysis-list" v-if="analysisDetails.length > 0">
        <view class="analysis-item" v-for="(item, index) in analysisDetails" :key="`a-${index}`">- {{ item }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const DEFAULT_CORRECT_MAP = {
  independent: 'motor_speed',
  dependent: 'star_distance',
  control: 'stick_rope_size'
};

const DEFAULT_OPTION_LIST = [
  { key: 'motor_speed', material: '电机', content: '电机旋转速度从低到高' },
  { key: 'star_distance', material: '五角星', content: '五角星飞行远近、高低的变化' },
  { key: 'stick_rope_size', material: '木棒、毛线', content: '木棒、毛线的长短，大小，重量' }
];

const DEFAULT_TYPE_ROWS = [
  { typeKey: 'independent', label: '自变量', definition: '你主动改变的条件（例如把速度调慢或调快）' },
  { typeKey: 'dependent', label: '因变量', definition: '会跟着变化、需要观察和记录的结果' },
  { typeKey: 'control', label: '不变量', definition: '每次都保持不变的条件（保证对比公平）' }
];

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
      return getScienceFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep6() {
      return (this.template && this.template.step6) || {};
    },
    introTitle() {
      return this.templateStep6.introTitle || '先明确三类变量，再开始实验';
    },
    introLines() {
      const lines = this.templateStep6.introLines;
      if (Array.isArray(lines) && lines.length > 0) return lines;
      return [
        '自变量：你要主动改变的条件。比如本实验中，把电机速度从低调到高，就是在改变自变量。',
        '因变量：会随着自变量变化而变化的结果。比如五角星飞得高不高、远不远，就是因变量。',
        '不变量：每次都要保持一致的条件。比如材料大小、连接方式、观察时间保持一致，实验结果才公平、可比较。'
      ];
    },
    optionList() {
      const list = this.templateStep6.optionList;
      if (Array.isArray(list) && list.length > 0) return list;
      return DEFAULT_OPTION_LIST;
    },
    typeRows() {
      const rows = this.templateStep6.typeRows;
      if (Array.isArray(rows) && rows.length > 0) return rows;
      return DEFAULT_TYPE_ROWS;
    },
    correctMap() {
      return {
        ...DEFAULT_CORRECT_MAP,
        ...(this.templateStep6.correctMap || {})
      };
    },
    selectionMap() {
      const map = this.value.selectionMap || {};
      return {
        independent: map.independent || '',
        dependent: map.dependent || '',
        control: map.control || ''
      };
    },
    variableRows() {
      return this.typeRows.map((row, index) => {
        const selectedKey = this.selectionMap[row.typeKey];
        const option = this.findOption(selectedKey);
        return {
          ...row,
          order: index + 1,
          selectedKey,
          material: option ? option.material : '待选择',
          content: option ? option.content : '待选择'
        };
      });
    },
    analysisText() {
      return (this.value.aiAnalysis && this.value.aiAnalysis.summary) || '';
    },
    analysisDetails() {
      return (this.value.aiAnalysis && this.value.aiAnalysis.details) || [];
    }
  },
  methods: {
    findOption(key) {
      return this.optionList.find((item) => item.key === key) || null;
    },
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    statusClass(typeKey) {
      if (!this.value.aiAnalysis) return '';
      return this.selectionMap[typeKey] === this.correctMap[typeKey] ? 'correct' : 'wrong';
    },
    openPicker(typeKey) {
      const itemList = this.optionList.map((item, index) => `${index + 1}. ${item.material}：${item.content}`);
      uni.showActionSheet({
        itemList,
        success: (res) => {
          const option = this.optionList[res.tapIndex];
          if (!option) return;
          this.applyPick(typeKey, option.key);
        }
      });
    },
    applyPick(typeKey, optionKey) {
      const nextMap = {
        ...this.selectionMap,
        [typeKey]: optionKey
      };
      const autoPass =
        nextMap.independent === this.correctMap.independent &&
        nextMap.dependent === this.correctMap.dependent &&
        nextMap.control === this.correctMap.control;

      const independentOption = this.findOption(nextMap.independent);
      const dependentOption = this.findOption(nextMap.dependent);
      const controlOption = this.findOption(nextMap.control);

      this.patch({
        selectionMap: nextMap,
        selectedIndependentKey: nextMap.independent || '',
        independentVariable: independentOption ? independentOption.content : '',
        dependentVariable: dependentOption ? dependentOption.content : '',
        controlVariable: controlOption ? controlOption.content : '',
        aiChecked: autoPass,
        aiAnalysis: autoPass
          ? {
              pass: true,
              summary: '你已经把三类变量都配对正确了，可以进入下一步。',
              details: [],
              timestamp: Date.now()
            }
          : null
      });

      if (autoPass) {
        uni.showToast({
          title: '变量配对正确，可进入下一步',
          icon: 'none'
        });
      }
    },
    runAiAnalysis() {
      const map = this.selectionMap;
      const details = [];

      if (!map.independent) details.push('自变量还没有选择。');
      if (!map.dependent) details.push('因变量还没有选择。');
      if (!map.control) details.push('不变量还没有选择。');

      if (details.length === 0) {
        if (map.independent !== this.correctMap.independent) {
          const right = this.findOption(this.correctMap.independent);
          details.push(`自变量应选择“${right ? `${right.material}（${right.content}）` : this.correctMap.independent}”。`);
        }
        if (map.dependent !== this.correctMap.dependent) {
          const right = this.findOption(this.correctMap.dependent);
          details.push(`因变量应选择“${right ? `${right.material}（${right.content}）` : this.correctMap.dependent}”。`);
        }
        if (map.control !== this.correctMap.control) {
          const right = this.findOption(this.correctMap.control);
          details.push(`不变量应选择“${right ? `${right.material}（${right.content}）` : this.correctMap.control}”。`);
        }
      }

      const pass = details.length === 0;
      const summary = pass
        ? '你已经正确区分了自变量、因变量和不变量，可以进入下一步。'
        : '还差一点点，按提示调整后再点一次 AI 分析。';

      this.patch({
        aiChecked: pass,
        aiAnalysis: {
          pass,
          summary,
          details,
          timestamp: Date.now()
        }
      });

      uni.showToast({
        title: pass ? '分析通过，可进入下一步' : '请根据提示继续调整',
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.step-card {
  background: #f6f9fe;
  border: 1px solid #dbe5f2;
  border-radius: 12rpx;
  padding: 10rpx;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 6rpx;
}

.step-icon {
  font-size: 28rpx;
}

.step-title {
  font-size: 28rpx;
  color: #2b7c5b;
  font-weight: 700;
}

.step-desc {
  margin-bottom: 8rpx;
  font-size: 20rpx;
  color: #4d627a;
  line-height: 1.45;
}

.intro-card,
.table-card,
.analysis-card {
  background: #fff;
  border: 1px solid #d4deea;
  border-radius: 10rpx;
  padding: 8rpx;
  margin-bottom: 10rpx;
}

.intro-title,
.table-title {
  font-size: 22rpx;
  color: #2b4668;
  font-weight: 700;
}

.intro-line {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #4f5f72;
  line-height: 1.5;
}

.grid-table {
  margin-top: 6rpx;
  border: 1px solid #ccd7e6;
  border-radius: 8rpx;
  overflow: hidden;
  border-bottom: none;
}

.row {
  display: flex;
  border-bottom: 1px solid #ccd7e6;
  min-height: 62rpx;
}

.row.head .cell {
  background: #f1f5fa;
  font-weight: 700;
  justify-content: center;
}

.cell {
  padding: 6rpx 8rpx;
  box-sizing: border-box;
  font-size: 20rpx;
  color: #2f4359;
  line-height: 1.45;
  display: flex;
  align-items: center;
  word-break: break-all;
}

.type {
  width: 18%;
  border-right: 1px solid #ccd7e6;
}

.type-cell {
  gap: 6rpx;
}

.type-index {
  width: 28rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: #e8f1ff;
  color: #2f6ee6;
  font-size: 18rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-label {
  flex: 1;
}

.def {
  width: 24%;
  border-right: 1px solid #ccd7e6;
}

.material {
  width: 20%;
  border-right: 1px solid #ccd7e6;
}

.content {
  width: 38%;
}

.pick-cell {
  position: relative;
  justify-content: space-between;
  gap: 8rpx;
}

.picker-tag {
  min-width: 56rpx;
  height: 30rpx;
  padding: 0 8rpx;
  border-radius: 999rpx;
  border: 1px solid #9eb0c8;
  background: #fff;
  color: #3a4f67;
  font-size: 17rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pick-value {
  flex: 1;
}

.pick-cell.correct {
  background: #f3fff6;
}

.pick-cell.wrong {
  background: #fff8f1;
}

.ai-row {
  margin-bottom: 10rpx;
}

.ai-btn {
  width: 100%;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 10rpx;
  box-sizing: border-box;
  color: #fff;
  font-size: 21rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #4facfe, #00d2ff);
}

.ai-icon {
  font-size: 18rpx;
}

.analysis-title {
  font-size: 21rpx;
  font-weight: 700;
}

.analysis-title.pass {
  color: #2e8b57;
}

.analysis-title.fail {
  color: #c0504d;
}

.analysis-text {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #465f7a;
  line-height: 1.5;
}

.analysis-list {
  margin-top: 4rpx;
}

.analysis-item {
  font-size: 20rpx;
  color: #8b5a2b;
  line-height: 1.45;
}
</style>



