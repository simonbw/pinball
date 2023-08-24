import { Mesh, MeshPhongMaterial, TubeGeometry } from "three";
import { V2d } from "../../../core/Vector";
import BaseEntity from "../../../core/entity/BaseEntity";
import Entity from "../../../core/entity/Entity";
import Path3 from "../../graphics/Path3";

const MATERIAL = new MeshPhongMaterial({
  color: 0xff0000,
  shininess: 10,
});

export default class GoalMesh extends BaseEntity implements Entity {
  constructor(
    position: V2d,
    angle: number = 0,
    width = 8.0,
    depth: number = 5.0
  ) {
    super();

    const path = new Path3();
    path
      .moveTo(-width / 2, depth / 2, 0)
      .lineTo(-width / 2, -depth / 2, 0)
      .lineTo(width / 2, -depth / 2, 0)
      .lineTo(width / 2, depth / 2, 0)
      .lineTo(width / 2, depth / 2, -4)
      .lineTo(-width / 2, depth / 2, -4)
      .lineTo(-width / 2, depth / 2, 0);

    const geometry = new TubeGeometry(path, 128, 0.5, 8);
    geometry.translate(0, 0, -0.24);
    this.mesh = new Mesh(geometry, MATERIAL);
    this.mesh.rotateZ(angle);
    this.mesh.position.set(position.x, position.y, 0);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
  }
}
