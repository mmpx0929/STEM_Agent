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

import { buildScienceFlowCopy } from '../flow-copy-presets.js';

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

const BASE_MATERIALS = [
  { name: '塑料瓶', spec: '1000ml', qty: '1个', usage: '圆形底座（旋转飞椅底座）' },
  { name: '减速电机', spec: '130小电机', qty: '1个', usage: '提供旋转动力' },
  { name: '变速电路板', spec: '3v', qty: '1个', usage: '控制旋转速度' },
  { name: '电池', spec: '5号', qty: '3节', usage: '驱动电机转动的电源' },
  { name: '电池盒', spec: '3节5号', qty: '1个', usage: '装电池' },
  { name: '木棒', spec: '5mm*15cm', qty: '6支', usage: '支撑飞椅' },
  { name: '尼龙线', spec: '15cm', qty: '6根', usage: '连接飞椅和木棒' },
  { name: '五角星', spec: '3cm', qty: '6个', usage: '模拟飞椅' },
  { name: '塑料固定件', spec: '3cm', qty: '1个', usage: '固定木棒在电机上' },
  { name: '电线', spec: '15cm', qty: '2条', usage: '连接电机和电路板' },
  { name: '橡胶圈', spec: '4mm', qty: '6个', usage: '连接尼龙线便于安装在木棒上' },
  { name: '泡棉胶', spec: '2.5cm带孔', qty: '2个', usage: '用于安装电机在瓶子上' },
  { name: '彩色吸管', spec: '6mm', qty: '2根', usage: '用于装饰电线' }
];

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

const experimentId = 'science-03';
const flowTemplate = {
    id: 'science-03',
    ruleTips: {
      step4: '请选择并仅选择2个正确目标：比较结构稳定性，并观察转速变化对晃动的影响。',
      step5: '请选择正确的材料设计思路（逻辑1），并生成材料清单。',
      step6: '请先在变量控制表中完成三类变量配对，再进入下一步。'
    },
    step1: {
      options: [
        '假设 A（结构稳定方向）：支撑结构越均衡、重心越稳定，旋转时晃动越小，装置越稳定。',
        '假设 B（只看速度方向）：只要电机转得足够快，装置就一定会更稳定。'
      ],
      aiResult: {
        a: {
          title: '假设 A（结构稳定方向）',
          hypothesis: '在“{experiment}”中，结构越平衡，旋转时晃动越小，稳定性更好。',
          reason: '旋转时如果重心偏移，会不断拉扯结构产生摆动；重心越居中，系统越稳定。',
          explanation: '我们可以对比不同结构与配重方式，在相同转速下观察晃动差异，验证稳定性来源。'
        },
        b: {
          title: '假设 B（只看速度方向）',
          hypothesis: '在“{experiment}”中，速度会影响现象，但不是稳定性的唯一原因。',
          reason: '如果结构不平衡，速度越快反而可能晃动更大。',
          explanation: '稳定性通常由“结构 + 配重 + 速度”共同决定，不能只看速度。'
        }
      }
    },
    step3: {
      defaultQuestion: '为什么有些装置转得快却更晃动？结构稳定性和转速到底有什么关系？',
      correctReason: '结构越平衡、重心越稳定，旋转时受力更均匀，晃动就会更小。',
      correctExplanation:
        '本步重点验证“结构稳定性”与“旋转状态”的关系。只有先保证结构平衡，才更容易得到稳定、可重复的实验现象。',
      hypothesisOptions: [
        {
          key: 'A',
          icon: '🧩',
          text: '假设 A（结构稳定方向）：支撑结构越均衡、重心越稳定，旋转时晃动越小，装置越稳定。'
        },
        {
          key: 'B',
          icon: '⚡',
          text: '假设 B（只看速度方向）：只要电机转得足够快，装置就一定会更稳定。'
        }
      ]
    },
    step4: {
      requiredCorrectCount: 2,
      goals: [
        {
          id: 1,
          icon: '📐',
          text: '通过实验，比较不同结构与配重方式对稳定性的影响。',
          isCorrect: true
        },
        {
          id: 2,
          icon: '🔄',
          text: '通过实验，观察转速变化时模型晃动幅度的变化。',
          isCorrect: true
        },
        {
          id: 3,
          icon: '🌡️',
          text: '通过实验，测量教室温度变化对装置的影响。',
          isCorrect: false
        },
        {
          id: 4,
          icon: '🔋',
          text: '通过实验，比较不同电池品牌的放电速度。',
          isCorrect: false
        }
      ]
    },
    step5: {
      voiceGuideText:
        '要模拟滚筒旋转，同时还要带动衣服一起旋转，用什么实验材料或者是实验模型来做探究实验呢？请选择你认为合理的实验方案吧。',
      correctLogicKey: 'logic1',
      logicOptions: [
        {
          key: 'logic1',
          no: '逻辑1',
          title: '结构平衡对比方案（正确）',
          content:
            '设计两种不同结构或配重方式，在相同条件下测试晃动幅度，比较哪个更稳定，从而判断结构因素的作用。',
          videoUrl: '',
          videoPoster: ''
        },
        {
          key: 'logic2',
          no: '逻辑2',
          title: '随意手甩观察方案（干扰项）',
          content:
            '靠手感随机甩动虽然有趣，但变量太多，结果不稳定，无法有效比较不同结构的稳定性。',
          videoUrl: '',
          videoPoster: ''
        }
      ],
      baseMaterials: [...BASE_MATERIALS, { name: '配重夹', spec: '小型', qty: '2个', usage: '调整结构重心并做对比' }]
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
        { key: 'structure_balance', material: '支撑结构', content: '结构配重方式（均衡 / 不均衡）' },
        { key: 'shake_amplitude', material: '装置模型', content: '旋转时晃动幅度与稳定性变化' },
        { key: 'power_setting', material: '电机、电池、木棒', content: '电源与基础尺寸设置保持一致' }
      ],
      correctMap: {
        independent: 'structure_balance',
        dependent: 'shake_amplitude',
        control: 'power_setting'
      }
    },
    step7: {
      materialImageUrl: '/static/experiments/science-01/images/virtual-lab/0全部材料.jpg',
      majorSteps: [
        {
          key: 'step1',
          title: '准备稳定性对比材料与工具',
          summary: '先准备基础装置和配重工具。',
          lines: [
            '环节 1：准备基础材料，检查电机、木棒和连接件是否完好。',
            '环节 2：准备工具：剪刀、螺丝刀、配重夹。',
            '环节 3：设计“均衡结构”和“非均衡结构”两种方案。'
          ]
        },
        {
          key: 'step2',
          title: '搭建两组旋转模型',
          summary: '保持同源结构，仅改变配重方式。',
          lines: [
            '环节 1：先搭建标准模型，作为对照组。',
            '环节 2：复制第二组模型，仅改变配重或支撑布局。',
            '环节 3：检查两组模型除目标变量外其余设置保持一致。'
          ]
        },
        {
          key: 'step3',
          title: '同条件旋转并观察晃动',
          summary: '记录不同模型在同速/变速下的稳定表现。',
          lines: [
            '环节 1：两组模型都先在低速运行，观察晃动幅度。',
            '环节 2：再提高到高速，继续观察并记录变化。',
            '环节 3：比较两组模型在不同速度下的稳定性差异。'
          ]
        },
        {
          key: 'step4',
          title: '分析稳定性结论',
          summary: '总结“结构 + 速度”对稳定性的共同作用。',
          lines: [
            '环节 1：整理两组模型的晃动记录。',
            '环节 2：分析哪一种结构更稳定，以及原因。',
            '环节 3：写出结论：速度变化和结构平衡如何共同影响稳定性？'
          ]
        }
      ]
    },
    step9: {
      independentVariableLabel: '结构配重方式与旋转速度',
      dependentVariableLabel: '模型晃动幅度与稳定性',
      speedSlowLabel: '低速旋转',
      speedFastLabel: '高速旋转',
      slowOptions: [
        '低速时两组都较稳定，但不均衡结构出现轻微晃动。',
        '低速时不均衡结构反而完全不晃。',
        '低速时两组都剧烈晃动。'
      ],
      fastOptions: [
        '高速时不均衡结构晃动明显增大，均衡结构更稳定。',
        '高速时两组晃动都没有变化。',
        '高速时不均衡结构更稳定。'
      ],
      expected: { slow: 0, fast: 0 },
      defaultFinding:
        '数据表明：结构平衡会显著影响稳定性；在更高转速下，不平衡结构更容易出现较大晃动。'
    },
    step10: {
      resultOptions: COMMON_RESULT_OPTIONS,
      phenomenonPlaceholder: '例如：高速时，不均衡结构晃动更明显；均衡结构保持相对稳定。',
      principleTip: '点击“AI生成原理解释”，可以自动生成更适合孩子理解的说明。',
      referencePrinciple:
        '旋转系统的稳定性与重心位置密切相关。重心越偏离旋转中心，旋转时就越容易产生周期性摆动，速度越高这种摆动可能越明显。结构均衡、配重合理能让受力更均匀，从而提高稳定性。',
      kidPrinciple:
        '把装置想成转圈圈的小陀螺。重心放得正，它就转得稳；重心歪了，它就会摇摇晃晃。转得越快，歪重心带来的晃动通常会更明显。',
      improvementPlaceholder:
        '例如：后续可加入“多轮重复测量”和“不同配重位置图示”，让稳定性结论更直观。'
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
      step1: '【填写 step1 提示】',
      step2: '【填写 step2 提示】',
      step3: '【填写 step3 提示】',
      step4: '【填写 step4 提示】',
      step5: '【填写 step5 提示】',
      step6: '【填写 step6 提示】',
      step7: '【填写 step7 提示】',
      step8: '【填写 step8 提示】',
      step9: '【填写 step9 提示】',
      step10: '【填写 step10 提示】'
    },

  },
  // 兼容旧 ruleTips，建议保留
  (flowTemplate && flowTemplate.ruleTips) || {}
);


const config = {
  id: experimentId,
  templateType: 'science',
  legacyId: 3,
  title: '方/圆形滚筒的旋转应力与稳定性实验探究',
  summary: '对比不同结构下的稳定性和应力表现。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/science-03/videos/intro.mp4'
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


