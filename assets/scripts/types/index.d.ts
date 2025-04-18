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
