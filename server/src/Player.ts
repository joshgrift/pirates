import {
  PlayerDef,
  ShipDef,
  STARTING_CANNON_BALLS,
} from "../../shared/GameDefs";
import {
  CannonDirection,
  ClientServerPayload,
  PlayerInTransit,
  PortAction,
  Skin,
  Cargo,
  CrewMemberInTransit,
} from "../../shared/Protocol";
import { MapEntity } from "./MapObject";

type playerConstructor = {
  id: string;
  x: number;
  y: number;
  skin: Skin;
};

export class Player extends MapEntity {
  skin: Skin;
  cannon: CannonDirection = CannonDirection.OFF;
  last_fired_left: number = 0;
  last_fired_right: number = 0;
  last_ping_time: number = 0;
  death_time: number = 0;
  kills: number = 0;
  deaths: number = 0;
  def: PlayerDef;
  portAction: PortAction | null = null;
  inventory: { [id: string]: number } = {};
  money: number = 0;
  crew: CrewMemberInTransit[] = [];

  constructor(p: playerConstructor) {
    super({
      id: p.id,
      x: p.x,
      y: p.y,
      def: ShipDef,
    });

    this.def = ShipDef;
    this.skin = p.skin;
    this.last_ping_time = Date.now();
  }

  update(p: ClientServerPayload) {
    this.last_ping_time = Date.now();

    if (!this.dead) {
      this.heading = p.heading;

      if (this.heading >= 360) {
        this.heading = this.heading % 360;
      }

      if (this.heading <= -360) {
        this.heading = this.heading % 360;
      }

      this.cannon = p.cannon;
      this.acceleration = p.acceleration;
      this.portAction = p.portAction;
    }
  }

  applyWaterEffect() {
    this.speed *= this.def.waterResistenceFactor;
  }

  canFire(): boolean {
    return (
      ((this.cannon == CannonDirection.LEFT &&
        Date.now() - this.last_fired_left >= this.def.reloadTime) ||
        (this.cannon == CannonDirection.RIGHT &&
          Date.now() - this.last_fired_right >= this.def.reloadTime)) &&
      this.inventory[Cargo.CANNON_BALL] > 0
    );
  }

  fire() {
    if (this.cannon == CannonDirection.RIGHT) {
      this.last_fired_right = Date.now();
    }

    if (this.cannon == CannonDirection.LEFT) {
      this.last_fired_left = Date.now();
    }

    this.cannon = CannonDirection.OFF;
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
    this.money = 0;
    this.inventory = {};
    this.inventory[Cargo.CANNON_BALL] = STARTING_CANNON_BALLS;
  }

  toJSON(): PlayerInTransit {
    return {
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
      crew: this.crew,
    };
  }
}
