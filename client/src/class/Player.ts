import { ids } from "webpack";
import { Map } from "./Map";
import { Sprite, Spritesheet } from "./Sprites";

export class Player {
  sprite: Sprite;
  deadSprite: Sprite;
  x: number;
  y: number;
  heading: number = 90; // in degrees
  speed: number = 1;
  id: string;
  health: number = 0;

  constructor(d: PlayerInTransit | null) {
    if (d) {
      this.id = d.id;
      this.x = d.x;
      this.y = d.y;
      this.heading = d.heading;
      this.speed = d.speed;
      this.health = d.health;
    } else {
      this.id = "none";
      this.x = 0;
      this.y = 0;
      this.heading = 0;
      this.speed = 0;
    }

    this.sprite = new Sprite(
      new Spritesheet("./assets/ships.png"),
      408,
      0,
      66,
      113
    );

    this.deadSprite = new Sprite(
      new Spritesheet("./assets/ships.png"),
      408,
      115,
      66,
      113
    );
  }

  render(map: Map): void {
    if (this.health <= 0) {
      this.sprite = this.deadSprite;
    }

    map.drawSprite(this.sprite, this.x, this.y, this.heading);
  }

  changeSpeed(n: number) {
    this.speed += n;

    if (this.speed > 2) {
      this.speed = 2;
    }

    if (this.speed < 0) {
      this.speed = 0;
    }
  }

  changeHeading(n: number) {
    if (this.speed > 0 && this.health > 0) {
      this.heading += n;
    }
  }

  toJSON(): PlayerInTransit {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      heading: this.heading,
      speed: this.speed,
      health: this.health,
    };
  }
}

export type PlayerInTransit = {
  x: number;
  y: number;
  id: string;
  heading: number;
  speed: number;
  health: number;
};
