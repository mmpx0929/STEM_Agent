const science1Material = (group, name) => `/static/experiments/science-01/images/材料与步骤图/${group}/${name}`;
const science2Material = (group, name) => `/static/experiments/science-02/images/材料与步骤图/${group}/${name}`;
const science2ShowcaseVideo = (name) => `/static/experiments/science-02/videos/制作视频+展示视频/${name}`;
const science2Making = (name) => `/static/experiments/science-02/videos/制作视频+展示视频/完整制作/${name}`;

export const STEP8_FINAL_RESULT_ID = 'final_spinner_model';

const createConfig = ({
  materialToolItems = [],
  resultItems = [],
  operationOptions = [],
  recipes = [],
  stageGuides = {},
  practiceVideo = null
} = {}) => {
  const allItems = [...materialToolItems, ...resultItems];
  const itemMap = allItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const materialItems = materialToolItems.filter((item) => item.type !== 'tool');
  const toolItems = materialToolItems.filter((item) => item.type === 'tool');

  return {
    materialToolItems,
    resultItems,
    operationOptions,
    recipes,
    itemMap,
    materialItems,
    toolItems,
    toolIds: toolItems.map((item) => item.id),
    materialIds: materialItems.map((item) => item.id),
    stageGuides,
    practiceVideo
  };
};

const SCIENCE_01_STEP8_CONFIG = createConfig({
  materialToolItems: [
    { id: 'controller', label: '变速器', type: 'material', image: science1Material('1动力系统组装', '变速器.jpg') },
    { id: 'motor', label: '电机', type: 'material', image: science1Material('1动力系统组装', '电机.jpg') },
    { id: 'battery_box', label: '电池盒', type: 'material', image: science1Material('1动力系统组装', '电池盒.jpg') },
    { id: 'wire', label: '电线', type: 'material', image: science1Material('1动力系统组装', '导线.jpg') },
    { id: 'straw', label: '吸管', type: 'material', image: science1Material('1动力系统组装', '装饰吸管.jpg') },
    { id: 'foam_tape', label: '泡棉胶', type: 'material', image: science1Material('1动力系统组装', '泡棉胶.jpg') },
    { id: 'battery', label: '电池', type: 'material', image: science1Material('1动力系统组装', '电池.jpg') },
    { id: 'bottle_cap', label: '瓶盖', type: 'material', image: science1Material('1动力系统组装', '瓶盖.jpg') },
    { id: 'wood_stick', label: '木棒', type: 'material', image: science1Material('2旋转系统组装', '木棒.jpg') },
    { id: 'cotton_thread', label: '尼龙线', type: 'material', image: science1Material('2旋转系统组装', '棉线.jpg') },
    { id: 'star', label: '五角星', type: 'material', image: science1Material('2旋转系统组装', '星星.jpg') },
    { id: 'rubber_ring', label: '橡胶圈', type: 'material', image: science1Material('2旋转系统组装', '橡胶套.jpg') },
    { id: 'plug_plate', label: '塑料固定件', type: 'material', image: science1Material('2旋转系统组装', '插盘.jpg') },
    { id: 'plastic_bottle', label: '瓶子', type: 'material', image: science1Material('3底座装置准备', '2瓶子.jpg') },
    { id: 'water', label: '水', type: 'material', image: science1Material('3底座装置准备', '1自备1000nl水.jpg') },
    { id: 'screwdriver', label: '螺丝刀', type: 'tool', image: science1Material('1动力系统组装', '螺丝刀.jpg') },
  ],
  resultItems: [
    { id: 'result_rotating_unit', label: '旋转装置', image: science1Material('2旋转系统组装', '旋转系统.jpg') },
    { id: 'result_power_unit', label: '动力装置', image: science1Material('1动力系统组装', '动力系统.jpg') },
    { id: 'result_base_unit', label: '底座装置', image: science1Material('3底座装置准备', '3底座装置.jpg') },
    { id: STEP8_FINAL_RESULT_ID, label: '旋转飞椅模型', image: science1Material('4最终组装', '4最终成品.jpg') }
  ],
  operationOptions: [
    {
      id: 'op1',
      title: '低速观察',
      desc: '先低速旋转，观察模型是否稳定，星星是否开始向外展开。',
      videoUrl: '/static/experiments/science-01/videos/op2-slow-speed.mp4',
      poster: ''
    },
    {
      id: 'op2',
      title: '高速观察',
      desc: '再提高速度，观察星星飞行高度和距离的变化。',
      videoUrl: '/static/experiments/science-01/videos/op1-high-speed.mp4',
      poster: ''
    }
  ],
  recipes: [
    {
      id: 'recipe_power_unit',
      output: 'result_power_unit',
      inputs: ['controller', 'motor', 'battery_box', 'wire', 'straw', 'foam_tape', 'battery', 'bottle_cap', 'screwdriver'],
      hint: '环节1：组装动力装置。请选择螺丝刀，以及变速器、电机、电池盒、电线、吸管、泡棉胶、电池、瓶盖进入操作区。',
      stageGuide: '环节1：组装动力装置。使用工具：螺丝刀；使用材料：变速器、电机、电池盒、电线、吸管、泡棉胶、电池、瓶盖。请把这些材料和工具选到操作区。',
      nextHint: '完成动力装置后，继续选择木棒、尼龙线、五角星、橡胶圈、塑料固定件，进入下一环节。',
      doneToast: '动力装置组装完成，已自动加入成果区。'
    },
    {
      id: 'recipe_rotating_unit',
      output: 'result_rotating_unit',
      inputs: ['wood_stick', 'cotton_thread', 'star', 'rubber_ring', 'plug_plate'],
      hint: '环节2：组装旋转装置。请选择木棒、尼龙线、五角星、橡胶圈、塑料固定件进入操作区。',
      stageGuide: '环节2：组装旋转装置。使用材料：木棒、尼龙线、五角星、橡胶圈、塑料固定件。请把这些材料选到操作区。',
      nextHint: '完成旋转装置后，再选择瓶子和水，制作底座装置。',
      doneToast: '旋转装置组装完成，已自动加入成果区。'
    },
    {
      id: 'recipe_base_unit',
      output: 'result_base_unit',
      inputs: ['plastic_bottle', 'water'],
      hint: '环节3：用瓶子做底座装置。请选择瓶子和水进入操作区。',
      stageGuide: '环节3：用瓶子做底座装置。使用材料：瓶子、水。请把这些材料选到操作区。',
      nextHint: '底座装置完成后，把动力装置、旋转装置、底座装置选到操作区，组装最终模型。',
      doneToast: '底座装置组装完成，已自动加入成果区。'
    },
    {
      id: 'recipe_final_model',
      output: STEP8_FINAL_RESULT_ID,
      inputs: ['result_power_unit', 'result_rotating_unit', 'result_base_unit'],
      hint: '环节4：组装旋转飞椅模拟装置。请选择动力装置、旋转装置、底座装置进入操作区。',
      stageGuide: '环节4：组装旋转飞椅模拟装置。使用装置：动力装置、旋转装置、底座装置。请把三个装置选到操作区，自动完成最终组装。',
      nextHint: '旋转飞椅模拟装置已完成，接下来进入低速和高速观察。',
      doneToast: '旋转飞椅模拟装置组装完成，已自动加入成果区。'
    }
  ],
  stageGuides: {
    buildStart: '请按照四个环节依次完成组装：动力装置、旋转装置、底座装置、旋转飞椅模拟装置。',
    buildContinue: '请继续按照当前环节提示，把需要的材料或装置选到操作区，系统会自动完成组装。',
    observe: '阶段3：成品完成后，先低速观察，再高速观察。',
    upload: '观察完成啦。可以将你的线下搭建结果通过上传记录下来哦。',
    done: '太棒了，你已经完成了实验部分的探究操作。'
  },
  practiceVideo: {
    title: '实践步骤讲解',
    desc: '跟着完整制作视频，一步一步完成线下实践搭建和操作。',
    videoUrl: '/static/experiments/science-01/videos/8-1-compressed.mp4',
    poster: '/static/experiments/science-01/videos/8-1.jpg'
  }
});

const SCIENCE_02_STEP8_CONFIG = createConfig({
  materialToolItems: [
    { id: 'old_rotating_unit', label: '动力系统', type: 'material', image: science2Material('2组装环节', '动力系统+底座.jpg') },
    { id: 'plastic_fixer', label: '塑料固定件', type: 'material', image: science2Material('1旋转系统', '插盘.jpg') },
    { id: 'wood_stick', label: '木棒', type: 'material', image: science2Material('1旋转系统', '木棒.jpg') },
    { id: 'nylon_line', label: '尼龙线', type: 'material', image: science2Material('1旋转系统', '棉线.jpg') },
    { id: 'rubber_ring', label: '橡胶圈', type: 'material', image: science2Material('1旋转系统', '橡胶套.jpg') },
    { id: 'ring_magnet', label: '环形磁铁', type: 'material', image: science2Material('1旋转系统', '磁铁.jpg') },
    { id: 'paper_clip', label: '回形针', type: 'material', image: science2Material('1旋转系统', '回形针.jpg') },
    { id: 'star', label: '五角星', type: 'material', image: science2Material('1旋转系统', '星星.jpg') }
  ],
  resultItems: [
    { id: 'result_magnetic_rotating_unit', label: '磁力旋转装置', image: science2Material('2组装环节', '旋转装置.jpg') },
    { id: 'result_power_unit', label: '动力系统', image: science2Material('2组装环节', '动力系统+底座.jpg') },
    { id: STEP8_FINAL_RESULT_ID, label: '离心力脱离验证模型', image: science2Material('2组装环节', '最终成品.jpg') }
  ],
  operationOptions: [
    {
      id: 'op1',
      title: '低速观察',
      desc: '低速转动时，先看一看五角星会不会飞起来，会不会马上脱离。',
      videoUrl: science2ShowcaseVideo('慢速旋转.mp4'),
      poster: science2Making('完整制作-封面.jpg')
    },
    {
      id: 'op2',
      title: '高速观察',
      desc: '逐步提高速度，观察五角星越飞越高，最后是否会挣脱磁力飞出去。',
      videoUrl: science2ShowcaseVideo('快速旋转.mp4'),
      poster: science2Making('完整制作-封面.jpg')
    }
  ],
  recipes: [
    {
      id: 'recipe_power_unit',
      output: 'result_power_unit',
      inputs: ['old_rotating_unit'],
      hint: '先拖动“动力系统”，成果区会先点亮动力系统。'
    },
    {
      id: 'recipe_magnetic_rotating_unit',
      output: 'result_magnetic_rotating_unit',
      inputs: ['plastic_fixer', 'wood_stick', 'nylon_line', 'rubber_ring', 'ring_magnet', 'paper_clip', 'star'],
      hint: '先组装“磁力旋转装置”：塑料固定件 + 木棒 + 尼龙线 + 橡胶圈 + 环形磁铁 + 回形针 + 五角星。'
    },
    {
      id: 'recipe_final_model',
      output: STEP8_FINAL_RESULT_ID,
      inputs: ['result_power_unit', 'result_magnetic_rotating_unit'],
      hint: '最后把“动力系统”和“磁力旋转装置”组合起来，完成升级模型。'
    }
  ],
  stageGuides: {
    buildStart: '阶段1：先拖动动力系统，点亮成果区的动力系统，再组装磁力旋转装置。',
    buildContinue: '阶段2：把动力系统和磁力旋转装置组合起来，完成升级模型。',
    observe: '阶段3：成品完成后，先低速观察“飞起来但不脱离”，再高速观察“越飞越高并飞出去”。',
    upload: '观察完成啦。可以上传线下搭建照片或视频，然后进入数据分析。',
    done: '太棒了，你已经完成了离心力脱离验证模型的探究操作。'
  },
  practiceVideo: {
    title: '实践步骤讲解',
    desc: '先观看完整制作视频，再参照步骤完成磁力升级装置的线下搭建。',
    videoUrl: science2Making('完整制作.mp4'),
    poster: science2Making('完整制作-封面.jpg')
  }
});

const STEP8_CONFIG_MAP = {
  'science-01': SCIENCE_01_STEP8_CONFIG,
  'science-02': SCIENCE_02_STEP8_CONFIG
};

const DEFAULT_STEP8_CONFIG = SCIENCE_01_STEP8_CONFIG;

const deepClone = (value) => JSON.parse(JSON.stringify(value || {}));

export const getStep8LabConfig = (experimentId) => {
  return deepClone(STEP8_CONFIG_MAP[experimentId] || DEFAULT_STEP8_CONFIG);
};




