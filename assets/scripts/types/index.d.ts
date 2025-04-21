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
