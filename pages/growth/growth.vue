﻿<template>
  <view class="page">
    <view class="decor-stars">
      <text class="star star-1">⭐</text>
      <text class="star star-2">✨</text>
      <text class="star star-3">🎈</text>
      <text class="star star-4">🎯</text>
      <text class="star star-5">⭐</text>
      <text class="star star-6">✨</text>
    </view>

    <view class="decor-dots">
      <view class="dot dot-1"></view>
      <view class="dot dot-2"></view>
      <view class="dot dot-3"></view>
      <view class="dot dot-4"></view>
    </view>

    <view class="overview-card">
      <view class="overview-header">
        <text class="overview-icon">⭐</text>
        <view class="overview-title">综合能力</view>
      </view>
      <view class="overview-score-wrap">
        <text class="overview-score">{{ overview.overall }}</text>
        <text class="overview-percent">%</text>
      </view>
      <view class="overview-bar">
        <view class="overview-fill" :style="{ width: overview.overall + '%' }"></view>
      </view>
      <view class="overview-desc">已完成 {{ overview.completed }} 个实验，继续加油！</view>
    </view>

    <view class="ability-card" v-for="(ability, index) in abilityCards" :key="ability.key">
      <view class="ability-head">
        <view class="ability-name">
          <text class="ability-icon">{{ getAbilityIcon(index) }}</text>
          <text>{{ ability.name }}</text>
        </view>
        <view class="ability-value-wrap">
          <text class="ability-value">{{ ability.value }}</text>
          <text class="ability-percent">%</text>
        </view>
      </view>
      <view class="ability-desc">{{ ability.description }}</view>
      <view class="ability-bar">
        <view class="ability-fill" :style="{ width: ability.value + '%', background: getAbilityGradient(index) }">
          <view class="fill-star" v-if="ability.value >= 50">⭐</view>
        </view>
      </view>

      <view v-if="ability.children && ability.children.length > 0" class="child-list">
        <view class="child-item" v-for="child in ability.children" :key="child.key">
          <text class="child-icon">{{ getChildIcon(child.key) }}</text>
          <text class="child-name">{{ child.name }}</text>
          <text class="child-value">{{ child.value }}%</text>
        </view>
      </view>
    </view>

    <view class="progress-card">
      <view class="progress-title">
        <text class="title-icon">🧭</text>
        <text>实验进度映射（第一阶段）</text>
      </view>
      <view class="progress-item" v-for="item in progressItems" :key="item.id">
        <view class="progress-name">{{ item.title }}</view>
        <view class="progress-meta">
          <text class="meta-category">{{ item.categoryTitle }}</text>
          <text class="meta-percent">{{ item.percent }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: item.percent + '%' }">
            <text class="fill-icon" v-if="item.percent === 100">✅</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-space"></view>

    <view class="tab-bar">
      <view class="tab-item" @click="goHome">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item" @click="goRecord">
        <view class="tab-icon">📒</view>
        <view class="tab-text">我的记录</view>
      </view>
      <view class="tab-item active">
        <view class="tab-icon">🌟</view>
        <view class="tab-text">我的成长</view>
      </view>
    </view>

    <AIChat scene="general" :defaultOpen="false" guide-key="growth" />
  </view>
</template>

<script>
import AIChat from '@/pages/plan/components/AIChat.vue';
import catalog from '@/config/experiment-catalog.js';
import growthAbilities from '@/config/growth-abilities.js';
import { getAllProgress } from '@/utils/experimentProgress.js';
import { getRecordCenterData } from '@/utils/recordCenter.js';
import { getGrowthAbilityDashboard } from '@/utils/growthAbilityProgress.js';

const average = (values) => {
  if (!values || values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const normalizeId = (value) => String(value === null || value === undefined ? '' : value).trim();

const getProgressByExperiment = (allProgress, item) => {
  const byId = allProgress[normalizeId(item.id)];
  if (byId && typeof byId === 'object') return byId;
  const byLegacy = item.legacyId !== null && item.legacyId !== undefined
    ? allProgress[normalizeId(item.legacyId)]
    : null;
  if (byLegacy && typeof byLegacy === 'object') return byLegacy;
  return {};
};

const hasRecordForExperiment = (idSet, item) => {
  const id = normalizeId(item.id);
  const legacy = item.legacyId !== null && item.legacyId !== undefined
    ? normalizeId(item.legacyId)
    : '';
  return idSet.has(id) || (legacy ? idSet.has(legacy) : false);
};

const asExperimentIdSet = (rows = []) => {
  const set = new Set();
  rows.forEach((item) => {
    const id = normalizeId(item && item.experimentId);
    if (id) set.add(id);
  });
  return set;
};

export default {
  components: {
    AIChat
  },
  data() {
    return {
      abilityCards: [],
      progressItems: [],
      overview: {
        overall: 0,
        completed: 0,
        total: 0
      }
    };
  },
  onShow() {
    this.buildGrowthView();
  },
  methods: {
    getAbilityIcon(index) {
      const icons = ['🧠', '🔬', '🛠️', '⚙️'];
      return icons[index] || '✨';
    },
    getAbilityGradient(index) {
      const gradients = [
        'linear-gradient(90deg, #FF6B9D, #FFB347)',
        'linear-gradient(90deg, #4FACFE, #00F2FE)',
        'linear-gradient(90deg, #56AB2F, #A8E063)',
        'linear-gradient(90deg, #667eea, #764ba2)'
      ];
      return gradients[index] || gradients[0];
    },
    getChildIcon(key) {
      const iconMap = {
        reasoning: '🤔',
        design: '📐',
        handsOn: '🧪',
        dataAnalysis: '📊',
        reportMaking: '📝',
        engineeringDesign: '🧩',
        modelBuilding: '🔧',
        modelTesting: '📈',
        optimization: '♻️',
        engineeringReport: '📘'
      };
      return iconMap[key] || '📌';
    },
    buildGrowthView() {
      const allProgress = getAllProgress() || {};
      const recordCenter = getRecordCenterData();
      const abilityDashboard = getGrowthAbilityDashboard();

      const allExperiments = catalog.categories.reduce((list, category) => {
        const items = category.items.map((item) => ({
          ...item,
          categoryKey: category.key,
          categoryTitle: category.title
        }));
        return list.concat(items);
      }, []);

      const measurable = allExperiments.filter(
        (item) => item.categoryKey === 'science' || item.categoryKey === 'engineering'
      );
      const measurableTotal = measurable.length;

      const planSet = asExperimentIdSet(recordCenter.plans);
      const dataSet = asExperimentIdSet(recordCenter.data);
      const reportSet = asExperimentIdSet(recordCenter.reports);

      const progressItems = allExperiments.map((item) => {
        const p = getProgressByExperiment(allProgress, item);
        const donePrinciple = Boolean(p.principleLearned);
        const donePlan = Boolean(p.planCompleted) || hasRecordForExperiment(planSet, item);
        const doneVirtual = Boolean(p.virtualLabCompleted);
        const doneData = Boolean(p.dataUploaded) || hasRecordForExperiment(dataSet, item);
        const doneReport = hasRecordForExperiment(reportSet, item);

        const stepCount = [donePrinciple, donePlan, doneVirtual, doneData].filter(Boolean).length;
        const progressPercent = Math.round((stepCount / 4) * 100);

        return {
          id: item.id,
          title: item.title,
          categoryTitle: item.categoryTitle,
          percent: doneReport ? 100 : progressPercent
        };
      });

      this.abilityCards = growthAbilities.map((ability) => {
        const score = abilityDashboard.categories[ability.key] || { value: 0, children: {} };
        return {
          ...ability,
          value: clamp(Number(score.value) || 0, 0, 90),
          children: (ability.children || []).map((child) => ({
            ...child,
            value: clamp(Number(score.children[child.key]) || 0, 0, 90)
          }))
        };
      });

      const completedCount = progressItems.filter((item) => item.percent === 100).length;
      this.overview = {
        overall: clamp(Number(abilityDashboard.overall) || average(this.abilityCards.map((item) => item.value)), 0, 90),
        completed: completedCount,
        total: measurableTotal
      };
      this.progressItems = progressItems;
    },
    goHome() {
      uni.navigateTo({ url: '/pages/index/index' });
    },
    goRecord() {
      uni.navigateTo({ url: '/pages/record/record' });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 22rpx 22rpx 0;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 14% 8%, rgba(152, 251, 152, 0.25), transparent 28%),
    radial-gradient(circle at 88% 16%, rgba(135, 206, 250, 0.25), transparent 30%),
    radial-gradient(circle at 50% 50%, rgba(255, 182, 193, 0.15), transparent 40%),
    linear-gradient(180deg, #f0fff0 0%, #f0f8ff 46%, #fff5f8 100%);
  position: relative;
}

.decor-stars {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  font-size: 24rpx;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 { top: 10%; left: 10%; animation-delay: 0s; }
.star-2 { top: 20%; right: 15%; animation-delay: 0.3s; }
.star-3 { top: 35%; left: 5%; animation-delay: 0.6s; }
.star-4 { top: 50%; right: 10%; animation-delay: 0.9s; }
.star-5 { top: 65%; left: 15%; animation-delay: 1.2s; }
.star-6 { top: 80%; right: 20%; animation-delay: 1.5s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.decor-dots {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.dot {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
}

.dot-1 { top: 15%; left: 8%; background: #FFB6C1; animation-delay: 0s; }
.dot-2 { top: 25%; right: 12%; background: #87CEEB; animation-delay: 0.5s; }
.dot-3 { top: 45%; left: 5%; background: #98FB98; animation-delay: 1s; }
.dot-4 { top: 60%; right: 8%; background: #DDA0DD; animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20rpx) scale(1.2); }
}

.overview-card,
.ability-card,
.progress-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 22rpx rgba(255, 107, 157, 0.12);
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}

.overview-card {
  position: relative;
  background: linear-gradient(135deg, #FF6B9D 0%, #FFB347 30%, #87CEEB 60%, #98FB98 100%);
  background-size: 300% 300%;
  animation: rainbow 6s ease infinite;
  border-radius: 30rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 14rpx 34rpx rgba(255, 107, 157, 0.35);
  overflow: hidden;
  text-align: center;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.overview-icon {
  font-size: 42rpx;
  animation: bounce-soft 2s ease-in-out infinite;
}

@keyframes bounce-soft {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.overview-title {
  font-size: 48rpx;
  color: #fff;
  font-weight: 800;
  letter-spacing: 4rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.overview-score-wrap {
  margin: 20rpx 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4rpx;
}

.overview-score {
  font-size: 80rpx;
  color: #fff;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.overview-percent {
  font-size: 32rpx;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.overview-bar {
  margin: 20rpx 0;
  height: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.4);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.overview-fill {
  height: 100%;
  border-radius: 24rpx;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  transition: width 0.5s ease;
  box-shadow: 0 2rpx 4rpx rgba(255, 165, 0, 0.3);
}

.overview-desc {
  margin-top: 16rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.ability-card { margin-top: 16rpx; padding: 20rpx; }
.ability-head { display: flex; justify-content: space-between; align-items: center; }
.ability-name {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #D63384;
  font-weight: 700;
}

.ability-icon {
  font-size: 28rpx;
  animation: wobble 2s ease-in-out infinite;
}

@keyframes wobble {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.ability-value-wrap {
  display: flex;
  align-items: baseline;
}

.ability-value { font-size: 30rpx; color: #FF6B9D; font-weight: 700; }
.ability-percent { font-size: 20rpx; color: #FF6B9D; font-weight: 600; }

.ability-desc { margin-top: 8rpx; color: #8B5A2B; font-size: 23rpx; line-height: 1.6; }
.ability-bar { margin-top: 12rpx; height: 16rpx; border-radius: 16rpx; background: linear-gradient(90deg, #FFE4E9, #E8F4FD); overflow: hidden; }
.ability-fill {
  height: 100%;
  border-radius: 16rpx;
  position: relative;
  transition: width 0.5s ease;
}

.fill-star {
  position: absolute;
  right: 6rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12rpx;
}

.child-list {
  margin-top: 12rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}
.child-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 14rpx;
  border-bottom: 1rpx solid rgba(255, 182, 193, 0.2);
}
.child-item:last-child { border-bottom: 0; }
.child-icon { font-size: 20rpx; }
.child-name { flex: 1; font-size: 23rpx; color: #8B4513; }
.child-value { font-size: 23rpx; color: #FF6B9D; font-weight: 600; }

.progress-card { margin-top: 16rpx; padding: 20rpx; }
.overview-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  color: #D63384;
  font-weight: 700;
}

.title-icon {
  font-size: 28rpx;
  animation: bounce-soft 2s ease-in-out infinite;
}

.progress-item {
  margin-top: 12rpx;
  border: 2rpx solid rgba(135, 206, 250, 0.4);
  border-radius: 16rpx;
  padding: 14rpx;
  background: linear-gradient(135deg, #F0F8FF, #FFF5F8);
}
.progress-name { font-size: 25rpx; color: #8B4513; line-height: 1.5; font-weight: 600; }
.progress-meta { margin-top: 8rpx; display: flex; justify-content: space-between; }
.meta-category { color: #A0522D; font-size: 22rpx; }
.meta-percent { color: #FF6B9D; font-size: 22rpx; font-weight: 600; }
.progress-bar { margin-top: 10rpx; height: 12rpx; border-radius: 12rpx; background: linear-gradient(90deg, #E8F4FD, #FFE4E9); overflow: hidden; }
.progress-fill {
  height: 100%;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #4FACFE, #00F2FE);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4rpx;
  transition: width 0.5s ease;
}

.fill-icon {
  font-size: 10rpx;
}

.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 130rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, #fff 100%);
  border-top: 2rpx solid rgba(255, 182, 193, 0.3);
  box-shadow: 0 -8rpx 20rpx rgba(255, 107, 157, 0.1);
  display: flex;
  align-items: flex-start;
  padding-top: 12rpx;
  z-index: 100;
}
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4rpx; padding: 8rpx 0; }
.tab-icon { font-size: 36rpx; transition: transform 0.3s ease; }
.tab-item.active .tab-icon { animation: bounce-soft 1s ease-in-out infinite; }
.tab-text { font-size: 22rpx; color: #8B5A2B; padding: 4rpx 12rpx; border-radius: 999rpx; transition: all 0.3s ease; }
.tab-item.active .tab-text { color: #fff; background: linear-gradient(135deg, #FF6B9D, #FFB347); font-weight: 600; box-shadow: 0 3rpx 10rpx rgba(255, 107, 157, 0.4); }

.bottom-space { height: 150rpx; }
</style>


