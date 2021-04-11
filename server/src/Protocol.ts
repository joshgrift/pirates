/**
 * This file should stay in sync with the same file on the client. It
 * defines the communication protocol between the client and server.
 *
 * @version 0.3
 */

/**
 * Tick Speed in miliseconds
 */
export const TICK = 50;

/**
 * Package sent from Server to Client
 */
export type ServerClientPayload = {
  /**
   * Players are human controlled ships and characters.
   */
  players: PlayerInTransit[];

  /**
   * Entites are anything that interacts with players. If it doesn't, but it might, it exists as an entity.
   * Cannon balls, debree, etc.
   */
  entities: EntityInTransit[];

  /**
   * These include important game factors that do not physically interact with players.
   * Visual Explosions, shots fired sounds, notifications, death notification, etc.
   */
  events: EventsInTransit[];

  /**
   * Terrain. Ground, not ground, etc.
   */
  terrain: TerrainInTransit[];
};

/**
 * Package sent from client to server
 */
export type ClientServerPayload = {
  /**
   * Which player are you? Be honest.
   */
  id: string;

  /**
   * What's the password? Now we know if you were honest.
   */
  key: string;

  /**
   * Current acceleration in px/tick
   */
  acceleration: number;

  /**
   * Cannons firing
   */
  cannon: CannonDirection;

  /**
   * Heading in degrees cause I'm funny like that
   */
  heading: number;

  /**
   * Skin
   */
  skin: Skin;
};

/**
 * Player Data while in transit
 */
export type PlayerInTransit = {
  id: string;
  x: number;
  y: number;
  heading: number;
  speed: number;
  health: number;
  skin: Skin;
  dead: boolean;
  kills: number;
  deaths: number;
};

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
 * Entity Types
 */
export enum EntityType {
  CANNON_BALL,
  SHIP_EXPLOSION,
  CANNON_IMPACT,
}

/**
 * Entity data while in transit
 */
export type EntityInTransit = {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  speed: number;
  heading: number;
  health: number;
};

/**
 * Event data while in transit
 */
export type EventsInTransit = {
  event: EventType;
  description: string;
};

/**
 * Event Types
 */
export enum EventType {
  DEATH,
}

/**
 * Cannon direction
 */
export enum CannonDirection {
  OFF,
  LEFT = 270,
  RIGHT = 90,
}

/**
 * Terrain
 */
export type TerrainInTransit = {
  x: number;
  y: number;
  type: TerrainType;
  sprite: number;
};

/**
 * TerrainTypes
 */
export enum TerrainType {
  SAND,
  GRASS,
}
