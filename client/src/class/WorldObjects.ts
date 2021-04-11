import {
  EntityInTransit,
  EntityType,
  TerrainInTransit,
  TerrainType,
} from "../Protocol";
import { Map } from "./Map";
import { Sprite, Spritesheet } from "./Sprites";

var T = 64;

var SHIP_SHEET = new Spritesheet("./assets/ships.png");
var TILES_SHEET = new Spritesheet("./assets/tiles.png");

var SPRITE: {
  ENTITY: { [id: number]: Sprite[] };
  TERRAIN: { [id: number]: Sprite[] };
} = {
  ENTITY: {},
  TERRAIN: {},
};

SPRITE.ENTITY[EntityType.SHIP_EXPLOSION] = [
  new Sprite(SHIP_SHEET, 0, 0, 74, 75),
];

SPRITE.ENTITY[EntityType.CANNON_BALL] = [
  new Sprite(SHIP_SHEET, 120, 29, 10, 10),
];

SPRITE.TERRAIN[TerrainType.SAND] = [
  new Sprite(TILES_SHEET, 3 * T, 4 * T, T, T),
];

SPRITE.TERRAIN[TerrainType.GRASS] = [
  new Sprite(TILES_SHEET, 6 * T, 1 * T, T, T),
];

export class Entity {
  x: number;
  y: number;
  speed: number;
  health: number;
  id: string;
  type: EntityType;
  heading: number;
  spritesheet: Spritesheet;

  constructor(d: EntityInTransit) {
    this.type = d.type;
    this.x = d.x;
    this.y = d.y;
    this.id = d.id;
    this.health = d.health;
    this.speed = d.speed;
    this.heading = d.heading;

    this.spritesheet = new Spritesheet("./assets/ships.png");
  }

  render(map: Map): void {
    map.drawSprite(SPRITE.ENTITY[this.type][0], this.x, this.y, this.heading);
  }

  toJSON(): EntityInTransit {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      health: this.health,
      id: this.id,
      speed: this.speed,
      heading: this.heading,
    };
  }
}

export class Terrain {
  x: number;
  y: number;
  type: TerrainType;

  constructor(t: TerrainInTransit) {
    this.x = t.x;
    this.y = t.y;
    this.type = t.type;
  }

  render(map: Map): void {
    map.drawSprite(SPRITE.TERRAIN[this.type][0], this.x, this.y, 0);
  }
}
