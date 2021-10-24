import {
  ClientServerPayload,
  InitSetupPayload,
  TICK,
} from "../shared/Protocol";
import express, { Request, Response } from "express";
import { Controller } from "./src/Controller";
import { Server } from "ws";
import type WebSocket from "ws";
import { createServer } from "http";

const DEBUG = false;

// load default config
require("dotenv").config();

const HTTP = createServer();

const controller: Controller = new Controller();
controller.loadWorld("../maps/map.tmx", "../maps/map.json");

/* express */
var app = express();
app.use(express.json());

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

var s = new Server({
  server: HTTP,
});

s.on("connection", (ws: WebSocket) => {
  ws.on("message", (message) => {
    controller.messageReceieved(
      JSON.parse(message.toString()) as ClientServerPayload,
      ws
    );
  });
});

HTTP.listen(process.env.PORT, () => {
  console.log(`Listening on http://${process.env.URL}:${process.env.PORT}`);
});

var previousTick = Date.now();
var actualTicks = 0;

function loop() {
  var now = Date.now();

  actualTicks++;
  if (previousTick + TICK <= now) {
    var delta = (now - previousTick) / 1000;
    previousTick = now;

    controller.tick();

    if (DEBUG)
      console.log(
        "delta",
        delta,
        "(target: " + TICK + " ms)",
        "node ticks",
        actualTicks
      );
    actualTicks = 0;
  }

  if (Date.now() - previousTick < TICK - 16) {
    setTimeout(loop);
  } else {
    setImmediate(loop);
  }
}

loop();
