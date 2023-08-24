import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
} from "three";
import BaseEntity from "../../core/entity/BaseEntity";
import Entity from "../../core/entity/Entity";
import FPSMeter from "../../core/util/FPSMeter";
import { UpdateScoreEvent } from "../system/LogicBoard";
import Table from "../tables/Table";
import BackglassController from "./BackglassController";

type DisplayMode = "pre-game" | "midgame" | "post-game";

const PADDING = 10;

export type BackglassTextPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "middle"
  | "sub-middle";
export default class Backglass extends BaseEntity implements Entity {
  displayMode: DisplayMode = "pre-game";
  ctx: CanvasRenderingContext2D;
  texture: CanvasTexture;
  fpsMeter: FPSMeter;
  score: number = 0;
  statsEnabled: boolean = false;

  constructor(
    table: Table,
    heightAboveTable: number = 0,
    private color: string = "#f00"
  ) {
    super();
    this.fpsMeter = this.addChild(new FPSMeter());

    const width = table.bounds.width;
    const height = 18;

    const canvas = document.createElement("canvas");
    canvas.width = table.bounds.width * 16;
    canvas.height = height * 16;

    this.ctx = canvas.getContext("2d")!;
    this.texture = new CanvasTexture(canvas);
    this.texture.anisotropy = 4;
    this.texture.minFilter = LinearFilter;

    const material = new MeshPhongMaterial({
      color: 0x000000,
      emissive: 0xffffff,
      emissiveMap: this.texture,
    });

    const cx = table.bounds.center.x;
    const geometry = new PlaneGeometry(width, height);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(cx, 0, -height / 2 - heightAboveTable);
    this.mesh = new Mesh(geometry, material);
    this.mesh.rotateX(-table.incline);

    this.addChild(new BackglassController(this));
  }

  get topLeft(): [number, number] {
    const { width, height } = this.ctx.canvas;
    return [PADDING, PADDING];
  }
  get topRight(): [number, number] {
    const { width, height } = this.ctx.canvas;
    return [width - PADDING, PADDING];
  }
  get bottomLeft(): [number, number] {
    const { width, height } = this.ctx.canvas;
    return [PADDING, height - PADDING];
  }
  get bottomRight(): [number, number] {
    const { width, height } = this.ctx.canvas;
    return [width - PADDING, height - PADDING];
  }
  get middle(): [number, number] {
    const { width, height } = this.ctx.canvas;
    return [width / 2, height / 2];
  }
  get subMiddle(): [number, number] {
    const { width, height } = this.ctx.canvas;
    return [width / 2, height / 2];
  }

  handlers = {
    updateScore: ({ score }: UpdateScoreEvent) => {
      this.score = score;
    },

    gameStart: () => (this.displayMode = "midgame"),
    gameOver: () => (this.displayMode = "post-game"),
  };

  clear() {
    const { width, height } = this.ctx.canvas;
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, width, height);
  }

  renderText(text: string, position: BackglassTextPosition, size: number = 64) {
    switch (position) {
      case "top-left":
        return this._renderText(text, size, "top", "left", this.topLeft);
      case "bottom-left":
        return this._renderText(text, size, "bottom", "left", this.bottomLeft);
      case "top-right":
        return this._renderText(text, size, "top", "right", this.topRight);
      case "bottom-right":
        return this._renderText(
          text,
          size,
          "bottom",
          "right",
          this.bottomRight
        );
      case "middle":
        return this._renderText(text, size, "bottom", "center", this.middle);
      case "sub-middle":
        return this._renderText(text, size, "top", "center", this.subMiddle);
    }
  }

  _renderText(
    text: string,
    size: number,
    baseline: CanvasTextBaseline,
    align: CanvasTextAlign,
    [x, y]: [number, number]
  ) {
    this.ctx.fillStyle = this.color;
    this.ctx.font = `${size}px DS Digital, sans-serif`;
    this.ctx.textBaseline = baseline;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y, this.ctx.canvas.width - PADDING * 2);
  }

  renderStats() {
    const { width: w, height: h } = this.ctx.canvas;
    const { fps, bodyCount, renderCount, entityCount } =
      this.fpsMeter.getStats();

    this.ctx.font = "28px sans-serif";
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "left";
    const spacing = 28;
    this.ctx.fillText(`fps: ${fps}`, 10, h - spacing * 4, w - 20);
    this.ctx.fillText(`entities: ${entityCount}`, 10, h - spacing * 3, w - 20);
    this.ctx.fillText(`bodies: ${bodyCount}`, 10, h - spacing * 2, w - 20);
    this.ctx.fillText(`draw: ${renderCount}`, 10, h - spacing * 1, w - 20);
  }
}
