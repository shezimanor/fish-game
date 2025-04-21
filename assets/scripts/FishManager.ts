import { _decorator, Component, Node, Prefab } from 'cc';
import { FishPool } from './FishPool';
import { EventManager } from './EventManager';
import { Fish } from './Fish';
import { FishConfig, FishType } from './types/index.d';
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

  protected onLoad(): void {
    if (!FishManager._instance) {
      FishManager._instance = this;
    } else {
      this.destroy();
    }
    // 註冊事件
    EventManager.eventTarget.on('spawn-fishes', this.spawnFishes, this);
    EventManager.eventTarget.on('stop-fish', this.stopFish, this); // Fish.ts 發布
  }

  protected onDestroy(): void {
    if (FishManager._instance === this) {
      FishManager._instance = null;
    }
    // 註銷事件
    EventManager.eventTarget.on('spawn-fishes', this.spawnFishes, this);
    EventManager.eventTarget.on('stop-fish', this.stopFish, this);
  }

  spawnFishes(fishes: FishConfig[]) {
    for (let i = 0; i < fishes.length; i++) {
      const curFish = fishes[i];
      const currentFishPool: FishPool = this[`${curFish.id}_pool`];
      if (currentFishPool) {
        const fish = currentFishPool.getFish();

        if (fish) {
          fish.getComponent(Fish).updateUUID(curFish.uuid);
          fish.setPosition(curFish.spawnX, curFish.spawnY, 0);
          fish.setParent(this.node);
        }
      }
    }
  }

  stopFish(fish: Node, fishInstance: Fish) {
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
