import "./style.scss";
import { Game, GameEvent } from "./class/Game";
import {
  Cargo,
  InitReturnPayload,
  InitSetupPayload,
  SellBuyPrice,
  Skin,
} from "../../shared/Protocol";
import { createApp } from "vue";

// plz put your pitch forks down
let $ = (q: string) => {
  var e = document.querySelector(q);
  if (e) {
    return e;
  } else {
    throw Error("Can't find " + q);
  }
};

const UI = {
  canvas: $("#canvas") as HTMLCanvasElement,
  menu: $("#menu") as HTMLDivElement,
  game: $("#game") as HTMLDivElement,
  playerList: $(".player_list") as HTMLUListElement,
  port: $("#port") as HTMLDivElement,
  stats: $(".stats") as HTMLDivElement,
  startButton: $("#startButton") as HTMLButtonElement,
  nameInput: $("#name") as HTMLInputElement,
  skinInput: $("#skin") as HTMLSelectElement,
};

let game: Game;
let portOpen = false;

type CargoItem = {
  id: string;
  price: SellBuyPrice;
};

type PortAppData = {
  amount: number;
  activeTab: string;
  items: CargoItem[];
  crews: {
    id: string;
    name: string;
    description: string;
    url: string;
    fire: boolean;
  }[];
};

var app = createApp({
  data: function (): PortAppData {
    return {
      amount: 1,
      activeTab: "ship",
      items: [],
      crews: [
        {
          id: "bob",
          name: "Bob",
          description: "increases capacity 10%",
          url: "",
          fire: false,
        },
        {
          id: "sam",
          name: "Sam",
          description: "increases range by 10%",
          url: "",
          fire: true,
        },
      ],
    };
  },
  methods: {
    changeTab: function (newtab: string) {
      this.activeTab = newtab;
    },
    isActive: function (tab: string) {
      return this.activeTab == tab;
    },
    buy: function (i: Cargo) {
      game.buy(i);
    },
    sell: function (i: Cargo) {
      game.sell(i);
    },
    repair: function () {
      game.repair();
    },
  },
}).mount("#port");

function appData(): PortAppData {
  return app.$data as PortAppData;
}

async function startGame() {
  const skin = (parseInt(UI.skinInput.value) as any) as Skin;

  var result = await fetch("/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      name: UI.nameInput.value,
      skin: skin,
    } as InitSetupPayload),
  });

  var json: InitReturnPayload = (await result.json()) as InitReturnPayload;

  game = new Game(UI.canvas, json, skin);

  UI.game.classList.add("open");

  game.on(GameEvent.ARRIVE_PORT, (d) => {
    if (d.port && !portOpen) {
      UI.port.classList.add("open");

      let items: CargoItem[] = [];
      for (var i in d.port.store) {
        items.push({
          id: i,
          price: d.port.store[i],
        });
      }
      appData().items = items;

      portOpen = true;
    }
  });

  game.on(GameEvent.LEAVE_PORT, (d) => {
    if (portOpen) {
      UI.port.classList.remove("open");
      portOpen = false;
    }
  });

  game.on(GameEvent.UI_UPDATE, (d) => {
    if (d.ui) {
      if (game.DEBUG) {
        UI.stats.innerHTML =
          `${d.ui.acceleration} px/t^2 => ${d.ui.speed} px/t | ${d.ui.health}% | ${d.ui.heading} degrees | ${d.ui.ping} ms | ${d.ui.kills} kills | ${d.ui.x}, ${d.ui.y} | dead: ${d.ui.dead} | $${d.ui.money} <br>` +
          `${JSON.stringify(d.ui.inventory)}`;
      } else {
        let inventory = "";

        for (let i of Object.keys(d.ui.inventory)) {
          inventory += ` <i class='inventory ${i}'></i> ${d.ui.inventory[i]}`;
        }

        UI.stats.innerHTML = `${inventory} <i class='inventory money'></i> ${d.ui.money} <progress value="${d.ui.health}" max="100"></progress>`;
      }

      UI.playerList.innerHTML = `<li>${d.ui.playerID} - ${d.ui.kills} / ${
        d.ui.deaths
      } K/D</li>
      ${(() => {
        var r = "";
        for (let p of d.ui.players) {
          r += `<li>${p.id} - ${p.kills} / ${p.deaths} K/D</li>`;
        }
        return r;
      })()}
      `;
    }
  });

  UI.menu.classList.remove("open");
}

UI.startButton?.addEventListener("click", startGame);
