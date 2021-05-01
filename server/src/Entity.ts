import { Player } from "./Player";
import { EntityInTransit, TerrainInTransit } from "../../shared/Protocol";
import { MapEntity, MapObject } from "./MapObject";
import {
  DefaultTerrainDef,
  EntityDefs,
  TerrainDefs,
} from "../../shared/GameDefs";
import { EntityType } from "../../shared/Objects";

type EntityConstructor = {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  speed?: number;
  angle?: number;
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
      angle: d.angle || 0,
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
      heading: this.angle,
    };
  }
}

export class Terrain extends MapObject {
  terrainId: number;

  constructor(d: TerrainInTransit) {
    let def = DefaultTerrainDef;
    if (TerrainDefs[d.terrainId]) {
      def = TerrainDefs[d.terrainId];
    }

    super({
      id: d.x + "" + d.y,
      x: d.x,
      y: d.y,
      angle: 0,
      def: def,
    });

    this.terrainId = d.terrainId;
  }

  toJSON(): TerrainInTransit {
    return {
      terrainId: this.terrainId,
      x: this.x,
      y: this.y,
    };
  }
}
