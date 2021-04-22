import {
  CannonDirection,
  ClientServerPayload,
  CrewMemberInTransit,
  PlayerInTransit,
  PortAction,
  Skin,
} from "../../../shared/Protocol";
import { Map } from "./Map";
import { Sprite, Spritesheet } from "./Sprites";

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
  alive: new Sprite(SHIP_SHEET, 204, 115, 66, 113),
  damaged: new Sprite(SHIP_SHEET, 0, 77, 66, 113),
  broken: new Sprite(SHIP_SHEET, 272, 230, 66, 113),
  dead: new Sprite(SHIP_SHEET, 136, 345, 66, 113),
};

SPRITE[Skin.BLUE] = {
  alive: new Sprite(SHIP_SHEET, 68, 77, 66, 113),
  damaged: new Sprite(SHIP_SHEET, 340, 230, 66, 113),
  broken: new Sprite(SHIP_SHEET, 272, 0, 66, 113),
  dead: new Sprite(SHIP_SHEET, 136, 115, 66, 113),
};

SPRITE[Skin.YELLOW] = {
  alive: new Sprite(SHIP_SHEET, 68, 307, 66, 113),
  damaged: new Sprite(SHIP_SHEET, 340, 115, 66, 113),
  broken: new Sprite(SHIP_SHEET, 204, 345, 66, 113),
  dead: new Sprite(SHIP_SHEET, 136, 0, 66, 113),
};

SPRITE[Skin.GREEN] = {
  alive: new Sprite(SHIP_SHEET, 68, 192, 66, 113),
  damaged: new Sprite(SHIP_SHEET, 340, 345, 66, 113),
  broken: new Sprite(SHIP_SHEET, 272, 115, 66, 113),
  dead: new Sprite(SHIP_SHEET, 136, 230, 66, 113),
};

SPRITE[Skin.BLACK] = {
  alive: new Sprite(SHIP_SHEET, 408, 115, 66, 113),
  damaged: new Sprite(SHIP_SHEET, 0, 307, 66, 113),
  broken: new Sprite(SHIP_SHEET, 272, 345, 66, 113),
  dead: new Sprite(SHIP_SHEET, 204, 0, 66, 113),
};

export class Player {
  readonly MAX_ACC = 0.5;
  sprite: Sprite;
  x: number;
  y: number;
  heading: number = 90; // in degrees
  speed: number = 1;
  id: string;
  health: number = 100;
  firing: boolean = false;
  cannon: CannonDirection = CannonDirection.OFF;
  acceleration: number = 0;
  skin: Skin;
  dead: boolean = false;
  kills: number = 0;
  deaths: number = 0;
  portAction: PortAction | null = null;
  inventory: { [id: string]: number } = {};
  money: number = 0;
  crew: CrewMemberInTransit[] = [];

  constructor(d: PlayerInTransit) {
    this.id = d.id;
    this.x = d.x;
    this.y = d.y;
    this.heading = d.heading;
    this.speed = d.speed;
    this.health = d.health;
    this.skin = d.skin;
    this.dead = d.dead;
    this.kills = d.kills;
    this.sprite = SPRITE[this.skin].alive;
    this.deaths = d.deaths;
    this.money = d.money;
    this.inventory = d.inventory;
    this.crew = d.crew;
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

    if (this.health <= 0 || this.dead) {
      this.sprite = SPRITE[this.skin].dead;
    }

    map.drawSprite(this.sprite, this.x, this.y, this.heading);
  }

  accelerate(n: number) {
    this.acceleration += n;

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

  toJSON(): ClientServerPayload {
    return {
      id: this.id,
      heading: this.heading,
      acceleration: this.acceleration,
      cannon: this.cannon,
      portAction: this.portAction,
    };
  }
}
