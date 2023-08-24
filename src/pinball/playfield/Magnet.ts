import { CircleGeometry, Mesh, MeshStandardMaterial } from "three";
import { V, V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { isBall } from "../ball/Ball";

const MATERIAL = new MeshStandardMaterial({
  color: 0x0000ff,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  depthWrite: false,
  transparent: true,
  opacity: 0.5,
});

export default class Magnet extends BaseEntity implements Entity {
  position: V2d;

  constructor(
    position: [number, number],
    private strength: number = 1
  ) {
    super();
    this.position = V(position);
    const geometry = new CircleGeometry(1, 32);
    this.mesh = new Mesh(geometry, MATERIAL);
    this.mesh.rotateX(Math.PI);
    this.disposeables.push(geometry);
  }

  getPosition() {
    return this.position;
  }

  setPosition([x, y]: [number, number]) {
    this.position[0] = x;
    this.position[1] = y;
  }

  onTick() {
    for (const ball of this.game!.entities.getTagged("ball")) {
      if (isBall(ball)) {
        const d = this.position.sub(ball.getPosition());
        const f = d
          .normalize()
          .imul(1 / (d.magnitude ** 1.8 + 1.0))
          .imul(this.strength * 100000);
        ball.body.applyForce(f);
      }
    }
  }

  onRender() {
    const [x, y] = this.position;
    this.mesh!.position.set(x, y, 0);
  }
}
