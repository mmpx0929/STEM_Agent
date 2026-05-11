const GUIDE_RECORD_STORAGE_KEY = 'ai_guide_play_records';
const sessionPlayedKeys = new Set();

export const GUIDE_SCRIPTS = {
  "index": {
    guideText: "小朋友你好，欢迎来到洗衣机 STEM 探索世界。先看导学视频，再选择一个实验开始探索吧。",
    guideAudio: "/static/audio/home.mp3",
    repeatPolicy: 'always'
  },
  "record": {
    guideText: "这里是实验记录中心。你可以回看之前的方案、数据和报告。",
    guideAudio: "/static/audio/record.mp3",
    repeatPolicy: 'always'
  },
  "record-detail-plan": {
    guideText: "这里是方案设计详情。先看目标和步骤是否一致，再看材料和变量是否匹配。",
    guideAudio: "/static/audio/record_1.mp3",
    repeatPolicy: 'always'
  },
  "record-detail-data": {
    guideText: "这里是数据记录详情。先看观察记录，再看关键发现是否有数据支持。",
    guideAudio: "/static/audio/record_2.mp3",
    repeatPolicy: 'always'
  },
  "record-detail-report": {
    guideText: "这里是结论报告详情。重点看结论是否回答了最初问题，并给出改进方向。",
    guideAudio: "/static/audio/record_3.mp3",
    repeatPolicy: 'always'
  },
  "growth": {
    guideText: "欢迎来到成长中心。这里会记录你的实验进度和能力成长。",
    guideAudio: "/static/audio/growth.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step1": {
    guideText: "先看完引导视频，再说出你的第一个猜想。科学探索从好奇开始。",
    guideAudio: "/static/audio/science_step1.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step2": {
    guideText: "这里要填写实验基础信息，包括谁来做、什么时候做、在哪里做。",
    guideAudio: "/static/audio/science_step2.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step3": {
    guideText: "把科学问题说清楚，再写下你的假设。问题越清楚，实验越容易成功。",
    guideAudio: "/static/audio/science_step3.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step4": {
    guideText: "选择实验目标时，先想清楚我们到底要验证什么。目标选对了，后面的步骤会更顺。",
    guideAudio: "/static/audio/science_step4.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step5": {
    guideText: "现在挑选材料与设计思路。材料要能帮助我们验证前面提出的问题。",
    guideAudio: "/static/audio/science_step5.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step6": {
    guideText: "这是变量设计。主动改变的是自变量，跟着变化的是因变量，需要保持一致的是不变量。",
    guideAudio: "/static/audio/science_step6.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step7": {
    guideText: "请按正确顺序完成实验步骤。每一步都在为最后的结论收集证据。",
    guideAudio: "/static/audio/science_step7.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step8": {
    guideText: "开始虚拟实验操作。先完成模型搭建，再进行观察，完成后记得上传证据。",
    guideAudio: "/static/audio/science_step8.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step9": {
    guideText: "把观察到的数据写下来，再进行分析。先描述现象，再解释原因，最后给出发现。",
    guideAudio: "/static/audio/science_step9.mp3",
    repeatPolicy: 'always'
  },
  "experiment-step10": {
    guideText: "最后一步是实验报告。把现象、原理、结果和改进建议表达清楚。",
    guideAudio: "/static/audio/science_step10.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step1": {
    guideText: "先看场景问题视频，想一想生活里真正遇到的困难是什么。",
    guideAudio: "/static/audio/engineering_step1.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step2": {
    guideText: "在场景问题里选出最需要解决的那个，这一步会决定工程设计方向。",
    guideAudio: "/static/audio/engineering_step2.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step3": {
    guideText: "选择科学原理时，优先想哪一个原理最能直接解决这个问题。",
    guideAudio: "/static/audio/engineering_step3.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step4": {
    guideText: "开始工程方案设计。功能、性能、成本和安全都要一起考虑。",
    guideAudio: "/static/audio/engineering_step4.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step5": {
    guideText: "生成工程方案表前，先检查前面的选择是否完整、合理。",
    guideAudio: "/static/audio/engineering_step5.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step6": {
    guideText: "虚拟搭建时先做基础结构，再进行部件组合。每成功一步都更接近最终成品。",
    guideAudio: "/static/audio/engineering_step6.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step7": {
    guideText: "测试时要记录现象和目标达成情况。数据越真实，优化建议越有价值。",
    guideAudio: "/static/audio/engineering_step7.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step8": {
    guideText: "根据测试问题做迭代。先抓住最关键的问题，再提出替换或改进方案。",
    guideAudio: "/static/audio/engineering_step8.mp3",
    repeatPolicy: 'always'
  },
  "engineering-step9": {
    guideText: "请写下成果结论和反思。工程师很重要的能力就是复盘和改进。",
    guideAudio: "/static/audio/engineering_step9.mp3",
    repeatPolicy: 'always'
  }
};

const readGuideRecords = () => {
  try {
    const raw = uni.getStorageSync(GUIDE_RECORD_STORAGE_KEY);
    if (raw && typeof raw === 'object') return raw;
  } catch (error) {
    console.error('??????????:', error);
  }
  return {};
};

const writeGuideRecords = (records) => {
  try {
    uni.setStorageSync(GUIDE_RECORD_STORAGE_KEY, records || {});
  } catch (error) {
    console.error('??????????:', error);
  }
};

const isSameDay = (leftTs, rightTs) => {
  if (!leftTs || !rightTs) return false;
  const left = new Date(leftTs);
  const right = new Date(rightTs);
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
};

export const resolveGuideScript = (guideKey) => {
  if (!guideKey) return null;
  return GUIDE_SCRIPTS[guideKey] || null;
};

export const shouldAutoPlayGuide = (guideKey, repeatPolicy = 'always') => {
  if (!guideKey) return true;
  const policy = repeatPolicy || 'always';
  if (policy === 'always') return true;

  if (policy === 'once_per_session') {
    return !sessionPlayedKeys.has(guideKey);
  }

  const records = readGuideRecords();
  const playedAt = records[guideKey] || 0;
  if (!playedAt) return true;

  if (policy === 'once') return false;
  if (policy === 'once_per_day') return !isSameDay(playedAt, Date.now());
  return true;
};

export const markGuidePlayed = (guideKey) => {
  if (!guideKey) return;
  sessionPlayedKeys.add(guideKey);
  const records = readGuideRecords();
  records[guideKey] = Date.now();
  writeGuideRecords(records);
};

export default {
  GUIDE_SCRIPTS,
  resolveGuideScript,
  shouldAutoPlayGuide,
  markGuidePlayed
};
