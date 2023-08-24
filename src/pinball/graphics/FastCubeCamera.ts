import {
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from "three";

const FOV = 90;
const ASPECT = 1;
const ALL_SIDES = [0, 1, 2, 3, 4, 5];

export default class FastCubeCamera extends Object3D {
  type = "CubeCamera";

  cameras: [
    PerspectiveCamera,
    PerspectiveCamera,
    PerspectiveCamera,
    PerspectiveCamera,
    PerspectiveCamera,
    PerspectiveCamera,
  ];
  constructor(
    near: number,
    far: number,
    public renderTarget: WebGLCubeRenderTarget
  ) {
    super();

    if ((renderTarget as any).isWebGLCubeRenderTarget !== true) {
      throw new Error(
        "THREE.CubeCamera: The constructor now expects an instance of WebGLCubeRenderTarget as third parameter."
      );
    }

    const cameraPX = new PerspectiveCamera(FOV, ASPECT, near, far);
    cameraPX.layers = this.layers;
    cameraPX.up.set(0, -1, 0);
    cameraPX.lookAt(new Vector3(1, 0, 0));
    this.add(cameraPX);

    const cameraNX = new PerspectiveCamera(FOV, ASPECT, near, far);
    cameraNX.layers = this.layers;
    cameraNX.up.set(0, -1, 0);
    cameraNX.lookAt(new Vector3(-1, 0, 0));
    this.add(cameraNX);

    const cameraPY = new PerspectiveCamera(FOV, ASPECT, near, far);
    cameraPY.layers = this.layers;
    cameraPY.up.set(0, 0, 1);
    cameraPY.lookAt(new Vector3(0, 1, 0));
    this.add(cameraPY);

    const cameraNY = new PerspectiveCamera(FOV, ASPECT, near, far);
    cameraNY.layers = this.layers;
    cameraNY.up.set(0, 0, -1);
    cameraNY.lookAt(new Vector3(0, -1, 0));
    this.add(cameraNY);

    const cameraPZ = new PerspectiveCamera(FOV, ASPECT, near, far);
    cameraPZ.layers = this.layers;
    cameraPZ.up.set(0, -1, 0);
    cameraPZ.lookAt(new Vector3(0, 0, 1));
    this.add(cameraPZ);

    const cameraNZ = new PerspectiveCamera(FOV, ASPECT, near, far);
    cameraNZ.layers = this.layers;
    cameraNZ.up.set(0, -1, 0);
    cameraNZ.lookAt(new Vector3(0, 0, -1));
    this.add(cameraNZ);

    this.cameras = [cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ];
  }

  update(renderer: WebGLRenderer, scene: Scene, sides: number[] = ALL_SIDES) {
    if (this.parent === null) this.updateMatrixWorld();

    const currentXrEnabled = renderer.xr.enabled;
    const lastRenderTarget = renderer.getRenderTarget();

    renderer.xr.enabled = false;

    const generateMipmaps = this.renderTarget.texture.generateMipmaps;

    this.renderTarget.texture.generateMipmaps = false;

    for (const side of sides) {
      renderer.setRenderTarget(this.renderTarget, side);
      renderer.render(scene, this.cameras[side]);
    }

    this.renderTarget.texture.generateMipmaps = generateMipmaps;

    renderer.setRenderTarget(lastRenderTarget);

    renderer.xr.enabled = currentXrEnabled;
  }

  // clear(
  //   renderer: WebGLRenderer,
  //   color?: boolean,
  //   depth?: boolean,
  //   stencil?: boolean
  // ) {
  //   const currentRenderTarget = renderer.getRenderTarget();

  //   for (const side of ALL_SIDES) {
  //     renderer.setRenderTarget(this.renderTarget, side);
  //     renderer.clear(color, depth, stencil);
  //   }

  //   renderer.setRenderTarget(currentRenderTarget);
  // }
}
