/* global createjs */

export const MUSIC = '1';
export const ROTATE = '2';
export const DROP = '3';
export const LINE_CLEAR = '4';
export const MOVE = '5';
export const LEVEL_UP = '6';
export const GAME_OVER = '7';

class SoundController {
  constructor() {
    this.sound = createjs.Sound;
    this.sound.registerSound('sounds/music.mp3', MUSIC);
    this.sound.registerSound('sounds/block-rotate.mp3', ROTATE);
    this.sound.registerSound('sounds/drop.mp3', DROP);
    this.sound.registerSound('sounds/line-remove.wav', LINE_CLEAR);
    this.sound.registerSound('sounds/move.wav', MOVE);
    this.sound.registerSound('sounds/level-up.wav', LEVEL_UP);
    this.sound.registerSound('sounds/game-over.mp3', GAME_OVER);

    this.sound.addEventListener('fileload', e => {
      if (e.id === MUSIC) {
        this.playThemeSong();
      }
    });
  }

  playThemeSong() {
    this.sound.stop(GAME_OVER);
    const instance = this.sound.play(MUSIC, { loop: -1 });
    instance.volume = 0.1;
  }

  stopThemeSong() {
    this.sound.stop(MUSIC);
  }

  playSound(id, volume = 0.25) {
    const instance = this.sound.play(id);
    instance.volume = volume;
  }
}

export default SoundController;
