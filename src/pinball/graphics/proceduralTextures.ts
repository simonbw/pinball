import {
  ClampToEdgeWrapping,
  DataTexture,
  RepeatWrapping,
  RGBAFormat,
} from "three";
import { clamp } from "../../core/util/MathUtil";
import { rInteger } from "../../core/util/Random";
import { V } from "../../core/Vector";

type PixelDataGenerator = (x: number, y: number, c: number) => number;

export function generateTextureData(
  width: number = 64,
  height: number = 64,
  channels: number = 4,
  getData: PixelDataGenerator
) {
  const data = new Uint8Array(width * height * channels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (x + y * width) * channels;

      for (let channel = 0; channel < channels; channel++) {
        data[i + channel] = getData(x, y, channel);
      }
    }
  }

  return data;
}

export function createNoiseNormalMap(size: number) {
  const data = generateTextureData(size, size, 4, (x, y, channel) => {
    switch (channel) {
      case 0:
      case 1:
        return rInteger(0, 256);
      case 2:
      case 3:
        return 255;
      default:
        throw new Error("Invalid channel: " + channel);
    }
  });
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

export function createRadialGradient(size: number, falloff: number = 1.0) {
  const data = generateTextureData(size, size, 4, (x, y, c) => {
    const r = V(x, y)
      .imul(2 / size)
      .isub(V(1, 1)).magnitude;
    const p = (1 - r) ** falloff;
    return clamp(p * 256, 0, 255);
  });
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.premultiplyAlpha = false;
  return texture;
}
