import {
  CylinderGeometry,
  MeshStandardMaterial,
  SpotLight,
  Vector3,
} from "three";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { degToRad } from "../../core/util/MathUtil";
import { rBool, rUniform } from "../../core/util/Random";
import { TEXTURES } from "../graphics/textures";
import Table from "../tables/Table";
import { isBall } from "./Ball";

const RADIUS = 1.0625; // Radius in half inches
const HEIGHT = RADIUS / 1.5; // Ratio of hockey puck size

const GEOMETRY = new CylinderGeometry(RADIUS, RADIUS, HEIGHT, 32, 1);
GEOMETRY.rotateX(Math.PI / 2);

const roughnessMap = TEXTURES.PlasticScuffedRoughness.clone();
roughnessMap.repeat.set(0.5, 0.5);
roughnessMap.center.set(0.5, 0.5);

const MATERIAL = new MeshStandardMaterial({
  color: 0x000000,
  roughness: 2.0,
  roughnessMap,
  flatShading: true,
});

export default class BallSpotlight extends BaseEntity implements Entity {
  light: SpotLight;

  wanderTarget = new Vector3();

  constructor(
    private table: Table,
    x: number,
    y: number,
    z: number,
    intensity: number = 100.0,
    private speed: number = 0.03
  ) {
    super();

    this.light = new SpotLight(0xffffff, intensity);
    this.light.position.set(x, y, z);
    this.light.angle = degToRad(4);
    this.light.penumbra = 0.3;

    this.light.decay = 0.5;

    this.light.target.position.set(table.center.x, table.center.y, 0);

    this.light.castShadow = true;
    this.light.shadow.mapSize.height *= 4;
    this.light.shadow.mapSize.width *= 4;
    this.light.shadow.radius = 800.0;

    this.newWanderTarget();

    this.object3ds.push(this.light, this.light.target);
  }

  onTick(dt: number) {
    const ball = this.game!.entities.getTagged("ball").filter(isBall)[0];
    if (ball) {
      this.ltp.lerp(ball.getPosition3(), this.speed);
    } else {
      const dist = this.ltp.distanceTo(this.wanderTarget);
      if (dist < 5 || rBool(0.1 * dt)) {
        this.newWanderTarget();
      }
      this.ltp.lerp(this.wanderTarget, (this.speed / dist) * 0.2);
    }
  }

  get ltp() {
    return this.light.target.position;
  }

  newWanderTarget() {
    const { left, right, top, bottom } = this.table.bounds;
    this.wanderTarget.x = rUniform(left, right);
    this.wanderTarget.y = rUniform(top, bottom);
  }
}
