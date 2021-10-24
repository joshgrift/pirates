import {
  Action,
  ClientServerPayload,
  InitReturnPayload,
  ServerClientPayload,
  TICK,
} from "../../../shared/Protocol";
import { Map } from "./Map";
import { Player, Ship } from "./Player";
import { Entity, Port, Terrain } from "./WorldObjects";
import { avg, distance, packString } from "../../../shared/Util";
import { Minimap } from "./MiniMap";
import { DIALOGUE, Dialogue } from "./Dialogue";
import { Sound, SoundEngine } from "./SoundEngine";
import {
  ActionType,
  CannonSlot,
  EventType,
  Skin,
} from "../../../shared/Objects";

enum Status {
  READY,
  DISCONNECTED,
}

export enum GameEvent {
  ARRIVE_PORT,
  LEAVE_PORT,
  UI_UPDATE,
  OPEN_MAP,
  DIALOGUE,
  DISMISS_DIALOGUE,
}

/**
 * Max number of packets we can saved up before we clear the buffer and bring the player up to date.
 */
let SAVED_PACKAGE_LIMIT = 3;

/**
 * GameLoop, communication with server, and rendering.
 * Should not interact with DOM, only canvas.
 */
export class Game {
  DEBUG = false;

  savedMessage: ServerClientPayload[] = [];

  map: Map;
  ships: Ship[] = [];
  entities: Entity[] = [];
  terrain: Terrain[] = [];
  ports: Port[] = [];

  inPort: boolean = false;

  gameEventCallbacks: { [id: number]: (d: GameEventData) => void } = {};

  player: Player;
  keys: { [id: string]: Boolean } = {};

  status: Status = Status.DISCONNECTED;
  socket: WebSocket;

  miniMap: Minimap;
  soundEngine: SoundEngine;

  constructor(
    c: HTMLCanvasElement,
    mapCanvas: HTMLCanvasElement,
    load: InitReturnPayload,
    skin: Skin,
    name: string
  ) {
    this.socket = new WebSocket(load.address);
    this.map = new Map(c);

    for (let t of load.terrain) {
      this.terrain.push(new Terrain(t));
    }

    this.soundEngine = new SoundEngine();
    this.soundEngine.preload();
    this.miniMap = new Minimap(mapCanvas, this.terrain);

    load.ports.forEach((p) => {
      let id = packString(p.name);
      this.ports.push(new Port(id, p));
    });

    this.player = new Player({
      name: name,
      id: load.id,
      skin: skin,
    });

    this.socket.onopen = () => {
      this.speak(DIALOGUE.welcome, true);
      this.send(this.player.toJSON());
    };

    this.socket.onmessage = (d) => {
      this.savedMessage.push(JSON.parse(d.data) as ServerClientPayload);

      if (this.status == Status.DISCONNECTED) {
        this.ready();
      }
    };

    document.addEventListener("keydown", (e) => {
      if (e.key == ".") {
        if (DIALOGUE.shooting.triggered) {
          this.speak(DIALOGUE.port);
        }
        this.doAction({
          type: ActionType.SHOOT,
          cannon: CannonSlot.RIGHT,
        });
      }

      if (e.key == ",") {
        this.doAction({
          type: ActionType.SHOOT,
          cannon: CannonSlot.LEFT,
        });
      }

      if (e.key == "\\") {
        this.DEBUG = !this.DEBUG;
      }

      if (e.key == "m") {
        this.emit(GameEvent.OPEN_MAP, {});
      }

      if (e.key == "Enter") {
        this.emit(GameEvent.DISMISS_DIALOGUE, {});
        this.soundEngine.play(Sound.Player_Walking_WoodenLeg_03);
      }

      if (e.key == "a" || e.key == "d") {
        if (!this.keys[e.key]) {
          this.soundEngine.play(Sound.Item_Rudder_Movement_01, 0.5);
        }

        setTimeout(() => {
          this.speak(DIALOGUE.shooting);
        }, 2000);
      }

      this.keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  private ready() {
    this.status = Status.READY;

    new HighResolutionTimer(TICK, this.tick.bind(this));
    new HighResolutionTimer(TICK * 20, this.uiUpdate.bind(this));

    this.render();
  }

  private send(d: ClientServerPayload) {
    this.socket.send(JSON.stringify(d));
  }

  private handle(msg: ServerClientPayload) {
    this.entities = [];
    for (let e of msg.entities) {
      this.entities.push(new Entity(e));
    }

    this.ships = [];
    for (let ship of msg.ships) {
      this.ships.push(new Ship(ship));
    }

    for (let event of msg.events) {
      switch (event.type) {
        case EventType.TREASURE_FOUND:
          if (DIALOGUE.treasure.triggered) {
            this.speak(DIALOGUE.found_treasure);
          }
          break;

        case EventType.SHIP_DESTROYED:
          this.speak(DIALOGUE.ship_destroyed);
          break;

        case EventType.DEATH:
          this.player.acceleration = 0;
          this.speak(DIALOGUE.death);
          break;

        case EventType.SHOT_FIRED:
          this.soundEngine.play(Sound.Weapons_CannonsShot_04);
          break;

        case EventType.DAMAGE:
          this.soundEngine.play(Sound.Impact_Ship_03, 0.8);
          break;

        case EventType.EXPLOSION:
          this.soundEngine.play(Sound.Impact_Ship_02, 0.8);
          break;

        case EventType.MISS:
          this.soundEngine.play(Sound.Impact_Cannon_OnWater_03);
          break;

        case EventType.WRECK_FOUND:
          this.soundEngine.play(Sound.Item_CoinChest_Opening_01);
          break;

        case EventType.UNLOAD_CARGO || EventType.LOAD_CARGO:
          this.soundEngine.play(Sound.Item_Chest_Landing, 0.6);
          break;

        case EventType.LOAD_CARGO || EventType.LOAD_CARGO:
          this.soundEngine.play(Sound.Item_Chest_Landing, 0.6);
          break;

        case EventType.REPAIR:
          this.soundEngine.play(Sound.Player_Ship_Repair_04);
          break;
      }
    }

    this.player.update(msg.player);

    this.map.setView(
      this.player.x,
      this.player.y,
      this.player.speed,
      this.player.heading,
      this.DEBUG
    );
  }

  private tick() {
    if (this.status == Status.READY) {
      if (this.player.speed < 0.01 && !this.inPort) {
        var p = this.getPort();
        if (p) {
          this.speak(DIALOGUE.port_store);
          this.emit(GameEvent.ARRIVE_PORT, { port: p });
          this.inPort = true;
        }
      } else if (this.inPort) {
        var port = this.getPort();
        if (!port) {
          this.speak(DIALOGUE.treasure);
          this.emit(GameEvent.LEAVE_PORT, {});
          this.inPort = false;
        }
      }

      if (this.keys["w"]) {
        this.player.accelerate(0.01);
      }

      if (this.keys["s"]) {
        this.player.accelerate(-0.01);
      }

      if (this.keys["d"]) {
        this.doAction({
          type: ActionType.TURN,
          direction: 1,
        });
      }

      if (this.keys["a"]) {
        this.doAction({
          type: ActionType.TURN,
          direction: -1,
        });
      }

      this.send(this.player.toJSON());
      this.player.actions = [];

      // handle server response
      let pkg = this.savedMessage.shift();
      if (pkg) {
        this.handle(pkg);

        if (this.savedMessage.length > SAVED_PACKAGE_LIMIT) {
          console.error("Client is too far behind, catching up...");
          this.savedMessage = [];
        }
      } else {
        if (true) {
          console.error("Missed frame from server");
        }
      }
    }
  }

  private uiUpdate() {
    this.emit(GameEvent.UI_UPDATE, {
      ui: {
        player: this.player,
        ping: 0,
        ships: this.ships,
      },
    });

    this.miniMap.render(this.ships, this.player, this.ports);
  }

  private getPort(): Port | null {
    for (var p of this.ports) {
      // TODO: server side pls
      if (distance(this.player.x, this.player.y, p.x, p.y) < 100) {
        return p;
      }
    }

    return null;
  }

  private render() {
    if (this.status == Status.READY) {
      this.map.clear();

      this.terrain.forEach((t) => {
        t.render(this.map);
      });

      this.ships.forEach((ship) => {
        ship.render(this.map);
      });

      this.ports.forEach((port) => {
        port.render(this.map);
      });

      this.player.render(this.map);

      this.entities.forEach((entity) => {
        entity.render(this.map);
      });
    }

    window.requestAnimationFrame(this.render.bind(this));
  }

  private emit(event: GameEvent, d: GameEventData) {
    if (this.gameEventCallbacks[event]) {
      this.gameEventCallbacks[event](d);
    }
  }

  public on(event: GameEvent, callback: (d: GameEventData) => void) {
    this.gameEventCallbacks[event] = callback;
  }

  public doAction(action: Action) {
    this.player.actions.push(action);
  }

  public speak(msg: Dialogue, silent = false) {
    if (!msg.triggered) {
      if (!silent) {
        this.soundEngine.play(Sound.Player_Map_Open);
      }
      this.emit(GameEvent.DIALOGUE, { dialogue: msg });
    }

    msg.triggered = true;
  }
}

export type GameEventData = {
  port?: Port;
  ui?: {
    ships: Ship[];
    ping: number;
    player: Player;
  };
  dialogue?: Dialogue;
};

export class HighResolutionTimer {
  private timer: NodeJS.Timeout | undefined;
  private startTime: number | undefined;
  private currentTime: number | undefined;
  private totalTicks: number = 0;

  constructor(public duration: number, public callback: () => void) {
    this.run();
  }

  run() {
    let lastTime = this.currentTime;
    this.currentTime = Date.now();

    if (!this.startTime) {
      this.startTime = this.currentTime;
    }

    this.callback();

    let nextTick =
      this.duration -
      (this.currentTime - (this.startTime + this.totalTicks * this.duration));
    this.totalTicks++;

    this.timer = setTimeout(() => {
      this.run();
    }, nextTick);
  }

  stop() {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }
}
