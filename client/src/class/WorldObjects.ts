import { Sprite, MapRenderableEntity } from "./Sprites";
import { Blueprint } from "./Blueprints";

export class WorldObject {
  blueprint: Blueprint;
  x: number;
  y: number;

  constructor(blueprint: Blueprint, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.blueprint = blueprint;
  }

  render(ctx: CanvasRenderingContext2D): void {}
}

export class Terrain extends WorldObject {}

export class Structure extends WorldObject {}

export class Entity extends WorldObject {}

export class PlayerEntity extends WorldObject {}
