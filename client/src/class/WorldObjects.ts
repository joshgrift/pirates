import {
  SPRITE_SHEET_HEIGHT,
  SPRITE_SHEET_WIDTH,
} from "../../../shared/GameDefs";
import {
  CrewInTransit,
  EntityInTransit,
  EntityType,
  PortInTransit,
  SellBuyPrice,
  TerrainInTransit,
} from "../../../shared/Protocol";
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

SPRITE.ENTITY[EntityType.UPGRADED_CANNON_BALL] = [
  new Sprite(SHIP_SHEET, 120, 29, 10, 10),
];
SPRITE.ENTITY[EntityType.TREASURE] = [new Sprite(SHIP_SHEET, 567, 467, 24, 24)];

SPRITE.ENTITY[EntityType.WRECK] = [new Sprite(SHIP_SHEET, 543, 315, 50, 110)];

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
  sprite: number;

  constructor(t: TerrainInTransit) {
    this.x = t.x;
    this.y = t.y;
    this.sprite = t.sprite;
  }

  render(map: Map): void {
    map.drawSprite(
      new Sprite(
        TILES_SHEET,
        (this.sprite % SPRITE_SHEET_WIDTH) * T,
        Math.floor(this.sprite / SPRITE_SHEET_HEIGHT) * T,
        T,
        T
      ),
      this.x,
      this.y,
      90
    );
  }
}

export class Port {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: number;
  store: { [id: string]: SellBuyPrice };
  crew: CrewInTransit[];

  constructor(id: string, d: PortInTransit) {
    this.id = id;
    this.name = d.name;
    this.x = d.x;
    this.y = d.y;
    this.store = d.store;
    this.crew = d.crew;
    this.sprite = d.sprite;
  }

  render(map: Map): void {
    map.drawSprite(
      new Sprite(
        TILES_SHEET,
        (this.sprite % 25) * T,
        Math.floor(this.sprite / 25) * T,
        T,
        T
      ),
      this.x,
      this.y,
      90
    );
  }

  toJSON(): PortInTransit {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      sprite: this.sprite,
      store: this.store,
      crew: this.crew,
    };
  }
}
