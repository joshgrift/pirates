import { PayloadType, SocketServer } from "./Socket";
import { Player, PlayerInTransit } from "./Player";

const TICK = 50; // client should match your tick, you are the chad
const PORT = 3000;
const COLLIDE_DISTANCE = 35;

var players: Player[] = [];
var s: SocketServer = new SocketServer(PORT, (ws) => {
  ws.send(
    JSON.stringify({
      id: players.length,
      x: 50 * players.length,
      y: 50 * players.length,
      heading: 90,
      speed: 0,
      health: 100,
    })
  );

  ws.on("message", function incoming(message) {
    let data = JSON.parse(message.toString()) as PlayerInTransit;
    players[data.id] = new Player(data);
  });
});

function tick() {
  players.forEach((p) => {
    p.tick();
  });

  // collision
  players.forEach((p1) => {
    players.forEach((p2) => {
      if (p1.id != p2.id) {
        let distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );

        if (distance <= COLLIDE_DISTANCE) {
          p1.health = 0;
          p2.health = 0;
        }
      }
    });
  });

  s.broadcast(players);
}

setInterval(tick, TICK);
