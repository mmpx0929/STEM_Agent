import { buildScienceFlowCopy } from '../flow-copy-presets.js';

export const SCIENCE_STEP_SCENE_MAP = {
  step1: 'principle',
  step2: 'planning',
  step3: 'planning',
  step4: 'planning',
  step5: 'planning',
  step6: 'matching',
  step7: 'planning',
  step8: 'virtualLab',
  step9: 'dataAnalysis',
  step10: 'experimentSummary'
};

export const SCIENCE_STEP_GUIDE_TEXT_MAP = {
  step1: '让我们先根据视频中的内容，认真观察现象，然后大胆写下你的猜想吧！想法越清楚，实验越顺利哦～',
  step2: '请先把基础信息填完整，这样你的记录和报告会更规范。',
  step3: '让我们再次回顾下此次实验要搞清楚的科学问题吧！明确了科学问题与假设，实验才会高效哦。',
  step4: '请选择真正和本实验相关的目标，选择完成后记得让AI小助手帮你分析你的选择是否正确哦。',
  step5: '要模拟滚筒旋转，同时还要带动衣服一起旋转，用什么实验材料或者是实验模型来做探究实验呢？请选择你认为合理的实验方案吧。',
  step6: '变量设计很关键：请先认识什么是自变量、因变量和不变量，再做出对应的选择吧。',
  step7: '按照顺序完成实验步骤，不跳步，才能得到可靠结果。请选择你认为正确的实验步骤吧',
  step8: '先完成模型搭建，再完成低速和高速观察；线下成果上传是可选项。',
  step9: '数据分析先写现象，再提发现，最后再生成数据记录表。',
  step10: '请把现象、原理、效果、改进都写完整，形成你的结论报告。'
};

const __assetsDeepClone = (value) => JSON.parse(JSON.stringify(value || {}));
const __assetsIsObject = (value) => value && typeof value === 'object';

const __assetsCollectMedia = (node, path, buckets) => {
  if (Array.isArray(node)) {
    node.forEach((item, index) => __assetsCollectMedia(item, `${path}[${index}]`, buckets));
    return;
  }

  if (!__assetsIsObject(node)) return;

  Object.keys(node).forEach((key) => {
    const value = node[key];
    const nextPath = path ? `${path}.${key}` : key;

    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower.endsWith('.mp4')) buckets.videos[nextPath] = value;
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
        buckets.images[nextPath] = value;
      }
      return;
    }

    __assetsCollectMedia(value, nextPath, buckets);
  });
};

export const buildExperimentAssets = (flowTemplate, intro = {}) => {
  const buckets = {
    videos: {},
    images: {}
  };

  if (intro && intro.step1VideoUrl) buckets.videos['intro.step1VideoUrl'] = intro.step1VideoUrl;
  if (intro && intro.homeVideoUrl) buckets.videos['intro.homeVideoUrl'] = intro.homeVideoUrl;

  __assetsCollectMedia(__assetsDeepClone(flowTemplate || {}), 'steps', buckets);
  return buckets;
};

const STEP6_TYPE_ROWS = [
  { typeKey: 'independent', label: '自变量', definition: '你主动改变的条件（例如把速度调慢或调快）' },
  { typeKey: 'dependent', label: '因变量', definition: '会跟着变化、需要观察和记录的结果' },
  { typeKey: 'control', label: '不变量', definition: '每次都保持不变的条件（保证对比公平）' }
];

const COMMON_RESULT_OPTIONS = [
  '基本达到实验目的',
  '达到实验目的，并且效果很明显',
  '部分达到目标，还需要继续改进'
];

const experimentId = 'science-02';
const flowTemplate = {
    id: 'science-02',
    ruleTips: {
      step4: '请选择2个正确的目标：观察不同转速下五角星的脱离现象，并验证离心力与转速的关系。',
      step5: '请选择正确的材料设计思路，并生成材料清单。',
      step6: '请先在变量控制表中完成三类变量配对，再进入下一步。'
    },
    step1: {
      options: [
        '假设 A（改变连接方式方向）：把固定五角星的绳子改为磁铁连接。旋转速度加快后，离心力变大，五角星就会挣脱磁力飞出去。',
        '假设 B（缩短连接长度方向）：把固定五角星的绳子变短，旋转变快时，五角星就更容易被甩出去。'
      ],
      aiResult: {
        a: {
          title: '假设 A（改变连接方式方向）',
          hypothesis: '在“{experiment}”中，把绳子连接改成磁铁连接后，随着旋转速度不断升高，五角星更可能挣脱磁力飞出去。',
          reason: '磁力既能把五角星先固定住，又能在离心力足够大时表现出“先吸住、再脱离”的变化过程。',
          explanation:
            '如果低速时五角星只是飞起来但没有飞出去，高速时却能挣脱磁力飞出，就能更清楚地看到离心力随着转速增加而变大的过程。'
        },
        b: {
          title: '假设 B（缩短连接长度方向）',
          hypothesis: '在“{experiment}”中，缩短连接长度会改变结构状态，但不一定能直接让孩子观察到“挣脱后飞出去”的关键现象。',
          reason: '绳子变短可能会改变飞行幅度，却不容易形成“先被吸住、再突然脱离”的清晰观察过程。',
          explanation:
            '和磁力连接相比，缩短绳子更像是在改结构尺寸，难以直观验证“离心力超过吸附力后脱离”的核心原理。'
        }
      }
    },
    step3: {
      defaultQuestion: '在上一次实验方案的基础上进行怎样的设计，才可以观察到五角星因为旋转速度不断增加，从旋转装置上飞出去？',
      correctReason: '当连接方式改为磁铁后，随着转速上升，离心效应会逐渐超过磁力约束，更容易出现脱离现象。',
      correctExplanation:
        '本步要验证“结构连接方式 + 转速变化”对结果的影响。使用正确假设可以帮助你聚焦“何时、为什么会飞出去”。',
      hypothesisOptions: [
        {
          key: 'A',
          icon: '🧲',
          text: '假设 A（改变连接方式方向）：把固定五角星的绳子改为磁铁连接。旋转速度加快后，离心力变大，五角星就会挣脱磁力飞出去。'
        },
        {
          key: 'B',
          icon: '📏',
          text: '假设 B（缩短连接长度方向）：把固定五角星的绳子变短，旋转变快时，五角星就更容易被甩出去。'
        }
      ]
    },
    step4: {
      requiredCorrectCount: 2,
      goals: [
        {
          id: 1,
          icon: '🧪',
          text: '通过实验，调节旋转装置的转速，观察并记录五角星在速度变化下的状态，验证高速旋转产生的离心力能否让五角星挣脱磁铁吸附并飞离装置。',
          isCorrect: true
        },
        {
          id: 2,
          icon: '🔍',
          text: '通过实验，仔细观察五角星挣脱磁力飞出去的瞬间，看清飞行方向、脱离时机和完整现象，感受离心力大小与旋转速度的关系。',
          isCorrect: true
        },
        {
          id: 3,
          icon: '🌡️',
          text: '通过实验，测量教室温度、湿度和风速是否有明显变化。',
          isCorrect: false
        },
        {
          id: 4,
          icon: '🔋',
          text: '通过实验，统计不同速度下电池电量下降了多少。',
          isCorrect: false
        }
      ]
    },
    step5: {
      voiceGuideText:
        '在上一次实验方案的基础上进行怎样的设计，才可以观察到五角星因为旋转速度不断增加，从旋转装置上飞出去？让我们带着问题来看看下面的视频吧。',
      correctLogicKey: 'logic1',
      logicOptions: [
        {
          key: 'logic1',
          no: '场景构思',
          title: '磁力升级旋转装置',
          content:
            '直接在上一次实验材料的基础上进行升级，把固定五角星的绳子改为磁铁连接，形成磁力旋转装置。这样低速时五角星会飞起来但不脱离，高速时离心力增大，就可能挣脱磁力飞出去。',
          videoUrl: '/static/experiments/science-02/videos/5-1.mp4',
          videoPoster: ''
        }
      ],
      baseMaterials: [
        { name: '木棒', spec: '5mm*15cm', qty: '6支', usage: '支撑飞椅' },
        { name: '尼龙线', spec: '15cm', qty: '6根', usage: '连接磁铁和木棒' },
        { name: '五角星', spec: '3cm', qty: '6个', usage: '模拟飞椅' },
        { name: '环形磁铁', spec: '直径2cm', qty: '6个', usage: '吸引回形针，让五角星先固定住' },
        { name: '回形针', spec: '2.8cm', qty: '6颗', usage: '挂在五角星上，与磁铁连接' },
        { name: '橡胶圈', spec: '4mm', qty: '6个', usage: '连接尼龙线，便于安装在木棒上' },
        { name: '塑料固定件', spec: '3cm', qty: '1个', usage: '固定木棒在电机上' },
        { name: '旋转飞椅模拟装置', spec: '上一次实验成品', qty: '1台', usage: '作为升级改造的基础装置' }
      ]
    },
    step6: {
      introTitle: '先明确三类变量，再开始实验',
      introLines: [
        '自变量：你要主动改变的条件。比如本实验中，把电机速度从低调到高，就是在改变自变量。',
        '因变量：会随着自变量变化而变化的结果。比如五角星飞得高不高、远不远，就是因变量。',
        '不变量：每次都要保持一致的条件。比如材料大小、连接方式、观察时间保持一致，实验结果才公平、可比较。'
      ],
      typeRows: STEP6_TYPE_ROWS,
      optionList: [
        { key: 'motor_speed', material: '电机', content: '电机旋转速度从低到高' },
        { key: 'star_release_state', material: '五角星', content: '五角星是否脱离、何时脱离、怎样飞出去' },
        { key: 'fixed_condition', material: '木棒、尼龙线、磁铁', content: '木棒和尼龙线的长短、磁铁大小和数量保持一致' }
      ],
      correctMap: {
        independent: 'motor_speed',
        dependent: 'star_release_state',
        control: 'fixed_condition'
      }
    },
    step7: {
      materialImageUrl: '/static/experiments/science-02/images/材料与步骤图/全部材料.jpg',
      majorSteps: [
        {
          key: 'step1',
          title: '准备实验材料、实验工具',
          summary: '先检查升级实验所需的材料是否齐全。',
          lines: [
            '环节 1：准备实验材料和实验工具，核对木棒、尼龙线、五角星、环形磁铁、回形针、橡胶圈、塑料固定件、旧款旋转飞椅模拟装置是否齐全。',
            '环节 2：观察材料的连接位置，想一想哪些材料会参与磁力升级搭建。',
            '环节 3：确认旧款旋转装置可以作为后续更换的基础。'
          ]
        },
        {
          key: 'step2',
          title: '改装旋转飞椅模拟装置',
          summary: '完成磁力旋转装置搭建，并替换旧装置。',
          lines: [
            '环节 1：组装磁力旋转装置，使用塑料固定件、木棒、尼龙线、橡胶圈、环形磁铁、回形针、五角星完成连接。',
            '环节 2：更换旋转装置，用磁力旋转装置将原本的旋转装置更换下来。',
            '环节 3：检查每个五角星是否都被磁力吸住，准备进入速度观察。'
          ]
        },
        {
          key: 'step3',
          title: '控制变量进行实验现象的探究与发现',
          summary: '通过低速和高速两种情况观察五角星脱离现象。',
          lines: [
            '环节 1：控制装置低速旋转，观察五角星是否飞起来、是否脱落。',
            '环节 2：逐步把装置从低速调到高速，观察五角星是否越飞越高，最后是否飞出去。',
            '环节 3：比较低速和高速下五角星的状态差异。'
          ]
        },
        {
          key: 'step4',
          title: '总结实验现象并进行数据记录与分析',
          summary: '把观察结果整理成数据记录，并得出结论。',
          lines: [
            '环节 1：进行实验数据记录，写清楚低速和高速时五角星的现象。',
            '环节 2：分析数据记录表，总结实验现象和原理，判断是否支持“磁力连接更便于观察脱离过程”的假设。',
            '环节 3：准备一键生成实验报告。'
          ]
        }
      ]
    },
    step9: {
      independentVariableLabel: '旋转速度（低速 / 高速）',
      dependentVariableLabel: '五角星脱离状态与飞行现象',
      speedSlowLabel: '低速旋转',
      speedFastLabel: '高速旋转',
      slowOptions: [
        '五角星飞了起来，但还没有挣脱磁力飞出去。',
        '五角星一开始就全部飞了出去。',
        '五角星完全没有任何变化，一直贴在中心。'
      ],
      fastOptions: [
        '五角星越飞越高，最后挣脱磁力飞了出去。',
        '五角星和低速时完全一样，没有脱离现象。',
        '五角星高速时反而更靠近中心，飞行高度变低。'
      ],
      expected: { slow: 0, fast: 0 },
      defaultFinding:
        '数据表明：低速时五角星只是飞起来但没有脱离，高速时五角星越飞越高，最后挣脱磁力飞出去，说明旋转速度越高，离心力越大，更容易让五角星脱离旋转装置。'
    },
    step10: {
      resultOptions: COMMON_RESULT_OPTIONS,
      phenomenonPlaceholder: '例如：低速时五角星飞起来但没有飞出去；高速时五角星越飞越高，最后挣脱磁力飞了出去。',
      principleTip: '点击“AI生成原理解释”，可以自动生成更适合孩子理解的说明。',
      referencePrinciple:
        '在这个实验中，五角星先通过磁铁和回形针被吸附在旋转装置上。低速旋转时，向外甩出的离心效应还不够强，五角星虽然会飞起来，但还不会挣脱磁力。随着转速不断升高，五角星受到的向外运动趋势越来越明显，当这种趋势超过磁力提供的吸附作用时，五角星就会脱离旋转装置并沿着切线方向飞出去。',
      kidPrinciple:
        '你可以把五角星想成坐在旋转飞椅上的小朋友，磁铁就像先把他轻轻吸住的小手。转得慢时，小手还能拉得住；转得越来越快时，五角星就越来越想往外跑，最后就会挣脱这只“小手”飞出去。这说明旋转越快，离心力越大。',
      improvementPlaceholder:
        '例如：如果这次实验没有达到预期效果，可以继续优化磁铁大小、连接位置和五角星重量，再重新设计实验方案，看看怎样更容易观察到脱离现象。'
    }
  };
flowTemplate.voiceGuide = {
  stepGuideTextMap: SCIENCE_STEP_GUIDE_TEXT_MAP,
  stepSceneMap: SCIENCE_STEP_SCENE_MAP
};

const flowCopy = buildScienceFlowCopy(
  {
    // 顶部与卡片标题文案
    tips: {
      ruleTitle: '过关小提示',
      missingTitle: '你还差这一步',
      readyTitle: '可以继续啦',
      readyText: '这一步已经完成，点击“继续下一步”吧。'
    },

    // 绿卡“可继续”提示模板
    stepAction: {
      completeAllText: '全部步骤都完成了，点击“完成本次实验”吧。',
      // 注意：必须保留 {nextTitle} 占位符
      toNextTemplate: '这一步已经完成，下一步去“{nextTitle}”。'
    },

    // 黄卡每一步提示文案（科学流程 step1~step10）
    stepRuleTips: {
      step1: '请先完整观看视频，再进行观察思考并填写假设。',
      step2: '请填写参与人员、实验日期、实验环境。',
      step3: '请填写科学问题与实验假设。',
      step4: '请选择两个正确目标，明确我们的实验目的。',
      step5: '请认真观看完视频，然后准备好实验材料清单中的材料哦。',
      step6: '请选择正确的变量材料与变量内容。',
      step7: '请按顺序选择 4 个实验步骤，然后点击“生成实验方案设计”。',
      step8: '请完成虚拟实验探究操作（模型搭建 + 低速/高速观察）。',
      step9: '请先完成不同旋转速度对应的现象选择，然后点击“生成数据记录与分析表”。',
      step10: '请完整填写现象、原理、效果与改进，并点击“生成实验结论报告”。'
    },

  },
  // 兼容旧 ruleTips，建议保留
  (flowTemplate && flowTemplate.ruleTips) || {}
);


const config = {
  id: experimentId,
  templateType: 'science',
  legacyId: 2,
  title: '旋转飞椅的离心力脱离原理验证与数据分析',
  summary: '记录实验数据，分析离心效应和条件关系。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/science-02/videos/intro.mp4'
  },
  voiceGuide: {
    stepGuideTextMap: SCIENCE_STEP_GUIDE_TEXT_MAP,
    stepSceneMap: SCIENCE_STEP_SCENE_MAP
  },
  flowCopy,
  flowTemplate
};

config.assets = buildExperimentAssets(flowTemplate, config.intro);

export default config;


