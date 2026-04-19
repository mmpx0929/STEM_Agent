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
  step1: '前面我们设计并测试了电动洗衣机，通过测试数据我们发现了电动机只能单向转动会导致袜子拧成一团，甚至会卡住波轮，这节课我们将对电动洗衣机进行迭代与升级。',
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

const experimentId = 'engineering-06';
const flowTemplate = withOverride(BASE_TEMPLATE, {
    id: 'engineering-06',
    title: '电动洗衣机的电机正反转改造与功能优化',
    step1: {
      introVideoUrl: introVideo('2-6'),
      introHintText: '前面我们设计并测试了电动洗衣机，通过测试数据我们发现了电动机只能单向转动会导致袜子拧成一团，甚至会卡住波轮，这节课我们将对电动洗衣机进行迭代与升级。',
      coreQuestion: '如何让电机实现正反转动？'
    },
    step2: {
      options: [
        {
          key: 'A',
          text: '怎样设计让电机一会儿可以正转，一会儿可以反转？',
          isCorrect: true
        },
        {
          key: 'B',
          text: '怎样保持电机一直单向转动，而不用继续解决袜子缠绕问题？',
          isCorrect: false
        }
      ]
    },
    step3: {
      options: [
        {
          key: 'A',
          text: '改变电流方向或磁场方向，可以改变电磁力的方向，从而让电机正转或反转。',
          isCorrect: true
        },
        {
          key: 'B',
          text: '只要增加水量，电机就会自动实现正反转，不需要改电路方向。',
          isCorrect: false
        },
        {
          key: 'C',
          text: '把电机固定得更紧，就可以直接得到正反双向转动效果。',
          isCorrect: false
        }
      ]
    },
    step4: {
      targetOptions: {
        function: [
          { key: 'A', text: '电机能够正转和反转，让水流双向搅拌，把袜子洗得更干净。', isCorrect: true },
          { key: 'B', text: '电机只能朝一个方向转动，不需要反转也能完成洗衣。', isCorrect: false }
        ],
        performance: [
          { key: 'A', text: '电机正反转切换顺畅、转动平稳，不会剧烈晃动或飞溅大量水。', isCorrect: true },
          { key: 'B', text: '电机正反转时卡顿、抖动强烈，甚至会突然停止或乱转。', isCorrect: false }
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
          key: 'power_upgrade',
          title: '电动动力系统升级',
          role: '让电机实现正转和反转，形成双向搅拌水流',
          structure: '在原有电动洗衣机基础上增加一个电池盒，配合切换实现正反转'
        }
      ],
      buildSteps: [
        '步骤1：准备搭建材料和工具。',
        '步骤2：制作迭代电动动力系统：使用上一节课的电动洗衣机、电池盒、电池。',
        '步骤3：完成电机正反转改造，检查开关切换顺序和线路连接是否稳定。'
      ],
      materials: [
        { name: '电池', spec: '火车牌5号', qty: '3节', usage: '提供电机电能' },
        { name: '电池盒', spec: '3节5号', qty: '1个', usage: '新增一个电池盒，用于测试电机正反转' }
      ]
    },
    step5: {
      defaultTitle: '电动洗衣机的迭代与优化设计'
    },
    step7: {
      defaultTestType: 'qualitative',
      testTypeOptions: [
        { key: 'A', text: '定性测试（推荐）', value: 'qualitative' },
        { key: 'B', text: '定量测试', value: 'quantitative' }
      ],
      testFlow: [
        '流程1：准备测试材料和模型：袜子（自备）、水盆（自备）、迭代后电动洗衣机。',
        '流程2：选择波轮搅动结构，安装在电机上，把洗衣桶装上 2/3 的水。',
        '流程3：先打开电池盒 1 的开关，关闭后再打开电池盒 2 的开关，观察电机带动搅动结构后水的运动现象。',
        '流程4：再往洗衣机里放入袜子，重复依次打开和关闭两个电池盒的开关，观察袜子和水的运动现象。',
        '流程5：可以加入洗衣液进行真实测试。',
        '流程6：可以重复多次测试。'
      ],
      records: [
        {
          key: 'dewater',
          goal: '洗衣效果',
          options: [
            { key: 'A', text: '袜子上的泥土或污渍明显变少，袜子看起来变干净了。' },
            { key: 'B', text: '还是和之前一样，袜子上的污渍并没有明显减少。' }
          ],
          choice: '',
          effect: '通过：达到了洗衣目的'
        },
        {
          key: 'performance',
          goal: '性能效果',
          options: [
            { key: 'A', text: '机器能够平稳转动，袜子不会拧在一起，袜子能在水中充分翻滚。' },
            { key: 'B', text: '还是和之前一样，转动不久后袜子就会拧成一团，甚至可能会卡住波轮。' }
          ],
          choice: '',
          effect: '达标：性能正常，运转高效，能把袜子洗得更干净'
        },
        {
          key: 'operation',
          goal: '操作效果',
          options: [
            { key: 'A', text: '两个电池盒按顺序切换比较顺畅，孩子能够理解并完成操作。' },
            { key: 'B', text: '切换过程比较繁琐，操作时容易混乱。' }
          ],
          choice: '',
          effect: '达标：当前操作可完成正反转测试，但仍有进一步简化空间'
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
          id: 'eng6-row-1',
          structure: '功能目标',
          problem: '达标（电机可稳定正反转，洗衣效果良好；正反转功能有效提升了洗衣效率）。'
        },
        {
          id: 'eng6-row-2',
          structure: '性能目标',
          problem: '达标（运转平稳、切换顺畅、无异常故障；升级后依旧保持稳定运行）。'
        },
        {
          id: 'eng6-row-3',
          structure: '成本目标',
          problem: '达标（材料廉价易获取，总成本可控；升级方案经济可行）。'
        },
        {
          id: 'eng6-row-4',
          structure: '安全目标',
          problem: '达标（无安全隐患，适合小学生使用）。'
        }
      ],
      generatedSummary: [
        '测试方案：定性测试方案。',
        '功能目标：达标（电机可稳定正反转，洗衣效果良好）；升级后的正反转功能有效提升了洗衣效率。',
        '性能目标：达标（运转平稳、切换顺畅、无异常故障）；在实现正反转的同时，机器整体运行依旧稳定。',
        '成本目标：达标（材料廉价易获取，总成本可控）；升级方案经济可行，无需额外增加过高成本。',
        '安全目标：达标（无安全隐患，适合小学生使用）。',
        '总结：本次迭代升级后的小型袜子洗衣机，成功实现了电机双向正反转功能。双向搅拌让袜子清洗更充分、更干净，相比升级前的单向转动洗衣机，洗衣效果和运转合理性都有明显提升。'
      ]
    },
    step8: {
      optimizationRows: [
        {
          key: 'switch_frequency',
          problem: '电机正反转已经实现，但切换频率还可以继续优化',
          solution: '继续调整正反转切换节奏，让袜子在水中翻滚得更充分',
          replacement: '增加更稳定的切换控制方案，优化两个电池盒的切换频率'
        },
        {
          key: 'operation_simplify',
          problem: '当前需要手动切换两个电池盒，操作步骤还不够简洁',
          solution: '让正反转控制更省时省力，降低儿童操作负担',
          replacement: '在后续版本中使用更便捷的正反转控制模块或集成开关结构'
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
  legacyId: 9,
  title: '电动洗衣机的电机正反转改造与功能优化',
  summary: '实现正反转控制并评估综合性能。',
  status: 'enabled',
  intro: {
    homeVideoUrl: '/static/Introductory-video/home.mp4',
    step1VideoUrl: '/static/experiments/engineering-06/videos/intro.mp4'
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




