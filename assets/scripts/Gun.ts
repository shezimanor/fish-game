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
const { ccclass, property } = _decorator;

@ccclass('Gun')
export class Gun extends Component {
  @property(Node)
  public bodyNode: Node = null;
  @property(Node)
  public bodyMainNode: Node = null;
  @property(BulletManager)
  public bulletManager: BulletManager = null;

  public xAxisVec2: Vec2 = new Vec2(0, 0);
  public tempVec2: Vec2 = new Vec2(0, 0);
  public tempUIVec3: Vec3 = new Vec3(0, 0, 0);
  public tempLocalVec3: Vec3 = new Vec3(0, 0, 0);
  private animation: Animation = null;

  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    // 初始化角度
    this.bodyNode.angle = 90;
    // 初始化動畫
    this.animation = this.bodyMainNode.getComponent(Animation);
  }

  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
  }

  onTouchStart(event: EventTouch) {
    this.fire();
  }

  onMouseMove(event: EventMouse) {
    this.updateGunAngle(event);
  }

  updateGunAngle(event: EventMouse | EventTouch) {
    const touchUIPosition = event.getUILocation();
    this.tempUIVec3.set(touchUIPosition.x, touchUIPosition.y);
    // 轉換為本地座標
    this.node
      .getComponent(UITransform)
      .convertToNodeSpaceAR(this.tempUIVec3, this.tempLocalVec3);
    // signAngle: https://docs.cocos.com/creator/3.8/api/zh/class/math.Vec2?id=signAngle
    const angleTheta =
      (this.xAxisVec2
        .set(1, 0)
        .signAngle(
          this.tempVec2
            .set(this.tempLocalVec3.x, this.tempLocalVec3.y)
            .normalize()
        ) *
        180) /
      Math.PI;
    // 這裡的 angleTheta 是一個範圍在 -180 到 180 之間的數字
    // 為了解決負數會被 math.clamp 換算成 20 的問題，這裡加上絕對值
    this.bodyNode.angle = math.clamp(Math.abs(angleTheta), 20, 160);
  }

  fire() {
    // 會直接播放預設動畫（這裡的預設動畫就是開火動畫）
    if (this.animation) this.animation.play();
    // 發射子彈
    this.bulletManager.createBullet();
  }
}
