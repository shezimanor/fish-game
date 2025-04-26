import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { AudioManager } from './AudioManager';
import { CoinPool } from './CoinPool';
import { EventManager } from './EventManager';
import { SoundClipType } from './types/index.d';
const { ccclass, property } = _decorator;

@ccclass('CoinManager')
export class CoinManager extends Component {
  private static _instance: CoinManager = null;
  public static get instance(): CoinManager {
    return CoinManager._instance;
  }

  // 金幣的預製體
  @property(Prefab)
  public coin_prefab: Prefab = null;
  // 金幣池
  public coin_pool: CoinPool = null;
  // 金幣數量配對
  private _countObj: Record<string, number> = {
    '1': 2,
    '2': 5,
    '3': 10,
    '4': 20,
    '5': 30
  };

  protected onLoad(): void {
    if (!CoinManager._instance) {
      CoinManager._instance = this;
    } else {
      this.destroy();
    }
    // 註冊事件
    EventManager.eventTarget.on('spawn-coins', this.spawnCoins, this);
    EventManager.eventTarget.on('stop-coin', this.stopCoin, this); // Coin.ts 發布
  }

  protected start(): void {
    this.coin_pool = new CoinPool(this.coin_prefab);
  }

  protected onDestroy(): void {
    if (CoinManager._instance === this) {
      CoinManager._instance = null;
    }
    // 註銷事件
    EventManager.eventTarget.off('spawn-coins', this.spawnCoins, this);
    EventManager.eventTarget.off('stop-coin', this.stopCoin, this);
  }

  spawnCoins({
    fishType,
    startPosition
  }: {
    fishType: number;
    startPosition: Vec3;
  }) {
    // 產生 count 個金幣
    for (let i = 0; i < this._countObj[`${fishType}`]; i++) {
      // 取得一個金幣
      const coin = this.coin_pool.getCoin();
      // 設定金幣的位置
      coin.setPosition(startPosition);
      coin.setParent(this.node);
    }
  }

  stopCoin(coin: Node) {
    // 停用這個金幣
    this.coin_pool.recycleCoin(coin);
    // 播放音效
    AudioManager.instance.playSound(SoundClipType.Coin);
  }
}
