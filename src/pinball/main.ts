import AutoPauser from "../core/AutoPauser";
import Game from "../core/Game";
import GraphicsQualityController from "./controllers/GraphicsQualityController";
import PauseController from "./controllers/PauseController";
import { ContactMaterials } from "./P2Materials";
import { initPostProcessing } from "./postprocessing";
import Preloader from "./Preloader";
import HockeyTable, { loadHockeyDoc } from "./tables/HockeyTable";
import SpaceCadetTable, { loadSpaceCadetDoc } from "./tables/SpaceCadeTable";
import SimpleTable from "./tables/SimpleTable";
import DebugRenderer from "../core/graphics/DebugRenderer";

declare global {
  interface Window {
    DEBUG: { game?: Game };
  }
}

// Object3D.DefaultUp.set(0, 0, -1);

export async function main() {
  await new Promise((resolve) => window.addEventListener("load", resolve));
  const game = new Game({
    tickIterations: 22,
  });

  for (const contactMaterial of ContactMaterials) {
    game.world.addContactMaterial(contactMaterial);
  }

  window.DEBUG = { game };
  game.start();

  const preloader = game.addEntity(new Preloader());

  const frameratePromise = calculateFramerate();

  await preloader.waitTillLoaded();
  game.framerate = await frameratePromise;

  initPostProcessing(game);

  game.world.frictionGravity = 10; // TODO: Tune this
  game.addEntity(new AutoPauser());
  game.addEntity(new PauseController());
  game.addEntity(new GraphicsQualityController());
  game.addEntity(await makeTable());
  game.addEntity(new DebugRenderer());
  // So we don't remove the html from the screen until we've actually hopefully rendered the table
  preloader.destroy();
}

async function makeTable() {
  const urlParams = new URLSearchParams(window.location.search);
  const tableName = urlParams.get("table");

  switch (tableName) {
    case "simple":
      return new SimpleTable();
    case "space-cadet":
      return new SpaceCadetTable(await loadSpaceCadetDoc());
    case "hockey":
    default:
      return new HockeyTable(await loadHockeyDoc());
  }
}

async function calculateFramerate(): Promise<number> {
  console.log("Calculating framerate...");
  const testFrames = 100;

  const startTime = await waitForAnimationFrame();
  for (let i = 0; i < testFrames - 1; i++) {
    await waitForAnimationFrame();
  }
  const endTime = await waitForAnimationFrame();

  const framerate = Math.round((testFrames * 1000) / (endTime - startTime));
  console.log({ framerate });
  return framerate;
}

async function waitForAnimationFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
