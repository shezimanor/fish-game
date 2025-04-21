import {
  _decorator,
  CCInteger,
  Collider2D,
  Component,
  Enum,
  Node,
  Sprite,
  SpriteFrame,
  UITransform
} from 'cc';
import { FishConfig, FishType } from './types/index.d';
import { EventManager } from './EventManager';
import { GameManager } from './GameManager';
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

  protected onLoad(): void {
    // 儲存初始數據
    this._body = this.node.getChildByName('Body').getComponent(Sprite);
    this._spriteFrame = this._body ? this._body.spriteFrame : null;
    this._radius = this.getComponent(UITransform).width / 2;
  }

  protected onEnable(): void {}

  protected start(): void {
    console.log('fish start', this.fishType);
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
    EventManager.eventTarget.emit('stopFish', this.node, this);
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
  }
}
