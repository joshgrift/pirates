import "./style.scss";
import { Game, GameEvent } from "./class/Game";
import {
  CrewInTransit,
  InitReturnPayload,
  InitSetupPayload,
} from "../../shared/Protocol";
import { createApp } from "vue";
import { DIALOGUE } from "./class/Dialogue";
import { Sound } from "./class/SoundEngine";
import { UPGRADE_MAX_HEALTH } from "../../shared/GameDefs";
import {
  ActionType,
  Cargo,
  CrewBonus,
  SellBuyPrice,
  Skin,
} from "../../shared/Objects";

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
  map: $(".map") as HTMLDivElement,
  mapCanvas: $(".map canvas") as HTMLCanvasElement,
  dialogue: $(".dialogue") as HTMLDivElement,
  dialogueText: $(".dialogue p") as HTMLDivElement,
  dialogueImage: $(".dialogue img") as HTMLImageElement,
};

let game: Game;
let portOpen = false;

type CargoItem = {
  id: string;
  price: SellBuyPrice;
};

type AppData = {
  amount: number;
  activeTab: string;
  items: CargoItem[];
  crew: CrewInTransit[];
  myCrew: CrewInTransit[];
  name: string;
  player_name: string;
  cargo_capacity: number;
  cargo_count: number;
  crew_capacity: number;
  crew_count: number;
  map_enabled: boolean;
};

var app = createApp({
  data: function (): AppData {
    return {
      name: "",
      player_name: "",
      amount: 1,
      activeTab: "store",
      items: [],
      crew: [],
      myCrew: [],
      cargo_capacity: 100,
      cargo_count: 10,
      crew_capacity: 4,
      crew_count: 1,
      map_enabled: false,
    };
  },
  methods: {
    changeTab: function (newtab: string) {
      this.activeTab = newtab;
      if (newtab == "crew") {
        game.speak(DIALOGUE.port_crew);
      }
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
    fire: function (crew: CrewInTransit) {
      game.doAction({
        type: ActionType.FIRE,
        crew: crew,
      });
    },
    existsIn: function (id: string, crew: CrewInTransit[]) {
      for (let c of crew) {
        if (c.id == id) {
          return true;
        }
      }
      return false;
    },
  },
}).mount("#port");

function appData(): AppData {
  return app.$data as AppData;
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

  game = new Game(UI.canvas, UI.mapCanvas, json, skin, UI.nameInput.value);

  UI.game.classList.add("open");
  game.soundEngine.play(Sound.Ambience_Ship_LOOP, 0.25);

  game.on(GameEvent.DISMISS_DIALOGUE, (d) => {
    UI.dialogue.classList.remove("open");
  });

  game.on(GameEvent.DIALOGUE, (d) => {
    if (d.dialogue) {
      UI.dialogueText.innerHTML = d.dialogue.text;
      UI.dialogueImage.src = "/assets/characters/" + d.dialogue.image + ".png";
      if (UI.dialogue.classList.contains("open")) {
        UI.dialogue.classList.remove("open");
        setTimeout(() => {
          UI.dialogue.classList.add("open");
        }, 500);
      } else {
        UI.dialogue.classList.add("open");
      }
    }
  });

  game.on(GameEvent.ARRIVE_PORT, (d) => {
    if (d.port && !portOpen) {
      UI.port.classList.add("open");
      game.soundEngine.play(Sound.Item_Chest_Opening_01);
      game.soundEngine.play(Sound.Ambience_Tavern_WithoutMusic_LOOP, 0.5);

      appData().name = d.port.name;

      let items: CargoItem[] = [];
      for (var i in d.port.store) {
        items.push({
          id: i,
          price: d.port.store[i],
        });
      }

      appData().items = items;
      appData().crew = d.port.crew;
      appData().myCrew = game.player.crew;

      portOpen = true;
    }
  });

  game.on(GameEvent.OPEN_MAP, (d) => {
    if (UI.map.classList.contains("open")) {
      UI.map.classList.remove("open");
      game.soundEngine.play(Sound.Player_Map_Close);
    } else {
      UI.map.classList.add("open");
      game.soundEngine.play(Sound.Player_Map_Open);
    }
  });

  game.on(GameEvent.LEAVE_PORT, (d) => {
    if (portOpen) {
      UI.port.classList.remove("open");
      portOpen = false;
      game.soundEngine.play(Sound.Item_Chest_Close);
      game.soundEngine.stop(Sound.Ambience_Tavern_WithoutMusic_LOOP);

      // turn of repair sound
      game.soundEngine.stop(Sound.Player_Ship_Repair_04);
    }
  });

  game.on(GameEvent.UI_UPDATE, (d) => {
    if (d.ui) {
      if (game.DEBUG) {
        UI.stats.innerHTML =
          `${d.ui.player.acceleration} px/t^2 => ${d.ui.player.speed} px/t | ${d.ui.player.health}% | ${d.ui.player.heading} degrees | ${d.ui.ping} ms | ${d.ui.player.kills} kills | ${d.ui.player.x}, ${d.ui.player.y} | dead: ${d.ui.player.dead} | $${d.ui.player.money} <br>` +
          `${JSON.stringify(d.ui.player.inventory)}`;
      } else {
        let maxHealth = 100;
        d.ui.player.crew.forEach((c) => {
          if (c.bonus == CrewBonus.MORE_HEALTH) {
            maxHealth = UPGRADE_MAX_HEALTH;
          }
        });
        let inventory = "";

        for (let i of Object.keys(d.ui.player.inventory)) {
          inventory += ` <i class='inventory tooltip tooltip-up ${i}'></i> ${d.ui.player.inventory[i]}`;
        }

        UI.stats.innerHTML = `${inventory} <i class='inventory tooltip tooltip-up money'></i> ${d.ui.player.money} <progress value="${d.ui.player.health}" max="${maxHealth}"></progress>`;
      }

      appData().myCrew = game.player.crew;

      UI.playerList.innerHTML = `
      ${(() => {
        var r = "";
        for (let p of d.ui.ships) {
          r += `<li>${p.name} - ${p.kills} / ${p.deaths} K/D</li>`;
        }
        return r;
      })()}
      `;
    }
  });

  UI.menu.classList.remove("open");
}

UI.startButton?.addEventListener("click", startGame);
