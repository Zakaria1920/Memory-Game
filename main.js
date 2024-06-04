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

// Click event
start.addEventListener("click", () => {
  const yourName = prompt("What Is Your Name") || "Unknown";
  nam.innerHTML = yourName;
  control.remove();
  qs("#game-music").play();
  genImgs(shuffle([...Array(blocks.length).keys()]));
});

// Shuffle the array
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
  return array;
}

// Generate images
function genImgs(orderRange) {
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
}

function rotateBlock() {
  blocks.forEach((bloc) => bloc.classList.toggle("is-flipped"));
}

function timer() {
  counter = setInterval(() => {
    timerCount.innerHTML--;
    if (timerCount.innerHTML == 0) {
      clearInterval(counter);
      qs("#game-music").pause();
      qs("#game-over-music").play();
      block.classList.add("no-clicking");
      finish("Game Over");
    }
  }, 1000);
}

// Check if there are two flipped blocks
function flipBlock(selectedBlock) {
  // Add Class is-flipped
  selectedBlock.classList.add("is-flipped");
  // Collect all flipped cards
  let flippedBlocks = [...blocks].filter((flippedBlock) =>
    flippedBlock.classList.contains("is-flipped")
  );
  // If there is two selected blocks
  if (flippedBlocks.length === 2) {
    // Stop clicking
    stopClicking();
    matchedBlocks(flippedBlocks[0], flippedBlocks[1]);
  }
}

function stopClicking() {
  // Add no clicking class
  block.classList.add("no-clicking");
  // Remove no clicking class after the duration that you setted
  setTimeout(() => block.classList.remove("no-clicking"), duration);
}

// check if the first flipped block is equal to the second
function matchedBlocks(firstBlock, lastBlock) {
  if (firstBlock.dataset.technology === lastBlock.dataset.technology) {
    // Remove is-flipped class
    firstBlock.classList.remove("is-flipped");
    lastBlock.classList.remove("is-flipped");
    // Add flipped class
    firstBlock.classList.add("flipped");
    lastBlock.classList.add("flipped");
    // Add success sound after half second
    setTimeout(() => {
      qs("#success").play();
    }, 500);
  } else {
    setTimeout(() => {
      tries.innerHTML++;
      let count =
        select.value > 10
          ? 10
          : select.value > 20
          ? 12
          : select.value > 30
          ? 15
          : select.value > 40
          ? 18
          : 5;
      if (tries.innerHTML == count) {
        clearInterval(counter);
        qs("#game-music").pause();
        qs("#game-over-music").play();
        block.classList.add("no-clicking");
        finish("Game Over");
      } else {
        firstBlock.classList.remove("is-flipped");
        lastBlock.classList.remove("is-flipped");
      }
    }, duration);
    setTimeout(() => qs("#fail").play(), 500);
  }
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
    setTimeout(() => {
      qs("#game-music").pause();
      qs("#win").play();
      finish("You Win");
    }, duration);
  }
}

function leaderBoard() {
  qs(".scores").innerHTML = "";
  for (let name in parse) {
    let row = document.createElement("div");
    row.classList.add("info");
    let nameSpan = document.createElement("span");
    nameSpan.classList.add("name");
    let score = document.createElement("span");
    score.classList.add("score");
    nameSpan.innerHTML = name;
    score.innerHTML = parse[name];
    row.appendChild(nameSpan);
    row.appendChild(score);
    qs(".scores").appendChild(row);
  }
}

function finish(message) {
  // update local storage
  if (!parse[nam.innerHTML]) parse[nam.innerHTML] = 0;
  if (message === "You Win") {
    if (+timerCount.innerHTML > 30 && +tries.innerHTML < 3) {
      parse[nam.innerHTML] = parse[nam.innerHTML] + 15;
    }
    if (+timerCount.innerHTML < 30 && +tries.innerHTML > 3) {
      parse[nam.innerHTML] = parse[nam.innerHTML] + 5;
    }
    if (+timerCount.innerHTML > 30 || +tries.innerHTML < 3) {
      parse[nam.innerHTML] = parse[nam.innerHTML] + 10;
    }
  }
  if (message === "Game Over") {
    if (+timerCount.innerHTML > 30 && +tries.innerHTML < 3) {
      if (parse[nam.innerHTML] !== 0)
        parse[nam.innerHTML] = parse[nam.innerHTML] - 5;
    }
    if (+timerCount.innerHTML < 30 && +tries.innerHTML > 3) {
      if (
        parse[nam.innerHTML] !== 0 &&
        parse[nam.innerHTML] !== 5 &&
        parse[nam.innerHTML] !== 10
      )
        parse[nam.innerHTML] = parse[nam.innerHTML] - 15;
    }
    if (+timerCount.innerHTML > 30 || +tries.innerHTML < 3) {
      if (parse[nam.innerHTML] !== 0 && parse[nam.innerHTML] !== 5)
        parse[nam.innerHTML] = parse[nam.innerHTML] - 10;
    }
  }
  localStorage.setItem("scores", JSON.stringify(parse));

  leaderBoard();
  qs(".finish-but").innerHTML = message;
  setTimeout(() => {
    qs(".finish").style.display = "block";
    setTimeout(() => (qs(".finish").style.opacity = "1"), 500);
    setTimeout(() => (qs(`.finish-but`).style.transform = "scale(1)"), 1000);
    setTimeout(() => (qs(".leaders").style.transform = "scale(1)"), 2000);
  }, 500);
}
