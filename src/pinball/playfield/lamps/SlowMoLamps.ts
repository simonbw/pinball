import BaseEntity from "../../../core/entity/BaseEntity";
import Entity from "../../../core/entity/Entity";
import { clamp, smoothstep } from "../../../core/util/MathUtil";
import { V, V2d } from "../../../core/Vector";
import {
  SlowMoCooldownEvent,
  SlowMoRemainingEvent,
} from "../../system/SlowMoController";
import Lamp from "./Lamp";

const COLOR_READY = 0x00aa00;
const COLOR_COOL = 0xaa0000;

export default class SlowMoLamps extends BaseEntity implements Entity {
  lamps: Lamp[];
  lit: boolean = false;

  constructor(position: V2d) {
    super();
    this.lamps = [];
    for (let i = -1; i <= 1; i++) {
      const lamp = new Lamp(position.add(V(0, -i * 1.2)), {
        color: COLOR_READY,
        size: 0.4,
        intensity: 0.8,
      });
      this.addChild(lamp);
      this.lamps.push(lamp);
    }
  }

  setLampColors(cooldown: boolean) {
    const color = cooldown ? COLOR_COOL : COLOR_READY;
    console.log("changing color", cooldown);
    for (const lamp of this.lamps) {
      lamp.setColorImmediate(color);
    }
  }

  setLampPercents(percent: number) {
    const nLamps = this.lamps.length;
    for (let i = 0; i < nLamps; i++) {
      const lamp = this.lamps[i];
      lamp.clearTimers();
      const min = i / nLamps;
      const lampPercent = clamp((percent - min) * nLamps);
      lamp.setBrightnessImmediate(smoothstep(lampPercent) ** 0.3);
    }
  }

  handlers = {
    gameStart: () => {
      for (const lamp of this.lamps) {
        lamp.flash(4);
      }
    },

    slowMoRemaining: (e: SlowMoRemainingEvent) => {
      this.setLampPercents(e.remaining);
    },
    slowMoCooldown: (e: SlowMoCooldownEvent) => {
      this.setLampColors(e.cooldown);
    },
  };
}
