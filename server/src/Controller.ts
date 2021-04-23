import * as WebSocket from "ws";
import {
  ClientServerPayload,
  InitReturnPayload,
  InitSetupPayload,
  ServerClientPayload,
} from "../../shared/Protocol";
import { World } from "./World";

export class Controller {
  world: World | null = null;

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
    if (this.world) {
      this.world.tick();
    }
  }

  playerConnected(ws: WebSocket) {
    ws.on("message", (message) => {
      if (this.world) {
      }
    });
  }

  /**
   * Call when data is receieved from client
   * @param msg Payload from server
   * @returns Payload to return to the client. Returns null if the user is no longer apart of the server
   */
  messageReceieved(msg: ClientServerPayload): ServerClientPayload | null {
    if (this.world) {
      var player = this.world.players.get(msg.id);

      if (player) {
        player.update(msg);
        return {
          player: player.exportAsPlayer(),
          ships: this.world.players.toJSON(),
          entities: this.world.entities.toJSON(),
        };
      } else {
        console.error("ERR: player with id " + msg.id + " does not exist");
        return null;
      }
    } else {
      throw Error("World hasn't been loaded yet");
    }
  }
}
