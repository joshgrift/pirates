import { Map } from "./Map";
//import { World } from "./World";
import { Player, PlayerInTransit } from "./Player";

const TICK = 50; // should probably match server unless you're a chad

enum Status {
  READY,
  CONNECTED,
  DISCONNECTED,
}

export class Game {
  scale = 2;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number = 600;
  height: number = 600;
  keys: { [id: string]: Boolean } = {};
  players: Player[] = [];
  player: Player;
  socket: WebSocket;
  status: Status = Status.DISCONNECTED;
  downloadedPlayers: Player[] = [];

  constructor(c: HTMLCanvasElement) {
    this.canvas = c;
    this.ctx = c.getContext("2d") as CanvasRenderingContext2D; // we know we will always get a context

    //this.canvas.width = window.innerWidth;
    //this.width = window.innerWidth;
    //this.canvas.height = window.innerHeight;
    //this.height = window.innerHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

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
    let msg = JSON.parse(data.data) as PlayerInTransit[] | PlayerInTransit;

    if (msg instanceof Array) {
      let tempPlayers: Player[] = [];
      for (let p of msg) {
        if (p.id != this.player.id) {
          var player = new Player(p);
          tempPlayers.push(player);
        } else {
          this.player.x = p.x;
          this.player.y = p.y;
          this.player.heading = p.heading;
          this.player.speed = p.speed;
          this.player.health = p.health;
        }
      }

      this.downloadedPlayers = tempPlayers;
    } else {
      if (this.status == Status.CONNECTED) {
        this.player = new Player(msg);
        this.ready();
        this.status = Status.READY;
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
      if (this.downloadedPlayers.length > 0) {
        this.players = this.downloadedPlayers;
        this.downloadedPlayers = [];
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      this.players.forEach((player) => {
        player.render(this.ctx, this.scale);
      });

      this.player.render(this.ctx, this.scale);
    }

    window.requestAnimationFrame(() => this.render(i + 1));
  }
}
