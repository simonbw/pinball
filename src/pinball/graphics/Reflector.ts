import { Object3D, Vector3, WebGLCubeRenderTarget } from "three";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import FastCubeCamera from "./FastCubeCamera";

export default class Reflector extends BaseEntity implements Entity {
  cubeCamera: FastCubeCamera;
  public parentMesh?: Object3D;
  public getCameraPosition?: () => Vector3;

  constructor(quality: number = 32, distance: number = 10) {
    super();
    const renderTarget = new WebGLCubeRenderTarget(quality);
    this.cubeCamera = new FastCubeCamera(0.25, distance, renderTarget);
    this.object3ds.push(this.cubeCamera);
    this.cubeCamera.up.set(0, 0, -1);
    this.disposeables.push(renderTarget);
  }

  handlers = {
    envUpdated: () => this.update(),
  };

  async onAdd() {
    this.update();
    await this.wait(); // so we can update after the table has been built
    this.update();
  }

  get envMap() {
    return this.cubeCamera.renderTarget.texture;
  }

  update(sides?: number[]) {
    if (this.parentMesh) {
      const oldVisible = this.parentMesh.visible;
      this.parentMesh.visible = false;
      const { threeRenderer, scene } = this.game!.renderer;
      if (this.getCameraPosition) {
        this.cubeCamera.position.copy(this.getCameraPosition());
      } else {
        this.cubeCamera.position.copy(this.parentMesh.position);
      }
      this.cubeCamera.update(threeRenderer, scene, sides);
      this.parentMesh.visible = oldVisible;
    }
  }
}
