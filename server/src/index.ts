import { SocketServer } from "./Socket";
import { World } from "./World";
import {
  ClientServerPayload,
  InitSetupPayload,
  TICK,
} from "../../shared/Protocol";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const EXPRESS_PORT = 8081;
const SERVER_PORT = 3000;
const world = new World("../maps/map.tmx", "../maps/tiny_map.json");

/* express */
var app = express();
app.use(bodyParser.json());

app.post("/join", function (req: Request, res: Response) {
  let id = world.createPlayer(req.body as InitSetupPayload);

  res.json({
    id: id,
    address: "ws://192.168.1.181:" + SERVER_PORT,
    terrain: world.terrains,
    ports: world.ports.toJSON(),
  });
});

app.use("/", express.static("../client"));

app.listen(EXPRESS_PORT);

/* server */
var s: SocketServer = new SocketServer(SERVER_PORT, (ws) => {
  ws.on("message", function incoming(message) {
    world.updateFromPlayer(
      JSON.parse(message.toString()) as ClientServerPayload
    );
  });
});

console.log(`Listening on localhost:${EXPRESS_PORT}`);

setInterval(() => {
  world.tick();
  s.broadcast(world.toServerClientPayload());
}, TICK);
