<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">♻️</text>
      <view class="step-title">⑧ 工程模型迭代与优化</view>
    </view>
    <view class="step-desc">先查看针对我们所发现的问题应该如何进行迭代优化，也可以继续添加自己的问题与解决办法，形成工程迭代闭环。</view>

    <view class="hint-box">
      <view class="hint-title">🔍 小提示</view>
      <view class="hint-text">如果你有新的发现，可以点击“我的发现”补充填写哦。</view>
    </view>

    <view class="opt-table target-status-table" v-if="isTargetStatusMode">
      <view class="opt-row head">
        <text class="opt-col target">目标</text>
        <text class="opt-col status">达标情况</text>
      </view>

      <view class="opt-row" v-for="(row, idx) in rows" :key="row.key || idx">
        <view class="opt-col target">
          <view class="fixed-text">{{ row.problem }}</view>
        </view>
        <view class="opt-col status">
          <view class="fixed-text">{{ row.solution }}</view>
        </view>
      </view>
    </view>

    <view class="opt-table" v-else>
      <view class="opt-row head">
        <text class="opt-col problem">问题结构</text>
        <text class="opt-col solution">解决方案</text>
        <text class="opt-col replace">替换结构</text>
      </view>

      <view class="opt-row" v-for="(row, idx) in rows" :key="row.key || idx">
        <view class="opt-col problem">
          <view v-if="row.locked" class="fixed-text">{{ row.problem }}</view>
          <textarea
            v-else
            class="editable problem-input"
            :value="row.problem"
            auto-height
            placeholder="填写问题结构（如：轴承、拉线动力系统）"
            @input="updateRow(idx, 'problem', $event.detail.value)"
          />
        </view>

        <view class="opt-col solution">
          <view v-if="row.locked" class="fixed-text">{{ row.solution }}</view>
          <textarea
            v-else
            class="editable"
            :value="row.solution"
            auto-height
            placeholder="填写你的解决方案..."
            @input="updateRow(idx, 'solution', $event.detail.value)"
          />
        </view>

        <view class="opt-col replace">
          <view v-if="row.locked" class="fixed-text">{{ row.replacement }}</view>
          <textarea
            v-else
            class="editable"
            :value="row.replacement"
            auto-height
            placeholder="填写你的替换结构或具体做法..."
            @input="updateRow(idx, 'replacement', $event.detail.value)"
          />

          <view v-if="!row.locked" class="row-action" @click="removeRow(idx)">删除本行</view>
        </view>
      </view>
    </view>

    <view class="btn-row" v-if="!isTargetStatusMode">
      <view class="mini-btn light" @click="addRow">+ 我的发现</view>
    </view>
  </view>
</template>

<script>
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';

const PRESET_LIBRARY = {
  bearing: {
    solutionOptions: [
      '改为更低摩擦的滚动结构，提升甩干效率',
      '优化轴承位置与同轴度，减少偏摆和阻力'
    ],
    replacementOptions: [
      '用钢球滚动轴承替换木轮滑动轴承',
      '使用低摩擦塑料轴套 + 金属轴心结构'
    ]
  },
  line: {
    solutionOptions: [
      '让转轴延伸到外盖外，外部即可快速回卷',
      '增加回卷导向结构，减少卡线和缠绕偏移'
    ],
    replacementOptions: [
      '顶部木棒改为约10cm长轴，并在瓶盖打孔',
      '加入导线环或导向槽，稳定拉线路径'
    ]
  },
  install: {
    solutionOptions: [
      '统一长轴与导向结构，降低安装对准难度',
      '增加定位点，让脱水桶安装一插即对位'
    ],
    replacementOptions: [
      '沿用“长轴 + 外部卷线”一体化方案',
      '增加轴承定位环，替换手动对准方式'
    ]
  },
  default: {
    solutionOptions: [
      '先定位问题原因，再用更稳定结构替换',
      '先做低成本小改动，再测试是否有效'
    ],
    replacementOptions: [
      '替换为更稳定、易安装、低摩擦的结构',
      '替换为孩子更容易操作和更安全的结构'
    ]
  }
};

const defaultRows = () => ([
  {
    key: `bearing-${Date.now()}`,
    problem: '使用木轮作为轴承，摩擦力偏大，转动费力',
    solution: '',
    replacement: ''
  },
  {
    key: `line-${Date.now() + 1}`,
    problem: '拉线拉完后回卷不便，需要频繁开盖处理',
    solution: '',
    replacement: ''
  },
  {
    key: `install-${Date.now() + 2}`,
    problem: '脱水桶安装时转轴难对准轴承',
    solution: '',
    replacement: ''
  }
]);

const detectPresetKey = (problemText) => {
  const text = String(problemText || '');
  if (text.includes('轴承') || text.includes('木轮') || text.includes('摩擦')) return 'bearing';
  if (text.includes('拉线') || text.includes('回卷') || text.includes('卷线')) return 'line';
  if (text.includes('安装') || text.includes('对准') || text.includes('脱水桶')) return 'install';
  return 'default';
};

const fillPresetDefaults = (row) => {
  const key = detectPresetKey(row && row.problem);
  const preset = PRESET_LIBRARY[key] || PRESET_LIBRARY.default;
  return {
    ...row,
    solution: row && row.solution ? row.solution : (preset.solutionOptions[0] || ''),
    replacement: row && row.replacement ? row.replacement : (preset.replacementOptions[0] || '')
  };
};

const lockRow = (row) => ({
  ...row,
  locked: true
});

const clone = (v) => JSON.parse(JSON.stringify(v));

const isStep7DerivedRows = (rows) => Array.isArray(rows)
  && rows.length > 0
  && rows.every((row) => {
    const key = String((row && row.key) || '');
    return key.startsWith('s7-') || /^row-\d+/.test(key);
  });

export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    experiment: {
      type: Object,
      default: () => ({})
    },
    flowData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    rows() {
      return Array.isArray(this.value.optimizationRows) ? this.value.optimizationRows : [];
    },
    templateRows() {
      const tpl = getEngineeringFlowTemplate(this.experiment && this.experiment.id);
      return (tpl.step8 && tpl.step8.optimizationRows) || [];
    },
    isTargetStatusMode() {
      const tpl = getEngineeringFlowTemplate(this.experiment && this.experiment.id);
      return !!(tpl.step8 && tpl.step8.displayMode === 'targetStatus');
    }
  },
  mounted() {
    const fromTemplate = this.getRowsFromTemplate();
    if (this.isTargetStatusMode && fromTemplate.length > 0) {
      const original = JSON.stringify(this.value.optimizationRows || []);
      const normalized = JSON.stringify(fromTemplate);
      if (original !== normalized) {
        this.patch({ optimizationRows: fromTemplate });
      }
      return;
    }
    if (!Array.isArray(this.value.optimizationRows) || this.value.optimizationRows.length === 0) {
      const fromStep7 = this.getRowsFromStep7();
      const rows = fromTemplate.length > 0 ? fromTemplate : (fromStep7.length > 0 ? fromStep7 : defaultRows());
      this.patch({ optimizationRows: rows.map(fillPresetDefaults) });
      return;
    }
    if (fromTemplate.length > 0 && isStep7DerivedRows(this.value.optimizationRows)) {
      this.patch({ optimizationRows: fromTemplate.map(fillPresetDefaults) });
      return;
    }
    const templateKeys = new Set(fromTemplate.map((row) => row && row.key).filter((key) => !!key));
    const normalizedRows = this.value.optimizationRows
      .map(fillPresetDefaults)
      .map((row) => (templateKeys.has(row && row.key) ? lockRow(row) : row));
    const original = JSON.stringify(this.value.optimizationRows);
    const normalized = JSON.stringify(normalizedRows);
    if (original !== normalized) {
      this.patch({ optimizationRows: normalizedRows });
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    getRowsFromTemplate() {
      if (!Array.isArray(this.templateRows)) return [];
      const rows = this.templateRows
        .map((item, idx) => ({
          key: item.key || `tpl-${Date.now()}-${idx}`,
          problem: item.problem || '',
          solution: item.solution || '',
          replacement: item.replacement || '',
          displayMode: this.isTargetStatusMode ? 'targetStatus' : (item.displayMode || ''),
          locked: true
        }))
        .filter((item) => String(item.problem || item.solution || '').trim().length > 0);
      if (this.isTargetStatusMode) {
        return rows.map(lockRow);
      }
      return rows.map(fillPresetDefaults).map(lockRow);
    },
    getRowsFromStep7() {
      const rows = this.flowData && this.flowData.step7 && Array.isArray(this.flowData.step7.analysisRows)
        ? this.flowData.step7.analysisRows
        : [];
      return rows
        .map((item, idx) => ({
          key: item.id || `s7-${Date.now()}-${idx}`,
          problem: item.structure || item.problem || '',
          solution: '',
          replacement: ''
        }))
        .map(fillPresetDefaults)
        .filter((item) => String(item.problem || '').trim().length > 0);
    },
    updateRow(index, field, val) {
      const list = clone(this.rows);
      if (!list[index]) return;
      list[index] = { ...list[index], [field]: val };
      this.patch({ optimizationRows: list });
    },
    addRow() {
      const list = clone(this.rows);
      list.push({
        key: `custom-${Date.now()}`,
        problem: '',
        solution: '',
        replacement: '',
        locked: false
      });
      this.patch({ optimizationRows: list });
    },
    removeRow(index) {
      const list = clone(this.rows);
      if (list[index] && list[index].locked) {
        uni.showToast({ title: '默认内容不能删除', icon: 'none' });
        return;
      }
      if (list.length <= 1) {
        uni.showToast({ title: '至少保留一行', icon: 'none' });
        return;
      }
      list.splice(index, 1);
      this.patch({ optimizationRows: list });
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
.hint-box {
  margin-top: 10rpx;
  background: #fff8eb;
  border: 1rpx solid #f2ddb0;
  border-radius: 10rpx;
  padding: 8rpx 10rpx;
}
.hint-title {
  font-size: 21rpx;
  color: #7b5f20;
  font-weight: 700;
}
.hint-text {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #8b6a2b;
  line-height: 1.6;
}
.opt-table {
  margin-top: 12rpx;
  border: 1rpx solid #b8cfea;
  border-bottom: none;
}
.opt-row {
  display: flex;
  border-bottom: 1rpx solid #b8cfea;
}
.opt-row.head {
  background: #edf5ff;
}
.opt-col {
  border-right: 1rpx solid #b8cfea;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  font-size: 21rpx;
  color: #3c608d;
  line-height: 1.55;
}
.opt-col:last-child {
  border-right: none;
}
.opt-col.problem {
  width: 24%;
}
.opt-col.solution {
  width: 38%;
}
.opt-col.replace {
  width: 38%;
}
.opt-col.target {
  width: 22%;
  text-align: center;
  font-weight: 700;
}
.opt-col.status {
  width: 78%;
}
.target-status-table .fixed-text {
  min-height: 0;
}
.fixed-text {
  min-height: 72rpx;
  color: #335b86;
  font-size: 20rpx;
  line-height: 1.6;
  white-space: pre-wrap;
}
.editable {
  background: #fff;
  min-height: 96rpx;
  border: 1rpx solid #d0dff3;
  border-radius: 8rpx;
  padding: 8rpx;
  box-sizing: border-box;
  width: 100%;
  font-size: 20rpx;
  color: #466a95;
}
.problem-input {
  min-height: 84rpx;
}
.row-action {
  margin-top: 8rpx;
  font-size: 18rpx;
  color: #c65555;
  text-align: right;
}
.btn-row {
  margin-top: 10rpx;
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}
.mini-btn {
  font-size: 21rpx;
  color: #fff;
  background: linear-gradient(135deg, #53a2ff, #5f89ff);
  border-radius: 999rpx;
  padding: 6rpx 14rpx;
}
.mini-btn.light {
  background: linear-gradient(135deg, #65c8a0, #59b986);
}

@media (max-width: 960px) {
  .opt-col.problem {
    width: 30%;
  }
  .opt-col.solution,
  .opt-col.replace {
    width: 35%;
  }
}
</style>
