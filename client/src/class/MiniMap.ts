import { TILE_SIZE } from "../../../shared/GameDefs";
import { Player, Ship } from "./Player";
import { Port, Terrain } from "./WorldObjects";

export class Minimap {
  ctx: CanvasRenderingContext2D;
  terrain: Terrain[];
  T = 5;

  constructor(c: HTMLCanvasElement, terrain: Terrain[]) {
    this.ctx = c.getContext("2d") as CanvasRenderingContext2D; // we know we will always get a context
    this.terrain = terrain;
  }

  render(ships: Ship[], player: Player, ports: Port[]) {
    this.ctx.clearRect(0, 0, 100 * this.T, 100 * this.T);
    this.ctx.fillStyle = "#968d4b";

    for (let t of this.terrain) {
      this.ctx.fillRect(
        Math.floor(t.x / TILE_SIZE) * this.T,
        Math.floor(t.y / TILE_SIZE) * this.T,
        this.T,
        this.T
      );
    }

    this.ctx.fillStyle = "#3c62a8";
    for (let port of ports) {
      this.ctx.fillRect(
        Math.floor(port.x / TILE_SIZE) * this.T - 1,
        Math.floor(port.y / TILE_SIZE) * this.T - 1,
        this.T + 2,
        this.T + 2
      );
    }

    this.ctx.fillStyle = "#3ca84a";
    this.ctx.fillRect(
      Math.floor(player.x / TILE_SIZE) * this.T - 2,
      Math.floor(player.y / TILE_SIZE) * this.T - 2,
      this.T + 4,
      this.T + 4
    );
  }
}
