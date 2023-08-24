import { Body, Box, Shape as P2Shape } from "p2";
import { BoxGeometry, Mesh, MeshPhongMaterial } from "three";
import { V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { darken, lighten } from "../../core/util/ColorUtils";
import { CollisionGroups } from "../Collision";
import { P2Materials } from "../P2Materials";
import { isBall } from "../ball/Ball";
import {
  BallCollisionInfo,
  WithBallCollisionInfo,
} from "../ball/BallCollisionInfo";
import { PositionalSound } from "../sound/PositionalSound";
import { scoreEvent } from "../system/LogicBoard";

export default class LightUpTarget
  extends BaseEntity
  implements Entity, WithBallCollisionInfo
{
  tags = ["button_target"];
  body: Body;
  p2Shape: P2Shape;
  mesh: Mesh;
  height: number;
  ballCollisionInfo: BallCollisionInfo = {
    beginContactSound: { name: "rubberHit3" },
  };
  material: MeshPhongMaterial;
  lit: boolean = false;
  enabled: boolean = true;

  onUnlitHit?: () => void;
  onLitHit?: () => void;

  constructor(
    position: V2d,
    angle: number = 0,
    width: number = 2.0,
    color: number = 0xffaa00,
    height?: number
  ) {
    super();

    this.height = height = height ?? width * 1.5;
    const depth = 0.2;

    this.body = new Body({ position, angle });
    this.p2Shape = new Box({ width: width, height: depth });
    this.p2Shape.collisionGroup = CollisionGroups.Table;
    this.p2Shape.collisionMask = CollisionGroups.Ball;
    this.p2Shape.material = P2Materials.plastic;
    this.body.addShape(this.p2Shape);

    this.material = new MeshPhongMaterial({ color });

    const geometry = new BoxGeometry(width, height, depth);
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, -height / 2);

    this.mesh = new Mesh(geometry, this.material);
    this.mesh.position.set(position.x, position.y, 0);
    this.mesh.rotateZ(angle);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    this.disposeables.push(geometry, this.material);
  }

  light() {
    this.lit = true;
    const emissive = darken(lighten(this.material.color.getHex(), 0.6), 0.5);
    this.material.emissive.set(emissive);
  }

  unLight() {
    this.lit = false;
    this.material.emissive.set(0x0);
  }

  async onImpact(ball: Entity) {
    if (isBall(ball) && this.enabled) {
      if (!this.lit) {
        this.light();

        if (this.onUnlitHit) {
          this.onUnlitHit();
        } else {
          this.game!.dispatch(scoreEvent(1000));
          this.addChild(new PositionalSound("boing2", this.getPosition()));
        }
      } else {
        if (this.onLitHit) {
          this.onLitHit();
        } else {
          this.game!.dispatch(scoreEvent(200));
          this.addChild(new PositionalSound("defenderUp1", this.getPosition()));
        }
      }
    }
  }
}
