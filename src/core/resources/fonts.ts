export function waitForFontsLoaded(fonts: readonly FontFace[]) {
  return Promise.all(
    fonts.map(async (font) => {
      const loadedFont = await font.load();
      // @ts-ignore (dunno why it doesn't have add method)
      document.fonts.add(loadedFont);
    })
  );
}
