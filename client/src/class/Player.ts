import { Sprite, Spritesheet } from "./Sprites";

export class Player {
  sprite: Sprite;
  x: number;
  y: number;
  heading: number = 90; // in degrees
  speed: number = 1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.sprite = new Sprite(
      new Spritesheet("./assets/ships.png"),
      408,
      0,
      66,
      113
    );
  }

  tick() {
    this.x += this.speed * Math.cos((this.heading * Math.PI) / 180.0);
    this.y += this.speed * Math.sin((this.heading * Math.PI) / 180.0);
  }

  render(ctx: CanvasRenderingContext2D, scale: number): void {
    /* ctx.drawImage(
      this.sprite.sheet.img,
      this.sprite.x,
      this.sprite.y,
      this.sprite.width,
      this.sprite.height,
      this.x,
      this.y,
      Math.floor(this.sprite.width / scale),
      Math.floor(this.sprite.height / scale)
    );*/

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

    //ctx.rotate(-((1 * Math.PI) / 180.0));
    ctx.restore();
  }

  changeSpeed(n: number) {
    this.speed += n;

    if (this.speed > 1) {
      this.speed = 1;
    }

    if (this.speed < 0) {
      this.speed = 0;
    }
  }

  changeHeading(n: number) {
    if (this.speed > 0) {
      this.heading += n;
    }
  }
}
