import { Node, Prefab, instantiate } from 'cc';

export class CoinPool {
  // 這個 pool 只收已經停用的金幣 Node
  public inactivePool: Set<Node> = new Set();
  private _prefab: Prefab;

  // 會在 CoinManager 中使用
  constructor(prefab: Prefab) {
    this._prefab = prefab;
  }

  // 取得一個金幣
  getCoin(): Node {
    // 如果有停用的金幣，就從停用的 pool 中取出
    if (this.inactivePool.size > 0) {
      for (const coin of this.inactivePool) {
        // 標記成 active
        this.markAsActive(coin);
        // 回傳
        return coin;
      }
    } else {
      // 如果沒有，就從 pool 中取出一個新的金幣
      const coin = instantiate(this._prefab);
      // 回傳
      return coin;
    }
  }

  // 回收一個金幣
  recycleCoin(coin: Node) {
    // 停用這個金幣
    this.markAsInactive(coin);
  }

  // 啟用一個金幣
  markAsActive(coin: Node) {
    coin.active = true;
    this.inactivePool.delete(coin);
  }

  // 停用一個金幣
  markAsInactive(coin: Node) {
    coin.active = false;
    this.inactivePool.add(coin);
  }
}
