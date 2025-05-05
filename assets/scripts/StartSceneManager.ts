import { _decorator, Button, Component, EditBox, Label, Node } from 'cc';
import { EventManager } from './EventManager';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('StartSceneManager')
export class StartSceneManager extends Component {
  @property(Button)
  public createRoomButton: Button = null;
  @property(Button)
  public joinRoomButton: Button = null;
  @property(Button)
  public addButton: Button = null;
  @property(Button)
  public quitButton: Button = null;
  @property(Button)
  public confirmButton: Button = null;
  @property(Button)
  public closeButton: Button = null;
  @property(Node)
  public panelStart: Node = null;
  @property(Node)
  public panelJoin: Node = null;
  @property(Node)
  public popupModal: Node = null;
  @property(Label)
  public modalText: Label = null;
  @property(EditBox)
  public roomIdInput: EditBox = null;
  @property(EditBox)
  public playerNameInput: EditBox = null;
  @property(Node)
  public ErrorLabel: Node = null;

  protected onLoad(): void {
    console.log('StartSceneManager onLoad');
    // 註冊事件
    EventManager.eventTarget.on('init-start-scene', this.initButtons, this);
    EventManager.eventTarget.on('response-fail', this.showResponseFail, this);
    EventManager.eventTarget.on('websocket-disconnect', this.stopAction, this);
  }

  start() {
    // 隨機玩家名稱
    const randomName = `玩家${Math.floor(Math.random() * 1000)}`;
    this.playerNameInput.string = randomName;
  }

  protected onDestroy(): void {
    // 註銷事件
    EventManager.eventTarget.off('init-start-scene', this.initButtons, this);
    EventManager.eventTarget.off('response-fail', this.showResponseFail, this);
    EventManager.eventTarget.off('websocket-disconnect', this.stopAction, this);
  }

  initButtons() {
    console.log('StartSceneManager initButtons');
    // 將 StartScene 的按鈕改成可互動
    this.createRoomButton.interactable = true;
    this.joinRoomButton.interactable = true;
    this.addButton.interactable = true;
    this.quitButton.interactable = true;
  }

  onClickCreateRoom() {
    if (this.playerNameInput.string.trim() === '') {
      this.popupModal.active = true;
      this.modalText.string = '請輸入玩家名稱';
    } else {
      // 發送建立房間 'create-room' 事件
      GameManager.instance.sendMessage('create-room', {
        playerName: this.playerNameInput.string
      });
      // 等待事件回應期間，將按鈕設為不可互動
      this.createRoomButton.interactable = false;
      this.joinRoomButton.interactable = false;
    }
  }

  onClickJoinRoom() {
    if (this.playerNameInput.string.trim() === '') {
      this.popupModal.active = true;
      this.modalText.string = '請輸入玩家名稱';
    } else {
      this.panelStart.active = false;
      this.panelJoin.active = true;
    }
  }

  onClickAdd() {
    if (this.roomIdInput.string.trim() === '') {
      this.popupModal.active = true;
      this.modalText.string = '請輸入房間ID';
    } else {
      // 發送加入房間 'join-room' 事件
      GameManager.instance.sendMessageWithRoomId('join-room', {
        roomId: this.roomIdInput.string,
        playerName: this.playerNameInput.string
      });
      // 等待事件回應期間，將按鈕設為不可互動
      this.addButton.interactable = false;
      this.quitButton.interactable = false;
    }
  }

  onClickQuit() {
    this.panelStart.active = true;
    this.panelJoin.active = false;
  }

  onClickClose() {
    this.popupModal.active = false;
    this.modalText.string = '';
  }

  onClickConfirm() {
    this.popupModal.active = false;
    this.modalText.string = '';
  }

  showResponseFail(msg: string) {
    this.popupModal.active = true;
    this.modalText.string = msg;
  }

  stopAction() {
    console.log('stopAction');
    this.ErrorLabel.active = true;
    this.createRoomButton.interactable = false;
    this.joinRoomButton.interactable = false;
    this.addButton.interactable = false;
    this.quitButton.interactable = false;
  }
}
