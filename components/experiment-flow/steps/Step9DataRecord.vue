<template>
  <view class="step-card">
    <view class="step-header">
      <view class="step-title">{{ i18n.title }}</view>
      <view class="step-desc">{{ i18n.desc }}</view>
    </view>

    <view class="section">
      <view class="section-title">{{ i18n.qualitativeTitle }}</view>
      <view class="section-subtitle">{{ i18n.qualitativeTip }}</view>

      <view class="table-wrap">
        <view class="table-row table-head">
          <view class="cell left">{{ i18n.colIndependent }}</view>
          <view class="cell right">{{ i18n.colDependent }}</view>
        </view>

        <view class="table-row">
          <view class="cell left">{{ i18n.speedSlow }}</view>
          <view class="cell right">
            <picker
              class="picker"
              :range="slowOptionLabels"
              @change="onPickObservation('slow', $event)"
            >
              <view class="picker-text">{{ slowSelectedText || i18n.pickPlaceholder }}</view>
            </picker>
          </view>
        </view>

        <view class="table-row">
          <view class="cell left">{{ i18n.speedFast }}</view>
          <view class="cell right">
            <picker
              class="picker"
              :range="fastOptionLabels"
              @change="onPickObservation('fast', $event)"
            >
              <view class="picker-text">{{ fastSelectedText || i18n.pickPlaceholder }}</view>
            </picker>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">{{ i18n.findingTitle }}</view>
      <view class="section-subtitle">{{ i18n.findingTip }}</view>
      <textarea
        class="step-textarea"
        :value="value.findings"
        @input="onFindingInput"
        :placeholder="i18n.findingPlaceholder"
      />
    </view>

    <view class="section">
      <view class="section-title">{{ i18n.aiDialogTitle }}</view>
      <view class="section-subtitle">{{ i18n.aiDialogTip }}</view>

      <view class="dialog-wrap">
        <view v-if="aiAnalysisText" class="dialog-item assistant">
          <view class="dialog-role">AI</view>
          <view class="dialog-text">{{ aiAnalysisText }}</view>
        </view>
        <view v-else class="dialog-empty">
          {{ i18n.aiDialogEmpty }}
        </view>
      </view>

      <view class="btn-row dialog-btn-row">
        <view class="mini-btn" @click="analyzeWithAI">{{ i18n.aiAnalyzeBtn }}</view>
      </view>
    </view>

    <view class="section">
      <view class="btn-row">
        <view class="btn primary" @click="generateDataSheet">{{ i18n.generateBtn }}</view>
      </view>
      <view v-if="value.generatedAt" class="generated-tip">{{ i18n.generatedAt }}{{ value.generatedAt }}</view>
    </view>

    <view class="section preview-section" v-if="value.qualitativeRecord || value.findings">
      <view class="section-title">{{ i18n.previewTitle }}</view>
      <view class="preview-block">
        <view class="preview-label">{{ i18n.previewQualitative }}</view>
        <view class="preview-content">{{ value.qualitativeRecord || i18n.notFilled }}</view>
      </view>
      <view class="preview-block">
        <view class="preview-label">{{ i18n.previewFinding }}</view>
        <view class="preview-content">{{ value.findings || i18n.notFilled }}</view>
      </view>
    </view>

    <view class="section">
      <view class="btn-row">
        <view class="btn next" @click="goNext">{{ i18n.nextBtn }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const BASE_I18N = {
  title: '\u2468 \u6570\u636e\u8bb0\u5f55\u4e0e\u5206\u6790',
  desc: '\u8bb0\u5f55\u4e0d\u540c\u65cb\u8f6c\u901f\u5ea6\u4e0b\u7684\u73b0\u8c61\uff0c\u751f\u6210\u6570\u636e\u8bb0\u5f55\u8868\u5e76\u540c\u6b65\u5230\u201c\u6211\u7684\u5b9e\u9a8c\u201d\u3002',
  qualitativeTitle: '\u5b9a\u6027\u6570\u636e\u8bb0\u5f55',
  qualitativeTip: '\u4ece\u4e0b\u65b9\u4e3a\u201c\u65cb\u8f6c\u901f\u5ea6\u201d\u9009\u62e9\u5bf9\u5e94\u7684\u56e0\u53d8\u91cf\u73b0\u8c61\u3002',
  colIndependent: '\u65cb\u8f6c\u901f\u5ea6\uff08\u81ea\u53d8\u91cf\uff09',
  colDependent: '\u56e0\u53d8\u91cf\u89c2\u5bdf\u72b6\u6001',
  speedSlow: '\u65cb\u8f6c\u901f\u5ea6\u6162',
  speedFast: '\u65cb\u8f6c\u901f\u5ea6\u5feb',
  pickPlaceholder: '\u8bf7\u9009\u62e9\u89c2\u5bdf\u7ed3\u679c',
  findingTitle: '\u5173\u952e\u53d1\u73b0',
  findingTip: '\u53ef\u4ee5\u5728\u81ea\u52a8\u751f\u6210\u57fa\u7840\u4e0a\uff0c\u518d\u8865\u5145\u4f60\u7684\u5206\u6790\u3002',
  findingPlaceholder: '\u8bf7\u8865\u5145\u4f60\u7684\u5173\u952e\u53d1\u73b0...',
  aiDialogTitle: 'AI 数据分析',
  aiDialogTip: '点击按钮后，AI会根据上方数据表格和你填写的关键发现生成分析。',
  aiDialogEmpty: '还没有分析结果，点击“AI分析实验数据”开始。',
  aiAnalyzeBtn: 'AI分析实验数据',
  generateBtn: '\u751f\u6210\u6570\u636e\u8bb0\u5f55\u4e0e\u5206\u6790\u8868',
  generatedAt: '\u6700\u540e\u751f\u6210\u65f6\u95f4\uff1a',
  previewTitle: '\u751f\u6210\u9884\u89c8',
  previewQualitative: '\u5b9a\u6027\u6570\u636e\u8bb0\u5f55',
  previewFinding: '\u5173\u952e\u53d1\u73b0',
  nextBtn: '\u8fdb\u5165\u4e0b\u4e00\u6b65\uff1a\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a',
  notFilled: '\u672a\u586b\u5199',
  chooseBoth: '\u8bf7\u5148\u5b8c\u6210\u4e24\u884c\u89c2\u5bdf\u7ed3\u679c\u9009\u62e9',
  generatedToast: '\u5df2\u751f\u6210\u5e76\u540c\u6b65\u5230\u201c\u6211\u7684\u5b9e\u9a8c\u00b7\u6570\u636e\u8bb0\u5f55\u201d',
  nextBlocked: '\u8bf7\u5148\u751f\u6210\u6570\u636e\u8bb0\u5f55\u4e0e\u5206\u6790\u8868',
  aiNeedSelection: '请先完成快/慢两行观察选择，再进行AI分析'
};

const DEFAULT_SLOW_OPTIONS = [
  '五角星往外飞出去了一点点，比起以前的位置飞高了一点点。',
  '五角星几乎没有变化，一直停在原来的位置。',
  '五角星往外飞出去了很多，比起以前的位置飞高了很多。'
];

const DEFAULT_FAST_OPTIONS = [
  '五角星往外飞出去了很多，比起以前的位置飞高了很多。',
  '五角星只飞出去一点点，变化不大。',
  '五角星向中间靠近，飞行高度变低。'
];

const DEFAULT_FINDING =
  '数据验证了离心力原理：更高的旋转速度产生更大的离心力，导致物体飞得更高更远。';

const hasText = (value) => String(value || '').trim().length > 0;

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
    experiment: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    template() {
      return getScienceFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep9() {
      return (this.template && this.template.step9) || {};
    },
    i18n() {
      const independentLabel = this.templateStep9.independentVariableLabel || '旋转速度';
      const dependentLabel = this.templateStep9.dependentVariableLabel || '因变量观察状态';
      return {
        ...BASE_I18N,
        colIndependent: `${independentLabel}（自变量）`,
        colDependent: `${dependentLabel}（因变量）`,
        speedSlow: this.templateStep9.speedSlowLabel || BASE_I18N.speedSlow,
        speedFast: this.templateStep9.speedFastLabel || BASE_I18N.speedFast,
        findingPlaceholder: this.templateStep9.defaultFinding || BASE_I18N.findingPlaceholder
      };
    },
    slowOptionLabels() {
      const options = this.templateStep9.slowOptions;
      if (Array.isArray(options) && options.length > 0) return options;
      return DEFAULT_SLOW_OPTIONS;
    },
    fastOptionLabels() {
      const options = this.templateStep9.fastOptions;
      if (Array.isArray(options) && options.length > 0) return options;
      return DEFAULT_FAST_OPTIONS;
    },
    expectedOptionIndex() {
      const expected = this.templateStep9.expected || {};
      return {
        slow: Number.isFinite(Number(expected.slow)) ? Number(expected.slow) : 0,
        fast: Number.isFinite(Number(expected.fast)) ? Number(expected.fast) : 0
      };
    },
    defaultFinding() {
      return this.templateStep9.defaultFinding || DEFAULT_FINDING;
    },
    slowSelectedText() {
      return this.value.slowObservationChoice || '';
    },
    fastSelectedText() {
      return this.value.fastObservationChoice || '';
    },
    aiAnalysisText() {
      return String(this.value.aiDataAnalysis || '').trim();
    }
  },
  mounted() {
    this.ensureInitState();
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    ensureInitState() {
      const payload = {};
      if (!hasText(this.value.independentVariableLabel)) {
        payload.independentVariableLabel = this.templateStep9.independentVariableLabel || '旋转速度';
      }
      if (!hasText(this.value.dependentVariableLabel)) {
        payload.dependentVariableLabel = this.templateStep9.dependentVariableLabel || '因变量观察状态';
      }
      if (!hasText(this.value.slowObservationChoice)) payload.slowObservationChoice = '';
      if (!hasText(this.value.fastObservationChoice)) payload.fastObservationChoice = '';
      if (typeof this.value.analysisGenerated !== 'boolean') payload.analysisGenerated = false;
      if (!hasText(this.value.generatedAt)) payload.generatedAt = '';
      if (!hasText(this.value.aiDataAnalysis)) payload.aiDataAnalysis = '';
      if (Object.keys(payload).length > 0) this.patch(payload);
    },
    onFindingInput(event) {
      const findings = event && event.detail ? event.detail.value : '';
      this.patch({ findings, analysisGenerated: false, generatedAt: '', aiDataAnalysis: '' });
    },
    onPickObservation(type, event) {
      const index = Number(event && event.detail && event.detail.value);
      if (!Number.isFinite(index) || index < 0) return;
      if (type === 'slow') {
        this.patch({
          slowObservationChoice: this.slowOptionLabels[index],
          analysisGenerated: false,
          generatedAt: '',
          aiDataAnalysis: ''
        });
        return;
      }
      this.patch({
        fastObservationChoice: this.fastOptionLabels[index],
        analysisGenerated: false,
        generatedAt: '',
        aiDataAnalysis: ''
      });
    },
    composeQualitativeRecord() {
      const independent = this.value.independentVariableLabel || this.i18n.colIndependent;
      const dependent = this.value.dependentVariableLabel || this.i18n.colDependent;
      const slow = this.value.slowObservationChoice || '';
      const fast = this.value.fastObservationChoice || '';
      return [
        `自变量：${independent}`,
        `因变量：${dependent}`,
        '',
        `${this.i18n.speedSlow}：${slow}`,
        `${this.i18n.speedFast}：${fast}`
      ].join('\n');
    },
    composeFindings() {
      const typed = String(this.value.findings || '').trim();
      if (typed) return typed;
      const slow = this.value.slowObservationChoice || '';
      const fast = this.value.fastObservationChoice || '';
      const slowExpected = this.slowOptionLabels[this.expectedOptionIndex.slow] || '';
      const fastExpected = this.fastOptionLabels[this.expectedOptionIndex.fast] || '';
      if (slow === slowExpected && fast === fastExpected) return this.defaultFinding;
      return '变量变化会影响观察结果，请结合记录继续完善你的分析。';
    },
    buildDataTrendAnalysis(slow, fast) {
      const slowExpected = this.slowOptionLabels[this.expectedOptionIndex.slow] || '';
      const fastExpected = this.fastOptionLabels[this.expectedOptionIndex.fast] || '';
      const exactMatch = slow === slowExpected && fast === fastExpected;

      if (exactMatch) {
        return {
          judge: '快慢数据呈现出“转速越快，现象越明显”的趋势，符合离心作用增强规律。',
          supportLevel: '高',
          suggestion: '数据趋势清晰，可在关键发现中明确写出“转速提升 -> 飞行更高更远 -> 离心作用更明显”。'
        };
      }

      if (slow === fast) {
        return {
          judge: '快慢两组现象几乎相同，当前数据趋势不明显。',
          supportLevel: '低',
          suggestion: '建议回看实验过程，重新记录快慢转速下的差异现象，再进行分析。'
        };
      }

      return {
        judge: '快慢两组现象有差异，但与预期结论仍存在偏差。',
        supportLevel: '中',
        suggestion: '建议补充更具体的对比描述（如飞出高度、远近变化），让结论更有证据支撑。'
      };
    },
    buildFindingConsistency(typedFinding, trend) {
      if (!hasText(typedFinding)) {
        return '你还没有填写关键发现，建议先补充“数据现象 + 原理解释”的一句话结论。';
      }

      const text = String(typedFinding);
      const keywords = ['转速', '离心', '更快', '更高', '更远', '甩', '变化', '外侧'];
      const hitCount = keywords.reduce((sum, key) => sum + (text.includes(key) ? 1 : 0), 0);

      if (trend.supportLevel === '高' && hitCount >= 2) {
        return '你的关键发现与数据趋势匹配度较高，表达较完整。';
      }
      if (trend.supportLevel === '低') {
        return '当前关键发现与数据趋势支撑不足，建议先修正表格记录后再完善结论。';
      }
      if (hitCount >= 2) {
        return '关键发现方向基本正确，建议再补充“快慢对比”的证据描述。';
      }
      return '关键发现文字较笼统，建议加入“转速变化”和“现象变化”的对应关系。';
    },
    analyzeWithAI() {
      if (!hasText(this.value.slowObservationChoice) || !hasText(this.value.fastObservationChoice)) {
        uni.showToast({ title: this.i18n.aiNeedSelection, icon: 'none' });
        return;
      }
      const slow = this.value.slowObservationChoice || '';
      const fast = this.value.fastObservationChoice || '';
      const typedFinding = String(this.value.findings || '').trim();
      const trend = this.buildDataTrendAnalysis(slow, fast);
      const findingReview = this.buildFindingConsistency(typedFinding, trend);

      const lines = [
        '数据记录分析：',
        `- ${this.i18n.speedSlow}：${slow}`,
        `- ${this.i18n.speedFast}：${fast}`,
        '',
        `数据判断：${trend.judge}`,
        `证据强度：${trend.supportLevel}`,
        '',
        `关键发现核对：${findingReview}`
      ];

      if (hasText(typedFinding)) {
        lines.push(`当前关键发现：${typedFinding}`);
      }

      lines.push(`改进建议：${trend.suggestion}`);
      lines.push('给小朋友的话：转得越快，离心作用通常越明显，物体更容易往外飞。');

      this.patch({
        aiDataAnalysis: lines.join('\n'),
        analysisGenerated: false
      });
    },
    generateDataSheet() {
      if (!hasText(this.value.slowObservationChoice) || !hasText(this.value.fastObservationChoice)) {
        uni.showToast({ title: this.i18n.chooseBoth, icon: 'none' });
        return;
      }
      const generatedAt = nowText();
      const payload = {
        qualitativeRecord: this.composeQualitativeRecord(),
        findings: this.composeFindings(),
        analysisGenerated: true,
        generatedAt
      };
      this.patch(payload);
      this.$emit('sync-step9', {
        generatedAt,
        qualitativeRecord: payload.qualitativeRecord,
        findings: payload.findings,
        independentVariableLabel: this.value.independentVariableLabel || (this.templateStep9.independentVariableLabel || '旋转速度'),
        dependentVariableLabel: this.value.dependentVariableLabel || (this.templateStep9.dependentVariableLabel || '因变量观察状态'),
        slowObservationChoice: this.value.slowObservationChoice || '',
        fastObservationChoice: this.value.fastObservationChoice || ''
      });
      uni.showToast({ title: this.i18n.generatedToast, icon: 'none' });
    },
    goNext() {
      if (!hasText(this.value.qualitativeRecord) || !hasText(this.value.findings)) {
        uni.showToast({ title: this.i18n.nextBlocked, icon: 'none' });
        return;
      }
      this.$emit('request-next');
    }
  }
};
</script>

<style scoped>
.step-card {
  background: #f7fbff;
  border: 1px solid #d8e7f8;
  border-radius: 16rpx;
  padding: 16rpx;
}

.step-header {
  padding-bottom: 8rpx;
}

.step-title {
  font-size: 30rpx;
  color: #2b5fba;
  font-weight: 700;
}

.step-desc {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #4c6078;
  line-height: 1.5;
}

.section {
  margin-top: 12rpx;
  background: #fff;
  border: 1px solid #d7e2f2;
  border-radius: 12rpx;
  padding: 12rpx;
}

.section-title {
  font-size: 22rpx;
  font-weight: 700;
  color: #2d517d;
}

.section-subtitle {
  margin-top: 6rpx;
  font-size: 18rpx;
  line-height: 1.45;
  color: #607a97;
}

.table-wrap {
  margin-top: 10rpx;
  border: 1px solid #d7e2f2;
  border-radius: 10rpx;
  overflow: hidden;
}

.table-row {
  display: flex;
  border-top: 1px solid #e5eef9;
}

.table-row:first-child {
  border-top: none;
}

.table-head {
  background: #eef5ff;
}

.cell {
  padding: 10rpx;
  font-size: 18rpx;
  color: #324a66;
  line-height: 1.45;
  box-sizing: border-box;
}

.cell.left {
  width: 32%;
  border-right: 1px solid #e5eef9;
}

.cell.right {
  width: 68%;
}

.picker {
  width: 100%;
}

.picker-text {
  min-height: 66rpx;
  border: 1px solid #cdddf2;
  border-radius: 8rpx;
  background: #f8fbff;
  padding: 8rpx 10rpx;
  display: flex;
  align-items: center;
  font-size: 18rpx;
  color: #2f4864;
  line-height: 1.45;
}

.step-textarea {
  width: 100%;
  min-height: 120rpx;
  margin-top: 8rpx;
  border: 1px solid #cdddf2;
  border-radius: 10rpx;
  background: #f9fcff;
  padding: 10rpx;
  box-sizing: border-box;
  font-size: 19rpx;
  color: #334a63;
}

.btn-row {
  display: flex;
  gap: 8rpx;
}

.dialog-btn-row {
  margin-top: 10rpx;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  border-radius: 999rpx;
  text-align: center;
  padding: 12rpx 0;
  font-size: 19rpx;
  color: #fff;
}

.btn.primary {
  background: linear-gradient(135deg, #4f9dff, #56d0ff);
}

.btn.next {
  background: linear-gradient(135deg, #ff9f58, #ffc15a);
}

.generated-tip {
  margin-top: 8rpx;
  font-size: 17rpx;
  color: #6b7f96;
}

.preview-section {
  background: #fbfeff;
}

.preview-block {
  margin-top: 10rpx;
  border: 1px solid #dce8f8;
  border-radius: 8rpx;
  background: #fff;
  padding: 8rpx;
}

.preview-label {
  font-size: 18rpx;
  color: #2d517d;
  font-weight: 700;
}

.preview-content {
  margin-top: 6rpx;
  white-space: pre-wrap;
  font-size: 18rpx;
  line-height: 1.5;
  color: #3f5872;
}

.dialog-wrap {
  margin-top: 10rpx;
  border: 1px solid #dce8f8;
  border-radius: 10rpx;
  background: #f9fcff;
  padding: 10rpx;
  min-height: 120rpx;
  max-height: 320rpx;
  overflow: auto;
}

.dialog-empty {
  font-size: 18rpx;
  color: #7a8ea6;
  line-height: 1.45;
}

.dialog-item {
  margin-bottom: 8rpx;
  display: flex;
  gap: 8rpx;
}

.dialog-item:last-child {
  margin-bottom: 0;
}

.dialog-role {
  width: 48rpx;
  height: 48rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.dialog-item.user .dialog-role {
  background: #67a1ff;
}

.dialog-item.assistant .dialog-role {
  background: #53c39f;
}

.dialog-text {
  flex: 1;
  padding: 8rpx 10rpx;
  border-radius: 10rpx;
  font-size: 18rpx;
  line-height: 1.45;
  color: #38506a;
  white-space: pre-wrap;
}

.dialog-item.user .dialog-text {
  background: #eaf3ff;
  border: 1px solid #cfe0f6;
}

.dialog-item.assistant .dialog-text {
  background: #e9fbf5;
  border: 1px solid #cfeee2;
}

.dialog-input-row {
  margin-top: 10rpx;
  display: flex;
  gap: 8rpx;
  align-items: center;
}

.dialog-input {
  flex: 1;
  height: 64rpx;
  border: 1px solid #cdddf2;
  border-radius: 999rpx;
  background: #fff;
  padding: 0 18rpx;
  box-sizing: border-box;
  font-size: 18rpx;
  color: #334a63;
}

.mini-btn {
  border-radius: 999rpx;
  padding: 10rpx 16rpx;
  font-size: 18rpx;
  color: #fff;
  background: linear-gradient(135deg, #4f9dff, #56d0ff);
}

.mini-btn.primary {
  background: linear-gradient(135deg, #4f9dff, #56d0ff);
}

.mini-btn.light {
  background: linear-gradient(135deg, #53c39f, #63d3b0);
}

.mini-btn.danger {
  background: linear-gradient(135deg, #ff9f78, #ff7d7d);
}
</style>

