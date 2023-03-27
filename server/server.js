const http = require("http");
const express = require("express");
// const socketio = require("socket.io");
const { Server } = require("socket.io");
const app = express();
const cors = require("cors");
const server = http.createServer(app);
// const io = socketio(server);
const PORT = process.env.PORT || 3001;
const io = new Server(server, {
  cors: {
    origin: "https://tranquil-gingersnap-6d4dfa.netlify.app",
  },
});
// app.use(express.static(`${__dirname}/../client`));

const {
  dealCards,
  dealFlop,
  dealTurn,
  dealRiver,
} = require("./controllers.js");

const { formatHands, fetchWinningHand } = require("./utils.js");

const tableOne = {
  deck: null,
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

let gameInProgress;
let lastToAct;
let lastToActIndex;
let lastToActPlayed = false;
let playersSat = [];
let activePlayers = [];
let clientsSat = [];
const clients = [];

io.on("connection", (socket) => {
  const clientId = socket.id;
  // for (let sockets in io.sockets.sockets) {
  //   clients.push(sockets);
  // }
  clients.push(clientId);

  const seats = tableOne.seats;

  seats.forEach((seat) => {
    const seatName = Object.keys(seat)[0];
    if (seat[seatName].clientId) {
      socket.emit("opponent", seatName);
    }
  });

  socket.emit("connection", tableOne);

  if (tableOne.bettingRound === "preflop") {
    socket.emit("updatePot", 0);
  } else {
    socket.emit("updatePot", tableOne.pot);
  }

  if (tableOne.communityCards[0].length) {
    socket.emit("flop", tableOne.communityCards[0]);
  }
  if (tableOne.communityCards[1].length) {
    socket.emit("turn", tableOne.communityCards[1]);
  }
  if (tableOne.communityCards[2].length) {
    socket.emit("river", tableOne.communityCards[2]);
  }
  if (activePlayers) {
    let activeSeatNames = [];
    activePlayers.forEach((player) => {
      const seatName = Object.keys(player)[0];
      activeSeatNames.push([seatName, player[seatName].stake]);
    });
    io.emit("stakes", activeSeatNames);
  }

  console.log("a user has connected " + clientId);
  console.log(clients);

  socket.on("sit", ({ clientId, seatId }) => {
    //seat objects on the table object
    const seats = tableOne.seats;

    //Assign each player to correct seat in seats array on tableOne object
    for (let i = 0; i < seats.length; i++) {
      const seatName = Object.keys(seats[i])[0];
      //prettier-ignore
      if (seats[i][seatName].clientId && seats[i][seatName].clientId !== clientId && seatName === seatId) {
        socket.emit("seatTaken", seatName);
        break;
      } else if (clientsSat.includes(clientId)) {
        socket.emit("alreadySat");
        break;
      } else if (seatName === seatId) {
        seats[i][seatId].clientId = clientId;
        seats[i][seatId].stack = 5000;
        socket.emit("success", seatName);
        socket.broadcast.emit("opponent", seatName);
        clientsSat.push(clientId);
        break;
      }
    }

    //assign username to seat
    socket.on("username", (username, seat) => {
      seats.map((player) => {
        const seatName = Object.keys(player)[0];
        if (seatName === seat) {
          player[seatName].username = username;
        }
      });
    });

    playersSat = seats.filter((seat) => {
      const seatName = Object.keys(seat)[0];
      return seat[seatName].clientId;
    });

    //start game when 2 players are sat
    if (playersSat.length > 1 && !gameInProgress) {
      const { index, firstPlayerClientId } = initGame(playersSat, tableOne);

      activePlayers = playersSat.filter((seat) => {
        const seatName = Object.keys(seat)[0];
        return seat[seatName].playing === true;
      });
      activePlayers.forEach((player) => {
        const seatName = Object.keys(player)[0];
        const cards = player[seatName].cards;
        const stake = player[seatName].stake;
        io.to(player[seatName].clientId).emit("cards", cards, seatName);
        io.to(player[seatName].clientId).emit("stake", stake);
      });
      io.to(firstPlayerClientId).emit("game", index, 50);

      let activeSeatNames = [];
      activePlayers.forEach((player) => {
        const seatName = Object.keys(player)[0];
        activeSeatNames.push([seatName, player[seatName].stake]);
      });
      io.emit("stakes", activeSeatNames);
    }
  });

  socket.on("game", (index, move, betSize, seat) => {
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

    console.log(index, "||", move, betSize, seat, "||", lastToAct);

    if (move === "fold") {
      io.emit("stakes", seat, true);

      activePlayers.splice(index, 1);

      //end game if 1 player left
      if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        const winnerSeat = Object.keys(winner)[0];

        seats.map((seat) => {
          const seatName = Object.keys(seat)[0];

          if (seatName === winnerSeat) {
            const username = seat[seatName].username;
            io.emit("winner", username, seatName);
            return (seat[seatName].stack += tableOne.pot);
          }
        });

        lastToActPlayed = false;

        setTimeout(() => {
          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push(seatName);
          });
          io.emit("gameOver", activeSeatNames);
        }, 2000);

        setTimeout(() => {
          // start new game
          const { index, firstPlayerClientId } = initGame(playersSat, tableOne);

          activePlayers = playersSat.filter((seat) => {
            const seatName = Object.keys(seat)[0];
            return seat[seatName].playing === true;
          });

          io.emit("updatePot", 0);

          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            const cards = player[seatName].cards;
            io.to(player[seatName].clientId).emit("cards", cards, seatName);
          });

          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push([seatName, player[seatName].stake]);
          });
          io.emit("stakes", activeSeatNames);

          const betSize = 50;

          io.to(firstPlayerClientId).emit("game", index, betSize);
        }, 5000);
      } else if (tableOne.bettingRound === "preflop" && seat === lastToAct) {
        betSize = 0;

        setTimeout(() => {
          tableOne.bettingRound = "flop";
          dealFlop(tableOne);
          lastToActPlayed = false;
          activePlayers.map((player) => {
            const seatName = Object.keys(player)[0];
            player[seatName].stake = 0;
          });

          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push(seatName);
          });
          io.emit("newRound", activeSeatNames);

          io.emit("updatePot", tableOne.pot);
          io.emit("flop", tableOne.communityCards[0]);
        }, 1000);

        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        }
      } else if (tableOne.bettingRound === "flop" && seat === lastToAct) {
        betSize = 0;

        setTimeout(() => {
          tableOne.bettingRound = "turn";
          dealTurn(tableOne);
          lastToActPlayed = false;
          activePlayers.map((player) => {
            const seatName = Object.keys(player)[0];
            player[seatName].stake = 0;
          });

          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push(seatName);
          });
          io.emit("newRound", activeSeatNames);

          io.emit("updatePot", tableOne.pot);
          io.emit("turn", tableOne.communityCards[1]);
        }, 1000);

        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        }
      } else if (tableOne.bettingRound === "turn" && seat === lastToAct) {
        betSize = 0;

        setTimeout(() => {
          tableOne.bettingRound = "river";
          dealRiver(tableOne);
          lastToActPlayed = false;

          activePlayers.map((player) => {
            const seatName = Object.keys(player)[0];
            player[seatName].stake = 0;
          });

          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push(seatName);
          });
          io.emit("newRound", activeSeatNames);

          io.emit("updatePot", tableOne.pot);
          io.emit("river", tableOne.communityCards[2]);
        }, 1000);

        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        }
      } else if (tableOne.bettingRound === "river" && seat === lastToAct) {
        //calculate winner
        const hands = formatHands(tableOne);

        fetchWinningHand(hands).then((res) => {
          console.log(res);

          lastToActPlayed = false;

          setTimeout(() => {
            let activeSeatNames = [];
            activePlayers.forEach((player) => {
              const seatName = Object.keys(player)[0];
              activeSeatNames.push(seatName);
            });
            io.emit("gameOver", activeSeatNames);
          }, 2000);

          setTimeout(() => {
            // start new game
            const { index, firstPlayerClientId } = initGame(
              playersSat,
              tableOne
            );

            activePlayers = playersSat.filter((seat) => {
              const seatName = Object.keys(seat)[0];
              return seat[seatName].playing === true;
            });

            io.emit("updatePot", 0);

            activePlayers.forEach((player) => {
              const seatName = Object.keys(player)[0];
              const cards = player[seatName].cards;
              io.to(player[seatName].clientId).emit("cards", cards, seatName);
            });

            let activeSeatNames = [];
            activePlayers.forEach((player) => {
              const seatName = Object.keys(player)[0];
              activeSeatNames.push([seatName, player[seatName].stake]);
            });
            io.emit("stakes", activeSeatNames);

            const betSize = 50;

            io.to(firstPlayerClientId).emit("game", index, betSize);
          }, 5000);
        });
      } else {
        if (activePlayers[index]) {
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        } else {
          index = 0;
          const firstPlayer = activePlayers[0];
          const firstPlayerSeatName = Object.keys(firstPlayer)[0];
          const firstPlayerClientId = firstPlayer[firstPlayerSeatName].clientId;
          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(firstPlayerClientId).emit("game", index, betSize);
          }, 1200);
        }
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

      let activeSeatNames = [];
      activePlayers.forEach((player) => {
        const seatName = Object.keys(player)[0];
        activeSeatNames.push([seatName, player[seatName].stake]);
      });
      io.emit("stakes", activeSeatNames);
    }

    if (move === "call" || move === "check") {
      if (tableOne.bettingRound === "preflop" && seat === lastToAct) {
        betSize = 0;

        setTimeout(() => {
          tableOne.bettingRound = "flop";
          dealFlop(tableOne);
          lastToActPlayed = false;
          activePlayers.map((player) => {
            const seatName = Object.keys(player)[0];
            player[seatName].stake = 0;
          });

          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push(seatName);
          });
          io.emit("newRound", activeSeatNames);

          io.emit("updatePot", tableOne.pot);
          io.emit("flop", tableOne.communityCards[0]);
        }, 1000);

        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        }
      } else if (tableOne.bettingRound === "flop" && seat === lastToAct) {
        betSize = 0;

        setTimeout(() => {
          tableOne.bettingRound = "turn";
          dealTurn(tableOne);
          lastToActPlayed = false;
          activePlayers.map((player) => {
            const seatName = Object.keys(player)[0];
            player[seatName].stake = 0;
          });

          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push(seatName);
          });
          io.emit("newRound", activeSeatNames);

          io.emit("updatePot", tableOne.pot);
          io.emit("turn", tableOne.communityCards[1]);
        }, 1000);

        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        }
      } else if (tableOne.bettingRound === "turn" && seat === lastToAct) {
        betSize = 0;

        setTimeout(() => {
          tableOne.bettingRound = "river";
          dealRiver(tableOne);
          lastToActPlayed = false;

          activePlayers.map((player) => {
            const seatName = Object.keys(player)[0];
            player[seatName].stake = 0;
          });

          let activeSeatNames = [];
          activePlayers.forEach((player) => {
            const seatName = Object.keys(player)[0];
            activeSeatNames.push(seatName);
          });
          io.emit("newRound", activeSeatNames);

          io.emit("updatePot", tableOne.pot);
          io.emit("river", tableOne.communityCards[2]);
        }, 1000);

        if (activePlayers.length > 2) {
          index = activePlayers.length - 2;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        } else {
          index = activePlayers.length - 1;
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;

          console.dir(tableOne, { depth: null });

          setTimeout(() => {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }, 1200);
        }
      } else if (tableOne.bettingRound === "river" && seat === lastToAct) {
        //calculate winner
        const hands = formatHands(tableOne);

        fetchWinningHand(hands).then((res) => {
          const seats = tableOne.seats;
          const winningHand = res.winners[0];
          const players = res.players;
          let winningIndex;

          players.forEach((player, index) => {
            if (player.cards === winningHand.cards) winningIndex = index;
          });

          const winner = activePlayers[winningIndex];
          const winnerSeat = Object.keys(winner)[0];

          console.log(winner, winnerSeat, "<-----indexwin");

          seats.map((seat) => {
            const seatName = Object.keys(seat)[0];

            if (seatName === winnerSeat) {
              const username = seat[seatName].username;
              io.emit("winner", username, seatName);
              return (seat[seatName].stack += tableOne.pot);
            }
          });

          lastToActPlayed = false;

          setTimeout(() => {
            let activeSeatNames = [];
            activePlayers.forEach((player) => {
              const seatName = Object.keys(player)[0];
              activeSeatNames.push(seatName);
            });
            io.emit("gameOver", activeSeatNames);
          }, 2000);

          setTimeout(() => {
            // start new game
            const { index, firstPlayerClientId } = initGame(
              playersSat,
              tableOne
            );

            activePlayers = playersSat.filter((seat) => {
              const seatName = Object.keys(seat)[0];
              return seat[seatName].playing === true;
            });

            io.emit("updatePot", 0);

            activePlayers.forEach((player) => {
              const seatName = Object.keys(player)[0];
              const cards = player[seatName].cards;
              io.to(player[seatName].clientId).emit("cards", cards, seatName);
            });

            let activeSeatNames = [];
            activePlayers.forEach((player) => {
              const seatName = Object.keys(player)[0];
              activeSeatNames.push([seatName, player[seatName].stake]);
            });
            io.emit("stakes", activeSeatNames);

            const betSize = 50;

            io.to(firstPlayerClientId).emit("game", index, betSize);
          }, 5000);
        });
      } else {
        //if there is a player at the index send game to them
        //else send to player at index 0
        if (activePlayers[index]) {
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          const prevPlayer = activePlayers[index - 1];
          const prevPlayerSeat = Object.keys(prevPlayer)[0];

          //prettier-ignore
          if (nextPlayerSeat === lastToAct && nextPlayer[nextPlayerSeat].stake === prevPlayer[prevPlayerSeat].stake) {           
                io.to(nextPlayerClientId).emit("game", index, betSize, 'check');
              } else {
                io.to(nextPlayerClientId).emit("game", index, betSize);
              }
          // if (nextPlayer[nextPlayerSeat].stake - betSize === 0) betSize = 0;
        } else {
          index = 0;
          const firstPlayer = activePlayers[0];
          const firstPlayerSeat = Object.keys(firstPlayer)[0];
          const firstPlayerClientId = firstPlayer[firstPlayerSeat].clientId;

          const lastPlayer = activePlayers[activePlayers.length - 1];
          const lastPlayerSeat = Object.keys(lastPlayer)[0];
          //prettier-ignore
          if (firstPlayerSeat === lastToAct && firstPlayer[firstPlayerSeat].stake === lastPlayer[lastPlayerSeat].stake) {
                io.to(firstPlayerClientId).emit("game", index, betSize, "check");
              } else {
                io.to(firstPlayerClientId).emit("game", index, betSize);
              }
          // betSize = 0;
        }
      }
    }

    if (move === "raise") {
      if (seat === lastToAct) {
        lastToActPlayed = true;

        if (activePlayers.length === 2) {
          if (lastToActIndex + 1 > activePlayers.length - 1) {
            lastToActIndex = 0;
          } else {
            lastToActIndex += 1;
          }
          lastToAct = Object.keys(activePlayers[lastToActIndex])[0];
        } else {
          if (lastToActIndex - 1 === -1) {
            lastToActIndex = activePlayers.length - 1;
          } else {
            lastToActIndex -= 1;
          }
          lastToAct = Object.keys(activePlayers[lastToActIndex])[0];
        }

        if (activePlayers[index]) {
          const nextPlayer = activePlayers[index];
          const nextPlayerSeat = Object.keys(nextPlayer)[0];
          const nextPlayerClientId = nextPlayer[nextPlayerSeat].clientId;
          const prevPlayer = activePlayers[index - 1];
          const prevPlayerSeat = Object.keys(prevPlayer)[0];

          //prettier-ignore
          if (nextPlayerSeat === lastToAct && nextPlayer[nextPlayerSeat].stake === prevPlayer[prevPlayerSeat].stake) {
            
            io.to(nextPlayerClientId).emit("game", index, betSize, 'check');
          } else {
            io.to(nextPlayerClientId).emit("game", index, betSize);
          }
          // if (nextPlayer[nextPlayerSeat].stake - betSize === 0) betSize = 0;
        } else {
          index = 0;
          const firstPlayer = activePlayers[0];
          const firstPlayerSeat = Object.keys(firstPlayer)[0];
          const firstPlayerClientId = firstPlayer[firstPlayerSeat].clientId;

          const lastPlayer = activePlayers[activePlayers.length - 1];
          const lastPlayerSeat = Object.keys(lastPlayer)[0];
          //prettier-ignore
          if (firstPlayerSeat === lastToAct && firstPlayer[firstPlayerSeat].stake === lastPlayer[lastPlayerSeat].stake) {
            io.to(firstPlayerClientId).emit("game", index, betSize, "check");
          } else {
            io.to(firstPlayerClientId).emit("game", index, betSize);
          }
          // betSize = 0;
        }
      } else {
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

        let activeSeatNames = [];
        activePlayers.forEach((player) => {
          const seatName = Object.keys(player)[0];
          activeSeatNames.push([seatName, player[seatName].stake]);
        });
        io.emit("stakes", activeSeatNames);
      }
    }

    activePlayers.forEach((player) => {
      const seatName = Object.keys(player)[0];
      const stack = player[seatName].stack;
      io.to(player[seatName].clientId).emit("updateStack", stack);
    });
  });

  socket.on("disconnect", () => {
    console.log(clientId + " has disconnected");
    clients.splice(clients.indexOf(clientId), 1);
    console.log(clients);

    const seats = tableOne.seats;

    let activeSeatNames = [];

    if (activePlayers.length > 0) {
      activePlayers.forEach((player) => {
        const seatName = Object.keys(player)[0];
        activeSeatNames.push(seatName);
      });
    }

    seats.forEach((seat) => {
      const seatName = Object.keys(seat)[0];
      if (seat[seatName].clientId === socket.id) {
        seat[seatName] = { clientId: null };
        io.emit("userLeft", seatName);
      }
    });

    playersSat = seats.filter((seat) => {
      const seatName = Object.keys(seat)[0];
      return seat[seatName].clientId;
    });

    activePlayers = playersSat.filter((seat) => {
      const seatName = Object.keys(seat)[0];
      return seat[seatName].playing === true;
    });

    if (playersSat && playersSat.length === 1) {
      activePlayers.map((player) => {
        const seatName = Object.keys(player)[0];
        player[seatName].stake = 0;
        player[seatName].stack += tableOne.pot;
        io.to(player[seatName].clientId).emit(
          "updateStack",
          player[seatName].stack
        );
      });
      console.log(activePlayers);
      gameInProgress = false;
      tableOne.pot = 0;
      tableOne.deck = null;
      tableOne.communityCards = [[], [], []];
      io.emit("gameOver", activeSeatNames);
    }
  });
});

server.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});

function initGame(players, table) {
  table.pot = 0;
  table.deck = null;
  table.communityCards = [[], [], []];
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

  players.forEach((player) => {
    const seatName = Object.keys(player)[0];
    const stack = player[seatName].stack;
    io.to(player[seatName].clientId).emit("updateStack", stack);
  });

  let index = 0;
  gameInProgress = true;
  table.bettingRound = "preflop";
  let firstPlayerObject = players[0];
  let firstPlayerSeatName = Object.keys(firstPlayerObject)[0];
  let firstPlayerClientId = firstPlayerObject[firstPlayerSeatName].clientId;

  console.dir(players, { depth: null });
  return { index, firstPlayerClientId };
}
