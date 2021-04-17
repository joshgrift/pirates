import { SocketServer } from "./Socket";
import { World } from "./World";
import { ClientServerPayload, TICK } from "../../shared/Protocol";

const PORT = 3000;

const world = new World("../maps/tiny_map.tmx");

var s: SocketServer = new SocketServer(PORT, (ws) => {
  ws.on("message", function incoming(message) {
    world.updateFromPlayer(
      JSON.parse(message.toString()) as ClientServerPayload
    );
  });
});
console.log(`Listening on localhost:${PORT}`);

setInterval(() => {
  world.tick();
  s.broadcast(world.toJSON());
}, TICK);
