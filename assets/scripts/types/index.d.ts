export type WebSocketResponse = {
  action: string;
  succ: boolean;
  data?: any;
  msg?: string;
};

export type ClientObject = {
  roomId: string;
  playerId: string;
  playerName: string;
  point: number;
  other?: string;
};

// 子彈池名稱
export enum BulletPoolName {
  BulletPool
}

// 魚隻類型
export enum FishType {
  Fish_01 = 1,
  Fish_02,
  Fish_03,
  Fish_04,
  Fish_05
}

// 魚隻
export interface FishConfig {
  uuid: string; // 魚的 UUID
  id: string; // 魚的 ID ex: 'fish_01'...
  name: string; // 名稱
  level: number; // 等級
  speed: number; // 速度: 每秒移動的距離(px)
  radiusH: number; // 圖片半徑(高的一半)
  spawnX: number; // 生成位置 x
  spawnY: number; // 生成位置 y
  spawnTime: number; // 生成時間
  isActive: boolean; // 是否在遊戲中
}
