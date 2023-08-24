import { V, V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { polarToVec } from "../../core/util/MathUtil";
import Magnet from "./Magnet";

export default class MagnetOrbiter extends BaseEntity implements Entity {
  center: V2d;
  magnets: Magnet[] = [];

  constructor(
    center: [number, number],
    private radius: number = 1.0,
    private speed: number = Math.PI / 2,
    n: number = 2
  ) {
    super();
    this.center = V(center);
    for (let i = 0; i < n; i++) {
      const magnet = new Magnet(center);
      this.magnets.push(magnet);
      this.addChild(magnet);
    }
  }

  getMagnetPosition(i: number) {
    const t = this.game!.elapsedTime;
    const angleOffset = (i / this.magnets.length) * Math.PI * 2;
    const theta = t * this.speed + angleOffset;
    return this.center.add(polarToVec(theta, this.radius));
  }

  onTick() {
    this.magnets.forEach((magnet, i) => {
      magnet.setPosition(this.getMagnetPosition(i));
    });
  }
}
