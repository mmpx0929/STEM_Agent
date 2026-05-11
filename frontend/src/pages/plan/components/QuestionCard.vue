<template>
  <view class="question-card">
    <view class="question-header">
      <view class="question-number">{{ number }}</view>
      <view class="question-title">{{ title }}</view>
    </view>
    <view class="question-content" @touchstart="onInteraction" @touchend="onInteractionEnd">
      <view class="question-text">
        <template v-for="(segment, index) in questionSegments" :key="index">
          <text v-if="segment.type === 'text'">{{ segment.content }}</text>
          <view v-else-if="segment.type === 'blank'" class="blank-wrapper">
            <picker 
              :value="segment.value" 
              :range="segment.options" 
              @change="(e) => handleBlankChange(e, index)"
              @cancel="onInteractionEnd"
            >
              <view class="blank-input" :class="{filled: segment.value !== null}">
                {{ segment.value !== null ? segment.options[segment.value] : '点击选择' }}
              </view>
            </picker>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    questionSegments: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: '我的猜测'
    },
    number: {
      type: String,
      default: '1'
    }
  },
  methods: {
    handleBlankChange(e, index) {
      this.$emit('change', { index, value: e.detail.value });
      this.$emit('interaction');
    },
    onInteraction() {
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

.question-content {
  background: #F8F9FA;
  padding: 15px;
  border-radius: 15px;
  border: 1px dashed #E0E0E0;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: #555;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.blank-wrapper {
  display: inline-block;
  margin: 0 5px;
}

.blank-input {
  display: inline-block;
  min-width: 80px;
  padding: 2px 10px;
  border-bottom: 2px solid #FF6B6B;
  text-align: center;
  color: #999;
  background: white;
  border-radius: 4px;
}

.blank-input.filled {
  color: #FF6B6B;
  font-weight: bold;
  border-bottom-style: solid;
}
</style>
