import * as fs from "fs";
import csvParse from "csv-parse/lib/sync";
import { Collection } from "./Collection";
import { Entity, Terrain } from "./Entity";
import { Player } from "./Player";
import {
  ClientServerPayload,
  EntityType,
  PortInTransit,
  RESPAWN_DELAY,
  ServerClientPayload,
  TerrainType,
  TIMEOUT,
} from "../../shared/Protocol";
import { normalize, random } from "../../shared/MyMath";
import { TILE_SIZE } from "../../shared/GameDefs";
import * as xml from "xml2js";
import { Port } from "./MapObject";

export class World {
  height: number = 600;
  width: number = 600;
  players: Collection<Player> = new Collection();
  entities: Collection<Entity> = new Collection();
  events: Collection<Event> = new Collection();
  terrains: Terrain[] = [];
  ports: Collection<Port> = new Collection();

  constructor(mapPath: string, mapJSON: string) {
    this.loadMap(mapPath, mapJSON);
  }

  updateFromPlayer(update: ClientServerPayload) {
    var player = this.players.get(update.id);

    // if player doesn't exist, add player
    if (!player) {
      player = new Player({
        id: update.id,
        x: 0,
        y: 0,
        skin: update.skin,
      });

      this.players.add(update.id, player);
      this.spawnPlayer(player);
    }

    // update player with details
    player.update(update);
  }

  tick() {
    this.players.forEach((p) => {
      if (Date.now() - p.last_ping_time > TIMEOUT) {
        this.players.remove(p.id);
      } else if (!p.dead) {
        p.applyAcceleration();
        p.applySpeed();
        p.applyWaterEffect();

        // shots
        if (p.canFire()) {
          let id = p.id + "shot" + Date.now();

          this.spawn(
            new Entity({
              id: id,
              type: EntityType.CANNON_BALL,
              x: p.x,
              y: p.y,
              heading: p.heading + p.cannon,
              owner: p,
            })
          );

          p.fire();
        }

        // collisions
        this.players.forEach((p2) => {
          if (p.collidingWith(p2)) {
            p.damage(p.def.damage);
            p2.damage(p.def.damage);

            this.spawn(
              new Entity({
                type: EntityType.SHIP_EXPLOSION,
                x: p.x,
                y: p2.y,
                id: p.id + "and" + p2.id + "explosion",
                heading: 0,
              })
            );
          }
        });

        // collision with terrain
        this.terrains.forEach((t) => {
          if (p.collidingWith(t)) {
            p.damage(t.def.damage);
          }
        });

        // portActions
        if (p.portAction) {
          console.log(p.portAction);
          p.portAction = null;
        }
      } else if (p.dead) {
        if (Date.now() - p.death_time > RESPAWN_DELAY) {
          this.spawnPlayer(p);
        }
      }
    });

    this.entities.forEach((e) => {
      e.tick();
      e.applyAcceleration();
      e.applySpeed();

      this.players.forEach((p) => {
        if (e.collidingWith(p)) {
          if (e.type == EntityType.CANNON_BALL) {
            if (e.owner) {
              if ((e.owner.id as string) != p.id) {
                p.damage(e.def.damage);
                e.kill();

                if (p.dead && e.owner) {
                  let killer = this.players.get(e.owner.id);
                  if (killer) {
                    killer.kills++;
                  }
                }

                var boom = new Entity({
                  type: EntityType.SHIP_EXPLOSION,
                  x: e.x,
                  y: e.y,
                  id: p.id + "and" + e.id + "explosion",
                  heading: 0,
                });
                boom.tick();

                this.spawn(boom);
              }
            }
          }
        }
      });

      if (e.dead) {
        this.entities.remove(e.id);
      }
    });
  }

  spawnPlayer(player: Player) {
    var safe = false;

    while (!safe) {
      player.x = random(this.width - 2 * TILE_SIZE) + TILE_SIZE;
      player.y = random(this.height - 2 * TILE_SIZE) + TILE_SIZE;

      safe = true;
      this.players.forEach((p2) => {
        if (player.collidingWith(p2)) {
          safe = false;
        }
      });

      this.terrains.forEach((t) => {
        if (player.collidingWith(t)) {
          safe = false;
        }
      });

      this.entities.forEach((e) => {
        if (player.collidingWith(e)) {
          safe = false;
        }
      });

      this.ports.forEach((e) => {
        if (player.collidingWith(e)) {
          safe = false;
        }
      });
    }

    player.respawn(player.x, player.y);
  }

  async loadMap(mapPath: string, mapJSONPath: string): Promise<void> {
    var p = new Promise<void>((resolve, reject) => {
      let mapString = fs.readFileSync(mapPath, { encoding: "utf-8" });
      xml.parseString(mapString, (err, obj) => {
        if (err) {
          reject(err);
        }

        obj.map.layer.forEach((layer: any) => {
          var y = 0;
          var x = 0;

          csvParse(layer.data[0]._.trimStart().trimEnd() + ",").forEach(
            (row: string[]) => {
              x = 0;
              row.forEach((t: string) => {
                if (parseInt(t) > 0) {
                  this.terrains.push(
                    new Terrain({
                      x: x * TILE_SIZE,
                      y: y * TILE_SIZE,
                      type: TerrainType.GRASS,
                      sprite: parseInt(t) - 1,
                    })
                  );
                }
                x++;
              });
              y++;
            }
          );
          this.width = x * TILE_SIZE;
          this.height = y * TILE_SIZE;
        });

        resolve();
      });
    });

    var json = JSON.parse(fs.readFileSync(mapJSONPath, { encoding: "utf-8" }));

    json.ports.forEach((p: PortInTransit) => {
      let id = normalize(p.name);
      this.ports.add(id, new Port(id, p));
    });

    return p;
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
      ports: this.ports.toJSON(),
    };
  }
}
