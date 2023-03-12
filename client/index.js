const socket = io();
let gameTablePlayers;
const betInput = document.getElementById("betInput");
const betBtn = document.getElementById("betBtn");
const callBtn = document.getElementById("callBtn");
const foldBtn = document.getElementById("foldBtn");
const playButtonsContainer = document.getElementById("playButtonsContainer");
const pot = document.getElementById("pot");
let currentStack = 5000;
let clicked = false;
let currentSeat;

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
  socket.emit("bet", { betSize, currentSeat });
});

betInput.addEventListener("wheel", function (e) {
  if (e.deltaY < 0) {
    betInput.valueAsNumber += 1;
  } else {
    betInput.value -= 1;
  }
  console.log(betInput.value);
  betBtn.innerHTML = `RAISE ${currentStack * (betInput.valueAsNumber / 100)}`;
  e.preventDefault();
  e.stopPropagation();
});

betInput.addEventListener("input", () => {
  betBtn.innerHTML = `RAISE ${currentStack * (betInput.valueAsNumber / 100)}`;
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
    const minRaise = (betSize / currentStack) * 100 * 2;
    if (betSize >= currentStack) {
      betBtn.style.display = "none";
      betInput.style.display = "none";
      callBtn.innerText = `ALL IN`;
      callBtn.value = currentStack;
    } else if (betSize * 2 >= currentStack) {
      callBtn.innerText = `CALL ${betSize}`;
      betBtn.innerText = `ALL IN`;
      betInput.min = 100;
      betInput.value = 100;
    } else {
      callBtn.value = betSize;
      callBtn.innerText = `CALL ${betSize}`;
      betBtn.innerText = `RAISE ${currentStack * (minRaise / 100)}`;
      betInput.min = minRaise;
      console.log(betSize);
    }
  }

  clicked = false;

  countdown(seatId);

  playButtonsContainer.style.display = "inline-table";

  foldBtn.addEventListener("click", () => {
    clicked = true;
    socket.emit("fold", seatId);
  });
});

socket.on("fold", (seatId) => {
  playButtonsContainer.style.display = "none";
  document.getElementById(`${seatId}CardOne`).style.background = "";
  document.getElementById(`${seatId}CardTwo`).style.background = "";
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

socket.on("pot", (betSize) => {
  pot.innerText = `POT ${betSize}`;
});

socket.on("gameEnded", (seatId) => {
  playButtonsContainer.style.display = "none";
  document.getElementById(`${seatId}CardOne`).style.background = "";
  document.getElementById(`${seatId}CardTwo`).style.background = "";
  document.getElementById(seatId).innerHTML = null;
});

socket.on("disconnect", () => {});

function countdown(seatId) {
  let seconds = 60;
  const counter = setInterval(() => {
    seconds--;
    document.getElementById(seatId).innerHTML = `<div>${seconds}</div>`;
    console.log(seconds);

    socket.on("gameEnded", () => {
      clearInterval(counter);
    });

    if (seconds === 0) {
      socket.emit("fold", seatId);
    }

    if (clicked || seconds === 0) {
      clearInterval(counter);
      document.getElementById(seatId).innerHTML = null;
    }
  }, 1000);
}
