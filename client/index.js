const socket = io();
const betInput = document.getElementById("betInput");
const betBtn = document.getElementById("betBtn");
const callBtn = document.getElementById("callBtn");
const foldBtn = document.getElementById("foldBtn");
const checkBtn = document.getElementById("checkBtn");
const playButtonsContainer = document.getElementById("playButtonsContainer");
const pot = document.getElementById("pot");
const stackText = document.getElementById("stack");

const firstCard = document.getElementById("firstCard");
const secondCard = document.getElementById("secondCard");
const thirdCard = document.getElementById("thirdCard");
const fourthCard = document.getElementById("fourthCard");
const fifthCard = document.getElementById("fifthCard");

let gameTablePlayers;
let currentStack = 4975;
let clicked = false;
let currentSeat;
let currentIndex;
let currentBet;

betInput.max = currentStack;

const seatButtons = [
  document.getElementById("seatOne"),
  document.getElementById("seatTwo"),
  document.getElementById("seatThree"),
  document.getElementById("seatFour"),
  document.getElementById("seatFive"),
  document.getElementById("seatSix"),
];

seatButtons.forEach((seat) => {
  document.getElementById(seat.id).style.color = "white";
  document.getElementById(seat.id).style.textAlign = "center";
  document.getElementById(seat.id).style.fontSize = "50px";
  seat.addEventListener("click", () => {
    let seatId = seat.id;
    let clientId = socket.id;
    let tableId = "tableOne";
    console.log("clicked");
    socket.emit("sit", { clientId, tableId, seatId });
  });
});

socket.on("connection", (tableOne) => {
  gameTablePlayers = tableOne.players;

  for (let player in gameTablePlayers) {
    //set opponent seats to purple
    document.getElementById(
      `${gameTablePlayers[player].seatId}`
    ).style.backgroundColor = "purple";
  }
});

socket.on("success", (seatId) => {
  currentSeat = seatId;
  document.getElementById(seatId).style.backgroundColor = "green";
  document.getElementById("usernameText").innerHTML = `USERNAME: ${prompt(
    "username"
  )}`;
});

socket.on("opponent", (seatId) => {
  document.getElementById(seatId).style.backgroundColor = "purple";
});

socket.on("alreadySat", () => {
  alert("you're already sat in a seat");
});

socket.on("seatTaken", (seatId) => {
  alert(`sorry... someone is already sat in ${seatId}`);
});

socket.on("cards", (cards, seatName) => {
  const cardOne = cards[0];
  const cardTwo = cards[1];
  console.log(cardOne.img);
  console.log(cardTwo.img);
  document.getElementById(`${seatName}CardOne`).style.background = cardOne.img;
  document.getElementById(`${seatName}CardOne`).style.backgroundSize =
    "contain";
  document.getElementById(`${seatName}CardTwo`).style.background = cardTwo.img;
  document.getElementById(`${seatName}CardTwo`).style.backgroundSize =
    "contain";
  document.getElementById(
    "cardsText"
  ).innerHTML = `CARDS: ${cardOne.card} ${cardOne.suit} & ${cardTwo.card} ${cardTwo.suit}`;
});

socket.on("table", (tableOne) => {
  console.log(tableOne);
});

socket.on("pot", (betSize) => {
  pot.innerText = `POT ${betSize}`;
});

foldBtn.addEventListener("click", () => {
  const move = "fold";
  playButtonsContainer.style.display = "none";
  socket.emit("game", currentIndex, move, currentBet, currentSeat);
});

callBtn.addEventListener("click", () => {
  currentIndex++;
  const move = "call";
  playButtonsContainer.style.display = "none";
  socket.emit("game", currentIndex, move, currentBet, currentSeat);
});

checkBtn.addEventListener("click", () => {
  currentIndex++;
  const move = "check";
  currentBet = 0;
  playButtonsContainer.style.display = "none";
  socket.emit("game", currentIndex, move, currentBet, currentSeat);
});

betBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const value = Number(betInput.value);
  const min = Number(betInput.min);
  const max = Number(betInput.max);
  if (value >= min && value <= max) {
    currentBet = value;
    currentIndex++;
    const move = "raise";
    playButtonsContainer.style.display = "none";
    socket.emit("game", currentIndex, move, currentBet, currentSeat);
  }
});

betInput.addEventListener("input", (e) => {
  console.log(e.target.value);
  const value = Number(e.target.value);
  const min = Number(e.target.min);
  const max = Number(e.target.max);
  if (value < min) {
    e.target.value = e.target.min;
  } else if (value > max) {
    e.target.value = e.target.max;
  }
});

betInput.addEventListener("wheel", function (e) {
  const value = Number(e.target.value);
  const min = Number(e.target.min);
  const max = Number(e.target.max);

  if (e.deltaY > 0) {
    betInput.valueAsNumber += 25;
    if (value >= max) {
      betInput.valueAsNumber = e.target.max;
    }
  } else {
    betInput.valueAsNumber -= 25;
    if (value <= min) {
      betInput.valueAsNumber = e.target.min;
    }
  }

  e.preventDefault();
  e.stopPropagation();
});

socket.on("game", (index, betSize) => {
  currentIndex = index;
  currentBet = betSize;
  betInput.min = betSize * 2;
  betInput.value = betSize * 2;
  console.log(index, betSize);
  playButtonsContainer.style.display = "inline-table";
  if (betSize === 0) {
    callBtn.style.display = "none";
    checkBtn.style.display = "unset";
  } else {
    callBtn.style.display = "unset";
    checkBtn.style.display = "none";
  }
});

socket.on("updateStack", (stack) => {
  currentStack = stack;
  betInput.max = stack;
  stackText.innerText = `${stack}`;
});

socket.on("updatePot", (potAmount) => {
  pot.innerText = `POT ${potAmount}`;
});

socket.on("gameOver", () => {
  playButtonsContainer.style.display = "none";
  firstCard.style.background =
    'center no-repeat url("https://www.magicbox.uk.com/wp-content/uploads/2015/05/cardsbic809_red-alt2.jpg")';
  firstCard.style.backgroundSize = "150%";
  secondCard.style.background =
    'center no-repeat url("https://www.magicbox.uk.com/wp-content/uploads/2015/05/cardsbic809_red-alt2.jpg")';
  secondCard.style.backgroundSize = "150%";
  thirdCard.style.background =
    'center no-repeat url("https://www.magicbox.uk.com/wp-content/uploads/2015/05/cardsbic809_red-alt2.jpg")';
  thirdCard.style.backgroundSize = "150%";
  fourthCard.style.background =
    'center no-repeat url("https://www.magicbox.uk.com/wp-content/uploads/2015/05/cardsbic809_red-alt2.jpg")';
  fourthCard.style.backgroundSize = "150%";
  fifthCard.style.background =
    'center no-repeat url("https://www.magicbox.uk.com/wp-content/uploads/2015/05/cardsbic809_red-alt2.jpg")';
  fifthCard.style.backgroundSize = "150%";
});

socket.on("flop", (cards) => {
  firstCard.style.background = cards[0].img;
  firstCard.style.backgroundSize = "contain";
  secondCard.style.background = cards[1].img;
  secondCard.style.backgroundSize = "contain";
  thirdCard.style.background = cards[2].img;
  thirdCard.style.backgroundSize = "contain";
});

socket.on("turn", (cards) => {
  fourthCard.style.background = cards[0].img;
  fourthCard.style.backgroundSize = "contain";
});

socket.on("river", (cards) => {
  fifthCard.style.background = cards[0].img;
  fifthCard.style.backgroundSize = "contain";
});

socket.on("disconnect", () => {});

function countdown(seatId) {
  let seconds = 60;
  const counter = setInterval(() => {
    seconds--;
    document.getElementById(seatId).innerHTML = `<div>${seconds}</div>`;
    console.log(seconds);

    if (seconds === 0) {
      socket.emit("fold", seatId);
    }

    if (clicked || seconds === 0) {
      clearInterval(counter);
      document.getElementById(seatId).innerHTML = null;
    }
  }, 1000);
}
