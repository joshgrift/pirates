import {
  CannonDirection,
  ClientServerPayload,
  PlayerInTransit,
  Skin,
} from "../Protocol";
import { Map } from "./Map";
import { Sprite, Spritesheet } from "./Sprites";

export class Player {
  readonly MAX_ACC = 0.5;
  sprite: Sprite;
  deadSprite: Sprite;
  x: number;
  y: number;
  heading: number = 90; // in degrees
  speed: number = 1;
  id: string;
  health: number = 100;
  firing: boolean = false;
  cannon: CannonDirection = CannonDirection.OFF;
  acceleration: number = 0;
  skin: Skin;
  dead: boolean = false;

  constructor(d: PlayerInTransit) {
    this.id = d.id;
    this.x = d.x;
    this.y = d.y;
    this.heading = d.heading;
    this.speed = d.speed;
    this.health = d.health;
    this.skin = d.skin;
    this.dead = d.dead;

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
    if (this.health <= 0 || this.dead) {
      this.sprite = this.deadSprite;
    }

    map.drawSprite(this.sprite, this.x, this.y, this.heading);
  }

  accelerate(n: number) {
    this.acceleration += n;

    if (this.acceleration > this.MAX_ACC) {
      this.acceleration = this.MAX_ACC;
    }

    if (this.acceleration < 0) {
      this.acceleration = 0;
    }
  }

  changeHeading(n: number) {
    if (this.speed > 0 && this.health > 0) {
      this.heading += n;
    }
  }

  toJSON(): ClientServerPayload {
    return {
      id: this.id,
      heading: this.heading,
      acceleration: this.acceleration,
      cannon: this.cannon,
      key: "password",
    };
  }
}
