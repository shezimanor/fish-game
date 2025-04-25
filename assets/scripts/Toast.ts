import { _decorator, Component, Label, tween, Vec3 } from 'cc';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('Toast')
export class Toast extends Component {
  @property(Label)
  public toastLabel: Label = null;

  private _showVec3: Vec3 = new Vec3(0, 325, 0);
  private _hideVec3: Vec3 = new Vec3(0, 400, 0);

  protected onLoad(): void {
    EventManager.eventTarget.on('show-toast', this.showToast, this);
  }

  protected onDestroy(): void {
    EventManager.eventTarget.off('show-toast', this.showToast, this);
  }

  // 顯示 Toast
  public showToast(message: string): void {
    this.toastLabel.string = message;
    this.node.active = true;
    tween(this.node)
      .to(0.5, { position: this._showVec3 })
      .call(() => {
        this.scheduleOnce(() => {
          this.hideToast();
        }, 2);
      })
      .start();
  }

  public hideToast(): void {
    tween(this.node)
      .to(0.5, { position: this._hideVec3 })
      .call(() => {
        this.node.active = false;
        this.toastLabel.string = '';
      })
      .start();
  }
}
