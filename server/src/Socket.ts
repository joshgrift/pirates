import * as WebSocket from "ws";
import { PlayerInTransit } from "./Player";

export class SocketServer {
  server: WebSocket.Server;

  constructor(port: number, callback: (ws: WebSocket) => void) {
    this.server = new WebSocket.Server({
      port: port,
    });

    this.server.on("connection", callback);
  }

  broadcast(message: Object) {
    this.server.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export enum PayloadType {
  INIT,
  UPDATE,
}

export type Payload = {
  type: PayloadType;
  data: PlayerInTransit[] | PlayerInTransit;
};
