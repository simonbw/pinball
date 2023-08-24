import { Body, Box } from "p2";
import {
  BoxGeometry,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  NearestFilter,
  Vector2,
  Vector3,
} from "three";
import { V, V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { clamp, lerp } from "../../core/util/MathUtil";
import { CollisionGroups } from "../Collision";
import { isBall } from "../ball/Ball";
import {
  BallCollisionInfo,
  WithBallCollisionInfo,
} from "../ball/BallCollisionInfo";
import Reflector from "../graphics/Reflector";
import { createNoiseNormalMap } from "../graphics/proceduralTextures";
import { PositionalSound } from "../sound/PositionalSound";
import { scoreEvent } from "../system/LogicBoard";

const FRICTION = 0.9;
const HEIGHT = 1.9;
const SPEED_MULTI = 1.0 / (0.5 * HEIGHT * 2 * Math.PI);

export default class Spinner
  extends BaseEntity
  implements Entity, WithBallCollisionInfo
{
  spinVelocity: number = 0;
  rotations: number = 0.25;
  body: Body;
  ballCollisionInfo: BallCollisionInfo = {
    beginContactSound: { name: "gateHit" },
    scaleImpact: (impact) => impact * this.getContactAmount(),
  };

  constructor(
    position: V2d,
    angle: number = 0,
    public width: number = 2.0
  ) {
    super();

    this.body = new Body({ collisionResponse: false, angle, position });
    this.body.addShape(new Box({ width: width, height: 1.0 }));
    this.body.shapes[0].collisionGroup = CollisionGroups.Table;
    this.body.shapes[0].collisionMask = CollisionGroups.Ball;

    this.addChild(new SpinnerMesh(this));
  }

  onContacting(ball: Entity) {
    if (isBall(ball)) {
      const relativeVelocity = this.getNormal().dot(ball.body.velocity);
      const contactAmount = Math.abs(Math.cos(this.getAngle()));
      this.spinVelocity = lerp(
        this.spinVelocity,
        relativeVelocity * SPEED_MULTI,
        contactAmount
      );
    }
  }

  getContactAmount() {
    return Math.abs(Math.cos(this.getAngle()));
  }

  getNormal() {
    return V(0, 1).irotate(this.body!.angle);
  }

  getAngle() {
    return ((this.rotations + 0.25) % 1.0) * 2 * Math.PI;
  }

  onTick(dt: number) {
    this.spinVelocity *= 1.0 - FRICTION * dt;
    const oldRotationCount = Math.floor(this.rotations * 2);
    this.rotations += this.spinVelocity * dt;
    const newRotationCount = Math.floor(this.rotations * 2);

    for (let i = oldRotationCount; i < newRotationCount; i++) {
      this.onSpin(true);
    }
    for (let i = oldRotationCount; i > newRotationCount; i--) {
      this.onSpin(false);
    }

    // Gravity
    const gravity = Math.sin(this.getAngle());
    this.spinVelocity += gravity * dt;
  }

  onSpin(forward: boolean) {
    const speed = Math.abs(this.spinVelocity);
    this.addChildren(
      new PositionalSound("pop1", this.getPosition(), {
        speed: 1.6 + speed * 0.023,
        gain: 0.25,
      }),
      new PositionalSound("spinner2", this.getPosition(), {
        speed: 0.9 + speed * 0.033,
        gain: 1.3 * clamp(speed / 22) + 0.1,
      })
    );
    this.game!.dispatch(scoreEvent(100));
    this.game!.dispatch({ type: "spin", spinner: this, forward });
  }
}

const TEXTURE = createNoiseNormalMap(32);
TEXTURE.magFilter = LinearFilter;
TEXTURE.minFilter = NearestFilter;

class SpinnerMesh extends BaseEntity implements Entity {
  reflector: Reflector;
  constructor(private spinner: Spinner) {
    super();

    this.reflector = this.addChild(new Reflector(16, 8));

    const height = 1.9;
    const material = new MeshStandardMaterial({
      color: 0xffffff,
      envMap: this.reflector.envMap,
      metalness: 0.8,
      roughness: 0.0,
      normalMap: TEXTURE,
      normalScale: new Vector2(0.01, 0.01),
    });
    const geometry = new BoxGeometry(spinner.width, 0.1, height);
    geometry.rotateZ(spinner.body.angle);
    this.mesh = new Mesh(geometry, material);
    const [x, y] = spinner.body.position;
    this.mesh.position.set(x, y, -height - 0.2);
    this.mesh.up.set(0, 0, -1);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    this.reflector.parentMesh = this.mesh;

    this.disposeables.push(geometry, material);
  }

  onRender() {
    const [nx, ny] = this.spinner.getNormal().irotate90ccw();
    const axis = new Vector3(nx, ny, 0);
    const angle = this.spinner.getAngle();
    this.mesh!.setRotationFromAxisAngle(axis, angle);
  }
}
