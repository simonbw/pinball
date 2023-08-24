import { Body, Plane } from "p2";
import { Mesh, MeshPhysicalMaterial, PlaneGeometry } from "three";
import { V } from "../../core/Vector";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import { CollisionGroups } from "../Collision";
import { TEXTURES } from "../graphics/textures";
import { Rect } from "../util/Rect";

/**
 * The main boundary of the game, makes sure the ball can't possibly be in weird places.
 */
export default class Playfield extends BaseEntity implements Entity {
  tags = ["playfield"];
  id = "playfield";

  material: MeshPhysicalMaterial;
  onEmissive: number = 0x111111;
  constructor({ top, bottom, left, right }: Rect) {
    super();

    this.body = new Body({
      mass: 0,
    });

    // Bound the ball to the playfield
    // Maybe not actually necessary, but helps avoid rare cases
    this.body.addShape(makeP2Plane(), [left, 0], -Math.PI / 2); // Left
    this.body.addShape(makeP2Plane(), [0, top]); // Top
    this.body.addShape(makeP2Plane(), [right, 0], Math.PI / 2); // Right
    this.body.addShape(makeP2Plane(), [0, bottom], Math.PI); // Bottom

    this.material = new MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.8,
      normalMap: TEXTURES.PlasticScuffedNormal,
      clearcoat: 0.5,
      clearcoatRoughness: 0.8,
    });
    this.material.clearcoatRoughnessMap = TEXTURES.PlasticScuffedRoughness;

    const width = right - left;
    const height = bottom - top;
    const geometry = new PlaneGeometry(width, height, 1, 1);

    geometry.rotateX(Math.PI);

    const [cx, cy] = V(left, top).iadd([right, bottom]).imul(0.5);
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.position.set(cx, cy, 0);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;

    this.disposeables.push(this.material, geometry);
  }

  handlers = {
    turnOn: async () => {
      for (let i = 0; i < 2; i++) {
        this.material.emissive.set(this.onEmissive).multiplyScalar(0.5);
        await this.wait(0.04);
        this.material.emissive.set(0x0);
        await this.wait(0.1);
      }
      this.material.emissive.set(this.onEmissive);
    },
  };
}

function makeP2Plane() {
  const shape = new Plane({});
  shape.collisionGroup = CollisionGroups.Table;
  shape.collisionMask = CollisionGroups.Ball;
  return shape;
}
