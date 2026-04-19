export const ENGINEERING_STEP_SCENE_MAP = {
  step1: 'principle',
  step2: 'planning',
  step3: 'planning',
  step4: 'planning',
  step5: 'planning',
  step6: 'virtualLab',
  step7: 'dataAnalysis',
  step8: 'planning',
  step9: 'experimentSummary'
};

import { buildEngineeringFlowCopy } from '../flow-copy-presets.js';

export const ENGINEERING_STEP_GUIDE_TEXT_MAP = {
  step1: '小朋友你好，我是“不懂”AI 科学小助手。先看场景视频，想一想如何把袜子里的水更轻松地分离出来。准备好后我们就开始工程设计。',
  step2: '请先明确场景问题，再进入下一步科学原理选择。',
  step3: '选择最能解决问题的科学原理，并用 AI 分析验证你的选择。',
  step4: '工程方案要同时关注功能、性能、成本和安全四个目标。',
  step5: '生成工程方案表前，先检查前面步骤是否已经完整填写。',
  step6: '开始虚拟搭建，跟着步骤提示完成模型搭建，还可以同步到线下实践哦。',
  step7: '测试与数据分析要真实记录，先写现象，再给出发现。',
  step8: '根据测试中所发现的问题做迭代优化，优先解决最核心的结构问题。',
  step9: '最后写成果结论与反思，形成完整工程实践报告。'
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

const INTRO_VIDEO_BASE = '/static/Introductory-video';
const introVideo = (name) => INTRO_VIDEO_BASE + '/' + name + '.mp4';
const eng1Image = (name) => '/static/experiments/engineering-01/images/' + name;

const BASE_TEMPLATE = {
  id: 'engineering-01',
  title: '手动离心甩干机的原型设计与功能测试',
  step1: {
    introVideoUrl: introVideo('2-1'),
    introHintText:
      '先看生活场景视频，再想一想：我们怎么用工程方法，轻松把袜子里的水分离出来？',
    coreQuestion:
      '如何才可以轻松地把袜子里的水分离出来？针对这个问题，我们需要进行工程模型的设计与搭建。'
  },
  step2: {
    options: [
      {
        key: 'A',
        text: '洗完的袜子用手拧不干，还很费力，怎样用简单工具和结构快速把水脱离出来？',
        isCorrect: true
      },
      {
        key: 'B',
        text: '袜子洗完后有味道、容易破，怎样让袜子更干净、更耐穿？',
        isCorrect: false
      }
    ]
  },
  step3: {
    options: [
      { key: 'A', text: '利用旋转离心力，让水在快速旋转时被甩出去', isCorrect: true },
      { key: 'B', text: '利用热胀冷缩，让水受热蒸发离开袜子', isCorrect: false },
      { key: 'C', text: '利用风力，把袜子中的水吹干', isCorrect: false }
    ]
  },
  step4: {
    targetOptions: {
      function: [
        { key: 'A', text: '模型能利用离心力把袜子里的水快速甩出来', isCorrect: true },
        { key: 'B', text: '模型能把袜子洗得更干净、更香', isCorrect: false }
      ],
      performance: [
        { key: 'A', text: '甩干袜子不费力，脱水速度快、水甩得更干', isCorrect: true },
        { key: 'B', text: '袜子甩干后颜色更鲜艳、不会变形', isCorrect: false }
      ],
      cost: [
        { key: 'A', text: '用生活材料制作（废旧优先），手动提供动力，成本低', isCorrect: true },
        { key: 'B', text: '必须买昂贵新零件，材料越贵越好', isCorrect: false }
      ],
      safety: [
        { key: 'A', text: '旋转时不会夹手、不会飞溅伤人，使用安全', isCorrect: true },
        { key: 'B', text: '可以高速旋转，越猛越好，不用考虑安全', isCorrect: false }
      ]
    },
    systems: [
      {
        key: 'bucket',
        title: '脱水桶系统',
        role: '装衣物并实现甩干',
        structure: '带孔圆筒、圆筒转轴'
      },
      {
        key: 'power',
        title: '手动动力系统',
        role: '提供旋转动力，让滚筒高速转动',
        structure: '拉线、转轴'
      },
      {
        key: 'shell',
        title: '外壳系统',
        role: '固定脱水桶系统和动力系统，并接住甩出的水',
        structure: '外桶、轴承'
      }
    ],
    blueprints: [
      { name: '模型图纸设计 1', path: eng1Image('4-1.png') },
      { name: '模型图纸设计 2', path: eng1Image('4-2.png') }
    ],
    buildStepOptions: [
      {
        key: 'step1',
        title: '准备搭建材料和工具',
        summary: '检查并备齐本节搭建所需材料与工具。',
        lines: ['准备搭建材料和工具。']
      },
      {
        key: 'step2',
        title: '模型搭建步骤：制作脱水桶系统',
        summary: '先完成脱水桶打孔，再安装脱水桶转轴装置。',
        lines: [
          '①脱水桶打孔：使用工具：酒精灯、螺丝刀、手套、酒精（自备）、打火机；使用材料：小塑料罐。',
          '（酒精灯和螺丝刀的使用要在大人的陪伴下，一定戴手套。）',
          '②安装脱水桶转轴装置：使用材料：小塑料罐、短木棒、长木棒、大孔泡棉胶、T型塑料垫片、圆形塑料垫片、双面胶。'
        ]
      },
      {
        key: 'step3',
        title: '模型搭建步骤：制作拉线动力系统',
        summary: '安装拉线动力装置并与脱水桶系统衔接。',
        lines: ['①安装拉线动力装置：使用材料：拉线、脱水桶系统、橡胶圈、塑料扣。']
      },
      {
        key: 'step4',
        title: '模型搭建步骤：制作外壳系统',
        summary: '安装轴承并完成三大系统整合。',
        lines: [
          '①安装轴承：使用材料：大塑料罐、泡棉胶、木轮。',
          '②固定脱水桶系统和动力系统在外壳系统里：使用系统：脱水桶系统、动力系统、外壳系统。'
        ]
      }
    ],
    buildSteps: [
      '步骤1：准备搭建材料和工具',
      '步骤2：模型搭建步骤',
      '1. 制作脱水桶系统',
      '2. 制作拉线动力系统',
      '3. 制作外壳系统'
    ],
    materials: [
      { name: '小塑料罐', spec: '250ml', qty: '1个', usage: '装衣物内筒，作为脱水桶' },
      { name: '大塑料罐', spec: '1050ml', qty: '1个', usage: '外筒，固定脱水桶和动力系统' },
      { name: '短木棒', spec: '5mm*2cm', qty: '1根', usage: '制作脱水桶底部转轴' },
      { name: '长木棒', spec: '5mm*4.3cm', qty: '1根', usage: '制作脱水桶顶部转轴' },
      { name: '备用木棒', spec: '5mm*15cm', qty: '1根', usage: '转轴备用材料' },
      { name: '木轮', spec: '6mm*2.5cm', qty: '2个', usage: '作为轴承组件' },
      { name: '小孔圆形泡棉胶', spec: '6mm*2.5cm', qty: '2个', usage: '固定轴承' },
      { name: '大孔圆形泡棉胶', spec: '1cm*2.5cm', qty: '2个', usage: '固定转轴' },
      { name: '塑料T型垫片', spec: '6mm*1cm', qty: '2个', usage: '固定转轴' },
      { name: '塑料圆形垫片', spec: '6mm*2.5cm', qty: '2个', usage: '固定转轴' },
      { name: '拉线', spec: '50cm', qty: '1根', usage: '提供动力' },
      { name: '橡胶圈', spec: '4mm', qty: '1个', usage: '固定拉线在转轴上' },
      { name: '塑料扣', spec: '3cm', qty: '1个', usage: '固定在拉线上' },
      { name: '双面胶', spec: '3cm*8cm', qty: '1片', usage: '固定转轴' },
      { name: '酒精灯', spec: '25ml', qty: '1个', usage: '工具：用于加热打孔（需成人陪同）' },
      { name: '螺丝刀', spec: '2mm*8mm', qty: '1个', usage: '工具：用于打孔（需成人陪同）' },
      { name: '手套', spec: '儿童手套', qty: '1双', usage: '工具：防止烫伤' },
      { name: '酒精', spec: '自备', qty: '1份', usage: '工具：酒精灯燃料（需成人陪同）' },
      { name: '打火机', spec: '自备', qty: '1个', usage: '工具：点燃酒精灯（需成人陪同）' }
    ]
  },
  step7: {
    testTypeOptions: [
      { key: 'A', text: '定性测试（推荐）', value: 'qualitative' },
      { key: 'B', text: '定量测试', value: 'quantitative' }
    ],
    testFlow: [
      '流程1：准备测试材料和模型（袜子、水盆、手动甩干机）。',
      '流程2：将袜子打湿后轻拧，放入脱水桶。',
      '流程3：缠绕拉线并拉动转轴，观察甩干效果。',
      '流程4：重复多次测试并记录。'
    ],
    records: [
      {
        key: 'dewater',
        goal: '脱水效果',
        options: [
          { key: 'A', text: '脱水现象非常明显，且效果很好' },
          { key: 'B', text: '脱水现象不明显' }
        ],
        choice: '',
        effect: '',
        effectByChoice: {
          A: '脱水效果基本达成',
          B: '脱水效果未达预期，需要继续优化脱水结构与动力'
        }
      },
      {
        key: 'performance',
        goal: '性能效果',
        options: [
          { key: 'A', text: '脱水桶转动非常快，并且很轻松' },
          { key: 'B', text: '脱水桶转动快，但是需要很大的力气' }
        ],
        choice: '',
        effect: '',
        effectByChoice: {
          A: '整体性能提高明显，更省力转得更快',
          B: '整体性能未达标，仍然费力且转速表现不足'
        }
      },
      {
        key: 'operation',
        goal: '操作效果',
        options: [
          { key: 'A', text: '操作起来特别简单且非常有趣' },
          { key: 'B', text: '操作起来仍然很不方便' }
        ],
        choice: '',
        effect: '',
        effectByChoice: {
          A: '操作简便效果提升明显，更简单方便，而且操作起来更有趣',
          B: '操作便捷性未达标，流程仍复杂，需要继续简化'
        }
      },
      {
        key: 'safety',
        goal: '安全效果',
        options: [
          { key: 'A', text: '非常安全，没有飞溅物' },
          { key: 'B', text: '很不安全，很容易伤到手' }
        ],
        choice: '',
        effect: '',
        effectByChoice: {
          A: '安全效果达标，基本没有安全风险',
          B: '安全效果未达标，存在明显安全风险，需要先完成防护优化'
        }
      }
    ],
    testGuideVideo: {
      title: '测试流程展示视频',
      desc: '先看测试演示，再按上面的流程完成测试记录。',
      videoUrl: '/static/experiments/engineering-01/videos/7.mp4'
    }
  },
  step8: {
    optimizationRows: [
      {
        key: 'bearing',
        problem: '使用木轮作为轴承，摩擦力偏大，转动费力。',
        solution: '改为更低摩擦的滚动结构，提升甩干效率。',
        replacement: '用钢球滚动轴承替换木轮滑动轴承。'
      },
      {
        key: 'line',
        problem: '拉线拉完后回卷不便，需要频繁开盖处理。',
        solution: '让转轴延伸到外盖外，外部即可快速回卷。',
        replacement: '顶部木棒改为约 10cm 长轴，并在瓶盖打孔。'
      },
      {
        key: 'install',
        problem: '脱水桶安装时转轴难对准轴承。',
        solution: '统一长轴与导向结构，降低安装难度。',
        replacement: '沿用“长轴 + 外部卷线”结构一体化方案。'
      }
    ]
  }
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const withOverride = (base, override) => {
  const next = deepClone(base);
  const stack = [[next, override]];
  while (stack.length > 0) {
    const [target, source] = stack.pop();
    Object.keys(source || {}).forEach((key) => {
      const value = source[key];
      if (Array.isArray(value)) {
        target[key] = deepClone(value);
      } else if (value && typeof value === 'object') {
        if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
          target[key] = {};
        }
        stack.push([target[key], value]);
      } else {
        target[key] = value;
      }
    });
  }
  return next;
};

const experimentId = 'engineering-01';
const flowTemplate = withOverride(BASE_TEMPLATE, {
  id: 'engineering-01'
});
flowTemplate.voiceGuide = {
  stepGuideTextMap: ENGINEERING_STEP_GUIDE_TEXT_MAP,
  stepSceneMap: ENGINEERING_STEP_SCENE_MAP
};

const flowCopy = buildEngineeringFlowCopy(
  {
    tips: {
      ruleTitle: '过关小提示',
      missingTitle: '你还差这一步',
      readyTitle: '可以继续啦',
      readyText: '这一步已经完成，点击“继续下一步”吧。'
    },
    stepAction: {
      completeAllText: '全部步骤都完成了，点击“完成本次实验”吧。',
      toNextTemplate: '这一步已经完成，下一步去“{nextTitle}”。'
    },
    stepRuleTips: {
      step1: '先观看场景视频，再确认核心问题。',
      step2: '请选择正确场景问题，并使用 AI 小助手完成分析。',
      step3: '请选择解决场景问题所应用到的科学原理，并使用 AI 小助手完成分析。',
      step4: '搞清楚了模型的设计目标，再进行下一步哦。',
      step5: '点击一键生成工程方案表，并同步到记录中心。',
      step6: '请完成虚拟实验探究操作。',
      step7: '完成测试记录后，点击“生成数据记录表”。',
      step8: '完成对工程模型的迭代与优化的思考。',
      step9: '填写成果结论与反思并生成工程实践报告。'
    }
  },
  (flowTemplate && flowTemplate.ruleTips) || {}
);

const config = {
  id: experimentId,
  templateType: 'engineering',
  legacyId: 4,
  title: '手动离心甩干机的原型设计与功能测试',
  summary: '从需求到原型，完成基础功能验证。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/engineering-01/videos/intro.mp4'
  },
  voiceGuide: {
    stepGuideTextMap: ENGINEERING_STEP_GUIDE_TEXT_MAP,
    stepSceneMap: ENGINEERING_STEP_SCENE_MAP
  },
  flowCopy,
  flowTemplate
};

config.assets = buildExperimentAssets(flowTemplate, config.intro);

export default config;
