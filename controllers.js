const deck = require("./constants.js");

function dealCards(table) {
  const freshDeck = newDeck(deck);
  shuffle(freshDeck);
  table.deck = freshDeck;

  for (const player in table.players) {
    const seatNumber = table.players[player].seatId;
    const RNG = Math.ceil(Math.random() * table.deck.length - 1);
    table.players[player].cardOne = table.deck[RNG];
    table.players[player].playing = true;
    table.seats.map((seat) => {
      if (Object.keys(seat)[0] === seatNumber) {
        seat[seatNumber].playing = true;
      }
    });
    table.deck.splice(RNG, 1);
  }

  for (const player in table.players) {
    const RNG = Math.ceil(Math.random() * table.deck.length - 1);
    table.players[player].cardTwo = table.deck[RNG];
    table.deck.splice(RNG, 1);
  }

  return table;
}

function newDeck(deck) {
  const newDeck = [];

  for (let i = 0; i < deck.length; i++) {
    newDeck[i] = { ...deck[i] };
  }

  return newDeck;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

module.exports = { dealCards, newDeck, shuffle };
