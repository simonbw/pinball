import {
  Curve,
  CylinderGeometry,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector2,
  Vector3,
} from "three";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { makeSpringGeometry } from "../graphics/SpringMesh";
import Plunger from "./Plunger";

const HEAD_LENGTH = 1;
const SHAFT_LENGTH = 6.0;
const SPRING_LENGTH = 3.2;
const TOP_OFFSET = 0.25;

export default class PlungerMesh extends BaseEntity implements Entity {
  object: Object3D;
  springMesh: Mesh;

  constructor(private plunger: Plunger) {
    super();

    this.springMesh = this.makeSpring();
    this.object = new Object3D();
    this.object.add(this.makeHead());
    this.object.add(this.makeShaft());
    this.object.add(this.springMesh);
    this.object.add(this.makeHandle());

    this.object3ds.push(this.object);
  }

  makeHead() {
    const material = new MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.7,
    });
    const geometry = new CylinderGeometry(0.6, 0.4, HEAD_LENGTH);
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
  }

  makeShaft() {
    const material = new MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.0,
    });
    const geometry = new CylinderGeometry(0.2, 0.2, SHAFT_LENGTH);
    geometry.translate(0, HEAD_LENGTH / 2 + SHAFT_LENGTH / 2, 0);
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
  }

  makeSpring() {
    const material = new MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.0,
      emissive: 0.777777,
    });

    const Geometry = makeSpringGeometry(SPRING_LENGTH, 0.35, 5);
    Geometry.translate(0, HEAD_LENGTH / 2, 0);
    return new Mesh(Geometry, material);
  }

  makeHandle() {
    const material = new MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.0,
      metalness: 0.0,
    });

    const points = [
      new Vector2(0.21, 0.0),
      new Vector2(0.25, 0.05),
      new Vector2(0.4, 0.4),
      new Vector2(0.7, 0.45),
      new Vector2(0.72, 0.5),
      new Vector2(0.7, 0.55),
      new Vector2(0.5, 0.57),
      new Vector2(0.3, 0.59),
      new Vector2(0.07, 0.6),
    ];
    const geometry = new LatheGeometry(points);
    geometry.translate(0, HEAD_LENGTH / 2 + SHAFT_LENGTH, 0);

    return new Mesh(geometry, material);
  }

  onRender() {
    const [x, y] = this.plunger.getPosition();
    const dy = y - this.plunger.neutralPosition.y;
    this.object.position.set(x, y - TOP_OFFSET, -1);

    this.springMesh.morphTargetInfluences![0] = dy / SPRING_LENGTH;
    // this.springMesh.position.y = dy / 2;
  }
}

class HelixCurve extends Curve<Vector3> {
  constructor(
    private length: number = 2,
    private radius: number = 1,
    private numberOfCoils = 4.0
  ) {
    super();
  }

  getPoint(t: number): Vector3 {
    const theta = t * Math.PI * 2 * this.numberOfCoils;
    const x = this.radius * Math.cos(theta);
    const z = this.radius * Math.sin(theta);
    const y = t * this.length;

    return new Vector3(x, y, z);
  }
}
