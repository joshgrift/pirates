import e from "express";
import { Collection } from "./Collection";
import { Entity } from "./Entity";
import { Player } from "./Player";
import {
  ClientServerPayload,
  EntityType,
  ServerClientPayload,
  TerrainInTransit,
} from "./Protocol";

export class World {
  readonly TIMEOUT: number = 2000;
  readonly RESPAWN_TIME: number = 5000;
  height: number = 600;
  width: number = 600;
  players: Collection<Player> = new Collection();
  entities: Collection<Entity> = new Collection();
  events: Collection<Event> = new Collection();
  terrains: TerrainInTransit[];

  constructor(map: TerrainInTransit[]) {
    this.terrains = map;
  }

  updateFromPlayer(update: ClientServerPayload) {
    var player = this.players.get(update.id);

    // if playe doesn't exist, add playe
    if (!player) {
      player = new Player({
        id: update.id,
        x: random(this.width),
        y: random(this.height),
        heading: 90,
        skin: update.skin,
      });

      this.players.add(update.id, player);
    }

    // update player with details
    player.update(update);
  }

  tick() {
    this.players.forEach((p) => {
      if (Date.now() - p.last_ping_time > this.TIMEOUT) {
        this.players.remove(p.id);
      } else if (!p.dead) {
        p.move();
        p.applyAcceleration();

        // shots
        if (p.canFire()) {
          let id = p.id + "shot" + Date.now();

          this.spawn(
            new Entity({
              id: id,
              type: EntityType.CANNON_BALL,
              x: p.x,
              y: p.y,
              speed: 10,
              health: 20,
              heading: p.heading + p.cannon,
              damage: 10,
              owner: p,
            })
          );

          p.fire();
        }

        // collisions
        this.players.forEach((p2) => {
          if (p.collidingWith(p2)) {
            p.damage(-50);
            p2.damage(-50);

            this.spawn(
              new Entity({
                type: EntityType.SHIP_EXPLOSION,
                x: p.x,
                y: p2.y,
                speed: 0,
                health: 10,
                id: p.id + "and" + p2.id + "explosion",
                heading: 0,
              })
            );
          }
        });

        // collision with terrain
        this.terrains.forEach((t) => {
          if (p.collidingWithT(t)) {
            p.kill();
          }
        });
      } else if (p.dead) {
        if (Date.now() - p.death_time > this.RESPAWN_TIME) {
          p.respawn(random(1200), random(600));
        }
      }
    });

    this.entities.forEach((e) => {
      e.tick();

      this.players.forEach((p) => {
        if (e.collisionWith(p)) {
          if (e.type == EntityType.CANNON_BALL) {
            p.damage(-e.damage);
            e.kill();

            if (p.dead && e.owner) {
              let killer = this.players.get(e.owner.id);
              if (killer) {
                killer.kills++;
              }
            }

            var ball = new Entity({
              type: EntityType.SHIP_EXPLOSION,
              x: e.x,
              y: e.y,
              speed: 0,
              health: 10,
              id: p.id + "and" + e.id + "explosion",
              heading: 0,
            });
            ball.tick();

            this.spawn(ball);
          }
        }
      });

      if (e.dead) {
        this.entities.remove(e.id);
      }
    });
  }

  spawn(e: Entity) {
    this.entities.add(e.id, e);
  }

  toJSON(): ServerClientPayload {
    return {
      players: this.players.toJSON(),
      entities: this.entities.toJSON(),
      events: [],
      terrain: this.terrains,
    };
  }
}

function random(x: number) {
  return Math.floor(x * Math.random());
}
