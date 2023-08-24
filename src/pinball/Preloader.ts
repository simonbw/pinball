import dsDigitalUrl from "../../resources/fonts/ds-digi.ttf";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import Game from "../core/Game";
import { loadModels } from "../core/resources/models";
import { loadSound, SoundName, SOUND_URLS } from "../core/resources/sounds";
import { waitForTexturesLoaded } from "./graphics/textures";

export default class Preloader extends BaseEntity implements Entity {
  private _resolve!: () => void;
  private _promise!: Promise<void>;

  constructor() {
    super();

    this._promise = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }

  async onAdd(game: Game) {
    await Promise.all([
      this.loadTextures(),
      this.loadFonts(),
      this.loadSounds(game.audio),
      this.loadModels(),
    ]);
    this._resolve();
  }

  waitTillLoaded() {
    return this._promise;
  }

  loadTextures() {
    const element = document.getElementById("texture-count")!;
    element.innerText = `0 / ?`;

    return waitForTexturesLoaded((loaded, total) => {
      element.innerText = `${loaded} / ${total}`;
    });
  }

  async loadFonts() {
    const fonts = [new FontFace("DS Digital", `url(${dsDigitalUrl})`)];
    let loaded = 0;
    const total = fonts.length;
    const element = document.getElementById("font-count")!;
    element.innerText = `${loaded} / ${total}`;

    await Promise.all(
      fonts.map(async (font) => {
        // @ts-ignore (dunno why it doesn't have add method)
        document.fonts.add(await font.load());
        loaded += 1;
        element.innerText = `${loaded} / ${total}`;
      })
    );
  }

  async loadSounds(audioContext: AudioContext) {
    const soundNames = Object.keys(SOUND_URLS) as SoundName[];
    let loaded = 0;
    const total = soundNames.length;
    const element = document.getElementById("sound-count")!;
    element.innerText = `${loaded} / ${total}`;

    await Promise.all(
      soundNames.map(async (name) => {
        const url = SOUND_URLS[name];
        try {
          await loadSound(name as SoundName, url, audioContext);
        } catch (e) {
          console.warn(`Sound failed to load: ${name}, ${url}`, e);
        }
        loaded += 1;
        element.innerText = `${loaded} / ${total}`;
      })
    );
  }

  async loadModels() {
    const element = document.getElementById("model-count")!;
    await loadModels((loaded, total) => {
      element.innerText = `${loaded} / ${total}`;
    });
  }

  onDestroy() {
    document.getElementById("preloader")?.remove();
  }
}
