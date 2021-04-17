import "./style.scss";
import { Game, GameEvent } from "./class/Game";
import { Cargo, Skin } from "../../shared/Protocol";

const DEBUG = true;

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
  port: $(".port") as HTMLDivElement,
  stats: $(".stats") as HTMLDivElement,
  startButton: $("#startButton") as HTMLButtonElement,
  nameInput: $("#name") as HTMLInputElement,
  skinInput: $("#skin") as HTMLSelectElement,
};

let game: Game;
let portOpen = false;

UI.startButton?.addEventListener("click", (e) => {
  game = new Game(
    UI.canvas,
    UI.nameInput.value,
    (parseInt(UI.skinInput.value) as any) as Skin
  );

  UI.game.classList.add("open");

  game.on(GameEvent.ARRIVE_PORT, (d) => {
    if (d.port && !portOpen) {
      UI.port.classList.add("open");
      UI.port.innerHTML = `
        <h1>${d.port.name}</h1>
        <div class='store'>
          ${(() => {
            let r = "";
            for (var i in d.port.store) {
              r += `
              <p class='item'>
                <button id="buy_${i}">Buy (${d.port.store[i].buy})</button>
                <button id="sell_${i}">Sell (${d.port.store[i].sell})</button>  
                <b><i class='inventory ${i}'></i></b>
              </p>`;
            }
            return r;
          })()}
        </div><br>
        <button id="repair_button">Repair 1% (1 wood)</button>
      `;

      for (var i in d.port.store) {
        $("#buy_" + i).addEventListener(
          "click",
          (function (i) {
            return function () {
              game.buy(i as Cargo);
            };
          })(i)
        );

        $("#sell_" + i).addEventListener(
          "click",
          (function (i) {
            return function () {
              game.sell(i as Cargo);
            };
          })(i)
        );
      }

      $("#repair_button").addEventListener("click", () => {
        game.repair();
      });

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
      if (DEBUG) {
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
});
