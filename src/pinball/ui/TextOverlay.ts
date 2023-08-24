import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  RGBAFormat,
} from "three";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import FPSMeter from "../../core/util/FPSMeter";
import { Rect } from "../util/Rect";

export default class TextOverlay extends BaseEntity implements Entity {
  ctx: CanvasRenderingContext2D;
  texture: CanvasTexture;
  fpsMeter: FPSMeter;
  score: number = 0;
  statsEnabled: boolean = false;

  constructor(
    text: string,
    rect: Rect,
    z: number = 0,
    private align: CanvasTextAlign = "center"
  ) {
    super();
    this.fpsMeter = this.addChild(new FPSMeter());

    const canvas = document.createElement("canvas");
    canvas.width = rect.width * 16;
    canvas.height = rect.height * 16;

    this.ctx = canvas.getContext("2d")!;
    this.texture = new CanvasTexture(
      canvas,
      undefined,
      undefined,
      undefined,
      undefined,
      LinearFilter,
      RGBAFormat,
      undefined,
      4
    );

    const material = new MeshPhongMaterial({
      // color: 0x000000,
      // emissive: 0xffffff,
      // emissiveMap: this.texture,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      transparent: true,
      map: this.texture,
    });

    const geometry = new PlaneGeometry(rect.width, rect.height);
    geometry.rotateX(Math.PI);
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(rect.center.x, rect.center.y, z);

    this.setText(text);
  }

  setText(text: string) {
    const { width, height } = this.ctx.canvas;

    // Clear the back
    this.ctx.clearRect(0, 0, width, height);

    // Render the text
    this.ctx.fillStyle = "#ff0";
    this.ctx.font = "20px sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = this.align;
    if (this.align === "left") {
      this.ctx.fillText(text, 0, height / 2, width);
    } else if (this.align === "right") {
      this.ctx.fillText(text, width, height / 2, width);
    }

    // Make sure it gets displayed
    this.texture.needsUpdate = true;
  }
}
