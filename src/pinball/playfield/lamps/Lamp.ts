import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from "three";
import BaseEntity from "../../../core/entity/BaseEntity";
import Entity from "../../../core/entity/Entity";
import {
  colorDistance,
  colorLerp,
  darken,
  lighten,
} from "../../../core/util/ColorUtils";
import { lerp } from "../../../core/util/MathUtil";
import { createRadialGradient } from "../../graphics/proceduralTextures";
import { BULB_GEOMETRY_CIRCLE } from "./LampShapes";

const UNLIT_EMISSIVE = new Color(0x000000);

const glowTexture = createRadialGradient(64, 1.4);
glowTexture.magFilter = LinearFilter;
glowTexture.minFilter = LinearFilter;
const GLOW_MATERIAL = new MeshBasicMaterial({
  blending: AdditiveBlending,
  depthTest: true,
  depthWrite: false,
  map: glowTexture,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  premultipliedAlpha: true,
  transparent: true,
});

const BULB_MATERIAL = new MeshStandardMaterial({
  transparent: true,
  roughness: 0.2,
  depthTest: true,
  depthWrite: false,
  emissive: UNLIT_EMISSIVE,
  polygonOffset: true,
  polygonOffsetFactor: -1,
});

const GLOW_GEOMETRY = new PlaneGeometry(8, 8);

export interface LampOptions {
  color?: number;
  size?: number;
  intensity?: number;
  toggleTime?: number;
  bulbGeometry?: BufferGeometry;
  angle?: number;
}

export default class Lamp extends BaseEntity implements Entity {
  tags = ["lamp"];
  intensity: number;
  toggleTime: number;
  color: number;

  emissiveColor!: number;
  glowColor!: number;
  bulbMaterial: MeshStandardMaterial;
  glow: Object3D;
  glowMaterial: MeshBasicMaterial;

  private litPercent: number = 0;
  bulb: Mesh;

  constructor(
    [x, y]: [number, number],
    {
      color = 0xdddddd,
      size = 0.6,
      intensity = 0.8,
      toggleTime = 0.06,
      bulbGeometry = BULB_GEOMETRY_CIRCLE,
      angle = 0,
    }: LampOptions = {}
  ) {
    super();

    this.intensity = intensity;
    this.color = color;
    this.toggleTime = toggleTime;

    this.bulbMaterial = BULB_MATERIAL.clone();
    this.bulb = new Mesh(bulbGeometry, this.bulbMaterial);
    this.bulb.rotateZ(angle);
    this.bulb.position.set(x, y, 0);
    this.bulb.scale.set(size, size, 1);
    this.bulb.updateMatrix();
    this.bulb.matrixAutoUpdate = false;

    this.glowMaterial = GLOW_MATERIAL.clone();
    this.glowMaterial.color.set(0x000000);
    this.glow = new Mesh(GLOW_GEOMETRY, this.glowMaterial);
    this.glow.rotateX(Math.PI);
    this.glow.scale.set(size, size, 0);
    this.glow.position.set(x, y, -0.1);
    this.glow.updateMatrix();
    this.glow.matrixAutoUpdate = false;

    this.object3ds.push(this.glow, this.bulb);

    this.setBrightnessImmediate(0);
    this.setColorImmediate(color);

    this.disposeables.push(
      bulbGeometry,
      this.bulbMaterial,
      GLOW_GEOMETRY,
      this.glowMaterial
    );
  }

  setColorImmediate(color: number) {
    this.color = color;
    this.bulbMaterial.color.set(darken(color, 0.4));
    this.bulbMaterial.needsUpdate = true;
    this.emissiveColor = lighten(color, 0.0);
    this.glowColor = darken(color, 0.3);
  }

  async setColorGradual(to: number, maxTime: number = this.toggleTime) {
    this.clearTimers("color-timer");
    const from = this.color;
    const totalTime = maxTime * colorDistance(from, to);
    await this.wait(
      totalTime,
      (dt, t) => {
        this.setColorImmediate(colorLerp(from, to, t));
      },
      "color-timer"
    );
    this.setColorImmediate(to);
  }

  setBrightnessImmediate(percent: number) {
    this.litPercent = percent;
    this.glow.visible = percent > 0;

    const p = percent * this.intensity;
    this.glowMaterial.color.set(colorLerp(0x0, this.glowColor, p));
    this.glowMaterial.needsUpdate = true;
    this.bulbMaterial.emissive.set(colorLerp(0x0, this.emissiveColor, p));
    this.bulbMaterial.needsUpdate = true;
  }

  async setBrightnessGradual(to: number, maxTime: number = this.toggleTime) {
    this.clearTimers("percent-timer");
    const from = this.litPercent;
    const totalTime = maxTime * Math.abs(to - from);
    await this.wait(
      totalTime,
      (dt, t) => {
        this.setBrightnessImmediate(lerp(from, to, t));
      },
      "percent-timer"
    );
    this.setBrightnessImmediate(to);
  }

  stopTransitions() {
    this.clearTimers("percent-timer");
    this.clearTimers("color-timer");
  }

  stopFlashing() {
    this.stopTransitions();
    this.clearTimers("flash");
  }

  async flash(
    times: number,
    onDuration: number = 0.13,
    offDuration: number = 0.13
  ) {
    for (let i = 0; i < times; i++) {
      await this.turnOn();
      await this.wait(onDuration, undefined, "flash");
      await this.turnOff();
      await this.wait(offDuration, undefined, "flash");
    }
  }

  async setLit(on: boolean) {
    if (on) {
      this.turnOn();
    } else {
      this.turnOff();
    }
  }

  async turnOn() {
    this.setBrightnessGradual(1);
  }

  async turnOff() {
    this.setBrightnessGradual(0);
  }
}
