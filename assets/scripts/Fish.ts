import {
  _decorator,
  Animation,
  AnimationState,
  CCString,
  Collider2D,
  Color,
  Component,
  Contact2DType,
  Enum,
  Node,
  Sprite
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
  // 圖片 Node
  @property(Node)
  public bodyNode: Node = null;
  // 圖片 Animation
  @property(Animation)
  public bodyAnimation: Animation = null;
  // 倍率 Node
  @property(Node)
  public multiplierNode: Node = null;
  // X Node
  @property(Node)
  public closeNode: Node = null;

  // 可以被攻擊的狀態
  public isHittable: boolean = true;

  private _speed: number = 200;
  private _collider: Collider2D = null;
  private _uuid: string = '';
  private _fishId: string = '';
  private _spawnX: number = 0;
  private _spawnTime: number = 0;
  private _maxLifeTime: number = 0;
  private _color: Color = new Color(255, 255, 255, 255);
  private _killByOther: boolean = false;
  private _stopUpdating: boolean = false;

  protected onLoad(): void {
    // 設定動畫事件
    if (this.bodyAnimation) {
      this.bodyAnimation.on(
        Animation.EventType.FINISHED,
        this.onAnimationFinished,
        this
      );
    }

    // 設定碰撞元件
    this._collider = this.getComponent(Collider2D);
    if (this._collider) {
      this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  protected onEnable(): void {
    this.reset();
  }

  update(deltaTime: number) {
    if (this._stopUpdating) return;
    // 其實 now 應該要跟伺服器拿，但在這個 demo 先忽略不做
    const now = Date.now();
    // 單位(秒)
    const elapsedTime = (now - this._spawnTime) / 1000;
    // 魚隻在這段時間應該要移動的距離
    const distance = this._speed * elapsedTime;
    const currentX = this._spawnX - distance;
    const position = this.node.position;
    this.node.setPosition(currentX, position.y, position.z);

    // 如果魚隻超出邊界，就回收魚隻
    if (currentX <= -this._spawnX || elapsedTime > this._maxLifeTime) {
      this.stopAction();
    }
  }

  protected onDestroy(): void {
    // 註銷動畫事件
    if (this.bodyAnimation) {
      this.bodyAnimation.off(
        Animation.EventType.FINISHED,
        this.onAnimationFinished,
        this
      );
    }

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
    this._killByOther = false;
    this._stopUpdating = false;
    // 重置倍率,x Node
    this.multiplierNode.active = false;
    this.closeNode.active = false;
    // 重置圖片 Node
    this.bodyNode.active = true;
    this.bodyNode.setScale(1, 1, 1);
    this.bodyNode.getComponent(Sprite).color = this._color;
    this.bodyAnimation.play('FishSwim');
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

  // 更新魚隻狀態，並回傳{ uuid, this }，方便 FishManager.ts 使用
  updateFishData(fish: FishConfig) {
    this._uuid = fish.uuid;
    this._speed = fish.speed;
    this._fishId = fish.id;
    this._spawnX = fish.spawnX;
    this._spawnTime = fish.spawnTime;
    this._maxLifeTime = fish.maxLifeTime;
    return { uuid: this._uuid, fishInstance: this };
  }

  // 還原可攻擊狀態
  resetHittable() {
    this.isHittable = true;
    this.playHitAnimation();
  }

  // 中獎處理
  freezeAction() {
    // 魚隻停止移動
    this._stopUpdating = true;
    this.playZoomOutAnimation();
  }

  // 被其他玩家消滅
  killByOtherPlayer() {
    this.isHittable = false;
    this._killByOther = true;
    this.freezeAction();
  }

  playHitAnimation() {
    this.bodyAnimation.stop();
    this.bodyAnimation.play('FishHit');
  }

  // 播放 ZoomOut 動畫
  playZoomOutAnimation() {
    this.bodyAnimation.stop();
    this.bodyAnimation.play('FishZoomOut');
  }

  // 動畫播放結束
  onAnimationFinished(type: Animation.EventType, state: AnimationState) {
    if (state.name === 'FishZoomOut') {
      // 延遲執行 stopAction
      this.scheduleOnce(() => {
        this.stopAction();
      }, 0.5);

      // 玩家自己中獎
      if (!this._killByOther) {
        // 顯示倍率 Node
        this.multiplierNode.active = true;
        // 觸發玩家點數更新
        GameManager.instance.sendMessageWithRoomId('get-point', null);
      }
      // 別的玩家中獎
      else {
        // 顯示 x Node
        this.closeNode.active = true;
      }
      this.bodyNode.active = false;
    } else if (state.name === 'FishHit') {
      // 恢復游泳動畫
      this.bodyAnimation.play('FishSwim');
    }
  }

  // 碰撞開始
  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    const bullet = otherCollider.getComponent(Bullet);
    // 如果是子彈才處理
    if (!bullet) return;
    // 魚隻被擊中
    if (this.isHittable) {
      this.isHittable = false;
      // console.log('Hit Fish: ', this._fishId);
      // 發送擊中魚隻 'hit-fish' 事件
      EventManager.eventTarget.emit('before-hit-fish', this._uuid);
      // 停用「子彈」的碰撞元件（停止檢測碰撞）
      bullet.closeCollider();
      // 停用子彈行為
      this.scheduleOnce(() => {
        bullet.stopAction();
      }, 0);
    }
  }
}
