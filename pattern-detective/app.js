const patterns = [
  {
    type: "numbers",
    label: "Numbers",
    sequence: ["2", "4", "6", "8"],
    answer: "10",
    choices: ["9", "10", "12"],
    hint: "The numbers grow by 2 each time."
  },
  {
    type: "numbers",
    label: "Numbers",
    sequence: ["5", "10", "15", "20"],
    answer: "25",
    choices: ["24", "25", "30"],
    hint: "The numbers grow by 5 each time."
  },
  {
    type: "colors",
    label: "Colors",
    sequence: ["red", "blue", "red", "blue"],
    answer: "red",
    choices: ["red", "blue", "green"],
    hint: "The colors repeat red, blue."
  },
  {
    type: "colors",
    label: "Colors",
    sequence: ["yellow", "yellow", "green", "yellow"],
    answer: "yellow",
    choices: ["green", "yellow", "purple"],
    hint: "Two yellows come before one green."
  },
  {
    type: "shapes",
    label: "Shapes",
    sequence: ["circle", "square", "circle", "square"],
    answer: "circle",
    choices: ["circle", "triangle", "square"],
    hint: "The shapes switch back and forth."
  },
  {
    type: "shapes",
    label: "Shapes",
    sequence: ["triangle", "triangle", "star", "triangle"],
    answer: "triangle",
    choices: ["star", "circle", "triangle"],
    hint: "Two triangles come before one star."
  },
  {
    type: "sounds",
    label: "Sounds",
    sequence: ["clap", "tap", "clap", "tap"],
    answer: "clap",
    choices: ["tap", "clap", "ding"],
    hint: "The sounds repeat clap, tap."
  },
  {
    type: "sounds",
    label: "Sounds",
    sequence: ["ding", "ding", "tap", "ding"],
    answer: "ding",
    choices: ["ding", "tap", "clap"],
    hint: "Two dings come before one tap."
  }
];

const colorMap = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15",
  purple: "#a855f7"
};

const soundMap = {
  clap: 260,
  tap: 440,
  ding: 660
};

const typeSelect = document.querySelector("#typeSelect");
const newPatternBtn = document.querySelector("#newPatternBtn");
const playSoundBtn = document.querySelector("#playSoundBtn");
const showAnswerBtn = document.querySelector("#showAnswerBtn");
const patternTrack = document.querySelector("#patternTrack");
const choiceGrid = document.querySelector("#choiceGrid");
const patternType = document.querySelector("#patternType");
const statusBadge = document.querySelector("#statusBadge");
const feedback = document.querySelector("#feedback");
const scoreCount = document.querySelector("#scoreCount");
const roundCount = document.querySelector("#roundCount");
const totalRounds = document.querySelector("#totalRounds");
const customForm = document.querySelector("#customForm");
const customItems = document.querySelector("#customItems");
const customAnswer = document.querySelector("#customAnswer");
const customHint = document.querySelector("#customHint");
const journalList = document.querySelector("#journalList");
const clearJournalBtn = document.querySelector("#clearJournalBtn");

let currentPattern = null;
let currentIndex = -1;
let score = 0;
let answered = false;

function normalize(value) {
  return value.trim().toLowerCase();
}

function availablePatterns() {
  const type = typeSelect.value;
  return type === "all" ? patterns : patterns.filter((pattern) => pattern.type === type);
}

function setStatus(text, className = "") {
  statusBadge.textContent = text;
  statusBadge.className = `status-badge ${className}`.trim();
}

function setFeedback(text, className = "") {
  feedback.textContent = text;
  feedback.className = `feedback ${className}`.trim();
}

function makeDisplay(value, type) {
  const wrapper = document.createElement("span");

  if (type === "colors" && colorMap[normalize(value)]) {
    wrapper.className = "swatch";
    wrapper.style.setProperty("--swatch", colorMap[normalize(value)]);
    wrapper.setAttribute("aria-label", value);
    return wrapper;
  }

  if (type === "shapes") {
    wrapper.className = `shape ${normalize(value)}`;
    wrapper.style.setProperty("--shape-color", value === "star" ? "#b7791f" : "#2b6cb0");
    wrapper.setAttribute("aria-label", value);
    if (normalize(value) === "star") {
      wrapper.textContent = "*";
    }
    return wrapper;
  }

  if (type === "sounds") {
    wrapper.className = "sound-symbol";
    wrapper.textContent = value;
    return wrapper;
  }

  wrapper.textContent = value;
  return wrapper;
}

function renderPattern() {
  patternTrack.innerHTML = "";
  choiceGrid.innerHTML = "";
  answered = false;
  patternType.textContent = currentPattern.label;
  setStatus("Choose one");
  setFeedback(currentPattern.type === "sounds" ? "Play the sounds, then choose what comes next." : "Look for what repeats or changes.");

  [...currentPattern.sequence, "__"].forEach((item) => {
    const tile = document.createElement("div");
    tile.className = item === "__" ? "pattern-tile missing" : "pattern-tile";
    if (item === "__") {
      tile.textContent = "__";
    } else {
      tile.append(makeDisplay(item, currentPattern.type));
    }
    patternTrack.append(tile);
  });

  currentPattern.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.dataset.answer = choice;
    button.append(makeDisplay(choice, currentPattern.type));
    button.addEventListener("click", () => checkChoice(choice));
    choiceGrid.append(button);
  });

  updateStats();
}

function updateStats() {
  scoreCount.textContent = score;
  roundCount.textContent = currentIndex >= 0 ? currentIndex + 1 : 1;
  totalRounds.textContent = currentIndex >= 0 ? availablePatterns().length : 1;
}

function nextPattern() {
  const list = availablePatterns();
  currentIndex = (currentIndex + 1) % list.length;
  currentPattern = list[currentIndex];
  renderPattern();
}

function markChoices(selected) {
  document.querySelectorAll(".choice-card").forEach((button) => {
    const isAnswer = normalize(button.dataset.answer) === normalize(currentPattern.answer);
    const isSelected = normalize(button.dataset.answer) === normalize(selected);
    button.classList.toggle("correct", isAnswer);
    button.classList.toggle("incorrect", isSelected && !isAnswer);
  });
}

function checkChoice(choice) {
  markChoices(choice);

  if (normalize(choice) === normalize(currentPattern.answer)) {
    if (!answered) {
      score += 1;
      answered = true;
    }
    setStatus("Correct", "correct");
    setFeedback(currentPattern.hint, "success");
    addJournal(choice);
    updateStats();
    return;
  }

  setStatus("Try again", "try-again");
  setFeedback("That is not the pattern yet. Try saying the pattern out loud.", "notice");
}

function showAnswer() {
  answered = true;
  markChoices(currentPattern.answer);
  setStatus("Answer shown", "correct");
  setFeedback(currentPattern.hint, "success");
}

function addJournal(answer) {
  const entry = document.createElement("li");
  entry.textContent = `${currentPattern.label}: ${currentPattern.sequence.join(", ")}, ${answer}`;
  journalList.prepend(entry);
}

function playTone(frequency, delay) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    setFeedback("This browser cannot play the sound pattern.", "notice");
    return;
  }

  const context = new AudioContext();
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.24);
}

function playSoundPattern() {
  if (currentPattern.type !== "sounds") {
    setFeedback("Sound playback is available on sound patterns.", "notice");
    return;
  }

  currentPattern.sequence.forEach((item, index) => {
    playTone(soundMap[normalize(item)] || 330, index * 0.38);
  });
}

function useCustomPattern(event) {
  event.preventDefault();
  const sequence = customItems.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const answer = customAnswer.value.trim();
  const hint = customHint.value.trim();

  if (sequence.length < 3 || !answer || !hint) {
    setFeedback("Add at least 3 comma-separated pattern items, an answer, and a hint.", "notice");
    return;
  }

  currentPattern = {
    type: "custom",
    label: "Custom Pattern",
    sequence,
    answer,
    choices: buildCustomChoices(answer, sequence),
    hint
  };
  currentIndex = -1;
  renderPattern();
}

function buildCustomChoices(answer, sequence) {
  const choices = [answer, ...sequence.filter((item) => normalize(item) !== normalize(answer))];
  return [...new Set(choices.map((item) => item.trim()).filter(Boolean))].slice(0, 3);
}

typeSelect.addEventListener("change", () => {
  currentIndex = -1;
  nextPattern();
});
newPatternBtn.addEventListener("click", nextPattern);
playSoundBtn.addEventListener("click", playSoundPattern);
showAnswerBtn.addEventListener("click", showAnswer);
customForm.addEventListener("submit", useCustomPattern);
clearJournalBtn.addEventListener("click", () => {
  journalList.innerHTML = "";
});

nextPattern();
