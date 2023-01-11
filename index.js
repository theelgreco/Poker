const { log } = require("console");

const deck = [
  { card: 'A', suit: 'hearts' }, { card: 'A', suit: 'diamonds' },
  { card: 'A', suit: 'clubs' }, { card: 'A', suit: 'spades' },
  { card: '2', suit: 'hearts' }, { card: '2', suit: 'diamonds' },
  { card: '2', suit: 'clubs' }, { card: '2', suit: 'spades' },
  { card: '3', suit: 'hearts' }, { card: '3', suit: 'diamonds' },
  { card: '3', suit: 'clubs' }, { card: '3', suit: 'spades' },
  { card: '4', suit: 'hearts' }, { card: '4', suit: 'diamonds' },
  { card: '4', suit: 'clubs' }, { card: '4', suit: 'spades' },
  { card: '5', suit: 'hearts' }, { card: '5', suit: 'diamonds' },
  { card: '5', suit: 'clubs' }, { card: '5', suit: 'spades' },
  { card: '6', suit: 'hearts' }, { card: '6', suit: 'diamonds' },
  { card: '6', suit: 'clubs' }, { card: '6', suit: 'spades' },
  { card: '7', suit: 'hearts' }, { card: '7', suit: 'diamonds' },
  { card: '7', suit: 'clubs' }, { card: '7', suit: 'spades' },
  { card: '8', suit: 'hearts' }, { card: '8', suit: 'diamonds' },
  { card: '8', suit: 'clubs' }, { card: '8', suit: 'spades' },
  { card: '9', suit: 'hearts' }, { card: '9', suit: 'diamonds' },
  { card: '9', suit: 'clubs' }, { card: '9', suit: 'spades' },
  { card: '10', suit: 'hearts' }, { card: '10', suit: 'diamonds' },
  { card: '10', suit: 'clubs' }, { card: '10', suit: 'spades' },
  { card: 'J', suit: 'hearts' }, { card: 'J', suit: 'diamonds' },
  { card: 'J', suit: 'clubs' }, { card: 'J', suit: 'spades' },
  { card: 'Q', suit: 'hearts' }, { card: 'Q', suit: 'diamonds' },
  { card: 'Q', suit: 'clubs' }, { card: 'Q', suit: 'spades' },
  { card: 'K', suit: 'hearts' }, { card: 'K', suit: 'diamonds' },
  { card: 'K', suit: 'clubs' }, { card: 'K', suit: 'spades' }
];

const currentDeck = [...deck];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

shuffle(currentDeck);

const players = [
  { player: 'One', cardOne: [], cardTwo: [] },
  { player: 'Two', cardOne: [], cardTwo: [] }
];

function dealCards() {
  //deal first card starting from player i
  for (let i = 0; i < players.length; i++) {
    const RNG = Math.ceil(Math.random() * currentDeck.length - 1);
    players[i].cardOne = currentDeck[RNG];
    currentDeck.splice(RNG, 1)
  }
  //deal second card starting from player i
  for (let i = 0; i < players.length; i++) {
    const RNG = Math.ceil(Math.random() * currentDeck.length - 1);
    players[i].cardTwo = currentDeck[RNG];
    currentDeck.splice(RNG, 1)
  }
}

dealCards();

log(currentDeck)
log(currentDeck.length)

log(`${currentDeck.indexOf(players[0].cardOne)} & ${currentDeck.indexOf(players[0].cardTwo)}`)
log(`${currentDeck.indexOf(players[1].cardOne)} & ${currentDeck.indexOf(players[1].cardTwo)}`)


log(`Player One: ${players[0].cardOne.card} ${players[0].cardOne.suit} & ${players[0].cardTwo.card} ${players[0].cardTwo.suit}`)

log(`Player Two: ${players[1].cardOne.card} ${players[1].cardOne.suit} & ${players[1].cardTwo.card} ${players[1].cardTwo.suit}`)

