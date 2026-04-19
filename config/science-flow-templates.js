import { getExperimentConfig } from './registry/experiment-registry.js';

const FALLBACK_ID = 'science-01';
const deepClone = (value) => JSON.parse(JSON.stringify(value || {}));

export const getScienceFlowTemplate = (experimentId) => {
  const config = getExperimentConfig(experimentId) || getExperimentConfig(FALLBACK_ID);
  return deepClone((config && config.flowTemplate) || {});
};
