
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Chart from "chart.js/auto";
import cvModule from "@techstark/opencv-js";

const $ = (id) => document.getElementById(id);

// Interface elements
const camera = $("camera");
const cameraPlaceholder = $("camera-placeholder");
const cameraButton = $("camera-btn");
const startButton = $("start-btn");
const stopButton = $("stop-btn");
const exportButton = $("export-btn");
const setupMessage = $("setup-message");
const cameraStatus = $("camera-status");
const target = $("target");
const gameStage = $("game-stage");
const gameMessage = $("game-message");
const progressBar = $("progress-bar");
const taskLabel = $("task-label");
const roundCounter = $("round-counter");

let stream = null;
let landmarker = null;
let cv = null;
let cvLoadPromise = null;
let gameRunning = false;
let cameraReady = false;
let openCVReady = false;
let animationId = null;
let frameAnimationId = null;
let lastFrameTime = -1;
let startTime = 0;
let taskIndex = -1;
let processedFrames = 0;
let faceFrames = 0;
let samples = [];
let sessionId = "";
let irisChart = null;
let qualityChart = null;

// Temporary canvas used to process a resized camera image.
const analysisCanvas = document.createElement("canvas");
const analysisContext = analysisCanvas.getContext("2d", {
  willReadFrequently: true
});

// Experimental game timing, not a validated clinical protocol.
const TASK_DURATION_MS = 1600;
const FRAME_INTERVAL_MS = 120;
const ANALYSIS_MAX_WIDTH = 640;
const BRIGHT_THRESHOLD = 240;

const sequence = [
  { label: "Center star", x: 50, y: 50 },
  { label: "Star to the left", x: 22, y: 50 },
  { label: "Back to center", x: 50, y: 50 },
  { label: "Star to the right", x: 78, y: 50 },
  { label: "Back to center", x: 50, y: 50 },
  { label: "Star up high", x: 50, y: 23 },
  { label: "Back to center", x: 50, y: 50 },
  { label: "Star down low", x: 50, y: 77 },
  { label: "Final center star", x: 50, y: 50 }
];

function setMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.classList.remove("error", "success");

  if (type) element.classList.add(type);
}

function setBusy(busy) {
  cameraButton.disabled = busy;
}

function stopCameraTracks() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  stream = null;

  if (camera) {
    camera.srcObject = null;
  }
}

async function loadFaceLandmarker() {
  if (landmarker) return landmarker;

  setMessage(setupMessage, "Loading the face model…");

  const vision = await FilesetResolver.forVisionTasks(
    "/mediapipe/wasm"
  );

  const modelAssetPath = "/models/face_landmarker.task";
  let lastError;

  for (const delegate of ["GPU", "CPU"]) {
    try {
      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath,
          delegate
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: true
      });

      console.info(`MediaPipe initialized with ${delegate}.`);
      return landmarker;
    } catch (error) {
      lastError = error;
      console.error(
        `MediaPipe ${delegate} initialization failed:`,
        error
      );
    }
  }

  throw lastError || new Error("Could not initialize MediaPipe.");
}

async function loadOpenCV() {
  if (cv) return cv;
  if (cvLoadPromise) return cvLoadPromise;

  cvLoadPromise = (async () => {
    let module;

    if (cvModule instanceof Promise) {
      module = await cvModule;
    } else if (cvModule?.Mat) {
      module = cvModule;
    } else {
      module = await new Promise((resolve, reject) => {
        let settled = false;

        const timeoutId = setTimeout(() => {
          if (settled) return;
          settled = true;
          reject(new Error("OpenCV initialization timed out."));
        }, 30000);

        cvModule.onRuntimeInitialized = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          resolve(cvModule);
        };

        cvModule.onAbort = (reason) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          reject(new Error(String(reason || "OpenCV runtime aborted.")));
        };
      });
    }

    if (!module?.Mat || !module?.matFromImageData) {
      throw new Error("OpenCV loaded without the required image functions.");
    }

    cv = module;
    openCVReady = true;

    console.info("OpenCV.js initialized successfully.");
    return cv;
  })();

  try {
    return await cvLoadPromise;
  } catch (error) {
    cvLoadPromise = null;
    openCVReady = false;
    throw error;
  }
}

async function enableCamera() {
  if (cameraReady || cameraButton.disabled) return;

  if (!navigator.mediaDevices?.getUserMedia) {
    setMessage(
      setupMessage,
      "Camera access requires HTTPS or localhost in a supported browser.",
      "error"
    );
    return;
  }

  setBusy(true);
  setMessage(setupMessage, "Requesting camera permission…");

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    camera.srcObject = stream;
    await camera.play();

    camera.style.display = "block";
    cameraPlaceholder.style.display = "none";
    cameraStatus.textContent = "Camera on";
    cameraReady = true;

    await loadFaceLandmarker();

    startButton.disabled = false;
    cameraButton.textContent = "Disable camera";
    cameraButton.onclick = disableCamera;

    try {
      await loadOpenCV();

      setMessage(
        setupMessage,
        "Face landmarks and experimental image processing are ready.",
        "success"
      );
    } catch (error) {
      console.error("OpenCV initialization failed:", error);

      setMessage(
        setupMessage,
        "Face tracking is ready, but bright-pixel analysis is unavailable. The game can still run.",
        "error"
      );
    }
  } catch (error) {
    console.error("CAMERA OR FACE MODEL ERROR:", error);

    stopCameraTracks();
    cameraReady = false;
    camera.style.display = "none";
    cameraPlaceholder.style.display = "flex";
    cameraStatus.textContent = "Camera off";
    startButton.disabled = true;
    cameraButton.textContent = "Enable camera";
    cameraButton.onclick = enableCamera;

    let message = `Setup error: ${error.message || error.name}`;

    if (error.name === "NotAllowedError") {
      message =
        "Camera permission denied. Allow camera access in your browser settings.";
    } else if (error.name === "NotFoundError") {
      message = "No camera found. Check that a camera is connected.";
    } else if (error.name === "NotReadableError") {
      message =
        "The camera may be in use by another app. Close other apps using it.";
    }

    setMessage(setupMessage, message, "error");
  } finally {
    setBusy(false);
  }
}

function enterGameFullscreen() {
  gameStage.classList.remove("pseudo-fullscreen");

  if (gameStage.requestFullscreen) {
    gameStage.requestFullscreen().catch((error) => {
      console.warn("Native full-screen unavailable:", error);
      gameStage.classList.add("pseudo-fullscreen");
    });
  } else {
    gameStage.classList.add("pseudo-fullscreen");
  }
}

function exitGameFullscreen() {
  gameStage.classList.remove("pseudo-fullscreen");

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch((error) => {
      console.warn("Could not exit native full-screen:", error);
    });
  }
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement !== gameStage) {
    gameStage.classList.remove("pseudo-fullscreen");
  }
});

function disableCamera() {
  stopAdventure();
  stopCameraTracks();

  cameraReady = false;
  camera.style.display = "none";
  cameraPlaceholder.style.display = "flex";
  cameraStatus.textContent = "Camera off";

  startButton.disabled = true;
  stopButton.disabled = true;
  cameraButton.textContent = "Enable camera";
  cameraButton.onclick = enableCamera;

  setMessage(setupMessage, "Camera turned off.");
}

function getPoint(landmarks, index) {
  const point = landmarks?.[index];

  if (!point) {
    return { x: "", y: "" };
  }

  return {
    x: Number(point.x.toFixed(6)),
    y: Number(point.y.toFixed(6))
  };
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getLandmarkXY(landmarks, index) {
  const point = landmarks?.[index];

  if (!point) return null;

  const x = finiteNumber(point.x);
  const y = finiteNumber(point.y);

  if (x === null || y === null) return null;

  return { x, y };
}

function calculateRelativeIris(landmarks, outerIndex, innerIndex, irisIndex) {
  const outer = getLandmarkXY(landmarks, outerIndex);
  const inner = getLandmarkXY(landmarks, innerIndex);
  const iris = getLandmarkXY(landmarks, irisIndex);

  if (!outer || !inner || !iris) {
    return {
      horizontal: null,
      vertical: null,
      eyeWidth: null,
      axisAngleDeg: null,
    };
  }

  const axisX = inner.x - outer.x;
  const axisY = inner.y - outer.y;
  const irisX = iris.x - outer.x;
  const irisY = iris.y - outer.y;

  const lengthSquared = axisX * axisX + axisY * axisY;
  const eyeWidth = Math.sqrt(lengthSquared);

  // Reject missing, degenerate, or implausibly tiny eye-axis measurements.
  if (!Number.isFinite(eyeWidth) || eyeWidth < 0.005) {
    return {
      horizontal: null,
      vertical: null,
      eyeWidth: null,
      axisAngleDeg: null,
    };
  }

  // Projection along the eye-corner axis.
  const horizontal =
    (irisX * axisX + irisY * axisY) / lengthSquared;

  // Signed perpendicular displacement, normalized by eye-axis length.
  const vertical =
    (axisX * irisY - axisY * irisX) / lengthSquared;

  return {
    horizontal,
    vertical,
    eyeWidth,
    axisAngleDeg: Math.atan2(axisY, axisX) * 180 / Math.PI,
  };
}

function calculateHeadRotationProxies(matrixData) {
  const empty = {
    head_rotation_x_proxy_deg: null,
    head_rotation_y_proxy_deg: null,
    head_rotation_z_proxy_deg: null,
  };

  if (!Array.isArray(matrixData) || matrixData.length < 16) {
    return empty;
  }

  const values = matrixData.slice(0, 16).map(finiteNumber);

  if (values.some(value => value === null)) {
    return empty;
  }

  // MediaPipe's 4x4 transform matrix is interpreted as column-major here.
  // Normalize the 3x3 rotation portion to reduce scale effects.
  const columns = [
    [values[0], values[1], values[2]],
    [values[4], values[5], values[6]],
    [values[8], values[9], values[10]],
  ];

  const lengths = columns.map(column =>
    Math.sqrt(column.reduce((sum, value) => sum + value * value, 0))
  );

  if (lengths.some(length => !Number.isFinite(length) || length < 1e-8)) {
    return empty;
  }

  const r00 = columns[0][0] / lengths[0];
  const r10 = columns[0][1] / lengths[0];
  const r20 = columns[0][2] / lengths[0];

  const r21 = columns[1][2] / lengths[1];
  const r22 = columns[2][2] / lengths[2];

  const clamp = value => Math.max(-1, Math.min(1, value));

  // Experimental Euler-angle proxies, not clinically validated head-pose
  // estimates. Matrix conventions and camera setup require validation.
  const yaw = Math.atan2(-r20, Math.sqrt(r00 * r00 + r10 * r10));
  const pitch = Math.atan2(r21, r22);
  const roll = Math.atan2(r10, r00);

  const toDegrees = radians => radians * 180 / Math.PI;

  return {
    head_rotation_x_proxy_deg: toDegrees(pitch),
    head_rotation_y_proxy_deg: toDegrees(yaw),
    head_rotation_z_proxy_deg: toDegrees(roll),
  };
}

function calculateAdvancedMetrics(landmarks, matrixData) {
  const left = calculateRelativeIris(landmarks, 33, 133, 468);
  const right = calculateRelativeIris(landmarks, 362, 263, 473);

  return {
    left_iris_horizontal_relative: left.horizontal,
    left_iris_vertical_relative: left.vertical,
    right_iris_horizontal_relative: right.horizontal,
    right_iris_vertical_relative: right.vertical,

    left_eye_width_norm: left.eyeWidth,
    right_eye_width_norm: right.eyeWidth,

    left_eye_axis_angle_deg: left.axisAngleDeg,
    right_eye_axis_angle_deg: right.axisAngleDeg,

    ...calculateHeadRotationProxies(matrixData),
  };
}


function isValidCoordinate(value) {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0 &&
    Number(value) <= 1
  );
}

function distanceBetween(a, b) {
  if (
    !isValidCoordinate(a?.x) ||
    !isValidCoordinate(a?.y) ||
    !isValidCoordinate(b?.x) ||
    !isValidCoordinate(b?.y)
  ) {
    return 0;
  }

  return Math.hypot(a.x - b.x, a.y - b.y);
}

function prepareAnalysisCanvas() {
  const sourceWidth = camera.videoWidth;
  const sourceHeight = camera.videoHeight;

  if (!sourceWidth || !sourceHeight || !analysisContext) {
    return false;
  }

  const scale = Math.min(1, ANALYSIS_MAX_WIDTH / sourceWidth);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  if (
    analysisCanvas.width !== width ||
    analysisCanvas.height !== height
  ) {
    analysisCanvas.width = width;
    analysisCanvas.height = height;
  }

  analysisContext.drawImage(camera, 0, 0, width, height);
  return true;
}

/*
 * Find a cluster of very bright pixels near an iris landmark.
 *
 * These are candidate bright regions only. They may be caused by
 * lighting, glasses, skin, sclera, or other image features. This
 * function does NOT verify that a candidate is a corneal reflection.
 */
function findBrightCandidate(binaryImage, iris, eyeWidth) {
  const empty = {
    detected: 0,
    x: "",
    y: "",
    pixel_count: 0
  };

  if (
    !binaryImage ||
    !isValidCoordinate(iris?.x) ||
    !isValidCoordinate(iris?.y)
  ) {
    return empty;
  }

  const width = binaryImage.cols;
  const height = binaryImage.rows;

  const centerX = Math.round(iris.x * width);
  const centerY = Math.round(iris.y * height);

  const radius = Math.max(
    3,
    Math.min(18, Math.round(eyeWidth * 0.20 * width))
  );

  const x1 = Math.max(0, centerX - radius);
  const x2 = Math.min(width - 1, centerX + radius);
  const y1 = Math.max(0, centerY - radius);
  const y2 = Math.min(height - 1, centerY + radius);

  let sumX = 0;
  let sumY = 0;
  let pixelCount = 0;

  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (binaryImage.ucharAt(y, x) > 0) {
        sumX += x;
        sumY += y;
        pixelCount++;
      }
    }
  }

  // Avoid reporting isolated single pixels as a candidate.
  if (pixelCount < 2) {
    return {
      ...empty,
      pixel_count: pixelCount
    };
  }

  return {
    detected: 1,
    x: Number(((sumX / pixelCount) / width).toFixed(6)),
    y: Number(((sumY / pixelCount) / height).toFixed(6)),
    pixel_count: pixelCount
  };
}

function analyzeBrightPixels(landmarks) {
  const empty = {
    left_detected: "",
    left_x: "",
    left_y: "",
    left_pixel_count: "",
    right_detected: "",
    right_x: "",
    right_y: "",
    right_pixel_count: "",
    analysis_status: openCVReady ? "no_valid_eye_roi" : "opencv_unavailable"
  };

  if (!openCVReady || !cv || !landmarks) {
    return empty;
  }

  if (!prepareAnalysisCanvas()) {
    return {
      ...empty,
      analysis_status: "image_not_ready"
    };
  }

  let rgba = null;
  let gray = null;
  let binary = null;

  try {
    const imageData = analysisContext.getImageData(
      0,
      0,
      analysisCanvas.width,
      analysisCanvas.height
    );

    rgba = cv.matFromImageData(imageData);
    gray = new cv.Mat();
    binary = new cv.Mat();

    cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY);
    cv.threshold(
      gray,
      binary,
      BRIGHT_THRESHOLD,
      255,
      cv.THRESH_BINARY
    );

    const leftOuter = getPoint(landmarks, 33);
    const leftInner = getPoint(landmarks, 133);
    const rightInner = getPoint(landmarks, 362);
    const rightOuter = getPoint(landmarks, 263);
    const leftIris = getPoint(landmarks, 468);
    const rightIris = getPoint(landmarks, 473);

    const leftEyeWidth = distanceBetween(leftOuter, leftInner);
    const rightEyeWidth = distanceBetween(rightInner, rightOuter);

    const left = findBrightCandidate(
      binary,
      leftIris,
      leftEyeWidth
    );

    const right = findBrightCandidate(
      binary,
      rightIris,
      rightEyeWidth
    );

    return {
      left_detected: left.detected,
      left_x: left.x,
      left_y: left.y,
      left_pixel_count: left.pixel_count,
      right_detected: right.detected,
      right_x: right.x,
      right_y: right.y,
      right_pixel_count: right.pixel_count,
      analysis_status: "processed"
    };
  } catch (error) {
    console.error("Bright-pixel analysis failed:", error);

    return {
      ...empty,
      analysis_status: "processing_error"
    };
  } finally {
    // OpenCV matrices use WebAssembly memory and must be released.
    if (rgba) rgba.delete();
    if (gray) gray.delete();
    if (binary) binary.delete();
  }
}

function getFaceTransformationMatrix(result) {
  const matrix = result?.facialTransformationMatrixes?.[0];

  if (!matrix?.data) return "";

  try {
    return JSON.stringify(Array.from(matrix.data));
  } catch {
    return "";
  }
}

function recordFrame(now) {
  if (!gameRunning) return;

  if (
    camera.readyState >= 2 &&
    now - lastFrameTime >= FRAME_INTERVAL_MS
  ) {
    lastFrameTime = now;

    try {
      const result = landmarker.detectForVideo(camera, now);
      const landmarks = result.faceLandmarks?.[0] ?? null;

      processedFrames++;

      if (landmarks) faceFrames++;

      const leftOuter = getPoint(landmarks, 33);
      const leftInner = getPoint(landmarks, 133);
      const rightInner = getPoint(landmarks, 362);
      const rightOuter = getPoint(landmarks, 263);
      const leftIris = getPoint(landmarks, 468);
      const rightIris = getPoint(landmarks, 473);

      const bright = analyzeBrightPixels(landmarks);

      const currentTask = sequence[Math.max(taskIndex, 0)];
      const matrixJson = getFaceTransformationMatrix(result);
      let matrixData = null;

      if (matrixJson) {
        try {
          matrixData = JSON.parse(matrixJson);
        } catch (error) {
          console.warn("Could not parse facial transformation matrix:", error);
        }
      }

      const sample = {
        session_id: sessionId,
        elapsed_ms: Math.round(now - startTime),
        task_index: Math.max(taskIndex, 0) + 1,
        task_label: currentTask?.label ?? "",
        target_x_percent: currentTask?.x ?? "",
        target_y_percent: currentTask?.y ?? "",

        face_landmarks_detected: landmarks ? 1 : 0,

        left_eye_outer_x: leftOuter.x,
        left_eye_outer_y: leftOuter.y,
        left_eye_inner_x: leftInner.x,
        left_eye_inner_y: leftInner.y,

        right_eye_inner_x: rightInner.x,
        right_eye_inner_y: rightInner.y,
        right_eye_outer_x: rightOuter.x,
        right_eye_outer_y: rightOuter.y,

        left_iris_landmark_x: leftIris.x,
        left_iris_landmark_y: leftIris.y,
        right_iris_landmark_x: rightIris.x,
        right_iris_landmark_y: rightIris.y,

        face_transformation_matrix: matrixJson,

        left_bright_candidate_detected: bright.left_detected,
        left_bright_candidate_x: bright.left_x,
        left_bright_candidate_y: bright.left_y,
        left_bright_pixel_count: bright.left_pixel_count,

        right_bright_candidate_detected: bright.right_detected,
        right_bright_candidate_x: bright.right_x,
        right_bright_candidate_y: bright.right_y,
        right_bright_pixel_count: bright.right_pixel_count,

        image_analysis_status: bright.analysis_status,
        bright_pixel_threshold: openCVReady ? BRIGHT_THRESHOLD : ""
      };

      Object.assign(
        sample,
        calculateAdvancedMetrics(landmarks, matrixData)
      );

      samples.push(sample);

      updateStats();
    } catch (error) {
      console.error("Frame processing failed:", error);

      setMessage(
        setupMessage,
        "Frame processing failed. Check the browser Console.",
        "error"
      );
    }
  }

  frameAnimationId = requestAnimationFrame(recordFrame);
}

function showTask(index) {
  const task = sequence[index];
  if (!task) return;

  target.style.display = "grid";
  target.style.left = `${task.x}%`;
  target.style.top = `${task.y}%`;

  taskLabel.textContent = task.label;
  roundCounter.textContent =
    `Task ${index + 1} of ${sequence.length}`;

  gameMessage.style.display = "none";
}

function runSequence() {
  if (!gameRunning) return;

  const elapsed = performance.now() - startTime;
  const nextIndex = Math.floor(elapsed / TASK_DURATION_MS);

  progressBar.style.width =
    `${Math.min(
      100,
      (elapsed / (sequence.length * TASK_DURATION_MS)) * 100
    )}%`;

  if (
    nextIndex !== taskIndex &&
    nextIndex < sequence.length
  ) {
    taskIndex = nextIndex;
    showTask(taskIndex);
    updateStats();
  }

  if (elapsed >= sequence.length * TASK_DURATION_MS) {
    finishAdventure();
    return;
  }

  animationId = requestAnimationFrame(runSequence);
}

function startAdventure() {
  if (!cameraReady || !landmarker || gameRunning) return;

  samples = [];
  processedFrames = 0;
  faceFrames = 0;
  taskIndex = -1;
  lastFrameTime = -1;

  sessionId =
    `session_${new Date().toISOString().replace(/[:.]/g, "-")}`;

  startTime = performance.now();
  gameRunning = true;

  target.style.display = "grid";
  target.style.left = "50%";
  target.style.top = "50%";

  progressBar.style.width = "0%";
  gameMessage.style.display = "none";

  startButton.disabled = true;
  stopButton.disabled = false;
  exportButton.disabled = true;
  roundCounter.textContent = "Adventure in progress";

  $("analytics-dashboard").hidden = true;
  for (const id of ["python-face-chart", "python-iris-chart"]) {
  document.getElementById(id)?.remove();
}

  setMessage(
    setupMessage,
    "Adventure started! Follow the star."
  );

  enterGameFullscreen();

  frameAnimationId = requestAnimationFrame(recordFrame);
  animationId = requestAnimationFrame(runSequence);
}

function stopAdventure() {
  gameRunning = false;

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }

  if (frameAnimationId !== null) {
    cancelAnimationFrame(frameAnimationId);
  }

  animationId = null;
  frameAnimationId = null;

  exitGameFullscreen();

  startButton.disabled = !cameraReady;
  stopButton.disabled = true;
}

function showPythonChart(id, src, alt) {
  const container = document.getElementById("python-charts");
  if (!container || !src) return;

  let image = document.getElementById(id);

  if (!image) {
    const card = document.createElement("section");
    card.className = "python-chart-card";

    const heading = document.createElement("h3");
    heading.textContent = alt;

    image = document.createElement("img");
    image.id = id;
    image.alt = alt;
    image.loading = "lazy";
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = "auto";

    card.append(heading, image);
    container.appendChild(card);
  }

  image.src = src;
}

async function runPythonAnalysis() {
  const status = document.getElementById("analytics-status");
  const summary = document.getElementById("analytics-summary");
  const chartContainer = document.getElementById("python-charts");

  if (!status || !summary) return;

  status.textContent = "Running Python analysis…";
  summary.textContent = "Sending recorded session data to the local Python service.";

  if (chartContainer) chartContainer.replaceChildren();

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ samples })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Python analysis failed.");
    }

    status.textContent = "Python analysis complete";

    const lines = [
      `Python analyzed ${result.sample_count ?? 0} recorded frames.`,
      `Face detection rate: ${result.face_detection_rate_pct ?? "N/A"}%.`,
      `Valid iris-coordinate samples: ${result.valid_iris_samples ?? 0}.`,
      `Tasks with recorded frames: ${result.task_count ?? 0}.`,
      `Out-of-order timestamp steps: ${result.negative_time_steps ?? 0}.`,
      `Duplicate timestamp steps: ${result.duplicate_time_steps ?? 0}.`,
      `Median sample interval: ${result.median_sample_interval_ms ?? "N/A"} ms.`,
      result.interpretation || ""
    ];

    summary.textContent = lines.filter(Boolean).join(" ");

    showPythonChart(
      "python-face-chart",
      result.face_detection_chart,
      "Face detection by task"
    );
    showPythonChart(
      "python-iris-chart",
      result.iris_coordinates_chart,
      "Raw iris coordinates over time"
    );
    showPythonChart(
      "python-relative-chart",
      result.relative_iris_chart,
      "Relative iris position"
    );
    showPythonChart(
      "python-head-chart",
      result.head_rotation_chart,
      "Experimental head-rotation proxies"
    );
    showPythonChart(
      "python-task-chart",
      result.relative_iris_task_chart,
      "Relative iris comparison by task"
    );
  } catch (error) {
    console.error("Python analysis error:", error);
    status.textContent = "Python analysis unavailable";
    summary.textContent =
      `The in-browser dashboard remains available. Python analysis could not be completed: ${error.message}`;
  }
}

function finishAdventure() {
  if (!gameRunning) return;

  stopAdventure();

  progressBar.style.width = "100%";
  target.style.display = "none";
  roundCounter.textContent = "Adventure complete!";
  taskLabel.textContent = "You did it! ✨";

  gameMessage.style.display = "flex";
  gameMessage.replaceChildren();

  const emoji = document.createElement("span");
  emoji.className = "game-emoji";
  emoji.textContent = "🎉";

  const heading = document.createElement("strong");
  heading.textContent = "Adventure complete!";

  const description = document.createElement("span");
  description.textContent =
    "Your session data is ready to review and export.";

  gameMessage.append(emoji, heading, description);

  startButton.disabled = !cameraReady;
  exportButton.disabled = samples.length === 0;

  setMessage(
    $("report-message"),
    "Session recorded. Bright-pixel candidates are experimental image features, not verified corneal reflections or a medical diagnosis.",
    "success"
  );

  updateStats();
renderDashboard();
void runPythonAnalysis();
}

function updateStats() {
  $("tasks-completed").textContent = String(
    gameRunning
      ? Math.max(0, taskIndex + 1)
      : taskIndex >= 0
        ? taskIndex + 1
        : 0
  );

  $("frames-count").textContent = String(processedFrames);
  $("face-count").textContent = String(faceFrames);
}

function analyzeSession() {
  const total = samples.length;

  const detected = samples.filter(
    (sample) => sample.face_landmarks_detected === 1
  ).length;

  const validIrisSamples = samples.filter((sample) =>
    isValidCoordinate(sample.left_iris_landmark_x) &&
    isValidCoordinate(sample.left_iris_landmark_y) &&
    isValidCoordinate(sample.right_iris_landmark_x) &&
    isValidCoordinate(sample.right_iris_landmark_y)
  ).length;

  const leftBrightSamples = samples.filter(
    (sample) => sample.left_bright_candidate_detected === 1
  ).length;

  const rightBrightSamples = samples.filter(
    (sample) => sample.right_bright_candidate_detected === 1
  ).length;

  const taskStats = sequence.map((task, index) => {
    const taskSamples = samples.filter(
      (sample) => sample.task_index === index + 1
    );

    const faceDetected = taskSamples.filter(
      (sample) => sample.face_landmarks_detected === 1
    ).length;

    return {
      label: task.label,
      total: taskSamples.length,
      detected: faceDetected,
      notDetected: taskSamples.length - faceDetected
    };
  });

  const imageAnalysisFrames = samples.filter(
    (sample) => sample.image_analysis_status === "processed"
  ).length;

  return {
    total,
    detected,
    faceRate: total ? (detected / total) * 100 : 0,
    validIrisSamples,
    leftBrightSamples,
    rightBrightSamples,
    imageAnalysisFrames,
    taskStats
  };
}

function renderDashboard() {
  const dashboard = $("analytics-dashboard");
  if (!dashboard) return;

  const stats = analyzeSession();

  dashboard.hidden = false;

  $("analytics-status").textContent = samples.length
    ? "Session analyzed"
    : "No session data";

  $("analytics-frames").textContent =
    stats.total.toLocaleString();

  $("analytics-face-rate").textContent = stats.total
    ? `${stats.faceRate.toFixed(1)}%`
    : "—";

  $("analytics-iris-valid").textContent =
    `${stats.validIrisSamples} / ${stats.total}`;

  const tasksWithFrames = stats.taskStats.filter(
    (task) => task.total > 0
  ).length;

  $("analytics-tasks").textContent =
    `${tasksWithFrames} / ${sequence.length}`;

  $("analytics-summary").textContent = stats.total
    ? `${stats.detected} of ${stats.total} frames contained a detected face. ` +
      `${stats.validIrisSamples} frames had valid coordinates for both iris landmarks. ` +
      `Bright-pixel candidates: left ${stats.leftBrightSamples}, right ${stats.rightBrightSamples}. ` +
      `OpenCV image analysis processed ${stats.imageAnalysisFrames} frames. ` +
      `${tasksWithFrames} of ${sequence.length} tasks had recorded frames. ` +
      "Bright-pixel candidates are not verified corneal reflections. These statistics do not determine gaze direction, eye alignment, or visual health."
    : "No frames were recorded. Start a session and try again.";

  if (irisChart) {
    irisChart.destroy();
    irisChart = null;
  }

  if (qualityChart) {
    qualityChart.destroy();
    qualityChart = null;
  }

  const irisCanvas = $("iris-chart");
  const qualityCanvas = $("quality-chart");

  const validLeft = samples.filter((sample) =>
    isValidCoordinate(sample.left_iris_landmark_x)
  );

  const validRight = samples.filter((sample) =>
    isValidCoordinate(sample.right_iris_landmark_x)
  );

  irisChart = new Chart(irisCanvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Left iris landmark x",
          data: validLeft.map((sample) => ({
            x: sample.elapsed_ms / 1000,
            y: Number(sample.left_iris_landmark_x)
          })),
          pointRadius: 1,
          borderWidth: 2,
          tension: 0.15
        },
        {
          label: "Right iris landmark x",
          data: validRight.map((sample) => ({
            x: sample.elapsed_ms / 1000,
            y: Number(sample.right_iris_landmark_x)
          })),
          pointRadius: 1,
          borderWidth: 2,
          tension: 0.15
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Elapsed time (seconds)"
          }
        },
        y: {
          min: 0,
          max: 1,
          title: {
            display: true,
            text: "Normalized image x-coordinate"
          }
        }
      },
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });

  qualityChart = new Chart(qualityCanvas, {
    type: "bar",
    data: {
      labels: stats.taskStats.map(
        (task, index) => `${index + 1}. ${task.label}`
      ),
      datasets: [
        {
          label: "Face detected",
          data: stats.taskStats.map((task) => task.detected),
          stack: "frames"
        },
        {
          label: "Face not detected",
          data: stats.taskStats.map((task) => task.notDetected),
          stack: "frames"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          ticks: {
            maxRotation: 60,
            minRotation: 30
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: "Recorded frames"
          }
        }
      },
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function csvEscape(value) {
  const textValue = String(value ?? "");
  return `"${textValue.replaceAll('"', '""')}"`;
}

function exportSession() {
  if (!samples.length) {
    setMessage(
      $("report-message"),
      "No frame data is available to export.",
      "error"
    );
    return;
  }

  const columns = Object.keys(samples[0]);

  const csv = [
    columns.map(csvEscape).join(","),
    ...samples.map((row) =>
      columns.map((column) => csvEscape(row[column])).join(",")
    )
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "eyeplay_session_data.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  setMessage(
    $("report-message"),
    "CSV exported. It contains experimental facial landmarks and bright-pixel candidates, not a medical diagnosis.",
    "success"
  );
}

// Button handlers
cameraButton.onclick = enableCamera;
startButton.onclick = startAdventure;

stopButton.onclick = () => {
  if (!gameRunning) return;

  stopAdventure();

  target.style.display = "none";
  roundCounter.textContent = "Adventure stopped";
  taskLabel.textContent =
    "You can start a new adventure when ready.";

  gameMessage.style.display = "flex";
  gameMessage.replaceChildren();

  const heading = document.createElement("strong");
  heading.textContent = "Adventure stopped";

  const description = document.createElement("span");
  description.textContent =
    "Your recorded session data is ready to review.";

  gameMessage.append(heading, description);

  exportButton.disabled = samples.length === 0;

  setMessage(
    $("report-message"),
    "Session stopped early. You can export the recorded frames."
  );

  updateStats();
  renderDashboard();
};

exportButton.onclick = exportSession;

window.addEventListener("pagehide", () => {
  stopAdventure();
  stopCameraTracks();

  if (landmarker) {
    landmarker.close();
    landmarker = null;
  }
});
