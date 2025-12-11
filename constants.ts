import { FloorData, RoomType, Item, Entity, Achievement } from './types';

// Time: 17:00 to 17:30
// 17:00 = 1020 minutes
// 17:30 = 1050 minutes
export const INITIAL_TIME_MINUTES = 17 * 60; 
export const DEADLINE_MINUTES = 17 * 60 + 30; 

// Database of rumors (True or False)
export const RUMOR_TEXTS = [
  { text: "不要回头，走廊尽头有东西在模仿你的影子。", isTrue: true },
  { text: "快跑！听到铃声就快跑！", isTrue: true },
  { text: "院长办公室的密码是1019，我试过了，是真的！", isTrue: true },
  { text: "高层的空气有毒，必须屏住呼吸。", isTrue: false }, // False, just flavor
  { text: "厕所里的镜子可以穿越时空。", isTrue: false }, // False
  { text: "给医生金币，他们就会放过你。", isTrue: false }, // False
  { text: "猫能看见隐形的东西。", isTrue: true },
];

export const ACHIEVEMENTS_DB: Achievement[] = [
  { id: 'first_gold', title: '第一桶金', description: '获得100金币。', rewardGold: 20, unlocked: false },
  { id: 'survivor_10', title: '生存本能', description: '生存超过10分钟。', rewardGold: 50, unlocked: false },
  { id: 'scholar', title: '求知欲', description: '阅读3份不同的档案。', rewardGold: 30, unlocked: false },
  { id: 'high_climber', title: '登高者', description: '到达第10层。', rewardGold: 100, unlocked: false },
];

export const ITEMS_DB: Record<string, Omit<Item, 'quantity'>> = {
  'bandage': { id: 'bandage', name: '绷带', description: '恢复1点生命值。', type: 'HEALING', value: 1 },
  'medkit': { id: 'medkit', name: '医疗包', description: '恢复3点生命值。', type: 'HEALING', value: 3 },
  'bread': { id: 'bread', name: '发硬的面包', description: '恢复少量理智和体力。', type: 'HEALING', value: 1 },
  'water': { id: 'water', name: '浑浊的水', description: '勉强能喝。', type: 'HEALING', value: 1 },
  'gun': { id: 'gun', name: '生锈的手枪', description: '基础防身武器。成功率50%。', type: 'WEAPON', value: 1 },
  'clock': { id: 'clock', name: '停滞的时钟', description: '永远指向4:30。', type: 'MISC', value: 0 },
  'id_card_1': { id: 'id_card_1', name: '一级ID卡', description: '开启低层门禁。', type: 'KEY', value: 0 },
  
  // Clues & Files
  'file_patient_007': { 
      id: 'file_patient_007', 
      name: '病历档案 #007', 
      description: '记载着某个病人的奇怪症状。', 
      type: 'FILE', 
      value: 0,
      content: "患者姓名：未知\n入院时间：10月19日\n症状：妄想症，声称自己生活在模拟程序中。\n备注：院长把他的重要物品锁在了保险箱，密码是他的入院日期。"
  },
  'file_diary': {
      id: 'file_diary',
      name: '残破的日记',
      description: '字迹潦草，勉强能辨认。',
      type: 'FILE', 
      value: 0,
      content: "如果是妈妈来敲门，她会叫我的乳名'小宝'。如果是那个东西...它只会模仿妈妈的声音，但它不知道那个名字。"
  },
  'newspaper_1998': {
      id: 'newspaper_1998',
      name: '旧报纸残片',
      description: '1998年的晚报，边缘已经碳化。',
      type: 'FILE',
      value: 0,
      content: "【本市新闻】12月25日晚，第三医院发生重大火灾，起火点位于实验室。院长今日下令将实验室密码重置为火灾发生的日期以示警醒。"
  },
  
  // Rumor Note Placeholder
  'rumor_note': {
      id: 'rumor_note',
      name: '皱巴巴的纸条',
      description: '不知是谁留下的，字迹颤抖。',
      type: 'RUMOR',
      value: 0,
      content: ''
  },

  'dean_key': { id: 'dean_key', name: '院长密钥', description: '开启所有权限。', type: 'KEY', value: 0 },
  'scalpel': { id: 'scalpel', name: '手术刀', description: '极其锋利。', type: 'WEAPON', value: 3 },
  'cat': { id: 'cat', name: '黑猫', description: '它能看见死人。', type: 'MISC', value: 0 },
};

const generateFloorEntities = (level: number, facilities: RoomType[]): Entity[] => {
  const entities: Entity[] = [];
  
  // Elevator (Exit/Next Level)
  entities.push({ id: `elev_${level}`, type: 'DOOR', x: 950, data: RoomType.ELEVATOR });
  
  // Toilet (Safety)
  entities.push({ id: `toilet_${level}`, type: 'DOOR', x: Math.floor(Math.random() * 800) + 50, data: RoomType.TOILET });

  // Special Puzzle Elements for Floor 2
  if (level === 2) {
      entities.push({ id: `file_007_${level}`, type: 'ITEM', x: 300, data: 'file_patient_007' });
      entities.push({ 
          id: `safe_007_${level}`, 
          type: 'CONTAINER', 
          x: 750, 
          data: '保险箱',
          locked: true,
          code: '1019',
          contentId: 'medkit' 
      });
  }
  
  if (level === 3) {
      entities.push({ id: `file_diary_${level}`, type: 'ITEM', x: 600, data: 'file_diary' });
      entities.push({ id: `newspaper_${level}`, type: 'ITEM', x: 200, data: 'newspaper_1998' });
      entities.push({ 
          id: `safe_lab_${level}`, 
          type: 'CONTAINER', 
          x: 800, 
          data: '实验室暗柜',
          locked: true,
          code: '1225',
          contentId: 'scalpel' 
      });
  }

  // SHOP - Present on every floor now
  if (!facilities.includes(RoomType.SHOP)) {
      facilities.push(RoomType.SHOP);
  }

  // Facilities
  facilities.forEach((room, idx) => {
    if (room === RoomType.TOILET || room === RoomType.ELEVATOR) return;
    entities.push({
      id: `room_${level}_${idx}`,
      type: 'DOOR',
      x: Math.floor(Math.random() * 800) + 100,
      data: room
    });
  });

  // Random Rumor Notes (20% chance per floor)
  if (Math.random() > 0.8) {
      entities.push({
          id: `rumor_${level}`,
          type: 'ITEM',
          x: Math.floor(Math.random() * 900),
          data: 'rumor_note'
      });
  }

  // Random items
  if (Math.random() > 0.6) {
     entities.push({
       id: `item_${level}_rand`,
       type: 'ITEM',
       x: Math.floor(Math.random() * 900),
       data: Math.random() > 0.5 ? 'bandage' : 'bread'
     });
  }

  return entities.sort((a, b) => a.x - b.x);
};

export const FLOORS: FloorData[] = [
  {
    level: 1,
    name: '药房层',
    dangerTitle: '混沌·Ⅰ级',
    dangerLevel: 1,
    description: '破碎的玻璃映照出扭曲的脸。',
    doctorType: '徘徊者',
    ambience: '日光灯管在头顶疯狂闪烁。',
    length: 1000,
    entities: generateFloorEntities(1, [RoomType.PHARMACY, RoomType.SECURITY])
  },
  {
    level: 2,
    name: '急诊层',
    dangerTitle: '警戒·Ⅱ级',
    dangerLevel: 2,
    description: '担架上的血迹还很新鲜。',
    doctorType: '急救医师',
    ambience: '远处传来心电监护仪的长鸣。',
    length: 1200,
    entities: generateFloorEntities(2, [RoomType.WARD, RoomType.OFFICE])
  },
  {
    level: 3,
    name: '住院层',
    dangerTitle: '阴霾·Ⅲ级',
    dangerLevel: 3,
    description: '不要回应任何呼叫铃。',
    doctorType: '巡查护士',
    ambience: '病房门随着气流自动开合。',
    length: 1200,
    entities: generateFloorEntities(3, [RoomType.WARD])
  },
  {
    level: 13, name: '行政层', dangerTitle: '核心·ⅩⅢ级', dangerLevel: 13,
    description: '真相就在院长的桌子上。', doctorType: '行政主管',
    ambience: '电话铃声此起彼伏，但接起来只有忙音。',
    length: 1500, entities: generateFloorEntities(13, [RoomType.DEAN_OFFICE, RoomType.ARCHIVES])
  },
  {
    level: 20, name: '穿越层', dangerTitle: '起源·∞级', dangerLevel: 20,
    description: '这里不像医院，更像是...另一个世界。', doctorType: '虚空行者',
    ambience: '纯白的虚无，或者是深邃的星空？',
    length: 1000, entities: [{ id: 'void_npc', type: 'NPC', x: 500, data: 'ALIEN' }]
  }
];

// Generate fillers
for (let i = 4; i < 20; i++) {
  if (i === 13) continue;
  FLOORS.push({
    level: i,
    name: `第${i}层`,
    dangerTitle: `梦魇·${i}级`,
    dangerLevel: i,
    description: '越往上走，空气越稀薄。',
    doctorType: '堕落医者',
    ambience: '墙壁开始渗出暗红色的液体。',
    length: 1000 + (i * 50),
    entities: generateFloorEntities(i, [RoomType.WARD, RoomType.OFFICE])
  });
}
FLOORS.sort((a, b) => a.level - b.level);