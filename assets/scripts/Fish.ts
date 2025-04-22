import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  Enum,
  Node,
  Sprite,
  SpriteFrame,
  UITransform
} from 'cc';
import { FishConfig, FishType } from './types/index.d';
import { EventManager } from './EventManager';
import { GameManager } from './GameManager';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

Enum(FishType);

@ccclass('Fish')
export class Fish extends Component {
  // 魚隻類型
  @property({ type: FishType })
  public fishType: FishType = FishType.Fish_01;

  // 可以被攻擊的狀態
  public isHittable: boolean = true;

  private _speed: number = 200;
  private _radius: number = 0;
  private _border: number = 640;
  private _collider: Collider2D = null;
  private _animation: Animation = null;
  private _body: Sprite = null;
  private _spriteFrame: SpriteFrame = null;
  private _uuid: string = '';
  private _fishId: string = '';

  protected onLoad(): void {
    // 儲存初始數據
    this._body = this.node.getChildByName('Body').getComponent(Sprite);
    this._spriteFrame = this._body ? this._body.spriteFrame : null;
    this._radius = this.getComponent(UITransform).width / 2;

    // 設定碰撞元件
    this._collider = this.getComponent(Collider2D);
    if (this._collider) {
      this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  protected onEnable(): void {}

  protected start(): void {
    // console.log('fish start', this.fishType);
  }

  update(deltaTime: number) {
    const position = this.node.position;
    this.node.setPosition(
      position.x - this._speed * deltaTime,
      position.y,
      position.z
    );

    // 如果魚隻超出邊界，就回收魚隻
    if (position.x <= -(this._border + this._radius)) {
      this.stopAction();
    }
  }

  protected onDestroy(): void {
    // 註銷碰撞事件
    if (this._collider) {
      this._collider.off(
        Contact2DType.BEGIN_CONTACT,
        this.onBeginContact,
        this
      );
    }
  }

  // 重置魚隻狀態
  reset() {
    // 重置魚隻狀態
    this.isHittable = true;
    // 重置 spriteFrame
    if (this._body) {
      this._body.spriteFrame = this._spriteFrame;
    }
  }

  // 終止魚隻行為
  stopAction() {
    // 停止可被攻擊狀態
    this.isHittable = false;
    // 發布事件(FishManager.ts 訂閱)
    EventManager.eventTarget.emit('stop-fish', this.node, this);
    // 發送銷毀魚隻 'destroy-invisible-fish' 事件
    GameManager.instance.sendMessageWithRoomId(
      'destroy-invisible-fish',
      this._uuid
    );
  }

  // 更新
  updateFishData(fish: FishConfig) {
    this._uuid = fish.uuid;
    this._speed = fish.speed;
    this._fishId = fish.id;
  }

  // 碰撞開始
  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    const bullet = otherCollider.getComponent(Bullet);
    // 如果是子彈才處理
    if (!bullet) return;
    // 停用「子彈」的碰撞元件（停止檢測碰撞）
    bullet.closeCollider();
    // 停用子彈行為
    this.scheduleOnce(() => {
      bullet.stopAction();
    }, 0);
    // 魚隻被擊中
    if (this.isHittable) {
      this.isHittable = false;
      console.log('Hit Fish: ', this._fishId);
      // 發送擊中魚隻 'hit-fish' 事件
      EventManager.eventTarget.emit('before-hit-fish', this._uuid);
    }
  }
}
