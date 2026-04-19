import { getExperimentConfig } from './registry/experiment-registry.js';

const FALLBACK_ID = 'engineering-01';
const deepClone = (value) => JSON.parse(JSON.stringify(value || {}));

export const getEngineeringFlowTemplate = (experimentId) => {
  const config = getExperimentConfig(experimentId) || getExperimentConfig(FALLBACK_ID);
  return deepClone((config && config.flowTemplate) || {});
};
