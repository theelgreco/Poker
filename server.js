const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(`${__dirname}/client`));

const {
  dealCards,
  dealFlop,
  dealTurn,
  dealRiver,
} = require("./controllers.js");

const { formatHands, fetchWinningHand } = require("./utils.js");

let firstToBet;
let gameInProgress;

const playerNames = [
  "playerOne",
  "playerTwo",
  "playerThree",
  "playerFour",
  "playerFive",
  "playerSix",
];

const tableOne = {
  deck: null,
  players: {},
  pot: 0,
  seats: [
    { seatOne: { clientId: null } },
    { seatTwo: { clientId: null } },
    { seatThree: { clientId: null } },
    { seatFour: { clientId: null } },
    { seatFive: { clientId: null } },
    { seatSix: { clientId: null } },
  ],
  communityCards: [[], [], []],
};

let playersSat;
let activePlayers;
let lastToAct;
let lastToActIndex;
let lastToActPlayed = false;

io.on("connection", (socket) => {
  const clients = [];
  const clientId = socket.id;
  for (let sockets in io.sockets.sockets) {
    clients.push(sockets);
  }
  socket.emit("connection", tableOne);
  socket.emit("updatePot", tableOne.pot);
  if (tableOne.communityCards[0].length) {
    socket.emit("flop", tableOne.communityCards[0]);
  }
  if (tableOne.communityCards[1].length) {
    socket.emit("turn", tableOne.communityCards[1]);
  }
  if (tableOne.communityCards[2].length) {
    socket.emit("river", tableOne.communityCards[2]);
  }

  console.log("a user has connected " + clientId);
  console.log(clients);

  socket.on("sit", ({ clientId, seatId }) => {
    //The values for each active player on the table object --> the values are clientId, cards, etc.
    const eachPlayerObject = Object.values(tableOne.players);
    //The active player names on the table object, e.g playerOne
    const eachPlayerName = Object.keys(tableOne.players);
    //seat objects on the table object
    const seats = tableOne.seats;

    for (player of eachPlayerObject) {
      //Alert player if they are already sat in a seat
      if (player.clientId === clientId) {
        socket.emit("alreadySat");
        return;
      }

      //Alert player if someone is already sat in the seat they selected
      if (player.seatId === seatId) {
        socket.emit("seatTaken", seatId);
        return;
      }
    }

    //This is the index of the next player name that is available on the playerNames array
    const nextAvailablePlayerName =
      playerNames[
        playerNames.indexOf(eachPlayerName[eachPlayerName.length - 1]) + 1
      ];

    //Assign each player to correct player name on sit, e.g playerOne
    if (eachPlayerName.length === 0) {
      //Assign first player to playerOne in players object on tableOne object
      tableOne.players.playerOne = { clientId, seatId };
      io.to(clientId).emit("success", seatId);
      socket.broadcast.emit("opponent", seatId);
    } else {
      //Assign players to next available player name in players object on tableOne object
      tableOne.players[nextAvailablePlayerName] = {
        clientId,
        seatId,
      };
      io.to(clientId).emit("success", seatId, clientId);
      socket.broadcast.emit("opponent", seatId);
    }

    //Assign each player to correct seat in seats array on tableOne object
    seats.map((seat) => {
      const seatName = Object.keys(seat)[0];
      if (seatId === seatName) {
        seat[seatId].clientId = clientId;
        seat[seatId].stack = 5000;
      }
    });

    playersSat = seats.filter((seat) => {
      const seatName = Object.keys(seat)[0];
      return seat[seatName].clientId;
    });

    //start game when 2 players are sat
    if (playersSat.length > 1 && !gameInProgress) {
      const { index, firstPlayerClientId } = initGame(playersSat, tableOne);
      console.dir(tableOne, { depth: null });
      console.log(tableOne.deck.length);
      activePlayers = playersSat.filter((seat) => {
        const seatName = Object.keys(seat)[0];
        return seat[seatName].playing === true;
      });
      activePlayers.forEach((player) => {
        const seatName = Object.keys(player)[0];
        const cards = player[seatName].cards;
        io.to(player[seatName].clientId).emit("cards", cards, seatName);
      });
      io.to(firstPlayerClientId).emit("game", index, 50);
      io.emit("updatePot", tableOne.pot);
    }
  });

  //if anything messes up, everything up to socket.on disconnect was moved out of socket.on sit
  socket.on("game", (index, move, betSize, seat) => {
    console.log(betSize, "<----bet");
    console.log(activePlayers, "<---------active");

    if (!lastToActPlayed) {
      if (tableOne.bettingRound === "preflop") {
        lastToActIndex = activePlayers.length - 1;
        lastToAct = Object.keys(activePlayers[lastToActIndex])[0];
      } else {
        if (activePlayers.length > 2) {
          lastToActIndex = activePlayers.length - 3;
          lastToAct = Object.keys(activePlayers[lastToActIndex])[0];
        } else {
          lastToActIndex = activePlayers.length - 2;
          lastToAct = Object.keys(activePlayers[lastToActIndex])[0];
        }
      }
    }

    // if (seat === lastToAct && lastToActPlayed) lastToActPlayed = false;

    console.log(index, "||", move, betSize, seat, "||", lastToAct);

    if (move === "fold") {
      activePlayers.splice(index, 1);

      //end game if 1 player left
      if (activePlayers.length === 1) {
        lastToActPlayed = false;
        io.emit("gameOver");
        const { index, firstPlayerClientId } = initGame(playersSat, tableOne);
        console.dir(tableOne, { depth: null });
        console.log(tableOne.deck.length);
        activePlayers = playersSat.filter((seat) => {
          const seatName = Object.keys(seat)[0];
          return seat[seatName].playing === true;
        });
        activePlayers.forEach((player) => {
          const seatName = Object.keys(player)[0];
          const cards = player[seatName].cards;
          io.to(player[seatName].clientId).emit("cards", cards, seatName);
        });
        const betSize = 50;
        io.to(firstPlayerClientId).emit("game", index, betSize);
      }

      if (seat === lastToAct) {
        betSize = 0;
      }

      if (activePlayers[index]) {
        const nextPlayer = activePlayers[index];
        const nextPlayerSeat = Object.keys(nextPlayer)[0];
        const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
        io.to(nextPlayerClientId).emit("game", index, betSize);
      } else {
        index = 0;
        const firstPlayer = activePlayers[0];
        const firstPlayerSeatName = Object.keys(firstPlayer)[0];
        const firstPlayerClientId = firstPlayer[firstPlayerSeatName].clientId;
        io.to(firstPlayerClientId).emit("game", index, betSize);
      }
    }

    if (move === "call" || move === "raise") {
      const currentPlayer = activePlayers[index - 1];
      const currentPlayerSeat = Object.keys(currentPlayer)[0];

      currentPlayer[currentPlayerSeat].stack -=
        betSize - currentPlayer[currentPlayerSeat].stake;

      if (currentPlayer[currentPlayerSeat].stake > 0) {
        tableOne.pot += betSize - currentPlayer[currentPlayerSeat].stake;
      } else {
        tableOne.pot += betSize;
      }

      currentPlayer[currentPlayerSeat].stake +=
        betSize - currentPlayer[currentPlayerSeat].stake;

      // console.log(currentPlayer);
    }

    if (move === "call" || move === "check") {
      if (tableOne.bettingRound === "preflop" && seat === lastToAct) {
        console.log("yep");
        tableOne.bettingRound = "flop";
        dealFlop(tableOne);
        lastToActPlayed = false;
        betSize = 0;
        activePlayers.map((player) => {
          const seatName = Object.keys(player)[0];
          player[seatName].stake = 0;
        });
        io.emit("flop", tableOne.communityCards[0]);
        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          io.to(nextPlayerClientId).emit("game", index, betSize);
          console.dir(tableOne, { depth: null });
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          io.to(nextPlayerClientId).emit("game", index, betSize);
          console.dir(tableOne, { depth: null });
        }
      } else if (tableOne.bettingRound === "flop" && seat === lastToAct) {
        tableOne.bettingRound = "turn";
        betSize = 0;
        dealTurn(tableOne);
        lastToActPlayed = false;
        activePlayers.map((player) => {
          const seatName = Object.keys(player)[0];
          player[seatName].stake = 0;
        });
        io.emit("turn", tableOne.communityCards[1]);
        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          io.to(nextPlayerClientId).emit("game", index, betSize);
          console.dir(tableOne, { depth: null });
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          io.to(nextPlayerClientId).emit("game", index, betSize);
          console.dir(tableOne, { depth: null });
        }
      } else if (tableOne.bettingRound === "turn" && seat === lastToAct) {
        tableOne.bettingRound = "river";
        dealRiver(tableOne);
        lastToActPlayed = false;
        betSize = 0;
        activePlayers.map((player) => {
          const seatName = Object.keys(player)[0];
          player[seatName].stake = 0;
        });
        io.emit("river", tableOne.communityCards[2]);
        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          io.to(nextPlayerClientId).emit("game", index, betSize);
          console.dir(tableOne, { depth: null });
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          io.to(nextPlayerClientId).emit("game", index, betSize);
          console.dir(tableOne, { depth: null });
        }
      } else if (tableOne.bettingRound === "river" && seat === lastToAct) {
        //calculate winner
        const hands = formatHands(tableOne);
        console.log(hands);
        fetchWinningHand(hands).then((res) => {
          console.log(res);
          setTimeout(() => {
            // start new game
            lastToActPlayed = false;
            const { index, firstPlayerClientId } = initGame(
              playersSat,
              tableOne
            );
            console.dir(tableOne, { depth: null });
            console.log(tableOne.deck.length);
            activePlayers = playersSat.filter((seat) => {
              const seatName = Object.keys(seat)[0];
              return seat[seatName].playing === true;
            });
            io.emit("gameOver");
            io.emit("updatePot", tableOne.pot);
            activePlayers.forEach((player) => {
              const seatName = Object.keys(player)[0];
              const cards = player[seatName].cards;
              io.to(player[seatName].clientId).emit("cards", cards, seatName);
            });
            const betSize = 50;
            io.to(firstPlayerClientId).emit("game", index, betSize);
          }, 5000);
        });
      }
      //if there is a player at the index send game to them
      //else send to player at index 0
      if (activePlayers[index]) {
        const nextPlayer = activePlayers[index];
        const nextPlayerSeat = Object.keys(nextPlayer)[0];
        const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
        if (nextPlayer[nextPlayerSeat].stake - betSize === 0) betSize = 0;
        io.to(nextPlayerClientId).emit("game", index, betSize);
      } else {
        index = 0;
        const firstPlayer = activePlayers[0];
        const firstPlayerSeat = Object.keys(firstPlayer)[0];
        const firstPlayerClientId = firstPlayer[firstPlayerSeat].clientId;
        if (firstPlayer[firstPlayerSeat].stake - betSize === 0) betSize = 0;
        io.to(firstPlayerClientId).emit("game", index, betSize);
      }
    }

    if (move === "raise") {
      if (seat === lastToAct) {
        lastToActPlayed = true;
        console.log("yep");

        if (lastToActIndex + 1 > activePlayers.length - 1) {
          lastToActIndex = 0;
        } else {
          lastToActIndex += 1;
        }
        lastToAct = Object.keys(activePlayers[lastToActIndex])[0];
        // console.log(lastToAct, lastToActIndex);
      }

      //if there is a player at the index send game to them
      //else send to player at index 0
      if (activePlayers[index]) {
        const nextPlayer = activePlayers[index];
        const nextPlayerSeat = Object.keys(nextPlayer)[0];
        const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
        io.to(nextPlayerClientId).emit("game", index, betSize);
      } else {
        index = 0;
        const firstPlayer = activePlayers[0];
        const firstPlayerSeatName = Object.keys(firstPlayer)[0];
        const firstPlayerClientId = firstPlayer[firstPlayerSeatName].clientId;
        io.to(firstPlayerClientId).emit("game", index, betSize);
      }
    }

    activePlayers.forEach((player) => {
      const seatName = Object.keys(player)[0];
      const stack = player[seatName].stack;
      io.to(player[seatName].clientId).emit("updateStack", stack);
    });

    io.emit("updatePot", tableOne.pot);
  });

  socket.on("disconnect", () => {
    console.log(clientId + " has disconnected");
    clients.splice(clients.indexOf(clientId), 1);
    io.emit("disconnect");
    console.log(clients);
  });
});

server.listen(8080, () => {
  console.log("listening on 8080");
});

function initGame(players, table) {
  table.pot = 0;
  table.deck = null;
  (table.communityCards = [[], [], []]),
    //set the blinds
    players.map((player, index) => {
      const seatName = Object.keys(player)[0];
      player[seatName].playing = true;
      player[seatName].cards = [];

      if (index === players.length - 1) {
        table.pot += 50;
        player[seatName].stake = 50;
        player[seatName].stack -= 50;
      } else if (index === players.length - 2) {
        table.pot += 25;
        player[seatName].stake = 25;
        player[seatName].stack -= 25;
      } else {
        return (player[seatName].stake = 0);
      }
    });

  dealCards(players, table);

  let index = 0;
  gameInProgress = true;
  table.bettingRound = "preflop";
  let firstPlayerObject = players[0];
  let firstPlayerSeatName = Object.keys(firstPlayerObject)[0];
  let firstPlayerClientId = firstPlayerObject[firstPlayerSeatName].clientId;
  return { index, firstPlayerClientId };
}
