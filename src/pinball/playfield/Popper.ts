import { Body, Circle } from "p2";
import { MeshStandardMaterial } from "three";
import { V } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { isBall } from "../ball/Ball";
import { PositionalSound } from "../sound/PositionalSound";

const MATERIAL = new MeshStandardMaterial({
  color: 0x000000,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  depthWrite: false,
  transparent: true,
  opacity: 0.5,
});

export default class Popper extends BaseEntity implements Entity {
  constructor(position: [number, number], radius: number = 1.0) {
    super();

    this.body = new Body({ position: V(position), collisionResponse: false });
    const shape = new Circle({ radius });
    this.body.addShape(shape);

    // const geometry = new CircleGeometry(radius, 32);
    // this.mesh = new Mesh(geometry, MATERIAL);
    // this.mesh.rotateX(Math.PI);
    // this.mesh.position.set(position[0], position[1], 0);
    // this.disposeables.push(geometry);
  }

  onBeginContact(ball: Entity) {
    if (isBall(ball)) {
      if (ball.z <= 0) {
        ball.vz += 100;
      }
    }
    this.addChild(new PositionalSound("boing1", this.getPosition()));
  }
}
