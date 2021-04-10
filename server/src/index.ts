import { SocketServer } from "./Socket";
import { World } from "./World";
import { ClientServerPayload, TICK } from "./Protocol";

const PORT = 3000;

const world = new World();

var s: SocketServer = new SocketServer(PORT, (ws) => {
  ws.on("message", function incoming(message) {
    world.updateFromPlayer(
      JSON.parse(message.toString()) as ClientServerPayload
    );
  });
});

setInterval(() => {
  world.tick();
  s.broadcast(world.toJSON());
}, TICK);
