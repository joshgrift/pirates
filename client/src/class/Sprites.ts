export class MapRenderableEntity {
  x: number;
  y: number;
  sprite: Sprite | null = null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Spritesheet {
  img: CanvasImageSource;

  constructor(url: string) {
    this.img = new Image();
    this.img.src = url;
  }
}

export class Sprite {
  sheet: Spritesheet;
  x: number;
  y: number;
  height: number;
  width: number;
  rotation: number = 0; // offset rotation in degrees

  constructor(
    sheet: Spritesheet,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation?: number
  ) {
    this.x = x;
    this.y = y;
    this.sheet = sheet;
    this.height = height;
    this.width = width;

    if (rotation) {
      this.rotation = rotation;
    }
  }
}
