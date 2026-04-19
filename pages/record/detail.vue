﻿﻿﻿<template>
  <view class="page">
    <view class="top-row">
      <view class="back-btn" @click="goBack">{{ i18n.backBtn }}</view>
      <view class="print-btn" @click="printCurrentRecord">{{ i18n.printBtn }}</view>
    </view>

    <view v-if="record" class="header-card">
      <view class="header-title">{{ record.experimentName }}</view>
      <view class="meta-row">
        <view class="meta-item">{{ i18n.typeLabel }}{{ typeLabel }}</view>
        <view class="meta-item">{{ i18n.dateLabel }}{{ formatDate(record.date) }}</view>
        <view class="meta-item">{{ i18n.statusLabel }}{{ record.status || i18n.savedStatus }}</view>
      </view>
      <view class="summary-box">{{ record.summary || i18n.noSummary }}</view>
    </view>

    <view v-if="record" class="section-list">
      <view class="section-card" v-for="(section, index) in detailSections" :key="section.key || index">
        <view class="section-head" @click="toggleSection(index)">
          <view class="section-title">{{ section.title }}</view>
          <view class="section-toggle">{{ isExpanded(index) ? i18n.collapseText : i18n.expandText }}</view>
        </view>
        <view v-if="isExpanded(index)">
          <view v-if="section.kind === 'plan-form'">
            <view class="plan-print-wrap">
              <view class="print-block">
                <view class="print-block-title">1 基础信息</view>
                <view class="print-mini-table">
                  <view class="print-mini-row" v-for="(row, idx) in section.model.basicRows" :key="`print-basic-${idx}`">
                    <view class="print-mini-label">{{ row.label }}</view>
                    <view class="print-mini-value">{{ row.value }}</view>
                  </view>
                </view>
              </view>

              <view class="print-block">
                <view class="print-block-title">2 问题与假设</view>
                <view class="print-mini-table">
                  <view class="print-mini-row" v-for="(row, idx) in section.model.questionRows" :key="`print-question-${idx}`">
                    <view class="print-mini-label">{{ row.label }}</view>
                    <view class="print-mini-value">{{ row.value }}</view>
                  </view>
                </view>
              </view>

              <view class="print-block">
                <view class="print-block-title">3 实验目标</view>
                <view class="print-text-value">{{ section.model.goalText }}</view>
              </view>

              <view class="print-block">
                <view class="print-block-title">4 实验材料设计</view>
                <view class="print-sub-title">实验场景的构思</view>
                <view class="print-text-value">{{ section.model.sceneIdea }}</view>
                <view class="print-sub-title">实验材料清单设计</view>
                <view class="print-grid-table print-material-table">
                  <view class="print-grid-row print-grid-head">
                    <text class="print-grid-col material-name">材料名称</text>
                    <text class="print-grid-col material-spec">规格</text>
                    <text class="print-grid-col material-qty">数量</text>
                    <text class="print-grid-col material-use">场景应用</text>
                  </view>
                  <view class="print-grid-row" v-for="(m, mIdx) in section.model.materials" :key="`print-mat-${mIdx}`">
                    <text class="print-grid-col material-name">{{ m.name }}</text>
                    <text class="print-grid-col material-spec">{{ m.spec }}</text>
                    <text class="print-grid-col material-qty">{{ m.qty }}</text>
                    <text class="print-grid-col material-use">{{ m.usage }}</text>
                  </view>
                </view>
              </view>

              <view class="print-block" v-if="Array.isArray(section.model.blueprints) && section.model.blueprints.length > 0">
                <view class="print-block-title">4.3 模型图纸设计</view>
                <view class="print-blueprint-grid">
                  <view class="print-blueprint-card" v-for="(bp, bpIdx) in section.model.blueprints" :key="`print-bp-${bpIdx}`">
                    <image
                      v-if="bp.path"
                      class="print-blueprint-image"
                      :src="bp.path"
                      mode="aspectFit"
                    />
                    <view class="print-blueprint-empty" v-else>未同步图纸</view>
                    <view class="print-blueprint-name">{{ bp.label }}：{{ bp.name }}</view>
                  </view>
                </view>
              </view>

              <view class="print-block">
                <view class="print-block-title">5 实验材料变量设置</view>
                <view class="print-grid-table print-variable-table">
                  <view class="print-grid-row print-grid-head">
                    <text class="print-grid-col variable-type">变量类型</text>
                    <text class="print-grid-col variable-def">定义</text>
                    <text class="print-grid-col variable-material">变量材料</text>
                    <text class="print-grid-col variable-content">变量内容</text>
                  </view>
                  <view class="print-grid-row" v-for="(v, vIdx) in section.model.variables" :key="`print-var-${vIdx}`">
                    <text class="print-grid-col variable-type">{{ v.type }}</text>
                    <text class="print-grid-col variable-def">{{ v.definition }}</text>
                    <text class="print-grid-col variable-material">{{ v.material }}</text>
                    <text class="print-grid-col variable-content">{{ v.content }}</text>
                  </view>
                </view>
              </view>

              <view class="print-block print-block-long">
                <view class="print-block-title">6 实验步骤设计</view>
                <view class="print-text-value">{{ section.model.stepDesign }}</view>
              </view>
            </view>

            <view class="plan-form-wrap">
              <view class="plan-table">
              <view class="plan-row plan-head">
                <view class="col-flow">区域与流程</view>
                <view class="col-type">类别</view>
                <view class="col-value">条件明细</view>
              </view>

              <view class="plan-row group-1">
                <view class="col-flow">1 基础信息</view>
                <view class="col-type">{{ section.model.basicRows[0].label }}</view>
                <view class="col-value">{{ section.model.basicRows[0].value }}</view>
              </view>
              <view class="plan-row sub" v-for="(row, idx) in section.model.basicRows.slice(1)" :key="`basic-${idx}`">
                <view class="col-flow area-ghost"></view>
                <view class="col-type">{{ row.label }}</view>
                <view class="col-value">{{ row.value }}</view>
              </view>

              <view class="plan-row group-2">
                <view class="col-flow">2 问题与假设</view>
                <view class="col-type">{{ section.model.questionRows[0].label }}</view>
                <view class="col-value">{{ section.model.questionRows[0].value }}</view>
              </view>
              <view class="plan-row sub" v-for="(row, idx) in section.model.questionRows.slice(1)" :key="`question-${idx}`">
                <view class="col-flow area-ghost"></view>
                <view class="col-type">{{ row.label }}</view>
                <view class="col-value">{{ row.value }}</view>
              </view>

              <view class="plan-row group-3">
                <view class="col-flow">3 实验目标</view>
                <view class="col-type">实验目标</view>
                <view class="col-value">{{ section.model.goalText }}</view>
              </view>

              <view class="plan-row group-4-a">
                <view class="col-flow">4 实验材料设计</view>
                <view class="col-type">实验场景的构思</view>
                <view class="col-value">{{ section.model.sceneIdea }}</view>
              </view>
              <view class="plan-row group-4-b">
                <view class="col-flow area-ghost"></view>
                <view class="col-type">实验材料清单设计</view>
                <view class="col-value no-padding">
                  <view class="inner-table">
                    <view class="inner-head">
                      <text class="inner-col name">材料名称</text>
                      <text class="inner-col spec">规格</text>
                      <text class="inner-col qty">数量</text>
                      <text class="inner-col use">场景应用</text>
                    </view>
                    <view class="inner-row" v-for="(m, mIdx) in section.model.materials" :key="`mat-${mIdx}`">
                      <text class="inner-col name">{{ m.name }}</text>
                      <text class="inner-col spec">{{ m.spec }}</text>
                      <text class="inner-col qty">{{ m.qty }}</text>
                      <text class="inner-col use">{{ m.usage }}</text>
                    </view>
                  </view>
                </view>
              </view>
              <view class="plan-row group-4-c" v-if="Array.isArray(section.model.blueprints) && section.model.blueprints.length > 0">
                <view class="col-flow area-ghost"></view>
                <view class="col-type">模型图纸设计</view>
                <view class="col-value no-padding">
                  <view class="plan-blueprint-grid">
                    <view class="plan-blueprint-card" v-for="(bp, bpIdx) in section.model.blueprints" :key="`bp-${bpIdx}`">
                      <image
                        v-if="bp.path"
                        class="plan-blueprint-image"
                        :src="bp.path"
                        mode="aspectFit"
                      />
                      <view class="plan-blueprint-empty" v-else>未同步图纸</view>
                      <view class="plan-blueprint-name">{{ bp.label }}：{{ bp.name }}</view>
                    </view>
                  </view>
                </view>
              </view>

              <view class="plan-row group-5">
                <view class="col-flow">5 实验材料变量设置</view>
                <view class="col-type">变量设置</view>
                <view class="col-value no-padding">
                  <view class="inner-table">
                    <view class="inner-title">变量控制设置表</view>
                    <view class="inner-head">
                      <text class="inner-col type">变量类型</text>
                      <text class="inner-col def">定义</text>
                      <text class="inner-col material">变量材料</text>
                      <text class="inner-col content">变量内容</text>
                    </view>
                    <view class="inner-row" v-for="(v, vIdx) in section.model.variables" :key="`var-${vIdx}`">
                      <text class="inner-col type">{{ v.type }}</text>
                      <text class="inner-col def">{{ v.definition }}</text>
                      <text class="inner-col material">{{ v.material }}</text>
                      <text class="inner-col content">{{ v.content }}</text>
                    </view>
                  </view>
                </view>
              </view>

              <view class="plan-row group-6">
                <view class="col-flow">6 实验步骤设计</view>
                <view class="col-type">实验步骤</view>
                <view class="col-value">{{ section.model.stepDesign }}</view>
              </view>
              </view>
            </view>
          </view>
          <view v-else-if="section.kind === 'data-form'" class="data-form-wrap">
            <view class="data-table">
              <view class="data-row data-head">
                <view class="data-col-area">区域</view>
                <view class="data-col-type">类别</view>
                <view class="data-col-condition">条件</view>
              </view>

              <view class="data-row base-group">
                <view class="data-col-area">基础信息</view>
                <view class="data-col-type">实验标题</view>
                <view class="data-col-condition">{{ section.model.experimentTitle }}</view>
              </view>
              <view class="data-row sub">
                <view class="data-col-area area-ghost"></view>
                <view class="data-col-type">记录人</view>
                <view class="data-col-condition">{{ section.model.recorder }}</view>
              </view>
              <view class="data-row sub">
                <view class="data-col-area area-ghost"></view>
                <view class="data-col-type">记录时间</view>
                <view class="data-col-condition">{{ section.model.recordTime }}</view>
              </view>

              <view class="data-row data-group">
                <view class="data-col-area">数据记录</view>
                <view class="data-col-type">变量控制数据记录</view>
                <view class="data-col-condition no-padding">
                  <view class="qualitative-wrap">
                    <view class="qualitative-title">1. 定性数据记录表</view>
                    <view class="qualitative-table">
                      <view class="qualitative-row head">
                        <text class="q-col model">实验模型</text>
                        <text class="q-col speed">{{ section.model.independentLabel || '旋转速度（自变量）' }}</text>
                        <text class="q-col status">{{ section.model.dependentLabel || '五角星运动状态（飞行高低和远近）（因变量）' }}</text>
                      </view>
                      <template v-if="Array.isArray(section.model.qualitativeRows) && section.model.qualitativeRows.length > 0">
                        <view
                          class="qualitative-row"
                          v-for="(row, rowIdx) in section.model.qualitativeRows"
                          :key="`qualitative-row-${rowIdx}`"
                        >
                          <text class="q-col model">{{ row.model }}</text>
                          <text class="q-col speed">{{ row.independent }}</text>
                          <text class="q-col status">{{ row.dependent }}</text>
                        </view>
                      </template>
                      <template v-else>
                        <view class="qualitative-row">
                          <text class="q-col model">{{ section.model.modelSlow }}</text>
                          <text class="q-col speed">旋转速度慢</text>
                          <text class="q-col status">{{ section.model.slowObservation }}</text>
                        </view>
                        <view class="qualitative-row">
                          <text class="q-col model">{{ section.model.modelFast }}</text>
                          <text class="q-col speed">旋转速度快</text>
                          <text class="q-col status">{{ section.model.fastObservation }}</text>
                        </view>
                      </template>
                    </view>
                  </view>
                </view>
              </view>

              <view class="data-row sub">
                <view class="data-col-area area-ghost"></view>
                <view class="data-col-type">关键发现</view>
                <view class="data-col-condition">{{ section.model.findings }}</view>
              </view>
              <view class="data-row sub">
                <view class="data-col-area area-ghost"></view>
                <view class="data-col-type">上传成果图片</view>
                <view class="data-col-condition no-padding">
                  <view
                    v-if="Array.isArray(section.model.evidenceImages) && section.model.evidenceImages.length > 0"
                    class="data-evidence-grid"
                  >
                    <view
                      class="data-evidence-card"
                      v-for="(img, imgIdx) in section.model.evidenceImages"
                      :key="`data-evidence-${img.id || imgIdx}`"
                    >
                      <image class="data-evidence-image" :src="img.path" mode="aspectFill" />
                      <view class="data-evidence-name">{{ img.name }}</view>
                    </view>
                  </view>
                  <view v-else class="data-evidence-empty">{{ i18n.evidenceEmpty }}</view>
                </view>
              </view>
            </view>
          </view>
          <view v-else-if="section.kind === 'report-form'" class="report-form-wrap">
            <view class="report-table">
              <view class="report-row report-head">
                <view class="report-col-area">区域</view>
                <view class="report-col-type">类别</view>
                <view class="report-col-condition">条件明细</view>
              </view>

              <view class="report-row">
                <view class="report-col-area">基础信息实验</view>
                <view class="report-col-type">实验标题</view>
                <view class="report-col-condition">{{ section.model.experimentTitle }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">实验参与人</view>
                <view class="report-col-condition">{{ section.model.participants }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">实验环境</view>
                <view class="report-col-condition">{{ section.model.environment }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">实验日期</view>
                <view class="report-col-condition">{{ section.model.experimentDate }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">数据记录人</view>
                <view class="report-col-condition">{{ section.model.dataRecorder }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">记录时间</view>
                <view class="report-col-condition">{{ section.model.recordTime }}</view>
              </view>

              <view class="report-row">
                <view class="report-col-area">问题与假设</view>
                <view class="report-col-type">问题重塑</view>
                <view class="report-col-condition">{{ section.model.questionReshape }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">假设验证支持与证伪</view>
                <view class="report-col-condition">{{ section.model.hypothesisSupport }}</view>
              </view>

              <view class="report-row">
                <view class="report-col-area">数据记录与分析</view>
                <view class="report-col-type">数据记录表</view>
                <view class="report-col-condition no-padding">
                  <view class="report-inner-wrap">
                    <view class="report-inner-title">定性数据记录表</view>
                    <view class="report-inner-table">
                      <view class="report-inner-row head">
                        <text class="ri-col model">实验模型</text>
                        <text class="ri-col speed">{{ section.model.independentLabel || '旋转速度（自变量）' }}</text>
                        <text class="ri-col status">{{ section.model.dependentLabel || '五角星运动状态（飞行高低和远近）（因变量）' }}</text>
                      </view>
                      <template v-if="Array.isArray(section.model.qualitativeRows) && section.model.qualitativeRows.length > 0">
                        <view
                          class="report-inner-row"
                          v-for="(row, rowIdx) in section.model.qualitativeRows"
                          :key="`report-qualitative-row-${rowIdx}`"
                        >
                          <text class="ri-col model">{{ row.model }}</text>
                          <text class="ri-col speed">{{ row.independent }}</text>
                          <text class="ri-col status">{{ row.dependent }}</text>
                        </view>
                      </template>
                      <template v-else>
                        <view class="report-inner-row">
                          <text class="ri-col model">{{ section.model.modelSlow }}</text>
                          <text class="ri-col speed">旋转速度慢</text>
                          <text class="ri-col status">{{ section.model.slowObservation }}</text>
                        </view>
                        <view class="report-inner-row">
                          <text class="ri-col model">{{ section.model.modelFast }}</text>
                          <text class="ri-col speed">旋转速度快</text>
                          <text class="ri-col status">{{ section.model.fastObservation }}</text>
                        </view>
                      </template>
                    </view>
                  </view>
                </view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">关键发现</view>
                <view class="report-col-condition">{{ section.model.keyFinding }}</view>
              </view>

              <view class="report-row">
                <view class="report-col-area">结论表达</view>
                <view class="report-col-type">现象描述</view>
                <view class="report-col-condition">{{ section.model.phenomenon }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">规律总结</view>
                <view class="report-col-condition">{{ section.model.ruleSummary }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">原理数据化阐述</view>
                <view class="report-col-condition">{{ section.model.principle }}</view>
              </view>

              <view class="report-row">
                <view class="report-col-area">实验方案改进与拓张</view>
                <view class="report-col-type">效果达成</view>
                <view class="report-col-condition">{{ section.model.effectResult }}</view>
              </view>
              <view class="report-row sub">
                <view class="report-col-area area-ghost"></view>
                <view class="report-col-type">改进与拓展</view>
                <view class="report-col-condition">{{ section.model.improvement }}</view>
              </view>

              <view class="report-row">
                <view class="report-col-area">备注</view>
                <view class="report-col-type">备注</view>
                <view class="report-col-condition">{{ section.model.remark }}</view>
              </view>
            </view>
          </view>
          <view v-else class="section-content">{{ section.content }}</view>
        </view>
      </view>
    </view>

    <view v-else class="empty-card">
      <view class="empty-title">{{ i18n.notFoundTitle }}</view>
      <view class="empty-desc">{{ i18n.notFoundDesc }}</view>
    </view>

    <view class="ai-chat-print-hidden">
      <AIChat
        :scene="aiGuideScene"
        :defaultOpen="false"
        pageContext="record-detail"
        :guide-key="aiGuideKey"
        :guide-text="aiGuideText"
        :auto-play="true"
      />
    </view>
  </view>
</template>

<script>
import { getRecordByTypeAndId, getRecordCenterData } from '@/utils/recordCenter.js';
import catalog from '@/config/experiment-catalog.js';
import { getScienceFlowTemplate } from '@/config/science-flow-templates.js';
import { getEngineeringFlowTemplate } from '@/config/engineering-flow-templates.js';
import AIChat from '@/pages/plan/components/AIChat.vue';

const I18N = {
  backBtn: '\u8fd4\u56de', // 返回按钮
  printBtn: '\u6253\u5370 / \u5bfc\u51faPDF', // 打印/导出PDF按钮
  typeLabel: '\u7c7b\u578b\uff1a', // 类型标签
  dateLabel: '\u65f6\u95f4\uff1a', // 时间标签
  statusLabel: '\u72b6\u6001\uff1a', // 状态标签
  savedStatus: '\u5df2\u4fdd\u5b58', // 已保存状态
  noSummary: '\u6682\u65e0\u6458\u8981', // 无摘要提示
  notFoundTitle: '\u8bb0\u5f55\u4e0d\u5b58\u5728', // 记录不存在标题
  notFoundDesc: '\u8be5\u8bb0\u5f55\u53ef\u80fd\u5df2\u88ab\u5220\u9664\uff0c\u8bf7\u8fd4\u56de\u8bb0\u5f55\u4e2d\u5fc3\u5237\u65b0\u540e\u91cd\u8bd5\u3002', // 记录不存在描述
  noDate: '\u672a\u8bb0\u5f55\u65f6\u95f4', // 无日期提示
  collapseText: '\u6536\u8d77', // 收起按钮
  expandText: '\u5c55\u5f00', // 展开按钮
  typePlan: '\u5b9e\u9a8c\u65b9\u6848\u8bbe\u8ba1', // 类型：实验方案设计
  typeData: '\u6570\u636e\u8bb0\u5f55', // 类型：数据记录
  typeReport: '\u7ed3\u8bba\u62a5\u544a', // 类型：结论报告
  notFilled: '\u672a\u586b\u5199', // 未填写提示
  planBasicTitle: '\u57fa\u7840\u4fe1\u606f', // 方案章节：基础信息
  planFlowTitle: '\u6d41\u7a0b\u6458\u8981', // 方案章节：流程摘要
  planVirtualTitle: '\u865a\u62df\u5b9e\u9a8c\u6267\u884c', // 方案章节：虚拟实验执行
  dataObservationTitle: '\u89c2\u5bdf\u8bb0\u5f55', // 数据章节：观察记录
  dataFindingTitle: '\u5173\u952e\u53d1\u73b0', // 数据章节：关键发现
  dataConclusionTitle: '\u6570\u636e\u7ed3\u8bba', // 数据章节：数据结论
  dataVariableTitle: '\u53d8\u91cf\u8bb0\u5f55', // 数据章节：变量记录
  evidenceTitle: '\u5b8c\u6210\u8bc1\u636e', // 证据标题
  evidenceEmpty: '暂未上传', // 无证据提示
  templateTitle: '\u7edf\u4e00\u6a21\u677f\u62a5\u544a', // 统一模板报告标题
  fallbackSectionTitle: '\u62a5\u544a\u7ae0\u8282', // 报告章节回退文本
  fallbackPhenomenon: '\u5b9e\u9a8c\u73b0\u8c61', // 实验现象回退文本
  fallbackPrinciple: '\u539f\u7406\u89e3\u91ca', // 原理解释回退文本
  fallbackResult: '\u5b9e\u9a8c\u7ed3\u8bba', // 实验结论回退文本
  fallbackImprovement: '\u6539\u8fdb\u5efa\u8bae', // 改进建议回退文本
  participantsLabel: '\u53c2\u4e0e\u4eba\u5458\uff1a', // 参与人员标签
  planDateLabel: '\u5b9e\u9a8c\u65e5\u671f\uff1a', // 实验日期标签
  envLabel: '\u5b9e\u9a8c\u73af\u5883\uff1a', // 实验环境标签
  questionLabel: '\u95ee\u9898\uff1a', // 问题标签
  hypothesisLabel: '\u5047\u8bbe\uff1a', // 假设标签
  goalsLabel: '\u76ee\u6807\uff1a', // 目标标签
  virtualDoneLabel: '\u5b8c\u6210\u72b6\u6001\uff1a', // 完成状态标签
  virtualDoneYes: '\u5df2\u5b8c\u6210', // 已完成状态
  virtualDoneNo: '\u672a\u5b8c\u6210', // 未完成状态
  virtualDoneAtLabel: '\u5b8c\u6210\u65f6\u95f4\uff1a', // 完成时间标签
  virtualNoteLabel: '\u7b14\u8bb0\uff1a', // 笔记标签
  observationLabel: '\u89c2\u5bdf\u5185\u5bb9\uff1a', // 观察内容标签
  findingLabel: '\u5173\u952e\u53d1\u73b0\uff1a', // 关键发现标签
  resultLabel: '\u7ed3\u8bba\uff1a', // 结论标签
  variableIndependentLabel: '\u81ea\u53d8\u91cf\uff1a', // 自变量标签
  variableDependentLabel: '\u56e0\u53d8\u91cf\uff1a', // 因变量标签
  variableSlowLabel: '\u65cb\u8f6c\u901f\u5ea6\u6162\uff1a', // 旋转速度慢标签
  variableFastLabel: '\u65cb\u8f6c\u901f\u5ea6\u5feb\uff1a', // 旋转速度快标签
  evidenceNamePrefix: '\u8bc1\u636e', // 证据名称前缀
  reportSectionPrefix: '\u7ae0\u8282\uff1a' // 章节前缀
};

const safeText = (value, fallback = I18N.notFilled) => {
  const text = String(value || '').trim();
  return text || fallback;
};

const formatEvidenceList = (list = []) => {
  if (!Array.isArray(list) || list.length === 0) return I18N.evidenceEmpty;
  return list
    .map((item, index) => `${index + 1}. ${safeText(item && item.name, `${I18N.evidenceNamePrefix}-${index + 1}`)}`)
    .join('\n');
};

const isImagePath = (value = '') => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(value || '').trim());

const normalizeEvidenceList = (list = []) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const raw = String(item).trim();
        if (!raw) return null;
        const path = raw;
        const seg = path.split(/[\\/]/).filter((part) => part);
        const name = seg.length > 0 ? seg[seg.length - 1] : `${I18N.evidenceNamePrefix}-${index + 1}`;
        return {
          id: `evidence-${index + 1}`,
          type: isImagePath(path) ? 'image' : '',
          name,
          path
        };
      }
      const target = typeof item === 'object' ? item : {};
      const path = String(target.path || target.url || target.tempFilePath || '').trim();
      if (!path) return null;
      const explicitType = String(target.type || '').toLowerCase();
      const type = explicitType === 'image' || explicitType === 'video'
        ? explicitType
        : (isImagePath(path) ? 'image' : '');
      return {
        id: String(target.id || target.uid || `evidence-${index + 1}`),
        type,
        name: safeText(target.name, `${I18N.evidenceNamePrefix}-${index + 1}`),
        path
      };
    })
    .filter((item) => !!item);
};

const extractEvidenceImages = (list = []) => {
  return normalizeEvidenceList(list).filter((item) => {
    if (!item || !item.path) return false;
    if (item.type === 'image') return true;
    return isImagePath(item.path) || isImagePath(item.name);
  });
};

const toKeyText = (value) => safeText(value, I18N.notFilled);

const DEFAULT_REPORT_QUESTION = '旋转速度形成的离心力与五角星飞行高度与远距离的关系';
const DEFAULT_SLOW_OBSERVATION = '五角星往外飞出去了一点点，比起以前的位置飞高了一点点。';
const DEFAULT_FAST_OBSERVATION = '五角星往外飞出去了很多，比起以前的位置飞高了很多。';
const DEFAULT_PHENOMENON = '电动装置旋转更快，导致五角星飞了更高更远';
const DEFAULT_RULE_SUMMARY = '五角星的旋转速度与飞行高度和离心距离成正比';
const DEFAULT_PRINCIPLE =
  '旋转做圆周运动，其中动力来自圆心，是通过圆心转动拉动五角星运动，这个力称之为向心力。因为向心力的拉动导致五角星运动，而五角星因为运动惯性要保持运动方向，从而产生了一个惯性力，而这个惯性力运动的方向是远离圆心的，因此我们把这个惯性力形象的称之为惯性离心力，简称离心力。五角星飞出去的力主要来自电机转动产生的向心力，转化为离心力而导致的现象。电机旋转的速度越大，向心力就越大，从而转化的离心力就越大，五角星就飞的越远。';
const DEFAULT_IMPROVEMENT =
  '该实验方案的结果还不够更直观和形象的让孩子观测到离心力为什么可以让衣服里面的水脱落出去。因此我们希望改进实验方案，可以观察到五角星因为旋转速度的变大，因为离心力变大让五角星脱离实验模型飞了出去，进一步验证水因为离心力的原因脱离衣服。';

const findLinkedRecordByExperimentId = (list = [], experimentId = '') => {
  if (!Array.isArray(list) || list.length === 0) return null;
  const key = String(experimentId || '');
  if (!key) return null;
  return list.find((item) => String(item && item.experimentId) === key) || null;
};

const withPrefix = (prefix, value) => {
  const text = String(value || '').trim();
  if (!text) return `${prefix}${I18N.notFilled}`;
  if (text.startsWith(prefix)) return text;
  return `${prefix}${text}`;
};

const extractTemplateIdFromPlanId = (value) => {
  const text = String(value || '');
  const hit = text.match(/^phase2-plan-(.+)$/);
  return hit && hit[1] ? hit[1] : '';
};

const buildCatalogLookup = () => {
  const byLegacy = {};
  const byId = {};
  (catalog.categories || []).forEach((category) => {
    (category.items || []).forEach((item) => {
      if (!item) return;
      byId[String(item.id)] = item;
      if (item.legacyId !== null && item.legacyId !== undefined) {
        byLegacy[String(item.legacyId)] = item;
      }
    });
  });
  return { byLegacy, byId };
};

const CATALOG_LOOKUP = buildCatalogLookup();

const resolveTemplateId = (record, raw) => {
  const fromPlanId = extractTemplateIdFromPlanId(raw && raw.id);
  if (fromPlanId) return fromPlanId;

  const fromRecordId = extractTemplateIdFromPlanId(record && record.id);
  if (fromRecordId) return fromRecordId;

  const experimentId = String((raw && raw.experimentId) || (record && record.experimentId) || '');
  if (experimentId.includes('science-') || experimentId.includes('engineering-')) return experimentId;

  if (CATALOG_LOOKUP.byLegacy[experimentId]) return CATALOG_LOOKUP.byLegacy[experimentId].id;
  if (CATALOG_LOOKUP.byId[experimentId]) return CATALOG_LOOKUP.byId[experimentId].id;

  return 'science-01';
};

const isEngineeringRecord = (record) => {
  const raw = (record && record.raw) || {};
  const id = String((record && record.id) || '');
  const source = String(raw.source || '');
  const templateId = resolveTemplateId(record, raw);
  if (id.startsWith('eng-')) return true;
  if (source.includes('engineering-flow')) return true;
  if (templateId.startsWith('engineering-')) return true;
  return false;
};

const resolveEngineeringTargetText = (template, type, key) => {
  if (!template || !template.step4 || !template.step4.targetOptions) return '';
  const options = template.step4.targetOptions[type] || [];
  const hit = options.find((item) => item.key === key);
  return hit ? hit.text : '';
};

const formatStepDesign = (step7 = {}, template = {}) => {
  const detail = String(step7.detailSteps || '').trim();
  if (detail) return detail;

  const selected = Array.isArray(step7.majorSteps) ? step7.majorSteps : [];
  if (selected.length === 0) return I18N.notFilled;

  const majorMap = {};
  ((template.step7 && template.step7.majorSteps) || []).forEach((item) => {
    if (!item || !item.key) return;
    majorMap[item.key] = item;
  });

  const lines = [];
  selected.forEach((key, index) => {
    const hit = majorMap[String(key)];
    if (hit) {
      lines.push(`${index + 1}. ${hit.title}`);
      (hit.lines || []).forEach((line) => lines.push(`- ${line}`));
      return;
    }
    lines.push(`${index + 1}. ${key}`);
  });
  return lines.join('\n');
};

const buildPlanFormModel = (record) => {
  const raw = (record && record.raw) || {};
  const flowSnapshot = raw.flowSnapshot || {};
  const basic = raw.basicInfo || {};
  const step3 = flowSnapshot.step3 || {};
  const step4 = flowSnapshot.step4 || {};
  const step5 = flowSnapshot.step5 || {};
  const step6 = flowSnapshot.step6 || {};
  const step7 = flowSnapshot.step7 || {};
  const templateId = resolveTemplateId(record, raw);
  const template = getScienceFlowTemplate(templateId);

  const basicRows = [
    { label: '实验标题', value: toKeyText(record && record.experimentName) },
    { label: '参与人', value: toKeyText(basic.participants) },
    { label: '实验日期', value: toKeyText(basic.date) },
    { label: '实验环境', value: toKeyText(basic.environment) }
  ];

  const questionRows = [
    { label: '明确科学问题', value: toKeyText(step3.question) },
    { label: '推理与假设', value: toKeyText(step3.hypothesisText) }
  ];

  const goalText = Array.isArray(step4.selectedGoals) && step4.selectedGoals.length > 0
    ? step4.selectedGoals.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : I18N.notFilled;

  const logicKey = step5.sceneChoice || step5.strategyChoice || '';
  const logicMap = {};
  ((template.step5 && template.step5.logicOptions) || []).forEach((item) => {
    if (!item || !item.key) return;
    logicMap[item.key] = item;
  });
  const sceneHit = logicMap[logicKey];
  const sceneIdea = sceneHit
    ? `${sceneHit.title}\n${sceneHit.content}`
    : toKeyText(step5.strategyChoice || step5.sceneChoice || '');

  const materials = [];
  const materialItems = Array.isArray(step5.materialItems) ? step5.materialItems : [];
  const customMaterials = Array.isArray(step5.customMaterials) ? step5.customMaterials : [];
  const fallbackMaterials = Array.isArray(template.step5 && template.step5.baseMaterials)
    ? template.step5.baseMaterials
    : [];
  const sourceMaterials = [...materialItems, ...customMaterials];
  const useMaterials = sourceMaterials.length > 0 ? sourceMaterials : fallbackMaterials;
  useMaterials.forEach((item) => {
    materials.push({
      name: toKeyText(item && item.name),
      spec: toKeyText(item && item.spec),
      qty: toKeyText(item && item.qty),
      usage: toKeyText(item && item.usage)
    });
  });
  if (materials.length === 0) {
    materials.push({ name: I18N.notFilled, spec: I18N.notFilled, qty: I18N.notFilled, usage: I18N.notFilled });
  }

  const typeRows = Array.isArray(template.step6 && template.step6.typeRows) ? template.step6.typeRows : [];
  const optionList = Array.isArray(template.step6 && template.step6.optionList) ? template.step6.optionList : [];
  const optionMap = {};
  optionList.forEach((item) => {
    if (!item || !item.key) return;
    optionMap[item.key] = item;
  });
  const selectionMap = step6.selectionMap || {};

  const variables = (typeRows.length > 0 ? typeRows : [
    { typeKey: 'independent', label: '自变量', definition: '主动改变的量' },
    { typeKey: 'dependent', label: '因变量', definition: '被动改变的量' },
    { typeKey: 'control', label: '不变量', definition: '不改变的量' }
  ]).map((row) => {
    const key = selectionMap[row.typeKey];
    const option = optionMap[key] || null;
    const contentFallback =
      row.typeKey === 'independent'
        ? step6.independentVariable
        : row.typeKey === 'dependent'
          ? step6.dependentVariable
          : step6.controlVariable;
    return {
      type: toKeyText(row.label),
      definition: toKeyText(row.definition),
      material: toKeyText(option && option.material),
      content: toKeyText((option && option.content) || contentFallback)
    };
  });

  const stepDesign = formatStepDesign(step7, template);
  const materialBlockHeight = Math.max(220, 78 + materials.length * 54);
  const variableBlockHeight = Math.max(220, 78 + variables.length * 54);

  return {
    basicRows,
    questionRows,
    goalText,
    sceneIdea,
    materials,
    variables,
    stepDesign,
    materialBlockHeight,
    variableBlockHeight
  };
};

const buildEngineeringPlanFormModel = (record) => {
  const raw = (record && record.raw) || {};
  const snapshot = raw.engineeringSnapshot || {};
  const flowSnapshot = raw.flowSnapshot || {};
  const step2 = snapshot.step2 || {};
  const step3 = snapshot.step3 || {};
  const step4 = snapshot.step4 || {};
  const step5 = snapshot.step5 || {};
  const step7 = flowSnapshot.step7 || {};
  const templateId = resolveTemplateId(record, raw);
  const template = getEngineeringFlowTemplate(templateId);

  const basicRows = [
    { label: '工程标题', value: toKeyText(record && record.experimentName) },
    { label: '设计人', value: toKeyText(step5.designer || (raw.basicInfo && raw.basicInfo.participants)) },
    { label: '设计日期', value: toKeyText(step5.designDate || (raw.basicInfo && raw.basicInfo.date)) },
    { label: '工程环境', value: toKeyText((raw.basicInfo && raw.basicInfo.environment) || '工程实践') }
  ];

  const questionRows = [
    { label: '明确场景问题', value: toKeyText(step2.sceneProblemText) },
    { label: '科学原理应用', value: toKeyText(step3.principleText) }
  ];

  const targetChoice = step4.targetChoice || {};
  const goals = [];
  const functionGoal = resolveEngineeringTargetText(template, 'function', targetChoice.function);
  const performanceGoal = resolveEngineeringTargetText(template, 'performance', targetChoice.performance);
  const costGoal = resolveEngineeringTargetText(template, 'cost', targetChoice.cost);
  const safetyGoal = resolveEngineeringTargetText(template, 'safety', targetChoice.safety);
  if (functionGoal) goals.push(`功能目标：${functionGoal}`);
  if (performanceGoal) goals.push(`性能目标：${performanceGoal}`);
  if (costGoal) goals.push(`成本目标：${costGoal}`);
  if (safetyGoal) goals.push(`安全目标：${safetyGoal}`);
  const goalText = goals.length > 0 ? goals.join('\n') : I18N.notFilled;

  const systems = Array.isArray(step4.systemDesign) && step4.systemDesign.length > 0
    ? step4.systemDesign
    : ((template.step4 && template.step4.systems) || []);
  const sceneIdea = systems.length > 0
    ? systems.map((item, idx) => `${idx + 1}. ${toKeyText(item.title)}：${toKeyText(item.role)}；结构：${toKeyText(item.structure)}`).join('\n')
    : I18N.notFilled;

  const materials = [];
  const useMaterials = [
    ...(Array.isArray(step4.materials) ? step4.materials : []),
    ...(Array.isArray(step4.customMaterials) ? step4.customMaterials : [])
  ];
  const fallbackMaterials = Array.isArray(template.step4 && template.step4.materials) ? template.step4.materials : [];
  (useMaterials.length > 0 ? useMaterials : fallbackMaterials).forEach((item) => {
    materials.push({
      name: toKeyText(item && item.name),
      spec: toKeyText(item && item.spec),
      qty: toKeyText(item && item.qty),
      usage: toKeyText(item && item.usage)
    });
  });
  if (materials.length === 0) {
    materials.push({ name: I18N.notFilled, spec: I18N.notFilled, qty: I18N.notFilled, usage: I18N.notFilled });
  }

  const variables = [
    {
      type: '自变量',
      definition: '主动改变的量',
      material: '拉线力度 / 旋转速度',
      content: '从低速到高速进行对比测试'
    },
    {
      type: '因变量',
      definition: '被动改变的量',
      material: '袜子脱水效果',
      content: '观察甩水量、干燥程度变化'
    },
    {
      type: '不变量',
      definition: '保持不变的量',
      material: '袜子材质、含水量、模型结构',
      content: '每轮测试尽量保持一致'
    }
  ];

  const templateBuildSteps = Array.isArray(template && template.step4 && template.step4.buildSteps)
    ? template.step4.buildSteps
    : [];
  const templateBuildStepOptions = Array.isArray(template && template.step4 && template.step4.buildStepOptions)
    ? template.step4.buildStepOptions
    : [];
  const optionMap = {};
  templateBuildStepOptions.forEach((item) => {
    if (!item || !item.key) return;
    optionMap[item.key] = item;
  });
  const preferredOrder =
    Array.isArray(step4.buildStepOrder) && step4.buildStepOrder.length > 0
      ? step4.buildStepOrder
      : templateBuildStepOptions.map((item) => item && item.key).filter((key) => !!key);
  const expandedTemplateStepDesign = preferredOrder
    .map((key, index) => {
      const option = optionMap[key];
      if (!option) return '';
      const title = String(option.title || '').trim() || `步骤${index + 1}`;
      const lines = Array.isArray(option.lines) ? option.lines.map((line) => String(line || '').trim()).filter((line) => line) : [];
      return [`${index + 1}. ${title}`, ...lines].join('\n');
    })
    .filter((item) => item)
    .join('\n\n');
  const runtimeBuildSteps = Array.isArray(step4.buildSteps) ? step4.buildSteps : [];
  const buildSteps = templateBuildSteps.length > 0 ? templateBuildSteps : runtimeBuildSteps;
  const syncedStepDesign = String(step7.detailSteps || '').trim();
  const stepDesign = syncedStepDesign
    || expandedTemplateStepDesign
    || (buildSteps.length > 0 ? buildSteps.join('\n') : I18N.notFilled);

  const normalizeBlueprint = (item, label, fallbackName = '未同步') => {
    const target = item && typeof item === 'object' ? item : {};
    return {
      label,
      name: toKeyText(target.name || fallbackName),
      path: String(target.path || '').trim()
    };
  };
  const syncedBlueprints =
    raw && raw.flowSnapshot && raw.flowSnapshot.step4 && Array.isArray(raw.flowSnapshot.step4.blueprints)
      ? raw.flowSnapshot.step4.blueprints
      : [];
  const templateBlueprints = (template && template.step4 && Array.isArray(template.step4.blueprints))
    ? template.step4.blueprints
    : [];
  const templateReference = templateBlueprints[0] || null;
  const templateAISource = templateBlueprints[1] || templateReference || null;
  const uploadedList = Array.isArray(step4.blueprintUploads) ? step4.blueprintUploads.filter((item) => item && item.path) : [];
  const uploaded = uploadedList.length > 0 ? uploadedList[uploadedList.length - 1] : null;
  const aiGenerated = step4.blueprintAIResult && step4.blueprintAIResult.path ? step4.blueprintAIResult : null;

  const blueprints = [
    normalizeBlueprint(
      syncedBlueprints[0] || templateReference,
      '模型参考图纸',
      (templateReference && templateReference.name) || '未同步'
    ),
    normalizeBlueprint(
      syncedBlueprints[1] || aiGenerated || templateAISource,
      'AI 一键生成图纸',
      (templateAISource && templateAISource.name) || '未同步'
    ),
    normalizeBlueprint(
      syncedBlueprints[2] || uploaded,
      '上传我的设计图纸',
      uploaded ? uploaded.name : '未上传'
    )
  ];

  return {
    basicRows,
    questionRows,
    goalText,
    sceneIdea,
    materials,
    variables,
    stepDesign,
    blueprints,
    materialBlockHeight: Math.max(220, 78 + materials.length * 54),
    variableBlockHeight: Math.max(220, 78 + variables.length * 54)
  };
};

const buildDataFormModel = (record) => {
  const raw = (record && record.raw) || {};
  const analysisDetail = raw.analysisDetail || {};
  const variableTable = analysisDetail.variableTable || {};
  const evidenceImages = extractEvidenceImages(raw.virtualEvidence);

  const experimentTitle = toKeyText(record && record.experimentName);
  const recorder = toKeyText(
    raw.recorder || raw.recordUser || raw.createdBy || raw.author || raw.operator || raw.name
  );
  const recordTime = toKeyText(record && record.date);
  const slowObservation = toKeyText(variableTable.slowObservation);
  const fastObservation = toKeyText(variableTable.fastObservation);
  const findings = toKeyText(raw.discoveries || analysisDetail.findings);

  const modelSlow = toKeyText(raw.modelSlow || variableTable.modelSlow || '拉线回力旋转装置');
  const modelFast = toKeyText(raw.modelFast || variableTable.modelFast || '电机动力旋转装置');
  const baseBlockHeight = 3 * 76;
  const dataBlockHeight = 368;

  return {
    experimentTitle,
    recorder,
    recordTime,
    independentLabel: toKeyText(variableTable.independentVariable || '旋转速度（自变量）'),
    dependentLabel: toKeyText(variableTable.dependentVariable || '五角星运动状态（飞行高低和远近）（因变量）'),
    modelSlow,
    modelFast,
    slowObservation,
    fastObservation,
    findings,
    evidenceImages,
    baseBlockHeight,
    dataBlockHeight
  };
};

const pickEngineeringRecordText = (row) => {
  if (!row || !Array.isArray(row.options)) return '';
  const hit = row.options.find((item) => item && item.key === row.choice);
  return hit ? `选项${hit.key}：${hit.text}` : '';
};

const buildEngineeringQualitativeRows = (records) => {
  if (!Array.isArray(records) || records.length === 0) return [];
  return records.map((row) => {
    const recordText = pickEngineeringRecordText(row) || '未记录';
    const effectText = String((row && row.effect) || '').trim();
    return {
      model: '手动离心甩干装置',
      independent: toKeyText(row && row.goal),
      dependent: toKeyText(effectText ? `${recordText}；${effectText}` : recordText)
    };
  });
};

const buildEngineeringOptimizationText = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  return rows
    .filter((row) => row && (
      String(row.problem || '').trim() ||
      String(row.solution || '').trim() ||
      String(row.replacement || '').trim()
    ))
    .map((row, index) => {
      if (row.displayMode === 'targetStatus') {
        const target = String(row.problem || '').trim();
        const status = String(row.solution || '').trim();
        return `${index + 1}. ${target}${target && status ? '：' : ''}${status}`;
      }
      const parts = [];
      if (String(row.problem || '').trim()) parts.push(`问题：${row.problem}`);
      if (String(row.solution || '').trim()) parts.push(`解决方案：${row.solution}`);
      if (String(row.replacement || '').trim()) parts.push(`替换结构：${row.replacement}`);
      return `${index + 1}. ${parts.join('；')}`;
    })
    .join('\n');
};

const buildEngineeringDataFormModel = (record) => {
  const raw = (record && record.raw) || {};
  const snapshot = raw.engineeringSnapshot || {};
  const step5 = snapshot.step5 || {};
  const step6 = snapshot.step6 || {};
  const step7 = snapshot.step7 || {};
  const analysisDetail = raw.analysisDetail || {};
  const variableTable = analysisDetail.variableTable || {};
  const records = Array.isArray(analysisDetail.records) && analysisDetail.records.length > 0
    ? analysisDetail.records
    : (Array.isArray(step7.records) ? step7.records : []);
  const qualitativeRows = buildEngineeringQualitativeRows(records);
  const rawEvidence = Array.isArray(raw.virtualEvidence) && raw.virtualEvidence.length > 0
    ? raw.virtualEvidence
    : (Array.isArray(step6.evidenceList)
      ? step6.evidenceList
      : (Array.isArray(step6.offlineEvidenceList) ? step6.offlineEvidenceList : []));
  const evidenceImages = extractEvidenceImages(rawEvidence);

  const dewater = records.find((item) => item.key === 'dewater');
  const performance = records.find((item) => item.key === 'performance');
  const slowObservation = toKeyText(
    variableTable.slowObservation ||
    (dewater && dewater.choice === 'A' ? '脱水现象非常明显' : '脱水现象不明显')
  );
  const fastObservation = toKeyText(
    variableTable.fastObservation ||
    (performance && performance.choice === 'A' ? '转动快且轻松' : '转动快但较费力')
  );

  return {
    experimentTitle: toKeyText(record && record.experimentName),
    recorder: toKeyText(raw.recorder || step5.designer),
    recordTime: toKeyText(record && record.date),
    independentLabel: '测试目标',
    dependentLabel: '测试表现',
    modelSlow: '手动离心甩干装置',
    modelFast: '手动离心甩干装置',
    slowObservation,
    fastObservation,
    qualitativeRows,
    findings: toKeyText(raw.discoveries || step7.findings || analysisDetail.findings),
    evidenceImages,
    baseBlockHeight: 3 * 76,
    dataBlockHeight: 368
  };
};

const buildReportFormModel = (record) => {
  const raw = (record && record.raw) || {};
  const center = getRecordCenterData();
  const experimentId = String((record && record.experimentId) || raw.experimentId || '');
  const linkedPlan = findLinkedRecordByExperimentId(center.plans, experimentId);
  const linkedData = findLinkedRecordByExperimentId(center.data, experimentId);
  const planRaw = (linkedPlan && linkedPlan.raw) || {};
  const dataRaw = (linkedData && linkedData.raw) || {};
  const flowSnapshot = planRaw.flowSnapshot || {};
  const basic = planRaw.basicInfo || {};
  const step3 = flowSnapshot.step3 || {};
  const analysisDetail = dataRaw.analysisDetail || raw.analysisDetail || {};
  const variableTable = analysisDetail.variableTable || {};

  const experimentTitle = toKeyText(record && record.experimentName);
  const participants = toKeyText(basic.participants || raw.participants || raw.experimentParticipants);
  const environment = toKeyText(basic.environment || raw.environment);
  const experimentDate = toKeyText(basic.date || raw.experimentDate || (linkedPlan && linkedPlan.date));
  const dataRecorder = toKeyText(dataRaw.recorder || raw.dataRecorder || basic.participants);
  const recordTime = toKeyText((linkedData && linkedData.date) || dataRaw.date || (record && record.date));

  const questionReshape = toKeyText(step3.question || raw.questionReshape || DEFAULT_REPORT_QUESTION);
  const findingsText =
    String(dataRaw.discoveries || analysisDetail.findings || raw.discoveries || '').trim() ||
    '数据证明了初始的猜想，旋转速度越快五角星飞行的越高越远';
  const hypothesisSupport = withPrefix('支持假设：', findingsText);

  const modelSlow = toKeyText(raw.modelSlow || variableTable.modelSlow || '拉线回力旋转装置');
  const modelFast = toKeyText(raw.modelFast || variableTable.modelFast || '电机动力旋转装置');
  const slowObservation = toKeyText(variableTable.slowObservation || DEFAULT_SLOW_OBSERVATION);
  const fastObservation = toKeyText(variableTable.fastObservation || DEFAULT_FAST_OBSERVATION);
  const keyFinding = toKeyText(dataRaw.discoveries || analysisDetail.findings || raw.discoveries);

  const phenomenon = toKeyText(raw.phenomenon || DEFAULT_PHENOMENON);
  const ruleSummary = toKeyText(raw.ruleSummary || DEFAULT_RULE_SUMMARY);
  const principle = toKeyText(raw.principle || DEFAULT_PRINCIPLE);
  const effectResult = toKeyText(raw.result || raw.effectiveness || '基本达成实验目的');
  const improvement = toKeyText(raw.improvement || DEFAULT_IMPROVEMENT);
  const remark = toKeyText(raw.remark || raw.note || raw.virtualLabNote);

  const baseBlockHeight = 6 * 76;
  const questionBlockHeight = 2 * 86;
  const dataAnalysisBlockHeight = 410;
  const conclusionBlockHeight = Math.max(300, 180 + Math.ceil(String(principle).length / 28) * 24);
  const improveBlockHeight = Math.max(210, 120 + Math.ceil(String(improvement).length / 28) * 24);

  return {
    experimentTitle,
    participants,
    environment,
    experimentDate,
    dataRecorder,
    recordTime,
    questionReshape,
    hypothesisSupport,
    modelSlow,
    modelFast,
    independentLabel: toKeyText(variableTable.independentVariable || '旋转速度（自变量）'),
    dependentLabel: toKeyText(variableTable.dependentVariable || '五角星运动状态（飞行高低和远近）（因变量）'),
    slowObservation,
    fastObservation,
    keyFinding,
    phenomenon,
    ruleSummary,
    principle,
    effectResult,
    improvement,
    remark,
    baseBlockHeight,
    questionBlockHeight,
    dataAnalysisBlockHeight,
    conclusionBlockHeight,
    improveBlockHeight
  };
};

const buildEngineeringReportFormModel = (record) => {
  const raw = (record && record.raw) || {};
  const center = getRecordCenterData();
  const experimentId = String((record && record.experimentId) || raw.experimentId || '');
  const linkedPlan = findLinkedRecordByExperimentId(center.plans, experimentId);
  const linkedData = findLinkedRecordByExperimentId(center.data, experimentId);
  const planRaw = (linkedPlan && linkedPlan.raw) || {};
  const dataRaw = (linkedData && linkedData.raw) || {};
  const snapshot = raw.engineeringSnapshot || planRaw.engineeringSnapshot || {};
  const step2 = snapshot.step2 || {};
  const step3 = snapshot.step3 || {};
  const step5 = snapshot.step5 || {};
  const step7 = snapshot.step7 || {};
  const step8 = snapshot.step8 || {};
  const step9 = snapshot.step9 || {};
  const analysisDetail = dataRaw.analysisDetail || raw.analysisDetail || {};
  const variableTable = analysisDetail.variableTable || {};
  const records = Array.isArray(analysisDetail.records) && analysisDetail.records.length > 0
    ? analysisDetail.records
    : (Array.isArray(step7.records) ? step7.records : []);
  const qualitativeRows = buildEngineeringQualitativeRows(records);
  const optimizationText = buildEngineeringOptimizationText(step8.optimizationRows);

  const findingsText =
    String(dataRaw.discoveries || analysisDetail.findings || step7.findings || '').trim() ||
    '测试结果支持原始猜想：旋转越快，脱水效果越明显。';

  return {
    experimentTitle: toKeyText(record && record.experimentName),
    participants: toKeyText(step5.designer || (planRaw.basicInfo && planRaw.basicInfo.participants)),
    environment: toKeyText((planRaw.basicInfo && planRaw.basicInfo.environment) || '工程实践'),
    experimentDate: toKeyText(step5.designDate || (planRaw.basicInfo && planRaw.basicInfo.date)),
    dataRecorder: toKeyText(dataRaw.recorder || step5.designer),
    recordTime: toKeyText((linkedData && linkedData.date) || dataRaw.date || (record && record.date)),
    questionReshape: toKeyText(step2.sceneProblemText || DEFAULT_REPORT_QUESTION),
    hypothesisSupport: withPrefix('支持假设：', findingsText),
    modelSlow: '手动离心甩干装置',
    modelFast: '手动离心甩干装置',
    independentLabel: '测试目标',
    dependentLabel: '测试表现',
    slowObservation: toKeyText(variableTable.slowObservation || '低速下可观察到初步甩水效果。'),
    fastObservation: toKeyText(variableTable.fastObservation || '高速下甩水更明显，效率更高。'),
    qualitativeRows,
    keyFinding: toKeyText(dataRaw.discoveries || step7.findings || analysisDetail.findings),
    phenomenon: toKeyText(raw.phenomenon || step9.conclusion || '转速提高后，脱水效果明显增强。'),
    ruleSummary: toKeyText(raw.ruleSummary || '旋转速度与脱水效果呈正相关。'),
    principle: toKeyText(raw.principle || step3.principleText || DEFAULT_PRINCIPLE),
    effectResult: toKeyText(raw.result || '基本达成工程目标'),
    improvement: toKeyText(raw.improvement || step8.aiSuggestion || optimizationText || DEFAULT_IMPROVEMENT),
    remark: toKeyText(raw.remark || step9.extraFeeling),
    baseBlockHeight: 6 * 76,
    questionBlockHeight: 2 * 86,
    dataAnalysisBlockHeight: 410,
    conclusionBlockHeight: 300,
    improveBlockHeight: 230
  };
};

export default {
  components: {
    AIChat
  },
  data() {
    return {
      type: '',
      id: '',
      record: null,
      expandedMap: {}
    };
  },
  computed: {
    i18n() {
      return I18N;
    },
    typeLabel() {
      if (this.type === 'plan') return I18N.typePlan;
      if (this.type === 'data') return I18N.typeData;
      return I18N.typeReport;
    },
    aiGuideKey() {
      return `record-detail-${this.type || 'report'}`;
    },
    aiGuideScene() {
      if (this.type === 'data') return 'dataAnalysis';
      if (this.type === 'plan') return 'planning';
      return 'experimentSummary';
    },
    aiGuideText() {
      if (this.type === 'plan') {
        return '这里是方案设计详情，先看目标和步骤，再看材料与变量是否匹配。';
      }
      if (this.type === 'data') {
        return '这里是数据记录详情，先看观察记录，再确认关键发现是否由数据支持。';
      }
      return '这里是结论报告详情，重点看结论是否回答了最初问题，并给出改进方向。';
    },
    detailSections() {
      if (!this.record) return [];
      const raw = this.record.raw || {};
      const engineering = isEngineeringRecord(this.record);

      if (this.type === 'plan') {
        return [
          {
            key: 'plan-form',
            kind: 'plan-form',
            title: engineering ? '【工程模型方案设计表单】' : '实验方案设计表单',
            model: engineering ? buildEngineeringPlanFormModel(this.record) : buildPlanFormModel(this.record)
          }
        ];
      }

      if (this.type === 'data') {
        return [
          {
            key: 'data-form',
            kind: 'data-form',
            title: engineering ? '【工程测试数据记录与分析表】' : '【实验数据记录与分析表】',
            model: engineering ? buildEngineeringDataFormModel(this.record) : buildDataFormModel(this.record)
          }
        ];
      }

      if (this.type === 'report') {
        return [
          {
            key: 'report-form',
            kind: 'report-form',
            title: engineering ? '【工程实践结论报告表】' : '【实验结论报告表】',
            model: engineering ? buildEngineeringReportFormModel(this.record) : buildReportFormModel(this.record)
          }
        ];
      }

      const templateSections = Array.isArray(raw.reportTemplateSections) ? raw.reportTemplateSections : [];
      if (templateSections.length > 0) {
        const normalized = templateSections.map((item, index) => ({
          key: `report-section-${index}`,
          title: safeText(item.title, I18N.fallbackSectionTitle),
          content: `${I18N.reportSectionPrefix}${safeText(item.title, I18N.fallbackSectionTitle)}\n${safeText(item.content)}`
        }));

        normalized.push({
          key: 'report-evidence',
          title: I18N.evidenceTitle,
          content: formatEvidenceList(raw.virtualEvidence)
        });
        return normalized;
      }

      const templateText = safeText(raw.reportTemplateText || raw.templateContent, '');
      if (templateText) {
        return [
          {
            key: 'report-template',
            title: I18N.templateTitle,
            content: templateText
          },
          {
            key: 'report-evidence',
            title: I18N.evidenceTitle,
            content: formatEvidenceList(raw.virtualEvidence)
          }
        ];
      }

      return [
        { key: 'report-phenomenon', title: I18N.fallbackPhenomenon, content: safeText(raw.phenomenon) },
        { key: 'report-principle', title: I18N.fallbackPrinciple, content: safeText(raw.principle) },
        { key: 'report-result', title: I18N.fallbackResult, content: safeText(raw.result || raw.summary) },
        { key: 'report-improvement', title: I18N.fallbackImprovement, content: safeText(raw.improvement) },
        { key: 'report-evidence', title: I18N.evidenceTitle, content: formatEvidenceList(raw.virtualEvidence) }
      ];
    }
  },
  onLoad(query) {
    this.type = decodeURIComponent(query.type || 'report');
    this.id = decodeURIComponent(query.id || '');
    this.loadRecord();
  },
  onShow() {
    this.loadRecord();
  },
  methods: {
    loadRecord() {
      if (!this.type || !this.id) {
        this.record = null;
        this.expandedMap = {};
        return;
      }
      this.record = getRecordByTypeAndId(this.type, this.id);
      this.$nextTick(() => {
        this.resetExpandedMap();
      });
    },
    resetExpandedMap() {
      const map = {};
      this.detailSections.forEach((_, index) => {
        map[index] = index === 0;
      });
      this.expandedMap = map;
    },
    isExpanded(index) {
      if (typeof this.expandedMap[index] !== 'boolean') return index === 0;
      return this.expandedMap[index];
    },
    toggleSection(index) {
      const current = this.isExpanded(index);
      if (typeof this.$set === 'function') {
        this.$set(this.expandedMap, index, !current);
      } else {
        this.expandedMap = {
          ...this.expandedMap,
          [index]: !current
        };
      }
    },
    formatDate(value) {
      return safeText(value, I18N.noDate);
    },
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
      if (pages.length > 1) {
        uni.navigateBack();
        return;
      }
      uni.redirectTo({ url: '/pages/record/record' });
    },
    printCurrentRecord() {
      const canPrint =
        typeof window !== 'undefined' &&
        window &&
        typeof window.print === 'function';

      if (!canPrint) {
        uni.showToast({
          title: '当前平台暂不支持系统打印',
          icon: 'none'
        });
        return;
      }

      const previousExpandedMap = { ...this.expandedMap };
      const allExpandedMap = {};
      this.detailSections.forEach((_, index) => {
        allExpandedMap[index] = true;
      });
      this.expandedMap = allExpandedMap;

      this.$nextTick(() => {
        setTimeout(() => {
          window.print();
          setTimeout(() => {
            this.expandedMap = previousExpandedMap;
          }, 220);
        }, 120);
      });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 14% 8%, rgba(240, 162, 35, 0.2), transparent 24%),
    radial-gradient(circle at 88% 20%, rgba(51, 131, 245, 0.16), transparent 26%),
    linear-gradient(180deg, #fff8ee 0%, #eef4ff 54%, #f8fffa 100%);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid #d4e1f8;
  color: #315997;
  font-size: 22rpx;
  padding: 8rpx 16rpx;
}

.print-btn {
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid #d4e1f8;
  color: #2e4a74;
  font-size: 22rpx;
  padding: 8rpx 16rpx;
}

.header-card {
  margin-top: 12rpx;
  border-radius: 20rpx;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(22, 63, 121, 0.08);
}

.header-title {
  font-size: 31rpx;
  line-height: 1.5;
  color: #17325f;
  font-weight: 700;
}

.meta-row {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #4e6991;
}

.summary-box {
  margin-top: 12rpx;
  border-radius: 14rpx;
  background: #f4f8ff;
  color: #355382;
  font-size: 23rpx;
  line-height: 1.6;
  padding: 12rpx;
  white-space: pre-line;
}

.section-list {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.section-card {
  border-radius: 18rpx;
  padding: 16rpx;
  background: #fff;
  border: 1rpx solid #dbe8ff;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 25rpx;
  color: #1f4380;
  font-weight: 700;
}

.section-toggle {
  font-size: 21rpx;
  color: #5b7db4;
  background: #eff4ff;
  border-radius: 999rpx;
  padding: 6rpx 12rpx;
}

.section-content {
  margin-top: 8rpx;
  color: #49668f;
  font-size: 23rpx;
  line-height: 1.7;
  white-space: pre-line;
}

.empty-card {
  margin-top: 20rpx;
  border-radius: 20rpx;
  padding: 20rpx;
  background: #fff;
}

.empty-title {
  font-size: 28rpx;
  color: #1d3f76;
  font-weight: 700;
}

.empty-desc {
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #5b7398;
  line-height: 1.6;
}

.plan-form-wrap {
  margin-top: 10rpx;
}

.plan-print-wrap {
  display: none;
}

.plan-table {
  --line-color: #8ea2c2;
  --head-bg: #eaf3ff;
  --area-bg: #f3f8ff;
  --type-bg: #ffffff;
  --value-bg: #ffffff;
  --area-w: 16%;
  --type-w: 24%;
  --value-w: 60%;
  border: 1rpx solid var(--line-color);
  border-bottom: none;
  background: #fffdf8;
  width: 100%;
  border-radius: 14rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 16rpx rgba(73, 112, 173, 0.08);
}

.plan-row {
  display: flex;
  border-bottom: 1rpx solid var(--line-color);
  min-height: 74rpx;
  align-items: stretch;
}

.plan-row.plan-head {
  background: var(--head-bg);
}

.plan-row.plan-head .col-flow,
.plan-row.plan-head .col-type,
.plan-row.plan-head .col-value {
  font-weight: 700;
  color: #1e2430;
  background: var(--head-bg);
  justify-content: center;
  text-align: center;
}

.plan-row.sub {
  margin-left: 0;
  width: 100%;
  border-left: none;
}

.col-flow {
  width: var(--area-w);
  border-right: 1rpx solid var(--line-color);
  font-size: 21rpx;
  line-height: 1.4;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  background: var(--area-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.col-flow.area-ghost,
.data-col-area.area-ghost,
.report-col-area.area-ghost {
  color: transparent;
}

.col-type {
  width: var(--type-w);
  border-right: 1rpx solid var(--line-color);
  font-size: 21rpx;
  line-height: 1.5;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  background: var(--type-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 600;
}

.col-value {
  width: var(--value-w);
  font-size: 21rpx;
  line-height: 1.6;
  color: #202832;
  padding: 8rpx 10rpx;
  box-sizing: border-box;
  white-space: pre-line;
  background: var(--value-bg);
}

.col-value.no-padding {
  padding: 0;
}

.inner-table {
  width: 100%;
  border-left: none;
}

.inner-title {
  font-size: 20rpx;
  color: #1f2733;
  font-weight: 700;
  padding: 8rpx 8rpx;
  border-bottom: 1rpx solid var(--line-color);
  background: #eef6ff;
  text-align: center;
}

.inner-head,
.inner-row {
  display: flex;
  border-bottom: 1rpx solid var(--line-color);
  min-height: 64rpx;
}

.inner-row:last-child {
  border-bottom: none;
}

.inner-col {
  font-size: 19rpx;
  line-height: 1.5;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  border-right: 1rpx solid var(--line-color);
  white-space: pre-line;
  display: flex;
  align-items: center;
}

.inner-head .inner-col {
  font-weight: 700;
  color: #1e2430;
  background: #f2f8ff;
  justify-content: center;
  text-align: center;
}

.inner-col:last-child {
  border-right: none;
}

.inner-col.name {
  width: 20%;
}

.inner-col.spec {
  width: 18%;
}

.inner-col.qty {
  width: 14%;
}

.inner-col.use {
  width: 48%;
}

.inner-col.type {
  width: 18%;
}

.inner-col.def {
  width: 20%;
}

.inner-col.material {
  width: 22%;
}

.inner-col.content {
  width: 40%;
}

.plan-blueprint-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
  padding: 10rpx;
  box-sizing: border-box;
}

.plan-blueprint-card {
  border: 1rpx solid var(--line-color);
  border-radius: 10rpx;
  background: #f8fbff;
  overflow: hidden;
}

.plan-blueprint-image {
  width: 100%;
  height: 220rpx;
  display: block;
  background: #eef5ff;
}

.plan-blueprint-empty {
  width: 100%;
  height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b84a4;
  font-size: 20rpx;
  background: #eef5ff;
}

.plan-blueprint-name {
  font-size: 19rpx;
  line-height: 1.45;
  color: #355882;
  padding: 8rpx 8rpx;
  border-top: 1rpx solid var(--line-color);
}

.data-form-wrap {
  margin-top: 10rpx;
}

.data-table {
  --line-color: #8ea2c2;
  --head-bg: #eaf3ff;
  --area-bg: #f3f8ff;
  --type-bg: #ffffff;
  --cond-bg: #ffffff;
  --area-w: 16%;
  --type-w: 24%;
  --cond-w: 60%;
  border: 1rpx solid var(--line-color);
  border-bottom: none;
  background: #fffdf8;
  width: 100%;
  border-radius: 14rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 16rpx rgba(73, 112, 173, 0.08);
}

.data-row {
  display: flex;
  border-bottom: 1rpx solid var(--line-color);
  min-height: 74rpx;
  align-items: stretch;
}

.data-row.data-head {
  background: var(--head-bg);
}

.data-row.sub {
  margin-left: 0;
  width: 100%;
  border-left: none;
}

.data-col-area {
  width: var(--area-w);
  border-right: 1rpx solid var(--line-color);
  font-size: 21rpx;
  line-height: 1.45;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  background: var(--area-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.data-col-type {
  width: var(--type-w);
  border-right: 1rpx solid var(--line-color);
  font-size: 21rpx;
  line-height: 1.5;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  background: var(--type-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 600;
}

.data-col-condition {
  width: var(--cond-w);
  font-size: 21rpx;
  line-height: 1.6;
  color: #202832;
  padding: 8rpx 10rpx;
  box-sizing: border-box;
  white-space: pre-line;
  background: var(--cond-bg);
}

.data-col-condition.no-padding {
  padding: 0;
}

.data-row.data-head .data-col-area,
.data-row.data-head .data-col-type,
.data-row.data-head .data-col-condition {
  font-weight: 700;
  color: #1e2430;
  background: var(--head-bg);
  justify-content: center;
  text-align: center;
}

.qualitative-wrap {
  width: 100%;
}

.qualitative-title {
  font-size: 20rpx;
  font-weight: 700;
  color: #1f2733;
  padding: 8rpx;
  border-bottom: 1rpx solid var(--line-color);
  background: #eef6ff;
  text-align: center;
}

.qualitative-table {
  width: 100%;
}

.qualitative-row {
  display: flex;
  border-bottom: 1rpx solid var(--line-color);
  min-height: 64rpx;
}

.qualitative-row:last-child {
  border-bottom: none;
}

.q-col {
  font-size: 19rpx;
  line-height: 1.55;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  border-right: 1rpx solid var(--line-color);
  white-space: pre-line;
  display: flex;
  align-items: center;
}

.qualitative-row.head .q-col {
  font-weight: 700;
  color: #1e2430;
  background: #f2f8ff;
  justify-content: center;
  text-align: center;
}

.q-col:last-child {
  border-right: none;
}

.q-col.model {
  width: 24%;
  justify-content: center;
  text-align: center;
}

.q-col.speed {
  width: 24%;
  justify-content: center;
  text-align: center;
}

.q-col.status {
  width: 52%;
}

.data-evidence-grid {
  padding: 10rpx;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(208rpx, 1fr));
  gap: 10rpx;
  box-sizing: border-box;
}

.data-evidence-card {
  border: 1rpx solid #cddcf0;
  border-radius: 10rpx;
  background: #f8fbff;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(73, 112, 173, 0.1);
}

.data-evidence-image {
  width: 100%;
  height: 170rpx;
  display: block;
  background: #edf5ff;
}

.data-evidence-name {
  padding: 8rpx 10rpx;
  font-size: 18rpx;
  line-height: 1.4;
  color: #355882;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-evidence-empty {
  padding: 14rpx 12rpx;
  font-size: 19rpx;
  line-height: 1.5;
  color: #6a7e98;
}

.report-form-wrap {
  margin-top: 10rpx;
}

.report-table {
  --line-color: #8ea2c2;
  --head-bg: #eaf3ff;
  --area-bg: #f3f8ff;
  --type-bg: #ffffff;
  --cond-bg: #ffffff;
  --area-w: 14%;
  --type-w: 20%;
  --cond-w: 66%;
  border: 1rpx solid var(--line-color);
  border-bottom: none;
  background: #fffdf8;
  width: 100%;
  border-radius: 14rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 16rpx rgba(73, 112, 173, 0.08);
}

.report-row {
  display: flex;
  border-bottom: 1rpx solid var(--line-color);
  min-height: 74rpx;
  align-items: stretch;
}

.report-row.sub {
  margin-left: 0;
  width: 100%;
  border-left: none;
}

.report-row.report-head {
  background: var(--head-bg);
}

.report-col-area {
  width: var(--area-w);
  border-right: 1rpx solid var(--line-color);
  font-size: 21rpx;
  line-height: 1.45;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  background: var(--area-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: pre-line;
}

.report-col-type {
  width: var(--type-w);
  border-right: 1rpx solid var(--line-color);
  font-size: 21rpx;
  line-height: 1.5;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  background: var(--type-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  white-space: pre-line;
}

.report-col-condition {
  width: var(--cond-w);
  font-size: 21rpx;
  line-height: 1.65;
  color: #202832;
  padding: 8rpx 10rpx;
  box-sizing: border-box;
  white-space: pre-line;
  background: var(--cond-bg);
}

.report-col-condition.no-padding {
  padding: 0;
}

.report-row.report-head .report-col-area,
.report-row.report-head .report-col-type,
.report-row.report-head .report-col-condition {
  font-weight: 700;
  color: #1e2430;
  background: var(--head-bg);
  justify-content: center;
  text-align: center;
}

.report-inner-wrap {
  width: 100%;
}

.report-inner-title {
  font-size: 20rpx;
  color: #1f2733;
  font-weight: 700;
  padding: 8rpx;
  border-bottom: 1rpx solid var(--line-color);
  background: #eef6ff;
  text-align: center;
}

.report-inner-table {
  width: 100%;
}

.report-inner-row {
  display: flex;
  border-bottom: 1rpx solid var(--line-color);
  min-height: 64rpx;
}

.report-inner-row:last-child {
  border-bottom: none;
}

.ri-col {
  font-size: 19rpx;
  line-height: 1.6;
  color: #1f2733;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
  border-right: 1rpx solid var(--line-color);
  white-space: pre-line;
  display: flex;
  align-items: center;
}

.report-inner-row.head .ri-col {
  font-weight: 700;
  color: #1e2430;
  background: #f2f8ff;
  justify-content: center;
  text-align: center;
}

.ri-col:last-child {
  border-right: none;
}

.ri-col.model {
  width: 24%;
  justify-content: center;
  text-align: center;
}

.ri-col.speed {
  width: 24%;
  justify-content: center;
  text-align: center;
}

.ri-col.status {
  width: 52%;
}

/* 页面级微调：记录详情（屏幕显示） */
@media screen {
  .page {
    --kid-video-max-width: 620rpx;
    --kid-video-height: 250rpx;
    padding: 18rpx;
  }

  .top-row {
    gap: 10rpx;
  }

  .back-btn,
  .print-btn {
    font-size: 24rpx;
    padding: 10rpx 18rpx;
  }

  .header-card {
    margin-top: 10rpx;
    border-radius: 18rpx;
    padding: 18rpx;
  }

  .header-title {
    font-size: 33rpx;
  }

  .meta-item {
    font-size: 24rpx;
  }

  .summary-box {
    font-size: 24rpx;
    line-height: 1.65;
    padding: 12rpx 14rpx;
  }

  .section-list {
    margin-top: 12rpx;
    gap: 10rpx;
  }

  .section-card {
    border-radius: 16rpx;
    padding: 14rpx;
  }

  .section-title {
    font-size: 27rpx;
  }

  .section-toggle {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
  }

  .section-content {
    font-size: 24rpx;
  }

  .plan-row,
  .data-row,
  .report-row {
    min-height: 78rpx;
  }

  .col-flow,
  .col-type,
  .col-value,
  .data-col-area,
  .data-col-type,
  .data-col-condition,
  .report-col-area,
  .report-col-type,
  .report-col-condition {
    font-size: 22rpx;
  }

  .inner-title,
  .qualitative-title,
  .report-inner-title {
    font-size: 22rpx;
  }

  .inner-col,
  .q-col,
  .ri-col {
    font-size: 20rpx;
  }
}

@media screen and (max-width: 900px) and (orientation: portrait) {
  .page {
    --kid-video-max-width: 660rpx;
    --kid-video-height: 278rpx;
    padding: 16rpx;
  }

  .header-title {
    font-size: 35rpx;
  }

  .section-title {
    font-size: 28rpx;
  }
}

@media screen and (min-width: 901px) and (orientation: landscape) {
  .page {
    --kid-video-max-width: 540rpx;
    --kid-video-height: 206rpx;
    padding: 14rpx 20rpx;
  }

  .section-card {
    padding: 12rpx;
  }

  .plan-row,
  .data-row,
  .report-row {
    min-height: 70rpx;
  }
}

/* 打印版样式：A4 导出友好、细边框、固定行高、减少装饰元素 */
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    background: #fff !important;
    min-height: auto;
    padding: 0;
    width: 100% !important;
    overflow: visible !important;
  }

  .top-row,
  .section-toggle,
  .ai-chat-print-hidden {
    display: none !important;
  }

  :global(uni-page-head),
  :global(.uni-page-head),
  :global(.uni-page-head-hd),
  :global(.uni-page-head-bd),
  :global(.uni-page-head-title),
  :global(.uni-page-head-btn) {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }

  :global(uni-page),
  :global(uni-page-wrapper),
  :global(uni-page-body),
  :global(.uni-page-wrapper),
  :global(.uni-page-body) {
    top: 0 !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }

  .header-card,
  .section-card {
    box-shadow: none;
    border: 1px solid #666;
    border-radius: 0;
    background: #fff !important;
  }

  .header-card {
    margin-top: 0;
    margin-bottom: 8px;
    padding: 8px 10px;
  }

  .header-title {
    font-size: 16px;
    line-height: 1.35;
    color: #000;
  }

  .meta-item,
  .summary-box {
    color: #222;
    font-size: 12px;
    line-height: 1.5;
  }

  .summary-box {
    background: #fff;
    border-radius: 0;
    border: 1px solid #777;
    margin-top: 6px;
    padding: 6px 8px;
  }

  .section-list {
    gap: 8px;
    margin-top: 0;
    display: block;
  }

  .section-card {
    margin: 0 0 8px 0;
    padding: 6px;
    page-break-inside: auto;
    break-inside: auto;
  }

  .section-head {
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
  }

  .section-title {
    font-size: 13px;
    color: #000;
  }

  .plan-form-wrap {
    display: none !important;
  }

  .plan-print-wrap {
    display: block !important;
    width: 190mm;
    max-width: 100%;
    margin: 0 auto;
    color: #000;
  }

  .print-block {
    border: 0.6px solid #333;
    border-bottom: none;
    margin: 0 0 6px 0;
    background: #fff !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .print-block-long {
    break-inside: auto;
    page-break-inside: auto;
  }

  .print-block-title {
    font-size: 12px;
    line-height: 1.35;
    font-weight: 700;
    text-align: center;
    color: #000;
    background: #f2f2f2 !important;
    border-bottom: 0.6px solid #333;
    padding: 4px 6px;
  }

  .print-sub-title {
    font-size: 11px;
    line-height: 1.35;
    font-weight: 700;
    color: #000;
    background: #f7f7f7 !important;
    border-bottom: 0.6px solid #333;
    padding: 4px 6px;
  }

  .print-mini-table,
  .print-grid-table {
    width: 100%;
  }

  .print-mini-row,
  .print-grid-row {
    display: flex;
    min-height: 24px;
    border-bottom: 0.6px solid #333;
    align-items: stretch;
  }

  .print-mini-label,
  .print-mini-value,
  .print-grid-col,
  .print-text-value {
    font-size: 10.5px;
    line-height: 1.45;
    color: #000;
    box-sizing: border-box;
    white-space: pre-line;
  }

  .print-mini-label {
    flex: 0 0 26%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: 700;
    background: #f7f7f7 !important;
    border-right: 0.6px solid #333;
    padding: 3px 4px;
  }

  .print-mini-value {
    flex: 1;
    padding: 3px 5px;
  }

  .print-text-value {
    border-bottom: 0.6px solid #333;
    padding: 5px 6px;
    min-height: 24px;
  }

  .print-grid-head .print-grid-col {
    font-weight: 700;
    text-align: center;
    justify-content: center;
    background: #f2f2f2 !important;
  }

  .print-grid-col {
    display: flex;
    align-items: center;
    border-right: 0.6px solid #333;
    padding: 3px 4px;
  }

  .print-grid-col:last-child {
    border-right: none;
  }

  .print-grid-col.material-name {
    flex: 0 0 20%;
  }

  .print-grid-col.material-spec {
    flex: 0 0 18%;
  }

  .print-grid-col.material-qty {
    flex: 0 0 12%;
    justify-content: center;
    text-align: center;
  }

  .print-grid-col.material-use {
    flex: 1;
  }

  .print-grid-col.variable-type {
    flex: 0 0 18%;
  }

  .print-grid-col.variable-def {
    flex: 0 0 20%;
  }

  .print-grid-col.variable-material {
    flex: 0 0 22%;
  }

  .print-grid-col.variable-content {
    flex: 1;
  }

  .print-blueprint-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 4px;
    border-bottom: 0.6px solid #333;
    background: #fff !important;
    box-sizing: border-box;
  }

  .print-blueprint-card {
    border: 0.6px solid #555;
    background: #fff !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .print-blueprint-image,
  .print-blueprint-empty {
    width: 100% !important;
    height: 26mm !important;
    max-height: 26mm !important;
    display: flex;
    align-items: center;
    justify-content: center;
    object-fit: contain !important;
    background: #fff !important;
    color: #333;
    font-size: 10px;
  }

  .print-blueprint-name {
    border-top: 0.6px solid #555;
    padding: 3px 4px;
    font-size: 10px;
    line-height: 1.35;
    color: #000;
    white-space: normal;
  }

  .plan-table,
  .data-table,
  .report-table {
    width: 190mm;
    max-width: 100%;
    margin: 0 auto;
    border: 0.6px solid #333;
    border-bottom: none;
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
    background: #fff !important;
  }

  .plan-row,
  .data-row,
  .report-row {
    min-height: 24px;
    border-bottom: 0.6px solid #333;
    align-items: stretch;
    break-inside: auto;
    page-break-inside: auto;
  }

  .plan-row.plan-head,
  .data-row.data-head,
  .report-row.report-head {
    min-height: 26px;
    background: #f2f2f2 !important;
  }

  .plan-row.sub {
    margin-left: 0;
  }

  .data-row.sub {
    margin-left: 0;
  }

  .report-row.sub {
    margin-left: 0;
  }

  .col-flow,
  .data-col-area,
  .report-col-area {
    width: auto;
    border-right: 0.6px solid #333;
    background: #f7f7f7 !important;
    font-size: 10.5px;
    color: #000;
    padding: 3px 2px;
    line-height: 1.35;
    justify-content: center;
    text-align: center;
  }

  .col-flow,
  .data-col-area {
    flex: 0 0 16%;
  }

  .report-col-area {
    flex: 0 0 14%;
  }

  .col-type,
  .data-col-type,
  .report-col-type {
    width: auto;
    border-right: 0.6px solid #333;
    background: #fff !important;
    font-size: 10.5px;
    color: #000;
    padding: 3px 2px;
    line-height: 1.35;
    justify-content: center;
    text-align: center;
    font-weight: 600;
  }

  .col-type,
  .data-col-type {
    flex: 0 0 24%;
  }

  .report-col-type {
    flex: 0 0 20%;
  }

  .col-value,
  .data-col-condition,
  .report-col-condition {
    width: auto;
    font-size: 10.5px;
    color: #000;
    line-height: 1.42;
    padding: 3px 4px;
  }

  .col-value,
  .data-col-condition {
    flex: 0 0 60%;
  }

  .report-col-condition {
    flex: 0 0 66%;
  }

  .inner-title,
  .qualitative-title,
  .report-inner-title {
    font-size: 10.5px;
    color: #000;
    background: #f2f2f2 !important;
    border-bottom: 0.6px solid #333;
    padding: 3px 4px;
    text-align: center;
  }

  .inner-head,
  .inner-row,
  .qualitative-row,
  .report-inner-row {
    min-height: 22px;
    border-bottom: 0.6px solid #333;
    break-inside: auto;
    page-break-inside: auto;
  }

  .inner-col,
  .q-col,
  .ri-col {
    font-size: 10px;
    color: #000;
    line-height: 1.32;
    border-right: 0.6px solid #333;
    padding: 2px 3px;
  }

  .inner-head .inner-col,
  .qualitative-row.head .q-col,
  .report-inner-row.head .ri-col {
    background: #f2f2f2 !important;
    color: #000;
  }

  .inner-table,
  .qualitative-table,
  .report-inner-table,
  .plan-blueprint-grid,
  .data-evidence-grid {
    break-inside: auto;
    page-break-inside: auto;
  }

  .plan-blueprint-grid,
  .data-evidence-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 4px;
    background: #fff !important;
  }

  .plan-blueprint-card,
  .data-evidence-card {
    border: 0.6px solid #555;
    border-radius: 0;
    box-shadow: none;
    background: #fff !important;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .plan-blueprint-image,
  .plan-blueprint-empty,
  .data-evidence-image {
    width: 100% !important;
    height: 24mm !important;
    max-height: 24mm !important;
    display: block;
    object-fit: contain !important;
    background: #fff !important;
  }

  .plan-blueprint-name,
  .data-evidence-name {
    padding: 3px 4px;
    font-size: 10px;
    line-height: 1.35;
    color: #000;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    border-top: 0.6px solid #555;
  }

  .data-evidence-empty {
    padding: 6px;
    font-size: 10px;
    color: #333;
  }
}
</style>

<style>
@media print {
  uni-page-head,
  .uni-page-head,
  .uni-page-head-hd,
  .uni-page-head-bd,
  .uni-page-head-title,
  .uni-page-head-btn {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }

  uni-page,
  uni-page-wrapper,
  uni-page-body,
  .uni-page-wrapper,
  .uni-page-body {
    top: 0 !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>
