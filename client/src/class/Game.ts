import { Map } from "./Map";
//import { World } from "./World";
import { Player, PlayerInTransit } from "./Player";
import { Entity, EntityInTransit } from "./WorldObjects";

const TICK = 50; // should probably match server unless you're a chad

enum Status {
  READY,
  CONNECTED,
  DISCONNECTED,
}

export class Game {
  map: Map;
  keys: { [id: string]: Boolean } = {};

  players: Player[] = [];
  entities: Entity[] = [];

  player: Player;

  socket: WebSocket;
  status: Status = Status.DISCONNECTED;

  constructor(c: HTMLCanvasElement) {
    this.map = new Map(c);

    this.player = new Player(null); // dummy player

    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });

    this.socket = new WebSocket("ws://localhost:3000");

    this.socket.onopen = () => {
      this.status = Status.CONNECTED;
    };

    this.socket.onmessage = (d) => this.handle(d);
  }

  ready() {
    this.tick();
    this.render(0);
  }

  handle(data: MessageEvent) {
    let msg = JSON.parse(data.data) as Payload | PlayerInTransit;

    if (this.status == Status.CONNECTED) {
      this.player = new Player(msg as PlayerInTransit);
      this.ready();
      this.status = Status.READY;
    } else {
      let tempPlayers: Player[] = [];
      let foundMe = false;
      for (let p of (msg as Payload).players) {
        if (p.id != this.player.id) {
          var player = new Player(p);
          tempPlayers.push(player);
        } else {
          foundMe = true;
          this.player.x = p.x;
          this.player.y = p.y;
          this.player.heading = p.heading;
          this.player.speed = p.speed;
          this.player.health = p.health;
        }
      }

      if (!foundMe && this.status == Status.READY) {
        alert("You died");
      }

      this.players = tempPlayers;

      this.entities = [];
      for (let e of (msg as Payload).entities) {
        this.entities.push(new Entity(e));
      }
    }
  }

  tick() {
    if (this.status == Status.READY) {
      if (this.keys["w"]) {
        this.player.changeSpeed(0.1);
      }

      if (this.keys["s"]) {
        this.player.changeSpeed(-0.1);
      }

      if (this.keys["d"]) {
        this.player.changeHeading(1);
      }

      if (this.keys["a"]) {
        this.player.changeHeading(-1);
      }

      this.socket.send(JSON.stringify(this.player));
    }

    setTimeout(() => this.tick(), TICK);
  }

  render(i: number) {
    if (this.status == Status.READY) {
      this.map.clear();

      this.players.forEach((player) => {
        player.render(this.map);
      });

      this.entities.forEach((entity) => {
        entity.render(this.map);
      });

      this.player.render(this.map);
    }

    window.requestAnimationFrame(() => this.render(i + 1));
  }
}

type Payload = {
  players: PlayerInTransit[];
  entities: EntityInTransit[];
};
