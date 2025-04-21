import { Node, Prefab, instantiate } from 'cc';

export class FishPool {
  // 這個 pool 只收已經停用的魚隻 Node
  public inactivePool: Set<Node> = new Set();
  private _prefab: Prefab;

  // 會在 FishManager 中使用
  constructor(prefab: Prefab) {
    this._prefab = prefab;
  }

  // 取得一個魚隻
  getFish(): Node {
    // 如果有停用的魚隻，就從停用的 pool 中取出
    if (this.inactivePool.size > 0) {
      for (const fish of this.inactivePool) {
        // 標記成 active
        this.markAsActive(fish);
        // 回傳
        return fish;
      }
    } else {
      // 如果沒有，就從 pool 中取出一個新的魚隻
      const fish = instantiate(this._prefab);
      // 回傳
      return fish;
    }
  }

  // 回收一個魚隻
  recycleFish(fish: Node) {
    // 停用這個魚隻
    this.markAsInactive(fish);
  }

  // 啟用一個魚隻
  markAsActive(fish: Node) {
    fish.active = true;
    this.inactivePool.delete(fish);
  }

  // 停用一個魚隻
  markAsInactive(fish: Node) {
    fish.active = false;
    this.inactivePool.add(fish);
  }
}
