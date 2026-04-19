<template>
  <view class="step-card">
    <view class="step-header">
      <view class="step-title">⑦ 模型测试与数据分析</view>
      <view class="step-desc">先确定测试方案，再明确测试流程，再进行测试数据的记录，最后生成测试数据记录与分析表。</view>
    </view>

    <view class="section">
      <view class="section-title">步骤1：测试方案选择</view>
      <view class="section-subtitle">请选择本轮工程模型测试方式</view>
      <view class="option-list">
        <view
          class="option-item"
          :class="{ active: value.testType === item.value }"
          v-for="item in testTypeOptions"
          :key="item.key || item.value"
          @click="chooseTestType(item.value)"
        >
          {{ item.key }}. {{ item.text }}
        </view>
      </view>
      <view class="guide-box">
        <view class="guide-title">测试方案说明</view>
        <view class="guide-text">
          建议先做“定性测试”，先用眼睛观察有没有明显脱水、是否费力、是否安全，再进入测试目标记录。
        </view>
        <view class="guide-tip" v-if="value.testType === 'quantitative'">
          你选择了定量测试，也可以继续；建议同时补充一轮定性观察，让分析更完整。
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">步骤2：测试流程参考</view>
      <view class="section-subtitle">先看测试流程和演示视频，再完成下面的测试记录。</view>
      <view class="flow-list">
        <view class="flow-item" v-for="(line, index) in testFlow" :key="`flow-${index}`">
          {{ line }}
        </view>
      </view>
      <view class="video-card" v-if="testGuideVideo.videoUrl">
        <view class="video-title">{{ testGuideVideo.title || '测试流程展示视频' }}</view>
        <view class="video-desc">{{ testGuideVideo.desc || '先看测试演示，再按流程完成测试记录。' }}</view>
        <view class="video-frame">
          <video
            class="guide-video"
            :src="testGuideVideo.videoUrl"
            controls
            show-center-play-btn
            object-fit="cover"
          />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">步骤3：测试目标与记录</view>
      <view class="section-subtitle">从下方为每个测试目标选择对应的测试现象。</view>

      <view class="table-wrap">
        <view class="table-row table-head">
          <view class="cell goal">测试目标</view>
          <view class="cell record">测试现象记录</view>
          <view class="cell effect">目标效果达成</view>
        </view>

        <view class="table-row" v-for="(row, index) in records" :key="row.key || index">
          <view class="cell goal">{{ row.goal }}</view>
          <view class="cell record">
            <picker
              class="picker"
              :range="recordOptionLabels(row)"
              @change="onPickRecord(index, $event)"
            >
              <view class="picker-text" :class="{ empty: !recordSelectedText(row) }">
                {{ recordSelectedText(row) || '请选择测试现象' }}
              </view>
            </picker>
          </view>
          <view class="cell effect">{{ row.effect || '选择后自动生成' }}</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">关键发现</view>
      <view class="section-subtitle">可以在自动生成基础上，再补充你的观察和分析。</view>
      <textarea
        class="step-textarea"
        :value="value.findings"
        placeholder="请补充你的关键发现..."
        @input="onFindingInput"
      />
    </view>

    <view class="section">
      <view class="section-title">AI 数据分析</view>
      <view class="section-subtitle">点击按钮后，AI 会根据上方数据表格和你填写的关键发现生成分析。</view>

      <view class="dialog-wrap">
        <view v-if="aiAnalysisText" class="dialog-item assistant">
          <view class="dialog-role">AI</view>
          <view class="dialog-text">{{ aiAnalysisText }}</view>
        </view>
        <view v-else class="dialog-empty">还没有分析结果，点击“AI分析实验数据”开始。</view>
      </view>

      <view class="btn-row">
        <view class="mini-btn" @click="analyzeWithAI">AI分析实验数据</view>
      </view>
    </view>

    <view class="section">
      <view class="btn-row">
        <view class="btn primary" @click="generateDataSheet">生成数据记录与分析表</view>
      </view>
      <view v-if="value.generatedAt" class="generated-tip">最后生成时间：{{ value.generatedAt }}</view>
    </view>

    <view class="section preview-section" v-if="value.qualitativeRecord || value.findings || aiAnalysisText">
      <view class="section-title">生成预览</view>
      <view class="preview-block">
        <view class="preview-label">定性数据记录</view>
        <view class="preview-content">{{ value.qualitativeRecord || '未生成' }}</view>
      </view>
      <view class="preview-block">
        <view class="preview-label">关键发现</view>
        <view class="preview-content">{{ value.findings || '未填写' }}</view>
      </view>
      <view class="preview-block" v-if="aiAnalysisText">
        <view class="preview-label">AI 数据分析</view>
        <view class="preview-content">{{ aiAnalysisText }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';

const DEFAULT_TEST_TYPE_OPTIONS = [
  { key: 'A', text: '定性测试（推荐）', value: 'qualitative' },
  { key: 'B', text: '定量测试', value: 'quantitative' }
];

const DEFAULT_TEST_FLOW = [
  '流程1：准备测试材料和模型（袜子、水盆、手动甩干机）。',
  '流程2：将袜子打湿后轻拧，放入脱水桶。',
  '流程3：缠绕拉线并拉动转轴，观察甩干效果。',
  '流程4：重复多次测试并记录。'
];

const DEFAULT_RECORDS = [
  {
    key: 'dewater',
    goal: '脱水效果',
    options: [
      { key: 'A', text: '脱水现象非常明显，且效果更好' },
      { key: 'B', text: '脱水现象不明显' }
    ],
    effectByChoice: {
      A: '脱水效果基本达成',
      B: '脱水效果还需继续优化'
    }
  },
  {
    key: 'performance',
    goal: '性能效果',
    options: [
      { key: 'A', text: '脱水桶转动非常快，并且更轻松。' },
      { key: 'B', text: '脱水桶转动快，但是需要很大的力气' }
    ],
    effectByChoice: {
      A: '整体性能提高明显，更省力转的更快。',
      B: '整体性能还需优化，重点降低摩擦和操作用力。'
    }
  },
  {
    key: 'operation',
    goal: '操作效果',
    options: [
      { key: 'A', text: '操作起来特别简单且非常有趣' },
      { key: 'B', text: '操作起来仍然很不方便' }
    ],
    effectByChoice: {
      A: '操作简便效果提升明显，更简单方便，而且操作起来更有趣',
      B: '操作便捷性还需优化，重点简化安装和拉线步骤。'
    }
  },
  {
    key: 'safety',
    goal: '安全效果',
    options: [
      { key: 'A', text: '非常安全，没有飞溅物' },
      { key: 'B', text: '很不安全，很容易伤到手' }
    ],
    effectByChoice: {
      A: '安全效果达标，基本没有安全风险',
      B: '安全效果不达标，需要增加防护和降低风险。'
    }
  }
];

const hasText = (value) => String(value || '').trim().length > 0;

const clone = (value) => JSON.parse(JSON.stringify(value || []));

const nowText = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const normalizeEffectByChoice = (record) => {
  const configured = record && record.effectByChoice && typeof record.effectByChoice === 'object'
    ? record.effectByChoice
    : {};
  if (Object.keys(configured).length > 0) return configured;

  const effect = String(record && record.effect || '').trim();
  if (!effect) return {};
  return { A: effect };
};

const effectForChoice = (record, choice) => {
  const map = normalizeEffectByChoice(record);
  if (map[choice]) return map[choice];
  if (choice === 'A') return String(record && record.effect || '').trim() || '目标效果基本达成';
  if (choice === 'B') return '该目标还需继续优化';
  return '';
};

const normalizeRecords = (savedRecords, templateRecords) => {
  const source = Array.isArray(templateRecords) && templateRecords.length > 0
    ? templateRecords
    : DEFAULT_RECORDS;
  const saved = Array.isArray(savedRecords) ? savedRecords : [];
  return source.map((item, index) => {
    const base = { ...item };
    const raw = saved.find((row) => row && row.key && row.key === base.key) || saved[index] || {};
    const options = Array.isArray(base.options) && base.options.length > 0
      ? clone(base.options)
      : clone(raw.options || []);
    const choice = raw.choice || '';
    return {
      ...raw,
      ...base,
      options,
      choice,
      effectByChoice: normalizeEffectByChoice(base),
      effect: choice ? effectForChoice(base, choice) : ''
    };
  });
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
      return getEngineeringFlowTemplate(this.experiment && this.experiment.id);
    },
    templateStep7() {
      return (this.template && this.template.step7) || {};
    },
    testTypeOptions() {
      const list = this.templateStep7.testTypeOptions;
      return Array.isArray(list) && list.length > 0 ? list : DEFAULT_TEST_TYPE_OPTIONS;
    },
    testFlow() {
      const list = this.templateStep7.testFlow;
      return Array.isArray(list) && list.length > 0 ? list : DEFAULT_TEST_FLOW;
    },
    testGuideVideo() {
      return (this.templateStep7 && this.templateStep7.testGuideVideo) || {};
    },
    records() {
      return Array.isArray(this.value.records) ? this.value.records : [];
    },
    aiAnalysisText() {
      return String(this.value.aiDataAnalysis || '').trim();
    },
    allRecordsPicked() {
      return this.records.length > 0 && this.records.every((row) => hasText(row && row.choice));
    }
  },
  mounted() {
    this.ensureInitState();
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    chooseTestType(testType) {
      if (!testType) return;
      this.patch({
        testType,
        analysisGenerated: false,
        generatedAt: ''
      });
    },
    ensureInitState() {
      const normalizedRecords = normalizeRecords(this.value.records, this.templateStep7.records);
      const patch = {};
      if (!Array.isArray(this.value.records) || JSON.stringify(this.value.records) !== JSON.stringify(normalizedRecords)) {
        patch.records = normalizedRecords;
      }
      if (!hasText(this.value.findings)) patch.findings = '';
      if (!hasText(this.value.qualitativeRecord)) patch.qualitativeRecord = '';
      if (hasText(this.value.qualitativeRecord)
        && (this.value.qualitativeRecord.includes('自变量：') || this.value.qualitativeRecord.includes('因变量：'))) {
        patch.qualitativeRecord = this.value.qualitativeRecord
          .replace('自变量：测试目标项\n因变量：测试现象记录\n', '测试目标项与测试现象记录：\n')
          .replace(/自变量：.*\n/g, '')
          .replace(/因变量：.*\n/g, '');
      }
      if (!hasText(this.value.aiDataAnalysis)) patch.aiDataAnalysis = '';
      if (!hasText(this.value.generatedAt)) patch.generatedAt = '';
      if (typeof this.value.analysisGenerated !== 'boolean') patch.analysisGenerated = false;
      if (!this.value.testType) patch.testType = this.templateStep7.defaultTestType || 'qualitative';
      if (Object.keys(patch).length > 0) this.patch(patch);
    },
    recordOptionLabels(row) {
      return (Array.isArray(row && row.options) ? row.options : []).map((option) => `选项${option.key}: ${option.text}`);
    },
    recordSelectedText(row) {
      if (!row || !Array.isArray(row.options) || !row.choice) return '';
      const hit = row.options.find((option) => option.key === row.choice);
      return hit ? `选项${hit.key}: ${hit.text}` : '';
    },
    onPickRecord(index, event) {
      const optionIndex = Number(event && event.detail && event.detail.value);
      if (!Number.isFinite(optionIndex) || optionIndex < 0) return;
      const list = clone(this.records);
      const row = list[index];
      if (!row || !Array.isArray(row.options) || !row.options[optionIndex]) return;
      const choice = row.options[optionIndex].key;
      list[index] = {
        ...row,
        choice,
        effect: effectForChoice(row, choice)
      };
      this.patch({
        records: list,
        analysisGenerated: false,
        generatedAt: '',
        qualitativeRecord: '',
        aiDataAnalysis: ''
      });
    },
    onFindingInput(event) {
      this.patch({
        findings: event && event.detail ? event.detail.value : '',
        analysisGenerated: false,
        generatedAt: '',
        qualitativeRecord: '',
        aiDataAnalysis: ''
      });
    },
    composeQualitativeRecord() {
      const lines = ['测试目标项与测试现象记录：', ''];
      this.records.forEach((row) => {
        const selected = this.recordSelectedText(row) || '未选择';
        const effect = row.effect ? `；目标效果：${row.effect}` : '';
        lines.push(`${row.goal}：${selected}${effect}`);
      });
      return lines.join('\n');
    },
    composeFindings() {
      const typed = String(this.value.findings || '').trim();
      if (typed) return typed;

      const problemRows = this.records.filter((row) => row && row.choice === 'B');
      if (problemRows.length === 0) {
        return '测试记录显示，各项测试目标基本达成，模型的脱水、性能、操作和安全效果整体较好。';
      }
      const goals = problemRows.map((row) => row.goal).join('、');
      return `测试记录显示，${goals}仍需继续优化，建议优先针对对应结构进行改进。`;
    },
    buildDataTrendAnalysis() {
      const problemRows = this.records.filter((row) => row && row.choice === 'B');
      const passRows = this.records.filter((row) => row && row.choice === 'A');
      if (problemRows.length === 0) {
        return {
          judge: '所有测试目标均选择了较优现象，说明当前工程模型整体效果较稳定。',
          supportLevel: '高',
          suggestion: '可以进入下一步迭代思考，重点记录哪些结构让模型更省力、更安全、更好操作。'
        };
      }
      if (passRows.length === 0) {
        return {
          judge: '多个目标都没有达到理想效果，说明当前模型还需要系统性优化。',
          supportLevel: '低',
          suggestion: '建议先从影响最大的结构入手，例如动力传递、轴承摩擦、脱水桶固定和安全防护。'
        };
      }
      return {
        judge: `部分目标已经达成，但 ${problemRows.map((row) => row.goal).join('、')} 仍有明显优化空间。`,
        supportLevel: '中',
        suggestion: `建议优先优化 ${problemRows.map((row) => row.goal).join('、')} 对应的结构问题，再进行下一轮测试。`
      };
    },
    buildFindingConsistency(typedFinding, trend) {
      if (!hasText(typedFinding)) {
        return '你还没有填写关键发现，建议补充“测试现象 + 结构原因 + 改进方向”的一句话总结。';
      }

      const text = String(typedFinding);
      const keywords = ['脱水', '性能', '操作', '安全', '结构', '优化', '摩擦', '拉线', '轴承'];
      const hitCount = keywords.reduce((sum, key) => sum + (text.includes(key) ? 1 : 0), 0);
      if (trend.supportLevel === '高' && hitCount >= 2) {
        return '你的关键发现与测试结果匹配度较高，表达较完整。';
      }
      if (trend.supportLevel === '低') {
        return '当前关键发现需要更明确地指出主要问题结构和优化方向。';
      }
      if (hitCount >= 2) {
        return '关键发现方向基本正确，建议再补充对应的测试证据。';
      }
      return '关键发现文字较笼统，建议加入“哪个测试目标”和“哪个结构原因”。';
    },
    buildAnalysisRows() {
      const problemRows = this.records.filter((row) => row && row.choice === 'B');
      if (problemRows.length === 0) {
        return [{
          id: `row-${Date.now()}-overall`,
          structure: '整体模型',
          problem: '各项测试目标基本达成，可继续记录成功结构并进入迭代优化。'
        }];
      }
      const structureMap = {
        dewater: '脱水桶系统',
        performance: '动力与轴承结构',
        operation: '操作与拉线结构',
        safety: '安全防护结构'
      };
      return problemRows.map((row, index) => ({
        id: `row-${Date.now()}-${index}`,
        structure: structureMap[row.key] || row.goal || '待优化结构',
        problem: `${row.goal}没有达到理想状态：${this.recordSelectedText(row) || '未记录具体问题'}。`
      }));
    },
    analyzeWithAI() {
      if (!this.allRecordsPicked) {
        uni.showToast({ title: '请先完成所有测试现象选择', icon: 'none' });
        return;
      }

      const typedFinding = String(this.value.findings || '').trim();
      const trend = this.buildDataTrendAnalysis();
      const findingReview = this.buildFindingConsistency(typedFinding, trend);
      const lines = ['数据记录分析：'];
      this.records.forEach((row) => {
        lines.push(`- ${row.goal}：${this.recordSelectedText(row)}；${row.effect || '目标效果待判断'}`);
      });
      lines.push('');
      lines.push(`数据判断：${trend.judge}`);
      lines.push(`证据强度：${trend.supportLevel}`);
      lines.push('');
      lines.push(`关键发现核对：${findingReview}`);
      if (typedFinding) lines.push(`当前关键发现：${typedFinding}`);
      lines.push(`改进建议：${trend.suggestion}`);

      this.patch({
        aiDataAnalysis: lines.join('\n'),
        analysisGenerated: false
      });
    },
    generateDataSheet() {
      if (!this.allRecordsPicked) {
        uni.showToast({ title: '请先完成所有测试现象选择', icon: 'none' });
        return;
      }

      const generatedAt = nowText();
      const qualitativeRecord = this.composeQualitativeRecord();
      const findings = this.composeFindings();
      const analysisRows = this.buildAnalysisRows();
      const payload = {
        generatedAt,
        qualitativeRecord,
        findings,
        records: this.records,
        analysisRows,
        testType: this.value.testType || 'qualitative',
        aiDataAnalysis: this.value.aiDataAnalysis || ''
      };

      this.patch({
        ...payload,
        analysisGenerated: true
      });
      this.$emit('sync-data', payload);
      uni.showToast({ title: '已生成并同步到“我的实验记录·数据记录”', icon: 'none' });
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

.option-list {
  margin-top: 10rpx;
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.option-item {
  font-size: 20rpx;
  color: #4b6f99;
  background: #f3f8ff;
  border: 1rpx solid #d4e4f7;
  border-radius: 999rpx;
  padding: 8rpx 16rpx;
}

.option-item.active {
  background: #e9f2ff;
  border-color: #4e8ff2;
  color: #2f5f99;
  font-weight: 700;
}

.guide-box {
  margin-top: 10rpx;
  padding: 12rpx;
  border-radius: 10rpx;
  background: #f6fbff;
  border: 1rpx solid #d7e7fb;
}

.guide-title {
  font-size: 20rpx;
  color: #2f5f99;
  font-weight: 700;
}

.guide-text {
  margin-top: 6rpx;
  font-size: 19rpx;
  color: #4b6f99;
  line-height: 1.6;
}

.guide-tip {
  margin-top: 8rpx;
  font-size: 18rpx;
  color: #8b5a2b;
  background: #fff8eb;
  border: 1rpx solid #f2ddb0;
  border-radius: 8rpx;
  padding: 8rpx 10rpx;
}

.flow-list {
  margin-top: 10rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8rpx;
}

.flow-item {
  border: 1px solid #dbe8f7;
  border-radius: 10rpx;
  background: #f8fbff;
  padding: 10rpx;
  font-size: 18rpx;
  line-height: 1.45;
  color: #3f5f88;
}

.video-card {
  margin-top: 12rpx;
  width: 100%;
  max-width: 860rpx;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #d7e2f2;
  border-radius: 10rpx;
  background: #f8fbff;
  padding: 8rpx;
}

.video-title {
  font-size: 20rpx;
  color: #2d517d;
  font-weight: 700;
}

.video-desc {
  margin-top: 6rpx;
  font-size: 18rpx;
  line-height: 1.45;
  color: #607a97;
}

.video-frame {
  margin: 8rpx auto 0;
  width: 100%;
  max-width: 820rpx;
  aspect-ratio: 16 / 9;
  border-radius: 10rpx;
  overflow: hidden;
  background: #000;
}

.guide-video {
  width: 100%;
  height: 100%;
  display: block;
}

.guide-video,
.guide-video video {
  max-width: 100%;
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
  border-right: 1px solid #e5eef9;
}

.cell:last-child {
  border-right: none;
}

.cell.goal {
  width: 20%;
}

.cell.record {
  width: 44%;
}

.cell.effect {
  width: 36%;
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

.picker-text.empty {
  color: #7a8ea6;
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
  display: flex;
  gap: 8rpx;
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
  background: #53c39f;
  flex-shrink: 0;
}

.dialog-text {
  flex: 1;
  padding: 8rpx 10rpx;
  border-radius: 10rpx;
  font-size: 18rpx;
  line-height: 1.45;
  color: #38506a;
  white-space: pre-wrap;
  background: #e9fbf5;
  border: 1px solid #cfeee2;
}

.btn-row {
  margin-top: 10rpx;
  display: flex;
  gap: 8rpx;
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

.mini-btn {
  border-radius: 999rpx;
  padding: 10rpx 16rpx;
  font-size: 18rpx;
  color: #fff;
  background: linear-gradient(135deg, #4f9dff, #56d0ff);
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

@media (max-width: 960px) {
  .flow-list {
    grid-template-columns: 1fr;
  }

  .video-card {
    max-width: 100%;
  }

  .cell.goal {
    width: 24%;
  }

  .cell.record {
    width: 44%;
  }

  .cell.effect {
    width: 32%;
  }
}
</style>
