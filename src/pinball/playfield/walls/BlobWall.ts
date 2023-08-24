import { Body, vec2 } from "p2";
import { ExtrudeGeometry, Matrix3, Mesh, Shape, Vector2 } from "three";
import { WALL_SIDE_MATERIAL, WALL_TOP_MATERIAL } from ".";
import BaseEntity from "../../../core/entity/BaseEntity";
import Entity from "../../../core/entity/Entity";
import { isCCW, pathToPoints } from "../../../core/util/MathUtil";
import { CollisionGroups } from "../../Collision";
import {
  BallCollisionInfo,
  WithBallCollisionInfo,
} from "../../ball/BallCollisionInfo";

const SEGMENTS_PER_HALF_INCH = 0.8;

interface Options {
  color?: number;
  height?: number;
}

export default class BlobWall
  extends BaseEntity
  implements Entity, WithBallCollisionInfo
{
  ballCollisionInfo: BallCollisionInfo = {
    beginContactSound: {
      name: "wallHit2",
    },
  };

  constructor(path: Shape, transform?: Matrix3, { height = 1 }: Options = {}) {
    super();

    const points = pathToPoints(path, transform, SEGMENTS_PER_HALF_INCH);
    const shapeToExtrude = new Shape(points.map(([x, y]) => new Vector2(x, y)));
    const geometry = new ExtrudeGeometry(shapeToExtrude, {
      bevelEnabled: false,
      depth: height,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -height);
    this.mesh = new Mesh(geometry, [WALL_TOP_MATERIAL, WALL_SIDE_MATERIAL]);

    this.disposeables.push(geometry);

    const tempBody = new Body({ mass: 0 });

    if (!isCCW(points)) {
      points.reverse();
    }

    const success = tempBody.fromPolygon(points, {
      optimalDecomp: points.length < 8,
      removeCollinearPoints: 0.001,
      skipSimpleCheck: false,
    });

    if (!success || tempBody.getArea() <= 0) {
      console.error("decomposition failed", points);
      throw new Error("decomposition failed");
    }

    this.bodies = [];
    for (const shape of [...tempBody.shapes]) {
      const body = new Body({
        mass: 0,
        position: vec2.clone(tempBody.position),
      });
      this.bodies.push(body);
      tempBody.removeShape(shape);

      shape.collisionGroup = CollisionGroups.Table;
      shape.collisionMask = CollisionGroups.Ball;

      body.addShape(shape, shape.position, shape.angle);
    }
  }
}
