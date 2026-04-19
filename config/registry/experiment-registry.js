import science01 from '../experiments/science-01.config.js';
import science02 from '../experiments/science-02.config.js';
import science03 from '../experiments/science-03.config.js';

import engineering01 from '../experiments/engineering-01.config.js';
import engineering02 from '../experiments/engineering-02.config.js';
import engineering03 from '../experiments/engineering-03.config.js';
import engineering04 from '../experiments/engineering-04.config.js';
import engineering05 from '../experiments/engineering-05.config.js';
import engineering06 from '../experiments/engineering-06.config.js';
import engineering07 from '../experiments/engineering-07.config.js';
import engineering08 from '../experiments/engineering-08.config.js';

const EXPERIMENT_CONFIGS = [
  science01,
  science02,
  science03,
  engineering01,
  engineering02,
  engineering03,
  engineering04,
  engineering05,
  engineering06,
  engineering07,
  engineering08
];

const ORDER = {
  science: ['science-01', 'science-02', 'science-03'],
  engineering: [
    'engineering-01',
    'engineering-02',
    'engineering-03',
    'engineering-04',
    'engineering-05',
    'engineering-06',
    'engineering-07',
    'engineering-08'
  ]
};

const byId = new Map(EXPERIMENT_CONFIGS.map((item) => [item.id, item]));

const deepClone = (value) => JSON.parse(JSON.stringify(value || {}));

export const getExperimentConfig = (experimentId) => {
  if (!experimentId) return null;
  const value = byId.get(experimentId);
  return value ? deepClone(value) : null;
};

export const getExperimentsByType = (templateType) => {
  const ids = ORDER[templateType] || [];
  return ids.map((id) => getExperimentConfig(id)).filter(Boolean);
};
