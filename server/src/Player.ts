export type PlayerInTransit = {
  x: number;
  y: number;
  id: string;
  heading: number;
  speed: number;
  health: number;
};

export class Player {
  x: number;
  y: number;
  id: string;
  heading: number;
  speed: number;
  health: number;
  dead: Boolean = false;

  constructor(p: PlayerInTransit) {
    this.x = p.x;
    this.y = p.y;
    this.id = p.id;
    this.heading = p.heading;
    this.speed = p.speed;
    this.health = p.health;
  }

  tick() {
    if (this.health > 0) {
      this.x += this.speed * Math.cos((this.heading * Math.PI) / 180.0);
      this.y += this.speed * Math.sin((this.heading * Math.PI) / 180.0);
    }
  }

  toJSON(): PlayerInTransit {
    return {
      x: this.x,
      y: this.y,
      id: this.id,
      heading: this.heading,
      speed: this.speed,
      health: this.health,
    };
  }

  kill() {
    this.dead = true;
  }
}
