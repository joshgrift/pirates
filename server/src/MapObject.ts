import { distance } from "../../shared/MyMath";
import { MapEntityDef, MapObjectDef } from "../../shared/GameDefs";

export class MapObject {
  id: string;
  x: number;
  y: number;
  def: MapObjectDef;

  constructor(d: { id: string; x: number; y: number; def: MapObjectDef }) {
    this.id = d.id;
    this.x = d.x;
    this.y = d.y;
    this.def = d.def;
  }

  collidingWith(o: MapObject) {
    if (this.id == o.id) {
      return false;
    }

    return distance(this.x, this.y, o.x, o.y) < this.def.radius + o.def.radius;
  }
}

export class MapEntity extends MapObject {
  dead: boolean = false;
  health: number;
  speed: number = 0;
  acceleration: number = 0;
  heading: number = 0;
  def: MapEntityDef;

  constructor(d: {
    id: string;
    x: number;
    y: number;
    def: MapEntityDef;
    speed?: number;
    acceleration?: number;
    heading?: number;
  }) {
    super({ id: d.id, x: d.x, y: d.y, def: d.def });
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

    if (d.heading) {
      this.heading = d.heading;
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
      this.x += this.speed * Math.cos((this.heading * Math.PI) / 180.0);
      this.y += this.speed * Math.sin((this.heading * Math.PI) / 180.0);
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
