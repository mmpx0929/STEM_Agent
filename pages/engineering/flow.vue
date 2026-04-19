﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
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
        <text>{{ i18n.engineeringCategory }}</text>
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
              <text class="stage-text">场景问题导入</text>
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
                <text class="stage-text">工程方案设计</text>
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
                      v-for="(step, index) in stepDefs.slice(1, 5)"
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
            :class="getStageNodeClass('step6')"
            @click="jumpStep(5)"
          >
            <view class="stage-pill">
              <text class="stage-text">虚拟实验探究</text>
            </view>
          </view>
          <text class="stage-arrow" :class="{ done: isStepValidByIndex(5) }">→</text>
          <view
            class="stage-node stage-node-late"
            :class="getStageNodeClass('step7')"
            @click="jumpStep(6)"
          >
            <view class="stage-pill">
              <text class="stage-text">测试与数据分析</text>
            </view>
          </view>
          <text class="stage-arrow" :class="{ done: isStepValidByIndex(6) }">→</text>
          <view
            class="stage-node stage-node-late"
            :class="getStageNodeClass('step8')"
            @click="jumpStep(7)"
          >
            <view class="stage-pill">
              <text class="stage-text">迭代与优化</text>
            </view>
          </view>
          <text class="stage-arrow" :class="{ done: isStepValidByIndex(7) }">→</text>
          <view
            class="stage-node stage-node-late"
            :class="getStageNodeClass('step9')"
            @click="jumpStep(8)"
          >
            <view class="stage-pill">
              <text class="stage-text">成果结论与反思</text>
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <view class="step-shell">
      <component
        :is="currentStep.component"
        :value="flowData[currentStep.key]"
        :flow-data="flowData"
        :experiment="currentExperiment"
        @update="onStepUpdate"
        @sync-plan="syncPlanToRecordCenter"
        @sync-data="syncDataToRecordCenter"
        @sync-report="syncReportToRecordCenter"
      />
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

    <view class="nav-row">
      <button class="nav-btn prev" :disabled="currentStepIndex === 0" @click="prevStep">
        <text class="nav-icon">⬅️</text>
        <text>{{ i18n.prevBtn }}</text>
      </button>
      <button class="nav-btn next" v-if="currentStepIndex < stepDefs.length - 1" @click="nextStep">
        <text>{{ i18n.nextBtn }}</text>
        <text class="nav-icon">➡️</text>
      </button>
      <button class="nav-btn finish" v-else @click="finishFlow">
        <text class="nav-icon">🎉</text>
        <text>{{ i18n.finishBtn }}</text>
      </button>
    </view>

    <AIChat
      :scene="aiGuideScene"
      :defaultOpen="false"
      pageContext="engineering-flow"
      :experiment-id="experimentId"
      :current-step="currentStep.key"
      :guide-key="aiGuideKey"
      :guide-text="aiGuideText"
      :guide-audio="aiGuideAudio"
      :auto-play="true"
    />
  </view>
</template>

<script>
import catalog from '@/config/experiment-catalog.js';
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';
import { ENGINEERING_STEP6_FINAL_RESULT_ID } from '@/config/engineering-step6-lab-config.js';
import { loadFlowDraft, saveFlowDraft, clearFlowDraft } from '@/utils/experimentFlowStore.js';
import { updateExperimentProgress } from '@/utils/experimentProgress.js';
import { trackGrowthAbilityEvent } from '@/utils/growthAbilityProgress.js';
import { appendVersionedReportRecord } from '@/utils/reportVersioning.js';
import { KID_COPY, toKidMissingHint, toKidLockedHint } from '@/config/kid-copy.js';
import {
  resolveFlowCopy,
  resolveFlowRuleTitle,
  resolveFlowBlockerTitle,
  resolveFlowStepRuleTip,
  resolveFlowCompleteHint,
  resolveFlowReadyToNextHint,
  resolveFlowStageTitle
} from '@/utils/flowCopyResolver.js';

import Step1SceneIntro from '@/components/engineering-flow/steps/Step1SceneIntro.vue';
import Step2SceneProblem from '@/components/engineering-flow/steps/Step2SceneProblem.vue';
import Step3PrincipleChoice from '@/components/engineering-flow/steps/Step3PrincipleChoice.vue';
import Step4ModelDesign from '@/components/engineering-flow/steps/Step4ModelDesign.vue';
import Step5PlanSheet from '@/components/engineering-flow/steps/Step5PlanSheet.vue';
import Step6VirtualBuild from '@/components/engineering-flow/steps/Step6VirtualBuild.vue';
import Step7TestData from '@/components/engineering-flow/steps/Step7TestData.vue';
import Step8Optimization from '@/components/engineering-flow/steps/Step8Optimization.vue';
import Step9Reflection from '@/components/engineering-flow/steps/Step9Reflection.vue';
import AIChat from '@/pages/plan/components/AIChat.vue';

const I18N = {
  backBtn: KID_COPY.nav.back,
  saveBtn: KID_COPY.nav.saveDraft,
  flowTitleFallback: '工程实践流程',
  engineeringCategory: 'STEM 工程实践',
  subSeparator: '·',
  prevBtn: KID_COPY.nav.prev,
  nextBtn: KID_COPY.nav.next,
  finishBtn: KID_COPY.nav.finish,
  ruleTitle: KID_COPY.tips.ruleTitle,
  untitledExperiment: '未命名工程实验',
  defaultRule: KID_COPY.toast.stepNotReady,
  draftSaved: KID_COPY.toast.draftSaved,
  step1Label: '场景问题导入',
  step2Label: '明确场景问题',
  step3Label: '科学原理应用',
  step4Label: '工程模型方案设计',
  step5Label: '生成方案表单',
  step6Label: '虚拟与实物搭建',
  step7Label: '测试与数据分析',
  step8Label: '迭代与优化',
  step9Label: '成果结论与反思',
  ruleStep1: '先观看场景视频，再确认核心问题。',
  ruleStep2: '请选择正确场景问题，并完成 AI 分析（选项A）。',
  ruleStep3: '请选择“离心力方案”，并完成 AI 分析（选项A）。',
  ruleStep4: '四类目标都要选择正确后，才可进入下一步。',
  ruleStep5: '点击一键生成工程方案表，并同步到记录中心。',
  ruleStep6: '请先完成最终成品“离心甩干机模型”，系统会自动完成第6步。',
  ruleStep7: '完成测试记录后，点击“生成数据记录表”。',
  ruleStep8: '至少保留一条“问题-方案-替换结构”的优化记录。',
  ruleStep9: '填写成果结论与反思并生成工程实践报告。',
  completeStepFirstPrefix: '请先完成第',
  completeStepFirstSuffix: '步',
  flowDoneTitle: '工程流程已完成',
  flowDoneContent: '你的工程方案、测试数据和实践报告都已保存到“我的实验记录”，现在去查看吗？',
  openRecordConfirm: '去查看',
  backHomeCancel: '返回首页'
};

const ENGINEERING_STEP_RULE_FALLBACK_MAP = {
  step1: I18N.ruleStep1,
  step2: I18N.ruleStep2,
  step3: I18N.ruleStep3,
  step4: I18N.ruleStep4,
  step5: I18N.ruleStep5,
  step6: I18N.ruleStep6,
  step7: I18N.ruleStep7,
  step8: I18N.ruleStep8,
  step9: I18N.ruleStep9
};

const createInitialEngineeringFlowData = () => ({
  step1: {
    videoWatched: false,
    coreQuestionText: ''
  },
  step2: {
    sceneProblemChoice: '',
    sceneProblemText: '',
    aiChecked: false,
    aiAnalysis: ''
  },
  step3: {
    principleChoice: '',
    principleText: '',
    aiChecked: false,
    aiAnalysis: ''
  },
  step4: {
    targetChoice: {},
    aiChecked: false,
    aiAnalysis: '',
    systemDesign: [],
    blueprintUploads: [],
    materials: [],
    customMaterials: [],
    buildSteps: [],
    buildStepOrder: [],
    buildStepCompleted: false
  },
  step5: {
    engineeringTitle: '',
    designer: '',
    designDate: '',
    planGenerated: false,
    generatedAt: ''
  },
  step6: {
    projectId: '',
    modelName: '',
    workspaceItems: [],
    workspaceLayout: [],
    resultItems: [],
    recipeProgress: {},
    actionLogs: [],
    evidenceList: [],
    offlineEvidenceList: [],
    notes: '',
    virtualCompleted: false,
    completedAt: ''
  },
  step7: {
    testType: 'qualitative',
    records: [],
    findings: '',
    analysisGenerated: false,
    generatedAt: ''
  },
  step8: {
    optimizationRows: [],
    aiSuggestion: ''
  },
  step9: {
    conclusion: '',
    reflection: '',
    extraFeeling: '',
    reportGenerated: false,
    generatedAt: ''
  }
});

const nowText = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const hasText = (value) => String(value || '').trim().length > 0;

const resolveTargetText = (template, targetType, targetKey) => {
  if (!template || !template.step4 || !template.step4.targetOptions) return '';
  const options = template.step4.targetOptions[targetType] || [];
  const hit = options.find((item) => item.key === targetKey);
  return hit ? hit.text : '';
};

const STEP_AI_SCENE_MAP = {
  step1: 'principle',
  step2: 'planning',
  step3: 'planning',
  step4: 'planning',
  step5: 'planning',
  step6: 'virtualLab',
  step7: 'dataAnalysis',
  step8: 'planning',
  step9: 'experimentSummary'
};

const STEP_AI_GUIDE_TEXT_MAP = {
  step1: '先看场景视频，确认我们要解决的真实生活问题。',
  step2: '请先明确场景问题，再进入下一步科学原理选择。',
  step3: '选择最能解决问题的科学原理，并用 AI 分析验证你的选择。',
  step4: '工程方案要同时关注功能、性能、成本和安全四个目标。',
  step5: '生成工程方案表前，先检查前面步骤是否已经完整填写。',
  step6: '开始虚拟搭建：先基础结构，再部件融合，最后上传证据。',
  step7: '测试与数据分析要真实记录，先写现象，再给出发现。',
  step8: '根据测试问题做迭代优化，优先解决最核心的结构问题。',
  step9: '最后写成果结论与反思，形成完整工程实践报告。'
};

export default {
  components: {
    AIChat,
    Step1SceneIntro,
    Step2SceneProblem,
    Step3PrincipleChoice,
    Step4ModelDesign,
    Step5PlanSheet,
    Step6VirtualBuild,
    Step7TestData,
    Step8Optimization,
    Step9Reflection
  },
  data() {
    return {
      i18n: I18N,
      experimentId: '',
      currentExperiment: {},
      planStageExpanded: false,
      currentStepIndex: 0,
      flowData: createInitialEngineeringFlowData(),
      stepDefs: [
        { key: 'step1', title: I18N.step1Label, component: 'Step1SceneIntro' },
        { key: 'step2', title: I18N.step2Label, component: 'Step2SceneProblem' },
        { key: 'step3', title: I18N.step3Label, component: 'Step3PrincipleChoice' },
        { key: 'step4', title: I18N.step4Label, component: 'Step4ModelDesign' },
        { key: 'step5', title: I18N.step5Label, component: 'Step5PlanSheet' },
        { key: 'step6', title: I18N.step6Label, component: 'Step6VirtualBuild' },
        { key: 'step7', title: I18N.step7Label, component: 'Step7TestData' },
        { key: 'step8', title: I18N.step8Label, component: 'Step8Optimization' },
        { key: 'step9', title: I18N.step9Label, component: 'Step9Reflection' }
      ]
    };
  },
  computed: {
    resolvedFlowCopy() {
      const experimentId = (this.currentExperiment && this.currentExperiment.id) || this.experimentId || '';
      return resolveFlowCopy({ experimentId, templateType: 'engineering' });
    },
    ruleTitle() {
      return resolveFlowRuleTitle(this.resolvedFlowCopy, I18N.ruleTitle);
    },
    engineeringFlowTemplate() {
      const experimentId = (this.currentExperiment && this.currentExperiment.id) || this.experimentId || '';
      return getEngineeringFlowTemplate(experimentId);
    },
    engineeringVoiceGuide() {
      return (this.engineeringFlowTemplate && this.engineeringFlowTemplate.voiceGuide) || {};
    },
    currentStep() {
      return this.stepDefs[this.currentStepIndex] || this.stepDefs[0];
    },
    progressPercent() {
      const total = this.stepDefs.length;
      if (!total) return 0;
      const done = this.stepDefs.filter((_, index) => this.isStepValidByIndex(index)).length;
      return Math.round((done / total) * 100);
    },
    maxUnlockedStepIndex() {
      const firstInvalid = this.stepDefs.findIndex((_, index) => !this.isStepValidByIndex(index));
      if (firstInvalid === -1) return this.stepDefs.length - 1;
      return firstInvalid;
    },
    isPlanStageActive() {
      return this.currentStepIndex >= 1 && this.currentStepIndex <= 4;
    },
    isPlanStageDone() {
      for (let idx = 1; idx <= 4; idx += 1) {
        if (!this.isStepValidByIndex(idx)) return false;
      }
      return true;
    },
    aiGuideKey() {
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : 'step1';
      const experimentId = (this.currentExperiment && this.currentExperiment.id) || this.experimentId || 'unknown';
      return `engineering-${experimentId}-${key}`;
    },
    aiGuideScene() {
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : 'step1';
      const sceneMap = (this.engineeringVoiceGuide && this.engineeringVoiceGuide.stepSceneMap) || STEP_AI_SCENE_MAP;
      return sceneMap[key] || STEP_AI_SCENE_MAP[key] || 'general';
    },
    aiGuideText() {
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : 'step1';
      const guideMap =
        (this.engineeringVoiceGuide && this.engineeringVoiceGuide.stepGuideTextMap) || STEP_AI_GUIDE_TEXT_MAP;
      return guideMap[key] || STEP_AI_GUIDE_TEXT_MAP[key] || '跟着当前步骤提示，完成工程实践流程。';
    },
    aiGuideAudio() {
      const key = this.currentStep && this.currentStep.key ? this.currentStep.key : 'step1';
      const audioMap =
        (this.engineeringVoiceGuide && this.engineeringVoiceGuide.stepGuideAudioMap)
        || (this.engineeringVoiceGuide && this.engineeringVoiceGuide.stepAudioMap)
        || {};
      return audioMap[key] || '';
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
          return resolveFlowCompleteHint(this.resolvedFlowCopy, '全部步骤都完成了，点击“完成流程”吧。');
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
  watch: {
    currentStepIndex() {
      this.updateNavigationBarTitle();
    }
  },
  onLoad(query) {
    this.experimentId = query.experimentId || 'engineering-01';
    this.loadExperiment();
    this.loadDraft();
    this.updateNavigationBarTitle();
  },
  onShow() {
    this.updateNavigationBarTitle();
  },
  methods: {
    updateNavigationBarTitle() {
      if (typeof uni === 'undefined' || typeof uni.setNavigationBarTitle !== 'function') return;
      const stepKey = this.currentStep && this.currentStep.key ? this.currentStep.key : '';
      const fallbackTitle = this.currentStep && this.currentStep.title ? this.currentStep.title : I18N.engineeringCategory;
      const title = resolveFlowStageTitle(this.resolvedFlowCopy, stepKey, fallbackTitle);
      uni.setNavigationBarTitle({
        title,
        fail: () => {}
      });
    },
    loadExperiment() {
      let found = null;
      (catalog.categories || []).forEach((category) => {
        (category.items || []).forEach((item) => {
          if (item.id === this.experimentId) found = item;
        });
      });
      this.currentExperiment = found || {
        id: this.experimentId,
        legacyId: null,
        title: I18N.untitledExperiment,
        templateType: 'engineering'
      };
    },
    loadDraft() {
      const draft = loadFlowDraft(this.experimentId);
      if (!draft) return;
      this.flowData = {
        ...createInitialEngineeringFlowData(),
        ...(draft.flowData || {})
      };
      if (typeof draft.currentStepIndex === 'number') {
        this.currentStepIndex = Math.max(0, Math.min(this.stepDefs.length - 1, draft.currentStepIndex));
      }
    },
    getStorageExperimentId() {
      const legacyId = this.currentExperiment && this.currentExperiment.legacyId;
      return legacyId !== null && legacyId !== undefined ? legacyId : this.currentExperiment.id;
    },
    getStepBlock(index) {
      const key = this.stepDefs[index] && this.stepDefs[index].key;
      return key ? this.flowData[key] || {} : {};
    },
    isStepValidByIndex(index) {
      const key = this.stepDefs[index] && this.stepDefs[index].key;
      const block = this.getStepBlock(index);
      if (key === 'step1') return block.videoWatched === true && hasText(block.coreQuestionText);
      if (key === 'step2') return block.aiChecked === true && block.sceneProblemChoice === 'A';
      if (key === 'step3') return block.aiChecked === true && block.principleChoice === 'A';
      if (key === 'step4') return block.aiChecked === true && block.buildStepCompleted === true;
      if (key === 'step5') return block.planGenerated === true;
      if (key === 'step6') return block.virtualCompleted === true
        && Array.isArray(block.resultItems)
        && block.resultItems.includes(ENGINEERING_STEP6_FINAL_RESULT_ID);
      if (key === 'step7') return block.analysisGenerated === true;
      if (key === 'step8') return Array.isArray(block.optimizationRows) && block.optimizationRows.length > 0;
      if (key === 'step9') return block.reportGenerated === true;
      return false;
    },
    getStepChipClass(index) {
      return {
        done: this.isStepValidByIndex(index),
        active: index === this.currentStepIndex,
        locked: index > this.maxUnlockedStepIndex
      };
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
      if (stageKey === 'step6') {
        return {
          active: this.currentStepIndex === 5,
          done: this.isStepValidByIndex(5),
          locked: this.maxUnlockedStepIndex < 5
        };
      }
      if (stageKey === 'step7') {
        return {
          active: this.currentStepIndex === 6,
          done: this.isStepValidByIndex(6),
          locked: this.maxUnlockedStepIndex < 6
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
    getRuleTip(stepKey) {
      const fallback = ENGINEERING_STEP_RULE_FALLBACK_MAP[stepKey] || I18N.defaultRule;
      return resolveFlowStepRuleTip(this.resolvedFlowCopy, stepKey, fallback);
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
    onStepUpdate(payload) {
      const key = this.currentStep.key;
      const next = payload && typeof payload === 'object' ? { ...payload } : {};

      if (key === 'step6') {
        const validStep6 = next.virtualCompleted === true
          && Array.isArray(next.resultItems)
          && next.resultItems.includes(ENGINEERING_STEP6_FINAL_RESULT_ID);
        if (validStep6 && !next._abilityModelBuildingTrackedAt) {
          this.trackAbilityEvent('modelBuilding');
          next._abilityModelBuildingTrackedAt = nowText();
        }
      }
      if (key === 'step8') {
        const validStep8 = Array.isArray(next.optimizationRows) && next.optimizationRows.length > 0;
        if (validStep8 && !next._abilityOptimizationTrackedAt) {
          this.trackAbilityEvent('optimization');
          next._abilityOptimizationTrackedAt = nowText();
        }
      }

      this.flowData = {
        ...this.flowData,
        [key]: next
      };
      this.saveDraft({ silent: true });
    },
    saveDraft(options = {}) {
      saveFlowDraft(this.experimentId, {
        experimentId: this.experimentId,
        currentStepIndex: this.currentStepIndex,
        flowData: this.flowData
      });
      if (!options.silent) {
        uni.showToast({ title: I18N.draftSaved, icon: 'none' });
      }
    },
    jumpStep(index) {
      if (index < 0 || index >= this.stepDefs.length) return;
      if (index > this.maxUnlockedStepIndex) {
        const lockIndex = this.maxUnlockedStepIndex + 1;
        const lockStep = this.stepDefs[lockIndex - 1];
        uni.showToast({ title: toKidLockedHint(lockIndex, lockStep && lockStep.title), icon: 'none' });
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
      if (!this.isStepValidByIndex(this.currentStepIndex)) {
        uni.showToast({ title: toKidMissingHint(this.getRuleTip(this.currentStep.key)), icon: 'none' });
        return;
      }
      if (this.currentStepIndex >= this.stepDefs.length - 1) return;
      this.currentStepIndex += 1;
      this.saveDraft({ silent: true });
    },
    syncPlanToRecordCenter(payload = {}) {
      const exp = this.currentExperiment || {};
      if (!exp.id) return;
      const template = getEngineeringFlowTemplate(exp.id);
      const generatedAt = payload.generatedAt || nowText();
      const step2 = this.flowData.step2 || {};
      const step3 = this.flowData.step3 || {};
      const step4 = this.flowData.step4 || {};
      const step5 = this.flowData.step5 || {};
      const templateBuildSteps =
        template && template.step4 && Array.isArray(template.step4.buildSteps)
          ? template.step4.buildSteps
          : [];
      const templateBuildStepOptions =
        template && template.step4 && Array.isArray(template.step4.buildStepOptions)
          ? template.step4.buildStepOptions
          : [];
      const runtimeBuildSteps = Array.isArray(step4.buildSteps) ? step4.buildSteps : [];
      const mergedBuildSteps = templateBuildSteps.length > 0 ? templateBuildSteps : runtimeBuildSteps;
      const optionMap = {};
      templateBuildStepOptions.forEach((item) => {
        if (!item || !item.key) return;
        optionMap[item.key] = item;
      });
      const preferredOrder =
        Array.isArray(step4.buildStepOrder) && step4.buildStepOrder.length > 0
          ? step4.buildStepOrder
          : templateBuildStepOptions.map((item) => item && item.key).filter((key) => !!key);
      const detailStepBlocks = preferredOrder
        .map((key, index) => {
          const option = optionMap[key];
          if (!option) return '';
          const title = String(option.title || '').trim() || `步骤${index + 1}`;
          const lines = Array.isArray(option.lines) ? option.lines.map((line) => String(line || '').trim()).filter((line) => line) : [];
          const block = [`${index + 1}. ${title}`, ...lines];
          return block.join('\n');
        })
        .filter((item) => item);
      const detailStepsText =
        detailStepBlocks.length > 0
          ? detailStepBlocks.join('\n\n')
          : mergedBuildSteps.join('\n');

      const targetChoice = step4.targetChoice || {};
      const goals = [];
      const fn = resolveTargetText(template, 'function', targetChoice.function);
      const perf = resolveTargetText(template, 'performance', targetChoice.performance);
      const cost = resolveTargetText(template, 'cost', targetChoice.cost);
      const safe = resolveTargetText(template, 'safety', targetChoice.safety);
      if (fn) goals.push(`功能目标：${fn}`);
      if (perf) goals.push(`性能目标：${perf}`);
      if (cost) goals.push(`成本目标：${cost}`);
      if (safe) goals.push(`安全目标：${safe}`);

      const normalizeBlueprintItem = (item, fallbackLabel = '') => {
        if (!item || typeof item !== 'object') return null;
        const path = String(item.path || '').trim();
        if (!path) return null;
        return {
          label: fallbackLabel,
          name: String(item.name || '').trim() || fallbackLabel || '图纸',
          path
        };
      };
      const templateBlueprints = (template && template.step4 && Array.isArray(template.step4.blueprints))
        ? template.step4.blueprints
        : [];
      const referenceBlueprint = normalizeBlueprintItem(templateBlueprints[0], '模型参考图纸');
      const aiSourceBlueprint = normalizeBlueprintItem(templateBlueprints[1], 'AI 一键生成图纸') || referenceBlueprint;
      const aiGeneratedBlueprint = normalizeBlueprintItem(step4.blueprintAIResult, 'AI 一键生成图纸');
      const uploadedList = Array.isArray(step4.blueprintUploads) ? step4.blueprintUploads : [];
      const uploadedBlueprint = normalizeBlueprintItem(
        uploadedList.length > 0 ? uploadedList[uploadedList.length - 1] : null,
        '上传我的设计图纸'
      );
      const planBlueprints = [
        {
          label: '模型参考图纸',
          name: (referenceBlueprint && referenceBlueprint.name) || '未同步',
          path: (referenceBlueprint && referenceBlueprint.path) || ''
        },
        {
          label: 'AI 一键生成图纸',
          name: (aiGeneratedBlueprint && aiGeneratedBlueprint.name)
            || (aiSourceBlueprint && aiSourceBlueprint.name)
            || '未同步',
          path: (aiGeneratedBlueprint && aiGeneratedBlueprint.path) || ''
        },
        {
          label: '上传我的设计图纸',
          name: (uploadedBlueprint && uploadedBlueprint.name) || '未上传',
          path: (uploadedBlueprint && uploadedBlueprint.path) || ''
        }
      ];

      const list = Array.isArray(uni.getStorageSync('experimentPlanSheets')) ? uni.getStorageSync('experimentPlanSheets') : [];
      const planId = `eng-plan-${exp.id}`;
      const planData = {
        id: planId,
        experimentId: this.getStorageExperimentId(),
        experimentName: exp.title,
        createTime: generatedAt,
        source: 'engineering-flow-step5',
        status: 'completed',
        summary: '工程模型方案设计已生成',
        basicInfo: {
          participants: step5.designer || '',
          date: step5.designDate || '',
          environment: '工程实践'
        },
        flowSnapshot: {
          step3: {
            question: step2.sceneProblemText || '',
            hypothesisText: step3.principleText || ''
          },
          step4: {
            selectedGoals: goals,
            blueprints: planBlueprints
          },
          step5: {
            sceneChoice: 'engineering',
            strategyChoice: '工程模型方案',
            materialItems: [...(step4.materials || []), ...(step4.customMaterials || [])]
          },
          step7: {
            detailSteps: detailStepsText,
            planGenerated: true,
            generatedAt
          }
        },
        engineeringSnapshot: this.flowData
      };
      const index = list.findIndex((item) => item && item.id === planId);
      if (index >= 0) list[index] = planData;
      else list.unshift(planData);
      uni.setStorageSync('experimentPlanSheets', list);
      this.trackAbilityEvent('engineeringDesign');
    },
    syncDataToRecordCenter(payload = {}) {
      const exp = this.currentExperiment || {};
      if (!exp.id) return;
      const generatedAt = payload.generatedAt || nowText();
      const step5 = this.flowData.step5 || {};
      const step6 = this.flowData.step6 || {};
      const records = payload.records || [];
      const dewater = records.find((item) => item.key === 'dewater');
      const performance = records.find((item) => item.key === 'performance');
      const pickText = (row) => {
        if (!row || !Array.isArray(row.options)) return '';
        const hit = row.options.find((item) => item.key === row.choice);
        return hit ? hit.text : '';
      };

      const list = Array.isArray(uni.getStorageSync('experimentResults')) ? uni.getStorageSync('experimentResults') : [];
      const dataId = `eng-data-${exp.id}`;
      const data = {
        id: dataId,
        experimentId: this.getStorageExperimentId(),
        name: exp.title,
        date: generatedAt,
        source: 'engineering-flow-step7',
        status: 'completed',
        recorder: step5.designer || '',
        result: payload.findings || '',
        summary: payload.findings || '工程测试数据已生成',
        discoveries: payload.findings || '',
        qualitativeData: payload.qualitativeRecord || payload.findings || '',
        virtualLabNote: step6.notes || '',
        virtualEvidence: Array.isArray(step6.evidenceList)
          ? step6.evidenceList
          : (Array.isArray(step6.offlineEvidenceList) ? step6.offlineEvidenceList : []),
        analysisDetail: {
          findings: payload.findings || '',
          qualitativeRecord: payload.qualitativeRecord || '',
          aiDataAnalysis: payload.aiDataAnalysis || '',
          records,
          analysisRows: Array.isArray(payload.analysisRows) ? payload.analysisRows : [],
          variableTable: {
            independentVariable: '测试目标项',
            dependentVariable: '测试效果表现',
            slowObservation: pickText(dewater) || '',
            fastObservation: pickText(performance) || ''
          },
          generatedAt
        },
        engineeringSnapshot: this.flowData
      };
      const index = list.findIndex((item) => item && item.id === dataId);
      if (index >= 0) list[index] = data;
      else list.unshift(data);
      uni.setStorageSync('experimentResults', list);
      this.trackAbilityEvent('modelTesting');
    },
    syncReportToRecordCenter(payload = {}) {
      const exp = this.currentExperiment || {};
      if (!exp.id) return;
      const generatedAt = payload.generatedAt || nowText();
      const step3 = this.flowData.step3 || {};
      const step8 = this.flowData.step8 || {};
      const optimizationSummary = Array.isArray(step8.optimizationRows)
        ? step8.optimizationRows
          .filter((row) => row && (hasText(row.problem) || hasText(row.solution) || hasText(row.replacement)))
          .map((row, index) => {
            if (row.displayMode === 'targetStatus') {
              const target = String(row.problem || '').trim();
              const status = String(row.solution || '').trim();
              return `${index + 1}. ${target}${target && status ? '：' : ''}${status}`;
            }
            const parts = [];
            if (hasText(row.problem)) parts.push(`问题：${row.problem}`);
            if (hasText(row.solution)) parts.push(`解决方案：${row.solution}`);
            if (hasText(row.replacement)) parts.push(`替换结构：${row.replacement}`);
            return `${index + 1}. ${parts.join('；')}`;
          })
          .join('\n')
        : '';

      const reportList = Array.isArray(uni.getStorageSync('experimentReports')) ? uni.getStorageSync('experimentReports') : [];
      const reportData = {
        experimentId: this.getStorageExperimentId(),
        experimentName: exp.title,
        date: generatedAt,
        source: 'engineering-flow-step9',
        sourceStep: 'step9',
        status: 'completed',
        summary: payload.conclusion || '工程实践报告已生成',
        phenomenon: payload.conclusion || '',
        principle: step3.principleText || '',
        result: '基本达成工程目标',
        improvement: step8.aiSuggestion || optimizationSummary || '',
        remark: payload.extraFeeling || '',
        generatedAt,
        reportGenerated: true,
        engineeringSnapshot: this.flowData
      };
      const dedupeKey = `${this.getStorageExperimentId()}-${reportData.generatedAt || generatedAt}`;
      const nextReport = appendVersionedReportRecord(reportList, reportData, { dedupeKey });
      uni.setStorageSync('experimentReports', nextReport.list);
      this.trackAbilityEvent('engineeringReport');
    },
    finishFlow() {
      if (!this.isStepValidByIndex(this.stepDefs.length - 1)) {
        const lastStep = this.stepDefs[this.stepDefs.length - 1];
        const lastRule = this.getRuleTip(lastStep && lastStep.key);
        uni.showToast({ title: toKidMissingHint(lastRule), icon: 'none' });
        return;
      }
      if (typeof this.currentExperiment.legacyId === 'number') {
        updateExperimentProgress(this.currentExperiment.legacyId, 'principle', true);
        updateExperimentProgress(this.currentExperiment.legacyId, 'plan', true);
        updateExperimentProgress(this.currentExperiment.legacyId, 'virtual', true);
        updateExperimentProgress(this.currentExperiment.legacyId, 'data', true);
      }
      clearFlowDraft(this.experimentId);
      uni.showModal({
        title: I18N.flowDoneTitle,
        content: I18N.flowDoneContent,
        confirmText: I18N.openRecordConfirm,
        cancelText: I18N.backHomeCancel,
        success: (res) => {
          if (res.confirm) uni.redirectTo({ url: '/pages/record/record' });
          else uni.redirectTo({ url: '/pages/index/index' });
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
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30rpx) scale(1.1);
  }
}
.top-card {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #ff6b9d 0%, #ffb347 30%, #87ceeb 60%, #98fb98 100%);
  background-size: 300% 300%;
  animation: rainbow 6s ease infinite;
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 14rpx 30rpx rgba(255, 107, 157, 0.35);
}
@keyframes rainbow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
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
  background: linear-gradient(90deg, #ffd700, #ffa500);
  position: relative;
  transition: width 0.5s ease;
}
.progress-star {
  position: absolute;
  right: 4rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14rpx;
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
  width: 148rpx;
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
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #8b5a2b;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.2);
  transition: all 0.25s ease;
}
.step-label {
  margin-top: 8rpx;
  width: 100%;
  min-height: 64rpx;
  font-size: 20rpx;
  line-height: 1.45;
  color: #8b5a2b;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.step-item.done .step-chip {
  background: linear-gradient(135deg, #98fb98, #90ee90);
  color: #2e8b57;
}

.step-item.done:not(:last-child)::before {
  background: rgba(76, 175, 80, 0.75);
}

.step-item.done:not(:last-child)::after {
  border-top-color: rgba(76, 175, 80, 0.75);
  border-right-color: rgba(76, 175, 80, 0.75);
}
.step-item.active .step-chip {
  background: linear-gradient(135deg, #ff6b9d, #ffb347);
  color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.5);
}

.step-item.active:not(:last-child)::before {
  background: rgba(255, 107, 157, 0.8);
}

.step-item.active:not(:last-child)::after {
  border-top-color: rgba(255, 107, 157, 0.8);
  border-right-color: rgba(255, 107, 157, 0.8);
}
.step-item.locked .step-chip {
  background: rgba(255, 255, 255, 0.72);
  color: #bba188;
}

.step-item.locked:not(:last-child)::before {
  background: rgba(190, 190, 190, 0.65);
}

.step-item.locked:not(:last-child)::after {
  border-top-color: rgba(190, 190, 190, 0.65);
  border-right-color: rgba(190, 190, 190, 0.65);
}
.step-item.active .step-label {
  color: #ff6b9d;
  font-weight: 700;
}
.step-item.done .step-label {
  color: #2e8b57;
}
.step-item.locked .step-label {
  color: #bba188;
}
.chip-num {
  font-size: 22rpx;
}
.chip-icon {
  font-size: 16rpx;
}
.step-shell {
  margin-top: 14rpx;
  position: relative;
  z-index: 1;
}
.tips-card {
  margin-top: 14rpx;
  border-radius: 20rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #fff9e6, #fff0f5);
  border: 2rpx solid rgba(255, 217, 102, 0.5);
  display: flex;
  gap: 12rpx;
  position: relative;
  z-index: 1;
}
.tips-icon {
  font-size: 32rpx;
}
.tips-content {
  flex: 1;
}
.tips-title {
  font-size: 25rpx;
  color: #d4a017;
  font-weight: 700;
}
.tips-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8b6914;
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
}
.nav-icon {
  font-size: 22rpx;
}
.nav-btn.prev {
  background: linear-gradient(135deg, #e8f4fd, #fff5f8);
  color: #8b5a2b;
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}
.nav-btn.next {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #fff;
}
.nav-btn.finish {
  background: linear-gradient(135deg, #ff6b9d, #ffb347);
  color: #fff;
}

/* 页面级微调：工程探究 */
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
  width: 156rpx;
}

.step-chip {
  width: 60rpx;
  height: 60rpx;
}

.step-item:not(:last-child)::before {
  top: 30rpx;
}

.step-item:not(:last-child)::after {
  top: 24rpx;
}

.chip-num {
  font-size: 24rpx;
}

.step-label {
  font-size: 21rpx;
}

.step-shell {
  margin-top: 12rpx;
}

.nav-row {
  margin-top: 12rpx;
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

  .step-item {
    width: 128rpx;
  }

  .step-chip {
    width: 54rpx;
    height: 54rpx;
  }

  .step-label {
    font-size: 19rpx;
    min-height: 58rpx;
  }

  .step-item:not(:last-child)::before {
    top: 27rpx;
  }

  .step-item:not(:last-child)::after {
    top: 21rpx;
  }
}

/* Engineering Flow Layout V2: continuous mainline + grouped stage(2-5) */
.page .step-tabs {
  margin-top: 16rpx;
  padding: 14rpx 12rpx 16rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(245, 250, 255, 0.74), rgba(239, 246, 255, 0.56));
  border: 1px solid rgba(164, 186, 224, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76), 0 10rpx 24rpx rgba(113, 136, 180, 0.18);
  backdrop-filter: blur(4px);
}

.page .step-tabs-inner {
  --flow-node-size: 64rpx;
  --flow-step-width: 152rpx;
  --flow-step-gap: 20rpx;
  --flow-line-y: 50rpx;
  min-width: 100%;
  display: inline-flex;
  justify-content: center;
}

.page .step-items-row {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  min-height: 178rpx;
  padding: 18rpx 6rpx 8rpx;
}

.page .step-items-row::before {
  content: '';
  position: absolute;
  left: 44rpx;
  right: 44rpx;
  top: var(--flow-line-y);
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(116, 145, 183, 0.55), rgba(116, 145, 183, 0.35));
  box-shadow: 0 1px 2px rgba(73, 99, 140, 0.16);
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
  border: 2rpx solid rgba(255, 255, 255, 0.82);
  background: linear-gradient(135deg, #f0f3f8, #e5ebf3);
  color: #9aa6b9;
  box-shadow: 0 7rpx 16rpx rgba(108, 128, 160, 0.22);
  transition: transform 0.2s ease, box-shadow 0.22s ease, background 0.22s ease, color 0.22s ease;
}

.page .chip-num {
  font-size: 33rpx;
  line-height: 1;
  font-weight: 700;
}

.page .chip-icon {
  font-size: 22rpx;
  line-height: 1;
}

.page .step-label {
  margin-top: 10rpx;
  width: 100%;
  min-height: 70rpx;
  font-size: 18rpx;
  line-height: 1.34;
  letter-spacing: 0.2rpx;
  font-weight: 600;
  text-align: center;
  color: #8ea0b6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page .step-item:not(:last-child)::before {
  top: calc(var(--flow-line-y) - 2rpx);
  right: -16rpx;
  width: 18rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: rgba(148, 166, 194, 0.78);
  z-index: 3;
}

.page .step-item:not(:last-child)::after {
  top: calc(var(--flow-line-y) - 7rpx);
  right: -16rpx;
  width: 10rpx;
  height: 10rpx;
  border-top: 3rpx solid rgba(148, 166, 194, 0.78);
  border-right: 3rpx solid rgba(148, 166, 194, 0.78);
  transform: rotate(45deg);
  z-index: 3;
}

.page .step-item.done .step-chip {
  background: linear-gradient(135deg, #92e383, #5ec678);
  color: #1f6d43;
  box-shadow: 0 9rpx 18rpx rgba(83, 190, 126, 0.32);
}

.page .step-item.done .step-label {
  color: #2e8b57;
}

.page .step-item.done:not(:last-child)::before {
  background: rgba(86, 193, 126, 0.88);
}

.page .step-item.done:not(:last-child)::after {
  border-top-color: rgba(86, 193, 126, 0.88);
  border-right-color: rgba(86, 193, 126, 0.88);
}

.page .step-item.active .step-chip {
  background: linear-gradient(135deg, #ffb25b, #ff7a58);
  color: #fff;
  transform: scale(1.13);
  box-shadow: 0 12rpx 24rpx rgba(255, 126, 95, 0.46);
}

.page .step-item.active .step-label {
  color: #ff5f7f;
  font-weight: 700;
}

.page .step-item.active:not(:last-child)::before {
  background: rgba(255, 126, 95, 0.9);
}

.page .step-item.active:not(:last-child)::after {
  border-top-color: rgba(255, 126, 95, 0.9);
  border-right-color: rgba(255, 126, 95, 0.9);
}

.page .step-item.locked .step-chip {
  background: linear-gradient(135deg, #f0f2f6, #e5e9f0);
  color: #adb8c8;
  border-color: rgba(255, 255, 255, 0.64);
  box-shadow: none;
}

.page .step-item.locked .step-label {
  color: #a7b3c4;
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
  border-radius: 30rpx;
  padding: 34rpx 20rpx 16rpx;
  background: linear-gradient(135deg, rgba(222, 232, 252, 0.74), rgba(237, 228, 248, 0.72));
  border: 2rpx solid rgba(142, 133, 238, 0.34);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 10rpx 24rpx rgba(120, 113, 196, 0.2);
  overflow: visible;
}

.page .group-label {
  position: absolute;
  z-index: 5;
  top: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36rpx;
  line-height: 1.35;
  padding: 8rpx 24rpx 9rpx;
  border-radius: 999rpx;
  font-size: 17rpx;
  font-weight: 700;
  letter-spacing: 0.5rpx;
  color: #fff;
  background: linear-gradient(135deg, #8858dc, #5c63d8);
  box-shadow: 0 6rpx 14rpx rgba(101, 84, 196, 0.34);
  white-space: nowrap;
}

.page .group-steps {
  display: inline-flex;
  align-items: flex-start;
  margin-top: 8rpx;
}

.page .group-step {
  margin-right: var(--flow-step-gap);
}

.page .group-step:last-child {
  margin-right: 0;
}

.page .step-group-container.stage-active .group-background {
  border-color: rgba(255, 136, 94, 0.75);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78), 0 0 0 4rpx rgba(255, 153, 117, 0.2), 0 12rpx 28rpx rgba(255, 141, 103, 0.26);
}

.page .step-group-container.stage-active .group-label {
  background: linear-gradient(135deg, #ff8b6d, #ff6c85);
  box-shadow: 0 7rpx 16rpx rgba(255, 121, 121, 0.38);
}

.page .step-group-container.stage-done .group-background {
  border-color: rgba(95, 201, 134, 0.7);
}

.page .step-group-container.stage-done .group-label {
  background: linear-gradient(135deg, #5ac590, #48b18f);
}

@media screen and (max-width: 1100px) {
  .page .step-tabs-inner {
    --flow-node-size: 58rpx;
    --flow-step-width: 134rpx;
    --flow-step-gap: 16rpx;
    --flow-line-y: 46rpx;
  }

  .page .step-items-row {
    min-height: 164rpx;
  }

  .page .step-label {
    min-height: 64rpx;
    font-size: 16rpx;
  }

  .page .group-background {
    border-radius: 24rpx;
    padding: 30rpx 14rpx 12rpx;
  }

  .page .group-label {
    top: 8rpx;
    padding: 6rpx 18rpx;
    font-size: 15rpx;
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
    --flow-node-size: 54rpx;
    --flow-step-width: 122rpx;
    --flow-step-gap: 14rpx;
    --flow-line-y: 42rpx;
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

/* Engineering Scheme C: collapsed stage bar + expandable plan details */
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
  padding-bottom: 238rpx;
}

.page .stage-main-row {
  --stage-node-width: 214rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  padding: 6rpx 2rpx;
  position: relative;
  overflow: visible;
}

.page .stage-node,
.page .stage-node.stage-node-plan,
.page .stage-node.stage-node-late {
  width: var(--stage-node-width);
  flex: 0 0 auto;
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

.page .stage-node.done .stage-text,
.page .stage-node.done .stage-toggle {
  color: #ffffff;
}

.page .stage-node.active .stage-pill {
  background: linear-gradient(135deg, #ffb164, #ff8c4f);
  box-shadow: 0 10rpx 22rpx rgba(255, 150, 82, 0.36);
}

.page .stage-node.active .stage-text,
.page .stage-node.active .stage-toggle {
  color: #ffffff;
}

.page .stage-node.locked .stage-pill {
  background: linear-gradient(135deg, #d8dee9, #ced6e4);
  box-shadow: none;
}

.page .stage-node.locked .stage-text,
.page .stage-node.locked .stage-toggle {
  color: #97a5ba;
}

.page .stage-arrow {
  width: 30rpx;
  text-align: center;
  color: #b7c3d4;
  font-size: 32rpx;
  line-height: 1;
  font-weight: 700;
  margin: 0 4rpx;
}

.page .stage-arrow.done {
  color: #5fbe73;
}

.page .stage-expand-pop {
  position: absolute;
  top: calc(100% + 20rpx);
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  width: max-content;
}

.page .step-tabs.collapse-mode .step-group-container {
  margin-right: 0;
}

.page .step-tabs.collapse-mode .step-group-container::before,
.page .step-tabs.collapse-mode .step-group-container::after,
.page .step-tabs.collapse-mode .group-label {
  display: none;
}

.page .step-tabs.collapse-mode .group-background {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18rpx 18rpx 14rpx;
  background: #e8e5f5;
}

.page .step-tabs.collapse-mode .group-steps {
  margin-top: 0;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
}

.page .step-tabs.collapse-mode .group-step {
  width: 184rpx;
  margin-right: 14rpx;
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
  min-height: 34rpx;
  max-height: 34rpx;
  font-size: 22rpx;
  line-height: 1.3;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
    padding-bottom: 220rpx;
  }

  .page .stage-main-row {
    --stage-node-width: 196rpx;
  }

  .page .stage-pill {
    min-height: 76rpx;
    padding: 8rpx 12rpx;
  }

  .page .stage-text {
    font-size: 22rpx;
  }

  .page .stage-arrow {
    width: 28rpx;
    font-size: 28rpx;
    margin: 0 3rpx;
  }

  .page .step-tabs.collapse-mode .group-step {
    width: 166rpx;
    margin-right: 12rpx;
  }

  .page .step-tabs.collapse-mode .group-step .step-label {
    min-height: 30rpx;
    max-height: 30rpx;
    font-size: 20rpx;
  }
}

@media screen and (min-width: 901px) and (orientation: landscape) {
  .page .step-tabs.collapse-mode .collapse-inner.expanded {
    padding-bottom: 196rpx;
  }

  .page .stage-main-row {
    --stage-node-width: 174rpx;
  }

  .page .stage-pill {
    min-height: 64rpx;
    padding: 6rpx 10rpx;
  }

  .page .stage-text {
    font-size: 18rpx;
  }

  .page .stage-arrow {
    width: 22rpx;
    font-size: 22rpx;
    margin: 0 2rpx;
  }

  .page .step-tabs.collapse-mode .group-background {
    padding: 14rpx 12rpx 10rpx;
  }

  .page .step-tabs.collapse-mode .group-step {
    width: 142rpx;
    margin-right: 8rpx;
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
    min-height: 26rpx;
    max-height: 26rpx;
    font-size: 16rpx;
    line-height: 1.25;
  }
}
</style>
