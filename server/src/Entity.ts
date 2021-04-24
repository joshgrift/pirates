import { Player } from "./Player";
import {
  EntityInTransit,
  EntityType,
  TerrainInTransit,
} from "../../shared/Protocol";
import { MapEntity, MapObject } from "./MapObject";
import { EntityDefs, TerrainDef } from "../../shared/GameDefs";

type EntityConstructor = {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  speed?: number;
  heading?: number;
  owner?: Player;
  reward?: { [id: string]: number };
};

export class Entity extends MapEntity {
  type: EntityType;
  owner: Player | null = null;
  reward: { [id: string]: number } = {};

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

    if (d.reward) {
      this.reward = d.reward;
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
  sprite: number;

  constructor(d: TerrainInTransit) {
    super({
      id: d.x + "" + d.y,
      x: d.x,
      y: d.y,
      def: TerrainDef,
    });

    this.sprite = d.sprite;
  }

  toJSON(): TerrainInTransit {
    return {
      sprite: this.sprite,
      x: this.x,
      y: this.y,
    };
  }
}
