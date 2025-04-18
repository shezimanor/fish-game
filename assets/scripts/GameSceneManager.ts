import { _decorator, Component, director, Label, Node } from 'cc';
import { EventManager } from './EventManager';
import { ClientObject } from './types';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameSceneManager')
export class GameSceneManager extends Component {
  @property(Node)
  public otherPlayerNode: Node = null;
  @property(Node)
  public otherPlayerUI: Node = null;
  @property(Label)
  public otherPlayerNameLabel: Label = null;
  @property(Label)
  public playerNameLabel: Label = null;
  @property(Label)
  public playerPointLabel: Label = null;
  @property(Label)
  public roomIdLabel: Label = null;

  protected onLoad(): void {
    console.log('GameSceneManager onLoad');
    // 註冊事件
    EventManager.eventTarget.on('init-game-scene', this.initGameScene, this);
    EventManager.eventTarget.on('player-joined', this.addOtherPlayer, this);
    EventManager.eventTarget.on('player-left', this.removeOtherPlayer, this);
  }

  start() {
    console.log('GameSceneManager start');
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // 註銷事件
    EventManager.eventTarget.off('init-game-scene', this.initGameScene, this);
    EventManager.eventTarget.off('player-joined', this.addOtherPlayer, this);
    EventManager.eventTarget.off('player-left', this.removeOtherPlayer, this);
  }

  initGameScene(data: ClientObject) {
    console.log('GameSceneManager initGameScene');
    if (data) {
      this.playerNameLabel.string = `${data.playerName}`;
      this.playerPointLabel.string = `${data.point}`;
      this.roomIdLabel.string = `房號: ${data.roomId}`;
      if (data.other) this.addOtherPlayer(data.other);
    } else {
      console.error('initGameScene data is null');
    }
  }

  onClickQuitRoom() {
    // 發送建立房間 'create-room' 請求
    GameManager.instance.sendMessage('leave-room', null);
    // 離開遊戲場景(可以先還原一些狀態)
    this.removeOtherPlayer();
    this.playerNameLabel.string = '';
    this.playerPointLabel.string = '';
    this.roomIdLabel.string = '';
    director.loadScene('01-start-scene', (err, scene) => {
      console.log('StartScene 加載成功');
      // response.data 是完整的自己的玩家資料
      EventManager.eventTarget.emit('init-start-scene');
    });
  }

  onClickPlus() {}

  onClickMinus() {}

  addOtherPlayer(otherPlayerName: string) {
    console.log('GameSceneManager addOtherPlayer');
    if (otherPlayerName) {
      this.otherPlayerNode.active = true;
      this.otherPlayerUI.active = true;
      this.otherPlayerNameLabel.string = `${otherPlayerName}`;
    }
  }

  removeOtherPlayer() {
    console.log('GameSceneManager removeOtherPlayer');
    this.otherPlayerNode.active = false;
    this.otherPlayerUI.active = false;
    this.otherPlayerNameLabel.string = '';
  }
}
