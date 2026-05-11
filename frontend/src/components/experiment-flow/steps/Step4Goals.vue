<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🎯</text>
      <view class="step-title">④ 实验目标</view>
    </view>
    <view class="step-desc">请选择真正和本实验相关的目标，选择完成后记得让AI小助手帮你分析你的选择是否正确哦。</view>

    <view class="goal-list">
      <view
        class="goal-chip"
        :class="goalChipClass(goal)"
        v-for="goal in goals"
        :key="goal.id"
        @click="toggleGoal(goal)"
      >
        <view class="goal-head">
          <text class="goal-no">{{ goal.id }}</text>
          <text class="goal-icon">{{ goal.icon }}</text>
        </view>
        <text class="goal-text">{{ goal.text }}</text>
        <text class="goal-judge" v-if="showAnalysis">
          {{ goal.isCorrect ? '✅ 正确目标' : '⚠️ 干扰目标' }}
        </text>
      </view>
    </view>

    <view class="check-row">
      <view class="check-btn" @click="runAiAnalysis">
        <text class="check-icon">🤖</text>
        <text>AI 分析目标</text>
      </view>
    </view>

    <view class="analysis-card" v-if="showAnalysis">
      <view class="analysis-title" :class="{ pass: value.aiChecked, fail: !value.aiChecked }">
        {{ value.aiChecked ? '分析通过：目标选择正确' : '分析结果：目标还需要调整' }}
      </view>
      <view class="analysis-text">{{ analysisSummary }}</view>
      <view class="analysis-list" v-if="analysisRows.length">
        <view
          class="analysis-item"
          v-for="row in analysisRows"
          :key="row.id"
          :class="{ ok: row.ok, warn: !row.ok }"
        >
          <view class="analysis-item-head">
            <text class="analysis-item-no">{{ row.id }}</text>
            <text class="analysis-item-title">{{ row.title }}</text>
          </view>
          <view class="analysis-item-line">
            <text class="analysis-item-label">判断：</text>
            <text class="analysis-item-value">{{ row.judge }}</text>
          </view>
          <view class="analysis-item-line">
            <text class="analysis-item-label">解释：</text>
            <text class="analysis-item-value">{{ row.explanation }}</text>
          </view>
        </view>
      </view>
      <view class="analysis-tip" v-if="!value.aiChecked">
        你当前有错选或漏选，请按照上面的逐项提示重新选择后，再点击 AI 分析。
      </view>
    </view>
  </view>
</template>

<script>
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';

const DEFAULT_GOALS = [
  {
    id: 1,
    icon: '🌀',
    text: '通过实验，找出洗衣机高速旋转能把衣服甩干的真正原因。',
    isCorrect: true
  },
  {
    id: 2,
    icon: '⚙️',
    text: '通过实验，观察旋转速度快慢对脱水效果的影响。',
    isCorrect: true
  },
  {
    id: 3,
    icon: '🌡️',
    text: '通过实验，测量洗衣机滚筒内部的温度变化。',
    isCorrect: false
  },
  {
    id: 4,
    icon: '🔱',
    text: '通过实验，研究洗衣机用了多少电量。',
    isCorrect: false
  }
];

const hasList = (value) => Array.isArray(value) && value.length > 0;

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
    templateStep4() {
      return (this.template && this.template.step4) || {};
    },
    goals() {
      const goals = this.templateStep4.goals;
      if (Array.isArray(goals) && goals.length > 0) return goals;
      return DEFAULT_GOALS;
    },
    requiredCorrectCount() {
      const n = Number(this.templateStep4.requiredCorrectCount);
      return Number.isFinite(n) && n > 0 ? n : 2;
    },
    selectedSet() {
      return new Set(this.value.selectedGoals || []);
    },
    showAnalysis() {
      return !!(this.value.aiAnalysis && this.value.aiAnalysis.summary);
    },
    analysisSummary() {
      return (this.value.aiAnalysis && this.value.aiAnalysis.summary) || '';
    },
    analysisRows() {
      const rows = this.value && this.value.aiAnalysis && this.value.aiAnalysis.rows;
      return Array.isArray(rows) ? rows : [];
    },
    correctGoalTexts() {
      return this.goals.filter((item) => item.isCorrect).map((item) => item.text);
    }
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    isGoalSelected(goal) {
      return this.selectedSet.has(goal.text);
    },
    goalChipClass(goal) {
      return {
        active: this.isGoalSelected(goal),
        correct: this.showAnalysis && this.isGoalSelected(goal) && goal.isCorrect,
        wrong: this.showAnalysis && this.isGoalSelected(goal) && !goal.isCorrect
      };
    },
    toggleGoal(goal) {
      const current = [...(this.value.selectedGoals || [])];
      const index = current.indexOf(goal.text);

      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(goal.text);
      }

      this.patch({
        selectedGoals: current,
        aiChecked: false,
        aiAnalysis: null
      });
    },
    buildGoalExplanation(goal) {
      if (goal && goal.explanation) return goal.explanation;
      if (goal && goal.isCorrect) {
        return '这个目标和本实验核心变量直接相关，能帮助我们验证科学问题。';
      }
      return '这个目标和本实验要验证的关键问题关联较弱，属于干扰项。';
    },
    buildAnalysisRows(selectedGoals) {
      return this.goals.map((goal) => {
        const selected = selectedGoals.includes(goal.text);
        const shouldSelect = !!goal.isCorrect;
        const ok = selected === shouldSelect;
        let judge = '';
        if (selected && shouldSelect) judge = '你选对了，这就是我们正确的目标。';
        if (selected && !shouldSelect) judge = '你选错了，再仔细思考一下哦。';
        if (!selected && shouldSelect) judge = '你漏选了，这也是正确目标哦，应补选。';
        if (!selected && !shouldSelect) judge = '你做得对，这项不是我们真正的目标哦。';
        return {
          id: goal.id,
          title: goal.text,
          ok,
          judge,
          explanation: this.buildGoalExplanation(goal)
        };
      });
    },
    runAiAnalysis() {
      const selectedGoals = this.value.selectedGoals || [];

      if (!hasList(selectedGoals)) {
        uni.showToast({
          title: '请先选择目标再分析',
          icon: 'none'
        });
        return;
      }

      const selectedGoalItems = this.goals.filter((item) => selectedGoals.includes(item.text));
      const wrongSelected = selectedGoalItems.filter((item) => !item.isCorrect);
      const missedCorrect = this.correctGoalTexts.filter((text) => !selectedGoals.includes(text));
      const isPass =
        wrongSelected.length === 0 &&
        selectedGoalItems.length === this.requiredCorrectCount &&
        this.correctGoalTexts.every((text) => selectedGoals.includes(text));

      const summary = isPass
        ? `你已经选中 ${this.requiredCorrectCount} 个正确目标，目标和本实验要验证的问题一致。`
        : `当前选择与实验核心不完全匹配：错选 ${wrongSelected.length} 项，漏选 ${missedCorrect.length} 项。请调整后再分析。`;

      const rows = this.buildAnalysisRows(selectedGoals);

      this.patch({
        aiChecked: isPass,
        aiAnalysis: {
          pass: isPass,
          summary,
          rows,
          selected: selectedGoals,
          correctTargets: this.correctGoalTexts,
          timestamp: Date.now()
        }
      });

      uni.showToast({
        title: isPass ? '目标正确，可进入下一步' : '目标需调整',
        icon: 'none',
        duration: 1400
      });
    }
  }
};
</script>

<style scoped>
.step-card {
  background: linear-gradient(135deg, #fff5f8, #f0f8ff);
  border-radius: 24rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(255, 182, 193, 0.4);
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
  color: #d63384;
  font-weight: 700;
}

.step-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8b5a2b;
  line-height: 1.6;
}

.goal-list {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.goal-chip {
  border-radius: 16rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #fff0f5, #f0f8ff);
  border: 2rpx solid rgba(155, 89, 182, 0.18);
}

.goal-chip.active {
  border-color: #6a5acd;
  background: linear-gradient(135deg, #f6f1ff, #f3fbff);
}

.goal-chip.correct {
  border-color: #2e8b57;
  background: linear-gradient(135deg, #f2fff5, #f7fff9);
}

.goal-chip.wrong {
  border-color: #d2691e;
  background: linear-gradient(135deg, #fffaf0, #fff5ec);
}

.goal-head {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.goal-no {
  min-width: 34rpx;
  height: 34rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #7d45a8;
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goal-icon {
  font-size: 20rpx;
}

.goal-text {
  margin-top: 6rpx;
  display: block;
  font-size: 22rpx;
  color: #5d4b7e;
  line-height: 1.6;
}

.goal-judge {
  margin-top: 8rpx;
  display: block;
  font-size: 21rpx;
  color: #6a5acd;
}

.check-row {
  margin-top: 14rpx;
}

.check-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  width: 100%;
  padding: 12rpx 16rpx;
  font-size: 23rpx;
  color: #fff;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-radius: 14rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.35);
  box-sizing: border-box;
}

.check-icon {
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

.analysis-tip {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #cd5c5c;
  line-height: 1.5;
}

.analysis-list {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.analysis-item {
  border-radius: 12rpx;
  padding: 10rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(79, 172, 254, 0.2);
}

.analysis-item.ok {
  border-color: rgba(46, 139, 87, 0.45);
  background: linear-gradient(135deg, #f2fff5, #f7fff9);
}

.analysis-item.warn {
  border-color: rgba(210, 105, 30, 0.45);
  background: linear-gradient(135deg, #fffaf0, #fff5ec);
}

.analysis-item-head {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.analysis-item-no {
  min-width: 30rpx;
  height: 30rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #7d45a8;
  font-size: 19rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.analysis-item-title {
  flex: 1;
  font-size: 21rpx;
  color: #5d4b7e;
  line-height: 1.5;
}

.analysis-item-line {
  margin-top: 6rpx;
}

.analysis-item-label {
  font-size: 21rpx;
  color: #1d6aab;
  font-weight: 700;
}

.analysis-item-value {
  font-size: 21rpx;
  color: #21507a;
  line-height: 1.5;
}
</style>



