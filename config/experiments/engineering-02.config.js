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
  step1: '小朋友你好呀，在上一期搭建的工程模型手动甩干机的测试中，从获取的数据里我们发现了需要迭代和优化的结构和功能，观看下面的视频，思考我们该如何进行工程优化呢？',
  step2: '请先明确场景问题，明确了我们所要解决的问题，实验才会高效哦。',
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
      introVideoUrl: introVideo('2-2'),
      introHintText:
        '先观看下面的视频，再想一想：如何迭代优化手动甩干机模型的结构，提升旋转效率、拉线系统的卷线效率、脱水桶的安装效率。',
      coreQuestion:
        '如何迭代优化手动甩干机模型的结构，提升旋转效率、拉线系统的卷线效率、脱水桶的安装效率。'
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

const experimentId = 'engineering-02';
const flowTemplate = withOverride(BASE_TEMPLATE, {
    id: 'engineering-02',
    title: '手动离心甩干机的问题分析与结构迭代优化',
    step1: {
      introVideoUrl: introVideo('2-2'),
      introHintText:
        '先观看下面的视频，再想一想：如何迭代优化手动甩干机模型的结构，提升旋转效率、拉线系统的卷线效率、脱水桶的安装效率。',
      coreQuestion:
        '如何迭代优化手动甩干机模型的结构，提升旋转效率、拉线系统的卷线效率、脱水桶的安装效率。'
    },
    step2: {
      options: [
        {
          key: 'A',
          text: '如何迭代优化手动甩干机模型的结构，提升旋转效率、拉线系统的卷线效率、脱水桶的安装效率。',
          isCorrect: true
        },
        {
          key: 'B',
          text: '如何让手动甩干机外观更漂亮、颜色更鲜艳、看起来更像商店里的玩具？',
          isCorrect: false
        }
      ]
    },
    step3: {
      options: [
        {
          key: 'A',
          text: '提升旋转效率，需要减少转轴转动的摩擦力，并继续利用旋转离心力让水在快速旋转时被甩出去。',
          isCorrect: true
        },
        {
          key: 'B',
          text: '主要通过把材料加热，让袜子里的水直接蒸发掉。',
          isCorrect: false
        },
        {
          key: 'C',
          text: '主要依靠风力吹干袜子，不需要重点优化转轴结构。',
          isCorrect: false
        }
      ]
    },
    step4: {
      targetOptions: {
        function: [
          { key: 'A', text: '模型迭代后要更容易甩干袜子，并且旋转更顺畅、安装更方便。', isCorrect: true },
          { key: 'B', text: '模型只要外观看起来更大、更酷就可以，不用重点考虑功能变化。', isCorrect: false }
        ],
        performance: [
          { key: 'A', text: '甩干袜子省力很多，脱水速度更快、水甩得更干', isCorrect: true },
          { key: 'B', text: '甩干袜子颜色更鲜艳、不会变形', isCorrect: false }
        ],
        cost: [
          { key: 'A', text: '用生活中一些废旧零件材料来制作迭代升级的结构材料，如果测试该材料可以就可以买新的来完善。', isCorrect: true },
          { key: 'B', text: '必须买很贵的新零件，越贵越好，这样效果才好。', isCorrect: false }
        ],
        safety: [
          { key: 'A', text: '旋转时不会夹手、不会飞溅伤人，使用安全', isCorrect: true },
          { key: 'B', text: '可以高速旋转，越猛越好，不用考虑安全', isCorrect: false }
        ]
      },
      systems: [
        {
          key: 'bearing_upgrade',
          title: '木轮轮轴结构升级',
          role: '降低摩擦力，提升旋转效率',
          structure: '用钢球做的滚动轴承替换木轮做的滑动轴承'
        },
        {
          key: 'bucket_upgrade',
          title: '塑料罐脱水桶结构升级',
          role: '减少打孔步骤，提升搭建效率',
          structure: '用带孔圆筒网兜替换塑料罐，做新的脱水桶'
        },
        {
          key: 'shaft_upgrade',
          title: '顶部转轴结构升级',
          role: '提升卷线效率和脱水桶安装效率',
          structure: '用更长的木棒做顶部转轴，并将转轴延伸到外壳外侧'
        },
        {
          key: 'fun_upgrade',
          title: '趣味结构升级',
          role: '让使用过程更有趣，增强工程体验',
          structure: '在延长转轴上安装竹蜻蜓，脱水桶旋转时带动竹蜻蜓一起转动'
        }
      ],
      blueprints: [
        { name: '模型图纸设计 1', path: eng2Image('4-1.png') },
        { name: '模型图纸设计 2', path: eng2Image('4-2.png') }
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
	      title: '模型搭建步骤：制作拉线动力系统',
	      summary: '安装拉线动力装置。',
	      lines: ['使用材料：拉线、橡胶圈。']
	    },
	    {
	      key: 'step4',
	      title: '模型搭建步骤：制作外壳系统',
	      summary: '制作外壳系统并完成三大系统整合。',
	      lines: [
	        '①安装轴承：使用材料：大塑料罐、泡棉胶、滚珠轴承。',
	        '②固定脱水桶系统和动力系统在外壳系统里：使用系统：脱水桶系统、拉线系统、外壳系统，使用材料：拉环、竹蜻蜓、橡胶圈。'
	      ]
	    }
	  ],
      buildSteps: [
        '步骤1：准备搭建材料和工具。',
        '步骤2：制作脱水桶系统：使用圆筒网兜、短木棒、长木棒、大孔泡棉胶、T型塑料垫片、圆形塑料垫片、双面胶。',
        '步骤3：制作拉线动力系统：使用拉线、橡胶圈。',
        '步骤4：制作外壳系统：使用大塑料罐、泡棉胶、滚珠轴承。',
        '步骤5：组装手动甩干机：使用脱水桶系统、拉线系统、外壳系统，以及拉环、竹蜻蜓、橡胶圈。'
      ],
      materials: [
        { name: '圆筒网兜', spec: '150ml', qty: '1个', usage: '装衣服的内筒，做脱水桶' },
        { name: '带孔大塑料罐', spec: '1050ml', qty: '1个', usage: '外筒，固定脱水桶和动力系统' },
        { name: '短木棒', spec: '5mm*2cm', qty: '1根', usage: '做脱水桶底部转轴' },
        { name: '长木棒', spec: '5mm*4.3cm', qty: '1根', usage: '做脱水桶顶部转轴' },
        { name: '备用木棒', spec: '5mm*15cm', qty: '1根', usage: '做脱水桶转轴备用' },
        { name: '滚珠轴承', spec: '6mm*28mm', qty: '2个', usage: '做轴承' },
        { name: '小孔圆形泡棉胶', spec: '6mm*2.5cm', qty: '2个', usage: '固定轴承用' },
        { name: '大孔圆形泡棉胶', spec: '1cm*2.5cm', qty: '2个', usage: '固定转轴用' },
        { name: '塑料T型垫片', spec: '6mm*1cm', qty: '2个', usage: '固定转轴用' },
        { name: '塑料圆形垫片', spec: '6mm*2.5cm', qty: '2个', usage: '固定转轴用' },
        { name: '尼龙线', spec: '50cm', qty: '1根', usage: '提供动力' },
        { name: '橡胶圈', spec: '4mm', qty: '2个', usage: '固定拉线在转轴上' },
        { name: '塑料扣', spec: '3cm', qty: '1个', usage: '固定在拉线上' },
        { name: '双面胶', spec: '3cm*8cm', qty: '1片', usage: '固定转轴用' },
        { name: '透明塑料盖', spec: '65mm', qty: '1个', usage: '加装在圆筒网兜顶部，增加顶部结构稳定' }
      ]
    },
    step5: {
      defaultTitle: '手动甩干机迭代与优化'
    },
    step7: {
      defaultTestType: 'qualitative',
      testTypeOptions: [
        { key: 'A', text: '定性测试（推荐）', value: 'qualitative' },
        { key: 'B', text: '定量测试', value: 'quantitative' }
      ],
      testFlow: [
        '流程1：准备测试材料和模型：袜子（自备）、水盆（自备）、手动甩干机。',
        '流程2：将袜子打湿后，用手轻轻拧一下袜子，再把袜子放入脱水桶。',
        '流程3：旋转内筒将拉线缠绕在转轴上，拉动拉线转动脱水桶，观察效果。',
        '流程4：进行重复多次测试。'
      ],
      testGuideVideo: {
        title: '测试流程展示视频',
        desc: '先看测试演示，再按上面的流程完成测试记录。',
        videoUrl: '/static/experiments/engineering-02/videos/6-1.mp4'
      },
      records: [
        {
          key: 'dewater',
          goal: '脱水效果',
          options: [
            { key: 'A', text: '脱水现象非常明显，且效果更好' },
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
            { key: 'A', text: '脱水桶转动非常快，并且更轻松。' },
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
      analysisRows: [
        {
          id: 'eng2-row-1',
          structure: '功能目标',
          problem: '达标（脱水高效，拆装便捷，脱水后用手已经拧不出水）。'
        },
        {
          id: 'eng2-row-2',
          structure: '性能目标',
          problem: '达标（转动轻松、低阻力、高稳定性、速度更快）。'
        },
        {
          id: 'eng2-row-3',
          structure: '成本目标',
          problem: '达标（整体材料成本可控制，性价比高）。'
        },
        {
          id: 'eng2-row-4',
          structure: '安全目标',
          problem: '达标（结构稳固、操作安全、无尖锐风险）。'
        }
      ],
	  
      generatedSummary: [
        '测试方案：定性测试方案。',
        '功能目标：达标（脱水高效，拆装便捷，脱水后用手已经拧不出水）。',
        '性能目标：达标（转动轻松、低阻力、高稳定性、速度更快）。',
        '成本目标：达标（整体材料成本可控制，性价比高）。',
        '安全目标：达标（结构稳固、操作安全、无尖锐风险）。',
        '总结：本次迭代升级的手动甩干机，通过材料升级（滚珠轴承 + 带孔网兜）和结构优化（外置转轴）的组合策略，成功解决了初代产品费力、拆装难、易磨损的问题。经测试验证，升级后的机器在功能上实现了高效脱水；在性能上大幅降低了摩擦力，实现了轻松拉动；在成本与安全上，以合理的小幅成本提升，换来了更高效率和更好的使用体验。'
      ]
    },
    step8: {
      displayMode: 'targetStatus',
      optimizationRows: [
        {
          key: 'function',
          problem: '功能目标',
          solution: '达标（脱水高效，拆装便捷脱水后，用手已经拧不出水）',
          replacement: ''
        },
        {
          key: 'performance',
          problem: '性能目标',
          solution: '达标（转动轻松、低阻力、高稳定性、速度更快）',
          replacement: ''
        },
        {
          key: 'cost',
          problem: '成本目标',
          solution: '达标（整体材料成本可控制，性价比高）',
          replacement: ''
        },
        {
          key: 'safety',
          problem: '安全目标',
          solution: '达标（结构稳固、操作安全、无尖锐风险）',
          replacement: ''
        },
        {
          key: 'summary',
          problem: '总结',
          solution: '本次迭代升级的手动甩干机，通过材料升级（滚珠轴承+带孔网兜）+ 结构优化（外置转轴）的组合策略，成功解决了初代产品费力、拆装难、易磨损的。经测试验证，升级后的机器在功能上实现了高效脱水；在性能上大幅降低了摩擦力，实现了轻松拉动；在成本与安全上，以合理的小幅成本提升，换来了更高效率。并且通过自己动手设计与搭建手动甩干机模型去实践解决生活问题还获取了更多的乐趣，有助于提升参与日常劳动的积极性，让劳动也变的这么有趣。',
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
  legacyId: 5,
  title: '手动离心甩干机的问题分析与结构迭代优化',
  summary: '基于问题记录做结构改造和二次测试。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/engineering-02/videos/intro.mp4'
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




