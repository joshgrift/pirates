import { Map } from "./Map";
//import { World } from "./World";
import { Player } from "./Player";

export class Game {
  scale = 2;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  keys: { [id: string]: Boolean } = {};

  player: Player;

  constructor(c: HTMLCanvasElement) {
    this.canvas = c;
    this.ctx = c.getContext("2d") as CanvasRenderingContext2D; // we know we will always get a context

    this.canvas.width = window.innerWidth;
    this.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.height = window.innerHeight;

    this.player = new Player(50, 50);

    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.player.tick();

    if (this.keys["w"]) {
      this.player.changeSpeed(0.1);
    }

    if (this.keys["s"]) {
      this.player.changeSpeed(-0.1);
    }

    if (this.keys["a"]) {
      this.player.changeHeading(1);
    }

    if (this.keys["d"]) {
      this.player.changeHeading(-1);
    }

    this.player.render(this.ctx, this.scale);

    window.requestAnimationFrame(() => this.render());
  }
}
