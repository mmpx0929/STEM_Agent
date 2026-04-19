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
  step1: '在制作手动甩干机的过程中，虽然手动起来很轻松，并且很有趣。但是我们必须亲自动手才可以把袜子甩干，还是需要消耗我们的时间。那么如何才可以不用自己动手就可以让甩干机自己转动，甩干袜子呢？',
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
const eng3Image = (name) => '/static/experiments/engineering-03/images/' + name;

const BASE_TEMPLATE = {
  id: 'engineering-01',
  title: '手动离心甩干机的原型设计与功能测试',
  step1: {
    introVideoUrl: introVideo('2-1'),
    introHintText:
      '先看生活场景视频，再想一想：如何才可以轻松地把袜子里的水分离出来？针对这个问题，我们需要进行工程模型的设计与搭建。',
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
      { name: '模型图纸设计 1', path: eng3Image('4-1.png') },
      { name: '模型图纸设计 2', path: eng3Image('4-2.png') }
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

const experimentId = 'engineering-03';
const flowTemplate = withOverride(BASE_TEMPLATE, {
    id: 'engineering-03',
    title: '电动离心甩干机的机电系统设计与实测验证',
    step1: {
      introVideoUrl: introVideo('2-3'),
      introHintText: '在制作手动甩干机的过程中，虽然手动起来很轻松，并且很有趣。但是我们必须亲自动手才可以把袜子甩干，还是需要消耗我们的时间。那么如何才可以不用自己动手就可以让甩干机自己转动呢？观看下面的视频，我们一起思考思考吧。',
      coreQuestion: '如何才可以不用自己动手就可以让甩干机自己转动，甩干袜子呢？'
    },
    step2: {
      options: [
        {
          key: 'A',
          text: '怎样设计一台不需要人手动操作、能自动旋转甩干袜子的机器？',
          isCorrect: true
        },
        {
          key: 'B',
          text: '怎样让手动甩干机转得更快、更好玩？',
          isCorrect: false
        }
      ]
    },
    step3: {
      options: [
        {
          key: 'A',
          text: '①利用旋转离心力，让水在快速旋转时被甩出去；②利用电机转动的电磁力，电流通过电机线圈产生磁场，利用电磁力驱动电机旋转，为甩干机提供自动动力，不用人动手。',
          isCorrect: true
        },
        {
          key: 'B',
          text: '利用风力，让水从袜子里面吹干。',
          isCorrect: false
        }
      ]
    },
    step4: {
      targetOptions: {
        function: [
          { key: 'A', text: '模型能自动旋转产生离心力把袜子里的水快速甩出来', isCorrect: true },
          { key: 'B', text: '模型能自动旋转把袜子甩出去', isCorrect: false }
        ],
        performance: [
          { key: 'A', text: '脱水桶转速快，脱水速度快、水甩得更干', isCorrect: true },
          { key: 'B', text: '脱水桶转动下变大、变高可以装更多袜子', isCorrect: false }
        ],
        cost: [
          { key: 'A', text: '该工程项目属于初期工程项目，还需要进行测试，因此要尽可能地节约材料成本，待工程项目测试通过再进行成本具体规划。', isCorrect: true },
          { key: 'B', text: '因为我们的设计方案很好，必须买很贵的新零件，材料越贵越好，保证工程项目成功。', isCorrect: false }
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
          role: '装衣服、实现甩干',
          structure: '带孔圆筒、圆筒转轴'
        },
        {
          key: 'power',
          title: '电动动力系统',
          role: '提供旋转动力，让滚筒高速转动',
          structure: '电机、电池盒'
        },
        {
          key: 'shell',
          title: '外壳系统',
          role: '固定脱水桶系统和电动动力系统，并把甩出来的水接住',
          structure: '外桶、电机固定装置'
        }
      ],
	  blueprints: [
	    { name: '模型图纸设计 1', path: eng3Image('4_1.png') },
	    { name: '模型图纸设计 2', path: eng3Image('4_2.png') }
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
	      summary: '安装脱水桶转轴装置。',
	      lines: [
	        '使用材料：圆筒网兜、短木棒、长木棒、大孔泡棉胶、T型塑料垫片、圆形塑料垫片、双面胶。',
	      ]
	    },
	    {
	      key: 'step3',
	      title: '模型搭建步骤：制作电动动力系统',
	      summary: '安装电动动力装置。',
	      lines: ['使用材料：电机、电池盒、电池、吸管，使用工具：剪刀（自备）。']
	    },
	    {
	      key: 'step4',
	      title: '模型搭建步骤：制作外壳系统',
	      summary: '制作外壳系统并完成三大系统整合。',
	      lines: [
	        '①安装轴承：使用材料：大塑料罐。',
	        '②固定脱水桶系统和动力系统在外壳系统里：使脱水桶系统、电动动力系统、外壳系统，使用材料：皮带轮泡棉胶、透明胶，使用工具：剪刀（自备）。'
	      ]
	    }
	  ],
      buildSteps: [
        '步骤1：准备搭建材料和工具。',
        '步骤2：制作脱水桶系统：使用材料：圆筒网兜、皮带轮、泡棉胶。',
        '步骤3：制作电动动力系统：使用材料：电机、电池盒、电池、吸管；工具：剪刀（自备）。',
        '步骤4：制作外壳系统：使用材料：大塑料罐。',
        '步骤5：组装电动甩干机：使用脱水桶系统、电动动力系统、外壳系统，以及皮带轮泡棉胶、透明胶；工具：剪刀（自备）。'
      ],
      materials: [
        { name: '电机', spec: '5mm*20mm', qty: '1个', usage: '提供动力' },
        { name: '电池', spec: '火车牌5号', qty: '3节', usage: '提供电机电能' },
        { name: '吸管', spec: '40mm*2mm', qty: '2根', usage: '做电线连接处绝缘' },
        { name: '电池盒', spec: '3节5号', qty: '1个', usage: '装电池' },
        { name: '泡棉胶', spec: '6mm*25mm', qty: '4个', usage: '固定电机' },
        { name: '皮带轮', spec: '2mm*25mm', qty: '1个', usage: '作为脱水桶转轴' },
        { name: '圆筒网兜', spec: '60mm*45mm*80mm', qty: '1个', usage: '装衣服的内筒，做脱水桶' },
        { name: '透明胶带', spec: '15mm', qty: '1个', usage: '固定外壳' },
        { name: '大塑料罐', spec: '1050ml', qty: '1个', usage: '做外壳，用于安装动力系统和脱水桶系统' }
      ]
    },
    step5: {
      defaultTitle: '自动甩干机的设计'
    },
    step7: {
      defaultTestType: 'qualitative',
      testTypeOptions: [
        { key: 'A', text: '定性测试（推荐）', value: 'qualitative' },
        { key: 'B', text: '定量测试', value: 'quantitative' }
      ],
      testFlow: [
        '流程1：准备测试材料和模型：袜子（自备）、水盆（自备）、电动甩干机。',
        '流程2：将袜子打湿后，用手轻轻拧一下袜子，将袜子放入脱水桶。',
        '流程3：打开电池盒开关，电机带动脱水桶旋转，观察脱水效果和其它现象。',
        '流程4：进行重复多次测试。'
      ],
	  testGuideVideo: {
	    title: '测试流程展示视频',
	    desc: '先看测试演示，再按上面的流程完成测试记录。',
	    videoUrl: '/static/experiments/engineering-03/videos/8-1.mp4'
	  },
      records: [
        {
          key: 'dewater',
          goal: '脱水效果',
          options: [
            { key: 'A', text: '脱水现象非常明显，不需要手动操作' },
            { key: 'B', text: '脱水现象不明显' }
          ],
          choice: '',
          effect: '',
          effectByChoice: {
            A: '脱水效果达标，更省力转得更快。',
            B: '脱水效果还需要优化。'
          }
        },
        {
          key: 'performance',
          goal: '性能效果',
          options: [
            { key: 'A', text: '脱水桶转动非常快，相对平稳，就是脱水桶太小一次只能甩一只袜子，效率太低' },
            { key: 'B', text: '脱水桶转动慢，晃动的很厉害' }
          ],
          choice: '',
          effect: '',
          effectByChoice: {
            A: '整体性能还有待提高，特别是脱水效率可以再提升一下。',
            B: '脱水桶还需要优化。'
          }
        },
        {
          key: 'operation',
          goal: '操作效果',
          options: [
            { key: 'A', text: '操作简单，但是需要手动把脱出来的水倒掉，相对复杂。' },
            { key: 'B', text: '操作起来不方便，会手忙脚乱' }
          ],
          choice: '',
          effect: '',
          effectByChoice: {
            A: '操作效果还不达标，还需要优化一下脱水后，外壳系统里面的排水问题。',
            B: '操作效果还不达标，还需要优化一下脱水后，外壳系统里面的排水问题。'
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
            A: '安全效果达标，基本没有安全风险。',
            B: '需要更加合理规范的操作来提升安全效果。'
          }
        }
      ],
      analysisRows: [
        {
          id: 'eng3-row-1',
          structure: '脱水桶系统',
          problem: '脱水桶太小，只能装一只袜子，需要更换更大的脱水桶。'
        },
        {
          id: 'eng3-row-2',
          structure: '外壳系统',
          problem: '外壳系统里面的水需要升级一下排水系统，要能自动排水。'
        }
      ],
      generatedSummary: [
        '测试方案：定性测试方案。',
        '脱水效果：脱水现象非常明显，不需要手动操作，脱水效果达标。',
        '性能效果：脱水桶转动较快且相对平稳，但脱水桶太小，一次只能甩一只袜子，整体脱水效率还有提升空间。',
        '操作效果：操作简单，但还需要手动把外壳系统中的水倒掉，排水流程还不够方便。',
        '安全效果：安全效果达标，基本没有安全风险。',
        '关键问题发现：当前更需要继续优化更大的脱水桶，以及升级外壳排水系统。'
      ]
    },
    step8: {
      optimizationRows: [
        {
          key: 'bucket',
          problem: '脱水桶太小，只能装一只袜子，需要更换更大的脱水桶',
          solution: '更换更大的带孔脱水桶，一样要兼顾省时省力，并保持旋转稳定',
          replacement: '用塑料带孔笔筒替换圆筒网兜'
        },
        {
          key: 'drainage',
          problem: '外壳系统里面的水需要升级排水系统，避免每次都手动倾倒',
          solution: '不用把大塑料罐倾斜后把水倒出，而是让水可以自动从底部流出',
          replacement: '在大塑料罐底部打孔，做一个排水系统'
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
  legacyId: 6,
  title: '电动离心甩干机的机电系统设计与实测验证',
  summary: '连接机电系统并完成性能验证。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/engineering-03/videos/intro.mp4'
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




