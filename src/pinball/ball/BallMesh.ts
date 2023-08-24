import { Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { V, V2d } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { getGraphicsQuality } from "../controllers/GraphicsQualityController";
import Reflector from "../graphics/Reflector";
import { TEXTURES } from "../graphics/textures";
import Ball from "./Ball";

export default class BallMesh extends BaseEntity implements Entity {
  mesh: Mesh;
  reflector: Reflector;

  rollingPosition: V2d = V(0, 0);

  constructor(private ball: Ball) {
    super();

    this.reflector = this.addChild(new Reflector());

    const material = new MeshStandardMaterial({
      roughness: 1.0,
      metalness: 1.0,
      aoMap: TEXTURES.StreakedMetalAO,
      metalnessMap: TEXTURES.StreakedMetalMetalness,
      normalMap: TEXTURES.StreakedMetalNormal,
      roughnessMap: TEXTURES.StreakedMetalRoughness,
      envMap: this.reflector.envMap,
    });

    const geometry = new SphereGeometry(ball.radius, 16, 16);
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.reflector.parentMesh = this.mesh;

    this.mesh.rotateX(Math.PI);

    this.disposeables.push(material, geometry);
  }

  onTick(dt: number) {
    const m = this.ball.angularMomentum;
    const axis = m.clone().normalize();
    const angle = m.length() * dt;
    this.mesh.rotateOnWorldAxis(axis, angle);
  }

  onRender() {
    this.mesh.position.copy(this.ball.getPosition3());

    switch (getGraphicsQuality()) {
      case "medium":
        this.reflector.update([this.game!.framenumber % 6]);
        break;
      case "high":
        this.reflector.update();
        break;
    }
  }
}
