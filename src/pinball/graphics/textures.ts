import {
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  RepeatWrapping,
  TextureLoader,
} from "three";
import ironScuffedRoughness from "../../../resources/textures/Iron-Scuffed_roughness.png";
import bumperEmissive from "../../../resources/textures/bumper-emissive.png";
import bumper from "../../../resources/textures/bumper.png";
import hockeyPlayfield from "../../../resources/textures/hockey_playfield.png";
import plasticpattern1Normal2Ogl from "../../../resources/textures/plasticpattern1-normal2-ogl.png";
import plasticpattern1Roughness2 from "../../../resources/textures/plasticpattern1-roughness2.png";
import scuffedPlasticNormal from "../../../resources/textures/scuffed-plastic-normal.png";
import scuffedPlasticRough from "../../../resources/textures/scuffed-plastic-rough.png";
import scuffedPlastic5Alb from "../../../resources/textures/scuffed-plastic5-alb.png";
import streakedMetal1Albedo from "../../../resources/textures/streaked-metal1-albedo.png";
import streakedMetal1Ao from "../../../resources/textures/streaked-metal1-ao.png";
import streakedMetal1Metalness from "../../../resources/textures/streaked-metal1-metalness.png";
import streakedMetal1NormalOgl from "../../../resources/textures/streaked-metal1-normal-ogl.png";
import streakedMetal1Rough from "../../../resources/textures/streaked-metal1-rough.png";
import woodSrc from "../../../resources/textures/wood.png";

const loader = new TextureLoader();

export const TEXTURES = {
  HockeyPlayfield: loader.load(hockeyPlayfield),

  IronScuffedRoughness: loader.load(ironScuffedRoughness),

  PlasticScuffed: loader.load(scuffedPlastic5Alb),
  PlasticScuffedNormal: loader.load(scuffedPlasticNormal),
  PlasticScuffedRoughness: loader.load(scuffedPlasticRough),

  Wood: loader.load(woodSrc),

  BumpyPlasticNormal: loader.load(plasticpattern1Normal2Ogl),
  BumpyPlasticRoughness: loader.load(plasticpattern1Roughness2),

  Bumper: loader.load(bumper),
  BumperEmissive: loader.load(bumperEmissive),

  StreakedMetalColor: loader.load(streakedMetal1Albedo),
  StreakedMetalAO: loader.load(streakedMetal1Ao),
  StreakedMetalMetalness: loader.load(streakedMetal1Metalness),
  StreakedMetalRoughness: loader.load(streakedMetal1Rough),
  StreakedMetalNormal: loader.load(streakedMetal1NormalOgl),
};

for (const texture of Object.values(TEXTURES)) {
  texture.anisotropy = 4;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
}

// TEXTURES.Bumper.flipY = false;
TEXTURES.Bumper.repeat.set(0.5, 0.5);

// Customize textures
TEXTURES.HockeyPlayfield.anisotropy = 16;
TEXTURES.HockeyPlayfield.generateMipmaps = true;
TEXTURES.HockeyPlayfield.magFilter = LinearFilter;
TEXTURES.HockeyPlayfield.minFilter = LinearMipmapLinearFilter;

TEXTURES.BumpyPlasticNormal.minFilter = NearestFilter;
TEXTURES.BumpyPlasticRoughness.minFilter = NearestFilter;

export function waitForTexturesLoaded(
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  if (Object.values(TEXTURES).every((texture) => Boolean(texture.image))) {
    const total = Object.values(TEXTURES).length;
    onProgress?.(total, total);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const manager = loader.manager;
    manager.onLoad = () => resolve();
    manager.onError = () => reject();

    manager.onProgress = (url, n, t) => onProgress?.(n, t);
  });
}
