import { Body, Capsule } from "p2";
import { ExtrudeGeometry, Mesh } from "three";
import { WALL_SIDE_MATERIAL, WALL_TOP_MATERIAL } from ".";
import { V2d } from "../../../core/Vector";
import BaseEntity from "../../../core/entity/BaseEntity";
import Entity from "../../../core/entity/Entity";
import { CollisionGroups } from "../../Collision";
import { P2Materials } from "../../P2Materials";
import {
  BallCollisionInfo,
  WithBallCollisionInfo,
} from "../../ball/BallCollisionInfo";
import { makeOutlineShape } from "../../graphics/OutlineShape";

export default class MultiWall
  extends BaseEntity
  implements Entity, WithBallCollisionInfo
{
  ballCollisionInfo: BallCollisionInfo = {
    beginContactSound: {
      name: "wallHit2",
    },
  };
  constructor(
    points: readonly V2d[],
    width: number = 1.0,
    color?: number,
    renderSelf: boolean = true
  ) {
    super();
    if (points.length < 2) {
      throw new Error("Need at least 2 points for a multiwall.");
    }

    this.bodies = [];

    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1];
      const end = points[i];

      const delta = end.sub(start);
      const length = delta.magnitude;
      const center = start.add(delta.mul(0.5));

      const body = new Body({
        mass: 0,
      });

      const shape = new Capsule({
        length,
        radius: width / 2,
      });
      shape.material = P2Materials.plastic;
      shape.collisionGroup = CollisionGroups.Table;
      shape.collisionMask = CollisionGroups.Ball;
      body.addShape(shape, center, delta.angle);

      this.bodies.push(body);
    }

    if (renderSelf) {
      const shape = makeOutlineShape(points, width);

      const geometry = new ExtrudeGeometry(shape, {
        bevelEnabled: false,
        depth: 2.0 * width + 0.25,
        curveSegments: 1,
      });
      geometry.translate(0, 0, -2 * width);
      this.mesh = new Mesh(geometry, [WALL_TOP_MATERIAL, WALL_SIDE_MATERIAL]);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = false;

      this.mesh.updateMatrix();
      this.mesh.matrixAutoUpdate = false;
    }
  }
}
