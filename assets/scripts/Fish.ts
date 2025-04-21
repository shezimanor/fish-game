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
import { FishType } from './types';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

Enum(FishType);

@ccclass('Fish')
export class Fish extends Component {
  // 魚隻類型
  @property({ type: FishType })
  public fishType: FishType = FishType.Fish_01;

  private _speed: number = 200;
  private _bgWidth: number = 0;
  private _collider: Collider2D = null;
  private _animation: Animation = null;
  private _body: Sprite = null;
  private _spriteFrame: SpriteFrame = null;

  protected onLoad(): void {
    // 儲存初始數據
    this._body = this.node.getChildByName('Body').getComponent(Sprite);
    this._spriteFrame = this._body ? this._body.spriteFrame : null;
  }

  protected onEnable(): void {}

  protected start(): void {}

  update(deltaTime: number) {
    const position = this.node.position;
    this.node.setPosition(
      position.x + this._speed * deltaTime,
      position.y,
      position.z
    );

    // 如果敵機超出邊界，就回收敵機
    if (
      this.node.position.x <
      -(this._bgWidth / 2 + this.getComponent(UITransform).height / 2)
    ) {
      this.stopAction();
    }
  }

  // 重置魚隻狀態
  reset() {
    // 重置 spriteFrame
    if (this._body) {
      this._body.spriteFrame = this._spriteFrame;
    }
  }

  // 終止魚隻行為
  stopAction() {
    // 發布事件(FishManager.ts 訂閱)
    EventManager.eventTarget.emit('stopFish', this.node, this);
  }
}
