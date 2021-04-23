import "./style.scss";
import { Game, GameEvent } from "./class/Game";
import {
  ActionType,
  Cargo,
  CrewInTransit,
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
  crews: CrewInTransit[];
  name: string;
  player_name: string;
  cargo_capacity: number;
  cargo_count: number;
  crew_capacity: number;
  crew_count: number;
};

var app = createApp({
  data: function (): PortAppData {
    return {
      name: "",
      player_name: "",
      amount: 1,
      activeTab: "store",
      items: [],
      crews: [],
      cargo_capacity: 100,
      cargo_count: 10,
      crew_capacity: 4,
      crew_count: 1,
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
      game.doAction({
        type: ActionType.BUY,
        cargo: i,
        count: 1,
      });
    },
    sell: function (i: Cargo) {
      game.doAction({
        type: ActionType.SELL,
        cargo: i,
        count: 1,
      });
    },
    repair: function () {
      game.doAction({
        type: ActionType.REPAIR,
      });
    },
    hire: function (crew: CrewInTransit) {
      game.doAction({
        type: ActionType.HIRE,
        crew: crew,
      });
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

  appData().player_name = UI.nameInput.value;

  var json: InitReturnPayload = (await result.json()) as InitReturnPayload;

  game = new Game(UI.canvas, json, skin, UI.nameInput.value);

  UI.game.classList.add("open");

  game.on(GameEvent.ARRIVE_PORT, (d) => {
    if (d.port && !portOpen) {
      UI.port.classList.add("open");

      appData().name = d.port.name;

      let items: CargoItem[] = [];
      for (var i in d.port.store) {
        items.push({
          id: i,
          price: d.port.store[i],
        });
      }
      appData().items = items;

      updateCrewList(d.port.crew);
      updateCrewList(game.player.crew);

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

      updateCrewList(game.player.crew);

      UI.playerList.innerHTML = `<li>${d.ui.playerID} - ${d.ui.kills} / ${
        d.ui.deaths
      } K/D</li>
      ${(() => {
        var r = "";
        for (let p of d.ui.ships) {
          r += `<li>${p} - ${p.kills} / ${p.deaths} K/D</li>`;
        }
        return r;
      })()}
      `;
    }
  });

  UI.menu.classList.remove("open");
}

UI.startButton?.addEventListener("click", startGame);

function updateCrewList(crew: CrewInTransit[]) {
  for (var c of crew) {
    var found = false;
    for (var c2 in appData().crews) {
      if (c.id == appData().crews[c2].id) {
        c.cost = -1;
        appData().crews[c2] = c;
        found = true;
      }
    }

    if (!found) {
      appData().crews.push(c);
    }
  }
}
