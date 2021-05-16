/**
 * Sprite definitions.
 * In a seperate file so out of sight, out of mind
 */
import { BitMap } from "../../shared/BitMap";
import {
  EntityDefs,
  SPRITE_SHEET_HEIGHT,
  SPRITE_SHEET_TILE_SIZE,
  SPRITE_SHEET_WIDTH,
} from "../../shared/GameDefs";
import { EntityType, Skin } from "../../shared/Objects";
import { Sprite, Spritesheet } from "./class/Map";

var SHIP_SPRITE_ROTATION = -90;
var SHIP_SHEET = new Spritesheet("./assets/ships.png");
var TILES_SHEET = new Spritesheet("./assets/tiles.png");

/**
 * SHIP[upgrade][skin][damage]
 */
export var SHIP: {
  [id: number]: { [id: number]: { [id: number]: Sprite } };
} = { 0: {} };

/**
 * ENTITY[EntityType]
 */
export var ENTITY: { [id: number]: Sprite } = {};

/**
 * ENTITY[TERRAINID]
 */
export var TERRAIN = function (terrainid: number): Sprite {
  return {
    sheet: TILES_SHEET,
    x: (terrainid % SPRITE_SHEET_WIDTH) * SPRITE_SHEET_TILE_SIZE,
    y: Math.floor(terrainid / SPRITE_SHEET_HEIGHT) * SPRITE_SHEET_TILE_SIZE,
    width: SPRITE_SHEET_TILE_SIZE,
    height: SPRITE_SHEET_TILE_SIZE,
  };
};

SHIP[0][Skin.RED] = {
  100: {
    sheet: SHIP_SHEET,
    x: 204,
    y: 115,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  50: {
    sheet: SHIP_SHEET,
    x: 0,
    y: 77,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  20: {
    sheet: SHIP_SHEET,
    x: 272,
    y: 230,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  0: {
    sheet: SHIP_SHEET,
    x: 136,
    y: 345,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
};

SHIP[0][Skin.BLUE] = {
  100: {
    sheet: SHIP_SHEET,
    x: 68,
    y: 77,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  50: {
    sheet: SHIP_SHEET,
    x: 340,
    y: 230,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  20: {
    sheet: SHIP_SHEET,
    x: 272,
    y: 0,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  0: {
    sheet: SHIP_SHEET,
    x: 136,
    y: 115,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
};

SHIP[0][Skin.YELLOW] = {
  100: {
    sheet: SHIP_SHEET,
    x: 68,
    y: 307,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  50: {
    sheet: SHIP_SHEET,
    x: 340,
    y: 115,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  20: {
    sheet: SHIP_SHEET,
    x: 204,
    y: 345,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  0: {
    sheet: SHIP_SHEET,
    x: 136,
    y: 0,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
};

SHIP[0][Skin.GREEN] = {
  100: {
    sheet: SHIP_SHEET,
    x: 68,
    y: 192,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  50: {
    sheet: SHIP_SHEET,
    x: 340,
    y: 345,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  20: {
    sheet: SHIP_SHEET,
    x: 272,
    y: 115,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  0: {
    sheet: SHIP_SHEET,
    x: 136,
    y: 230,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
};

SHIP[0][Skin.BLACK] = {
  100: {
    sheet: SHIP_SHEET,
    x: 408,
    y: 115,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  50: {
    sheet: SHIP_SHEET,
    x: 0,
    y: 307,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  20: {
    sheet: SHIP_SHEET,
    x: 272,
    y: 345,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
  0: {
    sheet: SHIP_SHEET,
    x: 204,
    y: 0,
    width: 66,
    height: 113,
    rotation: SHIP_SPRITE_ROTATION,
  },
};

ENTITY[EntityType.SHIP_EXPLOSION] = {
  sheet: SHIP_SHEET,
  x: 0,
  y: 0,
  width: 74,
  height: 75,
};

ENTITY[EntityType.CANNON_BALL] = {
  sheet: SHIP_SHEET,
  x: 120,
  y: 29,
  width: 10,
  height: 10,
};

ENTITY[EntityType.UPGRADED_CANNON_BALL] = {
  sheet: SHIP_SHEET,
  x: 120,
  y: 29,
  width: 10,
  height: 10,
};

ENTITY[EntityType.TREASURE] = {
  sheet: SHIP_SHEET,
  x: 567,
  y: 467,
  width: 24,
  height: 24,
};

ENTITY[EntityType.WRECK] = {
  sheet: SHIP_SHEET,
  x: 543,
  y: 315,
  width: 50,
  height: 110,
};

/** Bitmap for debugging **/
export var BITMAP: {
  ENTITY: { [id: number]: BitMap };
  TERRAIN: { [id: number]: BitMap };
} = {
  ENTITY: {},
  TERRAIN: {},
};

var entityTypes: EntityType[] = [
  EntityType.SHIP_EXPLOSION,
  EntityType.CANNON_BALL,
  EntityType.UPGRADED_CANNON_BALL,
  EntityType.TREASURE,
  EntityType.WRECK,
];

for (let t of entityTypes) {
  let map = EntityDefs[t].collisionMap;
  if (map) {
    BITMAP.ENTITY[t] = BitMap.fromHex(map);
  }
}
