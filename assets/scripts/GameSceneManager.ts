import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameSceneManager')
export class GameSceneManager extends Component {
  protected onLoad(): void {
    console.log('GameSceneManager onLoad');
  }
  start() {}

  update(deltaTime: number) {}
}
