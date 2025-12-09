export enum GamePhase {
  SPLASH,
  MENU,
  INTRO,
  EXPLORATION,
  ROOM_VIEW,
  COMBAT,
  PUZZLE,
  KEYPAD,
  SHOP_VIEW,
  DIALOG,
  GAME_OVER,
  VICTORY,
  EVENT_5PM
}

export enum RoomType {
  CORRIDOR = '走廊',
  WARD = '病房',
  TOILET = '厕所',
  OFFICE = '办公室',
  SURGERY = '手术室',
  PHARMACY = '药房',
  ELEVATOR = '电梯',
  SHOP = '小卖部',
  LAB = '实验室',
  SECURITY = '保安室',
  DEAN_OFFICE = '院长办公室',
  ARCHIVES = '档案室',
  VOID = '穿越层',
  MORGUE = '停尸房',
  WAITING_ROOM = '候诊室',
  UTILITY = '污物间',
  POWER_ROOM = '配电室'
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'WEAPON' | 'HEALING' | 'KEY' | 'MISC' | 'FILE' | 'RUMOR';
  value: number;
  quantity: number;
  content?: string;
  isTrue?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardGold: number;
  unlocked: boolean;
}

export interface NPC {
    id: string;
    name: string;
    description: string;
    dialogue: {
        id: string;
        text: string;
        options: { text: string; nextId?: string; action?: string }[];
    }[];
}

export interface Entity {
  id: string;
  type: 'DOOR' | 'ITEM' | 'ENEMY' | 'NPC' | 'CONTAINER';
  z: number; // Depth position (0 to Length)
  side: 'left' | 'right' | 'center'; 
  data: any; 
  locked?: boolean;
  code?: string;
  contentId?: string;
  interacted?: boolean;
}

export interface FloorData {
  level: number;
  name: string;
  dangerTitle: string; 
  dangerLevel: number; 
  description: string;
  doctorType: string;
  ambience: string;
  length: number;
  entities: Entity[];
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  sanity: number;
  gold: number;
  floor: number;
  z: number; // Current depth position
  facing: 'forward'; 
  inventory: Item[];
  weaponLevel: number;
  pets: string[]; 
  toiletLevel: number;
  time: number; 
  flags: Record<string, boolean>;
  achievements: string[]; 
  lastCombatTime: number;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'danger' | 'success' | 'system' | 'story' | 'gold';
  timestamp: string;
}

export interface DialogOption {
  text: string;
  action: () => void;
  requirement?: string;
}

export interface DialogData {
  speaker: string;
  text: string;
  options: DialogOption[];
}