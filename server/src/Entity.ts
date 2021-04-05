export class Entity {
  x: number;
  y: number;
  speed: number;
  health: number;
  id: string;
  type: string;
  heading: number;
  dead: Boolean = false;

  constructor(d: EntityInTransit) {
    this.type = d.type;
    this.x = d.x;
    this.y = d.y;
    this.id = d.id;
    this.health = d.health;
    this.speed = d.speed;
    this.heading = d.heading;
  }

  tick(): void {
    this.health--;
    if (this.health <= 0) {
      this.dead = true;
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

export type EntityInTransit = {
  type: string;
  x: number;
  y: number;
  health: number;
  id: string;
  speed: number;
  heading: number;
};
