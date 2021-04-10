import { EntityInTransit, EntityType } from "../Protocol";
import { Map } from "./Map";
import { Sprite, Spritesheet } from "./Sprites";

export class Entity {
  x: number;
  y: number;
  speed: number;
  health: number;
  id: string;
  type: EntityType;
  heading: number;
  spritesheet: Spritesheet;

  constructor(d: EntityInTransit) {
    this.type = d.type;
    this.x = d.x;
    this.y = d.y;
    this.id = d.id;
    this.health = d.health;
    this.speed = d.speed;
    this.heading = d.heading;

    this.spritesheet = new Spritesheet("./assets/ships.png");
  }

  render(map: Map): void {
    if (this.type == EntityType.SHIP_EXPLOSION) {
      map.drawSprite(
        new Sprite(map.ENTITY_SHEET, 0, 0, 74, 75),
        this.x,
        this.y,
        this.heading
      );
    } else if (this.type == EntityType.CANNON_BALL) {
      map.drawSprite(
        new Sprite(map.ENTITY_SHEET, 120, 29, 10, 10),
        this.x,
        this.y,
        this.heading
      );
    }
  }

  toJSON(): EntityInTransit {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      health: this.health,
      id: this.id,
      speed: this.speed,
      heading: this.heading,
    };
  }
}
