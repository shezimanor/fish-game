import { _decorator, Component, director, Node } from 'cc';
import { EventManager } from './EventManager';
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
    console.log('gameManager onLoad');
    // 單例模式
    if (!GameManager._instance) {
      // console.log('GameManager instance created');
      GameManager._instance = this;
    } else {
      this.destroy();
    }
    // 連接 WebSocket 伺服器
    this._ws = new WebSocket('ws://localhost:3000');
    this._installWebSocketEvent(this._ws);
    // 設為常駐節點(防止切換場景時被卸載)
    director.addPersistRootNode(this.node);
  }

  protected onDestroy(): void {
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
      console.log('WebSocket connected');
      // 將 StartScene 的按鈕改成可互動
      EventManager.eventTarget.emit('init-start-scene');
    };

    // 偵聽（全部）消息事件：由參數 action 來區分個別事件
    this._ws.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    // 偵聽連接關閉事件
    this._ws.onclose = (event) => {
      console.log('WebSocket disconnected');
    };

    // 偵聽錯誤事件
    this._ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };
  }

  // 發送消息到 WebSocket 伺服器
  // 使用方式： GameManager.instance.sendMessage('createRoom', { playerName: 'Morris' });
  sendMessage(action: string, data: Record<string, any>): void {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ action, data });
      this._ws.send(message);
      console.log('Message sent:', message);
    } else {
      console.error('WebSocket is not open. Message not sent.');
    }
  }
}
