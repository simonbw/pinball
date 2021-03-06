import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { KeyCode } from "../../core/io/Keys";
import Ball, { isBall } from "../ball/Ball";
import { getBinding } from "../ui/KeyboardBindings";

const FORCE = 250;
const GRAVITY_COMP = 132;

/** Magically control the ball to put it where we want it */
export default class MagicBallController extends BaseEntity implements Entity {
  onTick() {
    const ball = this.getBall();
    if (ball && !ball.captured) {
      // Keyboard control
      if (this.game!.io.keyIsDown(getBinding("MAGIC_LEFT"))) {
        ball.body.applyForce([-FORCE, 0]);
      }
      if (this.game!.io.keyIsDown(getBinding("MAGIC_UP"))) {
        ball.body.applyForce([0, -FORCE - GRAVITY_COMP]);
      }
      if (this.game!.io.keyIsDown(getBinding("MAGIC_RIGHT"))) {
        ball.body.applyForce([FORCE, 0]);
      }
      if (this.game!.io.keyIsDown(getBinding("MAGIC_DOWN"))) {
        ball.body.applyForce([0, FORCE]);
      }
    }
  }

  getBall(): Ball | null {
    const ball = this.game!.entities.getTagged("ball")[0];
    if (isBall(ball)) {
      return ball;
    }
    return null;
  }

  onKeyDown(key: KeyCode) {
    const ball = this.getBall();
    if (ball) {
      switch (key) {
        case getBinding("MAGIC_RESET"):
          ball.destroy();
          this.game!.dispatch({ type: "newBall" });
          break;
        case getBinding("MAGIC_MULTI"):
          this.game!.dispatch({ type: "newBall" });
          break;
      }
    }
  }

  onMouseDown() {
    const ball = this.getBall();
    if (ball) {
    }
  }
}
