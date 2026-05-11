<template>
  <view class="step-card">
    <view class="head">{{ i18n.title }}</view>
    <view class="desc">{{ i18n.desc }}</view>

    <view class="section">
      <view class="section-title">{{ i18n.fieldPhenomenon }}</view>
      <textarea
        class="area"
        :value="value.phenomenon"
        @input="onFieldChange('phenomenon', $event.detail.value)"
        :placeholder="i18n.phenomenonPlaceholder"
      />
    </view>

    <view class="section">
      <view class="section-head">
        <view class="section-title">{{ i18n.fieldPrinciple }}</view>
        <view class="ai-btn" @click="generateKidPrinciple">{{ i18n.aiBtn }}</view>
      </view>
      <view class="hint">{{ i18n.principleTip }}</view>
      <textarea
        class="area"
        :value="value.principle"
        @input="onFieldChange('principle', $event.detail.value)"
        :placeholder="i18n.principlePlaceholder"
      />
      <view class="reference-box">
        <view class="reference-title">{{ i18n.referenceTitle }}</view>
        <view class="reference-text">{{ i18n.referencePrinciple }}</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">{{ i18n.fieldResult }}</view>
      <picker :range="resultOptions" @change="onResultPick">
        <view class="picker-text">{{ value.result || i18n.resultPlaceholder }}</view>
      </picker>
    </view>

    <view class="section">
      <view class="section-title">{{ i18n.fieldImprovement }}</view>
      <textarea
        class="area"
        :value="value.improvement"
        @input="onFieldChange('improvement', $event.detail.value)"
        :placeholder="i18n.improvementPlaceholder"
      />
    </view>

    <view class="section">
      <view class="btn-row">
        <view class="btn primary" @click="generateReport">{{ i18n.generateBtn }}</view>
      </view>
      <view v-if="value.generatedAt" class="generated-tip">{{ i18n.generatedAt }}{{ value.generatedAt }}</view>
    </view>

    <view class="section">
      <view class="btn-row">
        <view class="btn success" @click="finishExperiment">{{ i18n.finishBtn }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const BASE_I18N = {
  title: '\u2469 \u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a',
  desc: '\u586b\u5199\u73b0\u8c61\u3001\u539f\u7406\u3001\u6548\u679c\u548c\u6539\u8fdb\uff0c\u751f\u6210\u5b8c\u6574\u7684\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a\u3002',
  fieldPhenomenon: '\u73b0\u8c61\u63cf\u8ff0',
  fieldPrinciple: '\u539f\u7406\u89e3\u91ca',
  fieldResult: '\u6548\u679c\u8fbe\u6210',
  fieldImprovement: '\u6539\u8fdb\u4e0e\u62d3\u5c55',
  phenomenonPlaceholder: '\u4f8b\u5982\uff1a\u7535\u52a8\u88c5\u7f6e\u65cb\u8f6c\u66f4\u5feb\uff0c\u5bfc\u81f4\u4e94\u89d2\u661f\u98de\u4e86\u66f4\u9ad8\u66f4\u8fdc\u3002',
  principlePlaceholder: '\u8bf7\u7528\u5c0f\u670b\u53cb\u5bb9\u6613\u7406\u89e3\u7684\u8bdd\u6765\u89e3\u91ca...',
  principleTip: '\u70b9\u51fb\u201cAI\u751f\u6210\u539f\u7406\u89e3\u91ca\u201d\uff0c\u53ef\u4ee5\u81ea\u52a8\u751f\u6210\u66f4\u9002\u5408\u5b69\u5b50\u7684\u7248\u672c\u3002',
  referenceTitle: '\u79d1\u5b66\u7248\u539f\u7406\u53c2\u8003',
  referencePrinciple:
    '\u65cb\u8f6c\u7cfb\u7edf\u4e2d\uff0c\u7269\u4f53\u9700\u8981\u5411\u5fc3\u529b\u624d\u80fd\u4fdd\u6301\u5706\u5468\u8fd0\u52a8\u3002\u8f6c\u901f\u8d8a\u9ad8\uff0c\u5bf9\u7ed3\u6784\u7684\u62c9\u626f\u8d8a\u5927\uff0c\u5f53\u8d85\u8fc7\u56fa\u5b9a\u7ed3\u6784\u80fd\u627f\u53d7\u7684\u8303\u56f4\u65f6\uff0c\u5c31\u4f1a\u51fa\u73b0\u8131\u79bb\u6216\u66f4\u660e\u663e\u7684\u5411\u5916\u8fd0\u52a8\u73b0\u8c61\u3002',
  aiBtn: '不懂 AI科学小助手',
  resultPlaceholder: '\u57fa\u672c\u8fbe\u6210\u5b9e\u9a8c\u76ee\u7684',
  improvementPlaceholder: '\u8bf7\u5199\u51fa\u672c\u6b21\u5b9e\u9a8c\u53ef\u4ee5\u600e\u6837\u8fdb\u4e00\u6b65\u4f18\u5316...',
  generateBtn: '\u751f\u6210\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a',
  generatedAt: '\u6700\u540e\u751f\u6210\u65f6\u95f4\uff1a',
  finishBtn: '完成本次实验',
  needGenerateFirst: '\u8bf7\u5148\u751f\u6210\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a',
  generatedToast: '\u62a5\u544a\u5df2\u751f\u6210\uff0c\u5e76\u540c\u6b65\u5230\u201c\u6211\u7684\u5b9e\u9a8c\u00b7\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a\u201d',
  aiPrincipleToast: '已生成科学原理解释',
  notFilled: '\u672a\u586b\u5199'
};

const DEFAULT_RESULT_OPTIONS = [
  '\u57fa\u672c\u8fbe\u6210\u5b9e\u9a8c\u76ee\u7684',
  '\u8fbe\u6210\u5b9e\u9a8c\u76ee\u7684\uff0c\u5e76\u4e14\u6548\u679c\u5f88\u660e\u663e',
  '\u90e8\u5206\u8fbe\u6210\u76ee\u6807\uff0c\u8fd8\u9700\u8981\u7ee7\u7eed\u6539\u8fdb'
];

const DEFAULT_KID_PRINCIPLE =
  '可以把实验模型想成在转盘上绕圈圈的小朋友。转得越快，越会感觉“想往外跑”。所以速度变化会明显影响飞行距离、脱离状态或者稳定性。';

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
    },
    flowData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    template() {
      return getScienceFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep10() {
      return (this.template && this.template.step10) || {};
    },
    i18n() {
      return {
        ...BASE_I18N,
        phenomenonPlaceholder: this.templateStep10.phenomenonPlaceholder || BASE_I18N.phenomenonPlaceholder,
        principleTip: this.templateStep10.principleTip || BASE_I18N.principleTip,
        referencePrinciple: this.templateStep10.referencePrinciple || BASE_I18N.referencePrinciple,
        improvementPlaceholder: this.templateStep10.improvementPlaceholder || BASE_I18N.improvementPlaceholder
      };
    },
    resultOptions() {
      const list = this.templateStep10.resultOptions;
      if (Array.isArray(list) && list.length > 0) return list;
      return DEFAULT_RESULT_OPTIONS;
    },
    kidPrincipleText() {
      return this.templateStep10.kidPrinciple || DEFAULT_KID_PRINCIPLE;
    }
  },
  mounted() {
    this.ensureInitState();
    if (!this.value.templateContent) this.refreshTemplate();
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    ensureInitState() {
      const payload = {};
      if (!hasText(this.value.result)) payload.result = this.resultOptions[0] || DEFAULT_RESULT_OPTIONS[0];
      if (!hasText(this.value.improvement)) payload.improvement = this.i18n.improvementPlaceholder;
      if (typeof this.value.reportGenerated !== 'boolean') payload.reportGenerated = false;
      if (!hasText(this.value.generatedAt)) payload.generatedAt = '';
      if (Object.keys(payload).length > 0) this.patch(payload);
    },
    onResultPick(event) {
      const index = Number(event && event.detail && event.detail.value);
      if (!Number.isFinite(index) || index < 0 || index >= this.resultOptions.length) return;
      this.onFieldChange('result', this.resultOptions[index]);
    },
    onFieldChange(field, fieldValue) {
      const next = {
        ...this.value,
        [field]: fieldValue
      };
      next.reportGenerated = false;
      next.generatedAt = '';
      next.templateVersion = 'phase2-report-v1';
      next.templateContent = this.composeTemplate(next);
      this.$emit('update', next);
    },
    generateKidPrinciple() {
      this.onFieldChange('principle', this.kidPrincipleText);
      uni.showToast({ title: this.i18n.aiPrincipleToast, icon: 'none' });
    },
    refreshTemplate() {
      this.patch({
        templateVersion: 'phase2-report-v1',
        templateContent: this.composeTemplate(this.value)
      });
    },
    composeTemplate(step10Data) {
      const step2 = this.flowData.step2 || {};
      const step3 = this.flowData.step3 || {};
      const step4 = this.flowData.step4 || {};
      const step6 = this.flowData.step6 || {};
      const step9 = this.flowData.step9 || {};

      const goals = Array.isArray(step4.selectedGoals) ? step4.selectedGoals.join('、') : '';
      const participants = step2.participants || this.i18n.notFilled;
      const date = step2.date || this.i18n.notFilled;
      const environment = step2.environment || this.i18n.notFilled;
      const question = step3.question || this.i18n.notFilled;
      const hypothesis = step3.hypothesisText || this.i18n.notFilled;
      const independentVariable = step6.independentVariable || this.i18n.notFilled;
      const dependentVariable = step6.dependentVariable || this.i18n.notFilled;
      const controlVariable = step6.controlVariable || this.i18n.notFilled;
      const qualitativeRecord = step9.qualitativeRecord || this.i18n.notFilled;
      const findings = step9.findings || this.i18n.notFilled;

      const phenomenon = step10Data.phenomenon || this.i18n.notFilled;
      const principle = step10Data.principle || this.i18n.notFilled;
      const result = step10Data.result || this.i18n.notFilled;
      const improvement = step10Data.improvement || this.i18n.notFilled;

      return [
        `【实验名称】${this.experiment.title || '未命名实验'}`,
        `【实验时间】${date}`,
        `【参与人员】${participants}`,
        `【实验环境】${environment}`,
        '',
        `【科学问题】${question}`,
        `【实验假设】${hypothesis}`,
        `【实验目标】${goals || this.i18n.notFilled}`,
        '',
        `【变量设定】`,
        `- 自变量：${independentVariable}`,
        `- 因变量：${dependentVariable}`,
        `- 控制变量：${controlVariable}`,
        '',
        `【数据记录与分析】`,
        `- 观察记录：${qualitativeRecord}`,
        `- 关键发现：${findings}`,
        '',
        `【现象描述】${phenomenon}`,
        `【原理解释】${principle}`,
        `【效果达成】${result}`,
        `【改进与拓展】${improvement}`
      ].join('\n');
    },
    generateReport() {
      if (!hasText(this.value.phenomenon) || !hasText(this.value.principle) || !hasText(this.value.result) || !hasText(this.value.improvement)) {
        uni.showToast({ title: '请先填写完整的4项结论内容', icon: 'none' });
        return;
      }
      const generatedAt = nowText();
      const payload = {
        ...this.value,
        reportGenerated: true,
        generatedAt,
        templateVersion: 'phase2-report-v1',
        templateContent: hasText(this.value.templateContent) ? this.value.templateContent : this.composeTemplate(this.value)
      };
      this.$emit('update', payload);
      this.$emit('sync-step10', payload);
      uni.showToast({ title: this.i18n.generatedToast, icon: 'none' });
    },
    finishExperiment() {
      if (this.value.reportGenerated !== true) {
        uni.showToast({ title: this.i18n.needGenerateFirst, icon: 'none' });
        return;
      }
      this.$emit('request-finish');
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

.head {
  font-size: 30rpx;
  font-weight: 700;
  color: #2b5fba;
}

.desc {
  margin-top: 8rpx;
  font-size: 20rpx;
  line-height: 1.5;
  color: #4c6078;
}

.section {
  margin-top: 12rpx;
  background: #fff;
  border: 1px solid #d7e2f2;
  border-radius: 12rpx;
  padding: 12rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.section-title {
  font-size: 22rpx;
  color: #2d517d;
  font-weight: 700;
}

.hint {
  margin-top: 6rpx;
  font-size: 18rpx;
  line-height: 1.45;
  color: #607a97;
}

.ai-btn {
  border-radius: 999rpx;
  background: linear-gradient(135deg, #4f9dff, #56d0ff);
  color: #fff;
  font-size: 17rpx;
  padding: 8rpx 14rpx;
  white-space: nowrap;
}

.area {
  margin-top: 8rpx;
  width: 100%;
  min-height: 120rpx;
  border: 1px solid #cdddf2;
  border-radius: 10rpx;
  background: #f9fcff;
  padding: 10rpx;
  box-sizing: border-box;
  font-size: 19rpx;
  color: #334a63;
  line-height: 1.5;
}

.picker-text {
  margin-top: 8rpx;
  min-height: 74rpx;
  border: 1px solid #cdddf2;
  border-radius: 10rpx;
  background: #f9fcff;
  padding: 10rpx;
  box-sizing: border-box;
  font-size: 19rpx;
  color: #334a63;
  display: flex;
  align-items: center;
  line-height: 1.4;
}

.reference-box {
  margin-top: 8rpx;
  border: 1px dashed #c9dbf5;
  border-radius: 10rpx;
  background: #f8fbff;
  padding: 10rpx;
}

.reference-title {
  font-size: 18rpx;
  color: #2d517d;
  font-weight: 700;
}

.reference-text {
  margin-top: 6rpx;
  white-space: pre-wrap;
  font-size: 17rpx;
  color: #587394;
  line-height: 1.45;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.tag {
  flex: 1;
  border-radius: 999rpx;
  background: #ecf5ff;
  color: #2d5c95;
  border: 1px solid #cfe1f7;
  padding: 7rpx 12rpx;
  font-size: 17rpx;
}

.refresh-btn {
  border-radius: 999rpx;
  background: #f0f6ff;
  color: #2d517d;
  border: 1px solid #bfd5f4;
  padding: 7rpx 12rpx;
  font-size: 17rpx;
}

.template-area {
  margin-top: 8rpx;
  width: 100%;
  min-height: 220rpx;
  border: 1px solid #cdddf2;
  border-radius: 10rpx;
  background: #f9fcff;
  padding: 10rpx;
  box-sizing: border-box;
  font-size: 19rpx;
  color: #334a63;
  line-height: 1.5;
}

.btn-row {
  display: flex;
  gap: 8rpx;
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

.btn.success {
  background: linear-gradient(135deg, #5bb36f, #99d48e);
}

.generated-tip {
  margin-top: 8rpx;
  font-size: 17rpx;
  color: #6b7f96;
}
</style>

