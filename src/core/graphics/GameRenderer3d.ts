import {
  Camera,
  Color,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  ReinhardToneMapping,
  LinearToneMapping,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

export class GameRenderer3d {
  scene: Scene = new Scene();
  camera: PerspectiveCamera;
  threeRenderer: WebGLRenderer;
  composer: EffectComposer;
  readonly domElement: HTMLElement;

  constructor() {
    this.scene = new Scene();
    this.scene.background = new Color(0x222233);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(60, aspect, 10, 300);

    this.threeRenderer = new WebGLRenderer({
      alpha: false,
      antialias: false,
      stencil: false,
      depth: false,
      powerPreference: "high-performance",
    });
    this.threeRenderer.domElement.style.pointerEvents = "none";
    this.threeRenderer.domElement.style.cursor = "none";
    this.threeRenderer.shadowMap.enabled = true;
    this.threeRenderer.shadowMap.type = PCFSoftShadowMap;
    this.threeRenderer.physicallyCorrectLights = true;
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.threeRenderer.domElement);
    this.domElement = this.threeRenderer.domElement;

    this.composer = new EffectComposer(this.threeRenderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    window.addEventListener("resize", () => {
      const [w, h] = [window.innerWidth, window.innerHeight];
      this.threeRenderer.setSize(w, h);
      renderPass.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    });
  }

  render() {
    this.composer.render();
  }
}
