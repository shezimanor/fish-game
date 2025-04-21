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
