import { Player } from "./Player";
import {
  EntityInTransit,
  EntityType,
  TerrainInTransit,
  TerrainType,
} from "../../shared/Protocol";
import { MapEntity, MapObject } from "./MapObject";
import { EntityDefs, TerrainDefs } from "../../shared/GameDefs";
import { runInThisContext } from "node:vm";

type EntityConstructor = {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  speed?: number;
  heading?: number;
  owner?: Player;
};

export class Entity extends MapEntity {
  type: EntityType;
  owner: Player | null = null;

  constructor(d: EntityConstructor) {
    super({
      id: d.id,
      x: d.x,
      y: d.y,
      speed: d.speed,
      heading: d.heading,
      def: EntityDefs[d.type],
    });

    this.type = d.type;

    if (d.owner) {
      this.owner = d.owner;
    }
  }

  tick(): void {
    this.health--;
    if (this.health <= 0) {
      this.dead = true;
    }
  }

  kill() {
    this.dead = true;
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

export class Terrain extends MapObject {
  type: TerrainType;
  sprite: number;

  constructor(d: { type: TerrainType; x: number; y: number; sprite: number }) {
    super({
      id: d.x + "" + d.y,
      x: d.x,
      y: d.y,
      def: TerrainDefs[d.type],
    });

    this.type = d.type;
    this.sprite = d.sprite;
  }

  toJSON(): TerrainInTransit {
    return {
      sprite: this.sprite,
      x: this.x,
      y: this.y,
      type: this.type,
    };
  }
}
