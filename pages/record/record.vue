﻿﻿﻿﻿<template>
  <view class="page">
    <view class="decor-shapes">
      <text class="shape shape-1">📝</text>
      <text class="shape shape-2">🔬</text>
      <text class="shape shape-3">📊</text>
    </view>

    <view class="header-card">
      <view class="header-icon">📋</view>
      <view class="header-title">{{ i18n.pageTitle }}</view>
      <view class="header-subtitle">{{ i18n.pageSubtitle }}</view>
    </view>

    <view class="tab-card">
      <view
        class="tab-item"
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text class="tab-icon">{{ getTabIcon(tab.key) }}</text>
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="content-card">
      <view class="content-count">
        <text class="count-icon">📌</text>
        <text>{{ i18n.countPrefix }}{{ currentList.length }}{{ currentTabLabel }}</text>
      </view>

      <view v-if="currentList.length > 0">
        <view
          class="record-item"
          v-for="record in currentList"
          :key="record.type + '-' + record.id"
        >
          <view class="record-main" @click="openDetail(record)">
            <view class="record-icon">{{ getRecordIcon(record.type) }}</view>
            <view class="record-content">
              <view class="record-name">{{ record.experimentName }}</view>
              <view class="record-meta">
                <text class="meta-date">📅 {{ formatDate(record.date) }}</text>
                <text class="record-status">{{ record.status }}</text>
              </view>
              <view class="record-summary">{{ record.summary }}</view>
            </view>
          </view>
          <view class="record-actions">
            <view class="action-btn action-view" @click="openDetail(record)">
              <text class="btn-icon">👁️</text>
              <text>{{ i18n.viewBtn }}</text>
            </view>
            <view class="action-btn action-delete" @click="removeOne(record)">
              <text class="btn-icon">🗑️</text>
              <text>{{ i18n.deleteBtn }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-box">
        <view class="empty-icon">📭</view>
        <view class="empty-title">{{ i18n.emptyPrefix }}{{ currentTabLabel }}</view>
        <view class="empty-desc">{{ i18n.emptyDesc }}</view>
        <view class="empty-decor">
          <text>🔬</text>
          <text>🧪</text>
          <text>⚗️</text>
        </view>
      </view>
    </view>

    <view class="bottom-space"></view>

    <view class="tab-bar">
      <view class="tab-nav-item" @click="goHome">
        <view class="tab-icon">🏠</view>
        <view class="tab-nav-text">{{ i18n.homeNav }}</view>
      </view>
      <view class="tab-nav-item active">
        <view class="tab-icon">📋</view>
        <view class="tab-nav-text">{{ i18n.recordNav }}</view>
      </view>
      <view class="tab-nav-item" @click="goGrowth">
        <view class="tab-icon">🌱</view>
        <view class="tab-nav-text">{{ i18n.growthNav }}</view>
      </view>
    </view>

    <AIChat scene="general" :defaultOpen="false" guide-key="record" />
  </view>
</template>

<script>
import AIChat from '@/pages/plan/components/AIChat.vue';
import { getRecordCenterData, removeRecord } from '@/utils/recordCenter.js';

const I18N = {
  pageTitle: '\ud83d\udcd8 \u6211\u7684\u5b9e\u9a8c\u8bb0\u5f55', // 页面标题：我的实验记录
  pageSubtitle: '\u628a\u65b9\u6848\u3001\u6570\u636e\u548c\u7ed3\u8bba\u90fd\u6536\u8fdb\u6210\u957f\u6863\u6848\u518c\u3002', // 页面副标题
  tabPlans: '\u5b9e\u9a8c\u65b9\u6848\u8bbe\u8ba1', // 标签页：实验方案设计
  tabData: '\u6570\u636e\u8bb0\u5f55', // 标签页：数据记录
  tabReports: '\u7ed3\u8bba\u62a5\u544a', // 标签页：结论报告
  countPrefix: '\u5171 ', // 数量前缀
  viewBtn: '\u67e5\u770b\u8be6\u60c5', // 查看详情按钮
  deleteBtn: '\u5220\u9664', // 删除按钮
  emptyPrefix: '\ud83d\udced \u6682\u65e0', // 空状态前缀
  emptyDesc: '\u7ee7\u7eed\u5b8c\u6210\u5b9e\u9a8c\u6d41\u7a0b\u540e\uff0c\u8fd9\u91cc\u4f1a\u81ea\u52a8\u51fa\u73b0\u8bb0\u5f55\u3002', // 空状态描述
  homeNav: '\u9996\u9875', // 首页导航
  recordNav: '\u6211\u7684\u5b9e\u9a8c\u8bb0\u5f55', // 记录导航
  growthNav: '\u6211\u7684\u6210\u957f', // 成长导航
  noDate: '\u672a\u8bb0\u5f55\u65f6\u95f4', // 无日期提示
  mappedNoDelete: '\u8be5\u8bb0\u5f55\u4e3a\u6620\u5c04\u6570\u636e\uff0c\u6682\u4e0d\u652f\u6301\u5220\u9664', // 映射数据不可删除提示
  deleteTitle: '\u5220\u9664\u786e\u8ba4', // 删除确认弹窗标题
  deleteContent: '\u786e\u8ba4\u5220\u9664\u8fd9\u6761\u8bb0\u5f55\u5417\uff1f', // 删除确认弹窗内容
  deleteFailed: '\u5220\u9664\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5', // 删除失败提示
  deleteDone: '\u5220\u9664\u6210\u529f', // 删除成功提示
  fallbackLabel: '\u8bb0\u5f55' // 记录回退文本
};

export default {
  components: { AIChat },
  data() {
    return {
      tabs: [
        { key: 'plans', label: I18N.tabPlans },
        { key: 'data', label: I18N.tabData },
        { key: 'reports', label: I18N.tabReports }
      ],
      activeTab: 'plans',
      recordCenter: {
        plans: [],
        data: [],
        reports: []
      }
    };
  },
  computed: {
    i18n() {
      return I18N;
    },
    currentList() {
      if (this.activeTab === 'plans') return this.recordCenter.plans;
      if (this.activeTab === 'data') return this.recordCenter.data;
      return this.recordCenter.reports;
    },
    currentTabLabel() {
      const current = this.tabs.find((item) => item.key === this.activeTab);
      return current ? current.label : I18N.fallbackLabel;
    }
  },
  onShow() {
    this.loadCenterData();
  },
  methods: {
    getTabIcon(key) {
      const iconMap = {
        plans: '📝',
        data: '📊',
        reports: '📄'
      };
      return iconMap[key] || '📋';
    },
    getRecordIcon(type) {
      const iconMap = {
        plan: '📝',
        data: '📊',
        report: '📄'
      };
      return iconMap[type] || '📋';
    },
    loadCenterData() {
      this.recordCenter = getRecordCenterData();
    },
    switchTab(tab) {
      this.activeTab = tab;
    },
    formatDate(value) {
      if (!value) return I18N.noDate;
      return value;
    },
    openDetail(record) {
      if (!record) return;
      const type = encodeURIComponent(record.type || '');
      const id = encodeURIComponent(record.id || '');
      uni.navigateTo({
        url: `/pages/record/detail?type=${type}&id=${id}`
      });
    },
    removeOne(record) {
      if (!record || record.canDelete === false) {
        uni.showToast({
          title: I18N.mappedNoDelete,
          icon: 'none',
          duration: 1800
        });
        return;
      }

      uni.showModal({
        title: I18N.deleteTitle,
        content: I18N.deleteContent,
        success: (res) => {
          if (!res.confirm) return;
          const success = removeRecord(record);
          if (!success) {
            uni.showToast({ title: I18N.deleteFailed, icon: 'none' });
            return;
          }
          this.loadCenterData();
          uni.showToast({ title: I18N.deleteDone, icon: 'success' });
        }
      });
    },
    goHome() {
      uni.navigateTo({ url: '/pages/index/index' });
    },
    goGrowth() {
      uni.navigateTo({ url: '/pages/growth/growth' });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 22rpx 22rpx 0;
  background:
    radial-gradient(circle at 18% 8%, rgba(255, 182, 193, 0.25), transparent 26%),
    radial-gradient(circle at 86% 20%, rgba(135, 206, 250, 0.22), transparent 28%),
    radial-gradient(circle at 50% 70%, rgba(221, 160, 221, 0.18), transparent 35%),
    linear-gradient(180deg, #fff5f8 0%, #edf5ff 52%, #f8fffb 100%);
  box-sizing: border-box;
  position: relative;
}

.decor-shapes {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  font-size: 32rpx;
  opacity: 0.4;
  animation: float 3s ease-in-out infinite;
}

.shape-1 { top: 20rpx; left: 10%; animation-delay: 0s; }
.shape-2 { top: 40rpx; right: 15%; animation-delay: 0.5s; }
.shape-3 { top: 80rpx; left: 30%; animation-delay: 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15rpx) rotate(5deg); }
}

.header-card,
.tab-card,
.content-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 22rpx rgba(255, 107, 157, 0.12);
  border: 2rpx solid rgba(255, 182, 193, 0.3);
}

.header-card {
  position: relative;
  background: linear-gradient(135deg, #FF6B9D 0%, #FFB347 30%, #87CEEB 60%, #98FB98 100%);
  background-size: 300% 300%;
  animation: rainbow 6s ease infinite;
  border-radius: 30rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 14rpx 34rpx rgba(255, 107, 157, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.header-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
  animation: bounce-soft 2s ease-in-out infinite;
}

@keyframes bounce-soft {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.header-title {
  font-size: 36rpx;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  text-align: center;
  font-weight: 700;
}

.header-subtitle {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.tab-card {
  margin-top: 16rpx;
  padding: 10rpx;
  display: flex;
  gap: 10rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  text-align: center;
  border-radius: 16rpx;
  padding: 14rpx 6rpx;
  font-size: 23rpx;
  color: #8B5A2B;
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.tab-icon {
  font-size: 22rpx;
}

.tab-item.active {
  color: #fff;
  background: linear-gradient(135deg, #FF6B9D, #FFB347);
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.content-card {
  margin-top: 16rpx;
  padding: 20rpx;
}

.content-count {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #8B5A2B;
  font-size: 22rpx;
  margin-bottom: 14rpx;
}

.count-icon {
  font-size: 20rpx;
}

.record-item {
  border: 2rpx solid rgba(135, 206, 250, 0.4);
  border-radius: 20rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #F0F8FF, #FFF5F8);
  margin-bottom: 14rpx;
  transition: all 0.3s ease;
}

.record-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.2);
}

.record-main {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding-bottom: 12rpx;
}

.record-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB6C1, #87CEEB);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(255, 182, 193, 0.4);
}

.record-content {
  flex: 1;
  min-width: 0;
}

.record-name {
  font-size: 26rpx;
  color: #8B4513;
  font-weight: 600;
  line-height: 1.5;
}

.record-meta {
  margin-top: 8rpx;
  font-size: 22rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-date {
  color: #A0522D;
}

.record-status {
  color: #2E8B57;
  font-weight: 600;
  background: rgba(46, 139, 87, 0.1);
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
}

.record-summary {
  margin-top: 8rpx;
  color: #8B5A2B;
  font-size: 23rpx;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.record-actions {
  border-top: 2rpx solid rgba(255, 182, 193, 0.3);
  padding-top: 12rpx;
  display: flex;
  gap: 12rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  font-size: 22rpx;
  border-radius: 999rpx;
  padding: 10rpx 0;
  transition: all 0.3s ease;
}

.btn-icon {
  font-size: 20rpx;
}

.action-view {
  color: #4169E1;
  background: rgba(65, 105, 225, 0.12);
}

.action-view:active {
  background: rgba(65, 105, 225, 0.25);
}

.action-delete {
  color: #CD5C5C;
  background: rgba(205, 92, 92, 0.12);
}

.action-delete:active {
  background: rgba(205, 92, 92, 0.25);
}

.empty-box {
  border: 2rpx dashed rgba(255, 182, 193, 0.5);
  border-radius: 20rpx;
  padding: 40rpx 20rpx;
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  animation: bounce-soft 2s ease-in-out infinite;
}

.empty-title {
  font-size: 28rpx;
  color: #8B4513;
  text-align: center;
  font-weight: 600;
}

.empty-desc {
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #8B5A2B;
  line-height: 1.6;
  text-align: center;
}

.empty-decor {
  margin-top: 20rpx;
  display: flex;
  gap: 16rpx;
}

.empty-decor text {
  font-size: 28rpx;
  animation: float 2s ease-in-out infinite;
}

.empty-decor text:nth-child(2) { animation-delay: 0.3s; }
.empty-decor text:nth-child(3) { animation-delay: 0.6s; }

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

.tab-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 0;
}

.tab-icon {
  font-size: 36rpx;
  transition: transform 0.3s ease;
}

.tab-nav-item.active .tab-icon {
  animation: bounce-soft 1s ease-in-out infinite;
}

.tab-nav-text {
  font-size: 22rpx;
  color: #8B5A2B;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  transition: all 0.3s ease;
}

.tab-nav-item.active .tab-nav-text {
  color: #fff;
  background: linear-gradient(135deg, #FF6B9D, #FFB347);
  font-weight: 600;
  box-shadow: 0 3rpx 10rpx rgba(255, 107, 157, 0.4);
}

.bottom-space { height: 150rpx; }
</style>
