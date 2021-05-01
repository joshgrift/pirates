import {
  HEALTH,
  RESPAWN_DELAY,
  ShipDef,
  STARTING_CANNON_BALLS,
  STARTING_MONEY,
  UPGRADE_MAX_HEALTH,
  UPGRADE_MEDIC_HEAL_PER_TICK,
  UPGRADE_WATER_RESISTANCE,
} from "../../shared/GameDefs";
import {
  CannonSlot,
  Cargo,
  CrewBonus,
  EventType,
  PlayerDef,
  Skin,
} from "../../shared/Objects";
import {
  ClientServerPayload,
  PlayerInTransit,
  ShipInTransit,
  Action,
  CrewInTransit,
  TIMEOUT,
  EventsInTransit,
} from "../../shared/Protocol";
import { Collection } from "./Collection";
import { MapEntity, MapObject } from "./MapObject";

type playerConstructor = {
  id: string;
  x: number;
  y: number;
  skin: Skin;
  name: string;
};

export class Player extends MapEntity {
  skin: Skin;
  name: string;

  last_ping_time: number = 0;
  death_time: number = 0;
  kills: number = 0;
  deaths: number = 0;
  money: number = STARTING_MONEY;

  def: PlayerDef;
  maxHealth: number;

  inventory: { [id: string]: number } = {};
  cannons: { [id: number]: Cannon } = {};
  events: EventsInTransit[] = [];

  crew: Collection<CrewInTransit> = new Collection();
  actions: Action[] = [];

  constructor(p: playerConstructor) {
    super({
      id: p.id,
      x: p.x,
      y: p.y,
      def: ShipDef,
    });

    this.def = ShipDef;
    this.skin = p.skin;
    this.name = p.name;
    this.last_ping_time = Date.now();
    this.cannons[CannonSlot.LEFT] = {
      slot: CannonSlot.LEFT,
      lastFireTime: 0,
    };

    this.cannons[CannonSlot.RIGHT] = {
      slot: CannonSlot.RIGHT,
      lastFireTime: 0,
    };

    this.maxHealth = this.def.maxHealth;
  }

  update(p: ClientServerPayload) {
    this.last_ping_time = Date.now();
    this.acceleration = p.acceleration;
    this.actions = p.actions;
  }

  canShoot(slot: CannonSlot): boolean {
    return (
      Date.now() - this.cannons[slot].lastFireTime >= this.def.reloadTime &&
      this.inventory[Cargo.CANNON_BALL] > 0
    );
  }

  shoot(slot: CannonSlot) {
    this.cannons[slot].lastFireTime = Date.now();
    this.inventory[Cargo.CANNON_BALL]--;
  }

  damage(n: number) {
    this.events.push({ type: EventType.DAMAGE });
    this.health -= n;

    if (this.health <= 0) {
      this.kill();
    }
  }

  /**
   * kill player
   * @override
   */
  kill() {
    this.dead = true;
    this.deaths++;
    this.death_time = Date.now();
    this.events.push({ type: EventType.DEATH });
  }

  respawn(x: number, y: number) {
    this.death_time = 0;
    this.dead = false;
    this.health = HEALTH;
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.money = STARTING_MONEY;
    this.inventory = {};
    this.inventory[Cargo.CANNON_BALL] = STARTING_CANNON_BALLS;
    this.crew = new Collection();
  }

  /**
   * has this player timed out?
   */
  timedOut(): boolean {
    return Date.now() - this.last_ping_time > TIMEOUT;
  }

  /**
   * can the player respawn yet?
   * @returns
   */
  canRespawn(): boolean {
    return Date.now() - this.death_time > RESPAWN_DELAY;
  }

  /**
   * Adjust heading by i if the player is moving and not dead
   * @param i
   */
  changeHeading(i: number) {
    if (this.speed >= 0.1 && !this.dead) {
      this.angle = (this.angle + i) % 360;
    }
  }

  /**
   * Hire Crew Member
   * @param crew
   */
  hire(crew: CrewInTransit) {
    this.crew.add(crew.id, crew);
    this.money -= crew.cost;

    if (crew.bonus == CrewBonus.MORE_HEALTH) {
      this.heal(UPGRADE_MAX_HEALTH - this.def.maxHealth);
    }
  }

  /**
   * Remove crew member
   * @param crew
   */
  fire(crew: CrewInTransit) {
    this.crew.remove(crew.id);

    if (crew.bonus == CrewBonus.MORE_HEALTH) {
      this.damage(UPGRADE_MAX_HEALTH - this.def.maxHealth);
    }
  }

  /**
   * Export Player as PlayerInTransit
   * @returns
   */
  exportAsPlayer(): PlayerInTransit {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      id: this.id,
      heading: this.angle,
      speed: this.speed,
      health: this.health,
      skin: this.skin,
      dead: this.dead,
      kills: this.kills,
      deaths: this.deaths,
      money: this.money,
      inventory: this.inventory,
      crew: this.crew.toJSON(),
    };
  }

  /**
   * Apply a bounce off of an object
   * @param e
   */
  bounce(e: MapObject) {
    //this.x -= this.speed * Math.cos((this.angle * Math.PI) / 180.0);
    //this.y -= this.speed * Math.sin((this.angle * Math.PI) / 180.0);
  }

  /**
   * Apply any healing effects
   */
  applyHealEffects() {
    if (
      !this.dead &&
      this.health + UPGRADE_MEDIC_HEAL_PER_TICK <= this.def.maxHealth &&
      this.hasBonus(CrewBonus.MEDIC)
    ) {
      this.health += UPGRADE_MEDIC_HEAL_PER_TICK;
    }
  }

  /**
   * Pillage Wreck
   * @param cargo
   */
  pillage(cargo: { [id: string]: number }) {
    for (var c in cargo) {
      if (this.inventory[c]) {
        this.inventory[c] += Math.floor(cargo[c] * 0.5); // player only collects 50% of items in a stash
      } else {
        this.inventory[c] = Math.floor(cargo[c] * 0.5);
      }
    }
  }

  /**
   * Apply water resistence to player
   */
  applyWaterEffect() {
    if (this.hasBonus(CrewBonus.FAST_BOI)) {
      this.speed *= UPGRADE_WATER_RESISTANCE;
    } else {
      this.speed *= this.def.waterResistenceFactor;
    }
  }

  /**
   * change money by n
   * @param n
   */
  doTransaction(n: number) {
    // round to fix float errors
    this.money = Math.round((this.money + n) * 100) / 100;
  }

  /**
   * Heal player n amount
   * @param n
   */
  heal(n: number) {
    let maxHealth = this.def.maxHealth;

    if (this.hasBonus(CrewBonus.MORE_HEALTH)) {
      maxHealth = UPGRADE_MAX_HEALTH;
    }

    if (this.health + n < maxHealth) {
      this.health += n;
    } else {
      this.health = maxHealth;
    }
  }

  /**
   * Does this player have bonus c
   * @param c
   * @return true if the player has the bonus
   */
  hasBonus(bonus: CrewBonus): boolean {
    for (var c of this.crew) {
      if (c.bonus == bonus) {
        return true;
      }
    }
    return false;
  }

  /**
   * Export Player as Ship
   * @returns
   */
  toJSON(): ShipInTransit {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      id: this.id,
      heading: this.angle,
      health: this.health,
      skin: this.skin,
      dead: this.dead,
      kills: this.kills,
      deaths: this.deaths,
    };
  }
}

type Cannon = {
  slot: CannonSlot;
  lastFireTime: number;
};
