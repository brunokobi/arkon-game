import Phaser from 'phaser'
import BootScene  from './scenes/BootScene.js'
import WorldScene from './scenes/WorldScene.js'

export function createPhaserConfig(parent) {
  return {
    type:   Phaser.AUTO,
    parent,
    width:  800,
    height: 560,
    pixelArt:        true,
    antialias:       false,
    roundPixels:     true,
    backgroundColor: '#050508',
    physics: {
      default: 'arcade',
      arcade:  { gravity: { y: 0 }, debug: false },
    },
    scene: [BootScene, WorldScene],
    scale: {
      mode:       Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  }
}
