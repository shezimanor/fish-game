import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
  private _targetVec3: Vec3 = new Vec3(378, -312, 0);

  protected onEnable(): void {
    this.reset();
  }

  reset() {
    this.runTween();
  }

  getRandomDelay() {
    // 介於 0 ~ 0.3 秒之間，且只取到小數第二位
    return Math.floor(Math.random() * 301) / 1000;
  }

  runTween() {
    tween(this.node)
      .delay(this.getRandomDelay())
      .to(0.8, { position: this._targetVec3 }, { easing: 'backIn' })
      .call(() => {
        this.stopAction();
      })
      .start();
  }

  // 終止金幣行為
  stopAction() {
    // 發布事件(FishManager.ts 訂閱)
    EventManager.eventTarget.emit('stop-coin', this.node, this);
  }
}
