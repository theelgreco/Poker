const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(`${__dirname}/client`));

const { dealCards, newDeck, shuffle } = require("./controllers.js");

let currentNum = 0;
let bettingRound;
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
  communityCards: null,
  pot: 0,
  seats: [
    { seatOne: { clientId: null } },
    { seatTwo: { clientId: null } },
    { seatThree: { clientId: null } },
    { seatFour: { clientId: null } },
    { seatFive: { clientId: null } },
    { seatSix: { clientId: null } },
  ],
};

io.on("connection", (socket) => {
  const clients = [];
  const clientId = socket.id;
  for (let sockets in io.sockets.sockets) {
    clients.push(sockets);
  }

  socket.emit("connection", tableOne);

  console.log("a user has connected " + clientId);
  console.log(clients);

  socket.on("sit", ({ clientId, tableId, seatId }) => {
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
      tableOne.players.playerOne = { clientId, seatId, stack: 5000 };
      io.to(clientId).emit("success", seatId);
      socket.broadcast.emit("opponent", seatId);
    } else {
      //Assign players to next available player name in players object on tableOne object
      tableOne.players[nextAvailablePlayerName] = {
        clientId,
        seatId,
        stack: 5000,
      };
      io.to(clientId).emit("success", seatId, clientId);
      socket.broadcast.emit("opponent", seatId);
    }

    //Assign each player to correct seat in seats array on tableOne object
    seats.map((seat) => {
      const seatName = Object.keys(seat)[0];
      if (seatId === seatName) {
        seat[seatId].clientId = clientId;
      }
    });

    //If there are more than one players sat and there is not a game in progress, begin game
    if (eachPlayerName.length > 0 && !gameInProgress) {
      startGame();
      io.emit("table", tableOne);
    }
  });

  socket.on("bet", ({ betSize, currentSeat }) => {
    const seats = tableOne.seats;
    const playersSitting = seats.filter((seat) => {
      const seatName = Object.keys(seat)[0];
      return seat[seatName].clientId !== null;
    });
    console.log(playersSitting, "<----sitting");

    seats.map((seat) => {
      if (seat[currentSeat]) {
        seat[currentSeat].played = true;
      }
    });

    for (let player in tableOne.players) {
      if (tableOne.players[player].clientId === clientId) {
        betSize = tableOne.players[player].stack * (betSize / 100);
        tableOne.pot += betSize;
        io.emit("pot", tableOne.pot);
        tableOne.players[player].stack -= betSize;
        const stack = tableOne.players[player].stack;
        console.log(betSize);
        console.log(stack);
        socket.emit("bet", stack);
      }
    }

    //Find the next seat in seats array of tableOne object that is playing
    //and that is not the sender client
    function isNotNull(seat) {
      const seatName = Object.keys(seat)[0];
      return (
        seat[seatName].clientId !== null &&
        seat[seatName].clientId !== clientId &&
        seat[seatName].playing &&
        seat[seatName].played !== true
      );
    }
    if (!Object.keys(nextPlayer)[0]) {
    }
    const nextPlayer = seats.find(isNotNull);
    const nextPlayerSeatName = Object.keys(nextPlayer)[0];
    const nextPlayerClientId = nextPlayer[nextPlayerSeatName].clientId;

    console.log(nextPlayer, "<-------");

    //Send betting options to that player
    io.to(nextPlayerClientId).emit("startGame", nextPlayerSeatName, betSize);
  });

  socket.on("fold", (seatId) => {
    const seats = tableOne.seats;

    seats.map((seat) => {
      if (seat[seatId]) {
        seat[seatId].playing = false;
      }
    });

    console.dir(seats, { depth: null });

    socket.emit("fold", seatId);

    const playersPlaying = seats.filter((seat) => {
      const seatName = Object.keys(seat)[0];
      return seat[seatName].playing === true;
    });

    if (playersPlaying.length === 1) {
      playersPlaying.forEach((player) => {
        console.log(player, "<------this one");
        const lastPlayerSeatName = Object.keys(player)[0];
        const lastPlayerClientId = player[lastPlayerSeatName].clientId;
        io.to(lastPlayerClientId).emit("gameEnded", lastPlayerSeatName);
        socket.emit("gameEnded", seatId);
        setTimeout(startGame, 5000);
      });
    }

    console.log(seats);
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

function startGame() {
  const seats = tableOne.seats;
  gameInProgress = true;

  seats.map((seat) => {
    const seatName = Object.keys(seat)[0];
    if (seat[seatName].clientId) {
      seat[seatName].playing = true;
      console.log(seat[seatName]);
    }
  });

  dealCards(tableOne);
  for (const player in tableOne.players) {
    const cardOne = tableOne.players[player].cardOne;
    const cardTwo = tableOne.players[player].cardTwo;
    const seatId = tableOne.players[player].seatId;
    const stack = tableOne.players[player].stack;

    io.to(tableOne.players[player].clientId).emit("dealt", {
      cardOne,
      cardTwo,
      seatId,
      stack,
    });

    //Find first seat in seats array on tableOne Object that is occupied/not null
    function isNotNull(seat) {
      const seatName = Object.keys(seat)[0];
      return seat[seatName].clientId !== null;
    }
    const firstPlayer = seats.find(isNotNull);
    const firstPlayerSeatName = Object.keys(firstPlayer)[0];
    const firstPlayerClientId = firstPlayer[firstPlayerSeatName].clientId;

    //Send start game to that first player
    io.to(firstPlayerClientId).emit("startGame", firstPlayerSeatName, 0);
  }
  console.dir(tableOne, { depth: null });
  console.log(tableOne.deck.length);
}
