import { distance } from "../../shared/Util";
import { PortDef } from "../../shared/GameDefs";
import { CrewInTransit, PortInTransit } from "../../shared/Protocol";
import { MapEntityDef, MapObjectDef, SellBuyPrice } from "../../shared/Objects";
import { BitMap } from "../../shared/BitMap";

export class MapObject {
  id: string;
  x: number;
  y: number;
  def: MapObjectDef;
  angle: number; // angle in degrees
  bitMap: BitMap | null = null;

  constructor(d: {
    id: string;
    x: number;
    y: number;
    angle: number;
    def: MapObjectDef;
  }) {
    this.id = d.id;
    this.x = d.x;
    this.y = d.y;
    this.def = d.def;
    this.angle = d.angle;

    if (this.def.collisionMap) {
      this.bitMap = BitMap.fromHex(this.def.collisionMap);
    }
  }

  collidingWith(o: MapObject) {
    if (this.id == o.id) {
      return false;
    }

    // these objects shouldn't collide
    if (this.bitMap == null || o.bitMap == null) {
      return false;
    }

    // if we're over 200 pixels away, we probably aren't colliding
    if (distance(this.x, this.y, o.x, o.y) > 200) {
      // TODO: make this a value determined by the bitmap
      return false;
    }

    return this.bitMap.intersects(
      o.bitMap,
      o.x - this.x,
      o.y - this.y,
      this.angle,
      o.angle
    );
  }
}

export class MapEntity extends MapObject {
  dead: boolean = false;
  health: number;
  speed: number = 0;
  acceleration: number = 0;
  def: MapEntityDef;

  constructor(d: {
    id: string;
    x: number;
    y: number;
    def: MapEntityDef;
    speed?: number;
    acceleration?: number;
    angle?: number;
  }) {
    super({ id: d.id, x: d.x, y: d.y, angle: d.angle || 0, def: d.def });
    this.def = d.def;
    this.health = this.def.health;

    if (d.speed) {
      this.speed = d.speed;
    } else {
      this.speed = this.def.maxSpeed;
    }

    if (d.acceleration) {
      this.acceleration = d.acceleration;
    } else {
      this.acceleration = this.def.maxAcceleration;
    }
  }

  applyAcceleration() {
    if (this.acceleration > this.def.maxAcceleration) {
      this.acceleration = this.def.maxAcceleration;
    }

    this.speed += this.acceleration;

    if (this.speed > this.def.maxSpeed) {
      this.speed = this.def.maxSpeed;
    }

    if (this.speed < 0) {
      this.speed = 0;
    }
  }

  applySpeed() {
    if (this.health > 0) {
      this.x += this.speed * Math.cos((this.angle * Math.PI) / 180.0);
      this.y += this.speed * Math.sin((this.angle * Math.PI) / 180.0);
    }
  }

  damage(n: number) {
    this.health -= n;

    if (this.health <= 0) {
      this.kill();
    }
  }

  kill() {
    this.dead = true;
  }
}

export class Port extends MapObject {
  name: string;
  terrainId: number;
  store: { [id: string]: SellBuyPrice };
  crew: CrewInTransit[];

  constructor(id: string, d: PortInTransit) {
    super({
      id: id,
      x: d.x,
      y: d.y,
      def: PortDef,
      angle: 0,
    });
    this.name = d.name;
    this.store = d.store;
    this.crew = d.crew;
    this.terrainId = d.terrainId;
  }

  toJSON(): PortInTransit {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      store: this.store,
      crew: this.crew,
      terrainId: this.terrainId,
    };
  }
}
