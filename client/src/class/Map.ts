import { Sprite, Spritesheet } from "./Sprites";

const DEBUG = false;

export class Map {
  scale = 2;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number = 600;
  height: number = 600;

  readonly ENTITY_SHEET: Spritesheet = new Spritesheet("./assets/ships.png");
  readonly TERRAIN_SHEET: Spritesheet = new Spritesheet("./assets/tiles.png");

  constructor(canvas: HTMLCanvasElement, width?: number, height?: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D; // we know we will always get a context

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  drawSprite(sprite: Sprite, x: number, y: number, heading: number = 0) {
    let drawX = x - Math.floor(sprite.width / this.scale) / 2;
    let drawY = y - Math.floor(sprite.height / this.scale) / 2;
    this.ctx.save();
    this.ctx.translate(
      drawX + Math.floor(sprite.width / this.scale / 2),
      drawY + Math.floor(sprite.height / this.scale / 2)
    );
    this.ctx.rotate(((heading - 90) * Math.PI) / 180.0);

    this.ctx.translate(
      -(drawX + Math.floor(sprite.width / this.scale / 2)),
      -(drawY + Math.floor(sprite.height / this.scale / 2))
    );

    this.ctx.drawImage(
      sprite.sheet.img,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      drawX,
      drawY,
      Math.floor(sprite.width / this.scale),
      Math.floor(sprite.height / this.scale)
    );

    if (DEBUG) {
      this.ctx.strokeStyle = "red";
      this.ctx.beginPath();
      this.ctx.arc(x, y, 35 / 2, 0, 2 * Math.PI);
      this.ctx.stroke();

      this.ctx.fillStyle = "black";
      this.ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    this.ctx.restore();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
