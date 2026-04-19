﻿<template>
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
            v-for="item in poolItems"
            :key="item.id"
            class="token"
            @touchstart.stop.prevent="startPoolDrag(item.id, item.type, $event)"
            @mousedown.stop.prevent="startPoolDrag(item.id, item.type, $event)"
            @click="quickAdd(item.id, item.type)"
          >
            <image class="token-image" :src="item.image" mode="aspectFit" />
            <view class="tool-tag" v-if="item.type === 'tool'">工具</view>
            <view
              class="view-btn"
              @touchstart.stop.prevent
              @mousedown.stop.prevent
              @click.stop="openPreview(item.id)"
            >查看</view>
            <view class="token-name">{{ item.label }}</view>
          </view>
        </view>
      </view>

      <view class="right-column">
        <view class="zone workspace-zone">
          <view class="zone-title">{{ i18n.workspace }}</view>
          <view class="workspace" :class="{ hot: isWorkspaceHot }">
            <view v-if="workspaceParts.length === 0" class="empty">{{ i18n.dragHint }}</view>
            <view
              v-for="(part, index) in workspaceParts"
              :key="part.instanceId"
              class="part"
              :class="{ near: part.isNear }"
              :style="partStyle(part)"
              @touchstart.stop.prevent="startPartDrag(index, $event)"
              @touchmove.stop.prevent="dragPart(index, $event)"
              @touchend.stop.prevent="endPartDrag(index)"
              @mousedown.stop.prevent="startPartDrag(index, $event)"
              @mousemove.stop.prevent="dragPart(index, $event)"
              @mouseup.stop.prevent="endPartDrag(index)"
            >
              <image class="part-image" :src="itemMap[part.itemId].image" mode="aspectFit" />
              <view class="part-name">{{ itemMap[part.itemId].label }}</view>
              <view
                class="part-view"
                @touchstart.stop.prevent
                @mousedown.stop.prevent
                @click.stop="openPreview(part.itemId)"
              >查看</view>
              <view class="part-del" @click.stop="removePart(index)">×</view>
            </view>
          </view>
        </view>

        <view class="zone results-zone">
          <view class="zone-title">{{ i18n.results }}</view>
          <view class="result-list">
            <view
              v-for="item in sortedResultDefs"
              :key="item.id"
              class="result-item"
              :class="{ locked: !isResultDone(item.id), done: isResultDone(item.id) }"
              @touchstart.stop.prevent="startPoolDrag(item.id, 'result', $event)"
              @mousedown.stop.prevent="startPoolDrag(item.id, 'result', $event)"
              @click="quickAdd(item.id, 'result')"
            >
              <image class="result-image" :src="item.image" mode="aspectFit" />
              <view
                class="result-view-btn"
                @touchstart.stop.prevent
                @mousedown.stop.prevent
                @click.stop="openPreview(item.id)"
              >查看</view>
              <view class="result-meta">
                <view class="result-name">{{ item.label }}</view>
                <view class="result-state">{{ isResultDone(item.id) ? i18n.done : i18n.locked }}</view>
              </view>
            </view>
          </view>

          <view class="restart-btn" @click="restartLab">
            <view class="restart-icon">↺</view>
            <view class="restart-copy">
              <view class="restart-title">重新开始</view>
              <view class="restart-desc">清空当前组装与观察记录，从第一环节重新探究</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="card" v-if="supportVideos.length > 0">
      <view class="card-title">实践动手讲解视频</view>
      <view class="tip-lite">跟着讲解视频完成搭建操作，帮助你更顺利完成探究任务。</view>
      <view class="video-grid">
        <view class="video-card" v-for="item in supportVideos" :key="item.id">
          <view class="video-title">{{ item.title }}</view>
          <view class="tip-lite">{{ item.desc }}</view>
          <view class="video-frame" v-if="item.videoUrl">
            <video class="video-player" :src="item.videoUrl" controls show-center-play-btn object-fit="cover" />
          </view>
          <view class="video-empty" v-else>视频未配置</view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">{{ i18n.uploadTitle }}</view>
      <view class="tip-lite">{{ i18n.uploadOptional }}</view>
      <view class="actions">
        <view class="btn" @click="addScreenshot">{{ i18n.uploadImage }}</view>
        <view class="btn green" @click="addVideo">{{ i18n.uploadVideo }}</view>
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
            <text class="remove" @click="removeEvidence(idx)">删除</text>
          </view>
        </view>
      </view>
      <view v-else class="evidence-empty-tip">暂无上传内容</view>
    </view>

    <view class="card">
      <view class="card-title">实验笔记</view>
      <textarea class="note-input" :value="value.notes" @input="patch({ notes: $event.detail.value })" placeholder="记录你的发现..." />
    </view>

    <view
      v-if="poolDrag.active"
      class="drag-mask"
      @touchmove.stop.prevent="onGlobalMove"
      @touchend.stop.prevent="finishPoolDrag($event)"
      @touchcancel.stop.prevent="finishPoolDrag($event)"
      @mousemove.stop.prevent="onGlobalMove"
      @mouseup.stop.prevent="finishPoolDrag($event)"
      @mouseleave.stop.prevent="finishPoolDrag($event)"
    />

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
  getEngineeringStep6LabConfig,
  ENGINEERING_STEP6_FINAL_RESULT_ID
} from '@/config/engineering-step6-lab-config.js';

const I18N = {
  title: '⑥ 虚拟实验探究操作', // 步骤标题：虚拟实验探究操作
  tip: '把材料或成果拖到操作区，系统会自动完成配方合成。先完成三个系统，再合成最终模型。', // 操作提示文本
  pool: '左侧 · 材料区（含工具）', // 材料区标题
  workspace: '右上 · 探究操作区', // 操作区标题
  results: '右下 · 成果区', // 成果区标题
  dragHint: '从左侧拖到这里开始搭建', // 拖拽提示文本
  done: '已完成', // 已完成状态文本
  locked: '未生成', // 未生成状态文本
  uploadTitle: '上传线下成果（可选）', // 上传区域标题
  uploadOptional: '在这里可以选择上传你的线下模型搭建成果哦。', // 上传可选提示
  uploadImage: '上传图片', // 上传图片按钮
  uploadVideo: '上传视频', // 上传视频按钮
  nextHintPrefix: '下一步建议：', // 下一步建议前缀
  allRecipeDone: '所有搭建配方已完成', // 所有配方完成提示
  stageBuildStart: '先把材料拖到操作区，完成当前环节的第一个系统搭建。', // 开始搭建阶段提示
  stageBuildContinue: '继续按提示完成系统组装，最后合成最终模型。', // 继续搭建阶段提示
  stageUpload: '所有搭建配方已完成，系统将自动完成第6步。', // 上传阶段提示
  stageDone: '太棒了，你已经完成了实验部分的探究操作。', // 完成阶段提示
  resultLocked: '这个成果还没解锁', // 成果未解锁提示
  recipeDonePrefix: '合成成功：', // 合成成功前缀
  restartLab: '已重新开始虚拟搭建', // 重新开始提示
  imageFail: '图片选择失败', // 图片选择失败提示
  videoFail: '视频选择失败' // 视频选择失败提示
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
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

export default {
  props: {
    value: { type: Object, default: () => ({}) },
    experiment: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      i18n: I18N,
      workspaceRect: null,
      localWorkspaceParts: [],
      currentAction: null,
      isWorkspaceHot: false,
      poolDrag: { active: false, itemId: '', x: 0, y: 0 },
      draggingPart: { active: false, index: -1, startX: 0, startY: 0, startLeft: 0, startTop: 0 },
      preview: { visible: false, title: '', src: '' }
    };
  },
  computed: {
    step6Config() { return getEngineeringStep6LabConfig(this.experiment && this.experiment.id); },
    poolItems() { return this.step6Config.materialToolItems || []; },
    resultDefs() { return this.step6Config.resultItems || []; },
    itemMap() { return this.step6Config.itemMap || {}; },
    recipes() { return this.step6Config.recipes || []; },
    supportVideos() { return this.step6Config.supportVideos || []; },
    resultItems() { return Array.isArray(this.value.resultItems) ? this.value.resultItems.filter((id) => !!this.itemMap[id]) : []; },
    workspaceParts() { return this.localWorkspaceParts; },
    evidenceList() { return Array.isArray(this.value.evidenceList) ? this.value.evidenceList : []; },
    evidenceCount() { return this.evidenceList.length; },
    sortedResultDefs() {
      const done = new Set(this.resultItems);
      return [...this.resultDefs].sort((a, b) => Number(done.has(b.id)) - Number(done.has(a.id)));
    },
    doneRecipeCount() { return this.recipes.filter((r) => this.resultItems.includes(r.output)).length; },
    hasFinalProduct() { return this.resultItems.includes(ENGINEERING_STEP6_FINAL_RESULT_ID); },
    nextRecipe() { return this.recipes.find((r) => !this.resultItems.includes(r.output)) || null; },
    nextHintText() {
      return this.nextRecipe ? `${I18N.nextHintPrefix}${this.nextRecipe.nextHint || this.nextRecipe.hint}` : I18N.allRecipeDone;
    },
    stageGuideText() {
      const stage = this.value.step6Stage || this.computeStage(this.resultItems, this.value.virtualCompleted === true);
      if (stage === 'build') {
        if (this.nextRecipe && hasText(this.nextRecipe.hint)) return this.nextRecipe.hint;
        return this.doneRecipeCount === 0 ? I18N.stageBuildStart : I18N.stageBuildContinue;
      }
      if (stage === 'upload' || stage === 'upload-ready') return I18N.stageUpload;
      return I18N.stageDone;
    },
    
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler() {
        this.syncFromValue();
        this.syncAutoCompleteState(Array.isArray(this.value.resultItems) ? this.value.resultItems : []);
        this.$nextTick(() => this.findAction());
      }
    }
  },
  mounted() {
    this.ensureInit();
    this.syncFromValue();
    this.$nextTick(() => this.measureRect());
  },
  methods: {
    patch(payload) { this.$emit('update', { ...(this.value || {}), ...payload }); },
    computeStage(resultItems, completed) {
      if (completed === true) return 'done';
      if (Array.isArray(resultItems) && resultItems.includes(ENGINEERING_STEP6_FINAL_RESULT_ID)) return 'upload';
      return 'build';
    },
    syncAutoCompleteState(resultItems) {
      const done = Array.isArray(resultItems) && resultItems.includes(ENGINEERING_STEP6_FINAL_RESULT_ID);
      if (done) {
        const completedAt = hasText(this.value.completedAt) ? this.value.completedAt : nowText();
        if (this.value.virtualCompleted !== true || this.value.step6Stage !== 'done' || this.value.completedAt !== completedAt) {
          this.patch({
            virtualCompleted: true,
            completedAt,
            step6Stage: 'done'
          });
        }
        return;
      }
      if (this.value.virtualCompleted === true || hasText(this.value.completedAt)) {
        this.patch({
          virtualCompleted: false,
          completedAt: '',
          step6Stage: this.computeStage(resultItems, false)
        });
      }
    },
    ensureInit() {
      const payload = {};
      if (!hasText(this.value.projectId)) payload.projectId = `${this.experiment.id || 'engineering-01'}-step6-lab`;
      if (!hasText(this.value.modelName)) payload.modelName = this.experiment.title || '离心甩干机模型';
      if (!Array.isArray(this.value.materialsPool)) payload.materialsPool = this.poolItems.filter((i) => i.type !== 'tool').map((i) => i.id);
      if (!Array.isArray(this.value.toolsPool)) payload.toolsPool = this.poolItems.filter((i) => i.type === 'tool').map((i) => i.id);
      if (!Array.isArray(this.value.workspaceItems)) payload.workspaceItems = [];
      if (!Array.isArray(this.value.workspaceLayout)) payload.workspaceLayout = [];
      if (!Array.isArray(this.value.resultItems)) payload.resultItems = [];
      if (!this.value.recipeProgress || typeof this.value.recipeProgress !== 'object') payload.recipeProgress = {};
      if (!Array.isArray(this.value.actionLogs)) payload.actionLogs = [];
      if (!Array.isArray(this.value.evidenceList)) payload.evidenceList = [];
      if (!Array.isArray(this.value.offlineEvidenceList)) payload.offlineEvidenceList = [];
      if (!hasText(this.value.notes)) payload.notes = '';
      if (!hasText(this.value.step6Stage)) payload.step6Stage = this.computeStage(this.value.resultItems || [], this.value.virtualCompleted === true);
      if (typeof this.value.virtualCompleted !== 'boolean') payload.virtualCompleted = false;
      if (!hasText(this.value.completedAt)) payload.completedAt = '';
      if (Object.keys(payload).length > 0) this.patch(payload);
    },
    syncFromValue() {
      const layout = Array.isArray(this.value.workspaceLayout) ? this.value.workspaceLayout : [];
      if (layout.length > 0) {
        this.localWorkspaceParts = layout
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
      const ids = Array.isArray(this.value.workspaceItems) ? this.value.workspaceItems : [];
      this.localWorkspaceParts = ids.filter((id) => !!this.itemMap[id]).map((id, idx) => ({
        instanceId: `${id}-${Date.now()}-${idx}`,
        itemId: id,
        left: 20 + (idx % 3) * 90,
        top: 20 + Math.floor(idx / 3) * 86,
        isNear: false
      }));
    },
    measureRect(done) {
      uni.createSelectorQuery().in(this).select('.workspace').boundingClientRect((rect) => {
        if (rect) this.workspaceRect = rect;
        if (typeof done === 'function') done();
      }).exec();
    },
    getPoint(event) {
      const t = (event && event.touches && event.touches[0]) || (event && event.changedTouches && event.changedTouches[0]) || event || {};
      return { x: Number(t.clientX || 0), y: Number(t.clientY || 0) };
    },
    inWorkspace(x, y) {
      if (!this.workspaceRect) return false;
      const r = this.workspaceRect;
      return x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height;
    },
    partStyle(part) { return { left: `${Math.round(part.left)}px`, top: `${Math.round(part.top)}px` }; },
    resolveItem(itemId) { return this.itemMap[itemId] || { id: itemId, label: itemId, image: '' }; },
    isResultDone(id) { return this.resultItems.includes(id); },
    openPreview(itemId) {
      const item = this.resolveItem(itemId);
      if (!item || !item.image) return;
      this.preview = { visible: true, title: item.label || '', src: item.image };
    },
    closePreview() { this.preview = { visible: false, title: '', src: '' }; },
    startPoolDrag(id, type, event) {
      if (type === 'result' && !this.isResultDone(id)) {
        uni.showToast({ title: I18N.resultLocked, icon: 'none' });
        return;
      }
      this.measureRect(() => {
        const p = this.getPoint(event);
        this.poolDrag = { active: true, itemId: id, x: p.x, y: p.y };
        this.isWorkspaceHot = this.inWorkspace(p.x, p.y);
      });
    },
    onGlobalMove(event) {
      if (!this.poolDrag.active) return;
      const p = this.getPoint(event);
      this.poolDrag = { ...this.poolDrag, x: p.x, y: p.y };
      this.isWorkspaceHot = this.inWorkspace(p.x, p.y);
    },
    finishPoolDrag(event) {
      if (!this.poolDrag.active) return;
      const p = this.getPoint(event);
      if (this.inWorkspace(p.x, p.y)) this.addPart(this.poolDrag.itemId, p.x, p.y);
      this.poolDrag = { active: false, itemId: '', x: 0, y: 0 };
      this.isWorkspaceHot = false;
    },
    quickAdd(id, type) {
      if (type === 'result' && !this.isResultDone(id)) {
        uni.showToast({ title: I18N.resultLocked, icon: 'none' });
        return;
      }
      this.addPart(id);
    },
    addPart(id, clientX, clientY) {
      this.measureRect(() => {
        const rect = this.workspaceRect || { left: 0, top: 0, width: 500, height: 300 };
        let left = 20 + (this.workspaceParts.length % 4) * 82;
        let top = 20 + Math.floor(this.workspaceParts.length / 4) * 76;
        if (typeof clientX === 'number' && typeof clientY === 'number') {
          left = clamp(clientX - rect.left - 48, 0, Math.max(0, rect.width - 96));
          top = clamp(clientY - rect.top - 48, 0, Math.max(0, rect.height - 96));
        }
        const next = [...this.workspaceParts, { instanceId: `${id}-${Date.now()}`, itemId: id, left, top, isNear: false }];
        this.localWorkspaceParts = next;
        this.commitWorkspace(next);
        this.findAction();
        this.tryAutoFuse();
      });
    },
    removePart(index) {
      const next = [...this.workspaceParts];
      next.splice(index, 1);
      this.localWorkspaceParts = next;
      this.commitWorkspace(next);
      this.findAction();
    },
    startPartDrag(index, event) {
      const part = this.workspaceParts[index];
      if (!part) return;
      const p = this.getPoint(event);
      this.draggingPart = { active: true, index, startX: p.x, startY: p.y, startLeft: part.left, startTop: part.top };
    },
    dragPart(index, event) {
      if (!this.draggingPart.active || this.draggingPart.index !== index) return;
      const p = this.getPoint(event);
      const rect = this.workspaceRect || { width: 500, height: 300 };
      const dx = p.x - this.draggingPart.startX;
      const dy = p.y - this.draggingPart.startY;
      const next = [...this.workspaceParts];
      next[index] = {
        ...next[index],
        left: clamp(this.draggingPart.startLeft + dx, 0, Math.max(0, rect.width - 96)),
        top: clamp(this.draggingPart.startTop + dy, 0, Math.max(0, rect.height - 96))
      };
      this.localWorkspaceParts = next;
      this.findAction();
    },
    endPartDrag(index) {
      if (!this.draggingPart.active || this.draggingPart.index !== index) return;
      this.draggingPart = { active: false, index: -1, startX: 0, startY: 0, startLeft: 0, startTop: 0 };
      this.commitWorkspace(this.workspaceParts);
      this.findAction();
      this.tryAutoFuse();
    },
    commitWorkspace(parts) {
      this.patch({
        workspaceLayout: parts.map((p) => ({ instanceId: p.instanceId, itemId: p.itemId, left: Math.round(p.left), top: Math.round(p.top) })),
        workspaceItems: parts.map((p) => p.itemId)
      });
    },
    findAction() {
      const parts = this.workspaceParts;
      let matched = null;
      for (const recipe of this.recipes) {
        if (this.resultItems.includes(recipe.output)) continue;
        const used = new Set();
        const indices = [];
        let ok = true;
        for (const input of recipe.inputs) {
          let hit = -1;
          for (let i = 0; i < parts.length; i += 1) {
            if (used.has(i)) continue;
            if (parts[i].itemId === input) { hit = i; break; }
          }
          if (hit < 0) { ok = false; break; }
          used.add(hit);
          indices.push(hit);
        }
        if (ok) { matched = { recipe, indices }; break; }
      }
      if (!matched) {
        this.localWorkspaceParts = parts.map((p) => ({ ...p, isNear: false }));
        this.currentAction = null;
        return;
      }
      const mark = new Set(matched.indices);
      this.localWorkspaceParts = parts.map((p, i) => ({ ...p, isNear: mark.has(i) }));
      const center = matched.indices.reduce((acc, i) => {
        acc.x += parts[i].left + 48;
        acc.y += parts[i].top + 48;
        return acc;
      }, { x: 0, y: 0 });
      center.x = Math.round(center.x / matched.indices.length);
      center.y = Math.round(center.y / matched.indices.length);
      this.currentAction = { ...matched, center };
    },
    tryAutoFuse() {
      if (!this.currentAction || !this.currentAction.recipe) return;
      this.fuseNow();
    },
    fuseNow() {
      if (!this.currentAction) return;
      const { recipe, indices, center } = this.currentAction;
      const parts = [...this.workspaceParts];
      [...indices].sort((a, b) => b - a).forEach((i) => parts.splice(i, 1));
      const outputInstanceId = `${recipe.output}-${Date.now()}`;
      parts.push({ instanceId: outputInstanceId, itemId: recipe.output, left: center.x - 48, top: center.y - 48, isNear: false });
      const nextResults = this.resultItems.includes(recipe.output) ? [...this.resultItems] : [...this.resultItems, recipe.output];
      const doneNow = nextResults.includes(ENGINEERING_STEP6_FINAL_RESULT_ID);
      const progress = { ...(this.value.recipeProgress || {}), [recipe.id]: true };
      const logs = Array.isArray(this.value.actionLogs) ? [...this.value.actionLogs] : [];
      logs.push({ ts: Date.now(), action: 'fuse', input: recipe.inputs, output: recipe.output, ok: true, recipeId: recipe.id });
      this.localWorkspaceParts = parts;
      this.currentAction = null;
      this.patch({
        workspaceLayout: parts.map((p) => ({ instanceId: p.instanceId, itemId: p.itemId, left: Math.round(p.left), top: Math.round(p.top) })),
        workspaceItems: parts.map((p) => p.itemId),
        resultItems: nextResults,
        recipeProgress: progress,
        actionLogs: logs.slice(-120),
        step6Stage: doneNow ? 'done' : this.computeStage(nextResults, false),
        virtualCompleted: doneNow,
        completedAt: doneNow ? nowText() : ''
      });
      uni.showToast({ title: `${I18N.recipeDonePrefix}${this.itemMap[recipe.output].label}`, icon: 'none' });
      this.findAction();
      this.$nextTick(() => this.tryAutoFuse());
    },
    addScreenshot() {
      uni.chooseImage({
        count: 6,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const files = Array.isArray(res.tempFiles) && res.tempFiles.length > 0
            ? res.tempFiles
            : (Array.isArray(res.tempFilePaths) ? res.tempFilePaths.map((path, idx) => ({ path, name: `image-${idx + 1}.png` })) : []);
          const items = files.map((file, idx) => createEvidenceItem({
            type: 'image',
            name: file.name || `image-${Date.now()}-${idx + 1}.png`,
            path: file.path || file.tempFilePath || ''
          }));
          this.appendEvidence(items);
        },
        fail: () => uni.showToast({ title: I18N.imageFail, icon: 'none' })
      });
    },
    addVideo() {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        compressed: true,
        maxDuration: 120,
        success: (res) => this.appendEvidence([createEvidenceItem({
          type: 'video',
          name: res.name || `video-${Date.now()}.mp4`,
          path: res.tempFilePath || ''
        })]),
        fail: () => uni.showToast({ title: I18N.videoFail, icon: 'none' })
      });
    },
    appendEvidence(items) {
      const merged = [...this.evidenceList, ...items];
      this.patch({ evidenceList: merged, offlineEvidenceList: merged });
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
    restartLab() {
      this.localWorkspaceParts = [];
      this.currentAction = null;
      this.isWorkspaceHot = false;
      this.poolDrag = { active: false, itemId: '', x: 0, y: 0 };
      this.draggingPart = { active: false, index: -1, startX: 0, startY: 0, startLeft: 0, startTop: 0 };
      this.preview = { visible: false, title: '', src: '' };
      this.patch({
        workspaceItems: [],
        workspaceLayout: [],
        resultItems: [],
        recipeProgress: {},
        actionLogs: [],
        evidenceList: [],
        offlineEvidenceList: [],
        notes: '',
        virtualCompleted: false,
        completedAt: '',
        step6Stage: 'build'
      });
      uni.showToast({ title: I18N.restartLab, icon: 'none' });
    },

  }
};
</script>

<style scoped>
.step-card { background: #f8fbff; border: 1px solid #d9e5f6; border-radius: 16rpx; padding: 14rpx; }
.head { font-size: 30rpx; font-weight: 700; color: #2b5fba; }
.tips { margin-top: 8rpx; font-size: 20rpx; color: #4c6078; }
.voice-card { margin-top: 12rpx; border: 1px solid #cde2ff; border-radius: 12rpx; background: #f2f7ff; padding: 12rpx; }
.voice-title { font-size: 24rpx; font-weight: 700; color: #2f5ca1; }
.voice-text { margin-top: 6rpx; font-size: 20rpx; color: #3f5771; line-height: 1.6; }
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
  display: flex;
  flex-direction: column;
}
.token-grid {
  margin-top: 8rpx;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(156rpx, 1fr));
  grid-auto-rows: minmax(188rpx, auto);
  gap: 10rpx;
  align-content: start;
  flex: 1;
  min-height: 0;
}
.token {
  position: relative;
  width: 100%;
  min-height: 188rpx;
  height: auto;
  border: 1px solid #d7e2f2;
  background: #f8fbff;
  border-radius: 8rpx;
  padding: 6rpx 6rpx 8rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.token-image {
  width: 100%;
  height: 112rpx;
  flex-shrink: 0;
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
.view-btn {
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
.token-name {
  margin-top: 4rpx;
  font-size: 16rpx;
  color: #334a63;
  line-height: 1.3;
  white-space: normal;
  word-break: break-all;
  overflow: visible;
}
.workspace { position: relative; margin-top: 8rpx; height: 340rpx; border: 2rpx dashed #b6cbea; border-radius: 10rpx; background: #f7fbff; overflow: hidden; }
.workspace.hot { border-color: #5da2ff; }
.empty { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: #70839c; font-size: 19rpx; text-align: center; width: 75%; }
.part { position: absolute; width: 96px; height: 96px; border: 1px solid #d7e2f2; border-radius: 8rpx; background: #fff; }
.part.near { border-color: #4f9dff; box-shadow: 0 0 0 2rpx rgba(79, 157, 255, 0.2); }
.part-image { width: 100%; height: 68px; border-radius: 8rpx 8rpx 0 0; background: #eef5ff; }
.part-name { font-size: 12px; text-align: center; padding: 2px 4px; line-height: 1.2; }
.part-view { position: absolute; left: 6px; top: 6px; border-radius: 999rpx; background: rgba(47, 98, 166, 0.92); color: #fff; font-size: 11px; padding: 2px 6px; }
.part-del { position: absolute; right: -8px; top: -8px; width: 20px; height: 20px; border-radius: 50%; background: #f35a5a; color: #fff; text-align: center; line-height: 20px; font-size: 14px; }
.results-zone {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.result-list {
  margin-top: 8rpx;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220rpx, 1fr));
  grid-auto-rows: minmax(214rpx, auto);
  gap: 10rpx;
  align-content: start;
  max-height: 236rpx;
  overflow: auto;
}
.result-item {
  position: relative;
  width: 100%;
  min-height: 214rpx;
  height: auto;
  border: 1px solid #d7e2f2;
  background: #f8fbff;
  border-radius: 8rpx;
  padding: 6rpx 6rpx 10rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.result-item.locked { opacity: 0.6; }
.result-item.done { border-color: #8dcd9f; background: #f4fff7; }
.result-image {
  width: 100%;
  height: 112rpx;
  flex-shrink: 0;
  border-radius: 6rpx;
  background: #eef5ff;
}
.result-meta {
  margin-top: 4rpx;
  min-height: 46rpx;
  display: grid;
  grid-template-rows: auto auto;
  row-gap: 2rpx;
}
.result-name {
  font-size: 16rpx;
  color: #334a63;
  line-height: 1.3;
  min-width: 0;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  display: block;
}
.result-state {
  justify-self: end;
  align-self: end;
  font-size: 14rpx;
  line-height: 1.2;
  color: #6f839c;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}
.result-view-btn {
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
.restart-btn {
  margin-top: 22rpx;
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
.restart-icon { width: 64rpx; height: 64rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #5d9eff 0%, #76b7ff 100%); box-shadow: 0 8rpx 18rpx rgba(93, 158, 255, 0.28); color: #fff; font-size: 34rpx; font-weight: 700; }
.restart-title { font-size: 28rpx; color: #224d8b; font-weight: 700; line-height: 1.2; }
.restart-desc { margin-top: 6rpx; font-size: 20rpx; line-height: 1.55; color: #577498; }
.actions { margin-top: 8rpx; display: flex; gap: 8rpx; }
.card { margin-top: 10rpx; background: #fff; border: 1px solid #d7e2f2; border-radius: 10rpx; padding: 10rpx; }
.card-title { font-size: 21rpx; font-weight: 700; color: #2d517d; }
.tip-lite { margin-top: 6rpx; font-size: 16rpx; color: #6a7e98; line-height: 1.4; }
.video-grid {
  margin-top: 8rpx;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10rpx;
  justify-items: center;
}
.video-card {
  width: 100%;
  max-width: 860rpx;
  border: 1px solid #d7e2f2;
  border-radius: 10rpx;
  padding: 8rpx;
  background: #f8fbff;
}
.video-title { font-size: 20rpx; font-weight: 700; color: #2d517d; }
.video-frame {
  margin: 8rpx auto 0;
  width: 100%;
  max-width: 820rpx;
  aspect-ratio: 16 / 9;
  border-radius: 10rpx;
  overflow: hidden;
  background: #000;
}
.video-player { width: 100%; height: 100%; }
.video-empty { margin-top: 8rpx; min-height: 120rpx; display: flex; align-items: center; justify-content: center; border: 1px dashed #c8d8ee; border-radius: 8rpx; color: #6b84a4; font-size: 18rpx; }
.btn { flex: 1; text-align: center; border-radius: 999rpx; font-size: 19rpx; padding: 10rpx 0; color: #fff; background: linear-gradient(135deg, #4f9dff, #56d0ff); }
.btn.green { background: linear-gradient(135deg, #5bb36f, #99d48e); }
.btn.orange { background: linear-gradient(135deg, #ff9f58, #ffc15a); }
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
.file-row { margin-top: 8rpx; padding: 8rpx; border: 1px solid #d7e2f2; border-radius: 8rpx; background: #f9fcff; display: flex; justify-content: space-between; align-items: center; font-size: 18rpx; color: #364f69; }
.remove { color: #c65555; }
.note-input { margin-top: 8rpx; width: 100%; min-height: 100rpx; border: 1px solid #d7e2f2; border-radius: 8rpx; background: #f9fcff; padding: 8rpx; font-size: 19rpx; color: #3d556d; box-sizing: border-box; }
.finish-tip { font-size: 19rpx; color: #7b5f20; background: #fff8e8; border: 1px solid #e6d39b; border-radius: 8rpx; padding: 8rpx; line-height: 1.4; }
.drag-mask { position: fixed; inset: 0; z-index: 9998; }
.preview-mask { position: fixed; inset: 0; z-index: 10010; background: rgba(11, 18, 32, 0.62); display: flex; align-items: center; justify-content: center; padding: 24rpx; }
.preview-card { width: 92vw; max-width: 980rpx; max-height: 88vh; border-radius: 16rpx; background: #fff; overflow: hidden; display: flex; flex-direction: column; }
.preview-head { display: flex; align-items: center; justify-content: space-between; padding: 12rpx 14rpx; border-bottom: 1px solid #e1ebf9; }
.preview-title { font-size: 22rpx; font-weight: 700; color: #274d7c; }
.preview-close { width: 42rpx; height: 42rpx; border-radius: 999rpx; background: #f0f5ff; color: #2d517d; display: flex; align-items: center; justify-content: center; font-size: 30rpx; }
.preview-image { width: 100%; height: 68vh; max-height: 980rpx; background: #f4f8ff; }
@media (max-width: 960px) {
  .lab-grid { grid-template-columns: 1fr; }
  .right-column { grid-template-rows: auto auto; height: auto; }
  .pool-zone { height: auto; display: block; }
  .token-grid,
  .result-list { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 188rpx; max-height: none; }
  .token,
  .result-item { width: 100%; height: 188rpx; }
  .token-image,
  .result-image { height: 120rpx; }
  .workspace { height: 440rpx; }
  .video-grid { grid-template-columns: 1fr; }
}
</style>
