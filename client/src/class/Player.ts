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
import { SHIP } from "../sprites";
import { Map, Sprite } from "./Map";

if (ShipDef.collisionMap) {
  var ShipCollisionMap = BitMap.fromHex(ShipDef.collisionMap);
}

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

    this.sprite = this.sprite = SHIP[0][this.skin][100];
  }

  render(map: Map): void {
    if (this.health > 50) {
      this.sprite = SHIP[0][this.skin][100];
    }

    if (this.health <= 50) {
      this.sprite = SHIP[0][this.skin][50];
    }

    if (this.health <= 20) {
      this.sprite = SHIP[0][this.skin][20];
    }

    if (this.dead) {
      this.sprite = SHIP[0][this.skin][0];
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
