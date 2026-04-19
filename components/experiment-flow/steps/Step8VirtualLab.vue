﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <view class="step-card">
    <view class="head">{{ i18n.title }}</view>
    <view class="tips">{{ i18n.tip }}</view>
    <view class="voice-card">
      <view class="voice-title">实验探究操作小提示</view>
      <view class="voice-text">{{ stageGuideText }}</view>
    </view>
    <view class="next-tip">{{ nextHintText }}</view>

    <view class="lab-grid">
      <view class="zone pool-zone">
        <view class="zone-title">{{ i18n.pool }}</view>
        <view class="token-grid">
          <view
            class="token"
            v-for="item in poolItems"
            :key="item.id"
            @touchstart.stop.prevent="startPoolDrag(item.id, item.type, $event)"
            @mousedown.stop.prevent="startPoolDrag(item.id, item.type, $event)"
            @click="quickAddToWorkspace(item.id, item.type)"
          >
            <image
              v-if="item.image"
              class="token-image"
              :src="item.image"
              mode="aspectFit"
              @load="onImageLoad(item.id, $event)"
            />
            <view class="tool-tag" v-if="item.type === 'tool'">工具</view>
            <view
              class="zoom-btn"
              @touchstart.stop.prevent
              @mousedown.stop.prevent
              @click.stop="openPreview(item.id)"
            >查看</view>
            <view class="token-name">{{ item.label }}</view>
          </view>
        </view>
      </view>

      <view class="right-column">
        <view class="zone workspace">
          <view class="zone-title">{{ i18n.workspace }}</view>
          <view class="workspace-canvas" :class="{ hot: isWorkspaceHot }">
            <view v-if="workspaceParts.length === 0" class="canvas-empty">{{ i18n.dragHint }}</view>
            <view
              v-if="fusionFlash.active"
              class="fusion-glow"
              :style="{ left: fusionFlash.x + 'px', top: fusionFlash.y + 'px' }"
            />
            <view
              v-for="particle in particles"
              :key="particle.id"
              class="fusion-particle"
              :style="particleStyle(particle)"
            />
            <view
              v-for="(part, index) in workspaceParts"
              :key="part.instanceId"
              class="part"
              :class="{ near: part.isNear, preview: part.isCraftPreview }"
              :style="partStyle(part)"
              @touchstart.stop.prevent="startPartDrag(index, $event)"
              @touchmove.stop.prevent="dragPart(index, $event)"
              @touchend.stop.prevent="endPartDrag(index)"
              @mousedown.stop.prevent="startPartDrag(index, $event)"
              @mousemove.stop.prevent="dragPart(index, $event)"
              @mouseup.stop.prevent="endPartDrag(index)"
            >
              <image
                class="part-image"
                :src="resolveItem(part.itemId).image"
                mode="aspectFit"
                @load="onImageLoad(part.itemId, $event)"
              />
              <view class="part-name">{{ resolveItem(part.itemId).label }}</view>
              <view
                class="part-zoom"
                @touchstart.stop.prevent
                @mousedown.stop.prevent
                @click.stop="openPreview(part.itemId)"
              >查看</view>
              <view v-if="!part.isCraftPreview" class="part-close" @click.stop="removeWorkspacePart(index)">×</view>
            </view>
          </view>
      </view>

        <view class="zone results">
          <view class="zone-title">{{ i18n.results }}</view>
        <view class="result-list">
          <view
            v-for="item in sortedResultDefs"
            :key="item.id"
            class="result-item"
            :class="{ done: isResultDone(item.id), locked: !isResultDone(item.id), fresh: item.id === latestOutputId }"
            @touchstart.stop.prevent="startPoolDrag(item.id, 'result', $event)"
            @mousedown.stop.prevent="startPoolDrag(item.id, 'result', $event)"
            @click="quickAddToWorkspace(item.id, 'result')"
          >
            <image
              v-if="item.image"
              class="result-image"
              :src="item.image"
              mode="aspectFit"
              @load="onImageLoad(item.id, $event)"
            />
            <view class="result-text">
              <view class="result-name">{{ item.label }}</view>
              <view class="result-state">{{ isResultDone(item.id) ? i18n.done : i18n.locked }}</view>
            </view>
            <view
              class="result-zoom"
              @touchstart.stop.prevent
              @mousedown.stop.prevent
              @click.stop="openPreview(item.id)"
            >查看</view>
          </view>
        </view>
        <view class="result-actions">
          <view class="restart-btn" @click="restartLab">
            <view class="restart-btn-icon">↺</view>
            <view class="restart-btn-copy">
              <view class="restart-btn-title">重新开始</view>
              <view class="restart-btn-desc">清空当前组装与观察记录，从第一环节重新探究</view>
            </view>
          </view>
        </view>
      </view>
      </view>
    </view>

    <view class="card op-card">
      <view class="op-nav">
        <view class="op-nav-row">
          <view class="op-nav-title">{{ i18n.operationTitle }}</view>
          <view class="op-nav-meta">环节 {{ selectedOperationOrder }}/{{ operationOptions.length }} · 进度 {{ observeProgressPercent }}%</view>
        </view>
        <view class="op-nav-track">
          <view class="op-nav-fill" :style="{ width: `${observeProgressPercent}%` }" />
        </view>
      </view>
      <view class="op-layout" :class="{ 'has-practice': practiceVideo && practiceVideo.videoUrl }">
        <view class="op-switch compact switch-bridge">
          <view class="op-switch-head">
            <text class="op-switch-title">速度选择</text>
            <text class="op-switch-progress">{{ observedCount }}/{{ operationOptions.length }} 已完成</text>
          </view>
          <view class="switch-bridge-tip">先看步骤，再选择不同速度观察现象变化</view>
          <view
            v-for="op in operationOptions"
            :key="op.id"
            class="op-button"
            :class="{ active: selectedOperationId === op.id, done: operationVideoWatched[op.id] }"
            @click="chooseOperation(op.id)"
          >
            <view class="op-main">
              <view class="op-icon">{{ operationIcon(op.id) }}</view>
              <view class="op-copy">
                <view class="op-head">
                  <text class="op-name">{{ op.title }}</text>
                </view>
              </view>
            </view>
            <text
              class="op-state op-state-bottom"
              :class="{ done: operationVideoWatched[op.id], active: selectedOperationId === op.id && !operationVideoWatched[op.id] }"
            >{{ operationStateText(op.id) }}</text>
            <view class="op-progress-track">
              <view class="op-progress-fill" :style="{ width: `${operationProgress(op.id)}%` }" />
            </view>
          </view>
        </view>

        <view class="video-panel observe-panel">
          <view class="video-panel-head">
            <view class="video-panel-title">🔍 {{ currentOperation ? currentOperation.title : i18n.operationTitle }}</view>
            <view class="video-panel-tag">现象观察</view>
          </view>
          <view class="video-panel-tip">{{ currentOperation ? currentOperation.desc : i18n.opChooseTip }}</view>
          <view class="op-player-body">
            <view v-if="currentOperation && currentOperation.videoUrl" class="video-frame">
              <video
                id="step8-op-video"
                :key="currentOperationVideoKey"
                class="video-frame-player"
                :src="currentOperation.videoUrl"
                :autoplay="false"
                controls
                :show-center-play-btn="true"
                :enable-progress-gesture="true"
                object-fit="cover"
                @ended="markOperationWatched(currentOperation.id)"
                @error="onOperationVideoError(currentOperation.id)"
              />
            </view>
            <view v-else class="op-video-placeholder">{{ i18n.opChooseTip }}</view>
          </view>
        </view>

        <view class="video-panel" v-if="practiceVideo && practiceVideo.videoUrl">
          <view class="video-panel-head">
            <view class="video-panel-title">🎬 {{ practiceVideo.title || '实践步骤讲解' }}</view>
            <view class="video-panel-tag">步骤演示</view>
          </view>
          <view class="video-panel-tip">{{ practiceVideo.desc || '先看完整制作视频，再进行线下实践操作。' }}</view>
          <view class="video-frame">
            <video
              class="video-frame-player"
              :src="practiceVideo.videoUrl"
              controls
              :show-center-play-btn="true"
              :enable-progress-gesture="true"
              object-fit="cover"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">{{ i18n.uploadTitle }}</view>
      <view class="upload-tip">在这里可以选择上传你的模型搭建成果哦。</view>
      <view class="btn-row">
        <view class="btn" @click="addScreenshot">{{ i18n.uploadImage }}</view>
        <view class="btn green" @click="addVideoProof">{{ i18n.uploadVideo }}</view>
      </view>
      <view v-if="evidenceCount > 0" class="evidence-grid">
        <view class="evidence-card" v-for="(item, idx) in evidenceList" :key="item.id || idx">
          <image
            v-if="isImageEvidence(item)"
            class="evidence-media"
            :src="item.path"
            mode="aspectFill"
            @click="openEvidencePreview(item)"
          />
          <video
            v-else-if="isVideoEvidence(item)"
            class="evidence-media"
            :src="item.path"
            controls
            :show-center-play-btn="true"
            :enable-progress-gesture="true"
            object-fit="cover"
          />
          <view v-else class="evidence-empty">文件暂不可预览</view>
          <view class="evidence-foot">
            <text class="evidence-name">{{ item.name || `文件${idx + 1}` }}</text>
            <text class="remove" @click="removeEvidence(idx)">{{ i18n.remove }}</text>
          </view>
        </view>
      </view>
      <view v-else class="evidence-empty-tip">暂无上传内容</view>
    </view>

    <view class="card">
      <view class="card-title">{{ i18n.note }}</view>
      <textarea
        class="note-input"
        :value="value.virtualLabNote"
        @input="patch({ virtualLabNote: $event.detail.value })"
        :placeholder="i18n.notePlaceholder"
      />
    </view>

    <view
      v-if="poolDrag.active"
      class="drag-mask"
      @touchmove.stop.prevent="onGlobalTouchMove"
      @touchend.stop.prevent="finishPoolDrag($event)"
      @touchcancel.stop.prevent="finishPoolDrag($event)"
      @mousemove.stop.prevent="onGlobalMouseMove"
      @mouseup.stop.prevent="finishPoolDrag($event)"
      @mouseleave.stop.prevent="finishPoolDrag($event)"
    />
    <view v-if="poolDrag.active" class="drag-ghost" :style="{ left: poolDrag.x + 'px', top: poolDrag.y + 'px' }">
      <image v-if="poolDrag.itemImage" class="drag-ghost-image" :src="poolDrag.itemImage" mode="aspectFit" />
      <view class="drag-ghost-name">{{ poolDrag.itemLabel }}</view>
    </view>

    <view v-if="preview.visible" class="preview-mask" @click="closePreview">
      <view class="preview-card" @click.stop>
        <view class="preview-head">
          <text class="preview-title">{{ preview.title }}</text>
          <text class="preview-close" @click="closePreview">×</text>
        </view>
        <image v-if="preview.src" class="preview-image" :src="preview.src" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script>
import {
  getStep8LabConfig,
  STEP8_FINAL_RESULT_ID,
} from '@/config/step8-recipes.js';
import { canCraftRecipe, computeStep8Stage } from '@/utils/step8LabEngine.js';

const I18N = {
  title: '\u2467 \u865a\u62df\u5b9e\u9a8c\u63a2\u7a76\u64cd\u4f5c', // 步骤标题：虚拟实验探究操作
  tip: '请按照设计的实验方案，先完成模型搭建，再进入低速/高速观察。', // 操作提示文本
  recipe: '\u914d\u65b9\u8fdb\u5ea6\uff1a', // 配方进度标签
  observe: '\u89c2\u5bdf\u8fdb\u5ea6\uff1a', // 观察进度标签
  evidence: '\u8bc1\u636e\uff1a', // 证据标签
  pool: '\u5de6\u4fa7 \u00b7 \u6750\u6599\u533a\uff08\u542b\u5de5\u5177\uff09', // 材料区标题
  workspace: '\u53f3\u4e0a \u00b7 \u63a2\u7a76\u64cd\u4f5c\u533a', // 操作区标题
  results: '\u53f3\u4e0b \u00b7 \u6210\u679c\u533a', // 成果区标题
  dragHint: '\u4ece\u5de6\u4fa7\u62d6\u5230\u8fd9\u91cc\u5f00\u59cb\u64cd\u4f5c', // 拖拽提示文本
  fuse: '\u8fde\u63a5', // 连接按钮文本
  done: '\u5df2\u5b8c\u6210', // 已完成状态文本
  locked: '\u672a\u751f\u6210', // 未生成状态文本
  todo: '\u5f85\u5b8c\u6210', // 待完成状态文本
  inProgress: '\u8fdb\u884c\u4e2d', // 进行中状态文本
  tapToWatch: '\u70b9\u51fb\u89c2\u770b', // 点击观看提示
  operationTitle: '\u64cd\u4f5c\u89c2\u5bdf\u73af\u8282', // 操作观察环节标题
  uploadTitle: '\u4e0a\u4f20\u7ebf\u4e0b\u6210\u679c\uff08\u53ef\u9009\uff09', // 上传区域标题
  uploadImage: '\u4e0a\u4f20\u56fe\u7247', // 上传图片按钮
  uploadVideo: '\u4e0a\u4f20\u89c6\u9891', // 上传视频按钮
  remove: '\u5220\u9664', // 删除按钮
  note: '\u5b9e\u9a8c\u7b14\u8bb0', // 实验笔记标题
  notePlaceholder: '\u8bb0\u5f55\u64cd\u4f5c\u8fc7\u7a0b\u548c\u73b0\u8c61...', // 笔记输入框占位符
  dropWorkspace: '\u628a\u5c0f\u96f6\u4ef6\u62d6\u5230\u53f3\u4e0a\u89d2\u7684\u64cd\u4f5c\u533a\u8bd5\u8bd5\uff5e', // 拖拽到操作区提示
  resultLocked: '\u8fd9\u4e2a\u6210\u679c\u8fd8\u6ca1\u89e3\u9501\uff0c\u5148\u5b8c\u6210\u524d\u9762\u7684\u8fde\u63a5\u5427', // 成果未解锁提示
  recipeDonePrefix: '\u5408\u6210\u6210\u529f\uff1a', // 合成成功前缀
  allRecipeDone: '\u6240\u6709\u642d\u5efa\u914d\u65b9\u5df2\u5b8c\u6210', // 所有配方完成提示
  nextHintPrefix: '\u4e0b\u4e00\u6b65\u5efa\u8bae\uff1a', // 下一步建议前缀
  undoStep: '\u53ef\u9009\uff1a\u56de\u9000\u62c6\u89e3\u4e0a\u4e00\u6b65', // 回退上一步提示
  undoDone: '\u5df2\u56de\u9000\u4e0a\u4e00\u6b65\uff0c\u53ef\u4ee5\u91cd\u65b0\u5c1d\u8bd5', // 回退成功提示
  noUndo: '\u73b0\u5728\u8fd8\u6ca1\u6709\u53ef\u56de\u9000\u7684\u64cd\u4f5c\u54e6', // 无回退操作提示
  mismatchNone: '\u8fd9\u4e24\u4e2a\u96f6\u4ef6\u8fd8\u4e0d\u662f\u597d\u670b\u53cb\uff0c\u6362\u4e00\u4e2a\u7ec4\u5408\u5427', // 零件不匹配提示1
  mismatchOne: '\u518d\u627e\u4e00\u4e2a\u5408\u9002\u7684\u6750\u6599\uff0c\u6211\u4eec\u5feb\u6210\u529f\u4e86', // 零件不匹配提示2
  mismatchNear: '\u518d\u628a\u5b83\u4eec\u62d6\u5f97\u66f4\u8fd1\u4e00\u70b9\uff0c\u5c31\u80fd\u8fde\u63a5\u5566', // 零件不匹配提示3
  mismatchGeneric: '\u518d\u60f3\u60f3\u4e0b\u4e00\u6b65\u63d0\u793a\uff0c\u4f60\u80af\u5b9a\u53ef\u4ee5', // 零件不匹配通用提示
  noCraft: '\u6682\u65f6\u8fd8\u4e0d\u80fd\u5408\u6210', // 暂时不能合成提示
  opChooseTip: '\u8bf7\u5148\u70b9\u51fb\u5de6\u4fa7\u901f\u5ea6\u6309\u94ae\uff0c\u5f00\u59cb\u89c2\u5bdf\u89c6\u9891\u3002', // 选择操作提示
  chooseOp: '\u5df2\u5207\u6362\u63a2\u7a76\u89c2\u5bdf\u73af\u8282', // 切换观察环节提示
  opMissingVideo: '\u8be5\u89c2\u5bdf\u89c6\u9891\u5f85\u4e0a\u4f20\uff0c\u7cfb\u7edf\u5df2\u8bb0\u5f55', // 视频待上传提示
  opWatched: '\u89c2\u5bdf\u5df2\u8bb0\u5f55', // 观察已记录提示
  restartLab: '\u5df2\u91cd\u65b0\u5f00\u59cb\u865a\u62df\u5b9e\u9a8c', // 重新开始提示
  craftingPreview: '\u6b63\u5728\u5c55\u793a\u5408\u6210\u6210\u679c\uff0c\u8bf7\u7a0d\u5019', // 合成预览提示
  imageFail: '\u56fe\u7247\u9009\u62e9\u5931\u8d25', // 图片选择失败提示
  videoFail: '\u89c6\u9891\u9009\u62e9\u5931\u8d25' // 视频选择失败提示
};

const hasText = (value) => String(value || '').trim().length > 0;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const nowText = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const createEvidenceItem = (payload = {}) => ({
  id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
  type: payload.type || 'image',
  name: payload.name || `${payload.type || 'file'}-${Date.now()}`,
  path: payload.path || ''
});

const isImagePath = (path = '') => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(path || '').trim());
const isVideoPath = (path = '') => /\.(mp4|mov|m4v|avi|webm|mkv)$/i.test(String(path || '').trim());
const resolveEvidenceType = (item = {}) => {
  const explicit = String(item.type || '').toLowerCase();
  if (explicit === 'image' || explicit === 'video') return explicit;
  const path = String(item.path || '').trim();
  if (isImagePath(path)) return 'image';
  if (isVideoPath(path)) return 'video';
  const name = String(item.name || '').trim();
  if (isImagePath(name)) return 'image';
  if (isVideoPath(name)) return 'video';
  return '';
};

const CRAFT_PREVIEW_DELAY = 900;

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
      i18n: I18N,
      draftStepValue: {},
      workspaceRect: null,
      localWorkspaceParts: [],
      currentAction: null,
      isWorkspaceHot: false,
      fusionFlash: {
        active: false,
        x: 0,
        y: 0
      },
      particles: [],
      fusionHistory: [],
      lastMismatchHintAt: 0,
      imageMetaMap: {},
      latestOutputId: '',
      preview: {
        visible: false,
        title: '',
        src: ''
      },
      poolDrag: {
        active: false,
        itemId: '',
        itemLabel: '',
        itemImage: '',
        x: 0,
        y: 0
      },
      draggingPart: {
        active: false,
        index: -1,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0
      },
      craftPreviewTimer: null,
      videoSwitchTick: 0
    };
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(next) {
        this.draftStepValue = next && typeof next === 'object' ? { ...next } : {};
      }
    },
    isStepCompletedByRule: {
      immediate: true,
      handler(ready) {
        this.syncAutoCompleteState(ready);
      }
    }
  },
  beforeUnmount() {
    this.clearCraftPreviewTimer();
  },
  computed: {
    step8Config() {
      return getStep8LabConfig(this.experiment && this.experiment.id);
    },
    materialToolItems() {
      return this.step8Config.materialToolItems || [];
    },
    materialItemsConfig() {
      return this.step8Config.materialItems || [];
    },
    toolItemsConfig() {
      return this.step8Config.toolItems || [];
    },
    resultItemsConfig() {
      return this.step8Config.resultItems || [];
    },
    recipesConfig() {
      return this.step8Config.recipes || [];
    },
    itemMap() {
      return this.step8Config.itemMap || {};
    },
    poolItems() {
      return this.materialToolItems;
    },
    resultDefs() {
      return this.resultItemsConfig;
    },
    sortedResultDefs() {
      const doneSet = new Set(this.resultItems);
      return [...this.resultDefs].sort((a, b) => {
        const aDone = doneSet.has(a.id) ? 1 : 0;
        const bDone = doneSet.has(b.id) ? 1 : 0;
        if (aDone !== bDone) return bDone - aDone;
        return 0;
      });
    },
    operationOptions() {
      return this.step8Config.operationOptions || [];
    },
    practiceVideo() {
      return this.step8Config.practiceVideo || null;
    },
    workspaceParts() {
      return this.localWorkspaceParts;
    },
    isCraftPreviewActive() {
      return this.workspaceParts.some((part) => part.isCraftPreview === true);
    },
    resultItems() {
      const draft = this.getDraftValue();
      const raw = Array.isArray(draft.resultItems) ? draft.resultItems : [];
      return raw.filter((id) => !!this.itemMap[id]);
    },
    recipeProgress() {
      const draft = this.getDraftValue();
      return draft.recipeProgress && typeof draft.recipeProgress === 'object'
        ? draft.recipeProgress
        : {};
    },
    operationVideoWatched() {
      const draft = this.getDraftValue();
      const modern = draft.operationVideoWatched && typeof draft.operationVideoWatched === 'object'
        ? draft.operationVideoWatched
        : {};
      const legacy = draft.operationWatched && typeof draft.operationWatched === 'object'
        ? draft.operationWatched
        : {};
      return {
        op1: modern.op1 === true || legacy.op1 === true,
        op2: modern.op2 === true || legacy.op2 === true
      };
    },
    selectedOperationId() {
      const draft = this.getDraftValue();
      return draft.operationVideoChoice || draft.operationChoice || '';
    },
    currentOperation() {
      return this.operationOptions.find((item) => item.id === this.selectedOperationId) || null;
    },
    currentOperationVideoKey() {
      if (!this.currentOperation) return `none-${this.videoSwitchTick}`;
      return `${this.currentOperation.id}-${this.videoSwitchTick}`;
    },
    evidenceList() {
      const draft = this.getDraftValue();
      return Array.isArray(draft.evidenceList) ? draft.evidenceList : [];
    },
    evidenceCount() {
      return this.evidenceList.length;
    },
    observedCount() {
      return this.operationOptions.filter((item) => this.operationVideoWatched[item.id]).length;
    },
    selectedOperationOrder() {
      const idx = this.operationOptions.findIndex((item) => item.id === this.selectedOperationId);
      return idx >= 0 ? idx + 1 : 1;
    },
    observeProgressPercent() {
      if (this.operationOptions.length === 0) return 0;
      return Math.round((this.observedCount / this.operationOptions.length) * 100);
    },
    doneRecipeCount() {
      return this.recipesConfig.filter((recipe) => this.resultItems.includes(recipe.output)).length;
    },
    totalRecipeCount() {
      return this.recipesConfig.length;
    },
    hasFinalProduct() {
      return this.resultItems.includes(STEP8_FINAL_RESULT_ID);
    },
    hasObservedRequired() {
      return this.operationVideoWatched.op1 === true && this.operationVideoWatched.op2 === true;
    },
    isStepCompletedByRule() {
      return hasText(this.getDraftValue().projectId) && this.hasFinalProduct && this.hasObservedRequired;
    },
    nextRecipe() {
      return this.recipesConfig.find((recipe) => !this.resultItems.includes(recipe.output)) || null;
    },
    nextHintText() {
      if (!this.nextRecipe) return I18N.allRecipeDone;
      return `${I18N.nextHintPrefix}${this.nextRecipe.nextHint || this.nextRecipe.hint}`;
    },
    stageGuideText() {
      const stageGuides = this.step8Config.stageGuides || {};
      const stage = this.getDraftValue().step8Stage || 'build';
      if (stage === 'build') {
        if (this.nextRecipe && (this.nextRecipe.stageGuide || this.nextRecipe.hint)) {
          return this.nextRecipe.stageGuide || this.nextRecipe.hint;
        }
        if (this.doneRecipeCount === 0) {
          return stageGuides.buildStart || '阶段1：先完成当前实验的模型搭建。';
        }
        return stageGuides.buildContinue || '阶段2：继续完成连接，目标是合成最终成品。';
      }
      if (stage === 'observe') {
        return stageGuides.observe || '阶段3：成品完成后，先低速观察，再高速观察。';
      }
      if (stage === 'upload' || stage === 'upload-ready') {
        return stageGuides.upload || '观察完成啦。可以将你的线下成果上传哦。';
      }
      return stageGuides.done || '太棒了，你已经完成虚拟实验的探究操作啦。';
    }
  },
  mounted() {
    this.ensureInitState();
    this.syncWorkspaceFromValue();
    this.$nextTick(this.measureWorkspaceRect);
  },
  methods: {
    getDraftValue() {
      if (this.draftStepValue && typeof this.draftStepValue === 'object') return this.draftStepValue;
      return this.value && typeof this.value === 'object' ? this.value : {};
    },
    clearCraftPreviewTimer() {
      if (this.craftPreviewTimer) {
        clearTimeout(this.craftPreviewTimer);
        this.craftPreviewTimer = null;
      }
    },

    patch(payload) {
      const merged = { ...this.getDraftValue(), ...payload };
      this.draftStepValue = merged;
      this.$emit('update', merged);
    },
    ensureInitState() {
      const payload = {};
      if (!hasText(this.value.projectId)) payload.projectId = `${this.experiment.id || 'science-01'}-step8-lab`;
      if (!hasText(this.value.modelName)) payload.modelName = this.experiment.title || '\u865a\u62df\u88c5\u7f6e';
      if (!Array.isArray(this.value.materialsPool)) payload.materialsPool = this.materialItemsConfig.map((i) => i.id);
      if (!Array.isArray(this.value.toolsPool)) payload.toolsPool = this.toolItemsConfig.map((i) => i.id);
      if (!Array.isArray(this.value.workspaceItems)) payload.workspaceItems = [];
      if (!Array.isArray(this.value.workspaceLayout)) payload.workspaceLayout = [];
      if (!Array.isArray(this.value.resultItems)) payload.resultItems = [];
      if (!this.value.recipeProgress || typeof this.value.recipeProgress !== 'object') payload.recipeProgress = {};
      if (!Array.isArray(this.value.actionLogs)) payload.actionLogs = [];
      if (!this.value.operationVideoWatched || typeof this.value.operationVideoWatched !== 'object') {
        const legacy = this.value.operationWatched && typeof this.value.operationWatched === 'object'
          ? this.value.operationWatched
          : { op1: false, op2: false };
        payload.operationVideoWatched = { op1: legacy.op1 === true, op2: legacy.op2 === true };
      }
      if (!this.value.operationWatched || typeof this.value.operationWatched !== 'object') {
        const modern = payload.operationVideoWatched || this.value.operationVideoWatched || { op1: false, op2: false };
        payload.operationWatched = { op1: modern.op1 === true, op2: modern.op2 === true };
      }
      if (!hasText(this.value.operationVideoChoice) && !hasText(this.value.operationChoice)) {
        payload.operationVideoChoice = (this.operationOptions[0] && this.operationOptions[0].id) || '';
      }
      if (!hasText(this.value.step8Stage)) payload.step8Stage = 'build';
      if (!Array.isArray(this.value.evidenceList)) payload.evidenceList = [];
      if (!Array.isArray(this.value.offlineEvidenceList)) payload.offlineEvidenceList = [];
      if (typeof this.value.completed !== 'boolean') payload.completed = this.value.virtualCompleted === true;
      if (!hasText(this.value.completedAt)) payload.completedAt = '';
      if (!hasText(this.value.experimentVideo)) payload.experimentVideo = (this.operationOptions[0] && this.operationOptions[0].videoUrl) || '';
      if (!this.value.initialParts || typeof this.value.initialParts !== 'object') payload.initialParts = {};
      if (Object.keys(payload).length > 0) this.patch(payload);
    },
    syncWorkspaceFromValue() {
      const rawLayout = Array.isArray(this.value.workspaceLayout) ? this.value.workspaceLayout : [];
      if (rawLayout.length > 0) {
        this.localWorkspaceParts = rawLayout
          .map((item, idx) => ({
            instanceId: item.instanceId || `${item.itemId || item.id}-${Date.now()}-${idx}`,
            itemId: item.itemId || item.id,
            left: Number(item.left) || 0,
            top: Number(item.top) || 0,
            isNear: false
          }))
          .filter((item) => !!this.itemMap[item.itemId]);
        return;
      }
      const rawItems = Array.isArray(this.value.workspaceItems) ? this.value.workspaceItems : [];
      this.localWorkspaceParts = rawItems
        .filter((id) => !!this.itemMap[id])
        .map((id, idx) => ({
          instanceId: `${id}-${Date.now()}-${idx}`,
          itemId: id,
          left: 20 + (idx % 3) * 100,
          top: 20 + Math.floor(idx / 3) * 100,
          isNear: false
        }));
    },
    commitWorkspace(parts = this.localWorkspaceParts) {
      const layout = parts.map((item) => ({
        instanceId: item.instanceId,
        itemId: item.itemId,
        left: Math.round(item.left),
        top: Math.round(item.top)
      }));
      this.patch({
        workspaceLayout: layout,
        workspaceItems: layout.map((item) => item.itemId)
      });
    },
    measureWorkspaceRect(done) {
      const query = uni.createSelectorQuery().in(this);
      query.select('.workspace-canvas').boundingClientRect((rect) => {
        if (rect) this.workspaceRect = rect;
        if (typeof done === 'function') done();
      }).exec();
    },
    getPoint(event) {
      const touch = event && event.touches && event.touches[0];
      const changed = event && event.changedTouches && event.changedTouches[0];
      const source = touch || changed || event || {};
      return {
        x: Number(source.clientX || source.pageX || 0),
        y: Number(source.clientY || source.pageY || 0)
      };
    },
    inWorkspace(point) {
      const rect = this.workspaceRect;
      if (!rect) return false;
      return point.x >= rect.left && point.x <= rect.left + rect.width && point.y >= rect.top && point.y <= rect.top + rect.height;
    },
    getPartSize(itemId) {
      return this.resultDefs.some((item) => item.id === itemId) ? 112 : 92;
    },
    partStyle(part) {
      const size = this.getPartSize(part.itemId);
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${part.left}px`,
        top: `${part.top}px`
      };
    },
    onImageLoad(itemId, event) {
      const detail = (event && event.detail) || {};
      const width = Number(detail.width || detail.naturalWidth || 0);
      const height = Number(detail.height || detail.naturalHeight || 0);
      if (!itemId || !width || !height) return;
      this.imageMetaMap = {
        ...this.imageMetaMap,
        [itemId]: { width, height }
      };
    },
    getImageType(itemId) {
      const meta = this.imageMetaMap[itemId];
      if (!meta || !meta.width || !meta.height) return 'normal';
      const ratio = meta.width / meta.height;
      if (ratio >= 1.35) return 'wide';
      if (ratio <= 0.82) return 'tall';
      return 'normal';
    },
    tokenCardClass(itemId) {
      const type = this.getImageType(itemId);
      if (type === 'wide') return 'token-wide';
      if (type === 'tall') return 'token-tall';
      return 'token-normal';
    },
    resultImageClass(itemId) {
      const type = this.getImageType(itemId);
      if (type === 'wide') return 'result-wide';
      if (type === 'tall') return 'result-tall';
      return 'result-normal';
    },
    openPreview(itemId) {
      const item = this.resolveItem(itemId);
      if (!item || !item.image) return;
      this.preview = {
        visible: true,
        title: item.label || '',
        src: item.image
      };
    },
    closePreview() {
      this.preview = {
        visible: false,
        title: '',
        src: ''
      };
    },
    particleStyle(particle) {
      return {
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        background: particle.color,
        '--tx': `${particle.tx}px`,
        '--ty': `${particle.ty}px`,
        '--dur': `${particle.duration}ms`,
        '--scale': String(particle.scale)
      };
    },
    resolveItem(itemId) {
      return this.itemMap[itemId] || { id: itemId, label: itemId, image: '' };
    },
    isResultDone(itemId) {
      return this.resultItems.includes(itemId);
    },
    startPoolDrag(itemId, source, event) {
      if (this.isCraftPreviewActive) {
        uni.showToast({ title: I18N.craftingPreview, icon: 'none' });
        return;
      }
      if (source === 'result' && !this.isResultDone(itemId)) {
        uni.showToast({ title: I18N.resultLocked, icon: 'none' });
        return;
      }
      const item = this.resolveItem(itemId);
      const point = this.getPoint(event);
      this.measureWorkspaceRect(() => {
        this.poolDrag = {
          active: true,
          itemId,
          itemLabel: item.label,
          itemImage: item.image || '',
          x: point.x,
          y: point.y
        };
        this.isWorkspaceHot = this.inWorkspace(point);
      });
    },
    quickAddToWorkspace(itemId, source) {
      if (this.isCraftPreviewActive) {
        uni.showToast({ title: I18N.craftingPreview, icon: 'none' });
        return;
      }
      if (source === 'result' && !this.isResultDone(itemId)) {
        uni.showToast({ title: I18N.resultLocked, icon: 'none' });
        return;
      }
      this.measureWorkspaceRect(() => {
        const rect = this.workspaceRect;
        if (!rect) return;
        this.dropToWorkspace(itemId, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      });
    },
    onGlobalTouchMove(event) {
      if (!this.poolDrag.active) return;
      const point = this.getPoint(event);
      this.poolDrag = { ...this.poolDrag, x: point.x, y: point.y };
      this.isWorkspaceHot = this.inWorkspace(point);
    },
    onGlobalMouseMove(event) {
      if (!this.poolDrag.active) return;
      const point = this.getPoint(event);
      this.poolDrag = { ...this.poolDrag, x: point.x, y: point.y };
      this.isWorkspaceHot = this.inWorkspace(point);
    },
    finishPoolDrag(event) {
      if (!this.poolDrag.active) return;
      const point = this.getPoint(event);
      const inside = this.inWorkspace(point);
      const drag = { ...this.poolDrag };
      this.poolDrag = { active: false, itemId: '', itemLabel: '', itemImage: '', x: 0, y: 0 };
      this.isWorkspaceHot = false;
      if (!inside) {
        uni.showToast({ title: I18N.dropWorkspace, icon: 'none' });
        return;
      }
      this.dropToWorkspace(drag.itemId, point);
    },
    dropToWorkspace(itemId, point) {
      if (this.isCraftPreviewActive) return;
      if (!this.workspaceRect || !this.itemMap[itemId]) return;
      const size = this.getPartSize(itemId);
      const left = clamp(point.x - this.workspaceRect.left - size / 2, 0, this.workspaceRect.width - size);
      const top = clamp(point.y - this.workspaceRect.top - size / 2, 0, this.workspaceRect.height - size);
      const next = [
        ...this.workspaceParts,
        {
          instanceId: `${itemId}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          itemId,
          left,
          top,
          isNear: false
        }
      ];
      this.localWorkspaceParts = next;
      this.commitWorkspace();
      if (!this.tryAutoCraftFromWorkspace(next) && !this.currentAction) this.showMismatchHint();
    },
    startPartDrag(index, event) {
      const part = this.workspaceParts[index];
      if (!part || part.isCraftPreview || this.isCraftPreviewActive) return;
      const point = this.getPoint(event);
      this.draggingPart = {
        active: true,
        index,
        startX: point.x,
        startY: point.y,
        startLeft: part.left,
        startTop: part.top
      };
      this.measureWorkspaceRect();
    },
    dragPart(index, event) {
      if (!this.draggingPart.active || this.draggingPart.index !== index || !this.workspaceRect) return;
      const part = this.workspaceParts[index];
      if (!part) return;
      const point = this.getPoint(event);
      const size = this.getPartSize(part.itemId);
      const left = clamp(this.draggingPart.startLeft + point.x - this.draggingPart.startX, 0, this.workspaceRect.width - size);
      const top = clamp(this.draggingPart.startTop + point.y - this.draggingPart.startY, 0, this.workspaceRect.height - size);
      const next = [...this.workspaceParts];
      next[index] = { ...next[index], left, top };
      this.localWorkspaceParts = next;
      this.tryAutoCraftFromWorkspace(next);
    },
    endPartDrag(index) {
      if (!this.draggingPart.active || this.draggingPart.index !== index) return;
      this.draggingPart = { active: false, index: -1, startX: 0, startY: 0, startLeft: 0, startTop: 0 };
      this.commitWorkspace();
      if (!this.tryAutoCraftFromWorkspace()) this.showMismatchHint();
    },
    removeWorkspacePart(index) {
      if (this.isCraftPreviewActive) {
        uni.showToast({ title: I18N.craftingPreview, icon: 'none' });
        return;
      }
      const next = [...this.workspaceParts];
      next.splice(index, 1);
      this.localWorkspaceParts = next;
      this.currentAction = null;
      this.commitWorkspace();
    },
    partCenter(part) {
      const size = this.getPartSize(part.itemId);
      return { x: part.left + size / 2, y: part.top + size / 2 };
    },
    edgeGap(partA, partB) {
      const sizeA = this.getPartSize(partA.itemId);
      const sizeB = this.getPartSize(partB.itemId);
      const leftA = partA.left;
      const rightA = partA.left + sizeA;
      const topA = partA.top;
      const bottomA = partA.top + sizeA;
      const leftB = partB.left;
      const rightB = partB.left + sizeB;
      const topB = partB.top;
      const bottomB = partB.top + sizeB;
      const gapX = Math.max(0, Math.max(leftA, leftB) - Math.min(rightA, rightB));
      const gapY = Math.max(0, Math.max(topA, topB) - Math.min(bottomA, bottomB));
      return Math.sqrt(gapX * gapX + gapY * gapY);
    },
    findClosestMatchIndex(itemId, excluded, refPart) {
      let best = -1;
      let dist = Infinity;
      this.workspaceParts.forEach((part, idx) => {
        if (part.itemId !== itemId || excluded.includes(idx)) return;
        const a = this.partCenter(part);
        const b = this.partCenter(refPart);
        const d = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        if (d < dist) {
          dist = d;
          best = idx;
        }
      });
      return best;
    },
    findRecipeIndices(recipe, parts = this.workspaceParts) {
      if (!recipe || !Array.isArray(recipe.inputs) || recipe.inputs.length === 0) return [];
      const indices = [];
      const used = new Set();
      recipe.inputs.forEach((itemId) => {
        const idx = parts.findIndex((part, partIndex) => part.itemId === itemId && !used.has(partIndex));
        if (idx >= 0) {
          used.add(idx);
          indices.push(idx);
        }
      });
      return indices.length === recipe.inputs.length ? indices : [];
    },
    findCraftableRecipe(parts = this.workspaceParts) {
      const ids = parts.map((part) => part.itemId);
      return this.recipesConfig.find((recipe) => canCraftRecipe(ids, recipe)) || null;
    },
    getFusionCenter(indices, parts = this.workspaceParts) {
      if (!Array.isArray(indices) || indices.length === 0) {
        const rect = this.workspaceRect || { width: 240, height: 240 };
        return { x: rect.width / 2, y: rect.height / 2 };
      }
      const centers = indices.map((idx) => this.partCenter(parts[idx]));
      return {
        x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
        y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length
      };
    },
    tryAutoCraftFromWorkspace(parts = this.workspaceParts) {
      this.currentAction = null;
      const recipe = this.findCraftableRecipe(parts);
      if (!recipe) return false;
      const indices = this.findRecipeIndices(recipe, parts);
      if (indices.length === 0) return false;
      this.performRecipe(recipe, indices, parts);
      return true;
    },
    appendLog(action, input = [], output = '', ok = true, note = '') {
      const logs = Array.isArray(this.value.actionLogs) ? [...this.value.actionLogs] : [];
      logs.push({ ts: Date.now(), action, input, output, ok, note });
      this.patch({ actionLogs: logs.slice(-150) });
    },
    showMismatchHint() {
      if (this.workspaceParts.length < 2) return;
      const now = Date.now();
      if (now - this.lastMismatchHintAt < 1200) return;
      this.lastMismatchHintAt = now;

      let message = I18N.mismatchGeneric;
      if (this.nextRecipe) {
        const needed = new Set(this.nextRecipe.inputs || []);
        const hitCount = this.workspaceParts.reduce((count, part) => {
          return count + (needed.has(part.itemId) ? 1 : 0);
        }, 0);
        if (hitCount <= 0) message = I18N.mismatchNone;
        else if (hitCount === 1) message = I18N.mismatchOne;
        else message = I18N.mismatchNear;
      }
      uni.showToast({ title: message, icon: 'none' });
    },
    triggerFusionFx(center) {
      if (!center) return;
      this.fusionFlash = { active: true, x: center.x, y: center.y };
      const colors = ['#4facfe', '#56d0ff', '#ffd166', '#7bd88f', '#ff9f58', '#9b8cff'];
      const spawned = Array.from({ length: 14 }).map((_, idx) => ({
        id: `${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
        x: center.x,
        y: center.y,
        color: colors[idx % colors.length],
        tx: Math.round((Math.random() * 2 - 1) * 90),
        ty: Math.round(-35 - Math.random() * 110),
        duration: 420 + Math.floor(Math.random() * 260),
        scale: (0.7 + Math.random() * 0.7).toFixed(2)
      }));
      this.particles = [...this.particles, ...spawned];
      setTimeout(() => {
        this.fusionFlash = { active: false, x: 0, y: 0 };
      }, 420);
      spawned.forEach((particle) => {
        setTimeout(() => {
          this.particles = this.particles.filter((item) => item.id !== particle.id);
        }, particle.duration + 120);
      });
    },
    undoLastFusion() {
      if (!Array.isArray(this.fusionHistory) || this.fusionHistory.length === 0) {
        uni.showToast({ title: I18N.noUndo, icon: 'none' });
        return;
      }
      const history = [...this.fusionHistory];
      const last = history.pop();
      const parts = [...this.workspaceParts];
      const outputIndex = parts.findIndex((part) => part.instanceId === last.outputInstanceId);
      if (outputIndex >= 0) {
        parts.splice(outputIndex, 1);
      }
      const restored = (last.consumedParts || []).map((part, idx) => ({
        ...part,
        instanceId: part.instanceId || `${part.itemId}-${Date.now()}-${idx}`,
        isNear: false
      }));
      parts.push(...restored);

      const nextResultItems = this.resultItems.filter((id) => id !== last.outputId);
      const nextProgress = { ...this.recipeProgress };
      delete nextProgress[last.recipeId];
      const stage = this.computeStage(nextResultItems, this.operationVideoWatched, false);

      this.fusionHistory = history;
      this.latestOutputId = '';
      this.localWorkspaceParts = parts.map((part) => ({ ...part, isNear: false }));
      this.currentAction = null;
      this.patch({
        workspaceLayout: this.localWorkspaceParts.map((item) => ({
          instanceId: item.instanceId,
          itemId: item.itemId,
          left: Math.round(item.left),
          top: Math.round(item.top)
        })),
        workspaceItems: this.localWorkspaceParts.map((item) => item.itemId),
        resultItems: nextResultItems,
        recipeProgress: nextProgress,
        step8Stage: stage,
        completed: false,
        completedAt: ''
      });
      this.appendLog('undo', [last.outputId], '', true, last.recipeId || '');
      uni.showToast({ title: I18N.undoDone, icon: 'none' });
    },
    computeStage(resultItems, watched, completed) {
      return computeStep8Stage({
        hasFinal: resultItems.includes(STEP8_FINAL_RESULT_ID),
        watchedOp1: watched.op1 === true,
        watchedOp2: watched.op2 === true,
        completed: completed === true
      });
    },
    finalizeRecipe(recipe, nextParts, consumedParts) {
      const currentResultItems = Array.isArray(this.getDraftValue().resultItems)
        ? this.getDraftValue().resultItems.filter((id) => !!this.itemMap[id])
        : this.resultItems;
      const nextResult = currentResultItems.includes(recipe.output)
        ? [...currentResultItems]
        : [...currentResultItems, recipe.output];
      const nextProgress = { ...this.recipeProgress, [recipe.id]: true };
      const stage = this.computeStage(nextResult, this.operationVideoWatched, this.value.completed);

      this.localWorkspaceParts = nextParts;
      this.currentAction = null;
      this.patch({
        workspaceLayout: nextParts.map((item) => ({
          instanceId: item.instanceId,
          itemId: item.itemId,
          left: Math.round(item.left),
          top: Math.round(item.top)
        })),
        workspaceItems: nextParts.map((item) => item.itemId),
        resultItems: nextResult,
        recipeProgress: nextProgress,
        step8Stage: stage
      });
      this.fusionHistory = [
        ...this.fusionHistory,
        {
          recipeId: recipe.id,
          outputId: recipe.output,
          consumedParts
        }
      ];
      this.latestOutputId = recipe.output;
      this.appendLog('fuse', recipe.inputs, recipe.output, true, recipe.id);
      uni.showToast({
        title: recipe.doneToast || `${I18N.recipeDonePrefix}${this.resolveItem(recipe.output).label}（已加入成果区）`,
        icon: 'none'
      });
      this.$nextTick(() => {
        this.tryAutoCraftFromWorkspace();
      });
    },
    performRecipe(recipe, indices, parts = this.workspaceParts) {
      if (!recipe || !Array.isArray(indices) || indices.length === 0) return;
      const fusionCenter = this.getFusionCenter(indices, parts);
      const consumedParts = indices.map((idx) => ({ ...parts[idx], isNear: false }));
      const removeIndices = [...indices].sort((a, b) => b - a);
      const nextParts = [...parts];
      removeIndices.forEach((idx) => nextParts.splice(idx, 1));

      this.clearCraftPreviewTimer();

      const previewSize = this.getPartSize(recipe.output);
      const previewRect = this.workspaceRect || { width: 340, height: 340 };
      const previewPart = {
        instanceId: `${recipe.output}-preview-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        itemId: recipe.output,
        left: clamp(fusionCenter.x - previewSize / 2, 0, Math.max(0, previewRect.width - previewSize)),
        top: clamp(fusionCenter.y - previewSize / 2, 0, Math.max(0, previewRect.height - previewSize)),
        isNear: false,
        isCraftPreview: true
      };
      const previewParts = [...nextParts, previewPart];

      this.localWorkspaceParts = previewParts;
      this.currentAction = null;
      this.patch({
        workspaceLayout: previewParts.map((item) => ({
          instanceId: item.instanceId,
          itemId: item.itemId,
          left: Math.round(item.left),
          top: Math.round(item.top)
        })),
        workspaceItems: previewParts.map((item) => item.itemId)
      });

      this.latestOutputId = '';
      this.triggerFusionFx(fusionCenter);
      this.craftPreviewTimer = setTimeout(() => {
        this.craftPreviewTimer = null;
        this.finalizeRecipe(recipe, nextParts, consumedParts);
      }, CRAFT_PREVIEW_DELAY);
    },
    operationIcon(opId) {
      if (opId === 'op1') return '🐢';
      if (opId === 'op2') return '🚀';
      return '🎬';
    },
    operationStateText(opId) {
      if (this.operationVideoWatched[opId]) return I18N.done;
      if (this.selectedOperationId === opId) return I18N.inProgress;
      return I18N.tapToWatch;
    },
    operationProgress(opId) {
      if (this.operationVideoWatched[opId]) return 100;
      if (this.selectedOperationId === opId) return 62;
      return 18;
    },
    chooseOperation(opId) {
      const op = this.operationOptions.find((item) => item.id === opId);
      if (!op) return;
      const changed = this.selectedOperationId !== opId;
      const watched = { ...this.operationVideoWatched };
      if (!op.videoUrl) watched[opId] = true;
      const stage = this.computeStage(this.resultItems, watched, this.value.completed);
      this.patch({
        operationVideoChoice: opId,
        operationChoice: opId,
        operationVideoWatched: watched,
        operationWatched: watched,
        step8Stage: stage,
        experimentVideo: op.videoUrl || this.value.experimentVideo || ''
      });
      this.videoSwitchTick += 1;
      if (!op.videoUrl) {
        uni.showToast({ title: I18N.opMissingVideo, icon: 'none' });
      } else if (changed) {
        uni.showToast({ title: I18N.chooseOp, icon: 'none' });
      }
    },
    markOperationWatched(opId) {
      if (this.operationVideoWatched[opId]) return;
      const watched = { ...this.operationVideoWatched, [opId]: true };
      const stage = this.computeStage(this.resultItems, watched, this.value.completed);
      this.patch({ operationVideoWatched: watched, operationWatched: watched, step8Stage: stage });
      uni.showToast({ title: I18N.opWatched, icon: 'none' });
    },
    onOperationVideoError(opId) {
      if (!opId || this.operationVideoWatched[opId]) return;
      const watched = { ...this.operationVideoWatched, [opId]: true };
      const stage = this.computeStage(this.resultItems, watched, this.value.completed);
      this.patch({ operationVideoWatched: watched, operationWatched: watched, step8Stage: stage });
      uni.showToast({ title: I18N.opMissingVideo, icon: 'none' });
    },
    appendEvidence(items = []) {
      const merged = [...this.evidenceList, ...items];
      this.patch({ evidenceList: merged, offlineEvidenceList: merged });
    },
    restartLab() {
      const firstOperationId = (this.operationOptions[0] && this.operationOptions[0].id) || '';
      const firstVideoUrl = (this.operationOptions[0] && this.operationOptions[0].videoUrl) || '';
      const emptyWatched = this.operationOptions.reduce((acc, item) => {
        acc[item.id] = false;
        return acc;
      }, { op1: false, op2: false });

      this.clearCraftPreviewTimer();
      this.localWorkspaceParts = [];
      this.currentAction = null;
      this.isWorkspaceHot = false;
      this.fusionFlash = { active: false, x: 0, y: 0 };
      this.particles = [];
      this.fusionHistory = [];
      this.lastMismatchHintAt = 0;
      this.latestOutputId = '';
      this.preview = {
        visible: false,
        title: '',
        src: ''
      };
      this.poolDrag = {
        active: false,
        itemId: '',
        itemLabel: '',
        itemImage: '',
        x: 0,
        y: 0
      };
      this.draggingPart = {
        active: false,
        index: -1,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0
      };
      this.videoSwitchTick += 1;

      this.patch({
        workspaceLayout: [],
        workspaceItems: [],
        resultItems: [],
        recipeProgress: {},
        actionLogs: [],
        operationVideoChoice: firstOperationId,
        operationChoice: firstOperationId,
        operationVideoWatched: emptyWatched,
        operationWatched: emptyWatched,
        step8Stage: 'build',
        evidenceList: [],
        offlineEvidenceList: [],
        completed: false,
        completedAt: '',
        experimentVideo: firstVideoUrl,
        virtualLabNote: ''
      });
      uni.showToast({ title: I18N.restartLab, icon: 'none' });
    },
    addScreenshot() {
      uni.chooseImage({
        count: 6,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const files = Array.isArray(res.tempFiles) && res.tempFiles.length > 0
            ? res.tempFiles
            : (Array.isArray(res.tempFilePaths)
              ? res.tempFilePaths.map((path, idx) => ({ path, name: `image-${idx + 1}.png` }))
              : []);
          const items = files.map((file, idx) => createEvidenceItem({
            type: 'image',
            name: file.name || `image-${Date.now()}-${idx + 1}.png`,
            path: file.path || file.tempFilePath || ''
          }));
          this.appendEvidence(items);
        },
        fail: () => {
          uni.showToast({ title: I18N.imageFail, icon: 'none' });
        }
      });
    },
    addVideoProof() {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        compressed: true,
        maxDuration: 120,
        success: (res) => {
          const item = createEvidenceItem({
            type: 'video',
            name: res.name || `video-${Date.now()}.mp4`,
            path: res.tempFilePath || ''
          });
          this.appendEvidence([item]);
        },
        fail: () => {
          uni.showToast({ title: I18N.videoFail, icon: 'none' });
        }
      });
    },
    removeEvidence(index) {
      const next = [...this.evidenceList];
      next.splice(index, 1);
      this.patch({ evidenceList: next, offlineEvidenceList: next });
    },
    isImageEvidence(item) {
      return resolveEvidenceType(item) === 'image';
    },
    isVideoEvidence(item) {
      return resolveEvidenceType(item) === 'video';
    },
    openEvidencePreview(item) {
      if (!item || !item.path) return;
      if (!this.isImageEvidence(item)) {
        uni.showToast({ title: '视频可在卡片中直接播放', icon: 'none' });
        return;
      }
      this.preview = {
        visible: true,
        title: item.name || '上传图片',
        src: item.path
      };
    },
    syncAutoCompleteState(ready) {
      const draft = this.getDraftValue();
      const completed = draft.completed === true;
      if (ready) {
        if (completed && draft.step8Stage === 'done') return;
        this.patch({
          completed: true,
          completedAt: hasText(draft.completedAt) ? draft.completedAt : nowText(),
          step8Stage: 'done'
        });
        return;
      }
      if (!completed) return;
      const stage = this.computeStage(this.resultItems, this.operationVideoWatched, false);
      this.patch({ completed: false, completedAt: '', step8Stage: stage });
    }
  }
};
</script>

<style scoped>
.step-card { position: relative; background: #f8fbff; border: 1px solid #d9e5f6; border-radius: 16rpx; padding: 14rpx; }
.head { font-size: 30rpx; font-weight: 700; color: #2b5fba; }
.tips { margin-top: 8rpx; font-size: 20rpx; color: #4c6078; line-height: 1.5; }
.voice-card { margin-top: 14rpx; border: 1px solid #cde2ff; border-radius: 16rpx; background: linear-gradient(180deg, #f6faff, #eef5ff); padding: 18rpx 20rpx; box-shadow: 0 8rpx 20rpx rgba(91, 139, 201, 0.08); }
.voice-title { font-size: 26rpx; font-weight: 700; color: #2f5ca1; }
.voice-text { margin-top: 10rpx; font-size: 24rpx; color: #3f5771; line-height: 1.7; }
.voice-btn { margin-top: 6rpx; display: inline-flex; border-radius: 999rpx; padding: 6rpx 12rpx; font-size: 17rpx; color: #2f5ca1; border: 1px solid #9fc0ed; background: #fff; }
.next-tip {
  margin-top: 12rpx;
  font-size: 23rpx;
  color: #5f4a18;
  line-height: 1.7;
  background: linear-gradient(180deg, #fff9ee, #fff3dd);
  border: 1px solid #f0ddb2;
  border-radius: 16rpx;
  padding: 18rpx 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(180, 142, 72, 0.08);
}
.lab-grid {
  margin-top: 10rpx;
  display: grid;
  grid-template-columns: minmax(0, 44fr) minmax(0, 56fr);
  gap: 12rpx;
  align-items: stretch;
}
.right-column {
  display: grid;
  grid-template-rows: auto auto;
  gap: 12rpx;
  align-content: start;
  height: 100%;
  min-height: 0;
}
.zone {
  background: #fff;
  border: 1px solid #d7e2f2;
  border-radius: 10rpx;
  padding: 10rpx;
  min-height: 0;
  box-sizing: border-box;
}
.zone-title { font-size: 20rpx; font-weight: 700; color: #2d517d; }
.pool-zone {
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.token-grid {
  margin-top: 8rpx;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(156rpx, 1fr));
  grid-auto-rows: 188rpx;
  gap: 10rpx;
  align-content: start;
  flex: 1;
  min-height: 0;
}
.token {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid #d7e2f2;
  background: #f8fbff;
  border-radius: 8rpx;
  padding: 6rpx 6rpx 8rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.token-image {
  width: 100%;
  height: 126rpx;
  border-radius: 6rpx;
  background: #eef5ff;
}
.tool-tag {
  position: absolute;
  left: 8rpx;
  top: 8rpx;
  border-radius: 999rpx;
  background: rgba(248, 163, 0, 0.9);
  color: #fff;
  font-size: 14rpx;
  line-height: 1;
  padding: 5rpx 8rpx;
}
.token-name {
  margin-top: 4rpx;
  font-size: 17rpx;
  color: #334a63;
  line-height: 1.25;
  max-height: 42rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.zoom-btn {
  position: absolute;
  right: 10rpx;
  top: 10rpx;
  border-radius: 999rpx;
  background: rgba(31, 76, 137, 0.82);
  color: #fff;
  font-size: 16rpx;
  line-height: 1;
  padding: 6rpx 10rpx;
}
.workspace-canvas {
  position: relative;
  margin-top: 8rpx;
  height: 340rpx;
  border: 2rpx dashed #b6cbea;
  border-radius: 10rpx;
  background: #f7fbff;
  overflow: hidden;
}
.workspace-canvas.hot { border-color: #5da2ff; }
.canvas-empty { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: #70839c; font-size: 19rpx; text-align: center; width: 75%; }
.fusion-glow {
  position: absolute;
  width: 130rpx;
  height: 130rpx;
  transform: translate(-50%, -50%);
  border-radius: 999rpx;
  background: radial-gradient(circle, rgba(255, 238, 168, 0.72) 0%, rgba(255, 213, 92, 0.35) 45%, rgba(255, 213, 92, 0) 100%);
  animation: fusionPulse 420ms ease-out forwards;
  pointer-events: none;
  z-index: 2;
}
.fusion-particle {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  transform: translate(-50%, -50%);
  animation: particleFly var(--dur) ease-out forwards;
  pointer-events: none;
  z-index: 2;
}
.part { position: absolute; border: 1px solid #d7e2f2; background: #fff; border-radius: 8rpx; box-shadow: 0 4rpx 10rpx rgba(24, 76, 144, 0.12); }
.part.near { border-color: #4f9dff; box-shadow: 0 0 0 2rpx rgba(79, 157, 255, 0.2); }
.part.preview {
  border-color: #78b0ff;
  box-shadow: 0 0 0 4rpx rgba(92, 157, 255, 0.18), 0 12rpx 24rpx rgba(67, 119, 212, 0.18);
}
.part-image {
  width: 100%;
  height: calc(100% - 30rpx);
  border-radius: 8rpx 8rpx 0 0;
  background: #eef5ff;
}
.part-name { height: 30rpx; font-size: 15rpx; color: #2f4864; display: flex; align-items: center; justify-content: center; text-align: center; }
.part-zoom {
  position: absolute;
  left: -10rpx;
  top: -10rpx;
  min-width: 40rpx;
  height: 24rpx;
  border-radius: 999rpx;
  background: #4f9dff;
  color: #fff;
  border: 2rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14rpx;
  padding: 0 6rpx;
}
.part-close { position: absolute; right: -10rpx; top: -10rpx; width: 24rpx; height: 24rpx; border-radius: 999rpx; background: #f35a5a; color: #fff; border: 2rpx solid #fff; display: flex; align-items: center; justify-content: center; font-size: 16rpx; }
.results {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.result-list {
  margin-top: 8rpx;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(156rpx, 1fr));
  grid-auto-rows: 188rpx;
  gap: 10rpx;
  align-content: start;
  max-height: 206rpx;
  overflow: auto;
}
.result-item {
  width: 100%;
  height: 100%;
  border: 1px solid #d7e2f2;
  background: #f8fbff;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  padding: 6rpx 6rpx 8rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.result-item.locked { opacity: 0.6; }
.result-item.done { border-color: #8dcd9f; background: #f4fff7; }
.result-item.fresh { box-shadow: 0 0 0 2rpx rgba(79, 157, 255, 0.18); }
.result-actions {
  margin-top: 12rpx;
}
.restart-btn {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 108rpx;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  border: 1px solid #bfd7ff;
  background: linear-gradient(135deg, #f7fbff 0%, #edf4ff 100%);
  box-shadow: 0 10rpx 24rpx rgba(83, 124, 196, 0.1);
}
.restart-btn-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5d9eff 0%, #76b7ff 100%);
  box-shadow: 0 8rpx 18rpx rgba(93, 158, 255, 0.28);
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
}
.restart-btn-copy {
  min-width: 0;
  flex: 1;
}
.restart-btn-title {
  font-size: 28rpx;
  line-height: 1.2;
  font-weight: 700;
  color: #224d8b;
}
.restart-btn-desc {
  margin-top: 6rpx;
  font-size: 20rpx;
  line-height: 1.55;
  color: #577498;
}
.result-image {
  width: 100%;
  height: 126rpx;
  border-radius: 6rpx;
  background: #eef5ff;
}
.result-text {
  margin-top: 4rpx;
  min-height: 34rpx;
  flex: 1;
  overflow: hidden;
}
.result-name {
  font-size: 17rpx;
  color: #2f4864;
  line-height: 1.2;
  max-height: 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.result-state { margin-top: 2rpx; font-size: 14rpx; color: #6f839c; }
.result-zoom {
  align-self: flex-end;
  border-radius: 999rpx;
  background: #4f9dff;
  color: #fff;
  font-size: 14rpx;
  line-height: 1;
  padding: 6rpx 10rpx;
}
.card { margin-top: 10rpx; background: #fff; border: 1px solid #d7e2f2; border-radius: 10rpx; padding: 10rpx; }
.card-title { font-size: 21rpx; font-weight: 700; color: #2d517d; }
.upload-tip { margin-top: 6rpx; font-size: 17rpx; color: #6f8298; }
.op-card {
  padding: 0;
  border-color: #d3e2f6;
  overflow: hidden;
  background: linear-gradient(180deg, #f7fbff, #eff5ff);
}
.op-nav {
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 12rpx 14rpx 10rpx;
  background: rgba(245, 250, 255, 0.95);
  border-bottom: 1px solid #d7e6fb;
  backdrop-filter: blur(4px);
}
.op-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}
.op-nav-title {
  font-size: 22rpx;
  color: #214e7f;
  font-weight: 700;
}
.op-nav-meta {
  font-size: 17rpx;
  color: #52749a;
}
.op-nav-track {
  margin-top: 8rpx;
  width: 100%;
  height: 10rpx;
  border-radius: 999rpx;
  background: #dce9fb;
  overflow: hidden;
}
.op-nav-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #67bbff, #3fd0b7);
  transition: width 0.35s ease;
}
.op-layout {
  padding: 14rpx;
  display: grid;
  grid-template-columns: minmax(280rpx, 30%) minmax(0, 70%);
  gap: 16rpx;
  align-items: start;
}
.op-layout.has-practice {
  grid-template-columns: minmax(320rpx, 380rpx) minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
}
.video-panel {
  border: 1px solid #d6e5f8;
  border-radius: 18rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(243, 248, 255, 0.96));
  padding: 14rpx;
  box-shadow: 0 10rpx 24rpx rgba(68, 113, 170, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.video-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}
.video-panel-title {
  font-size: 22rpx;
  color: #214f80;
  font-weight: 700;
  line-height: 1.3;
}
.video-panel-tag {
  flex: 0 0 auto;
  border-radius: 999rpx;
  padding: 6rpx 12rpx;
  font-size: 15rpx;
  color: #4c6e95;
  background: #edf4ff;
  line-height: 1;
}
.video-panel-tip {
  font-size: 17rpx;
  color: #67809c;
  line-height: 1.45;
  min-height: 48rpx;
}
.op-switch {
  border: 1px solid #d3e5fb;
  border-radius: 18rpx;
  background: linear-gradient(180deg, #ffffff, #f3f8ff);
  padding: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  box-shadow: 0 8rpx 20rpx rgba(88, 129, 179, 0.08);
  box-sizing: border-box;
}
.switch-bridge {
  align-self: stretch;
  justify-content: flex-start;
  min-width: 0;
}
.op-switch-head {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6rpx;
  padding: 4rpx 2rpx 0;
  text-align: center;
}
.op-switch-title {
  font-size: 20rpx;
  color: #2a4f79;
  font-weight: 700;
}
.op-switch-progress {
  font-size: 17rpx;
  color: #5f7692;
}
.switch-bridge-tip {
  font-size: 16rpx;
  color: #6a83a0;
  line-height: 1.5;
  text-align: center;
  padding: 0 6rpx;
  margin-bottom: 2rpx;
}
.op-button {
  border: 2rpx solid #cfe2fb;
  border-radius: 14rpx;
  background: #ffffff;
  padding: 16rpx 12rpx 12rpx;
  min-height: 176rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12rpx;
  flex: 1 1 0;
  box-shadow: 0 6rpx 16rpx rgba(66, 112, 166, 0.1);
  transition: all 0.25s ease;
}
.op-switch.compact .op-button {
  min-height: 0;
  padding: 16rpx 10rpx 12rpx;
}
.op-button:active { transform: scale(0.985) translateY(1rpx); }
.op-button.active {
  border-color: #5d9eff;
  background: linear-gradient(180deg, #f1f8ff, #e7f2ff);
  box-shadow: 0 10rpx 22rpx rgba(72, 135, 216, 0.2);
}
.op-button.done {
  border-color: #8dcd9f;
  background: linear-gradient(180deg, #f6fff8, #eefcf1);
}
.op-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 14rpx;
  flex: 1 1 auto;
}
.op-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  background: linear-gradient(180deg, #ecf6ff, #ddefff);
  flex: 0 0 72rpx;
  box-shadow: 0 8rpx 20rpx rgba(83, 144, 220, 0.14);
}
.op-copy {
  min-width: 0;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.op-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
}
.op-name {
  font-size: 30rpx;
  color: #204a74;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}
.op-state {
  border-radius: 999rpx;
  padding: 6rpx 14rpx 5rpx;
  font-size: 18rpx;
  color: #5f7390;
  background: #eef4fb;
  line-height: 1;
  white-space: nowrap;
}
.op-state-bottom {
  align-self: center;
  margin-top: auto;
}
.op-state.active {
  color: #2f65aa;
  background: #e7f0ff;
}
.op-state.done {
  color: #2f8150;
  background: #e8f8ec;
}
.op-progress-track {
  height: 10rpx;
  border-radius: 999rpx;
  background: #e1ebfa;
  overflow: hidden;
  width: 100%;
  margin-top: auto;
}
.op-progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #5ba9ff, #43d4b9);
  transition: width 0.25s ease;
}
.op-player-body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
}
.video-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14rpx;
  overflow: hidden;
  border: 1px solid #cfdff4;
  box-shadow: 0 12rpx 28rpx rgba(41, 88, 143, 0.14);
  background: #000;
}
.video-frame-player {
  width: 100%;
  height: 100%;
  display: block;
}
.op-video-placeholder {
  color: #4f6480;
  font-size: 20rpx;
  text-align: center;
  line-height: 1.6;
  width: 100%;
  max-width: 760px;
  min-height: 240rpx;
  border-radius: 12rpx;
  border: 1px dashed #cad9ee;
  background: #f6f9ff;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.practice-video-wrap {
  margin-top: 10rpx;
  width: 100%;
  max-width: 980rpx;
  aspect-ratio: 16 / 9;
  border-radius: 14rpx;
  overflow: hidden;
  border: 1px solid #d1e2f7;
  background: #000;
  box-shadow: 0 10rpx 24rpx rgba(64, 108, 164, 0.12);
}
.practice-video-wrap.compact {
  margin-top: 0;
  max-width: none;
}
.practice-video {
  width: 100%;
  height: 100%;
}
@media (max-width: 960px) {
  .op-layout,
  .op-layout.has-practice {
    grid-template-columns: 1fr;
  }
  .video-panel,
  .op-switch {
    width: 100%;
  }
  .video-panel-tip {
    min-height: 0;
  }
}
.btn-row { margin-top: 8rpx; display: flex; gap: 8rpx; }
.btn { flex: 1; text-align: center; border-radius: 999rpx; font-size: 19rpx; padding: 10rpx 0; color: #fff; background: linear-gradient(135deg, #4f9dff, #56d0ff); }
.btn.green { background: linear-gradient(135deg, #5bb36f, #99d48e); }
.evidence-grid {
  margin-top: 10rpx;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220rpx, 1fr));
  gap: 10rpx;
}
.evidence-card {
  border: 1px solid #d7e2f2;
  border-radius: 10rpx;
  background: #f9fcff;
  overflow: hidden;
  box-shadow: 0 6rpx 14rpx rgba(78, 120, 186, 0.08);
}
.evidence-media {
  width: 100%;
  height: 168rpx;
  display: block;
  background: #edf4ff;
}
.evidence-empty {
  width: 100%;
  height: 168rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b84a4;
  font-size: 18rpx;
  background: #edf4ff;
}
.evidence-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  padding: 8rpx 10rpx;
}
.evidence-name {
  flex: 1;
  min-width: 0;
  font-size: 17rpx;
  color: #365375;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.evidence-empty-tip {
  margin-top: 10rpx;
  font-size: 17rpx;
  color: #6f8298;
}
.file-row { margin-top: 8rpx; padding: 8rpx; border: 1px solid #d7e2f2; border-radius: 8rpx; background: #f9fcff; display: flex; justify-content: space-between; align-items: center; gap: 8rpx; font-size: 18rpx; color: #364f69; }
.remove { color: #c65555; }
.note-input { margin-top: 8rpx; width: 100%; min-height: 100rpx; border: 1px solid #d7e2f2; border-radius: 8rpx; background: #f9fcff; padding: 8rpx; font-size: 19rpx; color: #3d556d; box-sizing: border-box; }
.drag-mask { position: fixed; inset: 0; z-index: 9998; }
.drag-ghost { position: fixed; transform: translate(-50%, -50%); width: 120rpx; border: 1px solid #85b8f4; border-radius: 8rpx; background: #fff; box-shadow: 0 8rpx 20rpx rgba(32, 80, 145, 0.22); pointer-events: none; z-index: 9999; overflow: hidden; }
.drag-ghost-image {
  width: 100%;
  height: 110rpx;
  background: #eef5ff;
}
.drag-ghost-name { padding: 4rpx 6rpx; font-size: 16rpx; color: #2f4864; text-align: center; }
.preview-mask {
  position: fixed;
  inset: 0;
  background: rgba(11, 18, 32, 0.62);
  z-index: 10010;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}
.preview-card {
  width: 92vw;
  max-width: 980rpx;
  max-height: 88vh;
  border-radius: 16rpx;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  padding: 12rpx 14rpx;
  border-bottom: 1px solid #e1ebf9;
}
.preview-title {
  font-size: 22rpx;
  font-weight: 700;
  color: #274d7c;
}
.preview-close {
  width: 42rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: #f0f5ff;
  color: #2d517d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  line-height: 1;
}
.preview-image {
  width: 100%;
  height: 68vh;
  max-height: 980rpx;
  background: #f4f8ff;
}
@keyframes fusionPulse {
  0% { opacity: 0.95; transform: translate(-50%, -50%) scale(0.4); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
}
@keyframes particleFly {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)); }
}
@media (max-width: 960px) {
  .lab-grid { grid-template-columns: 1fr; }
  .right-column { grid-template-rows: auto auto; height: auto; }
  .pool-zone { height: auto; display: block; }
  .token-grid,
  .result-list { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 188rpx; max-height: none; }
  .token,
  .result-item { width: 100%; height: 188rpx; }
  .restart-btn { min-height: 100rpx; }
  .token-image,
  .result-image { height: 120rpx; }
  .workspace-canvas { height: 440rpx; }
  .op-layout {
    grid-template-columns: 1fr;
    gap: 12rpx;
  }
  .op-switch {
    padding: 10rpx;
  }
  .op-button {
    min-height: 138rpx;
    padding: 10rpx;
  }
  .op-switch-head {
    padding: 0 2rpx;
  }
  .op-stage-title {
    padding: 2rpx 0 6rpx;
  }
  .op-player-body {
    min-height: 206rpx;
  }
  .op-video-wrap {
    max-width: 100%;
  }
  .op-video-placeholder {
    min-height: 200rpx;
  }
}
</style>
