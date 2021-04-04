import { Sprite, Spritesheet } from "./class/Sprites";

export type Blueprint = "House";

const tileSheet = new Spritesheet("./assets/tiles.png");

type TerrainBlueprint = {
  boat: Boolean;
  walk: Boolean;
  sprite: Sprite | null;
};

type StructureBlueprint = {
  sprite: Sprite | null;
};

export const blueprints = {
  terrain: {
    water: {
      sprite: null,
      boat: true,
      walk: false,
    } as TerrainBlueprint,
    sand: {
      sprite: new Sprite(tileSheet, 1, 1, 64, 64),
      boat: false,
      walk: true,
    } as TerrainBlueprint,
  },
  structure: {
    wreckedBoat: {
      sprite: new Sprite(tileSheet, 0, 6, 64, 64),
    } as StructureBlueprint,
  },
  entity: {},
  player: {},
};
