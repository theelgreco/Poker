const deck = require("./constants.js");

function dealCards(players, table) {
  const freshDeck = newDeck(deck);
  shuffle(freshDeck);
  table.deck = freshDeck;

  players.forEach((player) => {
    const seatName = Object.keys(player)[0];
    const RNG = Math.ceil(Math.random() * table.deck.length - 1);
    player[seatName].cards.push(table.deck[RNG]);
    table.deck.splice(RNG, 1);
  });

  players.forEach((player) => {
    const seatName = Object.keys(player)[0];
    const RNG = Math.ceil(Math.random() * table.deck.length - 1);
    player[seatName].cards.push(table.deck[RNG]);
    table.deck.splice(RNG, 1);
  });

  return table;
}

function dealFlop(table) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 1; j++) {
      const RNG = Math.ceil(Math.random() * table.deck.length - 1);
      table.communityCards[0].push(table.deck[RNG]);
      table.deck.splice(RNG, 1);
    }
  }
}

function dealTurn(table) {
  const RNG = Math.ceil(Math.random() * table.deck.length - 1);
  table.communityCards[1].push(table.deck[RNG]);
  table.deck.splice(RNG, 1);
}

function dealRiver(table) {
  const RNG = Math.ceil(Math.random() * table.deck.length - 1);
  table.communityCards[2].push(table.deck[RNG]);
  table.deck.splice(RNG, 1);
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

module.exports = { dealCards, dealFlop, dealTurn, dealRiver };
