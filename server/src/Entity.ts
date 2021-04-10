import { Player } from "./Player";
import { EntityInTransit, EntityType } from "./Protocol";

type EntityConstructor = {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  health?: number;
  speed: number;
  heading: number;
  damage?: number;
  owner?: Player;
};

export class Entity {
  x: number;
  y: number;
  speed: number;
  health: number = 0;
  id: string;
  type: EntityType;
  heading: number;
  damage: number = 0;
  dead: Boolean = false;
  radius: number = 4;
  owner: Player | null = null;

  constructor(d: EntityConstructor) {
    this.type = d.type;
    this.x = d.x;
    this.y = d.y;
    this.id = d.id;

    if (d.health) {
      this.health = d.health;
    }

    if (d.owner) {
      this.owner = d.owner;
    }

    if (d.damage) {
      this.damage = d.damage;
    }

    this.speed = d.speed;
    this.heading = d.heading;
  }

  collisionWith(p: Player): boolean {
    if (!p.dead) {
      let distance = Math.sqrt(
        Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2)
      );

      if (distance <= p.RADIUS + this.radius && this.health < 15) {
        return true;
      }
    }

    return false;
  }

  tick(): void {
    this.health--;
    if (this.health <= 0) {
      this.dead = true;
    }

    if (this.health > 0) {
      this.x += this.speed * Math.cos((this.heading * Math.PI) / 180.0);
      this.y += this.speed * Math.sin((this.heading * Math.PI) / 180.0);
    }
  }

  kill() {
    this.dead = true;
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
