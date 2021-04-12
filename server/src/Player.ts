import { PlayerDef, ShipDef } from "../../shared/GameDefs";
import {
  CannonDirection,
  ClientServerPayload,
  PlayerInTransit,
  Skin,
  TerrainInTransit,
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

  constructor(p: playerConstructor) {
    super({
      id: p.id,
      x: p.x,
      y: p.y,
      def: ShipDef,
    });

    this.def = ShipDef;

    this.skin = p.skin;
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
    }
  }

  applyWaterEffect() {
    this.speed *= this.def.waterResistenceFactor;
  }

  canFire(): boolean {
    return (
      (this.cannon == CannonDirection.LEFT &&
        Date.now() - this.last_fired_left >= this.def.reloadTime) ||
      (this.cannon == CannonDirection.RIGHT &&
        Date.now() - this.last_fired_right >= this.def.reloadTime)
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
    };
  }
}
