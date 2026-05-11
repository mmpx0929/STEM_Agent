import { KID_COPY } from './kid-copy.js';

const deepClone = (value) => JSON.parse(JSON.stringify(value || {}));
const toObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

export const FLOW_COPY_COMMON_TIPS = {
  ruleTitle: KID_COPY.tips.ruleTitle,
  missingTitle: KID_COPY.tips.missingTitle,
  readyTitle: KID_COPY.tips.readyTitle,
  readyText: KID_COPY.tips.readyText
};

export const FLOW_COPY_COMMON_STEP_ACTION = {
  completeAllText: '全部步骤都完成了，点击“完成本次实验”吧。',
  toNextTemplate: '这一步已经完成，下一步去“{nextTitle}”。'
};

export const SCIENCE_DEFAULT_STEP_RULE_TIPS = {
  step1: '请先完整观看视频，再进行观察思考并填写假设。',
  step2: '请填写参与人员、实验日期、实验环境。',
  step3: '请填写科学问题与实验假设。',
  step4: '请选择且仅选择两个正确目标：研究甩干原因和转速对脱水的影响。',
  step5: '请选择正确的材料设计思路（逻辑1），并生成材料清单。',
  step6: '请先在变量控制表中完成至少一项选择，再进入下一步。',
  step7: '请按顺序完成 4 个实验大步骤，并点击“生成实验方案设计”。',
  step8: '请完成虚拟实验探究操作（模型搭建 + 低速/高速观察）。线下成果上传为可选项。',
  step9: '请先完成旋转速度对应现象选择，点击“生成数据记录与分析表”。',
  step10: '请完整填写现象、原理、效果与改进，并点击“生成实验结论报告”。'
};

export const ENGINEERING_DEFAULT_STEP_RULE_TIPS = {
  step1: '先观看场景视频，再确认核心问题。',
  step2: '请选择正确场景问题，并完成 AI 分析（选项A）。',
  step3: '请选择“离心力方案”，并完成 AI 分析（选项A）。',
  step4: '四类目标都要选择正确后，才可进入下一步。',
  step5: '点击一键生成工程方案表，并同步到记录中心。',
  step6: '请先完成最终成品“离心甩干机模型”，再标记第6步完成。',
  step7: '完成测试记录后，点击“生成数据记录表”。',
  step8: '至少保留一条“问题-方案-替换结构”的优化记录。',
  step9: '填写成果结论与反思并生成工程实践报告。'
};

export const SCIENCE_DEFAULT_STAGE_TITLE_MAP = {
  step1: '观察思考与假设',
  step2: '实验方案设计',
  step3: '实验方案设计',
  step4: '实验方案设计',
  step5: '实验方案设计',
  step6: '实验方案设计',
  step7: '实验方案设计',
  step8: '虚拟实验探究操作',
  step9: '数据记录与分析',
  step10: '实验结论报告'
};

export const ENGINEERING_DEFAULT_STAGE_TITLE_MAP = {
  step1: '场景问题导入',
  step2: '工程方案设计',
  step3: '工程方案设计',
  step4: '工程方案设计',
  step5: '工程方案设计',
  step6: '虚拟实验探究',
  step7: '测试与数据分析',
  step8: '迭代与优化',
  step9: '成果结论与反思'
};

const createDefaultFlowCopy = (templateType) => {
  if (templateType === 'engineering') {
    return {
      tips: deepClone(FLOW_COPY_COMMON_TIPS),
      stepAction: deepClone(FLOW_COPY_COMMON_STEP_ACTION),
      stepRuleTips: deepClone(ENGINEERING_DEFAULT_STEP_RULE_TIPS),
      stageTitleMap: deepClone(ENGINEERING_DEFAULT_STAGE_TITLE_MAP)
    };
  }
  return {
    tips: deepClone(FLOW_COPY_COMMON_TIPS),
    stepAction: deepClone(FLOW_COPY_COMMON_STEP_ACTION),
    stepRuleTips: deepClone(SCIENCE_DEFAULT_STEP_RULE_TIPS),
    stageTitleMap: deepClone(SCIENCE_DEFAULT_STAGE_TITLE_MAP)
  };
};

const mergeFlowCopy = (templateType, overrides = {}, templateRuleTips = {}) => {
  const base = createDefaultFlowCopy(templateType);
  const safeOverrides = toObject(overrides);
  const safeTemplateRuleTips = toObject(templateRuleTips);

  return {
    tips: {
      ...base.tips,
      ...toObject(safeOverrides.tips)
    },
    stepAction: {
      ...base.stepAction,
      ...toObject(safeOverrides.stepAction)
    },
    stepRuleTips: {
      ...base.stepRuleTips,
      ...safeTemplateRuleTips,
      ...toObject(safeOverrides.stepRuleTips)
    },
    stageTitleMap: {
      ...base.stageTitleMap,
      ...toObject(safeOverrides.stageTitleMap)
    }
  };
};

export const buildScienceFlowCopy = (overrides = {}, templateRuleTips = {}) =>
  mergeFlowCopy('science', overrides, templateRuleTips);

export const buildEngineeringFlowCopy = (overrides = {}, templateRuleTips = {}) =>
  mergeFlowCopy('engineering', overrides, templateRuleTips);
