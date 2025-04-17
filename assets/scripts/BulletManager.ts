import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
  @property(Node)
  public gunBody: Node = null;
  @property(Prefab)
  public bulletPrefab: Prefab = null;

  createBullet() {
    const bullet = instantiate(this.bulletPrefab);
    bullet.getComponent(Bullet).initDirection(this.gunBody.angle);
    bullet.setParent(this.node);
    bullet.setPosition(0, 0, 0);
  }
}
