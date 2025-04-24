import {
  _decorator,
  Animation,
  Component,
  EventMouse,
  EventTouch,
  Input,
  input,
  math,
  Node,
  UITransform,
  Vec2,
  Vec3
} from 'cc';
import { BulletManager } from './BulletManager';
import { GameManager } from './GameManager';
import { EventManager } from './EventManager';
import { GameSceneManager } from './GameSceneManager';
const { ccclass, property } = _decorator;

@ccclass('Gun')
export class Gun extends Component {
  @property(Node)
  public bodyNode: Node = null;
  @property(Node)
  public bodyMainNode: Node = null;
  @property(BulletManager)
  public bulletManager: BulletManager = null;

  private _xAxisVec2: Vec2 = new Vec2(0, 0);
  private _tempVec2: Vec2 = new Vec2(0, 0);
  private _tempUIVec3: Vec3 = new Vec3(0, 0, 0);
  private _tempLocalVec3: Vec3 = new Vec3(0, 0, 0);
  private _animation: Animation = null;
  private _canFire: boolean = true;

  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    // 註冊事件
    EventManager.eventTarget.on('switch-can-fire', this.switchCanFire, this);
    // 初始化角度
    this.bodyNode.angle = 90;
    // 初始化動畫
    this._animation = this.bodyMainNode.getComponent(Animation);
    // 初始化可擊發狀態
    this._canFire = true;
  }

  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    // 註銷事件
    EventManager.eventTarget.off('switch-can-fire', this.switchCanFire, this);
  }

  onTouchStart(event: EventTouch) {
    this.fire();
  }

  onMouseMove(event: EventMouse) {
    this.updateGunAngle(event);
  }

  switchCanFire(result: boolean) {
    this._canFire = result;
  }

  updateGunAngle(event: EventMouse | EventTouch) {
    const touchUIPosition = event.getUILocation();
    this._tempUIVec3.set(touchUIPosition.x, touchUIPosition.y);
    // 轉換為本地座標
    this.node
      .getComponent(UITransform)
      .convertToNodeSpaceAR(this._tempUIVec3, this._tempLocalVec3);
    // signAngle: https://docs.cocos.com/creator/3.8/api/zh/class/math.Vec2?id=signAngle
    const angleTheta =
      (this._xAxisVec2
        .set(1, 0)
        .signAngle(
          this._tempVec2
            .set(this._tempLocalVec3.x, this._tempLocalVec3.y)
            .normalize()
        ) *
        180) /
      Math.PI;
    // 這裡的 angleTheta 是一個範圍在 -180 到 180 之間的數字
    // 為了解決負數會被 math.clamp 換算成 20 的問題，這裡加上絕對值
    const angle = math.clamp(Math.abs(angleTheta), 20, 160);
    this.bodyNode.angle = angle;
    // 發送砲管角度變更 'rotate-gun' 事件
    GameManager.instance.sendMessageWithRoomId('rotate-gun', `${angle}`);
  }

  fire() {
    if (!this._canFire) {
      // TODO: 跳出視窗
      console.error('點數不足，無法開火');
      return;
    }
    // 會直接播放預設動畫（這裡的預設動畫就是開火動畫）
    if (this._animation) this._animation.play();
    // 發射子彈
    this.bulletManager.spawnBullet();
    // 扣點數(發布事件給 GameSceneManager，讓他傳訊息給後端)
    EventManager.eventTarget.emit('before-fire-bullet');
    // 發送射擊 'fire-gun' 事件(告訴其他玩家，我發射子彈了)
    GameManager.instance.sendMessageWithRoomId('fire-gun', null);
  }
}
