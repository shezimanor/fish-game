import { EventTarget } from 'cc';

export class EventManager {
  private constructor() {}
  public static eventTarget: EventTarget = new EventTarget();
}

// 使用範例
// EventManager.eventTarget.on('eventName', callback, this);
// EventManager.eventTarget.emit('eventName', data);
