import {
  Action,
  ActionType,
  CannonSlot,
  Cargo,
  ClientServerPayload,
  EventType,
  InitReturnPayload,
  ServerClientPayload,
  Skin,
  TICK,
} from "../../../shared/Protocol";
import { Map } from "./Map";
import { Player, Ship } from "./Player";
import { Entity, Port, Terrain } from "./WorldObjects";
import { avg, distance, packString } from "../../../shared/Util";
import { PortDef, ShipDef } from "../../../shared/GameDefs";
import { Minimap } from "./MiniMap";
import { DIALOGUE, Dialogue } from "./Dialogue";
import { Sound, SoundEngine } from "./SoundEngine";

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

export class Game {
  readonly MAX_PINGS = 100;
  DEBUG = false;
  last_ping: number = Date.now();
  pings: number[] = [];

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
      x: 0,
      y: 0,
      speed: 0,
      health: 100,
      id: load.id,
      heading: 90,
      skin: skin,
      dead: false,
      kills: 0,
      deaths: 0,
      inventory: {},
      money: 0,
      crew: [],
    });

    this.socket.onopen = () => {
      this.speak(DIALOGUE.welcome);
      this.send(this.player.toJSON());
    };

    this.socket.onmessage = (d) => {
      this.handle(JSON.parse(d.data) as ServerClientPayload);
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
          this.soundEngine.play(Sound.Item_Rudder_Movement_01);
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

  ready() {
    this.status = Status.READY;
    this.tick();
    this.uiUpdate();
  }

  send(d: ClientServerPayload) {
    this.socket.send(JSON.stringify(d));
  }

  handle(msg: ServerClientPayload) {
    this.pings.push(Date.now() - this.last_ping);
    if (this.pings.length > this.MAX_PINGS) {
      this.pings.shift();
    }
    this.last_ping = Date.now();

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
          this.soundEngine.play(Sound.Impact_Ship_03);
          break;

        case EventType.EXPLOSION:
          this.soundEngine.play(Sound.Impact_Ship_02);
          break;

        case EventType.MISS:
          this.soundEngine.play(Sound.Impact_Cannon_OnWater_03);
          break;

        case EventType.WRECK_FOUND:
          this.soundEngine.play(Sound.Item_CoinChest_Opening_01);
          break;

        case EventType.UNLOAD_CARGO || EventType.LOAD_CARGO:
          this.soundEngine.play(Sound.Item_Chest_Landing);
          break;

        case EventType.LOAD_CARGO || EventType.LOAD_CARGO:
          this.soundEngine.play(Sound.Item_Chest_Landing);
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

    this.render();
  }

  tick() {
    setTimeout(() => this.tick(), TICK);

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
    }
  }

  uiUpdate() {
    this.emit(GameEvent.UI_UPDATE, {
      ui: {
        player: this.player,
        ping: avg(this.pings),
        ships: this.ships,
      },
    });

    this.miniMap.render(this.ships, this.player, this.ports);

    setTimeout(() => {
      this.uiUpdate();
    }, 200);
  }

  getPort(): Port | null {
    for (var p of this.ports) {
      if (
        distance(this.player.x, this.player.y, p.x, p.y) <
        PortDef.radius + ShipDef.radius
      ) {
        return p;
      }
    }

    return null;
  }

  render() {
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
  }

  updateUIElement(query: string, value: string) {
    let e = document.querySelector(query);

    if (e) {
      e.innerHTML = value;
    }
  }

  emit(event: GameEvent, d: GameEventData) {
    if (this.gameEventCallbacks[event]) {
      this.gameEventCallbacks[event](d);
    }
  }

  on(event: GameEvent, callback: (d: GameEventData) => void) {
    this.gameEventCallbacks[event] = callback;
  }

  doAction(action: Action) {
    this.player.actions.push(action);
  }

  speak(msg: Dialogue) {
    if (!msg.triggered) {
      this.soundEngine.play(Sound.Item_GemsChest_Opening);
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
