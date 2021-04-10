import { EntityInTransit, EntityType } from "./Protocol";

type EntityConstructor = {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  health?: number;
  speed: number;
  heading: number;
};

export class Entity {
  x: number;
  y: number;
  speed: number;
  health: number = 0;
  id: string;
  type: EntityType;
  heading: number;
  dead: Boolean = false;

  constructor(d: EntityConstructor) {
    this.type = d.type;
    this.x = d.x;
    this.y = d.y;
    this.id = d.id;

    if (d.health) {
      this.health = d.health;
    }

    this.speed = d.speed;
    this.heading = d.heading;
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
