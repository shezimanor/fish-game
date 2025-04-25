import { _decorator, AudioClip, AudioSource, Component } from 'cc';
import { MusicClipType, SoundClipType } from './types/index.d';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
  private static _instance: AudioManager = null;
  public static get instance(): AudioManager {
    return AudioManager._instance;
  }

  // 所有音檔
  @property([AudioClip])
  public musicClips: AudioClip[] = [];
  // 所有音效
  @property([AudioClip])
  public soundClips: AudioClip[] = [];
  // 音樂播放器
  @property(AudioSource)
  public musicSource: AudioSource = null;
  // 音效播放器
  @property(AudioSource)
  public soundSource: AudioSource = null;

  protected onLoad(): void {
    // 單例模式
    if (!AudioManager._instance) {
      AudioManager._instance = this;
    } else {
      this.destroy();
    }
  }

  protected onDestroy(): void {
    if (AudioManager._instance === this) {
      AudioManager._instance = null;
    }
  }

  playMusic(index: MusicClipType) {
    if (this.soundSource && this.musicClips[index]) {
      this.musicSource.clip = this.musicClips[index];
      this.musicSource.play();
    } else {
      console.error('AudioManager: Music source or clip not found');
    }
  }

  stopMusic(index: MusicClipType) {
    if (this.soundSource && this.musicClips[index]) {
      this.musicSource.clip = this.musicClips[index];
      this.musicSource.stop();
    } else {
      console.error('AudioManager: Music source or clip not found');
    }
  }

  playSound(index: SoundClipType, volume: number = 0.5) {
    if (this.soundSource && this.soundClips[index]) {
      this.soundSource.volume = volume;
      this.soundSource.playOneShot(this.soundClips[index]);
    } else {
      console.error('AudioManager: Sound source or clip not found');
    }
  }

  playMusicWithSource(music: AudioClip) {
    if (music) {
      this.musicSource.clip = music;
      this.musicSource.play();
    } else {
      console.error('AudioManager: Music source or clip not found');
    }
  }

  playSoundWithSource(sound: AudioClip) {
    // 可由外部的腳本傳入音效
    if (AudioClip) {
      this.soundSource.playOneShot(sound);
    } else {
      console.error('AudioManager: Sound source or clip not found');
    }
  }
}
