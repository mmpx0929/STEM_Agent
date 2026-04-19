<template>
  <view class="step-card">
    <view class="step-header">
      <text class="step-icon">🛠️</text>
      <view class="step-title">④ 工程模型方案设计</view>
    </view>
    <view class="step-desc">完成模型目标选择、系统构思、图纸上传和材料清单，形成可执行的工程搭建方案。</view>

    <view class="block">
      <view class="block-title">步骤1：模型目标设计</view>
      <view class="target-grid">
        <view class="target-item" v-for="target in targetDefs" :key="target.key">
          <view class="target-name">{{ target.label }}</view>
          <view class="target-options">
            <view
              class="target-option"
              :class="{ active: selectedTargets[target.key] === item.key }"
              v-for="item in target.options"
              :key="item.key"
              @click="selectTarget(target.key, item)"
            >
              {{ item.key }}. {{ item.text }}
            </view>
          </view>
        </view>
      </view>
      <view class="action-row">
        <view class="mini-btn" @click="runTargetAI">🤖	AI 小助手</view>
      </view>
      <view class="analysis-card" v-if="value.aiAnalysis">
        <view class="analysis-title" :class="{ pass: value.aiChecked, fail: !value.aiChecked }">
          {{ value.aiChecked ? '分析通过：目标设置合理' : '分析建议：请调整目标选项' }}
        </view>
        <view class="analysis-text">{{ value.aiAnalysis }}</view>
      </view>
    </view>

    <view class="block">
      <view class="block-title">步骤2：模型系统构思</view>
      <view class="system-list">
        <view class="system-card" v-for="item in systems" :key="item.key">
          <view class="system-title">{{ item.title }}</view>
          <view class="system-line">作用：{{ item.role }}</view>
          <view class="system-line">结构：{{ item.structure }}</view>
        </view>
      </view>
    </view>

    <view class="block">
      <view class="block-title">模型图纸设计</view>
      <view class="blueprint-tip">
        下面给出了手绘的模型参考图纸，试一试使用 AI 一键生成图纸吧，你也可以上传自己的设计图纸哦。
      </view>

      <view class="blueprint-layout-row">
        <view class="blueprint-section">
          <view class="blueprint-section-head">
            <view class="blueprint-section-title">1. 模型参考图纸</view>
          </view>
          <view class="blueprint-card blueprint-single">
            <image
              v-if="referenceBlueprint && referenceBlueprint.path"
              class="blueprint-image"
              :src="referenceBlueprint.path"
              mode="aspectFit"
            />
            <view class="blueprint-empty" v-else>图纸未配置</view>
            <view class="blueprint-name">
              {{ (referenceBlueprint && referenceBlueprint.name) || '模型图纸设计 1' }}
            </view>
          </view>
        </view>

        <view class="blueprint-section">
          <view class="blueprint-section-head">
            <view class="blueprint-section-title">2. AI 一键美化图纸</view>
            <view class="mini-btn" @click="generateAIBlueprint">🤖 AI 一键生成</view>
          </view>
          <view class="blueprint-card blueprint-single" v-if="aiBlueprint">
            <image
              v-if="aiBlueprint.path"
              class="blueprint-image"
              :src="aiBlueprint.path"
              mode="aspectFit"
            />
            <view class="blueprint-empty" v-else>图纸未配置</view>
            <view class="blueprint-name">{{ aiBlueprint.name || 'AI 生成图纸' }}</view>
          </view>
          <view class="blueprint-empty blueprint-empty-inline" v-else>点击“🤖 AI 一键生成”后显示图纸</view>
        </view>

        <view class="blueprint-section">
          <view class="blueprint-section-head">
            <view class="blueprint-section-title">3. 上传我的设计图纸（可选）</view>
            <view class="mini-btn light" @click="chooseBlueprint">上传我的设计图纸</view>
          </view>
          <view class="blueprint-card blueprint-single">
            <image
              v-if="uploadedBlueprint && uploadedBlueprint.path"
              class="blueprint-image"
              :src="uploadedBlueprint.path"
              mode="aspectFit"
            />
            <view class="blueprint-empty" v-else>暂未上传设计图纸</view>
            <view class="blueprint-name">{{ (uploadedBlueprint && uploadedBlueprint.name) || '上传后会覆盖之前图纸' }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="block">
      <view class="block-title">步骤3：模型材料清单</view>
      <view class="material-table">
        <view class="m-row head">
          <text class="m-col name">材料名称</text>
          <text class="m-col spec">规格</text>
          <text class="m-col qty">数量</text>
          <text class="m-col usage">场景应用</text>
          <text class="m-col action">操作</text>
        </view>
        <view class="m-row" v-for="(item, idx) in baseMaterials" :key="`base-mat-${idx}`">
          <text class="m-col name">{{ item.name }}</text>
          <text class="m-col spec">{{ item.spec }}</text>
          <text class="m-col qty">{{ item.qty }}</text>
          <text class="m-col usage">{{ item.usage }}</text>
          <text class="m-col action muted">固定</text>
        </view>
        <view class="m-row" v-for="(item, idx) in customMaterials" :key="`custom-mat-${idx}`">
          <text class="m-col name">{{ item.name }}</text>
          <text class="m-col spec">{{ item.spec }}</text>
          <text class="m-col qty">{{ item.qty }}</text>
          <text class="m-col usage">{{ item.usage }}</text>
          <text class="m-col action delete-material" @click="removeCustomMaterial(idx)">删除</text>
        </view>
      </view>

      <view class="custom-form">
        <input class="custom-input" v-model="draft.name" placeholder="补充材料名称" />
        <input class="custom-input" v-model="draft.spec" placeholder="规格" />
        <input class="custom-input" v-model="draft.qty" placeholder="数量" />
        <input class="custom-input" v-model="draft.usage" placeholder="场景应用" />
        <view class="mini-btn" @click="addCustomMaterial">+ 添加补充材料</view>
      </view>
    </view>

    <view class="block">
      <view class="block-title">步骤4：工程搭建步骤</view>
      <view class="build-step-desc">
        请按顺序完成 4 个搭建步骤。每点击一步会自动标记序号；点击已选步骤可回退修改。
      </view>

      <view class="build-progress-card">
        <view class="build-progress-head">
          <text class="build-progress-title">闯关进度</text>
          <text class="build-progress-text">{{ buildStepProgressPercent }}%</text>
        </view>
        <view class="build-progress-track">
          <view class="build-progress-fill" :style="{ width: buildStepProgressPercent + '%' }"></view>
        </view>
        <view class="build-progress-tip">{{ buildStepProgressTip }}</view>
      </view>

      <view class="build-choice-list">
        <view
          class="build-choice-item"
          :class="buildChoiceClass(item)"
          v-for="item in buildStepOptionsShuffled"
          :key="item.key"
          @click="selectBuildStep(item)"
        >
          <view class="build-choice-order" :class="{ empty: !selectedBuildOrder(item.key) }">
            {{ selectedBuildOrder(item.key) || '' }}
          </view>
          <view class="build-choice-content">
            <view class="build-choice-title">{{ item.title }}</view>
            <view class="build-choice-sub">{{ item.summary }}</view>
          </view>
          <view class="build-choice-badge" v-if="selectedBuildOrder(item.key)">序号 {{ selectedBuildOrder(item.key) }}</view>
        </view>
      </view>

      <view class="build-detail-list" v-if="selectedBuildSections.length > 0">
        <view class="build-detail-card" v-for="section in selectedBuildSections" :key="section.key">
          <view class="build-detail-head">
            <text class="build-detail-index">{{ section.order }}.</text>
            <text class="build-detail-title">{{ section.title }}</text>
          </view>
          <view class="build-detail-line" v-for="(line, lineIndex) in section.lines" :key="`${section.key}-${lineIndex}`">
            {{ line }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';

const EMPTY_DRAFT = () => ({ name: '', spec: '', qty: '', usage: '' });
const BUILD_STEP_ORDER = ['step1', 'step2', 'step3', 'step4'];

const DEFAULT_BUILD_STEP_OPTIONS = [
  {
    key: 'step1',
    title: '制作脱水桶系统',
    summary: '先完成脱水桶打孔和转轴装置安装。',
    lines: [
      '① 脱水桶打孔：使用工具：酒精灯、螺丝刀、手套、酒精（自备）；使用材料：小塑料罐。',
      '安全提示：酒精灯和螺丝刀的使用要在大人的陪伴下，一定戴手套。',
      '② 安装脱水桶转轴装置：使用材料：小塑料罐、短木棒、长木棒、大孔泡棉胶、T型塑料垫片、圆形塑料垫片、双面胶。'
    ]
  },
  {
    key: 'step2',
    title: '制作拉线动力系统',
    summary: '安装拉线动力装置。',
    lines: ['使用材料：拉线、橡胶圈。']
  },
  {
    key: 'step3',
    title: '制作外壳系统',
    summary: '完成外壳系统安装。',
    lines: ['使用材料：大塑料罐、泡棉胶、木轮。']
  },
  {
    key: 'step4',
    title: '组装手动甩干机',
    summary: '整合三大系统，完成整机组装。',
    lines: ['使用系统：脱水桶系统、拉线系统、外壳系统；使用材料：拉环。']
  }
];

const shuffleBuildStepOptions = (source = []) => {
  const list = [...source];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
};

const normalizeBuildStepKey = (value) => {
  if (typeof value !== 'string') return '';
  if (BUILD_STEP_ORDER.includes(value)) return value;
  if (value.includes('脱水桶')) return 'step1';
  if (value.includes('拉线动力')) return 'step2';
  if (value.includes('外壳系统')) return 'step3';
  if (value.includes('组装手动甩干机')) return 'step4';
  return '';
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
  data() {
    return {
      draft: EMPTY_DRAFT(),
      buildStepOptionsShuffled: shuffleBuildStepOptions(DEFAULT_BUILD_STEP_OPTIONS)
    };
  },
  computed: {
    template() {
      return getEngineeringFlowTemplate(this.experiment && this.experiment.id);
    },
    targetDefs() {
      const options = (this.template.step4 && this.template.step4.targetOptions) || {};
      return [
        { key: 'function', label: '功能目标', options: options.function || [] },
        { key: 'performance', label: '性能目标', options: options.performance || [] },
        { key: 'cost', label: '成本目标', options: options.cost || [] },
        { key: 'safety', label: '安全目标', options: options.safety || [] }
      ];
    },
    selectedTargets() {
      return this.value.targetChoice || {};
    },
    systems() {
      const templateSystems = (this.template.step4 && this.template.step4.systems) || [];
      return templateSystems.length > 0
        ? templateSystems
        : ((this.value.systemDesign && this.value.systemDesign.length > 0) ? this.value.systemDesign : []);
    },
    blueprints() {
      return Array.isArray(this.value.blueprintUploads) ? this.value.blueprintUploads : [];
    },
    uploadedBlueprint() {
      if (!Array.isArray(this.blueprints) || this.blueprints.length === 0) return null;
      for (let i = this.blueprints.length - 1; i >= 0; i -= 1) {
        const item = this.blueprints[i];
        if (item && item.path) return item;
      }
      return null;
    },
    providedBlueprints() {
      return (this.template.step4 && Array.isArray(this.template.step4.blueprints))
        ? this.template.step4.blueprints
        : [];
    },
    referenceBlueprint() {
      if (this.providedBlueprints.length > 0) return this.providedBlueprints[0];
      return null;
    },
    aiSourceBlueprint() {
      if (this.providedBlueprints.length > 1) return this.providedBlueprints[1];
      if (this.providedBlueprints.length > 0) return this.providedBlueprints[0];
      return null;
    },
    aiBlueprint() {
      const value = this.value.blueprintAIResult;
      if (!value || typeof value !== 'object') return null;
      return value;
    },
    templateBuildStepOptions() {
      const list = this.template && this.template.step4 && Array.isArray(this.template.step4.buildStepOptions)
        ? this.template.step4.buildStepOptions
        : [];
      if (list.length === 4) return list;
      return DEFAULT_BUILD_STEP_OPTIONS;
    },
    selectedBuildSteps() {
      const raw = Array.isArray(this.value.buildStepOrder) ? this.value.buildStepOrder : [];
      const normalized = [];
      raw.forEach((item) => {
        const key = normalizeBuildStepKey(item);
        if (!key || normalized.includes(key)) return;
        normalized.push(key);
      });
      return normalized.slice(0, 4);
    },
    nextExpectedBuildKey() {
      return BUILD_STEP_ORDER[this.selectedBuildSteps.length] || '';
    },
    buildStepProgressPercent() {
      const done = Math.min(this.selectedBuildSteps.length, 4);
      return done * 25;
    },
    buildStepProgressTip() {
      const done = Math.min(this.selectedBuildSteps.length, 4);
      if (done === 0) return '开始选择吧，先完成第 1 步。';
      if (done === 4) return '4 个步骤已按顺序完成，可进入下一步。';
      return `已完成 ${done}/4 步，继续完成第 ${done + 1} 步。`;
    },
    selectedBuildSections() {
      return this.selectedBuildSteps
        .map((key, index) => {
          const def = this.templateBuildStepOptions.find((item) => item.key === key);
          if (!def) return null;
          return {
            ...def,
            order: index + 1
          };
        })
        .filter(Boolean);
    },
    baseMaterials() {
      return (this.value.materials && this.value.materials.length > 0)
        ? this.value.materials
        : ((this.template.step4 && this.template.step4.materials) || []);
    },
    customMaterials() {
      return Array.isArray(this.value.customMaterials) ? this.value.customMaterials : [];
    }
  },
  watch: {
    templateBuildStepOptions: {
      immediate: true,
      handler(nextValue) {
        this.buildStepOptionsShuffled = shuffleBuildStepOptions(nextValue);
      }
    }
  },
  mounted() {
    const patch = {};
    if (!this.value.targetChoice) patch.targetChoice = {};
    const templateSystems = (this.template.step4 && this.template.step4.systems) || [];
    if (templateSystems.length > 0) {
      const currentSystems = Array.isArray(this.value.systemDesign) ? this.value.systemDesign : [];
      if (JSON.stringify(currentSystems) !== JSON.stringify(templateSystems)) {
        patch.systemDesign = templateSystems;
      }
    } else if (!Array.isArray(this.value.systemDesign) || this.value.systemDesign.length === 0) {
      patch.systemDesign = [];
    }
    if (!Array.isArray(this.value.materials) || this.value.materials.length === 0) {
      patch.materials = (this.template.step4 && this.template.step4.materials) || [];
    }
    if (!Array.isArray(this.value.buildSteps)) patch.buildSteps = [];
    if (!Array.isArray(this.value.buildStepOrder)) patch.buildStepOrder = [];
    if (this.value.buildStepCompleted !== true) patch.buildStepCompleted = false;
    if (!Array.isArray(this.value.customMaterials)) patch.customMaterials = [];
    if (!Array.isArray(this.value.blueprintUploads)) {
      patch.blueprintUploads = [];
    } else {
      const normalizedUploads = this.value.blueprintUploads.filter((item) => item && item.path);
      const latestUpload = normalizedUploads.length > 0 ? normalizedUploads[normalizedUploads.length - 1] : null;
      const nextUploads = latestUpload ? [latestUpload] : [];
      const currentUploads = this.value.blueprintUploads;
      const changed =
        currentUploads.length !== nextUploads.length
        || (currentUploads[0] && nextUploads[0] && currentUploads[0].path !== nextUploads[0].path)
        || (!currentUploads[0] && nextUploads[0])
        || (currentUploads[0] && !nextUploads[0]);
      if (changed) patch.blueprintUploads = nextUploads;
    }
    if (!this.value.blueprintAIResult) patch.blueprintAIResult = null;
    if (Object.keys(patch).length > 0) this.patch(patch);
    this.syncBuildStepOrderState();
  },
  methods: {
    patch(payload) {
      this.$emit('update', { ...this.value, ...payload });
    },
    buildStepLinesFromOrder(orderList = []) {
      return orderList
        .map((key, index) => {
          const def = this.templateBuildStepOptions.find((item) => item.key === key);
          if (!def) return '';
          return `步骤${index + 1}：${def.title}`;
        })
        .filter(Boolean);
    },
    syncBuildStepOrderState() {
      const normalized = this.selectedBuildSteps;
      const lines = this.buildStepLinesFromOrder(normalized);
      const completed = normalized.length === 4;
      const rawOrder = Array.isArray(this.value.buildStepOrder) ? this.value.buildStepOrder : [];
      const rawLines = Array.isArray(this.value.buildSteps) ? this.value.buildSteps : [];
      const orderChanged =
        rawOrder.length !== normalized.length || rawOrder.some((item, idx) => item !== normalized[idx]);
      const lineChanged =
        rawLines.length !== lines.length || rawLines.some((item, idx) => item !== lines[idx]);
      const completedChanged = this.value.buildStepCompleted !== completed;
      if (!orderChanged && !lineChanged && !completedChanged) return;
      this.patch({
        buildStepOrder: normalized,
        buildSteps: lines,
        buildStepCompleted: completed,
        planGenerated: completed ? !!this.value.planGenerated : false
      });
    },
    selectedBuildOrder(key) {
      const index = this.selectedBuildSteps.indexOf(key);
      return index >= 0 ? index + 1 : '';
    },
    buildChoiceClass(item) {
      const order = this.selectedBuildOrder(item.key);
      return {
        selected: !!order,
        next: !order && item.key === this.nextExpectedBuildKey
      };
    },
    selectBuildStep(item) {
      const current = [...this.selectedBuildSteps];
      const expectedKey = this.nextExpectedBuildKey;

      if (current.includes(item.key)) {
        const selectedIndex = current.indexOf(item.key);
        const rollback = current.slice(0, selectedIndex);
        const lines = this.buildStepLinesFromOrder(rollback);
        this.patch({
          buildStepOrder: rollback,
          buildSteps: lines,
          buildStepCompleted: rollback.length === 4,
          planGenerated: false
        });
        uni.showToast({
          title: selectedIndex === 0 ? '已清空已选步骤，请重新选择' : `已回退到第 ${selectedIndex} 步`,
          icon: 'none'
        });
        return;
      }

      if (item.key !== expectedKey) {
        const expectedStep = this.templateBuildStepOptions.find((step) => step.key === expectedKey);
        uni.showToast({
          title: `请先选择：${expectedStep ? expectedStep.title : '下一步'}`,
          icon: 'none'
        });
        return;
      }

      current.push(item.key);
      const lines = this.buildStepLinesFromOrder(current);
      this.patch({
        buildStepOrder: current,
        buildSteps: lines,
        buildStepCompleted: current.length === 4,
        planGenerated: false
      });
    },
    selectTarget(typeKey, item) {
      const next = {
        ...(this.value.targetChoice || {}),
        [typeKey]: item.key
      };
      this.patch({
        targetChoice: next,
        aiChecked: false,
        aiAnalysis: ''
      });
    },
    runTargetAI() {
      const targetChoice = this.value.targetChoice || {};
      const allPicked = this.targetDefs.every((item) => targetChoice[item.key]);
      if (!allPicked) {
        uni.showToast({ title: '请先完成四类目标选择', icon: 'none' });
        return;
      }
      let pass = true;
      this.targetDefs.forEach((def) => {
        const pickKey = targetChoice[def.key];
        const hit = def.options.find((item) => item.key === pickKey);
        if (!hit || !hit.isCorrect) pass = false;
      });
      const aiAnalysis = pass
        ? '四类目标都围绕“手动离心脱水”主任务，工程目标设置清晰可执行。'
        : '目标里存在偏离核心任务的选项。建议优先保证“脱水功能、效率、低成本、安全”一致。';
      this.patch({ aiChecked: pass, aiAnalysis });
    },
    chooseBlueprint() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const tempPath = (res.tempFilePaths && res.tempFilePaths[0])
            || ((res.tempFiles && res.tempFiles[0] && res.tempFiles[0].path) || '');
          if (!tempPath) {
            uni.showToast({ title: '图片读取失败，请重试', icon: 'none' });
            return;
          }
          this.patch({
            // 单图上传：重复上传直接覆盖上一张
            blueprintUploads: [
              {
                name: `我的设计图纸-${Date.now()}`,
                path: tempPath
              }
            ]
          });
        }
      });
    },
    generateAIBlueprint() {
      if (!this.aiSourceBlueprint || !this.aiSourceBlueprint.path) {
        uni.showToast({ title: '当前实验未配置可生成图纸', icon: 'none' });
        return;
      }
      this.patch({
        blueprintAIResult: {
          name: this.aiSourceBlueprint.name || 'AI 生成图纸',
          path: this.aiSourceBlueprint.path
        }
      });
      uni.showToast({ title: 'AI 图纸已生成', icon: 'none' });
    },
    addCustomMaterial() {
      const draft = this.draft;
      if (!draft.name || !draft.spec || !draft.qty || !draft.usage) {
        uni.showToast({ title: '请填写完整补充材料信息', icon: 'none' });
        return;
      }
      this.patch({
        customMaterials: [...this.customMaterials, { ...draft }]
      });
      this.draft = EMPTY_DRAFT();
    },
    removeCustomMaterial(index) {
      const next = [...this.customMaterials];
      if (!next[index]) return;
      next.splice(index, 1);
      this.patch({ customMaterials: next });
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
.block {
  margin-top: 16rpx;
  background: #fff;
  border: 1rpx solid #d8e5f7;
  border-radius: 16rpx;
  padding: 12rpx;
}
.block-title {
  font-size: 24rpx;
  color: #355b8d;
  font-weight: 700;
}
.target-grid {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.target-item {
  border-top: 1rpx dashed #d9e2f1;
  padding-top: 8rpx;
}
.target-name {
  font-size: 23rpx;
  color: #3b5781;
  font-weight: 700;
}
.target-options {
  margin-top: 6rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.target-option {
  font-size: 22rpx;
  color: #425f89;
  line-height: 1.55;
  background: #f8fbff;
  border: 1rpx solid #d8e5f7;
  border-radius: 12rpx;
  padding: 8rpx 10rpx;
}
.target-option.active {
  border-color: #4b8ef2;
  background: #edf5ff;
}
.action-row {
  margin-top: 10rpx;
  display: flex;
  justify-content: flex-end;
}
.mini-btn {
  font-size: 21rpx;
  color: #fff;
  background: linear-gradient(135deg, #53a2ff, #5f89ff);
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
}
.mini-btn.light {
  background: linear-gradient(135deg, #65c8a0, #59b986);
}
.analysis-card {
  margin-top: 10rpx;
  background: #f8fbff;
  border: 1rpx solid #d2e2f6;
  border-radius: 12rpx;
  padding: 10rpx;
}
.analysis-title {
  font-size: 22rpx;
  font-weight: 700;
}
.analysis-title.pass {
  color: #2f8a4b;
}
.analysis-title.fail {
  color: #c25f3b;
}
.analysis-text {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #4a6f98;
  line-height: 1.6;
}
.system-list {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.system-card {
  border: 1rpx solid #d8e5f7;
  border-radius: 12rpx;
  padding: 10rpx;
  background: #f9fcff;
}
.system-title {
  font-size: 23rpx;
  color: #345b90;
  font-weight: 700;
}
.system-line {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #4d6f98;
  line-height: 1.5;
}
.blueprint-layout-row {
  margin-top: 10rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  overflow-x: auto;
  padding-bottom: 4rpx;
}
.blueprint-section {
  flex: 1 0 0;
  min-width: 31%;
  border: 1rpx solid #d5e4f6;
  border-radius: 12rpx;
  background: #f7fbff;
  padding: 10rpx;
  box-sizing: border-box;
}
.blueprint-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  flex-wrap: wrap;
}
.blueprint-section-title {
  font-size: 22rpx;
  color: #3f6391;
  font-weight: 700;
}
.blueprint-tip {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #53729a;
  line-height: 1.6;
  background: #f7fbff;
  border: 1rpx solid #d5e4f6;
  border-radius: 12rpx;
  padding: 10rpx 12rpx;
}
.blueprint-grid {
  margin-top: 10rpx;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12rpx;
}
.blueprint-card {
  border: 1rpx solid #d8e5f7;
  border-radius: 14rpx;
  padding: 10rpx;
  background: #f9fcff;
  overflow: hidden;
}
.blueprint-single {
  margin-top: 8rpx;
}
.blueprint-image {
  width: 100%;
  height: 360rpx;
  border-radius: 10rpx;
  background: #eef5ff;
  display: block;
}
.blueprint-empty {
  width: 100%;
  height: 360rpx;
  border-radius: 10rpx;
  background: #eef5ff;
  color: #6b84a4;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.blueprint-empty-inline {
  margin-top: 8rpx;
  height: 120rpx;
}
.blueprint-name {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #496c95;
  line-height: 1.5;
}
.upload-list {
  margin-top: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.upload-item {
  font-size: 22rpx;
  color: #496c95;
  background: #f7fbff;
  border: 1rpx solid #d5e4f6;
  border-radius: 10rpx;
  padding: 8rpx;
}
.material-table {
  margin-top: 10rpx;
  border: 1rpx solid #b7cdea;
  border-bottom: none;
}
.m-row {
  display: flex;
  border-bottom: 1rpx solid #b7cdea;
}
.m-row.head {
  background: #edf5ff;
}
.m-col {
  font-size: 20rpx;
  color: #355882;
  line-height: 1.5;
  padding: 8rpx 6rpx;
  border-right: 1rpx solid #b7cdea;
  box-sizing: border-box;
}
.m-col:last-child {
  border-right: none;
}
.m-col.name {
  width: 22%;
}
.m-col.spec {
  width: 20%;
}
.m-col.qty {
  width: 14%;
  text-align: center;
}
.m-col.usage {
  width: 32%;
}
.m-col.action {
  width: 12%;
  text-align: center;
}
.m-col.action.muted {
  color: #8aa0ba;
}
.delete-material {
  color: #e05a5a;
  font-weight: 700;
}
.custom-form {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.custom-input {
  width: 100%;
  height: 70rpx;
  background: #fff;
  border: 1rpx solid #d2e2f6;
  border-radius: 12rpx;
  padding: 0 12rpx;
  box-sizing: border-box;
  font-size: 22rpx;
}
.build-step-desc {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #4d6f98;
  line-height: 1.55;
}
.build-progress-card {
  margin-top: 10rpx;
  border-radius: 12rpx;
  background: #f7fbff;
  border: 1rpx solid #d5e4f6;
  padding: 10rpx;
}
.build-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.build-progress-title {
  font-size: 22rpx;
  color: #355b8d;
  font-weight: 700;
}
.build-progress-text {
  font-size: 22rpx;
  color: #2f8a4b;
  font-weight: 700;
}
.build-progress-track {
  margin-top: 8rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #eaf2fb;
  overflow: hidden;
}
.build-progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffb347, #ff8c42);
  transition: width 0.3s ease;
}
.build-progress-tip {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #56749b;
  line-height: 1.45;
}
.build-choice-list {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.build-choice-item {
  border-radius: 12rpx;
  background: #fff;
  border: 1rpx solid #d5e4f6;
  padding: 10rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.build-choice-item.next {
  border-color: rgba(255, 154, 86, 0.6);
}
.build-choice-item.selected {
  border-color: rgba(46, 139, 87, 0.55);
  background: linear-gradient(135deg, #f7fff8, #fffef8);
}
.build-choice-order {
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #fff4df;
  color: #b76a1f;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.build-choice-order.empty {
  color: transparent;
  background: #fff;
  border: 2rpx dashed rgba(183, 106, 31, 0.3);
}
.build-choice-content {
  flex: 1;
  min-width: 0;
}
.build-choice-title {
  font-size: 23rpx;
  color: #3c608e;
  line-height: 1.45;
  font-weight: 700;
}
.build-choice-sub {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #5a7aa2;
  line-height: 1.45;
}
.build-choice-badge {
  font-size: 20rpx;
  color: #fff;
  border-radius: 999rpx;
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, #2e8b57, #4fbf73);
  flex-shrink: 0;
}
.build-detail-list {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.build-detail-card {
  border-radius: 12rpx;
  background: #f9fcff;
  border: 1rpx solid #d5e4f6;
  padding: 10rpx;
}
.build-detail-head {
  display: flex;
  align-items: center;
  gap: 6rpx;
}
.build-detail-index {
  font-size: 22rpx;
  color: #2f8a4b;
  font-weight: 700;
}
.build-detail-title {
  font-size: 22rpx;
  color: #395d8b;
  font-weight: 700;
}
.build-detail-line {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #4d6f98;
  line-height: 1.55;
}
@media (max-width: 900px) {
  .blueprint-layout-row {
    gap: 10rpx;
  }
  .blueprint-section {
    min-width: 68%;
  }
  .blueprint-grid {
    grid-template-columns: 1fr;
  }
  .blueprint-image,
  .blueprint-empty {
    height: 320rpx;
  }
}
</style>
