<template>
  <view class="offline-guide-component">
    <scroll-view scroll-y class="content-area">
      <!-- 鼓励语 -->
      <view class="intro-card">
        <view class="card-icon">🌟</view>
        <view class="card-title">你太棒了！</view>
        <view class="card-text">
          恭喜你完成了虚拟实验！现在，是不是迫不及待想要亲手制作一个真实的离心力装置呢？
        </view>
        <view class="card-text highlight">
          动起手来，让科学在指尖绽放光芒吧！
        </view>
      </view>
      
      <!-- 思考问题 -->
      <view class="section-card">
        <view class="section-header">
          <view class="section-icon">🤔</view>
          <view class="section-title">制作时请思考</view>
        </view>
        
        <view class="subsection">
          <view class="subsection-title">1. 测试方向</view>
          <view class="list-item">
            <text class="dot">•</text>
            <text>模型是否稳定？瓶子是否支撑转动带来的振动？</text>
          </view>
          <view class="list-item">
            <text class="dot">•</text>
            <text>五角星的重量和大小是否可以对抗空气的阻力（不是被空气吹起来的）？</text>
          </view>
          <view class="list-item">
            <text class="dot">•</text>
            <text>拉线回力箱和电机的动力差异是否有速度差异？</text>
          </view>
          <view class="list-item">
            <text class="dot">•</text>
            <text>毛线的粗细程度如何影响实验？</text>
          </view>
          <view class="list-item">
            <text class="dot">•</text>
            <text>考虑该模型是否成本最低、最省时间、美观？</text>
          </view>
        </view>
        
        <view class="subsection">
          <view class="subsection-title">2. 迭代改进方向</view>
          <view class="improvement-box">
            <view class="improvement-label">重点在美观上：</view>
            <view class="list-item">
              <text class="dot">•</text>
              <text>更换更好看的瓶子。</text>
            </view>
            <view class="list-item">
              <text class="dot">•</text>
              <text>解决连接处太凌乱的问题：使用橡胶环连接毛线和木棒（利用凹槽）。</text>
            </view>
            <view class="list-item">
              <text class="dot">•</text>
              <text>丰富毛线颜色：用彩色吸管套在毛线上，隐藏连接疙瘩。</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 实验分组 -->
      <view class="section-card">
        <view class="section-header">
          <view class="section-icon">🔬</view>
          <view class="section-title">实验探究分组</view>
        </view>
        
        <view class="group-card group1">
          <view class="group-header">
            <view class="group-name">实验组 1：定性探究</view>
            <view class="group-tag">适合低年级</view>
          </view>
          <view class="group-desc">观察飞行现象</view>
          <view class="group-content">
            拉动回力箱装置，打开电动装置，观察两种装置旋转速度的不同，五角星旋转起来后的运动状态，飞行的高低有什么不同？飞行是远离圆心还是靠近圆心，远离的距离有什么不同？并思考为什么？
          </view>
        </view>
        
        <view class="group-card group2">
          <view class="group-header">
            <view class="group-name">实验组 2：定量探究</view>
            <view class="group-tag">适合高年级</view>
          </view>
          <view class="group-desc">精准的数字化数据探究</view>
          <view class="group-content">
            拉动回力箱装置：记录一分钟转动了多少圈？启动电动装置一分钟转动了多少圈？对应的速度差是多少？并观察五角星飞行的高度差是多少？远离圆心的距离是多少？（如有专业设备测量更好，否则进行肉眼预估）。
          </view>
        </view>
      </view>
      
      <!-- 底部提示 -->
      <view class="footer-tip">
        <view class="tip-icon">📝</view>
        <view class="tip-text">
          线下做完实验后，记得点击下方按钮去填写“我的实验记录”哦！
        </view>
      </view>
      
      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 底部按钮 -->
    <view class="fixed-bottom-btn">
      <button class="action-btn" @click="goToMyExperiments">
        去记录我的实验成果 →
      </button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    experimentId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {};
  },
  methods: {
    goToMyExperiments() {
      const url = this.experimentId 
        ? `/pages/data-record/data-record?id=${this.experimentId}`
        : '/pages/data-record/data-record';
      uni.navigateTo({
        url: url
      });
    }
  }
};
</script>

<style scoped>
.offline-guide-component {
  width: 100%;
  background: #E0F7FA;
  padding-bottom: 80px;
}

.content-area {
  padding: 20px;
}

.intro-card {
  background: linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  margin-bottom: 25px;
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.2);
  border: 4px solid white;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  color: #FF6F00;
  margin-bottom: 15px;
}

.card-text {
  font-size: 16px;
  color: #5D4037;
  line-height: 1.6;
  margin-bottom: 10px;
}

.highlight {
  font-weight: bold;
  color: #E65100;
  font-size: 18px;
}

.section-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #E0F7FA;
}

.section-icon {
  font-size: 32px;
  margin-right: 10px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  color: #0097A7;
}

.subsection {
  margin-bottom: 25px;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection-title {
  font-size: 18px;
  font-weight: bold;
  color: #00838F;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #00BCD4;
}

.list-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: 16px;
  color: #37474F;
  line-height: 1.6;
}

.dot {
  color: #00BCD4;
  margin-right: 8px;
  font-weight: bold;
}

.improvement-box {
  background: #E0F2F1;
  border-radius: 12px;
  padding: 15px;
}

.improvement-label {
  font-weight: bold;
  color: #00695C;
  margin-bottom: 10px;
}

.group-card {
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 20px;
  border: 2px solid transparent;
}

.group-card:last-child {
  margin-bottom: 0;
}

.group1 {
  background: #E8F5E9;
  border-color: #C8E6C9;
}

.group2 {
  background: #E3F2FD;
  border-color: #BBDEFB;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.group-name {
  font-size: 18px;
  font-weight: bold;
  color: #2E7D32;
}

.group2 .group-name {
  color: #1565C0;
}

.group-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
}

.group1 .group-tag {
  background: #A5D6A7;
  color: #1B5E20;
}

.group2 .group-tag {
  background: #90CAF9;
  color: #0D47A1;
}

.group-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-style: italic;
}

.group-content {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.footer-tip {
  display: flex;
  align-items: center;
  background: #FFF3E0;
  border-radius: 16px;
  padding: 15px;
  margin-top: 20px;
}

.tip-icon {
  font-size: 24px;
  margin-right: 15px;
}

.tip-text {
  font-size: 15px;
  color: #E65100;
  font-weight: 500;
}

.bottom-space {
  height: 20px;
}

.fixed-bottom-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.1);
  z-index: 100;
}

.action-btn {
  background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}

.action-btn:active {
  transform: scale(0.98);
}
</style>
