import { SpotLight } from "three";
import { V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";

export default class OverheadLight extends BaseEntity implements Entity {
  light: SpotLight;

  constructor([x, y]: V2d, color: number = 0xfafaff, intensity: number = 25) {
    super();

    this.light = new SpotLight(color, intensity);
    this.light.decay = 1; // TODO: This isn't physically accurate
    this.light.position.set(x, y, -90);
    this.object3ds.push(this.light);
    this.updateQuality();
  }

  updateQuality() {
    // this.light.castShadow = getGraphicsQuality() === "high";
  }

  handlers = {
    setQuality: () => this.updateQuality(),
  };
}
