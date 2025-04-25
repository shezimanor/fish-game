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
  fishes?: FishConfig[]; // 魚的資料
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
  radiusW: number; // 圖片半徑(寬的一半)
  radiusH: number; // 圖片半徑(高的一半)
  spawnX: number; // 生成位置 x
  spawnY: number; // 生成位置 y
  spawnTime: number; // 生成時間
  maxLifeTime: number; // 魚的生命時間
  isActive: boolean; // 是否在遊戲中
}

// 結果回傳
export interface HitFishResult {
  result: boolean; // 是否中獎
  fishId: string; // 魚類別的 ID
  uuid: string; // 魚的 UUID
  point: number; // 加上中獎結果的當前點數總額(用不到)
}

// 音樂類型
export enum MusicClipType {
  Bgm
}

// 音效類型
export enum SoundClipType {
  Bullet, // 0
  Win, // 1
  Hit, // 2
  Coin // 3
}
