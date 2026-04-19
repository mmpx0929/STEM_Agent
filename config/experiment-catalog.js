import { APP_AI_NAME } from './app-constants.js';
import { getCategoryRegistry } from './registry/category-registry.js';

const HOME_VIDEO = '/static/Introductory-video/home.mp4';

const mapItem = (config) => ({
  id: config.id,
  legacyId: config.legacyId === null || config.legacyId === undefined ? null : config.legacyId,
  title: config.title,
  summary: config.summary,
  templateType: config.templateType,
  status: config.status || 'enabled',
  step1VideoUrl: (config.intro && config.intro.step1VideoUrl) || HOME_VIDEO
});

const categories = getCategoryRegistry().map((category) => ({
  key: category.key,
  emoji: category.emoji,
  title: category.title,
  description: category.description,
  templateType: category.templateType,
  items: (category.items || []).map(mapItem)
}));

const experimentCatalog = {
  projectTitle: 'S+STEM 项目制洗衣机探索与设计主题',
  projectSubtitle: `和 ${APP_AI_NAME} 一起，从科学探究走向工程实践。`,
  featuredVideoTitle: '主题导学视频',
  featuredVideoDesc: '点击播放主题导学视频。',
  categories,
  featuredVideoUrl: HOME_VIDEO,
  step1GuideVideoUrl: HOME_VIDEO
};

export default experimentCatalog;
