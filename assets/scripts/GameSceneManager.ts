import { _decorator, Component, director, Label, Node } from 'cc';
import { EventManager } from './EventManager';
import { ClientObject } from './types/index.d';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

const bulletValues = {
  1: 100,
  2: 300,
  3: 500,
  4: 1000,
  5: 2000,
  6: 5000,
  7: 10000
};

@ccclass('GameSceneManager')
export class GameSceneManager extends Component {
  @property(Node)
  public otherPlayerNode: Node = null;
  @property(Node)
  public otherPlayerUI: Node = null;
  @property(Node)
  public otherGunBody: Node = null;
  @property(Label)
  public otherPlayerNameLabel: Label = null;
  @property(Label)
  public playerNameLabel: Label = null;
  @property(Label)
  public playerPointLabel: Label = null;
  @property(Label)
  public roomIdLabel: Label = null;
  @property(Label)
  public bulletValueLabel: Label = null;

  public bulletLevel: number = 3;

  protected onLoad(): void {
    console.log('GameSceneManager onLoad');
    // 註冊事件
    EventManager.eventTarget.on('init-game-scene', this.initGameScene, this);
    EventManager.eventTarget.on('player-joined', this.addOtherPlayer, this);
    EventManager.eventTarget.on('player-left', this.removeOtherPlayer, this);
    EventManager.eventTarget.on('rotate-gun', this.rotateGun, this);
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
    EventManager.eventTarget.off('rotate-gun', this.rotateGun, this);
  }

  initGameScene(data: ClientObject) {
    console.log('GameSceneManager initGameScene');
    if (data) {
      this.playerNameLabel.string = `${data.playerName}`;
      this.playerPointLabel.string = `${data.point}`;
      this.roomIdLabel.string = `房號: ${data.roomId}`;
      if (data.other) this.addOtherPlayer(data.other);
      // 初始化子彈價值
      this.bulletValueLabel.string = `${bulletValues[this.bulletLevel]}`;
    } else {
      console.error('initGameScene data is null');
    }
  }

  onClickQuitRoom() {
    // 發送離開房間 'leave-room' 事件 (玩家的名字讓伺服器自己傳)
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

  onClickPlus() {
    if (this.bulletLevel < 7) {
      this.bulletLevel++;
      this.bulletValueLabel.string = `${bulletValues[this.bulletLevel]}`;
    }
  }

  onClickMinus() {
    if (this.bulletLevel > 1) {
      this.bulletLevel--;
      this.bulletValueLabel.string = `${bulletValues[this.bulletLevel]}`;
    }
  }

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

  rotateGun(angle: string) {
    // 這裡的 angle 是一個範圍在 20 到 160 之間的數字，角度的算法如下
    this.otherGunBody.angle = 180 - Number(angle);
  }
}
