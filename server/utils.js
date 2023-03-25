const fetch = require("node-fetch");

function formatHands(table) {
  const seats = table.seats.filter((player) => {
    const seatName = Object.keys(player)[0];
    return player[seatName].playing;
  });
  const cc = table.communityCards;
  const playerCards = [];

  seats.forEach((seat) => {
    const seatName = Object.keys(seat)[0];
    const player = seat[seatName];
    const cards = player.cards;
    let playerString = "";
    cards.forEach((card) => {
      playerString += `${card.card}${card.suit[0].toUpperCase()}`;
    });

    if (playerString.length === 5) {
      if (`${playerString[0]}${playerString[1]}` === "10") {
        const cardOne = `${playerString[0]}${playerString[1]}${playerString[2]}`;
        const cardTwo = `${playerString[3]}${playerString[4]}`;
        playerCards.push(`${cardOne},${cardTwo}`);
      } else {
        const cardOne = `${playerString[0]}${playerString[1]}`;
        const cardTwo = `${playerString[2]}${playerString[3]}${playerString[4]}`;
        playerCards.push(`${cardOne},${cardTwo}`);
      }
    } else if (playerString.length === 6) {
      const cardOne = `${playerString[0]}${playerString[1]}${playerString[2]}`;
      const cardTwo = `${playerString[3]}${playerString[4]}${playerString[5]}`;
      playerCards.push(`${cardOne},${cardTwo}`);
    } else {
      const cardOne = `${playerString[0]}${playerString[1]}`;
      const cardTwo = `${playerString[2]}${playerString[3]}`;
      playerCards.push(`${cardOne},${cardTwo}`);
    }
  });

  let ccString = "";
  cc.forEach((card) => {
    card.forEach((singleCard) => {
      ccString += `${singleCard.card}${singleCard.suit[0].toUpperCase()},`;
    });
  });
  ccString = ccString.split(",", 5);
  ccString = ccString.join(",");

  return [[ccString], playerCards];
}

function fetchWinningHand(hands) {
  let url = `https://api.pokerapi.dev/v1/winner/texas_holdem?cc=${hands[0]}`;

  hands[1].forEach((hand) => {
    url += `&pc[]=${hand}`;
  });

  return fetch(url).then((res) => {
    return res.json();
  });
}

module.exports = { formatHands, fetchWinningHand };
