/**
 * This is the protocol definition for communication between server and client. It should
 * be included by both server and client to keep types in sync.
 *
 * Initialize Connection: (REST)
 * -> POST /join {InitSetup}
 * <- {InitReturnPayload}
 *
 * The client sends the following every TICK to which to the server responds
 * -> {ClientServerPayload}
 * <- {ServerClientPayload}
 *
 * The types for these requests follow.
 */

import {
  ActionType,
  CannonSlot,
  Cargo,
  CrewBonus,
  EntityType,
  EventType,
  SellBuyPrice,
  Skin,
} from "./Objects";

/** Tick Speed in miliseconds */
export const TICK = 33;

/** Timeout in miliseconds */
export const TIMEOUT = 10000;

/**
 * Init payload. Sent as POST request to server at /join
 */
export type InitSetupPayload = {
  name: string;
  skin: Skin;
};

/**
 * Init payload. Returned from POST request to /join
 */
export type InitReturnPayload = {
  terrain: TerrainInTransit[];
  ports: PortInTransit[];

  /** PlayerId */
  id: string;

  /** ip address and port for server connection */
  address: string;
};

/**
 * Package sent from Server to Client
 */
export type ServerClientPayload = {
  /**
   * Information about current player
   */
  player: PlayerInTransit;

  /**
   * Ships are other players
   */
  ships: ShipInTransit[];

  /**
   * Entites are anything that probably interact with players.
   * Cannon balls, debree, etc.
   */
  entities: EntityInTransit[];

  /**
   * Events are none physical map effects like damage taken,
   * finding treasure, collecting items, etc. Usually these
   * are to inform the client for some visual response.
   */
  events: EventsInTransit[];
};

/**
 * Package sent from client to server
 */
export type ClientServerPayload = {
  /** Who are you? */
  id: string;

  /** Current acceleration in px/tick */
  acceleration: number;

  /**
   * Actions committed. This includes heading change,
   * firing cannons, selling items, hiring crew, etc.
   */
  actions: Action[];
};

/**
 * Action committed by player
 */
export type Action = {
  type: ActionType;

  /**
   * If type is HIRE or FIRE, we include a crewId
   */
  crew?: CrewInTransit;

  /**
   * Which cannon is involved
   */
  cannon?: CannonSlot;

  /**
   * Turning and firing require a direction
   */
  direction?: number;

  /**
   * CargoID if we do something related to CarGo
   */
  cargo?: Cargo;

  /**
   * If something needs a total count, we include this.
   * Such as buying cargo in build
   */
  count?: number;
};

/**
 * Ship data while in transit
 */
export type ShipInTransit = {
  id: string;
  name: string;
  x: number;
  y: number;
  heading: number;
  health: number;
  skin: Skin;
  dead: boolean;
  kills: number;
  deaths: number;
};

/**
 * Player in transit
 */
export type PlayerInTransit = {
  id: string;
  name: string;
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
  crew: CrewInTransit[];
};

/**
 * Event. Can store more information about the event type
 */
export type EventsInTransit = {
  type: EventType;
};

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
 * Terrain
 */
export type TerrainInTransit = {
  x: number;
  y: number;

  /**
   * Image and collision map defintion
   */
  terrainId: number;
};

/**
 * Ports
 */

export type PortInTransit = {
  name: string;
  x: number;
  y: number;

  /**
   * Image and collision map defintion
   */
  terrainId: number;

  /**
   * sell and buy options
   */
  store: { [id: string]: SellBuyPrice };

  /**
   * Crew hiring options
   */
  crew: CrewInTransit[];
};

/**
 * Crew Member in Transit
 */
export type CrewInTransit = {
  id: string;
  name: string;
  bonus: CrewBonus;
  description: string;
  cost: number;
  sprite: string;
};
