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
  step1: '先观看下面的视频，再想一想：如何才可以不用自己动手就可以让脱离出来的水自动排走，甚至可以甩干更多的袜子？',
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
const eng4Image = (name) => '/static/experiments/engineering-04/images/' + name;

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

const experimentId = 'engineering-04';
const flowTemplate = withOverride(BASE_TEMPLATE, {
    id: 'engineering-04',
    title: '电动离心甩干机的尺寸与排水系统迭代升级',
    step1: {
      introVideoUrl: introVideo('2-4'),
      introHintText: '先观看下面的视频，再想一想：如何才可以不用自己动手就可以让脱离出来的水自动排走，甚至可以甩干更多的袜子？',
      coreQuestion: '如何才可以不用自己动手就可以让脱离出来的水自动排走，甚至可以甩干更多的袜子？'
    },
    step2: {
      options: [
        {
          key: 'A',
          text: '如何迭代优化脱水桶结构，提升脱水效率；如何迭代外壳系统，提升排水效率？',
          isCorrect: true
        },
        {
          key: 'B',
          text: '如何让电动甩干机外观更酷、更闪亮，而不用继续优化容量和排水？',
          isCorrect: false
        }
      ]
    },
    step3: {
      options: [
        {
          key: 'A',
          text: '提升自动排水效率，需要增加排水管道，并利用高低差产生的重力现象把水排出。',
          isCorrect: true
        },
        {
          key: 'B',
          text: '主要依靠把水加热蒸发掉，不需要设计排水路径。',
          isCorrect: false
        },
        {
          key: 'C',
          text: '只要继续提高转速，水就会自己消失，不需要改外壳和脱水桶。',
          isCorrect: false
        }
      ]
    },
    step4: {
      targetOptions: {
        function: [
          { key: 'A', text: '甩干袜子数量更多，脱离出来的水可以从外壳系统自动排出。', isCorrect: true },
          { key: 'B', text: '甩干后的水可以自动蒸发掉，不需要继续搭建排水系统。', isCorrect: false }
        ],
        performance: [
          { key: 'A', text: '脱水桶转速快，脱水速度快，单次能甩干更多袜子。', isCorrect: true },
          { key: 'B', text: '只要声音更大、更有冲击感就说明性能更好。', isCorrect: false }
        ],
        cost: [
          { key: 'A', text: '用生活中的材料制作迭代升级结构，减少迭代失败后的损失。', isCorrect: true },
          { key: 'B', text: '必须买很贵的材料，越贵越好，这样效果才最好。', isCorrect: false }
        ],
        safety: [
          { key: 'A', text: '旋转时不会夹手、不会飞溅伤人，使用安全', isCorrect: true },
          { key: 'B', text: '可以高速旋转，越猛越好，不用考虑安全', isCorrect: false }
        ]
      },
      systems: [
        {
          key: 'bucket_upgrade',
          title: '脱水桶结构升级',
          role: '增大单次甩干容量，提升脱水数量效率',
          structure: '用塑料镂空笔筒替换原圆筒网兜'
        },
        {
          key: 'shell_upgrade',
          title: '外壳系统升级',
          role: '在外壳底部预留排水孔，支持自动排水',
          structure: '在旧电动甩干机外壳底部打孔，并固定新底座'
        },
        {
          key: 'drainage_system',
          title: '排水系统设计',
          role: '把甩出来的水顺畅导流到收集容器中',
          structure: '吸管 + 布丁杯 + 高低差重力排水'
        }
      ],
	  blueprints: [
	    { name: '模型图纸设计 1', path: eng4Image('4-1.png') },
	    { name: '模型图纸设计 2', path: eng4Image('4-2.png') }
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
	      summary: '安装脱水桶装置。',
	      lines: [
	        '使用材料：塑料笔筒、皮带轮、圆形泡棉胶。',
	      ]
	    },
	    {
	      key: 'step3',
	      title: '模型搭建步骤：制作排水系统',
	      summary: '制作排水系统。',
	      lines: ['使用材料：布丁杯、吸管。']
	    },
	    {
	      key: 'step4',
	      title: '模型搭建步骤：加工外壳系统排水孔并完成组装',
	      summary: '加工外壳系统排水孔并完成三大系统整合。',
	      lines: [
	        '①加工外壳系统排水孔：（旧）电动甩干机，使用工具：手动甩干机打孔用的酒精灯、螺丝刀、打火机（自备）、酒精（自备）。',
	        '②完成对排水桶系统与脱水桶系统、动力系统的组装：（新）脱水桶系统、排水系统、（旧）电动甩干机，使用材料：泡棉胶、塑料碗。'
	      ]
	    }
	  ],
      buildSteps: [
        '步骤1：准备搭建材料和工具。',
        '步骤2：制作脱水桶系统：使用塑料镂空笔筒、皮带轮、圆形泡棉胶。',
        '步骤3：制作排水系统：使用布丁杯、吸管。',
        '步骤4：加工外壳系统排水孔：使用旧电动甩干机；工具：酒精灯、螺丝刀、打火机（自备）、酒精（自备）。',
        '步骤5：组装升级后的电动甩干机：使用新脱水桶系统、排水系统、旧电动甩干机，以及泡棉胶、塑料碗。'
      ],
      materials: [
        { name: '镂空笔筒', spec: '80mm*100mm', qty: '1个', usage: '替换圆筒网兜，增大脱水桶容量' },
        { name: '圆形泡棉胶', spec: '6mm*25mm', qty: '2个', usage: '固定皮带轮转轴' },
        { name: '皮带轮', spec: '2mm*25mm', qty: '1个', usage: '作为升级后脱水桶转轴' },
        { name: '条形泡棉胶', spec: '50mm*10mm', qty: '3条', usage: '安装外筒在底座上' },
        { name: '吸管', spec: '5mm*20mm', qty: '1个', usage: '做排水系统' },
        { name: '布丁杯', spec: '100ml', qty: '1个', usage: '做排水系统储水杯' },
        { name: '塑料碗', spec: '120mm*90mm*60mm', qty: '2个', usage: '做底座并提升高低差' }
      ]
    },
    step5: {
      defaultTitle: '电动甩干机迭代与升级'
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
        '流程3：打开电池盒开关，电机带动脱水桶旋转，观察脱水效果和排水现象。',
        '流程4：进行重复多次测试。'
      ],
	  testGuideVideo: {
	    title: '测试流程展示视频',
	    desc: '先看测试演示，再按上面的流程完成测试记录。',
	    videoUrl: '/static/experiments/engineering-04/videos/8-1.mp4'
	  },
      records: [
        {
          key: 'dewater',
          goal: '脱水效果',
          options: [
            { key: 'A', text: '脱水现象非常明显' },
            { key: 'B', text: '脱水现象不明显' }
          ],
          choice: '',
          effect: '',
          effectByChoice: {
            A: '脱水效果达标。',
            B: '脱水效果还可以有进一步的提升空间。'
          }
        },
        {
          key: 'performance',
          goal: '性能效果',
          options: [
            { key: 'A', text: '可以同时甩干更多的袜子，并且不用手动排水，可以通过排水系统自动排水' },
            { key: 'B', text: '脱水效率反而变低，排水系统几乎不起作用' }
          ],
          choice: '',
          effect: '',
          effectByChoice: {
            A: '整体脱水效率提升，从袜子脱水数量和自动排水效率上都有很大提升。',
            B: '需要更加合理规范的操作来提升脱水效率。'
          }
        },
        {
          key: 'operation',
          goal: '操作效果',
          options: [
            { key: 'A', text: '操作流程更顺畅，甩干后不需要再手动倒水' },
            { key: 'B', text: '操作还是比较麻烦，升级后体验没有明显改善' }
          ],
          choice: '',
          effect: '',
          effectByChoice: {
            A: '操作效果达标，排水流程更加顺畅，甩干后不需要再手动倒水，使用体验明显提升。',
            B: '操作效果还需继续优化，升级后排水和使用流程仍不够顺畅，需要进一步改进结构或操作步骤。'
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
          id: 'eng4-row-1',
          structure: '功能目标',
          problem: '达标（脱水后，用手已经拧不出水）。'
        },
        {
          id: 'eng4-row-2',
          structure: '性能目标',
          problem: '达标（排水顺畅、脱水高效、容量提升）。'
        },
        {
          id: 'eng4-row-3',
          structure: '成本目标',
          problem: '达标（材料廉价易获取，总成本可控，升级方案经济可行）。'
        },
        {
          id: 'eng4-row-4',
          structure: '安全目标',
          problem: '达标（无安全隐患，适合小学生使用）。'
        }
      ],
      generatedSummary: [
        '测试方案：定性测试方案。',
        '功能目标：达标（脱水后，用手已经拧不出水）。',
        '性能目标：达标（排水顺畅、脱水高效、容量提升；升级后的两项核心功能均正常发挥作用，实用性明显提升）。',
        '成本目标：达标（材料廉价易获取，总成本可控，性价比高）。',
        '安全目标：达标（无安全隐患，适合小学生使用）。',
        '总结：本次迭代升级后的电动甩干机，成功解决了“容量小、需手动倒水”的问题。增大脱水桶提升了单次甩干量，新增排水功能实现了“甩干 + 自动排水”一体化，大幅提升了实用性和操作便捷性。'
      ]
    },
    step8: {
      displayMode: 'targetStatus',
      optimizationRows: [
        {
          key: 'function',
          problem: '功能目标',
          solution: '达标（脱水后，用手已经拧不出水）',
          replacement: ''
        },
        {
          key: 'performance_capacity',
          problem: '性能目标',
          solution: '✅ 达标（排水顺畅、脱水高效、容量提升）；升级后的两项核心功能均正常发挥作用，相比升级前，实用性大幅提升。',
          replacement: ''
        },
        {
          key: 'performance_stability',
          problem: '性能目标',
          solution: '✅ 达标（运转平稳、排水高效、无异常故障）；升级后机器的稳定性、效率均达到预设标准，未因增加功能、增大容量出现性能明显下降。',
          replacement: ''
        },
        {
          key: 'cost',
          problem: '成本目标',
          solution: '✅ 达标（材料廉价易获取，总成本可控）；升级方案经济可行，成本增加合理，性价比高',
          replacement: ''
        },
        {
          key: 'safety',
          problem: '安全目标',
          solution: '✅ 达标（无安全隐患，适合小学生使用）；升级过程中兼顾了功能提升与安全保障，整体安全性符合STEM课程的使用标准。',
          replacement: ''
        },
        {
          key: 'summary',
          problem: '总结',
          solution: '本次迭代升级（增加排水功能+增大脱水桶）的电动甩干机，经过2次重复测试，四大核心目标均顺利达成。升级后的机器，核心优势在于解决了升级前“容量小、需手动倒水”的痛点，增大脱水桶提升了单次甩干量，新增排水功能实现了“甩干+自动排水”一体化，大幅提升了实用性和操作便捷性；同时，机器运转平稳、脱水高效，制作成本低廉、材料易获取，且无任何安全隐患，完全符合STEM工程课程中“设计、制作、测试、迭代”的核心要求。\n本次升级的成功，核心是正确运用了“离心力脱水”和“重力排水”的科学原理，将科学知识与工程实践相结合，有效解决了实际使用中的不便，体现了工程设计“以人为本、解决问题”的核心思想。\n后续可优化方向：可适当优化排水管道的角度，进一步加快排水速度；同时可增加脱水桶的防滑设计，避免袜子甩干时缠绕；整体而言，本次迭代升级达到了预期效果，有效提升了电动甩干机的实用性，是一次成功的STEM工程实践。',
          replacement: ''
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
  legacyId: 7,
  title: '电动离心甩干机的尺寸与排水系统迭代升级',
  summary: '优化尺寸和排水结构，提升稳定性。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/engineering-04/videos/intro.mp4'
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




