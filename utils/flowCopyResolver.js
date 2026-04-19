import { getExperimentConfig } from '@/config/registry/experiment-registry.js';
import { buildEngineeringFlowCopy, buildScienceFlowCopy } from '@/config/flow-copy-presets.js';

const normalizeTemplateType = (templateType) => (templateType === 'engineering' ? 'engineering' : 'science');
const hasText = (value) => String(value || '').trim().length > 0;

export const resolveFlowCopy = ({ experimentId, templateType } = {}) => {
  const config = experimentId ? getExperimentConfig(experimentId) : null;
  const resolvedType = normalizeTemplateType(templateType || (config && config.templateType) || 'science');
  const flowTemplate = (config && config.flowTemplate) || {};
  const templateRuleTips = flowTemplate.ruleTips || {};
  const overrides = (config && config.flowCopy) || {};

  return resolvedType === 'engineering'
    ? buildEngineeringFlowCopy(overrides, templateRuleTips)
    : buildScienceFlowCopy(overrides, templateRuleTips);
};

export const resolveFlowRuleTitle = (flowCopy, fallbackText = '') => {
  const title = flowCopy && flowCopy.tips && flowCopy.tips.ruleTitle;
  return hasText(title) ? title : fallbackText;
};

export const resolveFlowBlockerTitle = (
  flowCopy,
  isReady,
  fallbackReadyTitle = '',
  fallbackMissingTitle = ''
) => {
  const tips = (flowCopy && flowCopy.tips) || {};
  if (isReady) return hasText(tips.readyTitle) ? tips.readyTitle : fallbackReadyTitle;
  return hasText(tips.missingTitle) ? tips.missingTitle : fallbackMissingTitle;
};

export const resolveFlowStepRuleTip = (flowCopy, stepKey, fallbackText = '') => {
  const tips = (flowCopy && flowCopy.stepRuleTips) || {};
  const value = tips[stepKey];
  return hasText(value) ? value : fallbackText;
};

export const resolveFlowCompleteHint = (flowCopy, fallbackText = '') => {
  const text = flowCopy && flowCopy.stepAction && flowCopy.stepAction.completeAllText;
  return hasText(text) ? text : fallbackText;
};

export const resolveFlowReadyToNextHint = (flowCopy, nextTitle, fallbackTemplate = '') => {
  const template = flowCopy && flowCopy.stepAction && flowCopy.stepAction.toNextTemplate;
  if (hasText(template) && template.includes('{nextTitle}')) {
    return template.replace('{nextTitle}', nextTitle || '下一步');
  }
  if (hasText(template)) return template;
  return (fallbackTemplate || '').replace('{nextTitle}', nextTitle || '下一步');
};

export const resolveFlowStageTitle = (flowCopy, stepKey, fallbackText = '') => {
  const map = (flowCopy && flowCopy.stageTitleMap) || {};
  const value = map[stepKey];
  return hasText(value) ? value : fallbackText;
};

