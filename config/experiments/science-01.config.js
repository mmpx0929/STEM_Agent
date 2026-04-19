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
  step8: '让我们先来完成模型的搭建，然后再完成低速和高速观察；小朋友们也可以拿出实物材料，遇到困难可以根据下面的实践视频一起操作哦。',
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
  '基本达成实验目的',
  '达成实验目的，并且效果很明显',
  '部分达成目标，还需要继续改进'
];

const experimentId = 'science-01';
const flowTemplate = {
    id: 'science-01',
    ruleTips: {
      step4: '请选择2个正确的实验目标：研究甩干原因和转速对脱水的影响。',
      step5: '请选择正确的材料设计思路（逻辑1），并生成材料清单。',
      step6: '请先在变量控制表中完成三类变量配对，再进入下一步。'
    },
    step1: {
      discoveryQuestion: '发现问题：为什么衣服在洗衣机里洗完后拿出来不滴水，都快干了呢？',
      options: [
        '假设 A（离心力方向）：洗衣机滚筒快速旋转时，水会被“甩”到滚筒外面，转速越快，甩出去的水越多，所以衣服就不怎么滴水了。',
        '假设 B（风力 / 吹风方向）：洗衣机快速转动时会产生很大的风，风把衣服上的水吹干了，就像风扇吹湿衣服一样，所以衣服摸起来快干了。'
      ],
      aiResult: {
        a: {
          title: '假设 A（离心力方向）',
          hypothesis: '在“{experiment}”中，滚筒转速越高，衣物上的水更容易沿切线方向被甩出，残留水分更少。',
          reason: '旋转会让水滴更难继续附着在衣物纤维上，转速越高该效应越明显。',
          explanation:
            '快速旋转时，衣物和水都在做圆周运动。水受到的约束不足，会从滚筒孔和衣物表面分离，因此脱水效率随转速提升。'
        },
        b: {
          title: '假设 B（风力 / 吹风方向）',
          hypothesis: '在“{experiment}”中，旋转引起的气流可以辅助带走部分表面水分，但主要脱水机制不是风干。',
          reason: '风力对衣物表面水分有帮助，但无法解释短时间内大量脱水现象。',
          explanation:
            '风主要作用于蒸发过程，通常更慢；洗衣机甩干阶段的快速去水，核心还是旋转带来的离心分离，风力属于辅助因素。'
        }
      }
    },
    step3: {
      defaultQuestion: '为什么洗衣机最后会转得那么快？为什么衣服从洗衣机里拿出来后不怎么滴水，感觉快要干了？',
      correctReason: '滚筒转得越快，衣物和水在旋转中的分离效应越明显，水更容易从衣物上脱离。',
      correctExplanation:
        '甩干阶段主要验证“转速提升会让水被更快甩出”这一规律。对比不同转速下的现象，就能清楚看到离心分离的效果。',
      hypothesisOptions: [
        {
          key: 'A',
          icon: '🌀',
          text: '假设 A（离心力方向）：洗衣机滚筒快速旋转时，水会被“甩”到滚筒外面，转速越快，甩出去的水越多，所以衣服就不怎么滴水了。'
        },
        {
          key: 'B',
          icon: '🌬️',
          text: '假设 B（风力 / 吹风方向）：洗衣机快速转动时会产生很大的风，风把衣服上的水吹干了，就像风扇吹湿衣服一样，所以衣服摸起来快干了。'
        }
      ]
    },
    step4: {
      requiredCorrectCount: 2,
      goals: [
        {
          id: 1,
          icon: '🌀',
          text: '通过实验，找出洗衣机高速旋转能把衣服甩干的真正原因。',
          isCorrect: true
        },
        {
          id: 2,
          icon: '⚙️',
          text: '通过实验，观察旋转速度快慢对脱水效果的影响。',
          isCorrect: true
        },
        {
          id: 3,
          icon: '🌡️',
          text: '通过实验，测量洗衣机滚筒内部的温度变化。',
          isCorrect: false
        },
        {
          id: 4,
          icon: '🔱',
          text: '通过实验，研究洗衣机用了多少电量。',
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
          title: '旋转飞椅原理映射',
          content:
            '完全参考游乐园旋转飞椅“中心转轴旋转→带动周边座椅同步圆周转动”的原理，把洗衣机滚筒内壁看成无数个“小座椅”，湿衣物就是“座椅上的乘客”。按照这样的逻辑进行材料的选择与设计。',
          videoUrl: '/static/experiments/science-01/videos/5-1.mp4',
          videoPoster: ''
        },
        {
          key: 'logic2',
          no: '逻辑2',
          title: '敞口杯手动甩动方案',
          content:
            '用一次性纸杯代替滚筒，湿纸巾放在杯子里面，用手不停旋转。该方法无法稳定控制变量，不利于科学比较。',
          videoUrl: '/static/experiments/science-01/videos/5-2.mp4',
          videoPoster: ''
        }
      ],
      baseMaterials: BASE_MATERIALS
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
        { key: 'star_distance', material: '五角星', content: '五角星飞行远近、高低的变化' },
        { key: 'stick_rope_size', material: '木棒、毛线', content: '木棒、毛线的长短，大小，重量' }
      ],
      correctMap: {
        independent: 'motor_speed',
        dependent: 'star_distance',
        control: 'stick_rope_size'
      }
    },
    step7: {
      materialImageUrl: '/static/experiments/science-01/images/virtual-lab/0全部材料.jpg',
      majorSteps: [
        {
          key: 'step1',
          title: '准备实验材料、实验工具',
          summary: '先把材料和工具准备齐全。',
          lines: [
            '环节 1：准备实验材料（参考上一步材料清单）。',
            '环节 2：准备实验工具：剪刀。',
            '环节 3：核对材料完整性，确认每一项都能找到。'
          ]
        },
        {
          key: 'step2',
          title: '搭建旋转飞椅模拟装置',
          summary: '完成实验场景和模型搭建。',
          lines: [
            '环节 1：组装动力装置，将电机和电池盒安装在电路板上。',
            '环节 2：用瓶子做底座，将电机安装在瓶盖上。',
            '环节 3：组装旋转装置，用尼龙线连接五角星和橡胶圈，并将橡胶圈套在木棒的一端；木棒另一端插入塑料固定件中，隔孔插入。',
            '环节 4：将旋转装置安装在电机上。'
          ]
        },
        {
          key: 'step3',
          title: '控制旋转速度并观察现象',
          summary: '操作装置获取实验现象。',
          lines: [
            '环节 1：在电池盒里安装电池。',
            '环节 2：打开速度控制板旋转按钮，先低速观察。',
            '环节 3：逐步提高速度，再次观察五角星飞行状态变化。'
          ]
        },
        {
          key: 'step4',
          title: '总结现象并记录分析',
          summary: '完成数据记录和思考总结。',
          lines: [
            '环节 1：小朋友们，你们观察到了什么？请把现象写进数据记录表。',
            '环节 2：根据记录表分析和总结：五角星飞行状态和什么有关系？',
            '环节 3：说一说你们的结论：速度变化怎样影响飞行状态？'
          ]
        }
      ]
    },
    step9: {
      independentVariableLabel: '旋转速度',
      dependentVariableLabel: '五角星运动状态（飞行高低和远近）',
      speedSlowLabel: '旋转速度慢',
      speedFastLabel: '旋转速度快',
      slowOptions: [
        '五角星往外飞出去了一点点，比起以前的位置飞高了一点点。',
        '五角星几乎没有变化，一直停在原来的位置。',
        '五角星往外飞出去了很多，比起以前的位置飞高了很多。'
      ],
      fastOptions: [
        '五角星往外飞出去了很多，比起以前的位置飞高了很多。',
        '五角星只飞出去一点点，变化不大。',
        '五角星向中间靠近，飞行高度变低。'
      ],
      expected: { slow: 0, fast: 0 },
      defaultFinding:
        '数据验证了离心力原理：更高的旋转速度产生更大的离心力，导致物体飞得更高更远。'
    },
    step10: {
      resultOptions: COMMON_RESULT_OPTIONS,
      phenomenonPlaceholder: '例如：电动装置旋转更快，导致五角星飞了更高更远。',
      principleTip: '尝试一下使用AI来帮助我们理解有关离心力的原理吧，可以点击“不懂 AI科学小助手”试试看哦。',
      referencePrinciple:
        '旋转做圆周运动，其中动力来自圆心，是通过圆心转动拉动五角星运动，这个力称之为向心力。因为向心力的拉动导致五角星运动，而五角星因为运动惯性要保持运动方向，从而产生了一个惯性力，而这个惯性力运动的方向是远离圆心的，因此我们把这个惯性力形象地称之为惯性离心力，简称离心力。五角星飞出去的力主要来自电机转动产生的向心力，转化为离心力而导致的现象。电机旋转的速度越大，向心力就越大，从而转化的离心力就越大，五角星就飞得越远。',
      kidPrinciple:
        '可以把五角星想成坐在转盘上的小朋友。转盘转得越快，小朋友就会感觉身体越想往外面跑。这种“往外面跑”的效果，就是我们说的离心力现象。所以，电机转速越快，五角星就飞得越高、越远。',
      improvementPlaceholder:
        '例如：这个实验还可以更直观。后续可以设计“五角星脱离模型飞出”的环节，进一步验证离心力对脱水现象的作用。'
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
      step5: '请选择正确的实验场景构思，然后生成对应的材料清单。',
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
  legacyId: 1,
  title: '旋转飞椅的离心力现象与变量实验设计',
  summary: '观察不同转速下的现象变化，完成变量控制。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/science-01/videos/intro.mp4'
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
