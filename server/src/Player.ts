import { HighlightSpanKind } from "typescript";
import {
  CannonDirection,
  ClientServerPayload,
  PlayerInTransit,
  Skin,
} from "./Protocol";

type playerConstructor = {
  id: string;
  x: number;
  y: number;
  heading: number;
  skin: Skin;
};

export class Player {
  readonly MAX_SPEED: number = 100;
  readonly RADIUS: number = 17.5;
  readonly WATER_BOI: number = 0.8;
  readonly MAX_ACC: number = 0.5;
  readonly LOAD_TIME: number = 1000;
  x: number;
  y: number;
  id: string;
  heading: number;
  speed: number = 0;
  acceleration: number = 0;
  health: number = 100;
  skin: Skin;
  dead: boolean = false;
  cannon: CannonDirection = CannonDirection.OFF;
  last_fired_left: number = 0;
  last_fired_right: number = 0;
  last_ping_time: number = 0;
  death_time: number = 0;
  kills: number = 0;
  deaths: number = 0;

  constructor(p: playerConstructor) {
    this.id = p.id;
    this.x = p.x;
    this.y = p.y;
    this.heading = p.heading;
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

  move() {
    if (this.health > 0) {
      this.x += this.speed * Math.cos((this.heading * Math.PI) / 180.0);
      this.y += this.speed * Math.sin((this.heading * Math.PI) / 180.0);
    }
  }

  collidingWith(p: Player): boolean {
    if (p.id != this.id) {
      let distance = Math.sqrt(
        Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2)
      );

      if (distance <= this.RADIUS * 2) {
        return true;
      }
    }

    return false;
  }

  applyAcceleration() {
    if (this.acceleration > this.MAX_ACC) {
      this.acceleration = this.MAX_ACC;
    }

    this.speed += this.acceleration;
    this.speed *= this.WATER_BOI;

    if (this.speed > this.MAX_SPEED) {
      this.speed = this.MAX_SPEED;
    }

    if (this.speed < 0) {
      this.speed = 0;
    }
  }

  canFire(): boolean {
    return (
      (this.cannon == CannonDirection.LEFT &&
        Date.now() - this.last_fired_left >= this.LOAD_TIME) ||
      (this.cannon == CannonDirection.RIGHT &&
        Date.now() - this.last_fired_right >= this.LOAD_TIME)
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

  damage(n: number) {
    this.health += n;

    if (this.health <= 0) {
      this.kill();
    }
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
}
