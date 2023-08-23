import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { setFocusAmount } from "../postprocessing";
import { SoundInstance } from "../sound/SoundInstance";
import { getBindings } from "../ui/KeyboardBindings";
import LogicBoard from "./LogicBoard";

const SLOW_SPEED = 0.35;
const RAMP_DOWN_SPEED = 0.01;
const RAMP_UP_SPEED = 0.005;
const COOLDOWN_POINT = 0.8;

const DRAIN_SPEED = 0.5;
const FILL_SPEED = 0.15;

export interface SlowMoRemainingEvent {
  type: "slowMoRemaining";
  remaining: number;
}

export interface SlowMoCooldownEvent {
  type: "slowMoCooldown";
  cooldown: boolean;
}

function remainingEvent(remaining: number): SlowMoRemainingEvent {
  return {
    type: "slowMoRemaining",
    remaining,
  };
}

function cooldownEvent(cooldown: boolean): SlowMoCooldownEvent {
  return {
    type: "slowMoCooldown",
    cooldown,
  };
}

export default class SlowMoController extends BaseEntity implements Entity {
  remaining: number = 0.0;
  cooldown: boolean = false;

  constructor(private logicBoard: LogicBoard) {
    super();
  }

  handlers = {
    newBall: async () => {
      this.remaining = 1.0;
      this.cooldown = false;
      this.game!.dispatch(remainingEvent(this.remaining));
      this.game!.dispatch(cooldownEvent(this.cooldown));
    },
  };

  onTick(dt: number) {
    const game = this.game!;
    const oldSlowMo = game.slowMo;
    const lastRemaining = this.remaining;
    const lastCooldown = this.cooldown;

    if (
      this.logicBoard.gamePhase === "playing" &&
      game.entities.getTagged("ball").length > 0
    ) {
      const keys = getBindings("SLO_MO", "SLO_MO2");
      const keyDown = game.io.anyKeyIsDown(keys);

      setFocusAmount(1.0 - game.slowMo);

      if (keyDown && this.remaining > 0 && !this.cooldown) {
        const cost = (dt * DRAIN_SPEED) / game.slowMo ** 2;
        if (this.remaining > cost) {
          this.remaining -= cost;
        } else {
          this.remaining = 0;
          this.cooldown = true;
          this.addChild(new SoundInstance("drain", { speed: 2, gain: 0.3 }));
        }
        game.slowMo = Math.max(game.slowMo - RAMP_DOWN_SPEED, SLOW_SPEED);
      } else {
        this.remaining = Math.min(this.remaining + FILL_SPEED * dt, 1.0);
        if (this.cooldown && this.remaining >= COOLDOWN_POINT) {
          this.cooldown = false;
          this.addChild(new SoundInstance("upgrade", { speed: 2, gain: 0.3 }));
        }
        game.slowMo = Math.min(game.slowMo + RAMP_UP_SPEED, 1);
      }
    } else {
      game.slowMo = 1.0;
    }

    // Dispatch updates if stuff changed
    if (this.remaining != lastRemaining) {
      game.dispatch(remainingEvent(this.remaining));
    }
    if (this.cooldown != lastCooldown) {
      game.dispatch(cooldownEvent(this.cooldown));
    }

    if (game.slowMo !== oldSlowMo) {
      game.dispatch({ type: "slowMoChanged" });
    }
  }
}
