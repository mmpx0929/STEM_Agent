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
  step1: '如何才能够做一台小型的袜子洗衣机？先观看下面的视频，然后再一起动手制作吧。',
  step2: '请先明确场景问题，再进入下一步科学原理选择。',
  step3: '选择最能解决问题的科学原理，并用 AI 分析验证你的选择。',
  step4: '工程方案要同时关注功能、性能、成本和安全四个目标。',
  step5: '生成工程方案表前，先检查前面步骤是否已经完整填写。',
  step6: '开始虚拟搭建：先基础结构，再部件融合，最后上传证据。',
  step7: '测试与数据分析要真实记录，先写现象，再给出发现。',
  step8: '根据测试问题做迭代优化，优先解决最核心的结构问题。',
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
const eng2Image = (name) => '/static/experiments/engineering-02/images/' + name;

const BASE_TEMPLATE = {
  id: 'engineering-01',
  title: '手动离心甩干机的原型设计与功能测试',
  step1: {
    introVideoUrl: introVideo('2-1'),
    introHintText:
      '先看生活场景视频，再想一想：如何才可以轻松地把袜子里的水分离出来？针对这个问题，我们需要进行工程模型的设计与搭建。',
    coreQuestion:
      '如何做一台小型的袜子洗衣机？'
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
    buildSteps: [
      '步骤1：准备搭建材料和工具',
      '步骤2：制作脱水桶系统（安装转轴装置 + 脱水桶打孔）',
      '步骤3：制作拉线动力系统（安装拉线动力装置）',
      '步骤4：制作外壳系统（安装轴承 + 固定三大系统）'
    ],
    materials: [
      { name: '小塑料罐', spec: '250ml', qty: '1个', usage: '装衣物的内筒，做脱水桶' },
      { name: '大塑料罐', spec: '1050ml', qty: '1个', usage: '外筒，固定脱水桶和动力系统' },
      { name: '短木棒', spec: '5mm*2cm', qty: '1根', usage: '做脱水桶底部转轴' },
      { name: '长木棒', spec: '5mm*4.3cm', qty: '1根', usage: '做脱水桶顶部转轴' },
      { name: '备用木棒', spec: '5mm*15cm', qty: '1根', usage: '做脱水桶转轴备用' },
      { name: '木轮', spec: '6mm*2.5cm', qty: '2个', usage: '做轴承' },
      { name: '小孔圆形泡棉胶', spec: '6mm*2.5cm', qty: '2个', usage: '固定轴承' },
      { name: '大孔圆形泡棉胶', spec: '1cm*2.5cm', qty: '2个', usage: '固定转轴' },
      { name: '塑料T型垫片', spec: '6mm*1cm', qty: '2个', usage: '固定转轴' },
      { name: '塑料圆形垫片', spec: '6mm*2.5cm', qty: '2个', usage: '固定转轴' },
      { name: '尼龙线', spec: '50cm', qty: '1根', usage: '提供动力' },
      { name: '橡胶圈', spec: '4mm', qty: '1个', usage: '固定拉线在转轴上' },
      { name: '塑料扣', spec: '3cm', qty: '1个', usage: '固定在拉线上' },
      { name: '双面胶', spec: '3cm*8cm', qty: '1片', usage: '固定转轴' },
      { name: '小酒精灯', spec: '25ml', qty: '1个', usage: '工具：用于塑料罐打孔加热' },
      { name: '迷你螺丝刀', spec: '2mm*8mm', qty: '1个', usage: '工具：用于塑料罐打孔' },
      { name: '手套', spec: '儿童手套', qty: '1双', usage: '工具：防烫伤' }
    ]
  },
  step7: {
    testTypeOptions: [
      { key: 'A', text: '定性测试', value: 'qualitative' },
      { key: 'B', text: '定量测试', value: 'quantitative' }
    ],
    testFlow: [
      '流程1：准备测试材料和模型（袜子、水盆、手动甩干机）',
      '流程2：将袜子打湿后轻拧，放入脱水桶',
      '流程3：缠绕拉线并拉动转轴，观察甩干效果',
      '流程4：重复多次测试并记录'
    ]
  },
  step8: {
    optimizationRows: [
      {
        key: 'bearing',
        problem: '使用木轮作为轴承，摩擦力偏大，转动费力',
        solution: '改为更低摩擦的滚动结构，提升甩干效率',
        replacement: '用钢球滚动轴承替换木轮滑动轴承'
      },
      {
        key: 'line',
        problem: '拉线拉完后回卷不便，需要频繁开盖处理',
        solution: '让转轴延伸到外盖外，外部即可快速回卷',
        replacement: '顶部木棒改为约10cm长轴，并在瓶盖打孔'
      },
      {
        key: 'install',
        problem: '脱水桶安装时转轴难对准轴承',
        solution: '统一长轴与导向结构，降低安装难度',
        replacement: '沿用“长轴 + 外部卷线”结构一体化方案'
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

const experimentId = 'engineering-05';
const flowTemplate = withOverride(BASE_TEMPLATE, {
    id: 'engineering-05',
    title: '电动洗衣机的波轮驱动设计与去污功能测试',
    step1: {
      introVideoUrl: introVideo('2-5'),
      introHintText: '如何才能够做一台小型的袜子洗衣机？先观看下面的视频，然后再一起动手制作吧。',
      coreQuestion: '如何做一台小型的袜子洗衣机？'
    },
    step2: {
      options: [
        {
          key: 'A',
          text: '怎样设计一台小型的袜子洗衣机？',
          isCorrect: true
        },
        {
          key: 'B',
          text: '怎样只让袜子更快甩干，而不用继续考虑清洗去污？',
          isCorrect: false
        }
      ]
    },
    step3: {
      options: [
        {
          key: 'A',
          text: '利用水流搅拌与摩擦的原理，通过电机带动水流翻滚，让水和袜子不断摩擦、冲刷，把脏东西洗干净。',
          isCorrect: true
        },
        {
          key: 'B',
          text: '利用离心力的原理，通过高速旋转把袜子上的污渍直接甩出去。',
          isCorrect: false
        }
      ]
    },
    step4: {
      targetOptions: {
        function: [
          { key: 'A', text: '能够通过搅拌水流，把袜子上的污渍清洗干净。', isCorrect: true },
          { key: 'B', text: '能够高速旋转，把袜子里的水快速甩干。', isCorrect: false }
        ],
        performance: [
          { key: 'A', text: '在短时间内把袜子洗干净，转动稳定，不会溅出大量水。', isCorrect: true },
          { key: 'B', text: '洗得越慢越好，水可以随便溅出来。', isCorrect: false }
        ],
        cost: [
          { key: 'A', text: '使用简单、便宜、容易找到的材料，控制制作成本。', isCorrect: true },
          { key: 'B', text: '必须用最贵、最复杂的材料，成本越高越好。', isCorrect: false }
        ],
        safety: [
          { key: 'A', text: '使用时不会漏电、不会夹手，转动部分不会伤到小朋友。', isCorrect: true },
          { key: 'B', text: '可以用尖锐零件、裸露电线，越刺激越好玩。', isCorrect: false }
        ]
      },
      systems: [
        {
          key: 'stirring',
          title: '搅动结构',
          role: '搅动水流，让袜子在水中翻滚摩擦',
          structure: '波轮、涡轮'
        },
        {
          key: 'power',
          title: '电动动力系统',
          role: '提供动力，让波轮或涡轮稳定转动',
          structure: '电机、电池盒'
        },
        {
          key: 'shell',
          title: '外壳系统',
          role: '装水和袜子，并固定动力系统',
          structure: '外桶、电机固定装置'
        }
      ],
      buildSteps: [
        '步骤1：准备搭建材料和工具。',
        '步骤2：制作电动动力系统：使用材料：电机、电池盒、电池、吸管；工具：剪刀（自备）。',
        '步骤3：制作外壳系统：使用材料：大塑料罐。',
        '步骤4：组装电动洗衣机：使用电动动力系统、外壳系统，以及皮带轮泡棉胶、透明胶、波轮或涡轮；工具：剪刀（自备）。'
      ],
      materials: [
        { name: '电机', spec: '5mm*20mm', qty: '1个', usage: '提供动力' },
        { name: '电池', spec: '火车牌5号', qty: '3节', usage: '提供电机电能' },
        { name: '吸管', spec: '40mm*2mm', qty: '2根', usage: '做电线连接处绝缘' },
        { name: '电池盒', spec: '3节5号', qty: '1个', usage: '装电池' },
        { name: '泡棉胶', spec: '6mm*25mm', qty: '3个', usage: '固定电机' },
        { name: '皮带轮', spec: '2mm*25mm', qty: '1个', usage: '固定电机并连接搅动结构' },
        { name: '波轮', spec: '2mm*35mm', qty: '1个', usage: '搅动水和衣服滚动摩擦' },
        { name: '涡轮', spec: '2mm*35mm', qty: '1个', usage: '搅动水和衣服滚动摩擦' },
        { name: '透明胶带', spec: '15mm', qty: '1个', usage: '固定外壳' },
        { name: '大塑料罐', spec: '1050ml', qty: '1个', usage: '做洗衣桶外壳，用于安装动力系统' }
      ]
    },
    step5: {
      defaultTitle: '电动洗衣机的设计'
    },
    step7: {
      defaultTestType: 'qualitative',
      testTypeOptions: [
        { key: 'A', text: '定性测试（推荐）', value: 'qualitative' },
        { key: 'B', text: '定量测试', value: 'quantitative' }
      ],
      testFlow: [
        '流程1：准备测试材料和模型：袜子（自备）、水盆（自备）、电动洗衣机。',
        '流程2：先测试涡轮搅动结构，安装在电机上，把洗衣桶装上 2/3 的水。',
        '流程3：打开电池盒开关，观察电机带动涡轮转动后水的运动现象。',
        '流程4：再往洗衣机里放入袜子，继续观察袜子和水的运动现象。',
        '流程5：更换搅动结构为波轮，重复上面的流程进行观察。',
        '流程6：可以加入洗衣液进行真实测试。',
        '流程7：可以重复多次测试。'
      ],
      records: [
        {
          key: 'dewater',
          goal: '洗衣效果',
          options: [
            { key: 'A', text: '袜子上的泥土或污渍变少了一些，但并没有全部清除。' },
            { key: 'B', text: '袜子上的污渍几乎没有变化，甚至因为搅拌变得更脏。' }
          ],
          choice: '',
          effect: '不达标：能清除部分袜子上的污渍，但是没有办法全部清除'
        },
        {
          key: 'performance',
          goal: '性能效果',
          options: [
            { key: 'A', text: '机器能够平稳转动，搅拌水流均匀，但是转动不久后袜子就会拧成一团，甚至可能会卡住波轮。' },
            { key: 'B', text: '机器转不动或卡住了，或者转动非常剧烈导致水大量飞溅，甚至散架。' }
          ],
          choice: '',
          effect: '不达标：袜子拧成一团，没有办法和水充分碰撞摩擦，不能把袜子洗得很干净'
        },
        {
          key: 'operation',
          goal: '操作效果',
          options: [
            { key: 'A', text: '安装和切换波轮、涡轮都比较顺利，测试步骤清晰好操作。' },
            { key: 'B', text: '安装和切换搅动结构比较混乱，测试过程不够顺畅。' }
          ],
          choice: '',
          effect: '操作流程基本清晰，但仍需要继续优化内部搅动方式'
        },
        {
          key: 'safety',
          goal: '安全效果',
          options: [
            { key: 'A', text: '机器没有尖锐突出的尖角，电线包裹完好，触摸时不烫手、不漏电。' },
            { key: 'B', text: '机器有锋利断口容易划手，电线裸露直接接触水，触摸有明显刺痛感。' }
          ],
          choice: '',
          effect: '达标：安全合格，可以使用'
        }
      ],
      analysisRows: [
        {
          id: 'eng5-row-1',
          structure: '电动动力系统',
          problem: '电机带动下的波轮或涡轮一直朝同一个方向转动，容易导致袜子拧成一团，甚至与搅动结构卡在一起，袜子和水不能充分接触摩擦。'
        }
      ],
      generatedSummary: [
        '测试方案：定性测试方案。',
        '洗衣效果：袜子上的泥土或污渍有所减少，但没有被全部清除，当前去污效果还不够理想。',
        '性能效果：机器能够平稳转动、搅拌水流也比较均匀，但袜子容易拧成一团，甚至可能卡住波轮，影响持续清洗。',
        '操作效果：波轮和涡轮的安装、切换流程基本清晰，便于继续做对比测试。',
        '安全效果：机器没有尖锐结构，电线包裹完好，安全表现达标。',
        '关键问题发现：目前最核心的问题是电机只能单向转动，导致袜子缠绕，水流与袜子的摩擦不充分，因此去污效果不够好。'
      ]
    },
    step8: {
      optimizationRows: [
        {
          key: 'power_reverse',
          problem: '电机单向转动会导致袜子拧成一团，甚至卡住搅动结构',
          solution: '让电机不停变换方向进行转动，先用低成本方案验证正反转是否能改善清洗效果',
          replacement: '增加一个电池盒，先测试双电池盒控制下的电机正反转方案'
        }
      ]
    }
  });
flowTemplate.voiceGuide = {
  stepGuideTextMap: ENGINEERING_STEP_GUIDE_TEXT_MAP,
  stepSceneMap: ENGINEERING_STEP_SCENE_MAP
};

const flowCopy = buildEngineeringFlowCopy(
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

    // 黄卡每一步提示文案（工程流程 step1~step9）
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
    }  },
  (flowTemplate && flowTemplate.ruleTips) || {}
);

const config = {
  id: experimentId,
  templateType: 'engineering',
  legacyId: 8,
  title: '电动洗衣机的波轮驱动设计与去污功能测试',
  summary: '完成波轮方案并测试去污效果。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/engineering-05/videos/intro.mp4'
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




