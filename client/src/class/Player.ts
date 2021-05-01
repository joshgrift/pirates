import { BitMap } from "../../../shared/BitMap";
import { ShipDef } from "../../../shared/GameDefs";
import { Skin } from "../../../shared/Objects";
import {
  Action,
  ClientServerPayload,
  CrewInTransit,
  PlayerInTransit,
  ShipInTransit,
} from "../../../shared/Protocol";
import { Map } from "./Map";
import { Sprite, Spritesheet } from "./Sprites";

if (ShipDef.collisionMap) {
  var ShipCollisionMap = BitMap.fromHex(ShipDef.collisionMap);
}

var SHIP_SPRITE_ROTATION = -90;
var SHIP_SHEET = new Spritesheet("./assets/ships.png");

var SPRITE: {
  [id: number]: {
    alive: Sprite;
    damaged: Sprite;
    broken: Sprite;
    dead: Sprite;
  };
} = {};

SPRITE[Skin.RED] = {
  alive: new Sprite(SHIP_SHEET, 204, 115, 66, 113, SHIP_SPRITE_ROTATION),
  damaged: new Sprite(SHIP_SHEET, 0, 77, 66, 113, SHIP_SPRITE_ROTATION),
  broken: new Sprite(SHIP_SHEET, 272, 230, 66, 113, SHIP_SPRITE_ROTATION),
  dead: new Sprite(SHIP_SHEET, 136, 345, 66, 113, SHIP_SPRITE_ROTATION),
};

SPRITE[Skin.BLUE] = {
  alive: new Sprite(SHIP_SHEET, 68, 77, 66, 113, SHIP_SPRITE_ROTATION),
  damaged: new Sprite(SHIP_SHEET, 340, 230, 66, 113, SHIP_SPRITE_ROTATION),
  broken: new Sprite(SHIP_SHEET, 272, 0, 66, 113, SHIP_SPRITE_ROTATION),
  dead: new Sprite(SHIP_SHEET, 136, 115, 66, 113, SHIP_SPRITE_ROTATION),
};

SPRITE[Skin.YELLOW] = {
  alive: new Sprite(SHIP_SHEET, 68, 307, 66, 113, SHIP_SPRITE_ROTATION),
  damaged: new Sprite(SHIP_SHEET, 340, 115, 66, 113, SHIP_SPRITE_ROTATION),
  broken: new Sprite(SHIP_SHEET, 204, 345, 66, 113, SHIP_SPRITE_ROTATION),
  dead: new Sprite(SHIP_SHEET, 136, 0, 66, 113, SHIP_SPRITE_ROTATION),
};

SPRITE[Skin.GREEN] = {
  alive: new Sprite(SHIP_SHEET, 68, 192, 66, 113, SHIP_SPRITE_ROTATION),
  damaged: new Sprite(SHIP_SHEET, 340, 345, 66, 113, SHIP_SPRITE_ROTATION),
  broken: new Sprite(SHIP_SHEET, 272, 115, 66, 113, SHIP_SPRITE_ROTATION),
  dead: new Sprite(SHIP_SHEET, 136, 230, 66, 113, SHIP_SPRITE_ROTATION),
};

SPRITE[Skin.BLACK] = {
  alive: new Sprite(SHIP_SHEET, 408, 115, 66, 113, SHIP_SPRITE_ROTATION),
  damaged: new Sprite(SHIP_SHEET, 0, 307, 66, 113, SHIP_SPRITE_ROTATION),
  broken: new Sprite(SHIP_SHEET, 272, 345, 66, 113, SHIP_SPRITE_ROTATION),
  dead: new Sprite(SHIP_SHEET, 204, 0, 66, 113, SHIP_SPRITE_ROTATION),
};

export class Ship {
  id: string;
  name: string;
  skin: Skin;

  x: number;
  y: number;

  heading: number = 90; // in degrees
  health: number = 100;

  dead: boolean;
  kills: number;
  deaths: number;

  sprite: Sprite;

  constructor(d: ShipInTransit) {
    this.id = d.id;
    this.name = d.name;
    this.skin = d.skin;
    this.x = d.x;
    this.y = d.y;
    this.heading = d.heading;
    this.health = d.health;
    this.dead = d.dead;
    this.kills = d.kills;
    this.deaths = d.deaths;

    this.sprite = this.sprite = SPRITE[this.skin].alive;
  }

  render(map: Map): void {
    if (this.health > 50) {
      this.sprite = SPRITE[this.skin].alive;
    }

    if (this.health <= 50) {
      this.sprite = SPRITE[this.skin].damaged;
    }

    if (this.health <= 20) {
      this.sprite = SPRITE[this.skin].broken;
    }

    if (this.dead) {
      this.sprite = SPRITE[this.skin].dead;
    }

    map.drawSprite(this.sprite, this.x, this.y, this.heading, ShipCollisionMap);
  }
}

export class Player extends Ship {
  readonly MAX_ACC = 0.5;
  speed: number = 1;
  money: number = 0;
  acceleration: number = 0;
  inventory: { [id: string]: number } = {};
  crew: CrewInTransit[] = [];
  actions: Action[] = [];

  constructor(d: PlayerInTransit) {
    super({
      id: d.id,
      name: d.name,
      skin: d.skin,
      x: d.x,
      y: d.y,
      heading: d.heading,
      health: d.health,
      dead: d.dead,
      kills: d.kills,
      deaths: d.deaths,
    });

    this.money = d.money;
    this.inventory = d.inventory;
    this.crew = d.crew;
    this.name = d.name;
  }

  accelerate(n: number) {
    this.acceleration += n % 30;

    if (this.acceleration > this.MAX_ACC) {
      this.acceleration = this.MAX_ACC;
    }

    if (this.acceleration < 0) {
      this.acceleration = 0;
    }
  }

  changeHeading(n: number) {
    if (this.speed >= 0.1 && this.health > 0) {
      this.heading += n;
    }
  }

  update(p: PlayerInTransit) {
    this.dead = p.dead;
    this.x = p.x;
    this.y = p.y;
    this.heading = p.heading;
    this.speed = p.speed;
    this.health = p.health;
    this.kills = p.kills;
    this.deaths = p.deaths;
    this.money = p.money;
    this.inventory = p.inventory;
    this.crew = p.crew;
  }

  toJSON(): ClientServerPayload {
    return {
      id: this.id,
      acceleration: this.acceleration,
      actions: this.actions,
    };
  }
}
