import { Sprite, Spritesheet } from "./Sprites";
import { BitMap } from "../../../shared/BitMap";

export class Map {
  DEBUG = false;
  scale = 2;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number = 600;
  height: number = 600;
  offsetWidth: number = 0;
  offsetHeight: number = 0;

  readonly ENTITY_SHEET: Spritesheet = new Spritesheet("./assets/ships.png");
  readonly TERRAIN_SHEET: Spritesheet = new Spritesheet("./assets/tiles.png");

  constructor(canvas: HTMLCanvasElement, width?: number, height?: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D; // we know we will always get a context

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setView(
    playerX: number,
    playerY: number,
    speed: number,
    angle: number,
    debug: boolean = false
  ) {
    this.offsetWidth = Math.floor(playerX - this.width / 2);
    this.offsetHeight = Math.floor(playerY - this.height / 2);
    this.DEBUG = debug;
  }

  drawSprite(
    sprite: Sprite,
    x: number,
    y: number,
    angle: number = 0,
    bitmap?: BitMap | null
  ) {
    var T = 32;
    if (
      x > this.offsetWidth - T &&
      x < this.offsetWidth + this.width + T &&
      y > this.offsetHeight - T &&
      y < this.offsetHeight + this.height + T
    ) {
      let localX = Math.floor(x) - this.offsetWidth;
      let localY = Math.floor(y) - this.offsetHeight;

      let drawX =
        Math.floor(x) -
        Math.floor(sprite.width / this.scale) / 2 -
        this.offsetWidth;
      let drawY =
        Math.floor(y) -
        Math.floor(sprite.height / this.scale) / 2 -
        this.offsetHeight;
      drawY = Math.floor(drawY);
      drawX = Math.floor(drawX);

      this.ctx.save();
      this.ctx.translate(
        drawX + Math.floor(sprite.width / this.scale / 2),
        drawY + Math.floor(sprite.height / this.scale / 2)
      );
      this.ctx.rotate(((angle + sprite.rotation) * Math.PI) / 180.0);

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

      this.ctx.restore();

      if (this.DEBUG && bitmap) {
        this.ctx.beginPath();
        for (let mapy = 0; mapy < bitmap.height; mapy++) {
          for (let mapx = 0; mapx < bitmap.width; mapx++) {
            if (bitmap.get(mapx, mapy, angle)) {
              this.ctx.lineTo(
                localX + mapx - bitmap.cX,
                localY + mapy - bitmap.cY
              );
            }
          }
        }
        this.ctx.strokeStyle = "red";
        this.ctx.stroke();
      }
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
