import { BitMap } from "../../../shared/BitMap";
import { DefaultTerrainDef, TerrainDefs } from "../../../shared/GameDefs";
import { EntityType, SellBuyPrice } from "../../../shared/Objects";
import {
  CrewInTransit,
  EntityInTransit,
  PortInTransit,
  TerrainInTransit,
} from "../../../shared/Protocol";
import { ENTITY, BITMAP, TERRAIN } from "../sprites";
import { Map, Spritesheet } from "./Map";

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
    map.drawSprite(
      ENTITY[this.type],
      this.x,
      this.y,
      this.heading,
      BITMAP.ENTITY[this.type]
    );
  }
}

export class Terrain {
  x: number;
  y: number;
  sprite: number;
  bitmap: BitMap | null = null;

  constructor(t: TerrainInTransit) {
    this.x = t.x;
    this.y = t.y;
    this.sprite = t.terrainId;

    if (TerrainDefs[this.sprite]) {
      var map =
        TerrainDefs[this.sprite].collisionMap || DefaultTerrainDef.collisionMap;
      if (map) {
        this.bitmap = BitMap.fromHex(map);
      }
    }
  }

  render(map: Map): void {
    map.drawSprite(TERRAIN(this.sprite), this.x, this.y, 0, this.bitmap);
  }
}

export class Port {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: number;
  store: { [id: string]: SellBuyPrice };
  crew: CrewInTransit[];

  constructor(id: string, d: PortInTransit) {
    this.id = id;
    this.name = d.name;
    this.x = d.x;
    this.y = d.y;
    this.store = d.store;
    this.crew = d.crew;
    this.sprite = d.terrainId;
  }

  render(map: Map): void {
    map.drawSprite(TERRAIN(this.sprite), this.x, this.y, 90);
  }
}
