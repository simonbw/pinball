import { Body, Circle } from "p2";
import { V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { degToRad } from "../../core/util/MathUtil";
import { rNormal } from "../../core/util/Random";
import { CollisionGroups } from "../Collision";
import { P2Materials } from "../P2Materials";
import Ball, { isBall } from "../ball/Ball";
import { PositionalSound } from "../sound/PositionalSound";
import { scoreEvent } from "../system/LogicBoard";
import BumperMesh from "./BumperMesh";

const STRENGTH = 250;

interface BumperHitEvent {
  type: "bumperHit";
  bumper: Bumper;
  ball: Ball;
}

export default class Bumper extends BaseEntity implements Entity {
  tags = ["bumper"];
  lastHit: number = -Infinity;
  body: Body;
  enabled: boolean = true;

  constructor(position: V2d, size: number = 1.7) {
    super();

    this.body = new Body({
      position: position,
      mass: 0,
    });

    const shape = new Circle({ radius: size * 0.6 });
    shape.material = P2Materials.rubber;
    shape.collisionGroup = CollisionGroups.Table;
    shape.collisionMask = CollisionGroups.Ball;
    this.body.addShape(shape);

    this.addChild(new BumperMesh(this, size));
  }

  async onImpact(ball: Entity) {
    if (isBall(ball) && this.enabled) {
      const event: BumperHitEvent = {
        type: "bumperHit",
        bumper: this,
        ball,
      };
      this.game!.dispatch(event);
      this.game?.dispatch(scoreEvent(700));
      this.addChild(
        new PositionalSound("bumper1", this.getPosition(), { gain: 1.1 })
      );
      const impulse = ball
        .getPosition()
        .sub(this.getPosition())
        .inormalize()
        .irotate(rNormal(0.0, degToRad(5)))
        .mul(STRENGTH);
      ball.capture();
      this.lastHit = this.game!.elapsedTime;

      await this.wait(0.016);
      ball.release();
      ball.body.applyImpulse(impulse);
    }
  }
}
