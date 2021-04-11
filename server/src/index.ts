import { SocketServer } from "./Socket";
import { World } from "./World";
import { ClientServerPayload, TICK } from "./Protocol";
import { loadMap } from "./mapUtils";

const PORT = 3000;

log("Loading Map...");
loadMap("./map.csv").then((map) => {
  log("Map loaded.");
  const world = new World(map);
  log("World Created.");
  var s: SocketServer = new SocketServer(PORT, (ws) => {
    ws.on("message", function incoming(message) {
      world.updateFromPlayer(
        JSON.parse(message.toString()) as ClientServerPayload
      );
    });
  });
  log(`Listening on localhost:${PORT}`);

  setInterval(() => {
    world.tick();
    s.broadcast(world.toJSON());
  }, TICK);
});

function log(msg: string) {
  console.log(msg);
}
