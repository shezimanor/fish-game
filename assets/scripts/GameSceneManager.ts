import {
  _decorator,
  Animation,
  Component,
  director,
  Label,
  Node,
  Tween,
  tween
} from 'cc';
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
  @property(Node)
  public popupModal: Node = null;
  @property(Label)
  public modalText: Label = null;
  @property(Node)
  public popupQuitModal: Node = null;
  @property(Label)
  public quitModalText: Label = null;

  public bulletLevel: number = 3;
  public point: number = 0;
  private _isTransition: boolean = false;
  // 為了讓 tween 能夠執行 point，必須使用物件封裝
  private _tempPoint: Record<string, number> = {
    point: 0
  };
  private _tempTween: Tween<Record<string, number>> = null;
  // 為了避免有動畫期間導致 this.point 尚未處於不動狀態，使用 this._cachedPoint 來暫存
  private _cachedPoint: number = 0;

  protected onLoad(): void {
    console.log('GameSceneManager onLoad');
    // 註冊事件
    EventManager.eventTarget.on('init-game-scene', this.initGameScene, this);
    EventManager.eventTarget.on('player-joined', this.welcomeOtherPlayer, this);
    EventManager.eventTarget.on('player-left', this.removeOtherPlayer, this);
    EventManager.eventTarget.on('rotate-gun', this.rotateGun, this);
    EventManager.eventTarget.on('fire-gun', this.fireGun, this);
    EventManager.eventTarget.on(
      'before-fire-bullet',
      this.beforeFireBullet,
      this
    );
    EventManager.eventTarget.on('before-hit-fish', this.beforeHitFish, this);
    EventManager.eventTarget.on('update-point', this.updatePoint, this);
    EventManager.eventTarget.on('show-fire-fail', this.showFireFail, this);
  }

  protected update(dt: number): void {
    // 更新玩家的點數
    if (this._isTransition) {
      this.playerPointLabel.string = `${Math.floor(this._tempPoint.point)}`;
      this.point = Math.floor(this._tempPoint.point);
    }
  }

  protected onDestroy(): void {
    // 註銷事件
    EventManager.eventTarget.off('init-game-scene', this.initGameScene, this);
    EventManager.eventTarget.off(
      'player-joined',
      this.welcomeOtherPlayer,
      this
    );
    EventManager.eventTarget.off('player-left', this.removeOtherPlayer, this);
    EventManager.eventTarget.off('rotate-gun', this.rotateGun, this);
    EventManager.eventTarget.off('fire-gun', this.fireGun, this);
    EventManager.eventTarget.off(
      'before-fire-bullet',
      this.beforeFireBullet,
      this
    );
    EventManager.eventTarget.off('before-hit-fish', this.beforeHitFish, this);
    EventManager.eventTarget.off('update-point', this.updatePoint, this);
    EventManager.eventTarget.off('show-fire-fail', this.showFireFail, this);
  }

  initGameScene(data: ClientObject) {
    // console.log('GameSceneManager initGameScene');
    if (data) {
      this.roomIdLabel.string = `房號: ${data.roomId}`;
      this.playerNameLabel.string = `${data.playerName}`;
      // 另外紀錄數值，因為需要播放動畫
      this.point = data.point;
      this._cachedPoint = data.point;
      this.playerPointLabel.string = `${this.point}`;
      if (data.other) {
        this.addOtherPlayer(data.other);
      }
      // 初始化子彈價值
      this.bulletValueLabel.string = `${bulletValues[this.bulletLevel]}`;
      // 同步當前的魚群
      if (data.fishes && data.fishes.length > 0) {
        this.scheduleOnce(() => {
          EventManager.eventTarget.emit('spawn-fishes', data.fishes);
        }, 0);
      }
    } else {
      console.error('initGameScene data is null');
    }
  }

  onClickClose() {
    // 關閉視窗
    this.popupModal.active = false;
    this.modalText.string = '';
  }

  onClickConfirm() {
    // 關閉視窗
    this.popupModal.active = false;
    this.modalText.string = '';
  }

  onClickQuitRoom() {
    // 發送離開房間 'leave-room' 事件 (玩家的名字讓伺服器自己傳)
    GameManager.instance.sendMessage('leave-room', null);
    // 離開遊戲場景(可以先還原一些狀態)
    this.removeOtherPlayer();
    this.playerNameLabel.string = '';
    this.playerPointLabel.string = '';
    this.roomIdLabel.string = '';
    this.popupModal.active = false;
    this.popupQuitModal.active = false;
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
      this.checkPoint(this._cachedPoint);
    }
  }

  onClickMinus() {
    if (this.bulletLevel > 1) {
      this.bulletLevel--;
      this.bulletValueLabel.string = `${bulletValues[this.bulletLevel]}`;
      this.checkPoint(this._cachedPoint);
    }
  }

  welcomeOtherPlayer(otherPlayerName: string) {
    EventManager.eventTarget.emit('show-toast', `${otherPlayerName} 加入房間`);
    this.addOtherPlayer(otherPlayerName);
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

  // 在擊發子彈前，發送消耗點數事件給伺服器
  beforeFireBullet() {
    GameManager.instance.sendMessageWithRoomId('fire-bullet', {
      bulletValue: bulletValues[this.bulletLevel]
    });
  }

  // 這個方法是用來接魚的 uuid 和這裡的 bulletValue 一起發送給伺服器
  beforeHitFish(uuid: string) {
    GameManager.instance.sendMessageWithRoomId('hit-fish', {
      uuid,
      bulletValue: bulletValues[this.bulletLevel]
    });
  }

  // 判斷當前點數，執行對應措施
  checkPoint(currentPoint: number) {
    // 確認當前子彈是否小於等於 0
    if (currentPoint <= 0) {
      // 跳出離開房間的視窗
      this.showPopupQuitModal('點數不足，遊戲結束！');
    }
    // 發送當前點數是否足夠擊發子彈
    if (currentPoint < bulletValues[this.bulletLevel]) {
      EventManager.eventTarget.emit('switch-can-fire', false);
    } else {
      EventManager.eventTarget.emit('switch-can-fire', true);
    }
  }

  // 這個方法是用來更新玩家的點數
  updatePoint(currentPoint: number) {
    this.checkPoint(currentPoint);
    // 確認 tween 是否存在，並且運行中
    if (this._tempTween && this._tempTween.running) {
      this._tempTween.stop();
    }
    this._isTransition = true;
    this._tempPoint.point = this.point;
    this._cachedPoint = currentPoint;
    this._tempTween = tween(this._tempPoint)
      .to(0.3, { point: currentPoint })
      .call(() => {
        // 動畫狀態關閉
        this._isTransition = false;
        this.playerPointLabel.string = `${currentPoint}`;
        this.point = currentPoint;
      })
      .start();
  }

  // 顯示開火失敗的警告
  showFireFail() {
    this.showPopupModal('點數不足，請減少子彈等級');
  }

  // 顯示彈出視窗
  showPopupModal(text: string) {
    this.popupModal.active = true;
    this.modalText.string = text;
  }

  // 顯示「退出房間」彈出視窗
  showPopupQuitModal(text: string) {
    this.popupQuitModal.active = true;
    this.quitModalText.string = text;
  }
}
