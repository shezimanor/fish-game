import { _decorator, Button, Component, Node } from 'cc';
import { EventManager } from './EventManager';
const { ccclass, property } = _decorator;

@ccclass('StartSceneManager')
export class StartSceneManager extends Component {
  @property(Button)
  public createButton: Button = null;
  @property(Button)
  public joinButton: Button = null;

  protected onLoad(): void {
    console.log('StartSceneManager onLoad');
    // 註冊事件
    EventManager.eventTarget.on('init-start-scene', this.initButtons, this);
  }

  start() {}

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // 取消事件註冊
    EventManager.eventTarget.off('init-start-scene', this.initButtons, this);
  }

  initButtons() {
    console.log('StartSceneManager initButtons');
    // 將 StartScene 的按鈕改成可互動
    this.createButton.interactable = true;
    this.joinButton.interactable = true;
  }
}
