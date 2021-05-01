import { rotateMatrix } from "./Util";

export class BitMap {
  /**
   * 3D array holding rotation, x, y
   */
  map: number[][][] = [];
  width: number = 0;
  height: number = 0;
  cX: number = 0; // midX
  cY: number = 0; // mid
  pX: number = 10; // padding X
  pY: number = 10; // padding Y

  constructor(map: number[][]) {
    var padding = Math.ceil(
      Math.sqrt(Math.pow(map[0].length / 2, 2) + Math.pow(map.length / 2, 2))
    );
    this.pX = padding;
    this.pY = padding;

    this.map[0] = [];
    this.width = map[0].length + this.pX * 2;
    this.height = map.length + this.pY * 2;
    this.cX = Math.floor(this.width / 2);
    this.cY = Math.floor(this.height / 2);

    for (let y = 0; y < this.height; y++) {
      this.map[0].push([]);
      for (let x = 0; x < this.width; x++) {
        if (y < this.pY || x < this.pX) {
          this.map[0][y][x] = 0;
        } else if (y >= this.height - this.pY || x >= this.width - this.pX) {
          this.map[0][y][x] = 0;
        } else {
          this.map[0][y][x] = map[y - this.pY][x - this.pX];
        }
      }
    }
  }

  /**
   * Intersection of two bitmaps based on their midpoint
   * @param b second bitmap
   * @param xDiff difference in location
   * @param yDiff difference in location
   * @param r1 rotation of bitmap 1 in degrees
   * @param r2 rotation of bitmap 2 in degrees
   * @returns true if colliding, false if not
   */
  intersects(
    b: BitMap,
    xDiff: number,
    yDiff: number,
    r1: number = 0,
    r2: number = 0
  ): boolean {
    xDiff = Math.round(xDiff);
    yDiff = Math.round(yDiff);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (
          this.get(x, y, r1) &&
          b.get(x - xDiff + (b.cX - this.cX), y - yDiff + (b.cY - this.cY), r2)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get value at x,y, with rotation d
   * @param x from top left
   * @param y from top left
   * @param d rotation in degrees
   * @returns true or false
   */
  get(x: number, y: number, d: number): boolean {
    if (!this.map[d]) {
      this.map[d] = rotateMatrix(this.map[0], d);
    }

    if (x < this.width && y < this.height && x >= 0 && y >= 0) {
      if (this.map[d][y][x] == 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * convert to string
   * @param d rotation in degrees
   * @returns html string for map
   */
  toString(d: number = 0): string {
    var output = "\n";

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.get(x, y, d)) {
          output += "■ ";
        } else {
          output += "□ ";
        }
      }
      output += "<br>";
    }
    return output;
  }

  /**
   * Convert to BitMap from encoded Hex value. Should include height and width on the end.
   * @param input
   * @returns Bitmap
   */
  static fromHex(input: string): BitMap {
    var inputArr = input.split(":");
    var hex = inputArr[0];
    var h = parseInt(inputArr[1].split(",")[0]);
    var w = parseInt(inputArr[1].split(",")[1]);
    var map: number[][] = [];

    var mapString = "";
    for (var i = 0; i < hex.length; i++) {
      mapString += ("0000" + parseInt(hex[i], 16).toString(2)).substr(-4);
    }

    for (let y = 0; y < h; y++) {
      map.push([]);
      for (let x = 0; x < w; x++) {
        map[y].push(parseInt(mapString[y * w + x]));
      }
    }

    return new BitMap(map);
  }
}
