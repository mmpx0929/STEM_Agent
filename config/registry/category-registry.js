import { getExperimentsByType } from './experiment-registry.js';

export const getCategoryRegistry = () => ([
  {
    key: 'science',
    emoji: '🔬',
    title: 'STEM 基础科学探究类实验',
    description: '观察现象、提出假设、验证变量，建立科学思维。',
    templateType: 'science',
    items: getExperimentsByType('science')
  },
  {
    key: 'engineering',
    emoji: '🛠️',
    title: 'STEM 工程实践类实验',
    description: '围绕原型设计、功能测试和结构优化开展实践。',
    templateType: 'engineering',
    items: getExperimentsByType('engineering')
  }
]);
