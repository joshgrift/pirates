import {
  ClientServerPayload,
  InitSetupPayload,
  TICK,
} from "../shared/Protocol";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Controller } from "./src/Controller";
import * as WebSocket from "ws";

const EXPRESS_PORT = 8081;
const SERVER_PORT = 3000;

const controller: Controller = new Controller();

controller.loadWorld("../maps/map.tmx", "../maps/tiny_map.json");

/* express */
var app = express();
app.use(bodyParser.json());

app.post("/join", function (req: Request, res: Response) {
  let payload = controller.join(req.body as InitSetupPayload);
  payload["address"] = "ws://192.168.1.181:" + SERVER_PORT;
  res.json(payload);
});

app.use("/", express.static("../client"));

app.listen(EXPRESS_PORT);
console.log(`Listening on localhost:${EXPRESS_PORT}`);

/* server */
var s = new WebSocket.Server({
  port: SERVER_PORT,
});

s.on("connection", (ws) => {
  ws.on("message", (message) => {
    ws.send(
      JSON.stringify(
        controller.messageReceieved(
          JSON.parse(message.toString()) as ClientServerPayload
        )
      )
    );
  });
});

setInterval(() => {
  controller.tick();
}, TICK);
