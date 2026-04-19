const GUIDE_RECORD_STORAGE_KEY = 'ai_guide_play_records';
const sessionPlayedKeys = new Set();

// 为小朋友设计的语音引导文本
// 特点：
// 1. 使用亲切的称呼（小朋友、小科学家）
// 2. 语气活泼、有鼓励性
// 3. 用词简单易懂
// 4. 加入互动元素（提问、邀请）
export const GUIDE_SCRIPTS = {
  index: {
    guideText: '小朋友你好～欢迎来到洗衣机 STEM 探索世界！洗衣机是我们生活里超厉害的小帮手，藏着超有趣的科学秘密。快看完眼前的小视频，跟着一起做实验、搭模型，亲手设计属于你的专属洗衣机吧！准备好了吗？小小科学家，出发探索啦！',
    repeatPolicy: 'always'
  },
  principle: {
    guideText: '小科学家，我们来看看实验原理吧！先仔细观察这些有趣的现象，然后动动小脑筋，想想为什么会这样呢？',
    repeatPolicy: 'always'
  },
  detail: {
    guideText: '这里是实验详情哦！先看看我们的小目标是什么，然后就可以开始学习新知识，或者动手做实验啦！',
    repeatPolicy: 'always'
  },
  plan: {
    guideText: '太棒了！现在我们要设计实验方案啦～先写下你想探索的问题，然后想一想怎么改变条件，最后规划一下实验步骤。加油！',
    repeatPolicy: 'always'
  },
  'plan-detail': {
    guideText: '来看看你设计的实验方案吧！重点关注一下：我们要改变什么？要测量什么？还有怎么记录数据哦～',
    repeatPolicy: 'always'
  },
  'build-lab': {
    guideText: '哇，到虚拟搭建环节啦！小建议：先把基础结构搭好，再慢慢安装会动的部件。就像搭积木一样，一步一步来！',
    repeatPolicy: 'always'
  },
  build: {
    guideText: '开始动手搭建吧！每完成一步，记得检查一下连接是不是牢固，这样你的模型才会又稳又棒哦！',
    repeatPolicy: 'always'
  },
  'data-record': {
    guideText: '现在是记录数据的时间！既要写下你看到的有趣现象，也要记下数字数据。这样你的实验结论才会更有说服力呢！',
    repeatPolicy: 'always'
  },
  record: {
    guideText: '这里是你的实验记录本～可以回顾之前的实验，看看有什么新发现，也可以想想怎么改进你的实验方案哦！',
    repeatPolicy: 'always'
  },
  'record-detail': {
    guideText: '来看看这次实验的详细记录吧！先看看重要的数据，然后总结一下你的发现，还有下次可以怎么做得更好～',
    repeatPolicy: 'always'
  },
  growth: {
    guideText: '欢迎来到你的成长天地！这里记录了你所有的实验进度、能力成长，让我们继续努力探索科学的世界吧。你真棒，继续加油！',
    repeatPolicy: 'always'
  },
  'experiment-step1': {
    guideText: '先看完引导视频，再说出你的第一个猜想。大胆想，科学就是从好奇开始的。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step2': {
    guideText: '这里要填写实验基础信息：谁来做、什么时候做、在哪里做。信息完整，后面分析才更准确。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step3': {
    guideText: '把科学问题说清楚，再写下你的假设。问题越清楚，实验越容易成功。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step4': {
    guideText: '选实验目标时，先想“我到底要验证什么”。目标选对了，后面的步骤会更顺。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step5': {
    guideText: '现在挑选材料与设计思路。记住：材料要能真正帮助我们验证前面的问题。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step6': {
    guideText: '这是变量设计。你主动改变的是自变量，跟着变化的是因变量，保持一致的是不变量。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step7': {
    guideText: '按正确顺序完成实验步骤，别跳步。每一步都在为最后结论收集证据。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step8': {
    guideText: '开始虚拟实验探究操作啦！先完成模型探究搭建，再进入探究观察环节，完成后记得上传证据。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step9': {
    guideText: '把观察到的数据写下来，再做分析。先描述现象，再解释原因，最后给出发现。',
    repeatPolicy: 'once_per_session'
  },
  'experiment-step10': {
    guideText: '最后一步是实验结论报告。把现象、原理、效果和改进建议都表达清楚。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step1': {
    guideText: '先看场景问题视频，想想生活里真正遇到的困难是什么。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step2': {
    guideText: '在两个场景问题里选出最需要解决的那个，这一步决定工程方向。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step3': {
    guideText: '选择科学原理时，优先想“哪个原理最能直接解决这个问题”。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step4': {
    guideText: '开始工程方案设计，功能、性能、成本、安全四个目标都要考虑到。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step5': {
    guideText: '一键生成工程方案表前，先检查前面选择是否完整、是否合理。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step6': {
    guideText: '虚拟搭建时先做基础结构，再做部件融合。每成功一步都会更接近最终成品。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step7': {
    guideText: '测试时要记录现象和目标达成度，数据越真实，优化建议越有价值。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step8': {
    guideText: '根据测试问题做迭代，先抓最关键的问题结构，再提出替换方案。',
    repeatPolicy: 'once_per_session'
  },
  'engineering-step9': {
    guideText: '请写下成果结论和反思。工程师最重要的能力之一就是复盘和改进。',
    repeatPolicy: 'once_per_session'
  },
  'record-detail-plan': {
    guideText: '这里是方案设计详情。先看目标和步骤是否一致，再看材料和变量是否匹配。',
    repeatPolicy: 'once_per_session'
  },
  'record-detail-data': {
    guideText: '这里是数据记录详情。先看观察记录，再看关键发现是否由数据支持。',
    repeatPolicy: 'once_per_session'
  },
  'record-detail-report': {
    guideText: '这里是结论报告详情。重点看结论是否回答了最初问题，并有改进方向。',
    repeatPolicy: 'once_per_session'
  },
  'offline-guide': {
    guideText: '接下来是线下实验时间！记得请爸爸妈妈或者老师陪你一起完成哦，安全第一，玩得开心！',
    repeatPolicy: 'always'
  },
  test: {
    guideText: '这是测试页面～你可以在这里试试和AI助手聊天，或者测试一下语音功能是不是正常工作。有什么问题随时问我哦！',
    repeatPolicy: 'always'
  }
};

const readGuideRecords = () => {
  try {
    const raw = uni.getStorageSync(GUIDE_RECORD_STORAGE_KEY);
    if (raw && typeof raw === 'object') return raw;
  } catch (error) {
    console.error('读取引导播放记录失败:', error);
  }
  return {};
};

const writeGuideRecords = (records) => {
  try {
    uni.setStorageSync(GUIDE_RECORD_STORAGE_KEY, records || {});
  } catch (error) {
    console.error('保存引导播放记录失败:', error);
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

  if (policy === 'once') {
    return false;
  }
  if (policy === 'once_per_day') {
    return !isSameDay(playedAt, Date.now());
  }
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
