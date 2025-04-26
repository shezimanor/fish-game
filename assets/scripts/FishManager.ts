import { _decorator, Component, Node, Prefab } from 'cc';
import { FishPool } from './FishPool';
import { EventManager } from './EventManager';
import { Fish } from './Fish';
import {
  FishConfig,
  FishType,
  HitFishResult,
  SoundClipType
} from './types/index.d';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('FishManager')
export class FishManager extends Component {
  private static _instance: FishManager = null;
  public static get instance(): FishManager {
    return FishManager._instance;
  }

  // 魚的預製體
  // 1. 小丑魚
  @property(Prefab)
  public fish_01_prefab: Prefab = null;
  // 2. 熱帶魚
  @property(Prefab)
  public fish_02_prefab: Prefab = null;
  // 3. 河豚
  @property(Prefab)
  public fish_03_prefab: Prefab = null;
  // 4. 章魚
  @property(Prefab)
  public fish_04_prefab: Prefab = null;
  // 5. 鯊魚
  @property(Prefab)
  public fish_05_prefab: Prefab = null;

  // 魚池
  public fish_01_pool: FishPool = null;
  public fish_02_pool: FishPool = null;
  public fish_03_pool: FishPool = null;
  public fish_04_pool: FishPool = null;
  public fish_05_pool: FishPool = null;

  // 搜尋用魚隻快取空間
  private _fishCached: { [key: string]: Fish } = {};

  protected onLoad(): void {
    if (!FishManager._instance) {
      FishManager._instance = this;
    } else {
      this.destroy();
    }
    // 註冊事件
    EventManager.eventTarget.on('spawn-fishes', this.spawnFishes, this);
    EventManager.eventTarget.on('stop-fish', this.stopFish, this); // Fish.ts 發布
    EventManager.eventTarget.on('return-result', this.getHitFishResult, this);
    EventManager.eventTarget.on('other-got-fish', this.getOtherHitFish, this);
  }

  protected start(): void {
    this.fish_01_pool = new FishPool(this.fish_01_prefab);
    this.fish_02_pool = new FishPool(this.fish_02_prefab);
    this.fish_03_pool = new FishPool(this.fish_03_prefab);
    this.fish_04_pool = new FishPool(this.fish_04_prefab);
    this.fish_05_pool = new FishPool(this.fish_05_prefab);
  }

  protected onDestroy(): void {
    if (FishManager._instance === this) {
      FishManager._instance = null;
    }
    // 註銷事件
    EventManager.eventTarget.off('spawn-fishes', this.spawnFishes, this);
    EventManager.eventTarget.off('stop-fish', this.stopFish, this);
  }

  spawnFishes(fishes: FishConfig[]) {
    // fishes 伺服器每次生成的魚群
    // console.log('spawnFishes', fishes.length);
    for (let i = 0; i < fishes.length; i++) {
      const curFish = fishes[i];
      const currentFishPool: FishPool = this[`${curFish.id}_pool`];
      if (currentFishPool) {
        const fish = currentFishPool.getFish();
        if (fish) {
          // 更新魚隻狀態
          const { uuid, fishInstance } = fish
            .getComponent(Fish)
            .updateFishData(curFish);
          // 保存魚隻資料
          this._fishCached[uuid] = fishInstance;
          // 設定魚隻的初始位置
          fish.setPosition(curFish.spawnX, curFish.spawnY, 0);
          fish.setParent(this.node);
        }
      }
    }
  }

  getHitFishResult(response: HitFishResult) {
    // console.log('getHitFishResult', response);
    const fishInstance = this._fishCached[response.uuid];
    if (response.result) {
      // 中獎了(內含 ZoomOut 動畫)
      if (fishInstance) {
        // 魚隻自身處理
        fishInstance.freezeAction();
        // 播放金幣動畫
        EventManager.eventTarget.emit('spawn-coins', {
          fishType: fishInstance.fishType,
          startPosition: fishInstance.node.position
        });
      }
      // 播放音效
      AudioManager.instance.playSound(SoundClipType.Win);
    } else {
      // 沒中(內含被 Hit 動畫)
      if (fishInstance) fishInstance.resetHittable();
      // 播放音效
      AudioManager.instance.playSound(SoundClipType.Hit);
    }
  }

  getOtherHitFish(uuid: string) {
    // console.log('getOtherHitFish', response);
    const fishInstance = this._fishCached[uuid];
    if (fishInstance) {
      fishInstance.killByOtherPlayer();
    }
    // 通知大獎類型的魚被其他玩家捕獲
    switch (fishInstance.fishType) {
      case FishType.Fish_04:
        EventManager.eventTarget.emit(
          'show-toast',
          `「章魚」被其他玩家捕獲(60x)`
        );
        break;
      case FishType.Fish_05:
        EventManager.eventTarget.emit(
          'show-toast',
          `「鯊魚」被其他玩家捕獲(300x)`
        );
        break;
    }
  }

  stopFish(fish: Node, fishInstance: Fish) {
    // 將魚隻從魚隻快取空間中移除
    if (this._fishCached[fishInstance.uuid]) {
      delete this._fishCached[fishInstance.uuid];
    }
    switch (fishInstance.fishType) {
      case FishType.Fish_01:
        this.fish_01_pool.recycleFish(fish);
        break;
      case FishType.Fish_02:
        this.fish_02_pool.recycleFish(fish);
        break;
      case FishType.Fish_03:
        this.fish_03_pool.recycleFish(fish);
        break;
      case FishType.Fish_04:
        this.fish_04_pool.recycleFish(fish);
        break;
      case FishType.Fish_05:
        this.fish_05_pool.recycleFish(fish);
        break;
      default:
        fish.destroy();
        break;
    }
  }
}
