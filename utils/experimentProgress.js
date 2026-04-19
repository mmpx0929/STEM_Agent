const STORAGE_KEY = 'experiment_progress';
const ACHIEVEMENTS_KEY = 'achievements';

/**
 * 辅助函数：检查单个实验进度对象是否完成
 */
const isProgressComplete = (progress) => {
  if (!progress) return false;
  return progress.principleLearned && 
         progress.planCompleted && 
         progress.virtualLabCompleted && 
         progress.dataUploaded;
};

// 徽章定义
export const BADGES = [
  {
    id: 'first_explorer',
    name: '探索新星',
    description: '完成任意1个实验',
    icon: '/static/project-common/images/badges/explorer.png', 
    condition: (allProgress) => {
      return Object.values(allProgress).some(p => isProgressComplete(p));
    }
  },
  {
    id: 'theory_master',
    name: '理论大师',
    description: '完成所有实验原理学习',
    icon: '/static/project-common/images/badges/science.png',
    condition: (allProgress) => {
      const allIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      return allIds.every(id => allProgress[id] && allProgress[id].principleLearned);
    }
  },
  {
    id: 'virtual_expert',
    name: '实践专家',
    description: '完成所有虚拟实验',
    icon: '/static/project-common/images/badges/engineering.png',
    condition: (allProgress) => {
      const allIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      return allIds.every(id => allProgress[id] && allProgress[id].virtualLabCompleted);
    }
  },
  {
    id: 'perseverance_star',
    name: '毅力之星',
    description: '累计3天进行实验', 
    icon: '/static/project-common/images/badges/time.png',
    condition: (allProgress) => {
      const dates = new Set();
      Object.values(allProgress).forEach(p => {
        if (p.lastUpdated) {
          const date = new Date(p.lastUpdated).toDateString();
          dates.add(date);
        }
      });
      return dates.size >= 3; 
    }
  },
  {
    id: 'ultimate_master',
    name: '终极大师',
    description: '完成所有实验',
    icon: '/static/project-common/images/badges/master.png',
    condition: (allProgress) => {
      const allIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      return allIds.every(id => allProgress[id] && isProgressComplete(allProgress[id]));
    }
  }
];

/**
 * 获取所有成就
 */
export const getAchievements = () => {
  try {
    const achievements = uni.getStorageSync(ACHIEVEMENTS_KEY);
    return achievements || { badges: [] };
  } catch (e) {
    console.error('获取成就失败', e);
    return { badges: [] };
  }
};

/**
 * 检查并更新成就
 */
export const checkAchievements = () => {
  const allProgress = getAllProgress();
  const currentAchievements = getAchievements();
  const earnedBadgeIds = new Set(currentAchievements.badges.map(b => b.id));
  let newBadgeEarned = false;

  BADGES.forEach(badge => {
    if (!earnedBadgeIds.has(badge.id)) {
      if (badge.condition(allProgress)) {
        currentAchievements.badges.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          date: new Date().toLocaleDateString()
        });
        newBadgeEarned = true;
        uni.showToast({
          title: `获得徽章：${badge.name}`,
          icon: 'success',
          duration: 3000
        });
      }
    }
  });

  if (newBadgeEarned) {
    try {
      uni.setStorageSync(ACHIEVEMENTS_KEY, currentAchievements);
    } catch (e) {
      console.error('保存成就失败', e);
    }
  }
};

/**
 * 获取所有实验进度
 * @returns {Object} 进度对象
 */
export const getAllProgress = () => {
  try {
    const progress = uni.getStorageSync(STORAGE_KEY);
    return progress || {};
  } catch (e) {
    console.error('获取实验进度失败', e);
    return {};
  }
};

/**
 * 获取指定实验的进度
 * @param {string} experimentId 实验ID
 * @returns {Object} 实验进度
 */
export const getExperimentProgress = (experimentId) => {
  const allProgress = getAllProgress();
  return allProgress[experimentId] || {
    principleLearned: false, // 实验原理学习完成
    planCompleted: false,    // 实验设计单完成
    virtualLabCompleted: false, // 虚拟实验完成
    dataUploaded: false,     // 实际实验数据上传完成
    lastUpdated: 0
  };
};

/**
 * 更新实验进度
 * @param {string} experimentId 实验ID
 * @param {string} stage 阶段 (principle, plan, virtual, data)
 * @param {boolean} status 完成状态
 */
export const updateExperimentProgress = (experimentId, stage, status = true) => {
  const allProgress = getAllProgress();
  
  if (!allProgress[experimentId]) {
    allProgress[experimentId] = {
      principleLearned: false,
      planCompleted: false,
      virtualLabCompleted: false,
      dataUploaded: false
    };
  }
  
  const stageMap = {
    'principle': 'principleLearned',
    'plan': 'planCompleted',
    'virtual': 'virtualLabCompleted',
    'data': 'dataUploaded'
  };
  
  const key = stageMap[stage];
  if (key) {
    allProgress[experimentId][key] = status;
    allProgress[experimentId].lastUpdated = Date.now();
    
    try {
      uni.setStorageSync(STORAGE_KEY, allProgress);
      console.log(`更新实验进度成功: ${experimentId} - ${stage} = ${status}`);
      
      // 检查成就
      checkAchievements();
    } catch (e) {
      console.error('保存实验进度失败', e);
    }
  } else {
    console.warn(`未知的实验阶段: ${stage}`);
  }
};

/**
 * 检查实验是否全部完成
 * @param {string} experimentId 实验ID
 * @returns {boolean} 是否全部完成
 */
export const isExperimentComplete = (experimentId) => {
  const progress = getExperimentProgress(experimentId);
  return progress.principleLearned && 
         progress.planCompleted && 
         progress.virtualLabCompleted && 
         progress.dataUploaded;
};

export default {
  getAllProgress,
  getExperimentProgress,
  updateExperimentProgress,
  isExperimentComplete,
  getAchievements,
  checkAchievements,
  BADGES
};

