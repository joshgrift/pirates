import {
  ClientServerPayload,
  InitSetupPayload,
  TICK,
} from "../shared/Protocol";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Controller } from "./src/Controller";
import * as WebSocket from "ws";
import { createServer } from "http";

// load default config
require("dotenv").config();

const HTTP = createServer();

const controller: Controller = new Controller();
controller.loadWorld("../maps/map.tmx", "../maps/map.json");

/* express */
var app = express();
app.use(bodyParser.json());

app.post("/join", function (req: Request, res: Response) {
  let payload = controller.join(req.body as InitSetupPayload);
  if (process.env.NODE_ENV == "production") {
    payload["address"] = `wss://${process.env.URL}`;
  } else {
    payload["address"] = `ws://${process.env.URL}:${process.env.PORT}`;
  }
  res.json(payload);
});

app.get("/sound/:sound", function (req: Request, res: Response) {
  res.redirect(process.env.SOUND_BASE_URL + req.params["sound"]);
});

app.get("/health", function (req: Request, res: Response) {
  res.json({
    tickSpeed: controller.timer.getAvg(),
    players: controller.world?.players.length() || 0,
  });
});

app.use("/", express.static("../client"));
HTTP.on("request", app);

var s = new WebSocket.Server({
  server: HTTP,
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

HTTP.listen(process.env.PORT, () => {
  console.log(`Listening on http://${process.env.URL}:${process.env.PORT}`);
});

setInterval(async () => {
  controller.tick();
}, TICK);
