
const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");
const aboutButton = document.getElementById("about-button");
const beginButton = document.getElementById("begin-button");
const endButton = document.getElementById("end-button");
const exportButton = document.getElementById("export-button");
const homeButton = document.getElementById("home-button");

const playArea = document.getElementById("play-area");
const target = document.getElementById("target");

const timerDisplay = document.getElementById("timer");
const moveCountDisplay = document.getElementById("move-count");
const gameMessage = document.getElementById("game-message");

const results = document.getElementById("results");
const resultsSummary = document.getElementById("results-summary");

let isRunning = false;
let startTime = 0;
let moveCount = 0;
let targetInterval = null;
let timerInterval = null;
let taskLog = [];

function showGame() {
  homeScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  results.classList.add("hidden");
  beginButton.disabled = false;
  beginButton.textContent = "Begin ▶";

  gameMessage.textContent =
    "Ready? Press Begin when you're comfortable.";

  gameScreen.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function showHome() {
  gameScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");

  homeScreen.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function moveTarget() {
  const area = playArea.getBoundingClientRect();
  const targetSize = target.offsetWidth;
  const padding = targetSize / 2 + 8;

  const maxX = Math.max(padding, area.width - padding);
  const maxY = Math.max(padding, area.height - padding);

  const x = padding + Math.random() * (maxX - padding);
  const y = padding + Math.random() * (maxY - padding);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  moveCount++;
  moveCountDisplay.textContent = moveCount;

  taskLog.push({
    elapsed_ms: Math.round(performance.now() - startTime),
    target_x_px: Math.round(x),
    target_y_px: Math.round(y),
    field_width_px: Math.round(area.width),
    field_height_px: Math.round(area.height)
  });
}

function updateTimer() {
  const elapsedSeconds = Math.floor(
    (performance.now() - startTime) / 1000
  );

  timerDisplay.textContent = `${elapsedSeconds}s`;
}

function beginSession() {
  if (isRunning) return;

  isRunning = true;
  startTime = performance.now();
  moveCount = 0;
  taskLog = [];

  timerDisplay.textContent = "0s";
  moveCountDisplay.textContent = "0";
  results.classList.add("hidden");

  beginButton.disabled = true;
  beginButton.textContent = "Session running…";

  gameMessage.textContent =
    "Follow the star at a comfortable pace. Stop whenever you want.";

  moveTarget();

  targetInterval = setInterval(moveTarget, 1150);
  timerInterval = setInterval(updateTimer, 250);
}

function endSession() {
  if (!isRunning) return;

  isRunning = false;

  clearInterval(targetInterval);
  clearInterval(timerInterval);

  targetInterval = null;
  timerInterval = null;

  updateTimer();

  const durationSeconds = Math.round(
    (performance.now() - startTime) / 1000
  );

  beginButton.disabled = false;
  beginButton.textContent = "Begin again ↻";

  gameMessage.textContent =
    "Session ended. You can export the task log for review.";

  resultsSummary.textContent =
    `Duration: ${durationSeconds} seconds. ` +
    `Target positions logged: ${taskLog.length}.`;

  results.classList.remove("hidden");
}

function exportCSV() {
  if (taskLog.length === 0) {
    alert("No task data yet. Run a session first.");
    return;
  }

  const columns = [
    "elapsed_ms",
    "target_x_px",
    "target_y_px",
    "field_width_px",
    "field_height_px"
  ];

  const rows = taskLog.map((entry) =>
    columns.map((column) => entry[column]).join(",")
  );

  const csv = [columns.join(","), ...rows].join("\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "eyeplay-task-log.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

startButton.addEventListener("click", showGame);

aboutButton.addEventListener("click", () => {
  document.getElementById("about-section").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

beginButton.addEventListener("click", beginSession);
endButton.addEventListener("click", endSession);
exportButton.addEventListener("click", exportCSV);
homeButton.addEventListener("click", showHome);

window.addEventListener("resize", () => {
  if (isRunning) {
    moveTarget();
  }
});
