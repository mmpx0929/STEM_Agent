const eng1Img = (name) => `/static/experiments/engineering-01/images/virtual-build/${name}`;
const eng1Extra = (name) => `/static/experiments/engineering-01/images/材料与步骤图/1脱水桶打孔/${name}`;
const eng1Video = (name) => `/static/experiments/engineering-01/videos/${name}`;
const eng2Overview = (name) => `/static/experiments/engineering-02/images/overview/${name}`;
const eng2Step = (folder, name) => `/static/experiments/engineering-02/images/材料与步骤图/${folder}/${name}`;
const eng2Video = (name) => `/static/experiments/engineering-02/videos/${name}`;
const eng3Build = (name) => `/static/experiments/engineering-03/images/build-steps/${name}`;
const eng3Overview = (name) => `/static/experiments/engineering-03/images/overview/${name}`;
const eng3Material = (folder, name) => `/static/experiments/engineering-03/images/材料图/${folder}/${name}`;
const eng3Video = (name) => `/static/experiments/engineering-03/videos/${name}`;
const eng4Overview = (name) => `/static/experiments/engineering-04/images/overview/${name}`;
const eng4Material = (folder, name) => `/static/experiments/engineering-04/images/材料图/${folder}/${name}`;
const eng4Video = (name) => `/static/experiments/engineering-04/videos/${name}`;
const eng5Build = (name) => `/static/experiments/engineering-05/images/build-steps/${name}`;
const eng5Overview = (name) => `/static/experiments/engineering-05/images/overview/${name}`;
const eng6Overview = (name) => `/static/experiments/engineering-06/images/overview/${name}`;
const sci1Img = (name) => `/static/experiments/science-01/images/virtual-lab/${name}`;

export const ENGINEERING_STEP6_FINAL_RESULT_ID = 'manual_spinner_final_model';

const deepClone = (value) => JSON.parse(JSON.stringify(value || {}));

const createConfig = ({
  materialToolItems = [],
  resultItems = [],
  recipes = [],
  supportVideos = []
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
    materialItems,
    toolItems,
    resultItems,
    recipes,
    supportVideos,
    itemMap,
    toolIds: toolItems.map((item) => item.id),
    materialIds: materialItems.map((item) => item.id)
  };
};

const ENGINEERING_01_STEP6_CONFIG = createConfig({
  materialToolItems: [
    { id: 'small_bucket', label: '小塑料罐', type: 'material', image: eng1Img('小筒.jpg') },
    { id: 'short_stick', label: '短木棒', type: 'material', image: eng1Img('短木棒.jpg') },
    { id: 'long_stick', label: '长木棒', type: 'material', image: eng1Img('长木棒.jpg') },
    { id: 't_spacer', label: 'T型塑料垫片', type: 'material', image: eng1Img('T形垫片.jpg') },
    { id: 'round_spacer', label: '环形塑料片', type: 'material', image: eng1Img('环形塑料片.jpg') },
    { id: 'pull_line', label: '拉线', type: 'material', image: eng1Img('尼龙线.jpg') },
    { id: 'rubber_ring', label: '橡胶圈', type: 'material', image: eng1Img('橡胶圈.jpg') },
    { id: 'big_bucket', label: '大塑料罐', type: 'material', image: eng1Img('大筒.jpg') },
    { id: 'wood_wheel', label: '木轮', type: 'material', image: eng1Img('带孔木轮.jpg') },
    { id: 'pull_ring', label: '拉环', type: 'material', image: eng1Img('拉环.jpg') },
    { id: 'big_hole_foam', label: '大孔泡棉胶', type: 'tool', image: eng1Img('大孔圆形胶.jpg') },
    { id: 'foam_tape', label: '泡棉胶（工具）', type: 'tool', image: eng1Img('圆形胶.jpg') },
    { id: 'double_tape', label: '双面胶（工具）', type: 'tool', image: eng1Img('双面胶.jpg') },
    { id: 'alcohol_lamp', label: '酒精灯（工具）', type: 'tool', image: eng1Img('酒精灯.jpg') },
    { id: 'screwdriver', label: '螺丝刀（工具）', type: 'tool', image: eng1Img('螺丝刀.jpg') },
    { id: 'alcohol', label: '酒精（自备工具）', type: 'tool', image: eng1Img('酒精.jpg') },
    { id: 'glove', label: '手套（工具）', type: 'tool', image: eng1Extra('手套.jpg') }
  ],
  resultItems: [
    { id: 'perforated_bucket_unit', label: '脱水桶打孔装置', image: eng1Img('8小筒打孔.jpg') },
    { id: 'bucket_system', label: '脱水桶系统', image: eng1Img('10短木棒组合粘在内筒下.jpg') },
    { id: 'pull_power_system', label: '拉线动力系统', image: eng1Img('11绳子一端固定橡胶圈.jpg') },
    { id: 'shell_system', label: '外壳系统', image: eng1Img('17粘在大筒底部中心.jpg') },
    { id: ENGINEERING_STEP6_FINAL_RESULT_ID, label: '手动甩干机模型', image: eng1Img('成果.jpg') }
  ],
  recipes: [
    {
      id: 'recipe_perforated_bucket_unit',
      output: 'perforated_bucket_unit',
      inputs: ['alcohol_lamp', 'screwdriver', 'glove', 'alcohol', 'small_bucket'],
      hint: '环节1：制作脱水桶打孔装置。使用工具：酒精灯、螺丝刀、手套、酒精（自备）；使用材料：小塑料罐。请把这些材料和工具先选到操作区。',
      nextHint: '下一步进入环节2：安装脱水桶转轴装置。'
    },
    {
      id: 'recipe_bucket_system',
      output: 'bucket_system',
      inputs: ['perforated_bucket_unit', 'short_stick', 'long_stick', 'big_hole_foam', 't_spacer', 'round_spacer', 'double_tape'],
      hint: '环节2：安装脱水桶转轴装置。使用材料：脱水桶打孔装置、短木棒、长木棒、大孔泡棉胶、T型塑料垫片、环形塑料片、双面胶。',
      nextHint: '下一步进入环节3：制作拉线动力系统。'
    },
    {
      id: 'recipe_pull_power_system',
      output: 'pull_power_system',
      inputs: ['pull_line', 'rubber_ring'],
      hint: '环节3：制作拉线动力系统。使用材料：拉线、橡胶圈。',
      nextHint: '下一步进入环节4：制作外壳系统。'
    },
    {
      id: 'recipe_shell_system',
      output: 'shell_system',
      inputs: ['big_bucket', 'foam_tape', 'wood_wheel'],
      hint: '环节4：制作外壳系统。使用材料：大塑料罐、泡棉胶（工具）、木轮。',
      nextHint: '下一步进入环节5：组装手动甩干机。'
    },
    {
      id: 'recipe_manual_spinner_final',
      output: ENGINEERING_STEP6_FINAL_RESULT_ID,
      inputs: ['bucket_system', 'pull_power_system', 'shell_system', 'pull_ring'],
      hint: '环节5：组装手动甩干机。使用系统：脱水桶系统、拉线动力系统、外壳系统；使用材料：拉环。',
      nextHint: '已完成全部关键环节，可标记第6步完成并进入下一步。'
    }
  ],
  supportVideos: [
    {
      id: 'eng1-effect-demo',
      title: '效果展示',
      desc: '先看完整效果展示，理解手动离心甩干机最后要实现的状态和功能。',
      videoUrl: eng1Video('6-1.mp4')
    },
    {
      id: 'eng1-practice-demo',
      title: '实践动手讲解',
      desc: '小朋友尝试着线下搭建自己的模型吧，遇到问题记得跟着视频一步一步操作哦。',
      videoUrl: eng1Video('6-2.mp4')
    }
  ]
});

const ENGINEERING_02_STEP6_CONFIG = createConfig({
  materialToolItems: [
    { id: 'mesh_bucket', label: '圆筒网兜', type: 'material', image: eng2Step('1制作脱水桶系统', '网兜.jpg') },
    { id: 'short_stick', label: '短木棒', type: 'material', image: eng2Step('1制作脱水桶系统', '短木棒.jpg') },
    { id: 'long_stick', label: '长木棒', type: 'material', image: eng2Step('1制作脱水桶系统', '长木棒.jpg') },
    { id: 'big_hole_foam', label: '大孔泡棉胶', type: 'material', image: eng2Step('1制作脱水桶系统', '大孔圆形胶.jpg') },
    { id: 't_spacer', label: 'T型塑料垫片', type: 'material', image: eng2Step('1制作脱水桶系统', 'T形垫片.jpg') },
    { id: 'round_spacer', label: '圆形塑料垫片', type: 'material', image: eng2Step('1制作脱水桶系统', '环形塑料片.jpg') },
    { id: 'double_tape', label: '双面胶', type: 'material', image: eng2Step('1制作脱水桶系统', '双面胶.jpg') },
    { id: 'pull_line', label: '拉线', type: 'material', image: eng2Step('2制作拉线动力系统', '尼龙线.jpg') },
    { id: 'rubber_ring', label: '橡胶圈', type: 'material', image: eng2Step('2制作拉线动力系统', '橡胶套1.jpg') },
    { id: 'big_bucket', label: '大塑料罐', type: 'material', image: eng2Step('3制作外壳系统', '大筒.jpg') },
    { id: 'small_hole_foam', label: '泡棉胶', type: 'material', image: eng2Step('3制作外壳系统', '圆形胶.jpg') },
    { id: 'bearing', label: '滚珠轴承', type: 'material', image: eng2Step('3制作外壳系统', '轴承1.jpg') },
    { id: 'pull_ring', label: '拉环', type: 'material', image: eng2Step('组装手动甩干机', '拉环.jpg') },
    { id: 'dragonfly', label: '竹蜻蜓', type: 'material', image: eng2Step('组装手动甩干机', '竹蜻蜓.jpg') }
  ],
  resultItems: [
    { id: 'bucket_system', label: '脱水桶系统', image: eng2Step('1制作脱水桶系统', '脱水桶装置.jpg') },
    { id: 'pull_power_system', label: '拉线动力系统', image: eng2Step('2制作拉线动力系统', '拉线装置.jpg') },
    { id: 'shell_system', label: '外壳系统', image: eng2Step('3制作外壳系统', '外壳系统.jpg') },
    { id: ENGINEERING_STEP6_FINAL_RESULT_ID, label: '组装后的手动甩干机', image: eng2Step('组装手动甩干机', '最终成品.jpg') }
  ],
  recipes: [
    {
      id: 'recipe_bucket_system',
      output: 'bucket_system',
      inputs: ['mesh_bucket', 'short_stick', 'long_stick', 'big_hole_foam', 't_spacer', 'round_spacer', 'double_tape'],
      hint: '环节1：制作脱水桶系统。使用材料：圆筒网兜、短木棒、长木棒、大孔泡棉胶、T型塑料垫片、圆形塑料垫片、双面胶。',
      nextHint: '下一步进入环节2：制作拉线动力系统。'
    },
    {
      id: 'recipe_pull_power_system',
      output: 'pull_power_system',
      inputs: ['pull_line', 'rubber_ring'],
      hint: '环节2：制作拉线动力系统。使用材料：拉线、橡胶圈。',
      nextHint: '下一步进入环节3：制作外壳系统。'
    },
    {
      id: 'recipe_shell_system',
      output: 'shell_system',
      inputs: ['big_bucket', 'small_hole_foam', 'bearing'],
      hint: '环节3：制作外壳系统。使用材料：大塑料罐、泡棉胶、滚珠轴承。',
      nextHint: '下一步进入环节4：组装手动甩干机。'
    },
    {
      id: 'recipe_manual_spinner_final',
      output: ENGINEERING_STEP6_FINAL_RESULT_ID,
      inputs: ['bucket_system', 'pull_power_system', 'shell_system', 'pull_ring', 'dragonfly', 'rubber_ring'],
      hint: '环节4：组装手动甩干机。使用系统：脱水桶系统、拉线系统、外壳系统；使用材料：拉环、竹蜻蜓、橡胶圈。',
      nextHint: '已完成全部关键环节，可标记第6步完成并进入下一步。'
    }
  ],
  supportVideos: [
    {
      id: 'eng2-effect-demo',
      title: '效果展示',
      desc: '先看迭代优化后的手动甩干机效果展示，理解升级后的结构和表现。',
      videoUrl: eng2Video('6-1.mp4')
    },
    {
      id: 'eng2-practice-demo',
      title: '实践动手讲解',
      desc: '小朋友尝试着线下搭建自己的模型吧，遇到问题记得跟着视频一步一步操作哦。',
      videoUrl: eng2Video('6-2.mp4')
    }
  ]
});

const ENGINEERING_03_STEP6_CONFIG = createConfig({
  materialToolItems: [
    { id: 'mesh_bucket', label: '圆筒网兜', type: 'material', image: eng3Material('1制作脱水桶系统', '圆筒网兜.jpg') },
    { id: 'bucket_foam', label: '泡棉胶1', type: 'material', image: eng3Material('1制作脱水桶系统', '泡棉胶1.jpg') },
    { id: 'bucket_pulley', label: '皮带轮1', type: 'material', image: eng3Material('1制作脱水桶系统', '皮带轮1.jpg') },
    { id: 'motor', label: '电机', type: 'material', image: eng3Material('2制作电动动力系统', '电机.jpg') },
    { id: 'battery_pack', label: '3节电池', type: 'material', image: eng3Material('2制作电动动力系统', '3节电池.jpg') },
    { id: 'straw', label: '吸管', type: 'material', image: eng3Material('2制作电动动力系统', '吸管.jpg') },
    { id: 'battery_box', label: '电池盒', type: 'material', image: eng3Material('2制作电动动力系统', '电池盒.jpg') },
    { id: 'power_scissors', label: '剪刀（自备）', type: 'tool', image: eng3Material('2制作电动动力系统', '自备剪刀.jpg') },
    { id: 'shell_part', label: '外壳系统', type: 'material', image: eng3Material('3组装电动甩干机', '外壳系统.jpg') },
    { id: 'assembly_pulley', label: '皮带轮2', type: 'material', image: eng3Material('3组装电动甩干机', '皮带轮2.jpg') },
    { id: 'assembly_foam_2', label: '泡棉胶2', type: 'material', image: eng3Material('3组装电动甩干机', '泡棉胶2.jpg') },
    { id: 'assembly_foam_3', label: '泡棉胶3', type: 'material', image: eng3Material('3组装电动甩干机', '泡棉胶3.jpg') },
    { id: 'assembly_foam_4', label: '泡棉胶4', type: 'material', image: eng3Material('3组装电动甩干机', '泡棉胶4.jpg') },
    { id: 'clear_tape', label: '透明胶', type: 'material', image: eng3Material('3组装电动甩干机', '透明胶.jpg') },
    { id: 'assembly_scissors', label: '剪刀（自备）', type: 'tool', image: eng3Material('3组装电动甩干机', '自备剪刀.jpg') }
  ],
  resultItems: [
    { id: 'bucket_system', label: '脱水桶系统', image: eng3Material('1制作脱水桶系统', '脱水桶系统.jpg') },
    { id: 'electric_power_system', label: '电动动力系统', image: eng3Material('2制作电动动力系统', '电动动力系统.jpg') },
    { id: 'shell_system', label: '外壳系统', image: eng3Material('3组装电动甩干机', '外壳系统.jpg') },
    { id: ENGINEERING_STEP6_FINAL_RESULT_ID, label: '电动甩干机', image: eng3Material('3组装电动甩干机', '成品.jpg') }
  ],
  recipes: [
    {
      id: 'recipe_bucket_system',
      output: 'bucket_system',
      inputs: ['mesh_bucket', 'bucket_pulley', 'bucket_foam'],
      hint: '环节1：制作脱水桶系统。使用材料：圆筒网兜、皮带轮1、泡棉胶1。',
      nextHint: '下一步进入环节2：制作电动动力系统。'
    },
    {
      id: 'recipe_electric_power_system',
      output: 'electric_power_system',
      inputs: ['motor', 'battery_box', 'battery_pack', 'straw', 'power_scissors'],
      hint: '环节2：制作电动动力系统。使用材料：电机、电池盒、3节电池、吸管；使用工具：剪刀（自备）。',
      nextHint: '下一步进入环节3：确认外壳系统。'
    },
    {
      id: 'recipe_shell_system',
      output: 'shell_system',
      inputs: ['shell_part'],
      hint: '环节3：确认外壳系统。请把外壳系统选到操作区，准备进行最终组装。',
      nextHint: '下一步进入环节4：组装电动甩干机。'
    },
    {
      id: 'recipe_electric_spinner_final',
      output: ENGINEERING_STEP6_FINAL_RESULT_ID,
      inputs: ['bucket_system', 'electric_power_system', 'shell_system', 'assembly_pulley', 'assembly_foam_2', 'assembly_foam_3', 'assembly_foam_4', 'clear_tape', 'assembly_scissors'],
      hint: '环节4：组装电动甩干机。使用系统：脱水桶系统、电动动力系统、外壳系统；使用材料：皮带轮2、泡棉胶2、泡棉胶3、泡棉胶4、透明胶；使用工具：剪刀（自备）。',
      nextHint: '已完成全部关键环节，可标记第6步完成并进入下一步。'
    }
  ],
  supportVideos: [
    {
      id: 'eng3-practice-demo',
      title: '实践动手讲解',
      desc: '小朋友尝试着线下搭建电动甩干机模型吧，遇到问题就跟着视频一步一步操作。',
      videoUrl: eng3Video('7-1.mp4')
    }
  ]
});

const ENGINEERING_04_STEP6_CONFIG = createConfig({
  materialToolItems: [
    { id: 'plastic_pen_holder', label: '塑料笔筒', type: 'material', image: eng4Material('1制作脱水桶系统', '塑料笔筒.jpg') },
    { id: 'pudding_cup', label: '布丁杯', type: 'material', image: eng4Material('2制作排水系统', '布丁杯.jpg') },
    { id: 'straw', label: '吸管', type: 'material', image: eng4Material('2制作排水系统', '吸管.jpg') },
    { id: 'old_electric_spinner', label: '旧电动甩干机', type: 'material', image: eng4Material('3加工外壳系统排水孔', '旧电动甩干机.jpg') },
    { id: 'alcohol_lamp', label: '酒精灯', type: 'tool', image: eng4Material('3加工外壳系统排水孔', '酒精灯.jpg') },
    { id: 'screwdriver', label: '螺丝刀', type: 'tool', image: eng4Material('3加工外壳系统排水孔', '螺丝刀.jpg') },
    { id: 'lighter', label: '打火机（自备）', type: 'tool', image: eng4Material('3加工外壳系统排水孔', '打火机（自备）.jpg') },
    { id: 'alcohol', label: '酒精（自备）', type: 'tool', image: eng4Material('3加工外壳系统排水孔', '酒精（自备）.jpg') },
    { id: 'glove', label: '手套', type: 'tool', image: eng4Material('3加工外壳系统排水孔', '手套.jpg') },
    { id: 'long_foam_tape', label: '长条泡棉胶', type: 'material', image: eng4Material('4组装升级后的电动甩干机', '长条泡棉胶.jpg') },
    { id: 'plastic_bowl', label: '塑料碗', type: 'material', image: eng4Material('4组装升级后的电动甩干机', '塑料碗.jpg') }
  ],
  resultItems: [
    { id: 'bucket_system', label: '脱水桶系统', image: eng4Material('1制作脱水桶系统', '脱水桶系统.jpg') },
    { id: 'drainage_system', label: '排水系统', image: eng4Material('2制作排水系统', '排水系统.jpg') },
    { id: 'shell_system', label: '有排水孔外壳系统', image: eng4Material('3加工外壳系统排水孔', '有排水孔外壳系统.jpg') },
    { id: ENGINEERING_STEP6_FINAL_RESULT_ID, label: '升级后的电动甩干机', image: eng4Material('4组装升级后的电动甩干机', '成品.jpg') }
  ],
  recipes: [
    {
      id: 'recipe_bucket_system',
      output: 'bucket_system',
      inputs: ['plastic_pen_holder'],
      hint: '环节1：制作脱水桶系统。使用材料：塑料笔筒。',
      nextHint: '下一步进入环节2：制作排水系统。'
    },
    {
      id: 'recipe_drainage_system',
      output: 'drainage_system',
      inputs: ['pudding_cup', 'straw'],
      hint: '环节2：制作排水系统。使用材料：布丁杯、吸管。',
      nextHint: '下一步进入环节3：制作外壳排水孔结构。'
    },
    {
      id: 'recipe_shell_system',
      output: 'shell_system',
      inputs: ['old_electric_spinner', 'alcohol_lamp', 'screwdriver', 'lighter', 'alcohol', 'glove'],
      hint: '环节3：加工外壳系统排水孔。使用材料：旧电动甩干机；使用工具：酒精灯、螺丝刀、打火机（自备）、酒精（自备）、手套。',
      nextHint: '下一步进入环节4：组装升级后的电动甩干机。'
    },
    {
      id: 'recipe_electric_spinner_final',
      output: ENGINEERING_STEP6_FINAL_RESULT_ID,
      inputs: ['bucket_system', 'drainage_system', 'shell_system', 'long_foam_tape', 'plastic_bowl'],
      hint: '环节4：组装升级后的电动甩干机。使用系统：脱水桶系统、排水系统、有排水孔外壳系统；使用材料：长条泡棉胶、塑料碗。',
      nextHint: '已完成全部关键环节，可标记第6步完成并进入下一步。'
    }
  ],
  supportVideos: [
    {
      id: 'eng4-practice-demo',
      title: '实践动手讲解',
      desc: '小朋友尝试着线下完成排水结构升级吧，遇到问题就跟着视频一步一步操作。',
      videoUrl: eng4Video('7-1.mp4')
    }
  ]
});

const ENGINEERING_05_STEP6_CONFIG = createConfig({
  materialToolItems: [
    { id: 'motor', label: '电机', type: 'material', image: sci1Img('电机.jpg') },
    { id: 'battery', label: '电池', type: 'material', image: sci1Img('电池.jpg') },
    { id: 'straw', label: '吸管', type: 'material', image: sci1Img('装饰吸管.jpg') },
    { id: 'battery_box', label: '电池盒', type: 'material', image: sci1Img('电池盒.jpg') },
    { id: 'foam_tape', label: '泡棉胶', type: 'material', image: sci1Img('泡棉胶.jpg') },
    { id: 'pulley', label: '皮带轮', type: 'material', image: eng5Build('water-step2.png') },
    { id: 'impeller', label: '波轮', type: 'material', image: eng5Overview('experiment8-2.png') },
    { id: 'turbine', label: '涡轮', type: 'material', image: eng5Overview('experiment8-3.png') },
    { id: 'clear_tape', label: '透明胶带', type: 'material', image: eng5Build('water-step4.png') },
    { id: 'big_bucket', label: '大塑料罐', type: 'material', image: eng5Overview('experiment8-1.png') },
    { id: 'scissors', label: '剪刀（自备）', type: 'tool', image: eng1Extra('自备剪刀.jpg') }
  ],
  resultItems: [
    { id: 'electric_power_system', label: '电动动力系统', image: eng5Build('water-step1.png') },
    { id: 'shell_system', label: '外壳系统', image: eng5Build('water-step3.png') },
    { id: ENGINEERING_STEP6_FINAL_RESULT_ID, label: '电动洗衣机', image: eng5Overview('experiment8-5.png') }
  ],
  recipes: [
    {
      id: 'recipe_electric_power_system',
      output: 'electric_power_system',
      inputs: ['motor', 'battery_box', 'battery', 'straw', 'scissors'],
      hint: '环节1：制作电动动力系统。使用工具：剪刀（自备）；使用材料：电机、电池盒、电池、吸管。',
      nextHint: '下一步进入环节2：制作外壳系统。'
    },
    {
      id: 'recipe_shell_system',
      output: 'shell_system',
      inputs: ['big_bucket'],
      hint: '环节2：制作外壳系统。使用材料：大塑料罐。',
      nextHint: '下一步进入环节3：组装电动洗衣机。'
    },
    {
      id: 'recipe_electric_washer_final',
      output: ENGINEERING_STEP6_FINAL_RESULT_ID,
      inputs: ['electric_power_system', 'shell_system', 'pulley', 'foam_tape', 'clear_tape', 'turbine'],
      hint: '环节3：组装电动洗衣机。使用系统：电动动力系统、外壳系统；使用材料：皮带轮、泡棉胶、透明胶带、涡轮。',
      nextHint: '已完成全部关键环节，可标记第6步完成并进入下一步。'
    }
  ]
});

const ENGINEERING_06_STEP6_CONFIG = createConfig({
  materialToolItems: [
    { id: 'previous_washer', label: '上一课电动洗衣机', type: 'material', image: eng6Overview('experiment9-1.png') },
    { id: 'battery_box', label: '新增电池盒', type: 'material', image: sci1Img('电池盒.jpg') },
    { id: 'battery', label: '电池', type: 'material', image: sci1Img('电池.jpg') }
  ],
  resultItems: [
    { id: 'reversing_power_system', label: '正反转动力系统', image: eng6Overview('experiment9-2.png') },
    { id: ENGINEERING_STEP6_FINAL_RESULT_ID, label: '正反转电动洗衣机', image: eng6Overview('experiment9-5.png') }
  ],
  recipes: [
    {
      id: 'recipe_reversing_power_system',
      output: 'reversing_power_system',
      inputs: ['battery_box', 'battery'],
      hint: '环节1：制作正反转动力系统。使用材料：新增电池盒、电池。',
      nextHint: '下一步进入环节2：组装正反转电动洗衣机。'
    },
    {
      id: 'recipe_reversing_washer_final',
      output: ENGINEERING_STEP6_FINAL_RESULT_ID,
      inputs: ['previous_washer', 'reversing_power_system'],
      hint: '环节2：组装正反转电动洗衣机。使用系统：上一课电动洗衣机、正反转动力系统。',
      nextHint: '已完成全部关键环节，可标记第6步完成并进入下一步。'
    }
  ]
});

const ENGINEERING_STEP6_CONFIG_MAP = {
  'engineering-01': ENGINEERING_01_STEP6_CONFIG,
  'engineering-02': ENGINEERING_02_STEP6_CONFIG,
  'engineering-03': ENGINEERING_03_STEP6_CONFIG,
  'engineering-04': ENGINEERING_04_STEP6_CONFIG,
  'engineering-05': ENGINEERING_05_STEP6_CONFIG,
  'engineering-06': ENGINEERING_06_STEP6_CONFIG
};

const DEFAULT_CONFIG = ENGINEERING_01_STEP6_CONFIG;

const pickPracticeVideo = (list = []) => {
  if (!Array.isArray(list) || list.length === 0) return null;
  const hit = list.find((item) => {
    const id = String((item && item.id) || '').toLowerCase();
    return id.includes('practice');
  });
  return hit || list[0];
};

export const getEngineeringStep6LabConfig = (experimentId) => {
  const config = deepClone(ENGINEERING_STEP6_CONFIG_MAP[experimentId] || DEFAULT_CONFIG);
  const practiceVideo = pickPracticeVideo(config.supportVideos || []);
  config.supportVideos = practiceVideo ? [practiceVideo] : [];
  return config;
};


