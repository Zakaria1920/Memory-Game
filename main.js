const qs = (selector) => document.querySelector(selector);

const control = qs(".control-buttons");
const start = qs(".control-buttons span");
const nam = qs(".name span");
const tries = qs(".tries span");
const block = qs(".blocks");
const timerCount = qs(".timer");
const select = qs(".select");
let blocks = document.querySelectorAll(".game-block");
let duration = 600;
let counter;
let parse = JSON.parse(localStorage.getItem("scores")) || {};

function updateLocStor() {
  // Setting name and score
  if (!parse.names) parse.names = {};
  if (!parse.names[nam.innerHTML]) parse.names[nam.innerHTML] = [];
  parse.names[nam.innerHTML].push(
    parseInt(parseInt(timerCount.innerHTML) / (parseInt(tries.innerHTML) || 1))
  );
  parse.names[nam.innerHTML].sort((a, b) => a - b);
  let sortedArr = Object.entries(parse.names);
  sortedArr.sort((a, b) => b[1][b[1].length - 1] - a[1][a[1].length - 1]);
  parse.names = Object.fromEntries(sortedArr);

  localStorage.setItem("scores", JSON.stringify(parse));
}

start.addEventListener("click", () => {
  const yourName = prompt("What Is Your Name") || "Unknown";
  nam.innerHTML = yourName;
  control.remove();
  qs("#game-music").play();
  genImgs();
});

let orderRange = [...Array(blocks.length).keys()];

function shuffle(array) {
  let current = array.length,
    temp,
    random;

  while (current > 0) {
    // Decrease length by one
    current--;
    // Get random number
    random = Math.floor(Math.random() * current);
    // [1] Save current element in stash
    temp = array[current];
    // [2] Current element = random element
    array[current] = array[random];
    // [3] Random element = current element in stash
    array[random] = temp;
  }
}

shuffle(orderRange);

const genImgs = () => {
  if (select.value > 30) qs(".container").style.width = "761px";
  for (let i = 0; i < select.value; i++) {
    [...blocks][i].style.display = "block";
  }
  blocks.forEach((bloc, ind) => {
    bloc.style.order = orderRange[ind];

    // Click event
    bloc.addEventListener("click", () => {
      flipBlock(bloc);
      qs("#click").play();
      amIWin();
    });
  });
  setTimeout(rotateBlock, 700);
  setTimeout(rotateBlock, 1400);
  setTimeout(timer, 1400);
};

function flipBlock(selectedBlock) {
  // Add Class is-flipped
  selectedBlock.classList.add("is-flipped");
  // Collect all flipped cards
  let allFlippedBlocks = [...blocks].filter((flippedBlock) =>
    flippedBlock.classList.contains("is-flipped")
  );
  // If there is two selected blocks
  if (allFlippedBlocks.length === 2) {
    // Stop clicking
    stopClicking();
    matchedBlocks(allFlippedBlocks[0], allFlippedBlocks[1]);
  }
}

function stopClicking() {
  // Add no clicking class
  block.classList.add("no-clicking");
  // Remove no clicking class after the duration that you setted
  setTimeout(() => block.classList.remove("no-clicking"), duration);
}

function matchedBlocks(firstBlock, lastBlock) {
  if (firstBlock.dataset.technology === lastBlock.dataset.technology) {
    // Remove is-flipped class
    firstBlock.classList.remove("is-flipped");
    lastBlock.classList.remove("is-flipped");
    // Add flipped class
    firstBlock.classList.add("flipped");
    lastBlock.classList.add("flipped");
    setTimeout(() => {
      qs("#success").play();
    }, 500);
  } else {
    setTimeout(() => {
      tries.innerHTML++;
      let counter =
        select.value > 10
          ? 10
          : select.value > 20
          ? 12
          : select.value > 30
          ? 15
          : select.value > 40
          ? 18
          : 5;
      if (tries.innerHTML == counter) {
        clearInterval(counter);
        qs("#game-music").pause();
        qs("#game-over-music").play();
        block.classList.add("no-clicking");
        updateLocStor();
        leaderBoard();
        finish("Game Over");
      }
      firstBlock.classList.remove("is-flipped");
      lastBlock.classList.remove("is-flipped");
    }, duration);
    setTimeout(() => qs("#fail").play(), 500);
  }
}

const rotateBlock = () => {
  blocks.forEach((bloc) => bloc.classList.toggle("is-flipped"));
};

function timer() {
  counter = setInterval(() => {
    timerCount.innerHTML--;
    if (timerCount.innerHTML == 0) {
      clearInterval(counter);
      qs("#game-music").pause();
      qs("#game-over-music").play();
      block.classList.add("no-clicking");
      updateLocStor();
      leaderBoard();
      finish("Game Over");
    }
  }, 1000);
}

function amIWin() {
  // Get all flipped blocks
  let isAllFlipped = [...blocks].filter((bloc) =>
    bloc.classList.contains("flipped")
  );

  // Check if all blocks have been flipped
  if (isAllFlipped.length == select.value) {
    clearInterval(counter);
    block.classList.add("no-clicking");
    qs("#success").pause();
    qs("#game-music").pause();
    qs("#win").play();
    updateLocStor();
    leaderBoard();
    finish("You Win");
  }
}

function finish(message) {
  qs(".finish-but").innerHTML = message;
  setTimeout(() => {
    qs(".finish").style.display = "block";
    setTimeout(() => (qs(".finish").style.opacity = "1"), 500);
    setTimeout(() => (qs(`.finish-but`).style.transform = "scale(1)"), 1000);
    setTimeout(() => (qs(".leaders").style.transform = "scale(1)"), 2000);
  }, 500);
}

function leaderBoard() {
  qs(".scores").innerHTML = "";
  for (let name in parse.names) {
    let row = document.createElement("div");
    row.classList.add("info");
    let nameSpan = document.createElement("span");
    nameSpan.classList.add("name");
    let score = document.createElement("span");
    score.classList.add("score");
    nameSpan.innerHTML = name;
    score.innerHTML = parse.names[name][parse.names[name].length - 1];
    row.appendChild(nameSpan);
    row.appendChild(score);
    qs(".scores").appendChild(row);
  }
}
