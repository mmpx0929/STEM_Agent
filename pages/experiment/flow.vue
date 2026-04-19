﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <view class="page">
    <view class="decor-bubbles">
      <view class="bubble bubble-1"></view>
      <view class="bubble bubble-2"></view>
      <view class="bubble bubble-3"></view>
    </view>

    <view class="top-card">
      <view class="top-row">
        <view class="back-btn" @click="goBack">
          <text class="btn-icon">👈</text>
          <text>{{ i18n.backBtn }}</text>
        </view>
        <view class="save-btn" @click="saveDraft()">
          <text class="btn-icon">💾</text>
          <text>{{ i18n.saveBtn }}</text>
        </view>
      </view>
      <view class="flow-title">{{ currentExperiment.title || i18n.flowTitleFallback }}</view>
      <view class="flow-subtitle">
        <text class="subtitle-icon">📂</text>
        <text>{{ categoryTitle }}</text>
        <text class="separator">{{ i18n.subSeparator }}</text>
        <text>{{ currentStep.title }}</text>
      </view>
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }">
          <view class="progress-star">⭐</view>
        </view>
      </view>
      <view class="progress-text">完成度: {{ progressPercent }}%</view>
    </view>

    <scroll-view class="step-tabs collapse-mode" scroll-x>
      <view class="step-tabs-inner collapse-inner" :class="{ expanded: planStageExpanded }">
        <view class="stage-main-row">
          <view
            class="stage-node"
            :class="getStageNodeClass('step1')"
            @click="jumpStep(0)"
          >
            <view class="stage-pill">
              <text class="stage-text">思考与假设</text>
            </view>
          </view>
          <text class="stage-arrow" :class="{ done: isStepValidByIndex(0) }">→</text>
          <view class="stage-plan-anchor">
            <view
              class="stage-node stage-node-plan"
              :class="getStageNodeClass('plan')"
              @click="togglePlanStageExpand"
            >
              <view class="stage-pill">
                <text class="stage-text">实验方案设计</text>
                <text class="stage-toggle">{{ planStageExpanded ? '▲' : '▼' }}</text>
              </view>
            </view>
            <view v-if="planStageExpanded" class="stage-expand-pop">
              <view
                class="step-group-container"
                :class="{ 'stage-active': isPlanStageActive, 'stage-done': isPlanStageDone }"
              >
                <view class="group-background">
                  <view class="group-steps">
                    <view
                      v-for="(step, index) in stepDefs.slice(1, 7)"
                      :key="step.key"
                      class="step-item group-step"
                      :class="getStepChipClass(index + 1)"
                      @click="jumpStep(index + 1)"
                    >
                      <view class="step-chip">
                        <text class="chip-num">{{ index + 1 }}</text>
                        <text class="chip-icon" v-if="isStepValidByIndex(index + 1)">✓</text>
                      </view>
                      <text class="step-label">{{ step.title }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <text class="stage-arrow" :class="{ done: isPlanStageDone }">→</text>
          <view
            class="stage-node stage-node-late"
            :class="getStageNodeClass('step8')"
            @click="jumpStep(7)"
          >
            <view class="stage-pill">
              <text class="stage-text">虚拟实验探究</text>
            </view>
          </view>
          <text class="stage-arrow" :class="{ done: isStepValidByIndex(7) }">→</text>
          <view
            class="stage-node stage-node-late"
            :class="getStageNodeClass('step9')"
            @click="jumpStep(8)"
          >
            <view class="stage-pill">
              <text class="stage-text">{{ stepDefs[8].title }}</text>
            </view>
          </view>
          <text class="stage-arrow" :class="{ done: isStepValidByIndex(8) }">→</text>
          <view
            class="stage-node stage-node-late"
            :class="getStageNodeClass('step10')"
            @click="jumpStep(9)"
          >
            <view class="stage-pill">
              <text class="stage-text">{{ stepDefs[9].title }}</text>
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <view class="step-shell">
      <component
        :is="currentStep.component"
        :value="flowData[currentStep.key]"
        :experiment="currentExperiment"
        :flow-data="flowData"
        @update="onStepUpdate"
        @sync-plan="syncStep7PlanToRecordCenter"
        @sync-step9="syncStep9DataToRecordCenter"
        @sync-step10="syncStep10ReportToRecordCenter"
        @request-next="onChildRequestNext"
        @request-finish="onChildRequestFinish"
      />
    </view>

    <view class="nav-row">
      <button class="nav-btn prev" :disabled="currentStepIndex === 0" @click="prevStep">
        <text class="nav-icon">⬅️</text>
        <text>{{ i18n.prevBtn }}</text>
      </button>
      <button
        class="nav-btn next"
        v-if="currentStepIndex < stepDefs.length - 1"
        @click="nextStep"
      >
        <text>{{ i18n.nextBtn }}</text>
        <text class="nav-icon">➡️</text>
      </button>
      <button class="nav-btn finish" v-else @click="finishFlow">
        <text class="nav-icon">🎉</text>
        <text>{{ i18n.finishBtn }}</text>
      </button>
    </view>

    <view class="tips-card">
      <view class="tips-icon">💡</view>
      <view class="tips-content">
        <view class="tips-title">{{ ruleTitle }}</view>
        <view class="tips-text">{{ getRuleTip(currentStep.key) }}</view>
      </view>
    </view>
    <view class="blocker-card" :class="{ ready: isCurrentStepReady }">
      <view class="blocker-title">{{ blockerTitle }}</view>
      <view class="blocker-text">{{ stepActionHint }}</view>
    </view>

    <AIChat
      :scene="aiGuideScene"
      :defaultOpen="false"
      pageContext="experiment-flow"
      :experiment-id="experimentId"
      :current-step="currentStep.key"
      :guide-key="aiGuideKey"
      :guide-text="aiGuideText"
      :auto-play="true"
    />
  </view>
</template>

<script>
import catalog from '@/config/experiment-catalog.js';
import {
  createInitialFlowData,
  loadFlowDraft,
  saveFlowDraft,
  clearFlowDraft
} from '@/utils/experimentFlowStore.js';
import { updateExperimentProgress } from '@/utils/experimentProgress.js';
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';
import { STEP8_FINAL_RESULT_ID } from '@/config/step8-recipes.js';
import { KID_COPY, toKidMissingHint, toKidLockedHint } from '@/config/kid-copy.js';
import { trackGrowthAbilityEvent } from '@/utils/growthAbilityProgress.js';
import { appendVersionedReportRecord } from '@/utils/reportVersioning.js';
import {
  resolveFlowCopy,
  resolveFlowRuleTitle,
  resolveFlowBlockerTitle,
  resolveFlowStepRuleTip,
  resolveFlowCompleteHint,
  resolveFlowReadyToNextHint,
  resolveFlowStageTitle
} from '@/utils/flowCopyResolver.js';

import Step1Hypothesis from '@/components/experiment-flow/steps/Step1Hypothesis.vue';
import Step2BasicInfo from '@/components/experiment-flow/steps/Step2BasicInfo.vue';
import Step3Question from '@/components/experiment-flow/steps/Step3Question.vue';
import Step4Goals from '@/components/experiment-flow/steps/Step4Goals.vue';
import Step5Materials from '@/components/experiment-flow/steps/Step5Materials.vue';
import Step6Variables from '@/components/experiment-flow/steps/Step6Variables.vue';
import Step7Procedure from '@/components/experiment-flow/steps/Step7Procedure.vue';
import Step8VirtualLab from '@/components/experiment-flow/steps/Step8VirtualLab.vue';
import Step9DataRecord from '@/components/experiment-flow/steps/Step9DataRecord.vue';
import Step10Report from '@/components/experiment-flow/steps/Step10Report.vue';
import AIChat from '@/pages/plan/components/AIChat.vue';

const I18N = {
  backBtn: KID_COPY.nav.back,
  saveBtn: KID_COPY.nav.saveDraft,
  flowTitleFallback: '\u5b9e\u9a8c\u6d41\u7a0b',
  subSeparator: '\u00b7',
  prevBtn: KID_COPY.nav.prev,
  nextBtn: KID_COPY.nav.next,
  finishBtn: '完成本次实验',
  ruleTitle: KID_COPY.tips.ruleTitle,
  step1Label: '\u89c2\u5bdf\u601d\u8003\u4e0e\u5047\u8bbe',
  step2Label: '\u57fa\u7840\u4fe1\u606f',
  step3Label: '\u95ee\u9898\u4e0e\u5047\u8bbe',
  step4Label: '\u5b9e\u9a8c\u76ee\u6807',
  step5Label: '\u5b9e\u9a8c\u573a\u666f\u6784\u601d\u4e0e\u6750\u6599\u8bbe\u8ba1',
  step6Label: '\u53d8\u91cf\u8bbe\u8ba1',
  step7Label: '\u5b9e\u9a8c\u6b65\u9aa4',
  step8Label: '\u865a\u62df\u5b9e\u9a8c\u63a2\u7a76\u64cd\u4f5c',
  step9Label: '\u6570\u636e\u8bb0\u5f55\u4e0e\u5206\u6790',
  step10Label: '\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a',
  ruleStep1: '\u8bf7\u5148\u5b8c\u6574\u89c2\u770b\u89c6\u9891\uff0c\u518d\u8fdb\u884c\u89c2\u5bdf\u601d\u8003\u5e76\u586b\u5199\u5047\u8bbe\u3002',
  ruleStep2: '\u8bf7\u586b\u5199\u53c2\u4e0e\u4eba\u5458\u3001\u5b9e\u9a8c\u65e5\u671f\u3001\u5b9e\u9a8c\u73af\u5883\u3002',
  ruleStep3: '\u8bf7\u586b\u5199\u79d1\u5b66\u95ee\u9898\u4e0e\u5b9e\u9a8c\u5047\u8bbe\u3002',
  ruleStep4: '\u8bf7\u9009\u62e9\u4e14\u4ec5\u9009\u62e9\u4e24\u4e2a\u6b63\u786e\u76ee\u6807\uff1a\u7814\u7a76\u7504\u5e72\u539f\u56e0\u548c\u8f6c\u901f\u5bf9\u8131\u6c34\u7684\u5f71\u54cd\u3002',
  ruleStep5: '\u8bf7\u9009\u62e9\u6b63\u786e\u7684\u6750\u6599\u8bbe\u8ba1\u601d\u8def\uff08\u903b\u8f911\uff09\uff0c\u5e76\u751f\u6210\u6750\u6599\u6e05\u5355\u3002',
  ruleStep6: '\u8bf7\u5148\u5728\u53d8\u91cf\u63a7\u5236\u8868\u4e2d\u5b8c\u6210\u81f3\u5c11\u4e00\u9879\u9009\u62e9\uff0c\u518d\u8fdb\u5165\u4e0b\u4e00\u6b65\u3002',
  ruleStep7: '\u8bf7\u6309\u987a\u5e8f\u5b8c\u6210 4 \u4e2a\u5b9e\u9a8c\u5927\u6b65\u9aa4\uff0c\u5e76\u70b9\u51fb\u201c\u751f\u6210\u5b9e\u9a8c\u65b9\u6848\u8bbe\u8ba1\u201d\u3002',
  ruleStep8: '\u8bf7\u5b8c\u6210\u865a\u62df\u5b9e\u9a8c\u63a2\u7a76\u64cd\u4f5c\uff08\u6a21\u578b\u642d\u5efa + \u4f4e\u901f/\u9ad8\u901f\u89c2\u5bdf\uff09\u3002\u7ebf\u4e0b\u6210\u679c\u4e0a\u4f20\u4e3a\u53ef\u9009\u9879\u3002',
  ruleStep9: '\u8bf7\u5148\u5b8c\u6210\u65cb\u8f6c\u901f\u5ea6\u5bf9\u5e94\u73b0\u8c61\u9009\u62e9\uff0c\u70b9\u51fb\u201c\u751f\u6210\u6570\u636e\u8bb0\u5f55\u4e0e\u5206\u6790\u8868\u201d\u3002',
  ruleStep10: '\u8bf7\u5b8c\u6574\u586b\u5199\u73b0\u8c61\u3001\u539f\u7406\u3001\u6548\u679c\u4e0e\u6539\u8fdb\uff0c\u5e76\u70b9\u51fb\u201c\u751f\u6210\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a\u201d\u3002',
  defaultRule: KID_COPY.toast.stepNotReady,
  untitledExperiment: '\u672a\u547d\u540d\u5b9e\u9a8c',
  fallbackEngineering: '\u5de5\u7a0b\u5b9e\u8df5',
  fallbackScience: '\u79d1\u5b66\u63a2\u7a76',
  stepIncompletePrefix: '\u7b2c ',
  stepIncompleteSuffix: ' \u6b65\u672a\u5b8c\u6210',
  completeStepFirstPrefix: '\u8bf7\u5148\u5b8c\u6210\u7b2c ',
  completeStepFirstSuffix: ' \u6b65',
  draftSaved: KID_COPY.toast.draftSaved,
  planSkeleton: '\u5df2\u751f\u6210\u5b9e\u9a8c\u65b9\u6848\u9aa8\u67b6',
  dataSkeleton: '\u5df2\u5b8c\u6210\u6d41\u7a0b\u6570\u636e\u8bb0\u5f55',
  reportSkeleton: '\u5df2\u751f\u6210\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a',
  flowDoneTitle: '\u606d\u559c\u4f60\u5df2\u5b8c\u6210\u672c\u6b21\u5b9e\u9a8c\uff01',
  flowDoneContent: '\u4f60\u7684\u5b9e\u9a8c\u65b9\u6848\u3001\u6570\u636e\u8bb0\u5f55\u548c\u7ed3\u8bba\u62a5\u544a\u90fd\u5df2\u4fdd\u5b58\u5230\u8bb0\u5f55\u4e2d\u5fc3\uff0c\u662f\u5426\u73b0\u5728\u53bb\u67e5\u770b\uff1f',
  openRecordConfirm: '\u53bb\u67e5\u770b',
  backHomeCancel: '\u8fd4\u56de\u9996\u9875',
  reportSection1: '\u5b9e\u9a8c\u4fe1\u606f',
  reportSection2: '\u95ee\u9898\u4e0e\u5047\u8bbe',
  reportSection3: '\u76ee\u6807\u4e0e\u53d8\u91cf',
  reportSection4: '\u6570\u636e\u4e0e\u53d1\u73b0',
  reportSection5: '\u7ed3\u8bba\u62a5\u544a',
  reportLabelExperiment: '\u5b9e\u9a8c\u540d\u79f0\uff1a',
  reportLabelDate: '\u5b9e\u9a8c\u65f6\u95f4\uff1a',
  reportLabelParticipants: '\u53c2\u4e0e\u4eba\u5458\uff1a',
  reportLabelEnvironment: '\u5b9e\u9a8c\u73af\u5883\uff1a',
  reportLabelQuestion: '\u79d1\u5b66\u95ee\u9898\uff1a',
  reportLabelHypothesis: '\u5b9e\u9a8c\u5047\u8bbe\uff1a',
  reportLabelGoals: '\u5b9e\u9a8c\u76ee\u6807\uff1a',
  reportLabelIndependent: '\u81ea\u53d8\u91cf\uff1a',
  reportLabelDependent: '\u56e0\u53d8\u91cf\uff1a',
  reportLabelControl: '\u63a7\u5236\u53d8\u91cf\uff1a',
  reportLabelObservation: '\u89c2\u5bdf\u8bb0\u5f55\uff1a',
  reportLabelFindings: '\u5173\u952e\u53d1\u73b0\uff1a',
  reportLabelPhenomenon: '\u5b9e\u9a8c\u73b0\u8c61\uff1a',
  reportLabelPrinciple: '\u539f\u7406\u89e3\u91ca\uff1a',
  reportLabelResult: '\u6548\u679c\u8fbe\u6210\uff1a',
  reportLabelImprovement: '\u6539\u8fdb\u5efa\u8bae\uff1a',
  notFilled: '\u672a\u586b\u5199'
};

const hasText = (value) => String(value || '').trim().length > 0;
const hasList = (value) => Array.isArray(value) && value.length > 0;
const getFlowTemplate = (experiment) => getScienceFlowTemplate(experiment && experiment.id);
const getStep4CorrectGoals = (experiment) => {
  const template = getFlowTemplate(experiment);
  const goals = ((template.step4 && template.step4.goals) || []).filter((item) => item && item.isCorrect);
  return goals.map((item) => item.text);
};
const isStep4GoalSelectionCorrect = (selectedGoals, experiment) => {
  const correctGoals = getStep4CorrectGoals(experiment);
  if (!hasList(selectedGoals) || selectedGoals.length !== correctGoals.length) return false;
  const selectedSet = new Set(selectedGoals);
  return correctGoals.every((goal) => selectedSet.has(goal));
};
const getStep5CorrectLogicKey = (experiment) => {
  const template = getFlowTemplate(experiment);
  return (template.step5 && template.step5.correctLogicKey) || 'logic1';
};
const getStep6ExpectedMap = (experiment) => {
  const template = getFlowTemplate(experiment);
  return (template.step6 && template.step6.correctMap) || {};
};
const getStep6OptionMap = (experiment) => {
  const template = getFlowTemplate(experiment);
  const list = (template.step6 && template.step6.optionList) || [];
  return list.reduce((acc, item) => {
    if (!item || !item.key) return acc;
    acc[item.key] = item.content || '';
    return acc;
  }, {});
};
const normalizeText = (value) => String(value || '').replace(/\s+/g, '');
const isStep6SelectionCorrect = (block, experiment) => {
  const expectedMap = getStep6ExpectedMap(experiment);
  const map = (block && block.selectionMap) || {};
  const byMap =
    map.independent === expectedMap.independent &&
    map.dependent === expectedMap.dependent &&
    map.control === expectedMap.control;
  if (byMap) return true;

  if (!block || typeof block !== 'object') return false;
  const optionMap = getStep6OptionMap(experiment);
  return (
    normalizeText(block.independentVariable) === normalizeText(optionMap[expectedMap.independent] || '') &&
    normalizeText(block.dependentVariable) === normalizeText(optionMap[expectedMap.dependent] || '') &&
    normalizeText(block.controlVariable) === normalizeText(optionMap[expectedMap.control] || '')
  );
};
const isStep6SelectionDone = (block) => {
  if (!block || typeof block !== 'object') return false;
  const map = block.selectionMap || {};
  if (hasText(map.independent) && hasText(map.dependent) && hasText(map.control)) return true;
  return (
    hasText(block.independentVariable) &&
    hasText(block.dependentVariable) &&
    hasText(block.controlVariable)
  );
};
const isStep6SelectionStarted = (block) => {
  if (!block || typeof block !== 'object') return false;
  const map = block.selectionMap || {};
  return (
    hasText(map.independent) ||
    hasText(map.dependent) ||
    hasText(map.control) ||
    hasText(block.independentVariable) ||
    hasText(block.dependentVariable) ||
    hasText(block.controlVariable)
  );
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

const STEP_RULES = {
  step1: {
    message: I18N.ruleStep1,
    validate: (block) =>
      block.videoWatched === true && (hasText(block.selectedHypothesis) || hasText(block.customHypothesis))
  },
  step2: {
    message: I18N.ruleStep2,
    validate: (block) => hasText(block.participants) && hasText(block.date) && hasText(block.environment)
  },
  step3: {
    message: I18N.ruleStep3,
    validate: (block) => hasText(block.question) && hasText(block.hypothesisText)
  },
  step4: {
    message: I18N.ruleStep4,
    validate: (block, _flowData, experiment) =>
      block.aiChecked === true && isStep4GoalSelectionCorrect(block.selectedGoals, experiment)
  },
  step5: {
    message: I18N.ruleStep5,
    validate: (block, _flowData, experiment) =>
      block.sceneChoice === getStep5CorrectLogicKey(experiment) && hasText(block.materialList)
  },
  step6: {
    message: I18N.ruleStep6,
    validate: (block, _flowData, experiment) =>
      isStep6SelectionDone(block) ||
      (isStep6SelectionStarted(block) && isStep6SelectionCorrect(block, experiment))
  },
  step7: {
    message: I18N.ruleStep7,
    validate: (block) =>
      hasList(block.majorSteps) &&
      block.majorSteps.length === 4 &&
      block.planGenerated === true &&
      hasText(block.detailSteps)
  },
  step8: {
    message: I18N.ruleStep8,
    validate: (block) => {
      const watched = (block && (block.operationVideoWatched || block.operationWatched)) || {};
      const watchedDone = watched.op1 === true && watched.op2 === true;
      const resultItems = Array.isArray(block && block.resultItems) ? block.resultItems : [];
      const hasFinal = resultItems.includes(STEP8_FINAL_RESULT_ID);
      return hasText(block.projectId) && watchedDone && hasFinal;
    }
  },
  step9: {
    message: I18N.ruleStep9,
    validate: (block) => hasText(block.qualitativeRecord) && hasText(block.findings)
  },
  step10: {
    message: I18N.ruleStep10,
    validate: (block) =>
      hasText(block.phenomenon) &&
      hasText(block.principle) &&
      hasText(block.result) &&
      hasText(block.improvement) &&
      hasText(block.templateContent) &&
      block.reportGenerated === true
  }
};

const STEP_AI_SCENE_MAP = {
  step1: 'principle',
  step2: 'planning',
  step3: 'planning',
  step4: 'planning',
  step5: 'planning',
  step6: 'matching',
  step7: 'planning',
  step8: 'virtualLab',
  step9: 'dataAnalysis',
  step10: 'experimentSummary'
};

const STEP_AI_GUIDE_TEXT_MAP = {
  step1: '让我们先根据视频中的内容，认真观察现象，然后大胆写下你的猜想吧！想法越清楚，实验越顺利哦～',
  step2: '请先把基础信息填完整，这样你的记录和报告会更规范。',
  step3: '让我们再次回顾下此次实验要搞清楚的科学问题吧！明确了科学问题与假设，实验才会高效哦。',
  step4: '请选择真正和本实验相关的目标，选择完成后记得让AI小助手帮你分析你的选择是否正确哦。',
  step5: '要模拟滚筒旋转，同时还要带动衣服一起旋转，用什么实验材料或者是实验模型来做探究实验呢？请选择你认为合理的实验方案吧。',
  step6: '变量设计很关键：请先认识什么是自变量、因变量和不变量，再做出对应的选择吧。',
  step7: '按照顺序完成实验步骤，不跳步，才能得到可靠结果。请选择你认为正确的实验步骤吧',
  step8: '先完成模型搭建，再完成低速和高速观察；线下成果上传是可选项。',
  step9: '数据分析先写现象，再提发现，最后再生成数据记录表。',
  step10: '请把现象、原理、效果、改进都写完整，形成你的结论报告。'
};

const buildUnifiedReportTemplate = (experiment, flowData) => {
  const step2 = flowData.step2 || {};
  const step3 = flowData.step3 || {};
  const step4 = flowData.step4 || {};
  const step6 = flowData.step6 || {};
  const step9 = flowData.step9 || {};
  const step10 = flowData.step10 || {};

  const sections = [
    {
      title: I18N.reportSection1,
      content: [
        `${I18N.reportLabelExperiment}${experiment.title || I18N.untitledExperiment}`,
        `${I18N.reportLabelDate}${step2.date || I18N.notFilled}`,
        `${I18N.reportLabelParticipants}${step2.participants || I18N.notFilled}`,
        `${I18N.reportLabelEnvironment}${step2.environment || I18N.notFilled}`
      ].join('\n')
    },
    {
      title: I18N.reportSection2,
      content: [
        `${I18N.reportLabelQuestion}${step3.question || I18N.notFilled}`,
        `${I18N.reportLabelHypothesis}${step3.hypothesisText || I18N.notFilled}`
      ].join('\n')
    },
    {
      title: I18N.reportSection3,
      content: [
        `${I18N.reportLabelGoals}${hasList(step4.selectedGoals) ? step4.selectedGoals.join('\u3001') : I18N.notFilled}`,
        `${I18N.reportLabelIndependent}${step6.independentVariable || I18N.notFilled}`,
        `${I18N.reportLabelDependent}${step6.dependentVariable || I18N.notFilled}`,
        `${I18N.reportLabelControl}${step6.controlVariable || I18N.notFilled}`
      ].join('\n')
    },
    {
      title: I18N.reportSection4,
      content: [
        `${I18N.reportLabelObservation}${step9.qualitativeRecord || I18N.notFilled}`,
        `${I18N.reportLabelFindings}${step9.findings || I18N.notFilled}`
      ].join('\n')
    },
    {
      title: I18N.reportSection5,
      content: [
        `${I18N.reportLabelPhenomenon}${step10.phenomenon || I18N.notFilled}`,
        `${I18N.reportLabelPrinciple}${step10.principle || I18N.notFilled}`,
        `${I18N.reportLabelResult}${step10.result || I18N.notFilled}`,
        `${I18N.reportLabelImprovement}${step10.improvement || I18N.notFilled}`
      ].join('\n')
    }
  ];

  return {
    version: 'phase2-report-v1',
    generatedAt: nowText(),
    sections,
    text: sections.map((item) => `\u3010${item.title}\u3011\n${item.content}`).join('\n\n')
  };
};

export default {
  components: {
    AIChat,
    Step1Hypothesis,
    Step2BasicInfo,
    Step3Question,
    Step4Goals,
    Step5Materials,
    Step6Variables,
    Step7Procedure,
    Step8VirtualLab,
    Step9DataRecord,
    Step10Report
  },
  data() {
    return {
      experimentId: '',
      templateType: 'science',
      currentExperiment: {},
      categoryTitle: '',
      planStageExpanded: false,
      currentStepIndex: 0,
      flowData: createInitialFlowData(),
      stepDefs: [
        { key: 'step1', title: I18N.step1Label, component: 'Step1Hypothesis' },
        { key: 'step2', title: I18N.step2Label, component: 'Step2BasicInfo' },
        { key: 'step3', title: I18N.step3Label, component: 'Step3Question' },
        { key: 'step4', title: I18N.step4Label, component: 'Step4Goals' },
        { key: 'step5', title: I18N.step5Label, component: 'Step5Materials' },
        { key: 'step6', title: I18N.step6Label, component: 'Step6Variables' },
        { key: 'step7', title: I18N.step7Label, component: 'Step7Procedure' },
        { key: 'step8', title: I18N.step8Label, component: 'Step8VirtualLab' },
        { key: 'step9', title: I18N.step9Label, component: 'Step9DataRecord' },
        { key: 'step10', title: I18N.step10Label, component: 'Step10Report' }
      ]
    };
  },
  computed: {
    i18n() {
      return I18N;
    },
    resolvedFlowCopy() {
      const experimentId = (this.currentExperiment && this.currentExperiment.id) || this.experimentId || '';
      return resolveFlowCopy({
        experimentId,
        templateType: this.templateType
      });
    },
    ruleTitle() {
      return resolveFlowRuleTitle(this.resolvedFlowCopy, I18N.ruleTitle);
    },
    currentStep() {
      return this.stepDefs[this.currentStepIndex];
    },
    progressPercent() {
      const total = this.stepDefs.length;
      return Math.round(((this.currentStepIndex + 1) / total) * 100);
    },
    maxUnlockedStepIndex() {
      const firstInvalidIndex = this.stepDefs.findIndex((_, index) => !this.isStepValidByIndex(index));
      if (firstInvalidIndex === -1) return this.stepDefs.length - 1;
      return firstInvalidIndex;
    },
    isPlanStageActive() {
      return this.currentStepIndex >= 1 && this.currentStepIndex <= 6;
    },
    isPlanStageDone() {
      for (let idx = 1; idx <= 6; idx += 1) {
        if (!this.isStepValidByIndex(idx)) return false;
      }
      return true;
    },
    currentStageTitle() {
      const stepKey = this.currentStep && this.currentStep.key ? this.currentStep.key : '';
      const fallbackTitle = this.currentStep && this.currentStep.title ? this.currentStep.title : I18N.flowTitleFallback;
      return resolveFlowStageTitle(this.resolvedFlowCopy, stepKey, fallbackTitle);
    },
    aiGuideKey() {
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : 'step1';
      return `experiment-${key}`;
    },
    aiGuideScene() {
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : 'step1';
      return STEP_AI_SCENE_MAP[key] || 'general';
    },
    aiGuideText() {
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : 'step1';
      return STEP_AI_GUIDE_TEXT_MAP[key] || '跟着当前步骤提示，一步一步完成实验探究。';
    },
    isCurrentStepReady() {
      return this.isStepValidByIndex(this.currentStepIndex);
    },
    blockerTitle() {
      return resolveFlowBlockerTitle(
        this.resolvedFlowCopy,
        this.isCurrentStepReady,
        KID_COPY.tips.readyTitle,
        KID_COPY.tips.missingTitle
      );
    },
    stepActionHint() {
      if (this.isCurrentStepReady) {
        if (this.currentStepIndex >= this.stepDefs.length - 1) {
          return resolveFlowCompleteHint(this.resolvedFlowCopy, '全部步骤都完成了，点击“完成本次实验”吧。');
        }
        const next = this.stepDefs[this.currentStepIndex + 1];
        const nextTitle = next && next.title ? next.title : '下一步';
        return resolveFlowReadyToNextHint(
          this.resolvedFlowCopy,
          nextTitle,
          '这一步已经完成，下一步去“{nextTitle}”。'
        );
      }
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : '';
      return toKidMissingHint(this.getRuleTip(key));
    }
  },
  onLoad(query) {
    this.experimentId = query.experimentId || '';
    this.templateType = query.templateType || 'science';
    this.initExperiment();
    this.initDraft();
    this.updateNavigationTitle();
  },
  watch: {
    currentStageTitle() {
      this.updateNavigationTitle();
    }
  },
  methods: {
    initExperiment() {
      const categories = catalog.categories || [];
      let found = null;
      let categoryTitle = '';

      categories.forEach((category) => {
        (category.items || []).forEach((item) => {
          if (item.id === this.experimentId) {
            found = { ...item, categoryKey: category.key, templateType: item.templateType || category.templateType };
            categoryTitle = category.title;
          }
        });
      });

      if (found) {
        const fallbackVideoUrl = catalog.step1GuideVideoUrl || catalog.featuredVideoUrl || '';
        this.currentExperiment = found;
        this.currentExperiment.step1VideoUrl = found.step1VideoUrl || fallbackVideoUrl;
        this.categoryTitle = categoryTitle;
        this.templateType = found.templateType || this.templateType;
        return;
      }

      this.currentExperiment = {
        id: this.experimentId || 'unknown',
        title: I18N.untitledExperiment,
        legacyId: null,
        templateType: this.templateType,
        step1VideoUrl: catalog.step1GuideVideoUrl || catalog.featuredVideoUrl || ''
      };
      this.categoryTitle = this.templateType === 'engineering' ? I18N.fallbackEngineering : I18N.fallbackScience;
    },
    initDraft() {
      const draft = loadFlowDraft(this.experimentId);
      if (!draft) return;

      const merged = {
        ...createInitialFlowData(),
        ...(draft.flowData || {})
      };
      this.flowData = merged;

      const safeIndex = Number.isInteger(draft.currentStepIndex)
        ? Math.min(Math.max(draft.currentStepIndex, 0), this.stepDefs.length - 1)
        : 0;

      this.currentStepIndex = Math.min(safeIndex, this.maxUnlockedStepIndex);
    },
    getRuleTip(stepKey) {
      const fallback = STEP_RULES[stepKey] ? STEP_RULES[stepKey].message : I18N.defaultRule;
      return resolveFlowStepRuleTip(this.resolvedFlowCopy, stepKey, fallback);
    },
    getStageNodeClass(stageKey) {
      if (stageKey === 'step1') {
        return {
          active: this.currentStepIndex === 0,
          done: this.isStepValidByIndex(0),
          locked: false
        };
      }
      if (stageKey === 'plan') {
        return {
          active: this.isPlanStageActive,
          done: this.isPlanStageDone,
          locked: this.maxUnlockedStepIndex < 1
        };
      }
      if (stageKey === 'step8') {
        return {
          active: this.currentStepIndex === 7,
          done: this.isStepValidByIndex(7),
          locked: this.maxUnlockedStepIndex < 7
        };
      }
      if (stageKey === 'step9') {
        return {
          active: this.currentStepIndex === 8,
          done: this.isStepValidByIndex(8),
          locked: this.maxUnlockedStepIndex < 8
        };
      }
      if (stageKey === 'step10') {
        return {
          active: this.currentStepIndex === 9,
          done: this.isStepValidByIndex(9),
          locked: this.maxUnlockedStepIndex < 9
        };
      }
      return {};
    },
    togglePlanStageExpand() {
      if (this.maxUnlockedStepIndex < 1) {
        uni.showToast({
          title: toKidLockedHint(2, this.stepDefs[1] && this.stepDefs[1].title),
          icon: 'none'
        });
        return;
      }
      this.planStageExpanded = !this.planStageExpanded;
    },
    updateNavigationTitle() {
      const title = this.currentStageTitle || this.i18n.flowTitleFallback;
      if (typeof uni !== 'undefined' && typeof uni.setNavigationBarTitle === 'function') {
        uni.setNavigationBarTitle({ title });
      }
    },
    getStepChipClass(index) {
      return {
        active: index === this.currentStepIndex,
        done: this.isStepValidByIndex(index),
        locked: index > this.maxUnlockedStepIndex,
        error: index < this.currentStepIndex && !this.isStepValidByIndex(index)
      };
    },
    trackAbilityEvent(abilityKey) {
      const experimentId = this.currentExperiment && this.currentExperiment.id;
      if (!experimentId || !abilityKey) return;
      try {
        trackGrowthAbilityEvent(abilityKey, experimentId);
      } catch (error) {
        console.warn('[GrowthAbility] track event failed:', abilityKey, experimentId, error);
      }
    },
    onStepUpdate(nextValue) {
      const key = this.currentStep.key;
      const payload = nextValue && typeof nextValue === 'object' ? { ...nextValue } : {};

      if (key === 'step1') {
        const stepValid = STEP_RULES.step1.validate(payload, this.flowData, this.currentExperiment);
        if (stepValid && !payload._abilityReasoningTrackedAt) {
          this.trackAbilityEvent('reasoning');
          payload._abilityReasoningTrackedAt = nowText();
        }
      }
      if (key === 'step8') {
        const stepValid = STEP_RULES.step8.validate(payload, this.flowData, this.currentExperiment);
        if (stepValid && !payload._abilityHandsOnTrackedAt) {
          this.trackAbilityEvent('handsOn');
          payload._abilityHandsOnTrackedAt = nowText();
        }
      }

      this.flowData = {
        ...this.flowData,
        [key]: payload
      };
      this.saveDraft({ silent: true });
    },
    onChildRequestNext() {
      this.nextStep();
    },
    onChildRequestFinish() {
      this.finishFlow();
    },
    getStepBlock(index) {
      const key = this.stepDefs[index] && this.stepDefs[index].key;
      return (key && this.flowData[key]) || {};
    },
    isStepValidByIndex(index) {
      const step = this.stepDefs[index];
      if (!step) return false;
      const rule = STEP_RULES[step.key];
      if (!rule) return true;
      return rule.validate(this.getStepBlock(index), this.flowData, this.currentExperiment);
    },
    validateStepAt(index, options = {}) {
      const step = this.stepDefs[index];
      if (!step) return true;
      const rule = STEP_RULES[step.key];
      if (!rule) return true;

      const isValid = rule.validate(this.getStepBlock(index), this.flowData, this.currentExperiment);
      if (!isValid && !options.silent) {
        uni.showToast({ title: toKidMissingHint(this.getRuleTip(step.key)), icon: 'none' });
      }
      return isValid;
    },
    validateCurrentStep() {
      return this.validateStepAt(this.currentStepIndex);
    },
    validateAllSteps() {
      for (let i = 0; i < this.stepDefs.length; i += 1) {
        if (this.validateStepAt(i, { silent: true })) continue;
        this.currentStepIndex = i;
        uni.showToast({
          title: `${I18N.stepIncompletePrefix}${i + 1}${I18N.stepIncompleteSuffix}`,
          icon: 'none',
          duration: 2200
        });
        return false;
      }
      return true;
    },
    jumpStep(index) {
      if (index < 0 || index >= this.stepDefs.length) return;
      if (index > this.maxUnlockedStepIndex) {
        const lockIndex = this.maxUnlockedStepIndex + 1;
        const lockStep = this.stepDefs[lockIndex - 1];
        uni.showToast({
          title: toKidLockedHint(lockIndex, lockStep && lockStep.title),
          icon: 'none'
        });
        return;
      }
      this.currentStepIndex = index;
      this.saveDraft({ silent: true });
    },
    prevStep() {
      if (this.currentStepIndex <= 0) return;
      this.currentStepIndex -= 1;
      this.saveDraft({ silent: true });
    },
    nextStep() {
      if (!this.validateCurrentStep()) return;
      if (this.currentStepIndex >= this.stepDefs.length - 1) return;
      this.currentStepIndex += 1;
      this.saveDraft({ silent: true });
    },
    ensureReportTemplate() {
      const template = buildUnifiedReportTemplate(this.currentExperiment, this.flowData);
      const step10 = this.flowData.step10 || {};
      if (!hasText(step10.templateContent)) {
        this.flowData = {
          ...this.flowData,
          step10: {
            ...step10,
            templateVersion: template.version,
            templateContent: template.text
          }
        };
      }
      return template;
    },
    saveDraft(options = {}) {
      saveFlowDraft(this.experimentId, {
        experimentId: this.experimentId,
        currentStepIndex: this.currentStepIndex,
        flowData: this.flowData
      });

      if (options.silent) return;
      uni.showToast({
        title: I18N.draftSaved,
        icon: 'none',
        duration: 1200
      });
    },
    syncStep7PlanToRecordCenter(payload = {}) {
      const exp = this.currentExperiment || {};
      if (!exp.id) return;

      const step2 = this.flowData.step2 || {};
      const step3 = this.flowData.step3 || {};
      const step4 = this.flowData.step4 || {};
      const step5 = this.flowData.step5 || {};
      const step6 = this.flowData.step6 || {};
      const step7 = this.flowData.step7 || {};
      const step8 = this.flowData.step8 || {};

      const storageExperimentId =
        exp.legacyId !== null && exp.legacyId !== undefined ? exp.legacyId : exp.id;
      const dateText = payload.generatedAt || nowText();
      const detailText = String(payload.detailSteps || step7.detailSteps || '').trim();
      const summary = detailText
        ? '第7步实验方案设计已生成并同步'
        : '实验方案设计已同步';

      const planSheets = Array.isArray(uni.getStorageSync('experimentPlanSheets'))
        ? uni.getStorageSync('experimentPlanSheets')
        : [];
      const planId = `phase2-plan-${exp.id}`;
      const planData = {
        id: planId,
        experimentId: storageExperimentId,
        experimentName: exp.title,
        createTime: dateText,
        source: 'phase2-flow-step7',
        status: 'completed',
        summary,
        basicInfo: {
          participants: step2.participants || '',
          date: step2.date || '',
          environment: step2.environment || ''
        },
        flowSnapshot: {
          step1: this.flowData.step1,
          step3,
          step4,
          step5,
          step6,
          step7: {
            ...step7,
            detailSteps: detailText || step7.detailSteps || '',
            planGenerated: true,
            generatedAt: dateText
          },
          step8: {
            completed: step8.completed === true,
            completedAt: step8.completedAt || '',
            virtualLabNote: step8.virtualLabNote || '',
            evidenceList: Array.isArray(step8.evidenceList) ? step8.evidenceList : []
          }
        }
      };
      const planIndex = planSheets.findIndex((item) => item && item.id === planId);
      if (planIndex >= 0) planSheets[planIndex] = planData;
      else planSheets.unshift(planData);
      uni.setStorageSync('experimentPlanSheets', planSheets);
      this.trackAbilityEvent('design');
    },
    syncStep9DataToRecordCenter(payload = {}) {
      const exp = this.currentExperiment || {};
      if (!exp.id) return;

      const storageExperimentId =
        exp.legacyId !== null && exp.legacyId !== undefined ? exp.legacyId : exp.id;
      const step2 = this.flowData.step2 || {};
      const step8 = this.flowData.step8 || {};
      const step9 = {
        ...(this.flowData.step9 || {}),
        ...(payload || {})
      };
      const dateText = payload.generatedAt || step9.generatedAt || nowText();

      const resultList = Array.isArray(uni.getStorageSync('experimentResults'))
        ? uni.getStorageSync('experimentResults')
        : [];
      const resultId = `phase2-data-${exp.id}`;

      const resultData = {
        id: resultId,
        experimentId: storageExperimentId,
        name: exp.title,
        date: dateText,
        source: 'phase2-flow-step9',
        status: 'completed',
        recorder: step2.participants || '',
        result: step9.findings || '\u7b2c9\u6b65\u6570\u636e\u8bb0\u5f55\u5df2\u751f\u6210',
        summary: step9.findings || '\u7b2c9\u6b65\u6570\u636e\u8bb0\u5f55\u5df2\u751f\u6210',
        discoveries: step9.findings || '',
        qualitativeData: step9.qualitativeRecord || '',
        virtualLabNote: step8.virtualLabNote || '',
        virtualEvidence: Array.isArray(step8.evidenceList) ? step8.evidenceList : [],
        analysisDetail: {
          findings: step9.findings || '',
          qualitativeRecord: step9.qualitativeRecord || '',
          variableTable: {
            independentVariable: step9.independentVariableLabel || '\u65cb\u8f6c\u901f\u5ea6',
            dependentVariable: step9.dependentVariableLabel || '\u4e94\u89d2\u661f\u8fd0\u52a8\u72b6\u6001\uff08\u98de\u884c\u9ad8\u4f4e\u548c\u8fdc\u8fd1\uff09',
            slowObservation: step9.slowObservationChoice || '',
            fastObservation: step9.fastObservationChoice || ''
          },
          generatedAt: dateText
        }
      };

      const resultIndex = resultList.findIndex((item) => item && item.id === resultId);
      if (resultIndex >= 0) resultList[resultIndex] = resultData;
      else resultList.unshift(resultData);
      uni.setStorageSync('experimentResults', resultList);
      this.trackAbilityEvent('dataAnalysis');
    },
    syncStep10ReportToRecordCenter(payload = {}) {
      const exp = this.currentExperiment || {};
      if (!exp.id) return;

      const storageExperimentId =
        exp.legacyId !== null && exp.legacyId !== undefined ? exp.legacyId : exp.id;
      const step8 = this.flowData.step8 || {};
      const step10 = {
        ...(this.flowData.step10 || {}),
        ...(payload || {})
      };
      const dateText = payload.generatedAt || step10.generatedAt || nowText();
      const reportTemplate = buildUnifiedReportTemplate(this.currentExperiment, {
        ...this.flowData,
        step10
      });

      const reportList = Array.isArray(uni.getStorageSync('experimentReports'))
        ? uni.getStorageSync('experimentReports')
        : [];
      const reportData = {
        experimentId: storageExperimentId,
        experimentName: exp.title,
        date: dateText,
        source: 'phase2-flow-step10',
        sourceStep: 'step10',
        status: 'completed',
        generatedAt: step10.generatedAt || dateText,
        reportGenerated: step10.reportGenerated === true,
        summary: step10.result || I18N.reportSkeleton,
        phenomenon: step10.phenomenon || '',
        principle: step10.principle || '',
        improvement: step10.improvement || '',
        result: step10.result || '',
        virtualLabNote: step8.virtualLabNote || '',
        virtualEvidence: Array.isArray(step8.evidenceList) ? step8.evidenceList : [],
        templateVersion: 'phase2-report-v1',
        templateContent: step10.templateContent || reportTemplate.text,
        reportTemplateText: step10.templateContent || reportTemplate.text,
        reportTemplateSections: reportTemplate.sections
      };
      const dedupeKey = `${storageExperimentId}-${reportData.generatedAt || dateText}`;
      const nextReport = appendVersionedReportRecord(reportList, reportData, { dedupeKey });
      uni.setStorageSync('experimentReports', nextReport.list);
      this.trackAbilityEvent('reportMaking');
    },
    persistPhase2Records() {
      const exp = this.currentExperiment;
      const storageExperimentId =
        exp.legacyId !== null && exp.legacyId !== undefined ? exp.legacyId : exp.id;
      const dateText = nowText();
      const reportTemplate = this.ensureReportTemplate();

      const step2 = this.flowData.step2 || {};
      const step8 = this.flowData.step8 || {};
      const step9 = this.flowData.step9 || {};
      const step10 = this.flowData.step10 || {};

      const planSheets = Array.isArray(uni.getStorageSync('experimentPlanSheets'))
        ? uni.getStorageSync('experimentPlanSheets')
        : [];
      const planId = `phase2-plan-${exp.id}`;
      const planData = {
        id: planId,
        experimentId: storageExperimentId,
        experimentName: exp.title,
        createTime: dateText,
        source: 'phase2-flow',
        basicInfo: {
          participants: step2.participants || '',
          date: step2.date || '',
          environment: step2.environment || ''
        },
        summary: step10.result || I18N.planSkeleton,
        flowSnapshot: {
          step1: this.flowData.step1,
          step3: this.flowData.step3,
          step4: this.flowData.step4,
          step5: this.flowData.step5,
          step6: this.flowData.step6,
          step7: this.flowData.step7,
          step8: {
            completed: step8.completed === true,
            completedAt: step8.completedAt || '',
            virtualLabNote: step8.virtualLabNote || '',
            evidenceList: Array.isArray(step8.evidenceList) ? step8.evidenceList : []
          }
        }
      };
      const planIndex = planSheets.findIndex((item) => item && item.id === planId);
      if (planIndex >= 0) planSheets[planIndex] = planData;
      else planSheets.unshift(planData);
      uni.setStorageSync('experimentPlanSheets', planSheets);

      const resultList = Array.isArray(uni.getStorageSync('experimentResults'))
        ? uni.getStorageSync('experimentResults')
        : [];
      const resultId = `phase2-data-${exp.id}`;
      const resultData = {
        id: resultId,
        experimentId: storageExperimentId,
        name: exp.title,
        date: dateText,
        source: 'phase2-flow',
        status: 'completed',
        recorder: step2.participants || '',
        result: step10.result || I18N.dataSkeleton,
        summary: step10.result || '',
        discoveries: step9.findings || '',
        qualitativeData: step9.qualitativeRecord || '',
        virtualLabNote: step8.virtualLabNote || '',
        virtualEvidence: Array.isArray(step8.evidenceList) ? step8.evidenceList : [],
        analysisDetail: {
          findings: step9.findings || '',
          qualitativeRecord: step9.qualitativeRecord || '',
          variableTable: {
            independentVariable: step9.independentVariableLabel || '\u65cb\u8f6c\u901f\u5ea6',
            dependentVariable: step9.dependentVariableLabel || '\u4e94\u89d2\u661f\u8fd0\u52a8\u72b6\u6001\uff08\u98de\u884c\u9ad8\u4f4e\u548c\u8fdc\u8fd1\uff09',
            slowObservation: step9.slowObservationChoice || '',
            fastObservation: step9.fastObservationChoice || ''
          },
          generatedAt: step9.generatedAt || dateText
        }
      };
      const resultIndex = resultList.findIndex((item) => item && item.id === resultId);
      if (resultIndex >= 0) resultList[resultIndex] = resultData;
      else resultList.unshift(resultData);
      uni.setStorageSync('experimentResults', resultList);

      const reportList = Array.isArray(uni.getStorageSync('experimentReports'))
        ? uni.getStorageSync('experimentReports')
        : [];
      const reportData = {
        experimentId: storageExperimentId,
        experimentName: exp.title,
        date: dateText,
        source: 'phase2-flow',
        sourceStep: 'step10',
        status: 'completed',
        generatedAt: step10.generatedAt || dateText,
        reportGenerated: step10.reportGenerated === true,
        summary: step10.result || I18N.reportSkeleton,
        phenomenon: step10.phenomenon || '',
        principle: step10.principle || '',
        improvement: step10.improvement || '',
        result: step10.result || '',
        virtualLabNote: step8.virtualLabNote || '',
        virtualEvidence: Array.isArray(step8.evidenceList) ? step8.evidenceList : [],
        templateVersion: reportTemplate.version,
        templateContent: step10.templateContent || reportTemplate.text,
        reportTemplateText: step10.templateContent || reportTemplate.text,
        reportTemplateSections: reportTemplate.sections
      };
      const dedupeKey = `${storageExperimentId}-${reportData.generatedAt || dateText}`;
      const nextReport = appendVersionedReportRecord(reportList, reportData, { dedupeKey });
      uni.setStorageSync('experimentReports', nextReport.list);

      if (typeof exp.legacyId === 'number') {
        updateExperimentProgress(exp.legacyId, 'principle', true);
        updateExperimentProgress(exp.legacyId, 'plan', true);
        if (STEP_RULES.step8.validate(this.flowData.step8 || {}, this.flowData, this.currentExperiment)) {
          updateExperimentProgress(exp.legacyId, 'virtual', true);
        }
        if (hasText(step9.qualitativeRecord) || hasText(step9.findings) || hasText(step10.result)) {
          updateExperimentProgress(exp.legacyId, 'data', true);
        }
      }
    },
    finishFlow() {
      this.ensureReportTemplate();
      if (!this.validateAllSteps()) return;
      this.persistPhase2Records();
      clearFlowDraft(this.experimentId);

      uni.showModal({
        title: I18N.flowDoneTitle,
        content: I18N.flowDoneContent,
        confirmText: I18N.openRecordConfirm,
        cancelText: I18N.backHomeCancel,
        success: (res) => {
          if (res.confirm) {
            uni.redirectTo({ url: '/pages/record/record' });
          } else {
            uni.redirectTo({ url: '/pages/index/index' });
          }
        }
      });
    },
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
      if (pages.length > 1) {
        uni.navigateBack();
        return;
      }
      uni.redirectTo({ url: '/pages/index/index' });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20rpx;
  background:
    radial-gradient(circle at 15% 8%, rgba(255, 182, 193, 0.25), transparent 30%),
    radial-gradient(circle at 92% 22%, rgba(135, 206, 250, 0.25), transparent 28%),
    radial-gradient(circle at 50% 90%, rgba(152, 251, 152, 0.2), transparent 35%),
    linear-gradient(180deg, #f6f4ff 0%, #edf4ff 45%, #f6fcff 100%);
  box-sizing: border-box;
  position: relative;
}

.decor-bubbles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  animation: float-bubble 4s ease-in-out infinite;
}

.bubble-1 {
  width: 60rpx;
  height: 60rpx;
  top: 15%;
  left: 5%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 182, 193, 0.6), rgba(255, 182, 193, 0.2));
  animation-delay: 0s;
}

.bubble-2 {
  width: 40rpx;
  height: 40rpx;
  top: 30%;
  right: 8%;
  background: radial-gradient(circle at 30% 30%, rgba(135, 206, 250, 0.6), rgba(135, 206, 250, 0.2));
  animation-delay: 1s;
}

.bubble-3 {
  width: 50rpx;
  height: 50rpx;
  top: 60%;
  left: 10%;
  background: radial-gradient(circle at 30% 30%, rgba(152, 251, 152, 0.6), rgba(152, 251, 152, 0.2));
  animation-delay: 2s;
}

@keyframes float-bubble {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30rpx) scale(1.1); }
}

.top-card {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #FF6B9D 0%, #FFB347 30%, #87CEEB 60%, #98FB98 100%);
  background-size: 300% 300%;
  animation: rainbow 6s ease infinite;
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 14rpx 30rpx rgba(255, 107, 157, 0.35);
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn,
.save-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 22rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999rpx;
  padding: 8rpx 14rpx;
  transition: all 0.3s ease;
}

.back-btn:active,
.save-btn:active {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0.95);
}

.btn-icon {
  font-size: 20rpx;
}

.flow-title {
  margin-top: 14rpx;
  font-size: 32rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1.4;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.flow-subtitle {
  margin-top: 10rpx;
  font-size: 23rpx;
  color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.subtitle-icon {
  font-size: 20rpx;
}

.separator {
  margin: 0 4rpx;
}

.progress-track {
  margin-top: 16rpx;
  height: 18rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 18rpx;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  position: relative;
  transition: width 0.5s ease;
}

.progress-star {
  position: absolute;
  right: 4rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14rpx;
  animation: star-pulse 1s ease-in-out infinite;
}

@keyframes star-pulse {
  0%, 100% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.3); }
}

.progress-text {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: right;
}

.step-tabs {
  margin-top: 16rpx;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

.step-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 136rpx;
  margin-right: 18rpx;
  position: relative;
  vertical-align: top;
}

.step-item:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 28rpx;
  right: -13rpx;
  width: 16rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: rgba(255, 173, 122, 0.75);
  pointer-events: none;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 22rpx;
  right: -13rpx;
  width: 11rpx;
  height: 11rpx;
  border-top: 4rpx solid rgba(255, 173, 122, 0.75);
  border-right: 4rpx solid rgba(255, 173, 122, 0.75);
  transform: rotate(45deg);
  pointer-events: none;
}

.step-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  min-width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #8B5A2B;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.2);
  transition: all 0.3s ease;
}

.step-label {
  margin-top: 8rpx;
  width: 100%;
  font-size: 17rpx;
  line-height: 1.3;
  text-align: center;
  color: #315478;
  white-space: normal;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44rpx;
}

.chip-num {
  font-size: 22rpx;
}

.chip-icon {
  font-size: 16rpx;
  color: #2E8B57;
}

.step-item.done .step-chip {
  background: linear-gradient(135deg, #98FB98, #90EE90);
  color: #2E8B57;
}

.step-item.done:not(:last-child)::before {
  background: rgba(76, 175, 80, 0.75);
}

.step-item.done:not(:last-child)::after {
  border-top-color: rgba(76, 175, 80, 0.75);
  border-right-color: rgba(76, 175, 80, 0.75);
}

.step-item.active .step-chip {
  background: linear-gradient(135deg, #FF6B9D, #FFB347);
  color: #fff;
  animation: bounce-soft 1.5s ease-in-out infinite;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.5);
}

.step-item.active:not(:last-child)::before {
  background: rgba(255, 107, 157, 0.8);
}

.step-item.active:not(:last-child)::after {
  border-top-color: rgba(255, 107, 157, 0.8);
  border-right-color: rgba(255, 107, 157, 0.8);
}

@keyframes bounce-soft {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.step-item.locked .step-chip {
  background: rgba(255, 255, 255, 0.6);
  color: #BEBEBE;
}

.step-item.locked:not(:last-child)::before {
  background: rgba(190, 190, 190, 0.65);
}

.step-item.locked:not(:last-child)::after {
  border-top-color: rgba(190, 190, 190, 0.65);
  border-right-color: rgba(190, 190, 190, 0.65);
}

.step-item.error .step-chip {
  background: linear-gradient(135deg, #FFB6C1, #FFA07A);
  color: #CD5C5C;
}

.step-item.error:not(:last-child)::before {
  background: rgba(205, 92, 92, 0.72);
}

.step-item.error:not(:last-child)::after {
  border-top-color: rgba(205, 92, 92, 0.72);
  border-right-color: rgba(205, 92, 92, 0.72);
}

.step-item.active .step-label {
  color: #d54873;
  font-weight: 700;
}

.step-item.done .step-label {
  color: #2E8B57;
}

.step-item.locked .step-label {
  color: #9aa7b6;
}

.step-item.error .step-label {
  color: #c34f6a;
}

.step-shell {
  margin-top: 14rpx;
  position: relative;
  z-index: 1;
}

.nav-row {
  margin-top: 16rpx;
  display: flex;
  gap: 12rpx;
  position: relative;
  z-index: 1;
}

.nav-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  padding: 16rpx 0;
  transition: all 0.3s ease;
}

.nav-icon {
  font-size: 22rpx;
}

.nav-btn.prev {
  background: linear-gradient(135deg, #E8F4FD, #FFF5F8);
  color: #8B5A2B;
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}

.nav-btn.prev:active {
  transform: scale(0.98);
}

.nav-btn.next {
  background: linear-gradient(135deg, #4FACFE, #00F2FE);
  color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(79, 172, 254, 0.4);
}

.nav-btn.next:active {
  transform: scale(0.98);
}

.nav-btn.finish {
  background: linear-gradient(135deg, #FF6B9D, #FFB347);
  color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.4);
}

.nav-btn.finish:active {
  transform: scale(0.98);
}

.tips-card {
  margin-top: 14rpx;
  border-radius: 20rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #FFF9E6, #FFF0F5);
  border: 2rpx solid rgba(255, 217, 102, 0.5);
  display: flex;
  gap: 12rpx;
  position: relative;
  z-index: 1;
}

.tips-icon {
  font-size: 32rpx;
  animation: bounce-soft 2s ease-in-out infinite;
}

.tips-content {
  flex: 1;
}

.tips-title {
  font-size: 25rpx;
  color: #D4A017;
  font-weight: 700;
}

.tips-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8B6914;
  line-height: 1.6;
}

.blocker-card {
  margin-top: 10rpx;
  border-radius: 18rpx;
  padding: 14rpx 16rpx;
  border: 2rpx dashed rgba(255, 154, 118, 0.7);
  background: linear-gradient(135deg, #fff7f0, #fff2ef);
  position: relative;
  z-index: 1;
}

.blocker-card.ready {
  border-color: rgba(76, 175, 80, 0.75);
  background: linear-gradient(135deg, #f1fff3, #ecfff5);
}

.blocker-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #d95f3a;
}

.blocker-card.ready .blocker-title {
  color: #2e8b57;
}

.blocker-text {
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #8b4a2d;
}

.blocker-card.ready .blocker-text {
  color: #2f6f49;
}

/* 页面级微调：实验探究 */
.page {
  --kid-video-max-width: 620rpx;
  --kid-video-height: 268rpx;
  padding: 18rpx;
}

.top-card {
  border-radius: 22rpx;
  padding: 22rpx;
}

.flow-title {
  font-size: 34rpx;
  line-height: 1.42;
}

.flow-subtitle {
  font-size: 24rpx;
}

.progress-text {
  font-size: 22rpx;
}

.step-tabs {
  margin-top: 14rpx;
}

.step-item {
  width: 140rpx;
}

.step-chip {
  min-width: 60rpx;
  height: 60rpx;
}

.step-item:not(:last-child)::before {
  top: 30rpx;
}

.step-item:not(:last-child)::after {
  top: 24rpx;
}

.step-label {
  font-size: 18rpx;
  min-height: 48rpx;
}

.chip-num {
  font-size: 24rpx;
}

.step-shell {
  margin-top: 12rpx;
}

.nav-row {
  margin-top: 14rpx;
  gap: 10rpx;
}

.nav-btn {
  font-size: 25rpx;
  padding: 18rpx 0;
}

.tips-card {
  margin-top: 12rpx;
  border-radius: 18rpx;
  padding: 14rpx;
}

.tips-title {
  font-size: 26rpx;
}

.tips-text {
  font-size: 23rpx;
}

@media screen and (max-width: 900px) and (orientation: portrait) {
  .page {
    --kid-video-max-width: 660rpx;
    --kid-video-height: 288rpx;
    padding: 16rpx;
  }

  .top-card {
    padding: 20rpx;
  }

  .flow-title {
    font-size: 36rpx;
  }
}

@media screen and (min-width: 901px) and (orientation: landscape) {
  .page {
    --kid-video-max-width: 540rpx;
    --kid-video-height: 214rpx;
    padding: 14rpx 20rpx;
  }

  .top-card {
    padding: 18rpx;
  }

  .step-chip {
    min-width: 54rpx;
    height: 54rpx;
  }

  .step-item {
    width: 124rpx;
    margin-right: 16rpx;
  }

  .step-item:not(:last-child)::before {
    top: 27rpx;
  }

  .step-item:not(:last-child)::after {
    top: 21rpx;
  }

  .step-label {
    font-size: 16rpx;
    min-height: 42rpx;
  }
}

/* Progress V3: continuous mainline + grouped stage(2-7)
   - layout: 1 + [2~7] + 8 + 9 + 10
   - states: done(green), active(orange), pending(gray)
*/
.page .step-tabs {
  margin-top: 16rpx;
  padding: 14rpx 12rpx 16rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(244, 247, 255, 0.9), rgba(238, 244, 255, 0.82));
  border: 1px solid rgba(176, 189, 217, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.84), 0 10rpx 24rpx rgba(118, 133, 162, 0.16);
  backdrop-filter: blur(4px);
}

.page .step-tabs-inner {
  --flow-node-size: 96rpx;
  --flow-step-width: 170rpx;
  --flow-step-gap: 20rpx;
  --flow-line-y: 66rpx;
  min-width: 100%;
  display: inline-flex;
  justify-content: center;
}

.page .step-items-row {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  min-height: 224rpx;
  padding: 18rpx 6rpx 10rpx;
}

/* Main horizontal guide line under all 10 nodes */
.page .step-items-row::before {
  content: '';
  position: absolute;
  left: 44rpx;
  right: 44rpx;
  top: var(--flow-line-y);
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(181, 193, 213, 0.78), rgba(181, 193, 213, 0.55));
  box-shadow: 0 1px 2px rgba(110, 128, 154, 0.14);
  z-index: 2;
  pointer-events: none;
}

.page .step-item {
  position: relative;
  z-index: 4;
  width: var(--flow-step-width);
  margin-right: var(--flow-step-gap);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.page .step-item:last-child {
  margin-right: 0;
}

.page .step-chip {
  width: var(--flow-node-size);
  min-width: var(--flow-node-size);
  height: var(--flow-node-size);
  border-radius: 999rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  background: #dbe2ed;
  color: #8f9cb0;
  box-shadow: 0 6rpx 14rpx rgba(123, 139, 163, 0.2);
  transition: transform 0.2s ease, box-shadow 0.22s ease, background 0.22s ease, color 0.22s ease;
}

.page .chip-num {
  font-size: 44rpx;
  line-height: 1;
  font-weight: 700;
}

.page .chip-icon {
  font-size: 26rpx;
  line-height: 1;
}

.page .step-label {
  margin-top: 12rpx;
  width: 100%;
  min-height: 86rpx;
  font-size: 34rpx;
  line-height: 1.28;
  letter-spacing: 0.2rpx;
  font-weight: 700;
  text-align: center;
  color: #8d99ad;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page .step-item:not(:last-child)::before {
  top: calc(var(--flow-line-y) - 2rpx);
  right: -16rpx;
  width: 22rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: rgba(178, 189, 207, 0.92);
  z-index: 3;
}

.page .step-item:not(:last-child)::after {
  top: calc(var(--flow-line-y) - 7rpx);
  right: -16rpx;
  width: 10rpx;
  height: 10rpx;
  border-top: 3rpx solid rgba(178, 189, 207, 0.92);
  border-right: 3rpx solid rgba(178, 189, 207, 0.92);
  transform: rotate(45deg);
  z-index: 3;
}

/* Done: green node + green arrows to the next step */
.page .step-item.done .step-chip {
  background: linear-gradient(135deg, #74d978, #56bc68);
  color: #ffffff;
  box-shadow: 0 10rpx 20rpx rgba(84, 184, 109, 0.28);
}

.page .step-item.done .step-label {
  color: #2f9962;
}

.page .step-item.done .chip-icon {
  color: #ffffff;
}

.page .step-item.done:not(:last-child)::before {
  background: rgba(88, 190, 111, 0.95);
}

.page .step-item.done:not(:last-child)::after {
  border-top-color: rgba(88, 190, 111, 0.95);
  border-right-color: rgba(88, 190, 111, 0.95);
}

/* Active: orange highlighted node, but outgoing arrow remains gray */
.page .step-item.active .step-chip {
  background: linear-gradient(135deg, #ffb062, #ff8b4e);
  color: #fff;
  transform: scale(1.08);
  box-shadow: 0 12rpx 24rpx rgba(255, 150, 79, 0.44);
}

.page .step-item.active .step-label {
  color: #ef8a3b;
  font-weight: 700;
}

.page .step-item.active:not(:last-child)::before {
  background: rgba(178, 189, 207, 0.92);
}

.page .step-item.active:not(:last-child)::after {
  border-top-color: rgba(178, 189, 207, 0.92);
  border-right-color: rgba(178, 189, 207, 0.92);
}

.page .step-item.locked .step-chip {
  background: #dce3ee;
  color: #9ba8bc;
  border-color: rgba(255, 255, 255, 0.64);
  box-shadow: none;
}

.page .step-item.locked .step-label {
  color: #9aa6b9;
}

.page .step-item.locked:not(:last-child)::before {
  background: rgba(180, 190, 205, 0.62);
}

.page .step-item.locked:not(:last-child)::after {
  border-top-color: rgba(180, 190, 205, 0.62);
  border-right-color: rgba(180, 190, 205, 0.62);
}

.page .step-group-container {
  position: relative;
  z-index: 1;
  margin-right: var(--flow-step-gap);
  display: inline-flex;
  align-items: stretch;
}

.page .group-background {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 34rpx;
  padding: 38rpx 24rpx 20rpx;
  background: #e8e5f5;
  border: 2rpx solid rgba(120, 207, 178, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 10rpx 22rpx rgba(122, 136, 168, 0.16);
  overflow: visible;
}

/* Stage badge for step 2~7 */
.page .group-label {
  position: absolute;
  z-index: 5;
  top: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38rpx;
  line-height: 1.35;
  padding: 8rpx 26rpx 9rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 0.5rpx;
  color: #fff;
  background: linear-gradient(135deg, #d088df, #b87cd5);
  box-shadow: 0 6rpx 14rpx rgba(174, 121, 203, 0.36);
  white-space: nowrap;
}

.page .group-steps {
  display: inline-flex;
  align-items: flex-start;
  margin-top: 10rpx;
}

.page .group-step {
  margin-right: var(--flow-step-gap);
}

.page .group-step:last-child {
  margin-right: 0;
}

.page .step-group-container.stage-active .group-background {
  border-color: rgba(255, 150, 90, 0.78);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 4rpx rgba(255, 166, 117, 0.18), 0 12rpx 28rpx rgba(252, 157, 111, 0.24);
}

.page .step-group-container.stage-active .group-label {
  background: linear-gradient(135deg, #de95e8, #ca86df);
  box-shadow: 0 7rpx 16rpx rgba(192, 126, 221, 0.36);
}

.page .step-group-container.stage-done .group-background {
  border-color: rgba(95, 201, 134, 0.7);
}

.page .step-group-container.stage-done .group-label {
  background: linear-gradient(135deg, #5ac590, #48b18f);
}

@media screen and (max-width: 1100px) {
  .page .step-tabs-inner {
    --flow-node-size: 84rpx;
    --flow-step-width: 150rpx;
    --flow-step-gap: 16rpx;
    --flow-line-y: 60rpx;
  }

  .page .step-items-row {
    min-height: 206rpx;
  }

  .page .step-label {
    min-height: 78rpx;
    font-size: 30rpx;
  }

  .page .group-background {
    border-radius: 24rpx;
    padding: 34rpx 16rpx 14rpx;
  }

  .page .group-label {
    top: 8rpx;
    padding: 6rpx 18rpx;
    font-size: 26rpx;
  }
}

@media screen and (max-width: 900px) and (orientation: portrait) {
  .page .step-tabs {
    padding: 10rpx 8rpx 12rpx;
    border-radius: 20rpx;
  }

  .page .step-tabs-inner {
    min-width: max-content;
  }

  .page .step-items-row {
    padding: 14rpx 4rpx 6rpx;
  }
}

@media screen and (min-width: 901px) and (orientation: landscape) {
  .page .step-tabs-inner {
    --flow-node-size: 76rpx;
    --flow-step-width: 132rpx;
    --flow-step-gap: 14rpx;
    --flow-line-y: 54rpx;
  }

  .page .step-item:not(:last-child)::before {
    right: -12rpx;
    width: 14rpx;
  }

  .page .step-item:not(:last-child)::after {
    right: -12rpx;
    width: 8rpx;
    height: 8rpx;
  }
}

/* Progress V3 Bugfix
   1) fix text clipping under responsive breakpoints
   2) independent steps use rounded pink labels (no numeric circles)
*/
.page .step-tabs-inner {
  --flow-node-size: 96rpx;
  --flow-step-width: 170rpx;
  --flow-step-gap: 20rpx;
  --flow-line-y: 66rpx;
}

.page .step-items-row {
  min-height: 232rpx;
}

/* Remove the single continuous baseline; keep only arrow-chain links */
.page .step-items-row::before {
  content: none;
}

/* Group steps keep number circles and labels, but prevent clipping on resize */
.page .group-step .step-label {
  margin-top: 10rpx;
  min-height: 72rpx;
  max-height: 72rpx;
  font-size: 26rpx;
  line-height: 1.38;
  font-weight: 700;
  word-break: break-all;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Stage container visual polish */
.page .group-background {
  background: #e8e5f5;
  padding: 44rpx 24rpx 22rpx;
}

.page .group-label {
  top: 10rpx;
  min-height: 0;
  padding: 10rpx 16rpx;
  font-size: 26rpx;
  line-height: 1.28;
  letter-spacing: 0.2rpx;
  white-space: nowrap;
  background: linear-gradient(135deg, #d18ade, #bf7bd5);
}

/* Independent steps: use pink rounded labels instead of number circles */
.page .step-item.independent {
  width: 188rpx;
}

.page .step-item.independent .step-pill {
  width: 100%;
  min-height: 96rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: linear-gradient(135deg, #d18ade, #bf7bd5);
  box-shadow: 0 8rpx 18rpx rgba(181, 126, 209, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
}

.page .step-item.independent .pill-text {
  color: #ffffff;
  font-size: 26rpx;
  line-height: 1.28;
  font-weight: 700;
  text-align: center;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.page .step-item.independent.done .step-pill {
  background: linear-gradient(135deg, #d18ade, #bf7bd5);
}

.page .step-item.independent.active .step-pill {
  background: linear-gradient(135deg, #ffb062, #ff8b4e);
  box-shadow: 0 12rpx 24rpx rgba(255, 150, 79, 0.42);
  transform: scale(1.04);
}

.page .step-item.independent.locked .step-pill {
  background: linear-gradient(135deg, #d9dfee, #cfd6e6);
  box-shadow: none;
}

.page .step-item.independent.locked .pill-text {
  color: #9aa6b9;
}

/* Arrow segment across the grouped container boundary (step7 -> step8) */
.page .step-group-container::before {
  content: '';
  position: absolute;
  top: calc(var(--flow-line-y) - 2rpx);
  right: -16rpx;
  width: 18rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: rgba(178, 189, 207, 0.92);
  z-index: 3;
}

.page .step-group-container::after {
  content: '';
  position: absolute;
  top: calc(var(--flow-line-y) - 7rpx);
  right: -16rpx;
  width: 10rpx;
  height: 10rpx;
  border-top: 3rpx solid rgba(178, 189, 207, 0.92);
  border-right: 3rpx solid rgba(178, 189, 207, 0.92);
  transform: rotate(45deg);
  z-index: 3;
}

.page .step-group-container.stage-done::before {
  background: rgba(88, 190, 111, 0.95);
}

.page .step-group-container.stage-done::after {
  border-top-color: rgba(88, 190, 111, 0.95);
  border-right-color: rgba(88, 190, 111, 0.95);
}

@media screen and (max-width: 1100px) {
  .page .step-tabs-inner {
    --flow-node-size: 84rpx;
    --flow-step-width: 152rpx;
    --flow-step-gap: 16rpx;
    --flow-line-y: 60rpx;
  }

  .page .step-items-row {
    min-height: 216rpx;
  }

  .page .step-item.independent {
    width: 166rpx;
  }

  .page .step-item.independent .step-pill {
    min-height: 84rpx;
  }

  .page .step-item.independent .pill-text {
    font-size: 24rpx;
  }

  .page .group-step .step-label {
    min-height: 66rpx;
    max-height: 66rpx;
    font-size: 24rpx;
    line-height: 1.38;
  }

  .page .group-label {
    font-size: 24rpx;
  }
}

@media screen and (min-width: 901px) and (orientation: landscape) {
  .page .step-tabs-inner {
    --flow-node-size: 74rpx;
    --flow-step-width: 132rpx;
    --flow-step-gap: 14rpx;
    --flow-line-y: 53rpx;
  }

  .page .step-items-row {
    min-height: 196rpx;
  }

  .page .step-item.independent {
    width: 146rpx;
  }

  .page .step-item.independent .step-pill {
    min-height: 74rpx;
    padding: 8rpx 12rpx;
  }

  .page .step-item.independent .pill-text {
    font-size: 22rpx;
  }

  .page .group-step .step-label {
    min-height: 62rpx;
    max-height: 62rpx;
    font-size: 22rpx;
    line-height: 1.38;
  }

  .page .group-label {
    font-size: 22rpx;
  }

  .page .step-group-container::before {
    right: -12rpx;
    width: 14rpx;
  }

  .page .step-group-container::after {
    right: -12rpx;
    width: 8rpx;
    height: 8rpx;
  }
}

/* Scheme C: collapsed stage bar + expandable plan details */
.page .step-tabs.collapse-mode {
  padding: 12rpx 10rpx 14rpx;
}

.page .step-tabs.collapse-mode .collapse-inner {
  width: max-content;
  min-width: max-content;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  overflow: visible;
}

.page .step-tabs.collapse-mode .collapse-inner.expanded {
  padding-bottom: 256rpx;
}

.page .stage-main-row {
  --stage-node-width: 220rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  padding: 6rpx 2rpx;
  position: relative;
  overflow: visible;
}

.page .stage-node {
  width: var(--stage-node-width);
  flex: 0 0 auto;
}

.page .stage-node.stage-node-plan {
  width: var(--stage-node-width);
}

.page .stage-node.stage-node-late {
  width: var(--stage-node-width);
}

.page .stage-plan-anchor {
  width: var(--stage-node-width);
  flex: 0 0 auto;
  position: relative;
}

.page .stage-plan-anchor .stage-node.stage-node-plan {
  width: 100%;
}

.page .stage-pill {
  width: 100%;
  min-height: 84rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.82);
  background: linear-gradient(135deg, #d8e0ec, #cfd8e7);
  box-shadow: 0 8rpx 18rpx rgba(124, 138, 162, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-sizing: border-box;
}

.page .stage-text {
  color: #7f8ea6;
  font-size: 24rpx;
  line-height: 1.2;
  font-weight: 700;
  text-align: center;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page .stage-toggle {
  color: rgba(255, 255, 255, 0.92);
  font-size: 18rpx;
  font-weight: 700;
  line-height: 1;
  padding-top: 2rpx;
}

.page .stage-node.done .stage-pill {
  background: linear-gradient(135deg, #75d97c, #58c06d);
}

.page .stage-node.done .stage-text {
  color: #ffffff;
}

.page .stage-node.done .stage-toggle {
  color: rgba(255, 255, 255, 0.96);
}

.page .stage-node.active .stage-pill {
  background: linear-gradient(135deg, #ffb164, #ff8c4f);
  box-shadow: 0 10rpx 22rpx rgba(255, 150, 82, 0.36);
}

.page .stage-node.active .stage-text {
  color: #ffffff;
}

.page .stage-node.active .stage-toggle {
  color: rgba(255, 255, 255, 0.96);
}

.page .stage-node.locked .stage-pill {
  background: linear-gradient(135deg, #d8dee9, #ced6e4);
  box-shadow: none;
}

.page .stage-node.locked .stage-text {
  color: #97a5ba;
}

.page .stage-node.locked .stage-toggle {
  color: #97a5ba;
}

.page .stage-arrow {
  width: 34rpx;
  text-align: center;
  color: #b7c3d4;
  font-size: 34rpx;
  line-height: 1;
  font-weight: 700;
  margin: 0 6rpx;
}

.page .stage-arrow.done {
  color: #5fbe73;
}

.page .stage-expand-pop {
  position: absolute;
  top: calc(100% + 22rpx);
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  width: max-content;
}

.page .step-tabs.collapse-mode .step-group-container {
  margin-right: 0;
}

.page .step-tabs.collapse-mode .step-group-container::before,
.page .step-tabs.collapse-mode .step-group-container::after {
  display: none;
}

.page .step-tabs.collapse-mode .group-background {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 20rpx 18rpx;
  background: #e8e5f5;
}

.page .step-tabs.collapse-mode .group-label {
  display: none;
}

.page .step-tabs.collapse-mode .group-steps {
  margin-top: 0;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
}

.page .step-tabs.collapse-mode .group-step {
  width: 148rpx;
  margin-right: 16rpx;
}

.page .step-tabs.collapse-mode .group-step:last-child {
  margin-right: 0;
}

.page .step-tabs.collapse-mode .group-step .step-chip {
  width: 72rpx;
  min-width: 72rpx;
  height: 72rpx;
}

.page .step-tabs.collapse-mode .group-step .chip-num {
  font-size: 30rpx;
}

.page .step-tabs.collapse-mode .group-step .chip-icon {
  font-size: 20rpx;
}

.page .step-tabs.collapse-mode .group-step .step-label {
  margin-top: 10rpx;
  min-height: 64rpx;
  max-height: 64rpx;
  font-size: 22rpx;
  line-height: 1.36;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

/* Unified status colors: done=green, active=orange, pending=gray */
.page .step-tabs.collapse-mode .group-step.done .step-chip {
  background: linear-gradient(135deg, #75d97c, #58c06d);
  color: #ffffff;
}

.page .step-tabs.collapse-mode .group-step.active .step-chip {
  background: linear-gradient(135deg, #ffb164, #ff8c4f);
  color: #ffffff;
}

.page .step-tabs.collapse-mode .group-step.locked .step-chip {
  background: linear-gradient(135deg, #d8e0ec, #cfd8e7);
  color: #96a4ba;
}

.page .step-tabs.collapse-mode .group-step.done .step-label {
  color: #2f9962;
}

.page .step-tabs.collapse-mode .group-step.active .step-label {
  color: #ef8b3d;
}

.page .step-tabs.collapse-mode .group-step.locked .step-label {
  color: #9aa6ba;
}

.page .step-tabs.collapse-mode .group-step:not(:last-child)::before {
  background: rgba(179, 190, 208, 0.92);
}

.page .step-tabs.collapse-mode .group-step:not(:last-child)::after {
  border-top-color: rgba(179, 190, 208, 0.92);
  border-right-color: rgba(179, 190, 208, 0.92);
}

.page .step-tabs.collapse-mode .group-step.done:not(:last-child)::before {
  background: rgba(95, 190, 115, 0.95);
}

.page .step-tabs.collapse-mode .group-step.done:not(:last-child)::after {
  border-top-color: rgba(95, 190, 115, 0.95);
  border-right-color: rgba(95, 190, 115, 0.95);
}

@media screen and (max-width: 1100px) {
  .page .step-tabs.collapse-mode .collapse-inner.expanded {
    padding-bottom: 236rpx;
  }

  .page .stage-main-row {
    --stage-node-width: 206rpx;
  }

  .page .stage-node {
    width: var(--stage-node-width);
  }

  .page .stage-node.stage-node-plan {
    width: var(--stage-node-width);
  }

  .page .stage-node.stage-node-late {
    width: var(--stage-node-width);
  }

  .page .stage-pill {
    min-height: 76rpx;
    padding: 8rpx 12rpx;
  }

  .page .stage-text {
    font-size: 22rpx;
  }

  .page .stage-arrow {
    width: 30rpx;
    font-size: 30rpx;
    margin: 0 4rpx;
  }

  .page .step-tabs.collapse-mode .group-step {
    width: 134rpx;
    margin-right: 12rpx;
  }

  .page .step-tabs.collapse-mode .group-step .step-label {
    min-height: 58rpx;
    max-height: 58rpx;
    font-size: 20rpx;
  }
}

@media screen and (min-width: 901px) and (orientation: landscape) {
  .page .step-tabs.collapse-mode .collapse-inner.expanded {
    padding-bottom: 206rpx;
  }

  .page .stage-main-row {
    --stage-node-width: 188rpx;
  }

  .page .stage-node {
    width: var(--stage-node-width);
  }

  .page .stage-node.stage-node-plan {
    width: var(--stage-node-width);
  }

  .page .stage-node.stage-node-late {
    width: var(--stage-node-width);
  }

  .page .stage-pill {
    min-height: 64rpx;
    padding: 6rpx 10rpx;
  }

  .page .stage-text {
    font-size: 18rpx;
  }

  .page .stage-arrow {
    width: 24rpx;
    font-size: 24rpx;
    margin: 0 3rpx;
  }

  .page .step-tabs.collapse-mode .group-background {
    padding: 16rpx 14rpx 12rpx;
  }

  .page .step-tabs.collapse-mode .group-label {
    display: none;
  }

  .page .step-tabs.collapse-mode .group-step {
    width: 116rpx;
    margin-right: 10rpx;
  }

  .page .step-tabs.collapse-mode .group-step .step-chip {
    width: 58rpx;
    min-width: 58rpx;
    height: 58rpx;
  }

  .page .step-tabs.collapse-mode .group-step .chip-num {
    font-size: 24rpx;
  }

  .page .step-tabs.collapse-mode .group-step .chip-icon {
    font-size: 16rpx;
  }

  .page .step-tabs.collapse-mode .group-step .step-label {
    min-height: 50rpx;
    max-height: 50rpx;
    font-size: 16rpx;
    line-height: 1.32;
  }
}
</style>
