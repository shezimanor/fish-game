import { _decorator, Component, director } from 'cc';
import { EventManager } from './EventManager';
import { WebSocketResponse } from './types/index.d';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager = null;
  public static get instance(): GameManager {
    return GameManager._instance;
  }

  private _ws: WebSocket = null;
  public get ws(): WebSocket {
    return this._ws;
  }

  public roomId: string = '';

  protected onLoad(): void {
    // console.log('gameManager onLoad');
    // 單例模式
    if (!GameManager._instance) {
      // console.log('GameManager instance created');
      GameManager._instance = this;
    } else {
      this.destroy();
    }
    // 連接 WebSocket 伺服器
    this._ws = new WebSocket('wss://fish-game-server.fly.dev');
    this._installWebSocketEvent(this._ws);
    // 設為常駐節點(防止切換場景時被卸載)
    director.addPersistRootNode(this.node);
  }

  protected onDestroy(): void {
    // console.log('gameManager onDestroy');
    if (GameManager._instance === this) {
      GameManager._instance = null;
    }
    // 關閉 WebSocket 連接
    if (this._ws) {
      this._ws.close();
    }
  }

  private _installWebSocketEvent(ws: WebSocket): void {
    // 偵聽連接打開事件
    this._ws.onopen = (event) => {
      // console.log('WebSocket connected');
      // 將 StartScene 的按鈕改成可互動
      EventManager.eventTarget.emit('init-start-scene');
    };

    // 偵聽（全部）消息事件：由參數 action 來區分個別事件
    this._ws.onmessage = (event: MessageEvent) => {
      // console.log('Message from server:', event.data);
      const response: WebSocketResponse = JSON.parse(event.data);
      this.handleWebSocketEvent(response);
    };

    // 偵聽連接關閉事件
    this._ws.onclose = (event) => {
      // console.log('WebSocket disconnected');
      EventManager.eventTarget.emit(
        'websocket-disconnect',
        '伺服器斷線，請重新連線'
      );
    };

    // 偵聽錯誤事件
    this._ws.onerror = (event) => {
      // console.error('WebSocket error:', event);
      EventManager.eventTarget.emit(
        'websocket-disconnect',
        '伺服器斷線，請重新連線'
      );
    };
  }

  // 發送消息到 WebSocket 伺服器
  // 使用方式： GameManager.instance.sendMessage('create-room', { playerName: 'Morris' });
  sendMessage(action: string, data: Record<string, any> | string | null): void {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ action, data });
      // 發送消息到 WebSocket 伺服器
      this._ws.send(message);
      // console.log('Message sent:', message);
    } else {
      console.error('WebSocket is not open. Message not sent.');
    }
  }

  sendMessageWithRoomId(
    action: string,
    data: Record<string, any> | string | null
  ): void {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ action, roomId: this.roomId, data });
      // 發送消息到 WebSocket 伺服器
      this._ws.send(message);
      // console.log('Message sent:', message);
    } else {
      console.error('WebSocket is not open. Message not sent.');
    }
  }

  handleWebSocketEvent(response: WebSocketResponse): void {
    switch (response.action) {
      // 玩家建立房間
      case 'room-created':
        if (response.succ) {
          // console.log('房間建立成功:', response.data);
          // 將房間 ID 儲存到 GameManager 中
          this.roomId = response.data.roomId;
          director.loadScene('02-game-scene', (err, scene) => {
            if (err)
              EventManager.eventTarget.emit('response-fail', '加載場景失敗');
            // console.log('GameScene 加載成功');
            // response.data 是完整的自己的玩家資料
            EventManager.eventTarget.emit('init-game-scene', response.data);
          });
        } else {
          EventManager.eventTarget.emit('response-fail', response.msg);
        }
        break;
      // 玩家加入房間
      case 'room-joined':
        if (response.succ) {
          // console.log('房間加入成功:', response.data);
          // 將房間 ID 儲存到 GameManager 中
          this.roomId = response.data.roomId;
          director.loadScene('02-game-scene', (err, scene) => {
            if (err)
              EventManager.eventTarget.emit('response-fail', '加載場景失敗');
            // console.log('GameScene 加載成功');
            // response.data 是完整的自己的玩家資料
            EventManager.eventTarget.emit('init-game-scene', response.data);
          });
        } else {
          EventManager.eventTarget.emit('response-fail', response.msg);
        }
        break;
      // 其他玩家加入房間
      case 'player-joined':
        if (response.succ) {
          // console.log('玩家加入成功:', response.data);
          // response.data 是新玩家的名稱
          EventManager.eventTarget.emit('player-joined', response.data);
        }
        break;
      // 其他玩家離開房間
      case 'player-left':
        if (response.succ) {
          // console.log('玩家離開:', response.data);
          // response.data 是玩家的名稱
          EventManager.eventTarget.emit('player-left', response.data);
        }
        break;
      // 其他玩家轉動槍管
      case 'rotate-gun':
        if (response.succ) {
          // response.data 是角度
          EventManager.eventTarget.emit('rotate-gun', response.data);
        }
        break;
      // 其他玩家開火
      case 'fire-gun':
        if (response.succ) {
          // response.data 是空的
          EventManager.eventTarget.emit('fire-gun');
        }
        break;
      // 扣點數(開火後的回應)
      case 'spend-point':
        if (response.succ) {
          // response.data 是扣除本次的子彈花費後的新的點數總量
          EventManager.eventTarget.emit('update-point', response.data, false);
        }
        break;
      // 中獎回報
      case 'return-result':
        if (response.succ) {
          // response.data 是 { result, uuid, fishId, point } 其中 point 是玩家的新點數總值
          EventManager.eventTarget.emit('return-result', response.data);
        }
        break;
      case 'get-point-response':
        if (response.succ) {
          // response.data 是新的點數總量
          EventManager.eventTarget.emit('update-point', response.data, true);
        }
        break;
      // 玩家中獎
      case 'player-won':
        if (response.succ) {
          // response.data 是魚隻的 uuid
          EventManager.eventTarget.emit('other-got-fish', response.data);
        }
        break;
      // 魚隻生成
      case 'spawn-fishes':
        if (response.succ) {
          // response.data 是魚的資料(為陣列)
          EventManager.eventTarget.emit('spawn-fishes', response.data);
        }
        break;
      // 房間時間到
      case 'room-timeout':
        if (response.succ) {
          // response.data 是房間時間到的文字訊息
          EventManager.eventTarget.emit('room-timeout', response.data);
        }
        break;
    }
  }
}
