/**
 * Game objects used in both client, server, and protocol. Usually simple defintions.
 */

import { TILE_SIZE_WITH_BUFFER } from "./GameDefs";

/**
 * Standard object that interacts with map. All players, terrains, etc.
 */
export class MapObjectDef {
  // damage upon impact
  damage: number = 0;

  /**
   * hexidemical value of impact. Width and heigh should always be tile_size
   * null if no collision is needed
   */
  collisionMap: string | null = null;
}

/**
 * Entities have health and move.
 */
export class MapEntityDef extends MapObjectDef {
  health: number = 0;
  maxSpeed: number = 0;
  maxAcceleration: number = 0;
}

/**
 * Players are controlled by computers or humans
 */
export class PlayerDef extends MapEntityDef {
  reloadTime: number = 0;
  waterResistenceFactor: number = 0;
  maxHealth: number = 0;
}

/**
 * Terrains are the terrains on the ground
 */
export class TerrainDef extends MapObjectDef {
  /**
   * id provided by Tiled.
   * Known as terrainId when used anywhere else
   */
  id: number = 0;
}

/**
 * Crew Options
 */
export enum CrewBonus {
  MORE_DAMAGE,
  MORE_HEALTH,
  FAST_BOI,
  MEDIC,
  MORE_RANGE, // TODO
  EXTRA_CANNON, // TODO
  BETTER_TRADE, // TODO
  MORE_CAPACITY, // TODO
}

/**
 * Inventory Item
 */
export enum Cargo {
  WOOD = "wood",
  CANNON_BALL = "cannon_ball",
  WHEAT = "wheat",
}

/**
 * Event types
 */
export enum EventType {
  TREASURE_FOUND,
  WRECK_FOUND,
  SHIP_DESTROYED,
  DEATH,
  SHOT_FIRED,
  DAMAGE,
  EXPLOSION,
  NEAR_MISS,
  MISS,
  UNLOAD_CARGO,
  LOAD_CARGO,
  REPAIR,
}

/**
 * Entity Types
 */
export enum EntityType {
  CANNON_BALL,
  SHIP_EXPLOSION,
  CANNON_IMPACT,
  TREASURE,
  UPGRADED_CANNON_BALL,
  WRECK,
}

/**
 * Terrain Types
 */
export enum TerrainType {
  GRASS,
  SAND,
}

/**
 * Cannon slots
 */
export enum CannonSlot {
  LEFT = 270,
  RIGHT = 90,
  FRONT = 180,
}

/**
 * Action types. The required fields in Action are specified.
 */
export enum ActionType {
  /**
   * Turn the ship.
   * @requires direction
   */
  TURN,

  /**
   * Shoot Cannons
   * @requires direction
   */
  SHOOT,

  /**
   * Sell Cargo
   * @requires cargo
   * @requires count
   */
  SELL,

  /**
   * Buy Cargo
   * @requires cargo
   * @requires count
   */
  BUY,

  /**
   * Hire Crew
   * @requires crewId
   */
  HIRE,

  /**
   * Fire Crew
   * @requires crewId
   */
  FIRE,

  /**
   * Repair Ship
   */
  REPAIR,
}

/**
 * Player Skin Types
 */
export enum Skin {
  RED,
  BLUE,
  GREEN,
  YELLOW,
  BLACK,
}

/**
 * Type to indicate price adjustments when buying and selling
 */
export type SellBuyPrice = {
  buy: number;
  sell: number;
};
