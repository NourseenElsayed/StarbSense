
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Chart from "chart.js/auto";
import cvModule from "@techstark/opencv-js";

const $ = (id) => document.getElementById(id);

const languageToggle = $("language-toggle");
const translations = {"RESEARCH PROTOTYPE":"نموذج أولي بحثي","TRACK · MEASURE · UNDERSTAND":"تابع · قِس · افهم","A playful visual-tracking experience for research.":"تجربة تفاعلية ممتعة لتتبّع حركة العين لأغراض البحث.","Follow the moving star while StarbSense records experimental facial-landmark and eye-region measurements for research analysis.":"اتبِع النجمة المتحركة بينما يسجّل StarbSense قياسات تجريبية لمعالم الوجه ومنطقة العين لتحليلها بحثيًا.","GETTING READY":"الاستعداد","Prepare your adventure":"جهّز نفسك للتجربة","Camera off":"الكاميرا متوقفة","Your camera preview":"معاينة الكاميرا","Enable your camera to get started.":"فعّل الكاميرا للبدء.","Ready when you are":"جاهزون عندما تكون مستعدًا","Place your face comfortably in front of the camera and try to keep the lighting steady.":"ضع وجهك أمام الكاميرا بشكل مريح وحاول الحفاظ على إضاءة ثابتة.","Enable camera":"تشغيل الكاميرا","Disable camera":"إيقاف الكاميرا","Start adventure":"ابدأ التجربة","Enable the camera to load the game model.":"فعّل الكاميرا لتحميل نموذج اللعبة.","STRUCTURED RESEARCH SESSION · V2":"جلسة بحثية منظّمة · الإصدار الثاني","A planned path, not random movement":"مسار محدد، وليس حركة عشوائية","The star follows a fixed sequence of center, horizontal, vertical, and diagonal fixation targets. Each target has a defined position and duration so sessions can be compared consistently.":"تتحرك النجمة وفق تسلسل ثابت من نقاط التثبيت: المركز، والاتجاهات الأفقية والرأسية والقطرية. لكل نقطة موضع ومدة محددان لضمان إمكانية مقارنة الجلسات.","17 FIXATION STEPS":"١٧ خطوة تثبيت","Protocol stages":"مراحل البروتوكول","01 · Center":"٠١ · المركز","02 · Left ↔ Right":"٠٢ · اليسار ↔ اليمين","03 · Up ↕ Down":"٠٣ · أعلى ↕ أسفل","04 · Diagonals":"٠٤ · الاتجاهات القطرية","05 · Center":"٠٥ · المركز","This sequence is an experimental visual-following task. It is not a cover test, a calibrated gaze test, or a validated strabismus screening protocol.":"هذا التسلسل مهمة تجريبية لتتبّع هدف بصري، وليس اختبار تغطية للعين أو اختبار نظر مُعايرًا أو بروتوكولًا معتمدًا للكشف عن الحَوَل.","THE ADVENTURE":"التجربة","Follow the star":"اتبع النجمة","Waiting to start":"في انتظار البدء","Your star is waiting":"النجمة في انتظارك","Stop":"إيقاف","Follow the star at your own comfortable pace":"اتبع النجمة بالسرعة المريحة لك","Star target":"الهدف النجمي","Your adventure starts here":"تبدأ تجربتك من هنا","Enable the camera, then select Start adventure.":"فعّل الكاميرا، ثم اختر «ابدأ التجربة».","Adventure progress":"تقدّم التجربة","During play, the game enters distraction-reduced full-screen mode when supported by your browser. Press Esc to exit full screen.":"أثناء اللعب، تنتقل اللعبة إلى وضع ملء الشاشة لتقليل المشتتات إذا كان المتصفح يدعم ذلك. اضغط Esc للخروج من وضع ملء الشاشة.","Live session counters":"مؤشرات الجلسة المباشرة","Tasks completed":"المهام المكتملة","Frames processed":"الإطارات التي تمت معالجتها","Frames with a face":"الإطارات التي ظهر فيها وجه","YOUR SESSION":"جلستك","Session data":"بيانات الجلسة","Complete or stop a session to review and export recorded data.":"أكمل الجلسة أو أوقفها لمراجعة البيانات المسجلة وتصديرها.","Export CSV":"تصدير CSV","SESSION ANALYTICS":"تحليلات الجلسة","Session dashboard":"لوحة بيانات الجلسة","Experimental data-quality statistics and landmark visualizations.":"إحصاءات تجريبية لجودة البيانات ورسوم توضيحية لمعالم الوجه.","Waiting for a session":"في انتظار جلسة","Processed frames":"الإطارات المعالجة","Face detection rate":"معدل اكتشاف الوجه","Valid iris samples":"عينات القزحية الصالحة","Tasks with recorded frames":"المهام التي سُجلت لها إطارات","Iris landmark coordinates over time":"إحداثيات معالم القزحية بمرور الوقت","Normalized image x-coordinates recorded by MediaPipe. These are not validated gaze measurements.":"إحداثيات X الموحّدة للصورة والمسجلة بواسطة MediaPipe. هذه ليست قياسات معتمدة لاتجاه النظر.","Face detection by task":"اكتشاف الوجه حسب المهمة","Recorded frames with and without a detected face for each task.":"عدد الإطارات التي ظهر فيها وجه أو لم يظهر لكل مهمة.","Interpretation and limitations":"التفسير والقيود","Complete a session to generate its summary.":"أكمل جلسة لإنشاء ملخصها.","StarbSense is an experimental prototype. These experimental measurements are not clinically validated and cannot diagnose or rule out strabismus or any other eye condition.":"StarbSense نموذج تجريبي. هذه القياسات غير معتمدة سريريًا ولا يمكنها تشخيص الحَوَل أو استبعاده، أو تشخيص أي حالة أخرى بالعين.","UNDERSTANDING YOUR SESSION":"فهم نتائج جلستك","What should I do with this result?":"ماذا أفعل بهذه النتيجة؟","StarbSense reports experimental tracking and data-quality measurements only. It cannot decide whether someone's eyes are healthy, diagnose or rule out strabismus, or determine that an eye examination is unnecessary.":"يعرض StarbSense قياسات تجريبية للتتبّع وجودة البيانات فقط. لا يمكنه تحديد ما إذا كانت العين سليمة، أو تشخيص الحَوَل أو استبعاده، أو تقرير أن فحص العين غير ضروري.","If there is an eye-related concern":"إذا كان هناك قلق متعلق بالعين","Ask a parent or guardian to arrange a comprehensive examination with an eye-care professional, especially if an eye appears to turn, vision seems different between the eyes, or double vision occurs.":"اطلب من أحد الوالدين أو ولي الأمر ترتيب فحص شامل لدى مختص عيون، خاصةً إذا بدت إحدى العينين منحرفة، أو اختلفت الرؤية بين العينين، أو حدث ازدواج في الرؤية.","If symptoms begin suddenly":"إذا ظهرت الأعراض فجأة","Sudden new double vision, a sudden change in eye alignment, or sudden vision loss needs urgent medical assessment.":"ظهور ازدواج جديد في الرؤية فجأة، أو تغيّر مفاجئ في اتجاه العين، أو فقدان مفاجئ للرؤية يستلزم تقييمًا طبيًا عاجلًا.","A reassuring-looking StarbSense session does not replace routine eye care or a professional examination.":"حتى إذا بدت نتائج StarbSense مطمئنة، فهي لا تغني عن رعاية العين المعتادة أو الفحص لدى مختص.","Privacy and responsible use":"الخصوصية والاستخدام المسؤول","Camera processing is performed in the browser. Session CSV files contain derived facial landmark coordinates; handle them carefully, especially when working with children.":"تتم معالجة الكاميرا داخل المتصفح. تحتوي ملفات CSV الخاصة بالجلسة على إحداثيات مستخرجة لمعالم الوجه؛ لذا يجب التعامل معها بحذر، خاصةً عند العمل مع الأطفال.","StarbSense · ISEF research prototype · Not a medical device":"StarbSense · نموذج بحثي لمعرض ISEF · ليس جهازًا طبيًا","Camera preview":"معاينة الكاميرا","Camera on":"الكاميرا تعمل","Loading the face model…":"جارٍ تحميل نموذج الوجه…","Camera access requires HTTPS or localhost in a supported browser.":"يتطلب الوصول إلى الكاميرا اتصال HTTPS أو localhost باستخدام متصفح مدعوم.","Requesting camera permission…":"جارٍ طلب إذن استخدام الكاميرا…","Face landmarks and experimental image processing are ready.":"أصبحت معالم الوجه والمعالجة التجريبية للصور جاهزة.","Face tracking is ready, but bright-pixel analysis is unavailable. The game can still run.":"أصبح تتبّع الوجه جاهزًا، لكن تحليل البكسلات الساطعة غير متاح. لا يزال بإمكانك تشغيل اللعبة.","Camera permission denied. Allow camera access in your browser settings.":"تم رفض إذن الكاميرا. اسمح باستخدام الكاميرا من إعدادات المتصفح.","No camera found. Check that a camera is connected.":"لم يتم العثور على كاميرا. تحقق من توصيل الكاميرا.","The camera may be in use by another app. Close other apps using it.":"قد يكون تطبيق آخر يستخدم الكاميرا. أغلق التطبيقات الأخرى التي تستخدمها.","Camera turned off.":"تم إيقاف الكاميرا.","Frame processing failed. Check the browser Console.":"فشلت معالجة الإطار. تحقق من وحدة التحكم (Console) في المتصفح.","Adventure in progress":"التجربة قيد التنفيذ","Adventure started! Follow the star.":"بدأت التجربة! اتبع النجمة.","No session data":"لا توجد بيانات للجلسة","No frames were recorded, so Python analysis was skipped.":"لم يتم تسجيل أي إطارات، لذلك تم تخطي تحليل Python.","Running Python analysis…":"جارٍ تشغيل تحليل Python…","Sending recorded session data to the local Python service.":"جارٍ إرسال بيانات الجلسة المسجلة إلى خدمة Python المحلية.","Python analysis complete":"اكتمل تحليل Python","Python analysis unavailable":"تحليل Python غير متاح","Adventure complete!":"اكتملت التجربة!","You did it! ✨":"أحسنت! ✨","Your session data is ready to review and export.":"بيانات جلستك جاهزة للمراجعة والتصدير.","Session recorded. Bright-pixel candidates are experimental image features, not verified corneal reflections or a medical diagnosis.":"تم تسجيل الجلسة. مؤشرات البكسلات الساطعة خصائص تجريبية للصورة، وليست انعكاسات قرنية مؤكدة أو تشخيصًا طبيًا.","No frame data is available to export.":"لا توجد بيانات إطارات لتصديرها.","CSV exported. It contains experimental facial landmarks and bright-pixel candidates, not a medical diagnosis.":"تم تصدير CSV. يحتوي الملف على معالم وجه تجريبية ومؤشرات بكسلات ساطعة، وليس تشخيصًا طبيًا.","Adventure stopped":"تم إيقاف التجربة","You can start a new adventure when ready.":"يمكنك بدء تجربة جديدة عندما تكون مستعدًا.","Your recorded session data is ready to review.":"بيانات جلستك المسجلة جاهزة للمراجعة.","Session stopped early. You can export the recorded frames.":"تم إيقاف الجلسة مبكرًا. يمكنك تصدير الإطارات المسجلة.","Look at the center":"انظر إلى المركز","Follow left":"اتبع النقطة إلى اليسار","Return to center":"عُد إلى المركز","Follow right":"اتبع النقطة إلى اليمين","Follow upward":"اتبع النقطة إلى أعلى","Follow downward":"اتبع النقطة إلى أسفل","Follow upper-left":"اتبع النقطة إلى أعلى اليسار","Follow upper-right":"اتبع النقطة إلى أعلى اليمين","Follow lower-left":"اتبع النقطة إلى أسفل اليسار","Follow lower-right":"اتبع النقطة إلى أسفل اليمين","Final center fixation":"التثبيت النهائي في المركز","Baseline fixation":"تثبيت أساسي","Horizontal":"أفقي","Vertical":"رأسي","Diagonal":"قطري","Final fixation":"تثبيت نهائي","Left iris landmark x":"إحداثي X لمعْلم القزحية اليسرى","Right iris landmark x":"إحداثي X لمعْلم القزحية اليمنى","Elapsed time (seconds)":"الوقت المنقضي (بالثواني)","Normalized image x-coordinate":"إحداثي X الموحّد للصورة","Face detected":"تم اكتشاف الوجه","Face not detected":"لم يتم اكتشاف الوجه","Recorded frames":"الإطارات المسجلة","Raw iris coordinates over time":"إحداثيات القزحية الخام بمرور الوقت","Relative iris position":"الموضع النسبي للقزحية","Experimental head-rotation proxies":"مؤشرات تجريبية لدوران الرأس","Relative iris comparison by task":"مقارنة موضع القزحية النسبي حسب المهمة","Frame lighting quality over time":"جودة إضاءة الإطارات بمرور الوقت"};
Object.assign(translations, {
  "Session analyzed": "تم تحليل الجلسة",
  "Session recorded": "تم تسجيل الجلسة",
  "No frames were recorded. Start a session and try again.": "لم يتم تسجيل أي إطارات. ابدأ جلسة وحاول مرة أخرى.",
  "Session stopped early. You can export the recorded frames.": "تم إيقاف الجلسة مبكرًا. يمكنك تصدير الإطارات المسجلة.",
  "StarbSense home": "الصفحة الرئيسية لـ StarbSense"
});
const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([english, arabic]) => [arabic, english])
);
let currentLanguage = localStorage.getItem("starbsense-language") || "ar";

function t(value) {
  if (typeof value !== "string" || currentLanguage !== "ar") return value;
  return translations[value] || value;
}

function applyLanguage(language) {
  currentLanguage = language === "en" ? "en" : "ar";
  localStorage.setItem("starbsense-language", currentLanguage);
  document.documentElement.lang = currentLanguage;
  document.title = currentLanguage === "ar"
    ? "StarbSense | نموذج تتبّع بصري تفاعلي"
    : "StarbSense | Interactive Vision Prototype";
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("is-rtl", currentLanguage === "ar");

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue;
    const normalized = original.trim().replace(/\s+/g, " ");
    if (!normalized) continue;
    const translated = currentLanguage === "ar"
      ? translations[normalized]
      : reverseTranslations[normalized];
    if (translated) node.nodeValue = translated;
  }

  document.querySelectorAll("[data-translation-key]").forEach((element) => {
    const key = element.dataset.translationKey;
    const translated = currentLanguage === "ar" ? translations[key] : key;
    if (element instanceof HTMLImageElement) element.alt = translated || key;
    else element.textContent = translated || key;
  });

  document.querySelectorAll("[aria-label]").forEach((element) => {
    const value = element.getAttribute("aria-label");
    const translated = currentLanguage === "ar" ? translations[value] : reverseTranslations[value];
    if (translated) element.setAttribute("aria-label", translated);
  });

  if (taskIndex >= 0 && gameRunning) {
    roundCounter.textContent = currentLanguage === "ar"
      ? `المهمة ${taskIndex + 1} من ${sequence.length}`
      : `Task ${taskIndex + 1} of ${sequence.length}`;
  }

  document.querySelectorAll(".python-chart-card img[data-translation-key]").forEach((image) => {
    const key = image.dataset.translationKey;
    image.alt = currentLanguage === "ar" ? (translations[key] || key) : key;
  });

  if (languageToggle) {
    languageToggle.textContent = currentLanguage === "ar" ? "English" : "العربية";
    languageToggle.setAttribute("aria-label", currentLanguage === "ar" ? "Switch to English" : "التبديل إلى العربية");
  }
}

languageToggle?.addEventListener("click", () => {
  applyLanguage(currentLanguage === "ar" ? "en" : "ar");
  if (samples.length && !$("analytics-dashboard").hidden) renderDashboard();
});


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
let sessionStartedAt = "";
let cameraMetadata = {};
let irisChart = null;
let qualityChart = null;

// Temporary canvas used to process a resized camera image.
const analysisCanvas = document.createElement("canvas");
const analysisContext = analysisCanvas.getContext("2d", {
  willReadFrequently: true
});

// Structured visual-following research protocol v2.
// This is an experimental interaction sequence, NOT a clinical eye test.
const PROTOCOL_ID = "starbsense-structured-v2";
const FRAME_INTERVAL_MS = 120;
const ANALYSIS_MAX_WIDTH = 640;
const BRIGHT_THRESHOLD = 240;

const sequence = [
  { label: "Look at the center", group: "Baseline fixation", phase: "center", x: 50, y: 50, durationMs: 1800 },
  { label: "Follow left", group: "Horizontal", phase: "left", x: 24, y: 50, durationMs: 1400 },
  { label: "Return to center", group: "Horizontal", phase: "center-return", x: 50, y: 50, durationMs: 1000 },
  { label: "Follow right", group: "Horizontal", phase: "right", x: 76, y: 50, durationMs: 1400 },
  { label: "Return to center", group: "Horizontal", phase: "center-return", x: 50, y: 50, durationMs: 1000 },
  { label: "Follow upward", group: "Vertical", phase: "up", x: 50, y: 25, durationMs: 1400 },
  { label: "Return to center", group: "Vertical", phase: "center-return", x: 50, y: 50, durationMs: 1000 },
  { label: "Follow downward", group: "Vertical", phase: "down", x: 50, y: 75, durationMs: 1400 },
  { label: "Return to center", group: "Vertical", phase: "center-return", x: 50, y: 50, durationMs: 1000 },
  { label: "Follow upper-left", group: "Diagonal", phase: "upper-left", x: 29, y: 29, durationMs: 1400 },
  { label: "Return to center", group: "Diagonal", phase: "center-return", x: 50, y: 50, durationMs: 1000 },
  { label: "Follow upper-right", group: "Diagonal", phase: "upper-right", x: 71, y: 29, durationMs: 1400 },
  { label: "Return to center", group: "Diagonal", phase: "center-return", x: 50, y: 50, durationMs: 1000 },
  { label: "Follow lower-left", group: "Diagonal", phase: "lower-left", x: 29, y: 71, durationMs: 1400 },
  { label: "Return to center", group: "Diagonal", phase: "center-return", x: 50, y: 50, durationMs: 1000 },
  { label: "Follow lower-right", group: "Diagonal", phase: "lower-right", x: 71, y: 71, durationMs: 1400 },
  { label: "Final center fixation", group: "Final fixation", phase: "center", x: 50, y: 50, durationMs: 1800 }
];

function getTaskStartOffset(index) {
  return sequence.slice(0, index).reduce((total, task) => total + task.durationMs, 0);
}

function getProtocolDuration() {
  return sequence.reduce((total, task) => total + task.durationMs, 0);
}

function setMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = t(message);
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
  cameraMetadata = {};

  if (camera) {
    camera.srcObject = null;
  }
}

function readCameraMetadata() {
  const track = stream?.getVideoTracks?.()[0];
  const settings = track?.getSettings?.() || {};

  // Deliberately omit deviceId, groupId, and other persistent identifiers.
  return {
    camera_width: Number.isFinite(settings.width) ? settings.width : null,
    camera_height: Number.isFinite(settings.height) ? settings.height : null,
    camera_frame_rate: Number.isFinite(settings.frameRate)
      ? Number(settings.frameRate.toFixed(2))
      : null,
    camera_facing_mode: settings.facingMode || "unknown"
  };
}

function measureFrameLighting() {
  const empty = {
    lighting_mean_gray: null,
    lighting_std_gray: null,
    lighting_sampled_pixels: 0
  };

  if (!prepareAnalysisCanvas()) return empty;

  try {
    const image = analysisContext.getImageData(
      0, 0, analysisCanvas.width, analysisCanvas.height
    );
    const data = image.data;
    const values = [];
    const stride = 64; // sample one pixel per 16 RGBA pixels

    for (let i = 0; i < data.length; i += stride) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      values.push(gray);
    }

    if (!values.length) return empty;

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce(
      (sum, value) => sum + (value - mean) ** 2, 0
    ) / values.length;

    return {
      lighting_mean_gray: Number(mean.toFixed(2)),
      lighting_std_gray: Number(Math.sqrt(variance).toFixed(2)),
      lighting_sampled_pixels: values.length
    };
  } catch (error) {
    console.warn("Frame-lighting measurement failed:", error);
    return empty;
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
    cameraStatus.textContent = t("Camera on");
    cameraReady = true;

    await loadFaceLandmarker();

    startButton.disabled = false;
    cameraButton.textContent = t("Disable camera");
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
    cameraStatus.textContent = t("Camera off");
    startButton.disabled = true;
    cameraButton.textContent = t("Enable camera");
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
  const hadActiveSession = gameRunning;
  stopAdventure();

  if (hadActiveSession) {
    exportButton.disabled = samples.length === 0;
    updateStats();
    renderDashboard();
    void runPythonAnalysis();
  }

  stopCameraTracks();

  cameraReady = false;
  camera.style.display = "none";
  cameraPlaceholder.style.display = "flex";
  cameraStatus.textContent = t("Camera off");

  startButton.disabled = true;
  stopButton.disabled = true;
  cameraButton.textContent = t("Enable camera");
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
    const actualFrameIntervalMs =
      lastFrameTime >= 0 ? Number((now - lastFrameTime).toFixed(2)) : null;
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
      const lighting = measureFrameLighting();

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
        session_started_at_iso: sessionStartedAt,
        elapsed_ms: Math.round(now - startTime),
        task_elapsed_ms: Math.max(
          0,
          Math.round(now - startTime - getTaskStartOffset(Math.max(taskIndex, 0)))
        ),
        actual_frame_interval_ms: actualFrameIntervalMs,
        timestamp_iso: new Date().toISOString(),
        timezone_offset_minutes: new Date().getTimezoneOffset(),
        video_frame_width: camera.videoWidth || null,
        video_frame_height: camera.videoHeight || null,
        frame_interval_target_ms: FRAME_INTERVAL_MS,
        protocol_id: PROTOCOL_ID,
        task_group: currentTask?.group ?? "",
        task_phase: currentTask?.phase ?? "",
        task_duration_target_ms: currentTask?.durationMs ?? null,
        sequence_length: sequence.length,
        page_visibility_state: document.visibilityState,
        ...cameraMetadata,
        ...lighting,
        task_index: Math.max(taskIndex, 0) + 1,
        task_label: currentTask?.label ?? "",
        target_x_percent: currentTask?.x ?? "",
        target_y_percent: currentTask?.y ?? "",

        face_landmarks_detected: landmarks ? 1 : 0,
        face_landmark_count: landmarks ? landmarks.length : 0,

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

  taskLabel.textContent = t(task.label);
  roundCounter.textContent =
    currentLanguage === "ar" ? `المهمة ${index + 1} من ${sequence.length}` : `Task ${index + 1} of ${sequence.length}`;

  gameMessage.style.display = "none";
}

function runSequence() {
  if (!gameRunning) return;

  const elapsed = performance.now() - startTime;
  const totalDuration = getProtocolDuration();
  let elapsedBeforeTask = 0;
  let nextIndex = -1;

  for (let index = 0; index < sequence.length; index++) {
    const taskEnd = elapsedBeforeTask + sequence[index].durationMs;
    if (elapsed < taskEnd) {
      nextIndex = index;
      break;
    }
    elapsedBeforeTask = taskEnd;
  }

  progressBar.style.width =
    `${Math.min(100, (elapsed / totalDuration) * 100)}%`;

  if (nextIndex !== taskIndex && nextIndex >= 0) {
    taskIndex = nextIndex;
    showTask(taskIndex);
    updateStats();
  }

  if (elapsed >= totalDuration) {
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

  sessionStartedAt = new Date().toISOString();
  sessionId =
    `session_${sessionStartedAt.replace(/[:.]/g, "-")}`;
  cameraMetadata = readCameraMetadata();

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
  roundCounter.textContent = t("Adventure in progress");

  $("analytics-dashboard").hidden = true;
  $("python-charts")?.replaceChildren();

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
    heading.dataset.translationKey = alt;
    heading.textContent = t(alt);

    image = document.createElement("img");
    image.id = id;
    image.dataset.translationKey = alt;
    image.alt = t(alt);
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

  if (!samples.length) {
    status.textContent = t("No session data");
    summary.textContent = t("No frames were recorded, so Python analysis was skipped.");
    if (chartContainer) chartContainer.replaceChildren();
    return;
  }

  status.textContent = t("Running Python analysis…");
  summary.textContent = t("Sending recorded session data to the local Python service.");

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

    status.textContent = t("Python analysis complete");

    const lines = [
      `Python analyzed ${result.sample_count ?? 0} recorded frames.`,
      `Face detection rate: ${result.face_detection_rate_pct ?? "N/A"}%.`,
      `Valid iris-coordinate samples: ${result.valid_iris_samples ?? 0}.`,
      `Tasks with recorded frames: ${result.task_count ?? 0}.`,
      `Out-of-order timestamp steps: ${result.negative_time_steps ?? 0}.`,
      `Duplicate timestamp steps: ${result.duplicate_time_steps ?? 0}.`,
      `Median sample interval: ${result.median_sample_interval_ms ?? "N/A"} ms.`,
      `Left-eye valid samples: ${result.left_iris_valid_samples ?? 0}; right-eye valid samples: ${result.right_iris_valid_samples ?? 0}.`,
      `Out-of-range iris coordinates: ${result.iris_coordinate_out_of_bounds_count ?? 0}.`,
      `Lighting samples: ${result.lighting_sample_count ?? 0}; low-light frames (heuristic): ${result.low_light_frame_count ?? 0}; high-brightness frames (heuristic): ${result.high_brightness_frame_count ?? 0}.`,
      result.interpretation || ""
    ];

    summary.textContent = currentLanguage === "ar"
      ? `حلّل Python عدد ${result.sample_count ?? 0} إطارًا مسجلًا. معدل اكتشاف الوجه: ${result.face_detection_rate_pct ?? "غير متاح"}٪. عينات إحداثيات القزحية الصالحة: ${result.valid_iris_samples ?? 0}. المهام ذات الإطارات المسجلة: ${result.task_count ?? 0}. خطوات الطوابع الزمنية غير المرتبة: ${result.negative_time_steps ?? 0}. الخطوات ذات الطوابع الزمنية المكررة: ${result.duplicate_time_steps ?? 0}. وسيط الفاصل بين العينات: ${result.median_sample_interval_ms ?? "غير متاح"} مللي ثانية. العين اليسرى: ${result.left_iris_valid_samples ?? 0} عينة صالحة؛ العين اليمنى: ${result.right_iris_valid_samples ?? 0}. إحداثيات القزحية خارج النطاق: ${result.iris_coordinate_out_of_bounds_count ?? 0}. عينات الإضاءة: ${result.lighting_sample_count ?? 0}. ${result.interpretation || ""}`
      : lines.filter(Boolean).join(" ");

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
    showPythonChart(
      "python-lighting-chart",
      result.lighting_quality_chart,
      "Frame lighting quality over time"
    );
  } catch (error) {
    console.error("Python analysis error:", error);
    status.textContent = t("Python analysis unavailable");
    summary.textContent = currentLanguage === "ar"
      ? `لا تزال لوحة التحليلات داخل المتصفح متاحة. تعذّر إكمال تحليل Python: ${error.message}`
      : `The in-browser dashboard remains available. Python analysis could not be completed: ${error.message}`;
  }
}

function finishAdventure() {
  if (!gameRunning) return;

  stopAdventure();

  progressBar.style.width = "100%";
  target.style.display = "none";
  roundCounter.textContent = t("Adventure complete!");
  taskLabel.textContent = t("You did it! ✨");

  gameMessage.style.display = "flex";
  gameMessage.replaceChildren();

  const emoji = document.createElement("span");
  emoji.className = "game-emoji";
  emoji.textContent = "🎉";

  const heading = document.createElement("strong");
  heading.textContent = t("Adventure complete!");

  const description = document.createElement("span");
  description.textContent =
    t("Your session data is ready to review and export.");

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
    ? currentLanguage === "ar"
      ? `ظهر وجه في ${stats.detected} من أصل ${stats.total} إطارًا. توفرت إحداثيات صالحة لمعالم القزحيتين في ${stats.validIrisSamples} إطارًا. مؤشرات البكسلات الساطعة: اليسرى ${stats.leftBrightSamples}، واليمنى ${stats.rightBrightSamples}. عالج OpenCV عدد ${stats.imageAnalysisFrames} إطارًا. سُجلت إطارات في ${tasksWithFrames} من أصل ${sequence.length} مهمة. مؤشرات البكسلات الساطعة ليست انعكاسات قرنية مؤكدة، وهذه الإحصاءات لا تحدد اتجاه النظر أو محاذاة العين أو صحة الإبصار.`
      : `${stats.detected} of ${stats.total} frames contained a detected face. ` +
        `${stats.validIrisSamples} frames had valid coordinates for both iris landmarks. ` +
        `Bright-pixel candidates: left ${stats.leftBrightSamples}, right ${stats.rightBrightSamples}. ` +
        `OpenCV image analysis processed ${stats.imageAnalysisFrames} frames. ` +
        `${tasksWithFrames} of ${sequence.length} tasks had recorded frames. ` +
        "Bright-pixel candidates are not verified corneal reflections. These statistics do not determine gaze direction, eye alignment, or visual health."
    : t("No frames were recorded. Start a session and try again.");

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
          label: t("Left iris landmark x"),
          data: validLeft.map((sample) => ({
            x: sample.elapsed_ms / 1000,
            y: Number(sample.left_iris_landmark_x)
          })),
          pointRadius: 1,
          borderWidth: 2,
          tension: 0.15
        },
        {
          label: t("Right iris landmark x"),
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
            text: t("Elapsed time (seconds)")
          }
        },
        y: {
          min: 0,
          max: 1,
          title: {
            display: true,
            text: t("Normalized image x-coordinate")
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
        (task, index) => `${index + 1}. ${t(task.label)}`
      ),
      datasets: [
        {
          label: t("Face detected"),
          data: stats.taskStats.map((task) => task.detected),
          stack: "frames"
        },
        {
          label: t("Face not detected"),
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
            text: t("Recorded frames")
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
  link.download = "starbsense_session_data.csv";
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
  roundCounter.textContent = t("Adventure stopped");
  taskLabel.textContent =
    t("You can start a new adventure when ready.");

  gameMessage.style.display = "flex";
  gameMessage.replaceChildren();

  const heading = document.createElement("strong");
  heading.textContent = t("Adventure stopped");

  const description = document.createElement("span");
  description.textContent =
    t("Your recorded session data is ready to review.");

  gameMessage.append(heading, description);

  exportButton.disabled = samples.length === 0;

  setMessage(
    $("report-message"),
    "Session stopped early. You can export the recorded frames."
  );

  updateStats();
  renderDashboard();
  void runPythonAnalysis();
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

applyLanguage(currentLanguage);
