import "./core/Polyfills";

import Game from "./core/Game";
import AutoPauser from "./core/AutoPauser";
import { waitForFontsLoaded } from "./core/resources/fonts";
import { loadPixiAssets } from "./core/resources/images";
import { loadAllSounds } from "./core/resources/sounds";
import FPSMeter from "./core/util/FPSMeter";
import { ContactMaterials } from "./pinball/playfield/Materials";
import { setupTable } from "./pinball/Table";
import MagicBallController from "./pinball/controllers/MagicBallController";
import PauseController from "./pinball/controllers/PauseController";

// TODO: Font loading somewhere else
// @ts-ignore
import dsDigitalUrl from "../resources/fonts/ds-digi.ttf";

declare global {
  interface Window {
    DEBUG: {
      game: Game | null;
    };
  }
}

const digiFont = new FontFace("DS Digital", `url(${dsDigitalUrl})`);

window.addEventListener("load", async () => {
  const audioContext = new AudioContext();

  console.log("window load");
  await Promise.all([
    loadPixiAssets(),
    waitForFontsLoaded([digiFont]),
    loadAllSounds(audioContext),
  ]);
  console.log("assets loaded");

  const game = new Game(audioContext, ContactMaterials, 20);
  window.DEBUG = { game: null };
  game.renderer.showCursor();
  game.world.frictionGravity = 10;
  game.addEntity(new AutoPauser());
  game.addEntity(new PauseController());
  game.addEntity(new FPSMeter());
  setupTable(game);
  game.start();
});
