import { Collection } from "./Collection";
import { Entity } from "./Entity";
import { Player } from "./Player";
import {
  CannonDirection,
  ClientServerPayload,
  EntityType,
  ServerClientPayload,
  Skin,
} from "./Protocol";

export class World {
  height: number = 600;
  width: number = 600;
  players: Collection<Player> = new Collection();
  entities: Collection<Entity> = new Collection();
  events: Collection<Event> = new Collection();

  updateFromPlayer(update: ClientServerPayload) {
    var player = this.players.get(update.id);

    // if playe doesn't exist, add playe
    if (!player) {
      player = new Player({
        id: update.id,
        x: random(this.width),
        y: random(this.height),
        heading: 90,
        skin: Skin.RED,
      });

      this.players.add(update.id, player);
    }

    // update player with details
    if (!player.dead) {
      player.heading = update.heading;
      player.cannon = update.cannon;
      player.acceleration = update.acceleration;
    }
  }

  tick() {
    this.players.forEach((p) => {
      if (!p.dead) {
        p.move();
        p.applyAcceleration();

        // shots
        if (p.cannon != CannonDirection.OFF) {
          let id = p.id + "shot" + Date.now();

          this.spawn(
            new Entity({
              id: id,
              type: EntityType.CANNON_BALL,
              x: p.x,
              y: p.y,
              speed: 10,
              heading: p.heading + p.cannon,
            })
          );

          p.fire();
        }

        // collisions
        this.players.forEach((p2) => {
          if (p.collidingWith(p2)) {
            p.kill();
            p2.kill();

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
      }
    });

    this.entities.forEach((e) => {
      e.tick();
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
    };
  }
}

function random(x: number) {
  return Math.floor(x * Math.random());
}
