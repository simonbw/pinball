import { CylinderGeometry, Mesh, MeshStandardMaterial } from "three";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import Reflector from "../graphics/Reflector";
import { TEXTURES } from "../graphics/textures";
import Ball from "./Ball";

const RADIUS = 1.0625; // Radius in half inches
const HEIGHT = RADIUS / 1.5; // Ratio of hockey puck size

const GEOMETRY = new CylinderGeometry(RADIUS, RADIUS, HEIGHT, 32, 4);
GEOMETRY.rotateX(Math.PI / 2);

export default class PuckMesh extends BaseEntity implements Entity {
  mesh: Mesh;
  reflector: any;

  constructor(private ball: Ball) {
    super();

    this.reflector = this.addChild(new Reflector());

    const top = new MeshStandardMaterial({
      color: 0x111111,
      roughness: 1.5,
      roughnessMap: TEXTURES.BumpyPlasticRoughness,
      normalMap: TEXTURES.BumpyPlasticNormal,
    });
    const sides = new MeshStandardMaterial({
      color: 0x000000,
      roughness: 1.5,
    });

    this.mesh = new Mesh(GEOMETRY, [sides, top, top]);
    this.mesh.receiveShadow = false;
    this.mesh.castShadow = true;
    this.reflector.parentMesh = this.mesh;

    this.disposeables.push(top, sides);
  }

  onRender() {
    const [x, y] = this.ball.body.position;
    const z = -HEIGHT / 2;
    this.mesh.position.set(x, y, z);
    this.mesh.rotation.z = this.ball.body.angle;

    if (this.game!.framenumber % 4 === 1) {
      this.reflector.update();
    }
  }
}
