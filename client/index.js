const socket = io();
let gameTablePlayers;
const betInput = document.getElementById("betInput");
const betBtn = document.getElementById("betBtn");
const playButtonsContainer = document.getElementById("playButtonsContainer");
let currentStack = 5000;
let clicked = false;
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

betBtn.addEventListener("click", () => {
  const betSize = betInput.value;
  clicked = true;
  playButtonsContainer.style.display = "none";
  socket.emit("bet", betSize);
});

betInput.addEventListener("wheel", function (e) {
  if (e.deltaY < 0) {
    betInput.valueAsNumber += 1;
  } else {
    betInput.value -= 1;
  }
  console.log(betInput.value);
  betBtn.innerHTML = `BET ${currentStack * (betInput.valueAsNumber / 100)}`;
  e.preventDefault();
  e.stopPropagation();
});

betInput.addEventListener("input", () => {
  betBtn.innerHTML = `BET ${currentStack * (betInput.valueAsNumber / 100)}`;
});

socket.on("connection", (tableOne) => {
  gameTablePlayers = tableOne.players;

  for (let player in gameTablePlayers) {
    //set opponent seats to purple
    document.getElementById(
      `${gameTablePlayers[player].seatId}`
    ).style.backgroundColor = "purple";

    //set opponent cards to back image
  }
});

socket.on("success", (seatId) => {
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

socket.on("dealt", ({ cardOne, cardTwo, seatId, stack }) => {
  console.log(cardOne.img);
  console.log(cardTwo.img);
  document.getElementById(`${seatId}CardOne`).style.background = cardOne.img;
  document.getElementById(`${seatId}CardOne`).style.backgroundSize = "contain";
  document.getElementById(`${seatId}CardTwo`).style.background = cardTwo.img;
  document.getElementById(`${seatId}CardTwo`).style.backgroundSize = "contain";
  document.getElementById(
    "cardsText"
  ).innerHTML = `CARDS: ${cardOne.card} ${cardOne.suit} & ${cardTwo.card} ${cardTwo.suit}`;
});

//testing at the moment: counter only on playerOne
socket.on("startGame", (seatId, betSize) => {
  if (betSize) {
    betInput.min = betSize;
    console.log(betSize);
  }

  clicked = false;
  countdown(seatId);
  playButtonsContainer.style.display = "inline-table";
});

socket.on("table", (tableOne) => {
  console.log(tableOne);
});

socket.on("bet", (stack) => {
  console.log(stack);
  document.getElementById("stack").innerHTML = ` ${stack}`;
  playButtonsContainer.style.display = "none";
  currentStack = stack;
});

socket.on("disconnect", () => {});

function countdown(seatId) {
  let seconds = 60;
  const counter = setInterval(() => {
    seconds--;
    document.getElementById(seatId).innerHTML = `<div>${seconds}</div>`;
    console.log(seconds);
    if (clicked || seconds === 0) {
      clearInterval(counter);
      document.getElementById(seatId).innerHTML = null;
    }
  }, 1000);
}
