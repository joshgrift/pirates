import { SocketServer } from "./Socket";
import { Player, PlayerInTransit } from "./Player";
import { Entity } from "./Entity";
import { Collection } from "./Collection";

const TICK = 50; // client should match your tick, you are the chad
const PORT = 3000;
const COLLIDE_DISTANCE = 35;

var players: Collection<Player> = new Collection();
var entities: Collection<Entity> = new Collection();

var s: SocketServer = new SocketServer(PORT, (ws) => {
  var id = "player" + Date.now();

  players.add(
    id,
    new Player({
      id: id,
      x: 50,
      y: 50,
      heading: 90,
      speed: 0,
      health: 100,
    })
  );

  ws.send(JSON.stringify(players.get(id)));

  ws.on("message", function incoming(message) {
    let data = JSON.parse(message.toString()) as PlayerInTransit;
    try {
      players.update(data.id, new Player(data));
    } catch (e) {
      console.error("Player is dead yo");
    }
  });
});

function tick() {
  players.forEach((p) => {
    p.tick();
  });

  entities.forEach((e) => {
    e.tick();
  });

  // collision
  players.forEach((p1) => {
    players.forEach((p2) => {
      if (p1.id != p2.id) {
        let distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );

        if (distance <= COLLIDE_DISTANCE) {
          p1.kill();
          p2.kill();
          entities.add(
            p1.id + "and" + p2.id + "explosion",
            new Entity({
              type: "explosion",
              x: p1.x,
              y: p2.y,
              speed: 0,
              health: 10,
              id: p1.id + "and" + p2.id + "explosion",
              heading: 0,
            })
          );
        }
      }
    });
  });

  // remove bodies
  players.forEach((t) => {
    if (t.dead) {
      players.remove(t.id);
    }
  });

  entities.forEach((t) => {
    if (t.dead) {
      entities.remove(t.id);
    }
  });

  s.broadcast({ players: players, entities: entities });
}

setInterval(tick, TICK);
