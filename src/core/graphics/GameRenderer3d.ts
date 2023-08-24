import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  WebGLInfo,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

export class GameRenderer3d {
  readonly camera: PerspectiveCamera;
  readonly composer: EffectComposer;
  readonly domElement: HTMLElement;
  readonly renderPass: RenderPass;
  readonly scene: Scene = new Scene();
  readonly threeRenderer: WebGLRenderer;

  constructor() {
    this.scene = new Scene();
    this.scene.background = new Color(0x222233);

    this.threeRenderer = new WebGLRenderer({
      antialias: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    this.threeRenderer.domElement.style.pointerEvents = "none";
    this.threeRenderer.domElement.style.cursor = "none";
    this.domElement = this.threeRenderer.domElement;

    this.camera = new PerspectiveCamera(60, 1, 10, 300);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.resize();

    this.composer = new EffectComposer(this.threeRenderer);
    this.composer.addPass(this.renderPass);

    this.lastRendererInfo = { ...this.threeRenderer.info };

    window.addEventListener("resize", () => this.resize());
    document.body.appendChild(this.threeRenderer.domElement);
  }

  lastRendererInfo!: Omit<WebGLInfo, "update" | "reset">;
  render() {
    this.lastRendererInfo = { ...this.threeRenderer.info };
    this.threeRenderer.info.reset();
    this.composer.render();
  }

  resize() {
    const [w, h] = [window.innerWidth, window.innerHeight];
    this.threeRenderer.setSize(w, h);
    this.renderPass.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
