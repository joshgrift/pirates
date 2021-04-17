import { EntityType, TerrainType } from "./Protocol";

export const TILE_SIZE: number = 32;

/** Types **/
export class MapObjectDef {
  radius: number = 0;
  damage: number = 0;
}

export class MapEntityDef extends MapObjectDef {
  health: number = 0;
  maxSpeed: number = 0;
  maxAcceleration: number = 0;
}

export class PlayerDef extends MapEntityDef {
  reloadTime: number = 0;
  waterResistenceFactor: number = 0;
}

/** Definitions **/
export let TerrainDefs: { [id: number]: MapObjectDef } = {};
TerrainDefs[TerrainType.GRASS] = {
  radius: 10,
  damage: 20,
};
TerrainDefs[TerrainType.SAND] = {
  radius: 10,
  damage: 10,
};

export let EntityDefs: { [id: number]: MapEntityDef } = {};
EntityDefs[EntityType.CANNON_BALL] = {
  radius: 10,
  damage: 10,
  health: 20,
  maxSpeed: 10,
  maxAcceleration: 0,
};
EntityDefs[EntityType.SHIP_EXPLOSION] = {
  radius: 15,
  damage: 0,
  health: 10,
  maxSpeed: 0,
  maxAcceleration: 0,
};

export const ShipDef: PlayerDef = {
  radius: 17.5,
  damage: 50,
  health: 100,
  maxSpeed: 2,
  maxAcceleration: 0.5,
  reloadTime: 1000,
  waterResistenceFactor: 0.8,
};

export const PortDef: MapObjectDef = {
  radius: 30,
  damage: 0,
};
