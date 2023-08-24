import {
  BoxGeometry,
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { clamp } from "../../core/util/MathUtil";
import { makeOutlineShape } from "../graphics/OutlineShape";

const EXPAND_AMOUNT = 1.2;
const DURATION = 0.08;

const MATERIAL = new MeshStandardMaterial({
  color: 0xdd0000,
  roughness: 0.8,
  // morphTargets: true,
});

const KICKER_MATERIAL = new MeshStandardMaterial({
  color: 0xdddddd,
  roughness: 0.1,
  metalness: 0.5,
});

export default class SlingshotMesh extends BaseEntity implements Entity {
  animationStartTime: number = -Infinity;
  mesh: Mesh;
  kickerMesh: Mesh;

  constructor(
    private start: V2d,
    private end: V2d,
    private middlePercent: number = 0.5,
    private width: number = 0.5,
    color: number = 0xdd0000
  ) {
    super();

    const geometry = this.makeGeometry(0);
    const morphGeometry = this.makeGeometry(EXPAND_AMOUNT);

    // geometry.morphTargets.push({
    //   name: "open",
    //   vertices: morphGeometry.vertices,
    // });

    geometry.morphAttributes.position = [
      morphGeometry.attributes.position.clone(),
    ];

    const material = MATERIAL.clone();
    material.color.set(color);
    this.mesh = new Mesh(geometry, material);
    this.mesh.updateMorphTargets();

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    const kickerGeometry = new BoxGeometry(0.25, 0.6, 1.0);
    kickerGeometry.translate(0, 0, -0.5);
    this.kickerMesh = new Mesh(kickerGeometry, KICKER_MATERIAL);
    const normal = end.sub(start).irotate90cw();
    this.kickerMesh.rotateZ(normal.angle);
    this.object3ds.push(this.kickerMesh);

    this.disposeables.push(material);
    // Cuz we already don't need them
    geometry.dispose();
    morphGeometry.dispose();
  }

  getDisplacePos(percent: number, amount: number) {
    const normal = this.end.sub(this.start).irotate90ccw().inormalize();
    const midpoint = this.start.lerp(this.end, percent);
    return midpoint.add(normal.mul(amount));
  }

  makeGeometry(displacement: number) {
    const midpoint = this.getDisplacePos(this.middlePercent, displacement);

    const shape = makeOutlineShape(
      [this.start, midpoint, this.end],
      this.width
    );
    const geometry = new ExtrudeGeometry(shape, {
      depth: 1.0,
      bevelEnabled: false,
    });
    geometry.translate(0, 0, -1.5);
    return geometry;
  }

  onRender() {
    const timeSinceHit = this.game!.elapsedTime - this.animationStartTime;
    const t = clamp(timeSinceHit, 0, DURATION) / DURATION;

    const mid = 0.3;
    const springDisplacement =
      t < mid ? t / mid : 1.0 - (t - mid) / (1.0 - mid);
    this.mesh.morphTargetInfluences![0] = springDisplacement;

    const kickerDisplacement = t < mid ? 1.0 - t / mid : clamp(1.0 - t / mid);
    const kickerPos = this.getDisplacePos(
      this.middlePercent,
      -0.5 + 0.7 * kickerDisplacement
    );
    this.kickerMesh.position.x = kickerPos.x;
    this.kickerMesh.position.y = kickerPos.y;
  }
}
