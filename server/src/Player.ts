import { CannonDirection, PlayerInTransit, Skin } from "./Protocol";

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

  constructor(p: playerConstructor) {
    this.id = p.id;
    this.x = p.x;
    this.y = p.y;
    this.heading = p.heading;
    this.skin = p.skin;
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

  fire() {
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
    };
  }

  kill() {
    this.dead = true;
  }
}
