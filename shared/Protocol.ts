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
 * Timeout in miliseconds
 */
export const TIMEOUT = 10000;

/**
 * Respawn delay
 */
export const RESPAWN_DELAY = 5000;

/**
 * Init payload. Sent as POST request to server at /join
 */
export type InitSetupPayload = {
  /**
   * What do you wish to be called?
   */
  name: string;

  /**
   * Skin
   */
  skin: Skin;
};

/**
 * Init payload. Returned from POST request to /join
 */
export type InitReturnPayload = {
  /**
   * Terrain. Ground, not ground, etc.
   */
  terrain: TerrainInTransit[];

  /**
   * Ports.
   */
  ports: PortInTransit[];

  /**
   * PlayerId
   */
  id: string;

  /**
   * ip address and port for server connection
   */
  address: string;
};

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
   * port action. Buy, sell, hire, fire, repair, etc.
   */
  portAction: PortAction | null;
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
  money: number;
  inventory: { [id: string]: number };
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

/**
 * Ports
 */

export type PortInTransit = {
  /**
   * It's the name of the port. Comon' man, it's not that hard.
   */
  name: string;

  /**
   * x position on the world map
   */
  x: number;

  /**
   * y position on the world map
   */
  y: number;

  /**
   * sprite location
   */
  sprite: number;

  /**
   * sell and buy options
   */
  store: { [id: string]: SellBuyPrice };

  /**
   * Crew hiring options
   */
  crew: CrewMemberInTransit[];
};

/**
 * Inventory Item
 */
export enum Cargo {
  WOOD = "wood",
  CANNON_BALL = "cannon_ball",
  WHEAT = "wheat",
}

/**
 * Crew Options
 */
export enum CrewBonus {
  EXTRA_CANNON,
  MORE_DAMAGE,
  MORE_HEALTH,
  MORE_CAPACITY,
  FAST_BOI,
  MORE_ACCELERATION,
  BETTER_TRADE,
  MEDIC,
  MORE_RANGE,
}

/**
 * Crew member in transit
 */
export type CrewMemberInTransit = {
  name: string;
  bonus: CrewBonus;
  cost: number;
};

/**
 * Type to indicate price adjustments when buying and selling
 */
export type SellBuyPrice = {
  buy: number;
  sell: number;
};

/**
 * Port action types
 */
export enum PortActionType {
  SELL,
  BUY,
  HIRE,
  FIRE,
  REPAIR,
}

/**
 * Actions at poort
 */
export type PortAction = {
  type: PortActionType;
  cargo?: Cargo;
  crew?: CrewMemberInTransit;
};
