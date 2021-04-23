import {
  PlayerDef,
  RESPAWN_DELAY,
  ShipDef,
  STARTING_CANNON_BALLS,
  STARTING_MONEY,
} from "../../shared/GameDefs";
import {
  ClientServerPayload,
  PlayerInTransit,
  Skin,
  Cargo,
  ShipInTransit,
  Action,
  CrewInTransit,
  TIMEOUT,
  CannonSlot,
} from "../../shared/Protocol";
import { Collection } from "./Collection";
import { MapEntity } from "./MapObject";

type playerConstructor = {
  id: string;
  x: number;
  y: number;
  skin: Skin;
  name: string;
};

export class Player extends MapEntity {
  skin: Skin;
  name: string;

  last_ping_time: number = 0;
  death_time: number = 0;
  kills: number = 0;
  deaths: number = 0;
  money: number = STARTING_MONEY;

  def: PlayerDef;

  inventory: { [id: string]: number } = {};
  cannons: { [id: number]: Cannon } = {};

  crew: Collection<CrewInTransit> = new Collection();
  actions: Action[] = [];

  constructor(p: playerConstructor) {
    super({
      id: p.id,
      x: p.x,
      y: p.y,
      def: ShipDef,
    });

    this.def = ShipDef;
    this.skin = p.skin;
    this.name = p.name;
    this.last_ping_time = Date.now();
    this.cannons[CannonSlot.LEFT] = {
      slot: CannonSlot.LEFT,
      lastFireTime: 0,
    };

    this.cannons[CannonSlot.RIGHT] = {
      slot: CannonSlot.RIGHT,
      lastFireTime: 0,
    };
  }

  update(p: ClientServerPayload) {
    this.last_ping_time = Date.now();
    this.acceleration = p.acceleration;
    this.actions = p.actions;
  }

  applyWaterEffect() {
    this.speed *= this.def.waterResistenceFactor;
  }

  canFire(slot: CannonSlot): boolean {
    return (
      Date.now() - this.cannons[slot].lastFireTime >= this.def.reloadTime &&
      this.inventory[Cargo.CANNON_BALL] > 0
    );
  }

  fire(slot: CannonSlot) {
    this.cannons[slot].lastFireTime = Date.now();
    this.inventory[Cargo.CANNON_BALL]--;
  }

  kill() {
    this.dead = true;
    this.deaths++;
    this.death_time = Date.now();
  }

  respawn(x: number, y: number) {
    this.death_time = 0;
    this.dead = false;
    this.health = 100;
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.money = STARTING_MONEY;
    this.inventory = {};
    this.inventory[Cargo.CANNON_BALL] = STARTING_CANNON_BALLS;
  }

  /**
   * has this player timed out?
   */
  timedOut(): boolean {
    return Date.now() - this.last_ping_time > TIMEOUT;
  }

  /**
   * can the player respawn yet?
   * @returns
   */
  canRespawn(): boolean {
    return Date.now() - this.death_time > RESPAWN_DELAY;
  }

  /**
   * Adjust heading by i
   * @param i
   */
  changeHeading(i: number) {
    this.heading = (this.heading + i) % 360;
  }

  /**
   * Export Player as PlayerInTransit
   * @returns
   */
  exportAsPlayer(): PlayerInTransit {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      id: this.id,
      heading: this.heading,
      speed: this.speed,
      health: this.health,
      skin: this.skin,
      dead: this.dead,
      kills: this.kills,
      deaths: this.deaths,
      money: this.money,
      inventory: this.inventory,
      crew: this.crew.toJSON(),
    };
  }

  /**
   * Export Player as Ship
   * @returns
   */
  toJSON(): ShipInTransit {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      id: this.id,
      heading: this.heading,
      health: this.health,
      skin: this.skin,
      dead: this.dead,
      kills: this.kills,
      deaths: this.deaths,
    };
  }
}

type Cannon = {
  slot: CannonSlot;
  lastFireTime: number;
};
