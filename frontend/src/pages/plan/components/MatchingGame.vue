<template>
  <view class="question-card">
    <view class="question-header">
      <view class="question-number">{{ number }}</view>
      <view class="question-title">{{ title }}</view>
    </view>
    
    <!-- 变量概念解释 -->
    <view class="variable-explanation" @touchstart="onInteractionStart" @touchend="onInteractionEnd">
      <view class="explanation-title">📚 什么是变量？</view>
      <view class="explanation-item">
        <view class="explanation-icon">🎯</view>
        <view class="explanation-text">
          <view class="explanation-label">自变量</view>
          <view class="explanation-desc">你主动改变的因素，比如：旋转速度（快与慢）</view>
        </view>
      </view>
      <view class="explanation-item">
        <view class="explanation-icon">📊</view>
        <view class="explanation-text">
          <view class="explanation-label">因变量</view>
          <view class="explanation-desc">随着自变量变化而变化的结果，比如：飞行高低、飞行远近</view>
        </view>
      </view>
      <view class="explanation-item">
        <view class="explanation-icon">⚖️</view>
        <view class="explanation-text">
          <view class="explanation-label">不变量</view>
          <view class="explanation-desc">为了保证实验公平，需要保持不变的因素，比如：衣服的重量</view>
        </view>
      </view>
    </view>
    
    <!-- 连线题 -->
    <view class="matching-game" @touchstart="onInteractionStart" @touchend="onInteractionEnd">
      <view class="matching-title">🔗 请将左边的项目与右边的变量类型连起来：</view>
      
      <view class="matching-container">
        <view class="matching-left">
          <view class="matching-item" 
                v-for="(item, index) in matchingItems" 
                :key="'left-' + index"
                :class="{selected: selectedLeft === index, matched: item.matched}"
                @click="selectLeft(index)">
            <view class="item-icon">{{item.icon}}</view>
            <view class="item-text">{{item.text}}</view>
          </view>
        </view>
        
        <view class="matching-lines">
          <!-- 连线部分简化处理，实际需要动态计算 SVG 或 Canvas -->
          <!-- 这里仅展示简单的视觉连接线 -->
        </view>
        
        <view class="matching-right">
          <view class="matching-item" 
                v-for="(type, index) in variableTypes" 
                :key="'right-' + index"
                :class="{selected: selectedRight === index, matched: type.matched}"
                @click="selectRight(index)">
            <view class="item-icon">{{type.icon}}</view>
            <view class="item-text">{{type.name}}</view>
            <view class="item-count" v-if="type.maxMatches > 1">
              ({{type.currentMatches}}/{{type.maxMatches}})
            </view>
          </view>
        </view>
      </view>
      
      <!-- 已匹配的结果 -->
      <view class="matched-results" v-if="matches.length > 0">
        <view class="result-title">已完成的连线：</view>
        <view class="result-item" v-for="(match, index) in matches" :key="index">
          <view class="result-left">
            <view class="result-icon">{{match.leftItem.icon}}</view>
            <view class="result-text">{{match.leftItem.text}}</view>
          </view>
          <view class="result-arrow">→</view>
          <view class="result-right">
            <view class="result-icon">{{match.rightType.icon}}</view>
            <view class="result-text">{{match.rightType.name}}</view>
          </view>
          <button class="remove-match" @click="removeMatch(index)">×</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    matchingItems: {
      type: Array,
      required: true
    },
    variableTypes: {
      type: Array,
      required: true
    },
    matches: {
      type: Array,
      default: () => []
    },
    number: {
      type: String,
      default: '2'
    },
    title: {
      type: String,
      default: '变量连连看'
    }
  },
  data() {
    return {
      selectedLeft: null,
      selectedRight: null
    };
  },
  methods: {
    selectLeft(index) {
      if (this.matchingItems[index].matched) return;
      this.selectedLeft = index;
      this.checkMatch();
      this.$emit('interaction');
    },
    selectRight(index) {
      // 检查该类型是否还能接受更多匹配
      const type = this.variableTypes[index];
      // 注意：这里的 maxMatches 逻辑可能需要根据实际业务调整，目前简单检查 currentMatches < maxMatches
      // 如果已经满了，就不能再选了，除非是重新匹配逻辑
      if (type.currentMatches >= type.maxMatches) {
        // 可以增加提示逻辑
        return; 
      }
      
      this.selectedRight = index;
      this.checkMatch();
      this.$emit('interaction');
    },
    checkMatch() {
      if (this.selectedLeft !== null && this.selectedRight !== null) {
        // 触发匹配事件
        this.$emit('match', {
          leftIndex: this.selectedLeft,
          rightIndex: this.selectedRight
        });
        
        // 重置选择
        this.selectedLeft = null;
        this.selectedRight = null;
      }
    },
    removeMatch(index) {
      this.$emit('remove-match', index);
      this.$emit('interaction');
    },
    onInteractionStart() {
      this.$emit('interaction-start');
    },
    onInteractionEnd() {
      this.$emit('interaction-end');
    }
  }
}
</script>

<style scoped>
/* Copied from plan.vue */
.question-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 2px solid #E3F2FD;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.question-number {
  width: 28px;
  height: 28px;
  background: #FFD93D;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
  box-shadow: 0 2px 5px rgba(255, 217, 61, 0.4);
}

.question-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 变量解释样式 */
.variable-explanation {
  background: #F0F4C3;
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 20px;
  border: 2px dashed #DCE775;
}

.explanation-title {
  font-size: 16px;
  font-weight: bold;
  color: #558B2F;
  margin-bottom: 10px;
}

.explanation-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.explanation-icon {
  font-size: 20px;
  margin-right: 10px;
  width: 24px;
  text-align: center;
}

.explanation-text {
  flex: 1;
}

.explanation-label {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.explanation-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* 连线游戏样式 */
.matching-game {
  background: #E3F2FD;
  padding: 15px;
  border-radius: 15px;
  border: 2px solid #BBDEFB;
}

.matching-title {
  font-size: 15px;
  font-weight: bold;
  color: #1976D2;
  margin-bottom: 15px;
  text-align: center;
}

.matching-container {
  display: flex;
  justify-content: space-between;
  position: relative;
  min-height: 200px;
}

.matching-left, .matching-right {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 40%;
}

.matching-item {
  background: white;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.matching-item.selected {
  border-color: #2196F3;
  background: #E3F2FD;
  transform: scale(1.05);
}

.matching-item.matched {
  border-color: #4CAF50;
  background: #E8F5E9;
  opacity: 0.8;
}

.item-icon {
  font-size: 20px;
  margin-right: 8px;
}

.item-text {
  font-size: 13px;
  color: #333;
  flex: 1;
}

.item-count {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}

.matching-lines {
  flex: 1;
  position: relative;
}

.matched-results {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px dashed #BBDEFB;
}

.result-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.result-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.result-left, .result-right {
  display: flex;
  align-items: center;
  flex: 1;
}

.result-arrow {
  margin: 0 10px;
  color: #999;
  font-weight: bold;
}

.remove-match {
  width: 24px;
  height: 24px;
  line-height: 22px;
  text-align: center;
  padding: 0;
  margin-left: 10px;
  background: #FFEBEE;
  color: #F44336;
  border-radius: 50%;
  font-size: 16px;
  border: none;
}
</style>
