import { Body, Circle } from "p2";
import {
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from "three";
import { V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { CollisionGroups } from "../Collision";
import { P2Materials } from "../P2Materials";
import {
  BallCollisionInfo,
  WithBallCollisionInfo,
} from "../ball/BallCollisionInfo";
import Reflector from "../graphics/Reflector";
import { TEXTURES } from "../graphics/textures";

const RUBBER_MATERIAL = new MeshStandardMaterial({
  color: 0x070707,
  metalness: 0.0,
  roughness: 0.0,
});

const RUBBER_GEOMETRY = new SphereGeometry(1.1, 12, 12);
RUBBER_GEOMETRY.rotateX(Math.PI / 2);
RUBBER_GEOMETRY.scale(1, 1, 0.7);

const CYLINDER_GEOMETRY = new CylinderGeometry(0.7, 0.7, 1);
CYLINDER_GEOMETRY.rotateX(Math.PI / 2);

export default class Post
  extends BaseEntity
  implements Entity, WithBallCollisionInfo
{
  ballCollisionInfo: BallCollisionInfo;
  reflector: Reflector;

  constructor(position: V2d, radius: number = 0.5, height: number = 1.8) {
    super();

    this.body = new Body({
      position: position,
      mass: 0,
    });

    const p2Shape = new Circle({ radius: radius });
    p2Shape.material = P2Materials.rubber;
    p2Shape.collisionGroup = CollisionGroups.Table;
    p2Shape.collisionMask = CollisionGroups.Ball;
    this.body.addShape(p2Shape);

    this.ballCollisionInfo = {
      beginContactSound: { name: "rubberHit3", speedVariance: 0.3 },
    };

    this.reflector = this.addChild(new Reflector());

    const cylinderMaterial = new MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 1.0,
      roughness: 1.5,
      roughnessMap: TEXTURES.IronScuffedRoughness,
      envMap: this.reflector.envMap,
    });

    const rubberMesh = new Mesh(RUBBER_GEOMETRY, RUBBER_MATERIAL);
    rubberMesh.scale.set(radius, radius, radius);

    const cylinderMesh = new Mesh(CYLINDER_GEOMETRY, cylinderMaterial);
    cylinderMesh.scale.set(radius, radius, height);

    const obj = new Object3D();
    obj.position.set(position.x, position.y, -height / 2);
    obj.add(rubberMesh);
    obj.add(cylinderMesh);
    obj.castShadow = false;
    obj.receiveShadow = false;

    this.reflector.parentMesh = obj;
    this.object3ds.push(obj);
    this.disposeables.push(cylinderMaterial);
  }
}
