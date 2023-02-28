const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(`${__dirname}/client`));

const { dealCards, newDeck, shuffle } = require("./controllers.js");

let currentNum = 0;

const playerNames = [
  "playerOne",
  "playerTwo",
  "playerThree",
  "playerFour",
  "playerFive",
  "playerSix",
];

const tableOne = { deck: null, players: {}, communityCards: null, pot: 0 };

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
    for (player of Object.values(tableOne.players)) {
      if (player.clientId === clientId) {
        socket.emit("alreadySat");
        return;
      }
    }

    for (player of Object.values(tableOne.players)) {
      if (player.seatId === seatId) {
        socket.emit("seatTaken", seatId);
        return;
      }
    }

    if (Object.keys(tableOne.players).length === 0) {
      //when first person joins set to playerOne tableOne.players Object
      tableOne.players.playerOne = { clientId, seatId, stack: 5000 };
      io.to(clientId).emit("success", seatId);
      socket.broadcast.emit("opponent", seatId);
    } else {
      //do for the rest by finding client at last index
      tableOne.players[
        playerNames[
          playerNames.indexOf(
            Object.keys(tableOne.players)[
              Object.keys(tableOne.players).length - 1
            ]
          ) + 1
        ]
      ] = { clientId, seatId, stack: 5000 };
      io.to(clientId).emit("success", seatId, clientId);
      socket.broadcast.emit("opponent", seatId);
    }

    if (Object.keys(tableOne.players).length > 1) {
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

        console.log(tableOne.players);
        console.log(tableOne.deck.length);

        //testing at the moment: counter only on playerOne
        io.to(tableOne.players[playerNames[0]].clientId).emit(
          "startGame",
          tableOne.players[playerNames[0]].seatId,
          0
        );
      }
      io.emit("table", tableOne);
    }
  });

  socket.on("bet", (betSize) => {
    currentNum++;

    for (let player in tableOne.players) {
      if (tableOne.players[player].clientId === clientId) {
        tableOne.players[player].stack -=
          tableOne.players[player].stack * (betSize / 100);
        const stack = tableOne.players[player].stack;
        console.log(stack);
        socket.emit("bet", stack);
      }
    }
    if (tableOne.players[playerNames[currentNum]]) {
      io.to(tableOne.players[playerNames[currentNum]].clientId).emit(
        "startGame",
        tableOne.players[playerNames[currentNum]].seatId,
        betSize
      );
    }
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
