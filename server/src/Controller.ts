import {
  ClientServerPayload,
  InitReturnPayload,
  InitSetupPayload,
  ServerClientPayload,
  ShipInTransit,
} from "../../shared/Protocol";
import { Timer } from "../../shared/Util";
import { World } from "./World";
import type WebSocket from "ws";

const DEBUG = false;

export class Controller {
  world: World | null = null;
  timer: Timer = new Timer();

  /**
   * Load world into game
   * @param map path to map.tmx
   * @param ports path to json file
   */
  loadWorld(map: string, ports: string) {
    this.world = new World(map, ports);
  }

  /**
   * Setup a player in the world
   * @param d
   * @returns
   */
  join(d: InitSetupPayload): InitReturnPayload {
    if (this.world) {
      var id = this.world.createPlayer(d);
      console.log(`LOG: ${d.name} (${id}) joined`);

      return {
        id: id,
        address: "", // this will be set by the network handler
        terrain: this.world.terrains,
        ports: this.world.ports.toJSON(),
      };
    } else {
      throw Error("World hasn't been loaded yet");
    }
  }

  tick() {
    this.timer.startTimer();
    if (this.world) {
      this.world.tick();

      // send messages back to players
      for (let player of this.world.players) {
        if (player.socket) {
          player.socket.send(
            JSON.stringify({
              player: player.exportAsPlayer(),
              events: player.events,
              ships: this.world.exported.ships,
              entities: this.world.exported.entities,
            } as ServerClientPayload)
          );
        }
      }
    }

    this.timer.stopTimer();
    if (DEBUG) {
      console.log("tick took: " + this.timer.getTime() + "ms");
    }
  }

  /**
   * Call when data is receieved from client
   * @param msg Payload from server
   * @returns Payload to return to the client. Returns null if the user is no longer apart of the server
   */
  messageReceieved(msg: ClientServerPayload, ws: WebSocket) {
    if (this.world) {
      var player = this.world.players.get(msg.id);

      if (player) {
        if (!player.socket) {
          player.socket = ws;
        }

        player.update(msg);
      } else {
        console.error("ERR: player with id " + msg.id + " does not exist");
        return null;
      }
    } else {
      throw Error("World hasn't been loaded yet");
    }
  }
}
