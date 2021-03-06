#!/usr/bin/env node

/*
 * Generates .d.ts files for all of our assets to provide stricter type
 * checking and nicer autocomplete when importing them.
 */

const yargs = require("yargs");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const camelcase = require("camelcase");

const extensions = [
  // images
  "bmp",
  "gif",
  "jpg",
  "png",
  "svg",
  // fonts
  "ttf",
  // audio
  "flac",
  "mp3",
  "ogg",
  "wav",
  // shaders
  "frag",
  "vert",
  //models
  "gltf",
  "glb",
  //misc
  "txt",
];

function log(...args) {
  // Just so this stops showing up in searches for console dot log
  console["log"](...args);
}

// The contents of the generated file
function getContent(filename) {
  const varName = camelcase(path.basename(filename).split(".")[0]);
  return `// This file autogenerated by generate-asset-types.js
  declare const ${varName}: string;
  export default ${varName};
  `;
}

// Removes old types
function cleanTypes(assetsFolder, silent = false) {
  if (!silent) {
    log(`removing old asset .d.ts files from "${assetsFolder}" . . .`);
  }
  const pattern = `${assetsFolder}/**/*.@(${extensions.join("|")}).d.ts`;
  const fileNames = glob.sync(pattern, {});
  fileNames.forEach((fileName) => {
    if (!silent) {
      log(" - removed " + fileName);
    }
    fs.unlinkSync(fileName);
  });
  if (fileNames.length === 0 && !silent) {
    log("No files to remove");
  }
  return fileNames;
}

// Generates the new type files
function generateTypes(assetsFolder, silent = false) {
  if (!silent) {
    log(`generating new asset .d.ts files in "${assetsFolder}" . . .`);
  }
  const pattern = `${assetsFolder}/**/*.@(${extensions.join("|")})`;
  const fileNames = glob.sync(pattern, {}).map((f) => f + ".d.ts");
  fileNames.forEach((fileName) => {
    fs.writeFileSync(fileName, getContent(fileName));
    if (!silent) {
      log(" - created " + fileName);
    }
  });
  if (fileNames.length === 0 && !silent) {
    log("No files to generate");
  }
  return fileNames;
}

function cleanAndGenerate(assetsFolder) {
  log(`Updating asset types in "${assetsFolder}" . . .`);
  const removed = new Set(cleanTypes(assetsFolder, true));
  const generated = new Set(generateTypes(assetsFolder, true));
  const newFiles = [];
  const deletedFiles = [];
  for (const fileName of removed) {
    if (!generated.has(fileName)) {
      deletedFiles.push(fileName);
    }
  }
  for (const fileName of generated) {
    if (!removed.has(fileName)) {
      newFiles.push(fileName);
    }
  }
  if (deletedFiles.length) {
    log(deletedFiles.map((f) => ` - removed ${f}`).join("\n"));
  }
  if (newFiles.length) {
    log(newFiles.map((f) => ` - created ${f}`).join("\n"));
  }
  if (newFiles.length === 0 && deletedFiles.length === 0) {
    log("Nothing has changed");
  }
}

yargs
  .scriptName("generate-asset-types")
  .usage(
    "Generates .d.ts files for assets to provide stricter type checking and nicer autocomplete when importing them."
  )
  .help()
  .option("directory", {
    alias: "d",
    describe: "Directory containing assets",
    default: "./src/assets",
    coerce: (d) => path.resolve(d),
    type: "string",
    normalize: true,
    global: true,
  })
  .command(
    "$0",
    "cleans and generates",
    () => {},
    (argv) => {
      cleanAndGenerate(argv.directory);
    }
  )
  .command(
    "clean",
    "removes all asset types",
    () => {},
    (argv) => {
      cleanTypes(argv.directory);
    }
  )
  .command(
    "generate",
    "generates new .d.ts files",
    () => {},
    (argv) => {
      generateTypes(argv.directory);
    }
  ).argv;
