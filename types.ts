export enum GamePhase {
  MENU,
  INTRO,
  EXPLORATION,
  ROOM_VIEW,
  COMBAT,
  PUZZLE,     // New phase for solving keypads/reading files
  DIALOG,     // New phase for NPC interaction
  GAME_OVER,
  VICTORY,
  EVENT_5PM   // Specific phase for 17:00 event
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
  VOID = '穿越层'
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'WEAPON' | 'HEALING' | 'KEY' | 'MISC' | 'FILE'; // Added FILE
  value: number; 
  quantity: number;
  content?: string; // Text content for files
  code?: string; // If it contains a code
}

export interface Entity {
  id: string;
  type: 'DOOR' | 'ITEM' | 'ENEMY' | 'NPC';
  x: number; 
  data: any; 
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
  x: number;
  facing: 'left' | 'right';
  inventory: Item[];
  weaponLevel: number;
  pets: string[]; 
  toiletLevel: number;
  time: number; // Minutes from 00:00 (16:30 = 990)
  flags: Record<string, boolean>;
  lastCombatTime: number;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'danger' | 'success' | 'system' | 'story';
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