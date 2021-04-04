import { Sprite, Spritesheet } from "./Sprites";

export class Player {
  sprite: Sprite;
  deadSprite: Sprite;
  x: number;
  y: number;
  heading: number = 90; // in degrees
  speed: number = 1;
  id: number;
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
      this.id = 0;
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

  render(ctx: CanvasRenderingContext2D, scale: number): void {
    if (this.health <= 0) {
      this.sprite = this.deadSprite;
    }

    ctx.save();
    ctx.translate(
      this.x + Math.floor(this.sprite.width / scale / 2),
      this.y + Math.floor(this.sprite.height / scale / 2)
    );
    ctx.rotate(((this.heading - 90) * Math.PI) / 180.0);

    ctx.translate(
      -(this.x + Math.floor(this.sprite.width / scale / 2)),
      -(this.y + Math.floor(this.sprite.height / scale / 2))
    );

    ctx.drawImage(
      this.sprite.sheet.img,
      this.sprite.x,
      this.sprite.y,
      this.sprite.width,
      this.sprite.height,
      this.x,
      this.y,
      Math.floor(this.sprite.width / scale),
      Math.floor(this.sprite.height / scale)
    );

    ctx.restore();
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
  id: number;
  heading: number;
  speed: number;
  health: number;
};
