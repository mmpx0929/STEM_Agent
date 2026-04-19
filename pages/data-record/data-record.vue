<template>
  <view class="container">
    <view class="decor-bubbles">
      <view class="bubble bubble-1"></view>
      <view class="bubble bubble-2"></view>
      <view class="bubble bubble-3"></view>
    </view>

    <view class="header-section">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">👈</text>
        <text>返回</text>
      </view>
      <view class="title-wrapper">
        <text class="title-icon">📝</text>
        <text class="title">实验数据记录</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">📋</text>
        <text class="section-title">基础信息</text>
      </view>
      <view class="info-table">
        <view class="info-row">
          <view class="info-label">
            <text class="label-icon">🔬</text>
            <text>实验名称</text>
          </view>
          <input class="info-input" v-model="formData.experimentName" placeholder="请输入实验名称..." placeholder-style="color:#999" type="text" />
        </view>
        <view class="info-row">
          <view class="info-label">
            <text class="label-icon">📅</text>
            <text>实验日期</text>
          </view>
          <picker mode="date" :value="formData.experimentDate" @change="onDateChange" class="picker-wrapper">
            <view class="picker-value">{{ formData.experimentDate || '请选择日期' }}</view>
          </picker>
        </view>
        <view class="info-row">
          <view class="info-label">
            <text class="label-icon">👥</text>
            <text>实验人员</text>
          </view>
          <input class="info-input" v-model="formData.teamMembers" placeholder="填写实验人员姓名..." placeholder-style="color:#999" type="text" />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">👁️</text>
        <text class="section-title">定性数据观察</text>
      </view>
      <view class="table-description">
        <text class="desc-icon">💡</text>
        <text>对比两种旋转装置的表现，观察五角星的运动状态</text>
      </view>
      <scroll-view scroll-x="true" class="table-scroll">
        <view class="data-table">
          <view class="table-header">
            <view class="th th-model">
              <text class="th-icon">🧩</text>
              <text>实验模型</text>
            </view>
            <view class="th th-speed">
              <text class="th-icon">⚡</text>
              <text>旋转速度</text>
            </view>
            <view class="th th-state">
              <text class="th-icon">⭐</text>
              <text>五角星运动状态</text>
            </view>
            <view class="th th-action">
              <text class="th-icon">🔧</text>
              <text>操作</text>
            </view>
          </view>
          <view class="table-body">
            <view class="table-row" v-for="(item, index) in formData.qualitativeData" :key="`q-${index}`">
              <view class="td td-model">
                <picker :value="item.modelIndex" :range="modelOptions" @change="(e) => setQualitativeModel(index, e.detail.value)" class="model-picker">
                  <view class="picker-value-cell">{{ item.model || '请选择模型' }}</view>
                </picker>
              </view>
              <view class="td td-speed">
                <input class="table-input" v-model="item.speed" placeholder="如：慢/快" placeholder-style="color:#999" type="text" />
              </view>
              <view class="td td-state">
                <textarea class="table-textarea" v-model="item.starState" placeholder="描述五角星的运动状态..." placeholder-style="color:#999" auto-height></textarea>
              </view>
              <view class="td td-action">
                <view class="delete-btn-table" @click="deleteQualitativeRow(index)" v-if="formData.qualitativeData.length > 1">🗑️</view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <button class="add-btn" @click="addQualitativeRow">
        <text class="btn-icon">➕</text>
        <text>添加观察记录</text>
      </button>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">📏</text>
        <text class="section-title">定量数据测量</text>
      </view>
      <view class="table-description">
        <text class="desc-icon">💡</text>
        <text>精确测量各项数据指标</text>
      </view>
      <scroll-view scroll-x="true" class="table-scroll">
        <view class="data-table">
          <view class="table-header">
            <view class="th th-model">
              <text class="th-icon">🧩</text>
              <text>实验模型</text>
            </view>
            <view class="th th-rpm">
              <text class="th-icon">🔄</text>
              <text>转速(圈/分)</text>
            </view>
            <view class="th th-state-group">
              <text class="th-icon">📊</text>
              <text>数据记录 (高度/距离/现象)</text>
            </view>
            <view class="th th-action">
              <text class="th-icon">🔧</text>
              <text>操作</text>
            </view>
          </view>
          <view class="table-row" v-for="(item, index) in formData.quantitativeData" :key="`n-${index}`">
            <view class="td td-model">
              <picker :value="item.modelIndex" :range="modelOptions" @change="(e) => setQuantitativeModel(index, e.detail.value)" class="model-picker">
                <view class="picker-value-cell">{{ item.model || '请选择' }}</view>
              </picker>
            </view>
            <view class="td td-rpm">
              <input class="table-input" v-model="item.rpm" type="number" placeholder="圈数" placeholder-style="color:#999" />
            </view>
            <view class="td td-state-group">
              <view class="state-inputs">
                <input class="state-input" v-model="item.height" type="digit" placeholder="高度cm" placeholder-style="color:#999" />
                <input class="state-input" v-model="item.distance" type="digit" placeholder="距离cm" placeholder-style="color:#999" />
                <input class="state-input-long" v-model="item.flyPhenomenon" placeholder="现象" placeholder-style="color:#999" type="text" />
              </view>
            </view>
            <view class="td td-action">
              <view class="delete-btn-table" @click="deleteQuantitativeRow(index)" v-if="formData.quantitativeData.length > 1">🗑️</view>
            </view>
          </view>
        </view>
      </scroll-view>
      <button class="add-btn" @click="addQuantitativeRow">
        <text class="btn-icon">➕</text>
        <text>添加测量项目</text>
      </button>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">💡</text>
        <text class="section-title">关键发现</text>
      </view>
      <view class="discovery-item" v-for="(discovery, index) in formData.discoveries" :key="`d-${index}`">
        <view class="discovery-header">
          <text class="discovery-icon">🔍</text>
          <text class="discovery-label">发现 {{index + 1}}</text>
        </view>
        <textarea class="discovery-textarea" v-model="discovery.content" placeholder="写下你的重要发现..." placeholder-style="color:#999"></textarea>
        <view class="remove-discovery" @click="removeDiscovery(index)" v-if="formData.discoveries.length > 1">
          <text class="remove-icon">❌</text>
          <text>删除</text>
        </view>
      </view>
      <button class="add-btn" @click="addDiscovery">
        <text class="btn-icon">➕</text>
        <text>添加更多发现</text>
      </button>

      <view class="ai-area">
        <view class="ai-title">
          <text class="ai-icon">🤖</text>
          <text>{{ appAiName }}</text>
          <text class="ai-rocket">🚀</text>
        </view>
        <view class="ai-row">
          <view class="ai-card" @click="analyzeData('qualitative')">
            <text class="ai-card-icon">👁️</text>
            <text>定性分析</text>
          </view>
          <view class="ai-card" @click="analyzeData('quantitative')">
            <text class="ai-card-icon">📏</text>
            <text>定量分析</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">📸</text>
        <text class="section-title">实验照片</text>
      </view>
      <view class="photo-section">
        <view class="upload-area" @click="chooseImage" v-if="formData.photos.length < 6">
          <view class="upload-icon">📷</view>
          <view class="upload-text">添加照片</view>
          <view class="upload-hint">{{ formData.photos.length }}/6</view>
        </view>
        <view class="photo-item" v-for="(photo, index) in formData.photos" :key="`p-${index}`" @click="previewImage(index)">
          <image :src="photo" mode="aspectFill" class="photo-image" />
          <view class="photo-delete" @click.stop="deletePhoto(index)">×</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">🎬</text>
        <text class="section-title">实验视频</text>
        <text class="optional">（可选）</text>
      </view>
      <view class="video-upload" @click="chooseVideo" v-if="!formData.video">
        <view class="upload-icon-video">🎥</view>
        <view class="upload-text">点击上传视频（最大30秒）</view>
      </view>
      <view class="video-preview" v-else>
        <video :src="formData.video" class="video-player" controls :show-center-play-btn="true" />
        <view class="video-delete" @click="deleteVideo">×</view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">❓</text>
        <text class="section-title">遇到的问题</text>
      </view>
      <textarea class="form-textarea" v-model="formData.problems" placeholder="实验中遇到了什么困难或问题？" placeholder-style="color:#999" :maxlength="500"></textarea>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">🌟</text>
        <text class="section-title">自我评价</text>
      </view>
      <view class="rating-section">
        <view class="star" v-for="i in 5" :key="i" :class="{ active: i <= formData.rating }" @click="setRating(i)">★</view>
      </view>
      <view class="rating-text" v-if="formData.rating > 0">{{ ratingText }}</view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-icon">📝</text>
        <text class="section-title">实验总结</text>
      </view>
      <view class="summary-card">
        <textarea class="summary-textarea" v-model="formData.summary" placeholder="通过这次实验，你学到了什么？有什么感想？" placeholder-style="color:#999" :maxlength="500"></textarea>
        <view class="ai-summary-btn" @click="summarizeExperiment">
          <text class="ai-btn-icon">✨</text>
          <text>AI 辅助总结</text>
        </view>
      </view>
    </view>

    <view class="action-buttons">
      <button class="save-btn" @click="saveData">
        <text class="btn-icon">💾</text>
        <text>保存数据</text>
      </button>
      <button class="complete-btn" @click="completeExperiment">
        <text class="btn-icon">🎉</text>
        <text>完成实验</text>
      </button>
    </view>

    <view class="bottom-space"></view>
    <AIChat ref="aiChat" :scene="aiChatScene" :defaultOpen="false" guide-key="data-record" />
  </view>
</template>

<script>
import { updateExperimentProgress } from '@/utils/experimentProgress.js';
import AIChat from '@/pages/plan/components/AiChat.vue';
import { APP_AI_NAME } from '@/config/app-constants.js';

export default {
  components: {
    AIChat
  },
  data() {
    return {
      appAiName: APP_AI_NAME,
      experimentId: '',
      modelOptions: ['拉线回力旋转装置', '电机动力旋转装置'],
      aiChatScene: 'general',
      formData: {
        experimentName: '',
        experimentDate: '',
        teamMembers: '',
        qualitativeData: [
          { model: '拉线回力旋转装置', modelIndex: 0, speed: '慢', starState: '' },
          { model: '电机动力旋转装置', modelIndex: 1, speed: '快', starState: '' }
        ],
        quantitativeData: [
          { model: '拉线回力旋转装置', modelIndex: 0, rpm: '', height: '', distance: '', flyPhenomenon: '' },
          { model: '电机动力旋转装置', modelIndex: 1, rpm: '', height: '', distance: '', flyPhenomenon: '' }
        ],
        discoveries: [
          { content: '' }
        ],
        photos: [],
        video: '',
        problems: '',
        rating: 0,
        summary: ''
      }
    };
  },
  computed: {
    ratingText() {
      const texts = ['', '继续加油！', '还不错！', '很棒！', '非常棒！', '太厉害了！'];
      return texts[this.formData.rating] || '';
    }
  },
  onLoad(options) {
    this.experimentId = (options && options.id) ? options.id : `exp_${Date.now()}`;
    this.initDate();
    this.loadData();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    initDate() {
      const now = new Date();
      this.formData.experimentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },
    onDateChange(e) {
      this.formData.experimentDate = e.detail.value;
    },
    setQualitativeModel(index, value) {
      this.formData.qualitativeData[index].model = this.modelOptions[value];
      this.formData.qualitativeData[index].modelIndex = parseInt(value, 10);
    },
    setQuantitativeModel(index, value) {
      this.formData.quantitativeData[index].model = this.modelOptions[value];
      this.formData.quantitativeData[index].modelIndex = parseInt(value, 10);
    },
    addQualitativeRow() {
      this.formData.qualitativeData.push({ model: '', modelIndex: 0, speed: '', starState: '' });
    },
    deleteQualitativeRow(index) {
      this.formData.qualitativeData.splice(index, 1);
    },
    addQuantitativeRow() {
      this.formData.quantitativeData.push({ model: '', modelIndex: 0, rpm: '', height: '', distance: '', flyPhenomenon: '' });
    },
    deleteQuantitativeRow(index) {
      this.formData.quantitativeData.splice(index, 1);
    },
    addDiscovery() {
      this.formData.discoveries.push({ content: '' });
    },
    removeDiscovery(index) {
      this.formData.discoveries.splice(index, 1);
    },
    chooseImage() {
      uni.chooseImage({
        count: 6 - this.formData.photos.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.photos = this.formData.photos.concat(res.tempFilePaths);
        }
      });
    },
    previewImage(index) {
      uni.previewImage({ current: index, urls: this.formData.photos });
    },
    deletePhoto(index) {
      this.formData.photos.splice(index, 1);
    },
    chooseVideo() {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        camera: 'back',
        success: (res) => {
          this.formData.video = res.tempFilePath;
        }
      });
    },
    deleteVideo() {
      this.formData.video = '';
    },
    setRating(rating) {
      this.formData.rating = rating;
    },
    analyzeData(type) {
      let hasData = false;
      let prompt = '';
      let scene = '';

      if (type === 'qualitative') {
        hasData = this.formData.qualitativeData.some(item => (item.starState || '').trim());
        if (hasData) {
          const dataSummary = this.formData.qualitativeData
            .filter(item => (item.starState || '').trim())
            .map(item => `${item.model || '未填写模型'}：速度：${item.speed || '未填写'}，五角星状态：${item.starState}`)
            .join('\n');
          prompt = `我正在做一个洗衣机科学实验，观察了两种旋转装置的表现。\n\n这是我的定性观察记录：\n${dataSummary}\n\n请帮我分析：\n1. 我观察到了哪些现象？\n2. 两种装置有什么差异？\n3. 可能原因是什么？\n4. 下一步还可以观察什么？`;
          scene = 'qualitativeAnalysis';
        }
      } else if (type === 'quantitative') {
        hasData = this.formData.quantitativeData.some(item => item.rpm || item.height || item.distance);
        if (hasData) {
          const dataSummary = this.formData.quantitativeData
            .filter(item => item.rpm || item.height || item.distance)
            .map(item => `${item.model || '未填写模型'}：转速 ${item.rpm || '未填写'} 圈/分，高度 ${item.height || '未填写'} cm，距离 ${item.distance || '未填写'} cm，现象 ${item.flyPhenomenon || '无'}`)
            .join('\n');
          prompt = `我正在做一个洗衣机科学实验，测量了两种旋转装置的数据。\n\n这是我的定量测量数据：\n${dataSummary}\n\n请帮我分析：\n1. 数据里有哪些趋势和规律？\n2. 转速与高度、距离有什么关系？\n3. 哪种装置表现更好，为什么？\n4. 是否存在异常数据需要注意？`;
          scene = 'quantitativeAnalysis';
        }
      }

      if (!hasData) {
        uni.showToast({ title: type === 'qualitative' ? '请先填写定性观察数据' : '请先填写定量测量数据', icon: 'none', duration: 2000 });
        return;
      }

      this.showAiAnalysis(prompt, scene);
    },
    summarizeExperiment() {
      if (!this.formData.summary && this.formData.discoveries.every(d => !d.content)) {
        uni.showToast({ title: '请先填写实验数据或关键发现', icon: 'none', duration: 2000 });
        return;
      }

      const discoveriesText = this.formData.discoveries.filter(d => d.content).map((d, i) => `${i + 1}. ${d.content}`).join('\n');
      const dataSummary = {
        qualitative: this.formData.qualitativeData.filter(item => item.starState).length,
        quantitative: this.formData.quantitativeData.filter(item => item.rpm || item.height || item.distance).length,
        discoveries: this.formData.discoveries.filter(d => d.content).length
      };

      let prompt = `我完成了一个洗衣机科学实验，这是我的实验数据概况：\n- 定性观察记录：${dataSummary.qualitative} 条\n- 定量测量数据：${dataSummary.quantitative} 条\n- 关键发现：${dataSummary.discoveries} 条\n`;
      if (discoveriesText) prompt += `\n我的关键发现：\n${discoveriesText}\n`;
      if (this.formData.summary) prompt += `\n我的初步总结：${this.formData.summary}\n`;
      prompt += '\n请帮我分析：\n1. 我的实验主要发现是什么？\n2. 实验过程中有哪些值得反思的地方？\n3. 如何改进这个实验？\n4. 还可以延伸思考哪些问题？';
      this.showAiAnalysis(prompt, 'experimentSummary');
    },
    showAiAnalysis(prompt, scene) {
      this.aiChatScene = scene;
      this.$nextTick(() => {
        const aiChat = this.$refs.aiChat;
        if (aiChat) {
          aiChat.openChat();
          setTimeout(() => {
            aiChat.inputMessage = prompt;
            aiChat.sendMessage();
          }, 500);
        }
      });
      uni.showToast({ title: 'AI 正在分析中...', icon: 'none', duration: 1500 });
    },
    loadData() {
      const savedData = uni.getStorageSync('experimentDataRecords') || {};
      if (savedData[this.experimentId]) {
        try {
          this.formData = JSON.parse(JSON.stringify(savedData[this.experimentId]));
        } catch (e) {
          uni.showToast({ title: '历史数据读取失败', icon: 'none' });
        }
      }
    },
    validateData() {
      if (!this.formData.experimentName) { uni.showToast({ title: '请输入实验名称', icon: 'none' }); return false; }
      if (!this.formData.experimentDate) { uni.showToast({ title: '请选择实验日期', icon: 'none' }); return false; }
      if (!this.formData.teamMembers) { uni.showToast({ title: '请输入实验人员', icon: 'none' }); return false; }

      const hasQualitative = this.formData.qualitativeData.some(item => (item.starState || '').trim());
      if (!hasQualitative) { uni.showToast({ title: '请至少填写一条定性观察记录', icon: 'none' }); return false; }

      const hasQuantitative = this.formData.quantitativeData.some(item => item.rpm || item.height || item.distance || item.flyPhenomenon);
      if (!hasQuantitative) { uni.showToast({ title: '请至少填写一条定量测量数据', icon: 'none' }); return false; }

      const hasDiscovery = this.formData.discoveries.some(item => (item.content || '').trim());
      if (!hasDiscovery) { uni.showToast({ title: '请至少填写一条关键发现', icon: 'none' }); return false; }
      if (!this.formData.summary) { uni.showToast({ title: '请输入实验总结', icon: 'none' }); return false; }
      if (this.formData.rating === 0) { uni.showToast({ title: '请进行自我评价', icon: 'none' }); return false; }
      return true;
    },
    saveData() {
      if (!this.validateData()) return;
      const savedData = uni.getStorageSync('experimentDataRecords') || {};
      savedData[this.experimentId] = JSON.parse(JSON.stringify(this.formData));
      uni.setStorageSync('experimentDataRecords', savedData);

      const now = new Date();
      const experimentRecord = {
        name: this.formData.experimentName || '实验数据记录',
        result: this.formData.summary || '实验数据记录中',
        teamMembers: this.formData.teamMembers,
        experimentDate: this.formData.experimentDate,
        qualitativeData: this.formData.qualitativeData,
        quantitativeData: this.formData.quantitativeData,
        discoveries: this.formData.discoveries,
        summary: this.formData.summary,
        photos: this.formData.photos,
        video: this.formData.video,
        problems: this.formData.problems,
        rating: this.formData.rating,
        imgs: this.formData.photos,
        date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        source: 'data-record',
        experimentId: this.experimentId,
        status: 'in_progress'
      };

      const experimentResults = uni.getStorageSync('experimentResults') || [];
      const existingIndex = experimentResults.findIndex(r => r.experimentId === this.experimentId && r.source === 'data-record');
      if (existingIndex >= 0) experimentResults[existingIndex] = experimentRecord;
      else experimentResults.unshift(experimentRecord);
      uni.setStorageSync('experimentResults', experimentResults);

      uni.showToast({ title: '保存成功！', icon: 'success' });
    },
    completeExperiment() {
      if (!this.validateData()) return;
      this.saveData();
      updateExperimentProgress(this.experimentId, 'data', true);

      const experimentResults = uni.getStorageSync('experimentResults') || [];
      const existingIndex = experimentResults.findIndex(r => r.experimentId === this.experimentId && r.source === 'data-record');
      if (existingIndex >= 0) {
        experimentResults[existingIndex].status = 'completed';
        experimentResults[existingIndex].result = this.formData.summary || '实验已完成';
        uni.setStorageSync('experimentResults', experimentResults);
      }

      const achievements = uni.getStorageSync('achievements') || { completedExperiments: [], badges: [] };
      const parsedId = Number(this.experimentId);
      const expId = Number.isNaN(parsedId) ? this.experimentId : parsedId;
      if (!achievements.completedExperiments.includes(expId)) {
        achievements.completedExperiments.push(expId);
        const badgeRules = [
          { id: 1, name: '初学者', condition: achievements.completedExperiments.length >= 1 },
          { id: 2, name: '实验达人', condition: achievements.completedExperiments.length >= 3 },
          { id: 3, name: '科学小专家', condition: achievements.completedExperiments.length >= 6 },
          { id: 4, name: '洗衣机大师', condition: achievements.completedExperiments.length >= 9 }
        ];
        for (const rule of badgeRules) {
          if (rule.condition && !achievements.badges.some(b => b.id === rule.id)) {
            achievements.badges.push({ id: rule.id, name: rule.name, date: new Date().toLocaleString() });
          }
        }
        uni.setStorageSync('achievements', achievements);
      }

      uni.showModal({
        title: '恭喜完成实验！',
        content: '你已成功完成这个实验，要去看看你的实验记录吗？',
        confirmText: '查看记录',
        cancelText: '返回首页',
        success: (res) => {
          if (res.confirm) uni.redirectTo({ url: '/pages/record/record' });
          else uni.redirectTo({ url: '/pages/index/index' });
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 24rpx;
  background:
    radial-gradient(circle at 15% 8%, rgba(255, 182, 193, 0.25), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(135, 206, 250, 0.25), transparent 28%),
    radial-gradient(circle at 50% 50%, rgba(152, 251, 152, 0.15), transparent 40%),
    linear-gradient(180deg, #fff5f8 0%, #f0f8ff 48%, #f5fff9 100%);
  min-height: 100vh;
  position: relative;
}

.decor-bubbles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  animation: float-bubble 4s ease-in-out infinite;
}

.bubble-1 {
  width: 60rpx;
  height: 60rpx;
  top: 15%;
  left: 5%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 182, 193, 0.6), rgba(255, 182, 193, 0.2));
  animation-delay: 0s;
}

.bubble-2 {
  width: 40rpx;
  height: 40rpx;
  top: 30%;
  right: 8%;
  background: radial-gradient(circle at 30% 30%, rgba(135, 206, 250, 0.6), rgba(135, 206, 250, 0.2));
  animation-delay: 1s;
}

.bubble-3 {
  width: 50rpx;
  height: 50rpx;
  top: 60%;
  left: 8%;
  background: radial-gradient(circle at 30% 30%, rgba(152, 251, 152, 0.6), rgba(152, 251, 152, 0.2));
  animation-delay: 2s;
}

@keyframes float-bubble {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30rpx) scale(1.1); }
}

.header-section {
  margin-bottom: 30rpx;
  position: relative;
  z-index: 1;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 32rpx;
  color: #FF6B9D;
  margin-bottom: 20rpx;
  font-weight: 600;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.2);
}

.back-icon {
  font-size: 28rpx;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.title-icon {
  font-size: 48rpx;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B9D 0%, #FFB347 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.12);
  border: 3rpx solid rgba(255, 182, 193, 0.3);
  position: relative;
  z-index: 1;
}

.section::before {
  content: '✨';
  position: absolute;
  top: 12rpx;
  right: 16rpx;
  font-size: 24rpx;
  opacity: 0.5;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 4rpx dashed rgba(255, 182, 193, 0.4);
}

.section-icon {
  font-size: 40rpx;
  animation: bounce 2s ease-in-out infinite;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #D63384;
}

.optional {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
  margin-left: 8rpx;
}

.info-table {
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border-radius: 24rpx;
  overflow: hidden;
  border: 3rpx solid rgba(255, 182, 193, 0.3);
}

.info-row {
  display: flex;
  align-items: center;
  border-bottom: 3rpx dashed rgba(255, 182, 193, 0.3);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  width: 200rpx;
  padding: 20rpx 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #D63384;
  background: rgba(255, 107, 157, 0.1);
  flex-shrink: 0;
}

.label-icon {
  font-size: 28rpx;
}

.info-input, .picker-wrapper {
  flex: 1;
  height: 72rpx;
  font-size: 32rpx;
  color: #8B4513;
  padding: 0 20rpx;
  background: transparent;
  border: none;
}

.picker-value {
  height: 72rpx;
  line-height: 72rpx;
  color: #8B4513;
  font-size: 32rpx;
}

.table-description {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #8B5A2B;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #FFF9E6, #FFF0F5);
  border-radius: 16rpx;
  border-left: 6rpx solid #FFD93D;
}

.desc-icon {
  font-size: 28rpx;
}

.table-scroll {
  width: 100%;
  white-space: nowrap;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.1);
}

.data-table {
  min-width: 100%;
  display: table;
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  border: 3rpx solid rgba(255, 182, 193, 0.4);
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  display: table-row;
  background: linear-gradient(135deg, #FF6B9D, #FFB347);
  color: white;
  font-weight: 700;
  font-size: 28rpx;
}

.table-row {
  display: table-row;
  background: white;
  transition: background 0.2s;
}

.table-row:nth-child(even) {
  background: rgba(255, 245, 248, 0.5);
}

.table-row:hover {
  background: rgba(255, 182, 193, 0.1);
}

.th, .td {
  display: table-cell;
  padding: 18rpx 14rpx;
  vertical-align: middle;
  text-align: center;
  border-bottom: 2rpx solid rgba(255, 182, 193, 0.25);
  border-right: 2rpx solid rgba(255, 182, 193, 0.15);
}

.th:last-child, .td:last-child {
  border-right: none;
}

.table-row:last-child .td {
  border-bottom: none;
}

.th {
  font-weight: 700;
  vertical-align: middle;
}

.th-model, .td-model { 
  width: 200rpx; 
  min-width: 200rpx;
  text-align: center;
}
.th-speed, .td-speed, .th-rpm, .td-rpm { 
  width: 140rpx; 
  min-width: 140rpx;
  text-align: center;
}
.th-state, .td-state, .th-state-group, .td-state-group { 
  min-width: 280rpx;
  text-align: left;
}
.th-action, .td-action { 
  width: 80rpx; 
  min-width: 80rpx;
  text-align: center;
}

.model-picker { width: 100%; }
.picker-value-cell {
  font-size: 28rpx;
  color: #8B4513;
  padding: 12rpx 16rpx;
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border-radius: 16rpx;
  border: 2rpx solid rgba(255, 182, 193, 0.3);
  text-align: center;
  display: block;
}

.table-input, .state-input, .state-input-long {
  width: 100%;
  height: 64rpx;
  border: 3rpx solid rgba(255, 182, 193, 0.3);
  border-radius: 16rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background: linear-gradient(135deg, #FFFFFF, #FFF9FC);
  color: #8B4513;
  transition: all 0.3s ease;
}

.table-input:focus, .state-input:focus, .state-input-long:focus {
  border-color: #FF6B9D;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 157, 0.1);
}

.table-textarea {
  width: 100%;
  min-height: 96rpx;
  border: 3rpx solid rgba(255, 182, 193, 0.3);
  border-radius: 16rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  line-height: 1.6;
  background: linear-gradient(135deg, #FFFFFF, #FFF9FC);
  color: #8B4513;
  transition: all 0.3s ease;
}

.table-textarea:focus {
  border-color: #FF6B9D;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 157, 0.1);
}

.state-inputs {
  display: flex;
  gap: 12rpx;
  flex-wrap: nowrap;
  align-items: center;
}

.state-input { 
  width: 120rpx; 
  min-width: 120rpx;
}
.state-input-long { 
  flex: 1; 
  min-width: 160rpx;
}

.delete-btn-table {
  font-size: 36rpx;
  padding: 12rpx;
  display: inline-block;
  transition: transform 0.2s ease;
}

.delete-btn-table:active {
  transform: scale(0.9);
}

.add-btn {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: linear-gradient(135deg, #E8F4FD, #FFF5F8);
  color: #FF6B9D;
  border: 3rpx dashed rgba(255, 107, 157, 0.5);
  font-weight: 700;
  font-size: 30rpx;
  border-radius: 20rpx;
  padding: 20rpx 0;
}

.btn-icon {
  font-size: 28rpx;
}

.discovery-item {
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
  border: 3rpx solid rgba(255, 182, 193, 0.3);
}

.discovery-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.discovery-icon {
  font-size: 28rpx;
}

.discovery-label {
  font-size: 28rpx;
  color: #FF6B9D;
  font-weight: 700;
}

.discovery-textarea, .form-textarea, .summary-textarea {
  width: 100%;
  min-height: 140rpx;
  font-size: 30rpx;
  line-height: 1.8;
  color: #8B4513;
  padding: 0;
  background: transparent;
}

.remove-discovery {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: #CD5C5C;
  font-size: 24rpx;
  background: rgba(205, 92, 92, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
}

.remove-icon {
  font-size: 20rpx;
}

.ai-area {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 4rpx dashed rgba(255, 182, 193, 0.3);
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-weight: 700;
  color: #FF6B9D;
  margin-bottom: 16rpx;
  font-size: 30rpx;
}

.ai-icon {
  font-size: 32rpx;
}

.ai-rocket {
  font-size: 28rpx;
  animation: bounce 1s ease-in-out infinite;
}

.ai-row {
  display: flex;
  gap: 16rpx;
}

.ai-card {
  flex: 1;
  background: linear-gradient(135deg, #FF6B9D, #FFB347);
  color: white;
  padding: 20rpx;
  border-radius: 20rpx;
  text-align: center;
  font-weight: 700;
  font-size: 30rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.ai-card-icon {
  font-size: 32rpx;
}

.photo-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.upload-area {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border: 4rpx dashed rgba(255, 107, 157, 0.5);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-icon {
  font-size: 40rpx;
  color: #FF6B9D;
}

.upload-text {
  font-size: 24rpx;
  color: #8B5A2B;
  margin-top: 8rpx;
}

.upload-hint {
  font-size: 20rpx;
  color: #999;
}

.photo-item {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-delete, .video-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 32rpx;
  font-size: 24rpx;
}

.video-upload {
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border: 4rpx dashed rgba(255, 107, 157, 0.5);
  border-radius: 20rpx;
  height: 160rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-icon-video {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.video-preview {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 280rpx;
}

.rating-section {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  padding: 16rpx 0;
}

.star {
  font-size: 64rpx;
  color: #E0E0E0;
  transition: all 0.2s;
}

.star.active {
  color: #FFD700;
  transform: scale(1.2);
  animation: bounce 0.5s ease;
}

.rating-text {
  text-align: center;
  color: #FFD700;
  font-weight: 700;
  font-size: 32rpx;
  margin-top: 16rpx;
}

.summary-card {
  background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
  border-radius: 20rpx;
  padding: 20rpx;
  position: relative;
  border: 3rpx solid rgba(255, 182, 193, 0.3);
}

.ai-summary-btn {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: linear-gradient(135deg, #56AB2F, #A8E063);
  color: white;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(86, 171, 47, 0.3);
}

.ai-btn-icon {
  font-size: 22rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  position: relative;
  z-index: 1;
}

.save-btn, .complete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: white;
  border: none;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
}

.save-btn {
  background: linear-gradient(135deg, #4FACFE, #00F2FE);
  box-shadow: 0 6rpx 16rpx rgba(79, 172, 254, 0.4);
}

.complete-btn {
  background: linear-gradient(135deg, #FF6B9D, #FFB347);
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.4);
}

.bottom-space {
  height: 60rpx;
}
</style>
