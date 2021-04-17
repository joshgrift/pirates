import {
  CannonDirection,
  Cargo,
  ClientServerPayload,
  PortAction,
  PortActionType,
  ServerClientPayload,
  Skin,
  TICK,
} from "../../../shared/Protocol";
import { Map } from "./Map";
import { Player } from "./Player";
import { Entity, Port, Terrain } from "./WorldObjects";
import { distance, normalize } from "../../../shared/MyMath";
import { PortDef, ShipDef } from "../../../shared/GameDefs";

enum Status {
  READY,
  DISCONNECTED,
}

export enum GameEvent {
  ARRIVE_PORT,
  LEAVE_PORT,
}

export class Game {
  readonly MAX_PINGS = 100;
  last_ping: number = Date.now();
  pings: number[] = [];
  map: Map;
  players: Player[] = [];
  entities: Entity[] = [];
  terrain: Terrain[] = [];
  ports: Port[] = [];

  inPort: boolean = false;

  gameEventCallbacks: { [id: number]: (d: GameEventData) => void } = {};

  player: Player;
  keys: { [id: string]: Boolean } = {};

  status: Status = Status.DISCONNECTED;
  socket: WebSocket;

  constructor(c: HTMLCanvasElement, id: string, skin: Skin) {
    this.socket = new WebSocket("ws://192.168.1.181:3000");
    this.map = new Map(c);

    this.player = new Player({
      x: 0,
      y: 0,
      speed: 0,
      health: 100,
      id: id,
      heading: 90,
      skin: skin,
      dead: false,
      kills: 0,
      deaths: 0,
    });

    this.socket.onopen = () => {
      this.send(this.player.toJSON());
    };

    this.socket.onmessage = (d) => {
      this.handle(d);
      if (this.status == Status.DISCONNECTED) {
        this.ready();
      }
    };

    document.addEventListener("keydown", (e) => {
      if (e.key == ".") {
        this.player.cannon = CannonDirection.RIGHT;
      }

      if (e.key == ",") {
        this.player.cannon = CannonDirection.LEFT;
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
    this.player.cannon = CannonDirection.OFF;
  }

  handle(data: MessageEvent) {
    this.pings.push(Date.now() - this.last_ping);
    if (this.pings.length > this.MAX_PINGS) {
      this.pings.shift();
    }
    this.last_ping = Date.now();

    let msg = JSON.parse(data.data) as ServerClientPayload;

    this.terrain = [];
    for (let t of msg.terrain) {
      this.terrain.push(new Terrain(t));
    }

    this.entities = [];
    for (let e of msg.entities) {
      this.entities.push(new Entity(e));
    }

    this.players = [];
    for (let p of msg.players) {
      if (p.id != this.player.id) {
        this.players.push(new Player(p));
      } else {
        this.player.dead = p.dead;
        this.player.x = p.x;
        this.player.y = p.y;
        this.player.heading = p.heading;
        this.player.speed = p.speed;
        this.player.health = p.health;
        this.player.kills = p.kills;
        this.player.deaths = p.deaths;
      }
    }

    this.map.setView(
      this.player.x,
      this.player.y,
      this.player.speed,
      this.player.heading
    );

    msg.ports.forEach((p) => {
      let id = normalize(p.name);
      this.ports.push(new Port(id, p));
    });

    this.render();
  }

  tick() {
    if (this.status == Status.READY) {
      if (this.player.speed < 0.01 && !this.inPort) {
        var p = this.getPort();
        if (p) {
          this.emit(GameEvent.ARRIVE_PORT, { port: p });
          this.inPort = true;
        }
      } else if (this.inPort) {
        var port = this.getPort();
        if (!port) {
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
        this.player.changeHeading(1);
      }

      if (this.keys["a"]) {
        this.player.changeHeading(-1);
      }

      this.send(this.player.toJSON());

      this.player.portAction = null;

      setTimeout(() => this.tick(), TICK);
    }
  }

  uiUpdate() {
    this.updateUIElement("#speed", decimal_round(this.player.speed) + "");
    this.updateUIElement(
      "#acceleration",
      decimal_round(this.player.acceleration) + ""
    );
    this.updateUIElement("#health", this.player.health + "");
    this.updateUIElement("#heading", this.player.heading + "");
    this.updateUIElement("#ping", avg(this.pings) + "");
    this.updateUIElement("#dead", this.player.dead + "");
    this.updateUIElement("#x", decimal_round(this.player.x) + "");
    this.updateUIElement("#y", decimal_round(this.player.y) + "");
    this.updateUIElement("#kills", this.player.kills + "");

    let list = "";
    this.players.forEach((p) => {
      list += `<li>${p.id} - ${p.kills} / ${p.deaths} K/D</li>`;
    });
    list += `<li>${this.player.id} - ${this.player.kills} / ${this.player.deaths} K/D</li>`;
    this.updateUIElement("#player_list", list);

    setTimeout(() => {
      this.uiUpdate();
    }, 1000);
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

      this.players.forEach((player) => {
        player.render(this.map);
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

  buy(cargo: Cargo) {
    this.player.portAction = {
      type: PortActionType.BUY,
      cargo: cargo,
    };
  }

  sell(cargo: Cargo) {
    this.player.portAction = {
      type: PortActionType.SELL,
      cargo: cargo,
    };
  }
}

function avg(d: number[]) {
  var sum = 0;
  for (let n of d) {
    sum += n;
  }

  return Math.round(sum / d.length);
}

function decimal_round(n: number) {
  return Math.round(10 * n) / 10;
}

export type GameEventData = {
  port?: Port;
};
