﻿<template>
  <view class="page">
    <view class="decor-stars">
      <text class="star star-1">⭐</text>
      <text class="star star-2">✨</text>
      <text class="star star-3">🎈</text>
      <text class="star star-4">🎯</text>
    </view>

    <view class="hero-card">
      <view class="hero-badge">🚀 超级实验站</view>
      <view class="hero-title">{{ catalog.projectTitle }}</view>
      <view class="hero-subtitle">{{ catalog.projectSubtitle }}</view>
      <view class="hero-stars">
        <text class="hero-star">⭐</text>
        <text class="hero-star">⭐</text>
        <text class="hero-star">⭐</text>
      </view>
      <view class="hero-decor">
        <text class="decor-icon decor-1">🔬</text>
        <text class="decor-icon decor-2">🧠</text>
        <text class="decor-icon decor-3">⚙️</text>
      </view>
    </view>

    <view class="video-card">
      <view class="card-title">
        <text class="title-icon">🎬</text>
        <text>{{ catalog.featuredVideoTitle }}</text>
      </view>
      <view class="video-box" v-if="catalog.featuredVideoUrl">
        <view class="video-player-wrap">
          <video
            class="video-player"
            :src="catalog.featuredVideoUrl"
            controls
            show-center-play-btn
            object-fit="contain"
            @ended="onFeaturedVideoEnded"
          />
        </view>
        <view class="video-desc">{{ featuredVideoDescText }}</view>
      </view>
      <view class="video-box" v-else>
        <view class="video-icon">📺</view>
        <view class="video-title">导学视频准备中</view>
        <view class="video-desc">{{ catalog.featuredVideoDesc }}</view>
      </view>
    </view>

    <view class="category-card" v-for="category in catalog.categories" :key="category.key">
      <view class="category-head">
        <view class="category-title">
          <text class="category-icon">{{ category.emoji }}</text>
          <text>{{ category.title }}</text>
        </view>
        <view class="category-desc">{{ category.description }}</view>
      </view>

      <view class="item-list">
        <view
          class="item-card"
          v-for="item in category.items"
          :key="item.id"
          :class="{ 'is-locked': !isVideoUnlocked }"
          @click="openExperiment(item)"
        >
          <view class="item-icon">{{ item.icon || '🔬' }}</view>
          <view class="item-content">
            <view class="item-name">{{ item.title }}</view>
            <view class="item-summary">{{ item.summary }}</view>
          </view>
          <view class="item-action">
            <text class="action-icon">{{ isVideoUnlocked ? '🚀' : '🔒' }}</text>
            <text>{{ isVideoUnlocked ? '开始实验' : '观看视频后解锁' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-space"></view>

    <view class="tab-bar">
      <view class="tab-item active" @click="goHome">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item" @click="goRecord">
        <view class="tab-icon">📒</view>
        <view class="tab-text">我的记录</view>
      </view>
      <view class="tab-item" @click="goGrowth">
        <view class="tab-icon">🌱</view>
        <view class="tab-text">我的成长</view>
      </view>
    </view>

    <AIChat
      scene="general"
      :defaultOpen="false"
      pageContext="home"
      guide-key="index"
      :auto-play="true"
    />
  </view>
</template>

<script>
import AIChat from '@/pages/plan/components/AIChat.vue';
import catalog from '@/config/experiment-catalog.js';

const HOME_VIDEO_UNLOCK_KEY = 'home-featured-video-unlocked';

export default {
  components: {
    AIChat
  },
  data() {
    return {
      catalog,
      featuredVideoUnlocked: false
    };
  },
  computed: {
    isVideoUnlocked() {
      if (!this.catalog.featuredVideoUrl) {
        return true;
      }
      return this.featuredVideoUnlocked;
    },
    featuredVideoDescText() {
      if (this.isVideoUnlocked) {
        return '你已经看完导学小视频啦，下面的科学实验和工程挑战都能开始啦。';
      }
      return '先把导学小视频看完吧，看完后下面的实验就会自动解锁。';
    }
  },
  onLoad() {
    this.loadVideoUnlockState();
  },
  onShow() {
    this.loadVideoUnlockState();
  },
  methods: {
    loadVideoUnlockState() {
      const saved = uni.getStorageSync(HOME_VIDEO_UNLOCK_KEY);
      this.featuredVideoUnlocked = saved === true || saved === 'true' || saved === 1;
    },
    onFeaturedVideoEnded() {
      if (this.featuredVideoUnlocked) {
        return;
      }
      this.featuredVideoUnlocked = true;
      uni.setStorageSync(HOME_VIDEO_UNLOCK_KEY, true);
      uni.showToast({
        title: '小视频看完啦，实验已经解锁',
        icon: 'none',
        duration: 1800
      });
    },
    openExperiment(item) {
      if (!this.isVideoUnlocked) {
        uni.showToast({
          title: '先看完首页导学小视频，再来开始实验吧',
          icon: 'none',
          duration: 1800
        });
        return;
      }
      const templateType = item.templateType || 'science';
      const targetPath = templateType === 'engineering' ? '/pages/engineering/flow' : '/pages/experiment/flow';
      uni.navigateTo({
        url: `${targetPath}?experimentId=${item.id}&templateType=${templateType}`
      });
    },
    goHome() {
      uni.showToast({
        title: '已经在首页啦',
        icon: 'none',
        duration: 1200
      });
    },
    goRecord() {
      uni.navigateTo({ url: '/pages/record/record' });
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
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 10%, rgba(255, 182, 193, 0.25), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(135, 206, 250, 0.25), transparent 28%),
    radial-gradient(circle at 46% 0%, rgba(221, 160, 221, 0.2), transparent 26%),
    radial-gradient(circle at 70% 80%, rgba(152, 251, 152, 0.2), transparent 30%),
    linear-gradient(180deg, #fff5f8 0%, #f0f8ff 48%, #f5fff9 100%);
}

.decor-stars {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  font-size: 28rpx;
  animation: star-twinkle 2s ease-in-out infinite;
}

.star-1 { top: 20rpx; left: 10%; animation-delay: 0s; }
.star-2 { top: 40rpx; right: 15%; animation-delay: 0.5s; }
.star-3 { top: 80rpx; left: 25%; animation-delay: 1s; }
.star-4 { top: 30rpx; right: 30%; animation-delay: 1.5s; }

@keyframes star-twinkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.5; transform: scale(0.8) rotate(180deg); }
}

.hero-card {
  position: relative;
  background: linear-gradient(135deg, #FF6B9D 0%, #FFB347 30%, #87CEEB 60%, #98FB98 100%);
  background-size: 300% 300%;
  animation: rainbow 6s ease infinite;
  border-radius: 30rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 14rpx 34rpx rgba(255, 107, 157, 0.35);
  overflow: hidden;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-badge {
  display: inline-block;
  font-size: 22rpx;
  color: #713d0d;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999rpx;
  padding: 8rpx 14rpx;
  font-weight: 700;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.hero-title {
  margin-top: 14rpx;
  font-size: 36rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1.45;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  text-align: center;
}

.hero-subtitle {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.hero-stars {
  margin-top: 14rpx;
  display: flex;
  gap: 8rpx;
}

.hero-star {
  font-size: 28rpx;
  animation: bounce-soft 1.5s ease-in-out infinite;
}

.hero-star:nth-child(2) { animation-delay: 0.2s; }
.hero-star:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce-soft {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.hero-decor {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.decor-icon {
  font-size: 32rpx;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.decor-2 { animation-delay: 0.5s; }
.decor-3 { animation-delay: 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8rpx) rotate(5deg); }
}

.video-card,
.category-card {
  margin-top: 18rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 22rpx rgba(255, 107, 157, 0.12);
  border: 2rpx solid rgba(255, 182, 193, 0.3);
  position: relative;
  overflow: hidden;
}

.video-card::before,
.category-card::before {
  content: '✨';
  position: absolute;
  top: 8rpx;
  right: 12rpx;
  font-size: 20rpx;
  opacity: 0.5;
  animation: star-twinkle 2s ease-in-out infinite;
}

.card-title {
  font-size: 29rpx;
  color: #D63384;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.title-icon {
  font-size: 32rpx;
  animation: wobble 2s ease-in-out infinite;
}

@keyframes wobble {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.video-box {
  margin-top: 12rpx;
  border: 2rpx dashed #FFB6C1;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #FFF5F8 0%, #F0FFF0 100%);
  padding: 22rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}

.video-player-wrap {
  width: 100%;
  position: relative;
  padding-top: 56.25%;
  border-radius: 14rpx;
  overflow: hidden;
  background: #000;
}

.video-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
  animation: float 2s ease-in-out infinite;
}

.video-title {
  font-size: 26rpx;
  color: #D63384;
  font-weight: 600;
}

.video-desc {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #8B5A2B;
  line-height: 1.6;
  text-align: center;
}

.category-head {
  margin-bottom: 10rpx;
}

.category-title {
  font-size: 29rpx;
  color: #D63384;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.category-icon {
  font-size: 32rpx;
  animation: bounce-soft 2s ease-in-out infinite;
}

.category-desc {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #8B5A2B;
  line-height: 1.6;
}

.item-list {
  margin-top: 10rpx;
}

.item-card {
  border-radius: 20rpx;
  border: 2rpx solid rgba(135, 206, 250, 0.5);
  background: linear-gradient(135deg, #F0F8FF 0%, #FFF5F8 100%);
  padding: 16rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.item-card.is-locked {
  opacity: 0.75;
}

.item-card.is-locked .item-action {
  background: linear-gradient(135deg, #b4b4b4 0%, #9a9a9a 100%);
  box-shadow: none;
}

.item-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.2);
}

.item-card::after {
  content: '💫';
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  font-size: 16rpx;
  opacity: 0.4;
}

.item-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB6C1, #87CEEB);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(255, 182, 193, 0.4);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 26rpx;
  color: #8B4513;
  line-height: 1.5;
  font-weight: 600;
}

.item-summary {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #A0522D;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 20rpx;
  color: #fff;
  background: linear-gradient(135deg, #FF6B9D 0%, #FFB347 100%);
  border-radius: 999rpx;
  padding: 8rpx 16rpx;
  flex-shrink: 0;
  box-shadow: 0 3rpx 10rpx rgba(255, 107, 157, 0.4);
}

.action-icon {
  font-size: 20rpx;
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

.tab-item {
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

.tab-item.active .tab-icon {
  animation: bounce-soft 1s ease-in-out infinite;
}

.tab-text {
  font-size: 22rpx;
  color: #8B5A2B;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  transition: all 0.3s ease;
}

.tab-item.active .tab-text {
  color: #fff;
  background: linear-gradient(135deg, #FF6B9D 0%, #FFB347 100%);
  font-weight: 600;
  box-shadow: 0 3rpx 10rpx rgba(255, 107, 157, 0.4);
}

.bottom-space {
  height: 150rpx;
}

/* 页面级微调：首页 */
.page {
  --kid-video-max-width: 620rpx;
  --kid-video-height: 268rpx;
  padding: 18rpx 18rpx 0;
}

.hero-card {
  border-radius: 28rpx;
  padding: 28rpx 22rpx;
}

.hero-title {
  font-size: 38rpx;
  line-height: 1.4;
}

.hero-subtitle {
  font-size: 26rpx;
  line-height: 1.65;
}

.video-card,
.category-card {
  margin-top: 16rpx;
  padding: 18rpx;
  border-radius: 22rpx;
}

.card-title,
.category-title {
  font-size: 31rpx;
}

.video-desc,
.category-desc {
  font-size: 24rpx;
}

.item-card {
  padding: 18rpx;
  gap: 14rpx;
}

.item-name {
  font-size: 28rpx;
}

.item-summary {
  font-size: 24rpx;
}

.item-action {
  font-size: 22rpx;
  padding: 10rpx 18rpx;
}

.tab-text {
  font-size: 24rpx;
}

/* 手机竖屏：更大可读性 */
@media screen and (max-width: 900px) and (orientation: portrait) {
  .page {
    --kid-video-max-width: 660rpx;
    --kid-video-height: 286rpx;
    padding: 16rpx 16rpx 0;
  }

  .video-player-wrap {
    padding-top: 52% !important;
  }
}

/* 平板横屏：更紧凑，避免留白 */
@media screen and (min-width: 901px) and (orientation: landscape) {
  .page {
    --kid-video-max-width: 540rpx;
    --kid-video-height: 216rpx;
    padding: 14rpx 24rpx 0;
  }

  .hero-card {
    padding: 22rpx 20rpx;
  }

  .video-card,
  .category-card {
    margin-top: 12rpx;
    padding: 16rpx;
  }
}
</style>
