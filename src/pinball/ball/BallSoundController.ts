import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { clamp } from "../../core/util/MathUtil";
import { rNormal } from "../../core/util/Random";
import { V } from "../../core/Vector";
import { PositionalSound } from "../sound/PositionalSound";
import Ball from "./Ball";
import { getNameFromSoundInfo, SoundInfo } from "./BallCollisionInfo";

const MAX_SPEED = 100.0;
const MAX_GAIN = 0.8;

export default class BallSoundController extends BaseEntity implements Entity {
  rollingSound!: PositionalSound;
  constructor(public ball: Ball) {
    super();
    this.rollingSound = this.addChild(
      new PositionalSound("ballRolling3", ball.getPosition(), {
        continuous: true,
        gain: 0,
        randomStart: true,
      })
    );
  }

  onTick() {
    if (this.ball.z > 0) {
      this.rollingSound.gain = 0;
    } else {
      const position = this.ball.getPosition();
      this.rollingSound.setPosition(position);
      const v = V(this.ball.body.velocity);
      const speed = v.magnitude / MAX_SPEED; // approximately [0,1]
      this.rollingSound.speed = 0.6 + speed * 1.3;
      this.rollingSound.gain = clamp(speed, 0, 1.2) * MAX_GAIN;
    }
  }

  emitCollisionSound(soundInfo: SoundInfo, gain: number = 1.0) {
    const soundName = getNameFromSoundInfo(soundInfo);
    const position = this.ball.getPosition();
    const speed = rNormal(1.0, soundInfo.speedVariance ?? 0.7);
    this.addChild(new PositionalSound(soundName, position, { gain, speed }));

    if (gain > 0.1) {
      this.rollingSound.jumpToRandom();
    }
  }
}
