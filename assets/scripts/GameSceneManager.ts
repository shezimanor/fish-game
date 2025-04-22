import { _decorator, Animation, Component, director, Label, Node } from 'cc';
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
  @property(Animation)
  public otherGunBodyAnimation: Animation = null;
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
  public point: number = 0;

  protected onLoad(): void {
    console.log('GameSceneManager onLoad');
    // 註冊事件
    EventManager.eventTarget.on('init-game-scene', this.initGameScene, this);
    EventManager.eventTarget.on('player-joined', this.addOtherPlayer, this);
    EventManager.eventTarget.on('player-left', this.removeOtherPlayer, this);
    EventManager.eventTarget.on('rotate-gun', this.rotateGun, this);
    EventManager.eventTarget.on('fire-gun', this.fireGun, this);
  }

  protected onDestroy(): void {
    // 註銷事件
    EventManager.eventTarget.off('init-game-scene', this.initGameScene, this);
    EventManager.eventTarget.off('player-joined', this.addOtherPlayer, this);
    EventManager.eventTarget.off('player-left', this.removeOtherPlayer, this);
    EventManager.eventTarget.off('rotate-gun', this.rotateGun, this);
    EventManager.eventTarget.off('fire-gun', this.fireGun, this);
  }

  initGameScene(data: ClientObject) {
    // console.log('GameSceneManager initGameScene');
    if (data) {
      this.roomIdLabel.string = `房號: ${data.roomId}`;
      this.playerNameLabel.string = `${data.playerName}`;
      // 另外紀錄數值，因為需要播放動畫
      this.point = data.point;
      this.playerPointLabel.string = `${this.point}`;
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
    // console.log('GameSceneManager addOtherPlayer');
    if (otherPlayerName) {
      this.otherPlayerNode.active = true;
      this.otherPlayerUI.active = true;
      this.otherPlayerNameLabel.string = `${otherPlayerName}`;
    }
  }

  removeOtherPlayer() {
    // console.log('GameSceneManager removeOtherPlayer');
    this.otherPlayerNode.active = false;
    this.otherPlayerUI.active = false;
    this.otherPlayerNameLabel.string = '';
  }

  // 這個方法是用來控制其他玩家的槍管，自己的槍管不會被這個方法控制
  rotateGun(angle: string) {
    // 這裡的 angle 是一個範圍在 20 到 160 之間的數字，角度的算法如下
    this.otherGunBody.angle = 180 - Number(angle);
  }

  // 這個方法是用來控制其他玩家的槍管擊發動畫，自己的槍管不會被這個方法控制
  fireGun() {
    console.log('fireGun');
    // 播放開火動畫
    if (this.otherGunBodyAnimation) this.otherGunBodyAnimation.play();
  }
}
