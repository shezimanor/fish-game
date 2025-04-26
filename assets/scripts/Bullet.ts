import { _decorator, CCInteger, Collider2D, Component, Enum, Vec3 } from 'cc';
import { EventManager } from './EventManager';
import { BulletPoolName } from './types/index.d';
const { ccclass, property } = _decorator;

Enum(BulletPoolName);
@ccclass('Bullet')
export class Bullet extends Component {
  // 速度
  @property(CCInteger)
  public speed: number = 1000;

  private _collider: Collider2D = null;
  private _limit: number = 700;
  private _directionVec3: Vec3 = new Vec3(0, 0, 0);
  private _tempVec3: Vec3 = new Vec3(0, 0, 0);

  protected onLoad(): void {
    // 設定碰撞元件
    this._collider = this.getComponent(Collider2D);
  }

  protected onEnable(): void {
    // 子彈有子彈池做循環使用，所以 BulletPool.markAsInactive 會觸發 onEnable
    this.reset();
  }

  update(deltaTime: number) {
    // 更新座標時，槍口的角度可能已經變化，所以不能用原本以 y 軸前進的邏輯來更新座標
    const movement = this.speed * deltaTime;
    const position = this.node.worldPosition;
    this._tempVec3.set(this._directionVec3).multiplyScalar(movement);
    this.node.setWorldPosition(position.add(this._tempVec3));
    // 如果子彈超出邊界，就回收子彈
    if (
      Math.abs(this.node.position.x) >= this._limit ||
      Math.abs(this.node.position.y) >= this._limit
    ) {
      this.stopAction();
    }
  }

  // 終止子彈行為
  stopAction() {
    // console.log('stopAction');
    // 發布事件(BulletManager.ts 訂閱)
    EventManager.eventTarget.emit('stop-bullet', this.node);
  }

  reset() {
    if (this._collider) this._collider.enabled = true;
  }

  closeCollider() {
    if (this._collider) this._collider.enabled = false;
  }

  // 設定子彈的移動的方向向量
  initDirection(angle: number) {
    // 計算子彈的移動方向
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian);
    const y = Math.sin(radian);
    this._directionVec3.set(x, y, 0).normalize();
  }
}
