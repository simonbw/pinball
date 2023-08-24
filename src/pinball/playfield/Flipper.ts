import { Body, Convex, RevoluteConstraint, RotationalSpring } from "p2";
import { ExtrudeGeometry, Mesh, MeshStandardMaterial, Shape } from "three";
import Game from "../../core/Game";
import { V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { CustomHandlersMap } from "../../core/entity/GameEventHandler";
import RotationalSolenoidSpring from "../../core/physics/RotationalSolenoidSpring";
import { angleDelta, degToRad, reflectX } from "../../core/util/MathUtil";
import { CollisionGroups } from "../Collision";
import { P2Materials } from "../P2Materials";
import {
  BallCollisionInfo,
  WithBallCollisionInfo,
} from "../ball/BallCollisionInfo";
import FlipperSoundController from "../sound/FlipperSoundController";

const MATERIAL = new MeshStandardMaterial({
  color: 0x0000cc,
  roughness: 0.7,
  // map: TEXTURES.Wood,
});

const DEFAULT_DOWN_ANGLE = degToRad(30);
const DEFAULT_SWING = degToRad(60);
const UP_STIFFNESS = 150;
const DOWN_STIFFNESS = 45;
const DAMPING = 12.5;
const OVEREXTENSION_AMOUNT = degToRad(3);
const MASS = 2.8;

type Side = "left" | "right";

export default class Flipper
  extends BaseEntity
  implements Entity, WithBallCollisionInfo
{
  body: Body;
  joint?: RevoluteConstraint;
  spring!: RotationalSpring;
  upAngle: number;
  locked: boolean = false;
  engaged: boolean = false;
  handlers: CustomHandlersMap = {};

  ballCollisionInfo: BallCollisionInfo = {
    beginContactSound: { name: "flipperHit" },
  };
  soundController: FlipperSoundController;

  constructor(
    position: V2d,
    public side: Side = "left",
    public length: number = 6,
    public width: number = 1.2,
    public downAngle: number = side === "left"
      ? DEFAULT_DOWN_ANGLE
      : reflectX(DEFAULT_DOWN_ANGLE),
    swing = DEFAULT_SWING,
    public strength: number = 1.0
  ) {
    super();

    swing = side === "left" ? -swing : swing;
    this.upAngle = downAngle + swing;

    switch (side) {
      case "left":
        this.handlers["leftFlipperUp"] = () => this.engage();
        this.handlers["leftFlipperDown"] = () => this.disengage();
        break;
      case "right":
        this.handlers["rightFlipperUp"] = () => this.engage();
        this.handlers["rightFlipperDown"] = () => this.disengage();
        break;
    }

    const r = width * 0.5;
    const r2 = width * 0.3;
    length = length + (r - r2);

    this.body = new Body({
      position: position.clone(),
      mass: MASS,
      angle: this.downAngle,
      fixedX: true,
      fixedY: true,
    });

    const corners = [
      [0, -r],
      [length, -r2],
      [length + 0.707 * r2, -0.707 * r2],
      [length + r2, 0],
      [length + 0.707 * r2, 0.707 * r2],
      [length, r2],
      [0, r],
      [0, -r2],
    ];

    const p2Shape = new Convex({ vertices: corners });
    p2Shape.material = P2Materials.flipper;
    p2Shape.collisionGroup = CollisionGroups.Table;
    p2Shape.collisionMask = CollisionGroups.Ball;
    this.body.addShape(p2Shape, [0, 0]);

    const shape = new Shape();

    shape.moveTo(0, -r);
    shape.lineTo(length, -r2);
    shape.absarc(length, 0, r2, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(0, r);
    shape.absarc(0, 0, r, Math.PI / 2, -Math.PI / 2, false);

    const geometry = new ExtrudeGeometry(shape, {
      bevelEnabled: false,
      depth: 1,
    });
    this.mesh = new Mesh(geometry, MATERIAL);
    this.mesh.position.set(position.x, position.y, -1.5);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    this.soundController = this.addChild(new FlipperSoundController(this));
  }

  engage() {
    if (!this.engaged) {
      this.engaged = true;
      this.soundController.engage();
    }
  }

  disengage() {
    if (this.engaged) {
      this.engaged = false;
      this.soundController.disengage();
    }
  }

  onAdd(game: Game) {
    this.joint = new RevoluteConstraint(game.ground, this.body, {
      worldPivot: this.body.position,
    });
    if (this.side === "left") {
      this.joint.setLimits(this.upAngle - OVEREXTENSION_AMOUNT, this.downAngle);
    } else {
      this.joint.setLimits(this.downAngle, this.upAngle + OVEREXTENSION_AMOUNT);
    }
    this.constraints = [this.joint];

    this.spring = new RotationalSolenoidSpring(game.ground, this.body, {
      stiffness: this.getStiffness(),
      damping: DAMPING,
      restAngle: this.downAngle,
    });

    this.springs = [this.spring];
  }

  onRender() {
    this.mesh!.rotation.z = this.body.angle;
  }

  shouldLock() {
    const angle = this.body.angle;
    const targetAngle = this.spring.restAngle;
    const speed = Math.abs(this.body.angularVelocity);
    const offset = Math.abs(angleDelta(angle, targetAngle));
    return offset < 0.03 && speed < 0.2;
  }

  lock() {
    this.locked = true;
    this.body.type = Body.STATIC;
    this.body.angularVelocity = 0;
    this.body.updateMassProperties();
  }

  unlock() {
    this.locked = false;
    this.body.type = Body.DYNAMIC;
    this.body.mass = MASS;
    this.body.updateMassProperties();
  }

  getStiffness() {
    return (this.engaged ? UP_STIFFNESS : DOWN_STIFFNESS) * this.strength;
  }

  onTick() {
    this.spring.restAngle = this.engaged ? this.upAngle : this.downAngle;
    this.spring.stiffness = this.getStiffness();

    const shouldLock = this.shouldLock();
    if (!this.locked && shouldLock) {
      this.lock();
    } else if (this.locked && !shouldLock) {
      this.unlock();
    }
  }
}
