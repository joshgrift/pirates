import * as fs from "fs";
import csvParse from "csv-parse/lib/sync";
import { Collection } from "./Collection";
import { Entity, Terrain } from "./Entity";
import { Player } from "./Player";
import { packString, random } from "../../shared/Util";
import * as xml from "xml2js";
import { Port } from "./MapObject";

import {
  Cargo,
  ClientServerPayload,
  CrewInTransit,
  EntityType,
  InitSetupPayload,
  PortInTransit,
  TIMEOUT,
  Action,
  ActionType,
} from "../../shared/Protocol";

import {
  KILL_REWARD,
  TILE_SIZE,
  TREASURE_CHANCE,
  TREASURE_REWARD_MAX,
  WOOD_HEAL,
  RESPAWN_DELAY,
} from "../../shared/GameDefs";

export class World {
  height: number = 600;
  width: number = 600;
  players: Collection<Player> = new Collection();
  entities: Collection<Entity> = new Collection();
  events: Collection<Event> = new Collection();
  ports: Collection<Port> = new Collection();
  terrains: Terrain[] = [];

  constructor(mapPath: string, mapJSON: string) {
    this.loadMap(mapPath, mapJSON);
  }

  /**
   * Create a player
   * @param data
   * @returns id of player
   */
  createPlayer(data: InitSetupPayload): string {
    let id = packString(data.name + (Date.now() + "").substr(9, 4));

    let player = new Player({
      id: id,
      x: 0,
      y: 0,
      skin: data.skin,
      name: data.name,
    });

    this.players.add(id, player);
    this.spawnPlayer(player);

    return id;
  }

  /**
   * Spawn player into map
   * @param player
   */
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

  /**
   * LoadMap into world
   * @param mapPath
   * @param mapJSONPath
   * @returns
   */
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
      let id = packString(p.name);
      this.ports.add(id, new Port(id, p));
    });

    return p;
  }

  /**
   * spawn entity into the map
   * @param e
   */
  spawn(e: Entity) {
    this.entities.add(e.id, e);
  }

  /**
   * Main Game Loop
   */
  tick() {
    for (var player of this.players) {
      if (player.timedOut()) {
        console.log(`LOG: ${player.name} (${player.id}) was removed`);
        this.players.remove(player.id);
        continue;
      }

      if (player.dead && player.canRespawn()) {
        this.spawnPlayer(player);
        continue;
      } else if (player.dead) {
        continue;
      }

      for (let action of player.actions) {
        var port: Port | null = null;

        switch (action.type) {
          case ActionType.SHOOT:
            if (action.cannon && player.canFire(action.cannon)) {
              this.spawn(
                new Entity({
                  id: player.id + "shot" + Date.now(),
                  type: EntityType.CANNON_BALL,
                  x: player.x,
                  y: player.y,
                  heading: player.heading + action.cannon,
                  owner: player,
                })
              );

              player.fire(action.cannon);
            }
            break;

          case ActionType.TURN:
            if (action.direction) {
              player.changeHeading(action.direction);
            }
            break;

          case ActionType.BUY:
            port = this.getPort(player);

            if (port && action.cargo) {
              if (player.money - port.store[action.cargo].buy >= 0) {
                if (player.inventory[action.cargo] != null) {
                  player.inventory[action.cargo]++;
                } else {
                  player.inventory[action.cargo] = 1;
                }

                player.money -= port.store[action.cargo].buy;
              }
            }
            break;

          case ActionType.SELL:
            port = this.getPort(player);

            if (port && action.cargo) {
              if (player.inventory[action.cargo]) {
                player.inventory[action.cargo]--;
                player.money += port.store[action.cargo].sell;
              }
            }
            break;

          case ActionType.REPAIR:
            port = this.getPort(player);

            if (port) {
              if (player.inventory[Cargo.WOOD] > 0 && player.health < 100) {
                player.health += WOOD_HEAL;
                player.inventory[Cargo.WOOD]--;
              }
            }
            break;

          case ActionType.HIRE:
            port = this.getPort(player);

            if (port && action.crew && player.money >= action.crew.cost) {
              player.crew.add(action.crew.id, action.crew);
              player.money -= action.crew.cost;
            }
            break;

          case ActionType.FIRE:
            if (action.crew && player.crew.get(action.crew.id)) {
              player.crew.remove(action.crew.id);
            }
            break;
        }
      }

      player.applyAcceleration();
      player.applySpeed();
      player.applyWaterEffect();

      this.checkCollisions(player);
    }

    this.doRandomSpawnTick();

    for (var entity of this.entities) {
      entity.tick();
      entity.applyAcceleration();
      entity.applySpeed();
    }

    this.entities.forEach((entity) => {
      if (entity.dead) {
        this.entities.remove(entity.id);
      }
    });
  }

  /**
   * Check collisions on Player
   */
  checkCollisions(player: Player) {
    // colliding with players
    for (let p of this.players) {
      if (player.collidingWith(p)) {
        player.damage(p.def.damage);
        p.damage(player.def.damage);

        this.spawn(
          new Entity({
            type: EntityType.SHIP_EXPLOSION,
            x: player.x,
            y: player.y,
            id: p.id + "and" + player.id + "explosion",
            heading: 0,
          })
        );
      }
    }

    // entity collision
    for (let e of this.entities) {
      if (player.collidingWith(e) && !player.dead) {
        if (e.type == EntityType.CANNON_BALL) {
          if (e.owner) {
            if ((e.owner.id as string) != player.id) {
              player.damage(e.def.damage);
              e.kill();

              if (player.dead && e.owner) {
                let killer = this.players.get(e.owner.id);
                if (killer) {
                  killer.kills++;
                  killer.money += KILL_REWARD;
                }
              }

              var boom = new Entity({
                type: EntityType.SHIP_EXPLOSION,
                x: e.x,
                y: e.y,
                id: player.id + "and" + e.id + "explosion",
                heading: 0,
              });
              boom.tick();

              this.spawn(boom);
            }
          }
        } else if (e.type == EntityType.TREASURE) {
          player.money += random(TREASURE_REWARD_MAX);
          this.entities.remove(e.id);
        }
      }
    }

    // colliding with terrain
    for (let t of this.terrains) {
      if (player.collidingWith(t)) {
        player.damage(t.def.damage);
      }
    }
  }

  /**
   * Get the port the player is on
   * @param player
   */
  getPort(player: Player): Port | null {
    for (let port of this.ports) {
      if (player.collidingWith(port)) {
        return port;
      }
    }

    return null;
  }

  /**
   * Spawn random items on map
   */
  doRandomSpawnTick() {
    if (random(TREASURE_CHANCE) == 1) {
      var treasure = new Entity({
        type: EntityType.TREASURE,
        x: random(this.width),
        y: random(this.height),
        id: Date.now() + "treasure",
        heading: 0,
      });

      var safe = true;
      for (var e of this.entities) {
        if (e.collidingWith(treasure)) {
          safe = false;
          break;
        }
      }

      if (safe) {
        this.spawn(treasure);
      }
    }
  }
}
