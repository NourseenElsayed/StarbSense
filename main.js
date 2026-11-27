
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Chart from "chart.js/auto";
import cvModule from "@techstark/opencv-js";
import { startCameraQualityMonitor, inspectFaceGeometry } from "./quality-monitor.js";

const $ = (id) => document.getElementById(id);

const languageToggle = $("language-toggle");
const translations = {"RESEARCH PROTOTYPE":"نموذج أولي بحثي","TRACK · MEASURE · UNDERSTAND":"تابع · قِس · افهم","A playful visual-tracking experience for research.":"تجربة تفاعلية ممتعة لتتبّع حركة العين لأغراض البحث.","Follow the moving star while StarbSense records experimental facial-landmark and eye-region measurements for research analysis.":"اتبِع النجمة المتحركة بينما يسجّل StarbSense قياسات تجريبية لمعالم الوجه ومنطقة العين لتحليلها بحثيًا.","GETTING READY":"الاستعداد","Prepare your adventure":"جهّز نفسك للتجربة","Camera off":"الكاميرا متوقفة","Your camera preview":"معاينة الكاميرا","Enable your camera to get started.":"فعّل الكاميرا للبدء.","Ready when you are":"جاهزون عندما تكون مستعدًا","Place your face comfortably in front of the camera and try to keep the lighting steady.":"ضع وجهك أمام الكاميرا بشكل مريح وحاول الحفاظ على إضاءة ثابتة.","Enable camera":"تشغيل الكاميرا","Disable camera":"إيقاف الكاميرا","Start adventure":"ابدأ التجربة","Enable the camera to load the game model.":"فعّل الكاميرا لتحميل نموذج اللعبة.","STRUCTURED RESEARCH SESSION · V2":"جلسة بحثية منظّمة · الإصدار الثاني","A planned path, not random movement":"مسار محدد، وليس حركة عشوائية","The star follows a fixed sequence of center, horizontal, vertical, and diagonal fixation targets. Each target has a defined position and duration so sessions can be compared consistently.":"تتحرك النجمة وفق تسلسل ثابت من نقاط التثبيت: المركز، والاتجاهات الأفقية والرأسية والقطرية. لكل نقطة موضع ومدة محددان لضمان إمكانية مقارنة الجلسات.","17 FIXATION STEPS":"١٧ خطوة تثبيت","Protocol stages":"مراحل البروتوكول","01 · Center":"٠١ · المركز","02 · Left ↔ Right":"٠٢ · اليسار ↔ اليمين","03 · Up ↕ Down":"٠٣ · أعلى ↕ أسفل","04 · Diagonals":"٠٤ · الاتجاهات القطرية","05 · Center":"٠٥ · المركز","This sequence is an experimental visual-following task. It is not a cover test, a calibrated gaze test, or a validated strabismus screening protocol.":"هذا التسلسل مهمة تجريبية لتتبّع هدف بصري، وليس اختبار تغطية للعين أو اختبار نظر مُعايرًا أو بروتوكولًا معتمدًا للكشف عن الحَوَل.","THE ADVENTURE":"التجربة","Follow the star":"اتبع النجمة","Waiting to start":"في انتظار البدء","Your star is waiting":"النجمة في انتظارك","Stop":"إيقاف","Follow the star at your own comfortable pace":"اتبع النجمة بالسرعة المريحة لك","Star target":"الهدف النجمي","Your adventure starts here":"تبدأ تجربتك من هنا","Enable the camera, then select Start adventure.":"فعّل الكاميرا، ثم اختر «ابدأ التجربة».","Adventure progress":"تقدّم التجربة","During play, the game enters distraction-reduced full-screen mode when supported by your browser. Press Esc to exit full screen.":"أثناء اللعب، تنتقل اللعبة إلى وضع ملء الشاشة لتقليل المشتتات إذا كان المتصفح يدعم ذلك. اضغط Esc للخروج من وضع ملء الشاشة.","Live session counters":"مؤشرات الجلسة المباشرة","Tasks completed":"المهام المكتملة","Frames processed":"الإطارات التي تمت معالجتها","Frames with a face":"الإطارات التي ظهر فيها وجه","YOUR SESSION":"جلستك","Session data":"بيانات الجلسة","Complete or stop a session to review and export recorded data.":"أكمل الجلسة أو أوقفها لمراجعة البيانات المسجلة وتصديرها.","Export CSV":"تصدير CSV","SESSION ANALYTICS":"تحليلات الجلسة","Session dashboard":"لوحة بيانات الجلسة","Experimental data-quality statistics and landmark visualizations.":"إحصاءات تجريبية لجودة البيانات ورسوم توضيحية لمعالم الوجه.","Waiting for a session":"في انتظار جلسة","Processed frames":"الإطارات المعالجة","Face detection rate":"معدل اكتشاف الوجه","Valid iris samples":"عينات القزحية الصالحة","Tasks with recorded frames":"المهام التي سُجلت لها إطارات","Iris landmark coordinates over time":"إحداثيات معالم القزحية بمرور الوقت","Normalized image x-coordinates recorded by MediaPipe. These are not validated gaze measurements.":"إحداثيات X الموحّدة للصورة والمسجلة بواسطة MediaPipe. هذه ليست قياسات معتمدة لاتجاه النظر.","Face detection by task":"اكتشاف الوجه حسب المهمة","Recorded frames with and without a detected face for each task.":"عدد الإطارات التي ظهر فيها وجه أو لم يظهر لكل مهمة.","Interpretation and limitations":"التفسير والقيود","Complete a session to generate its summary.":"أكمل جلسة لإنشاء ملخصها.","StarbSense is an experimental prototype. These experimental measurements are not clinically validated and cannot diagnose or rule out strabismus or any other eye condition.":"StarbSense نموذج تجريبي. هذه القياسات غير معتمدة سريريًا ولا يمكنها تشخيص الحَوَل أو استبعاده، أو تشخيص أي حالة أخرى بالعين.","UNDERSTANDING YOUR SESSION":"فهم نتائج جلستك","What should I do with this result?":"ماذا أفعل بهذه النتيجة؟","StarbSense reports experimental tracking and data-quality measurements only. It cannot decide whether someone's eyes are healthy, diagnose or rule out strabismus, or determine that an eye examination is unnecessary.":"يعرض StarbSense قياسات تجريبية للتتبّع وجودة البيانات فقط. لا يمكنه تحديد ما إذا كانت العين سليمة، أو تشخيص الحَوَل أو استبعاده، أو تقرير أن فحص العين غير ضروري.","If there is an eye-related concern":"إذا كان هناك قلق متعلق بالعين","Ask a parent or guardian to arrange a comprehensive examination with an eye-care professional, especially if an eye appears to turn, vision seems different between the eyes, or double vision occurs.":"اطلب من أحد الوالدين أو ولي الأمر ترتيب فحص شامل لدى مختص عيون، خاصةً إذا بدت إحدى العينين منحرفة، أو اختلفت الرؤية بين العينين، أو حدث ازدواج في الرؤية.","If symptoms begin suddenly":"إذا ظهرت الأعراض فجأة","Sudden new double vision, a sudden change in eye alignment, or sudden vision loss needs urgent medical assessment.":"ظهور ازدواج جديد في الرؤية فجأة، أو تغيّر مفاجئ في اتجاه العين، أو فقدان مفاجئ للرؤية يستلزم تقييمًا طبيًا عاجلًا.","A reassuring-looking StarbSense session does not replace routine eye care or a professional examination.":"حتى إذا بدت نتائج StarbSense مطمئنة، فهي لا تغني عن رعاية العين المعتادة أو الفحص لدى مختص.","Privacy and responsible use":"الخصوصية والاستخدام المسؤول","Camera processing is performed in the browser. Session CSV files contain derived facial landmark coordinates; handle them carefully, especially when working with children.":"تتم معالجة الكاميرا داخل المتصفح. تحتوي ملفات CSV الخاصة بالجلسة على إحداثيات مستخرجة لمعالم الوجه؛ لذا يجب التعامل معها بحذر، خاصةً عند العمل مع الأطفال.","StarbSense · ISEF research prototype · Not a medical device":"StarbSense · نموذج بحثي لمعرض ISEF · ليس جهازًا طبيًا","Camera preview":"معاينة الكاميرا","Camera on":"الكاميرا تعمل","Loading the face model…":"جارٍ تحميل نموذج الوجه…","Camera access requires HTTPS or localhost in a supported browser.":"يتطلب الوصول إلى الكاميرا اتصال HTTPS أو localhost باستخدام متصفح مدعوم.","Requesting camera permission…":"جارٍ طلب إذن استخدام الكاميرا…","Face landmarks and experimental image processing are ready.":"أصبحت معالم الوجه والمعالجة التجريبية للصور جاهزة.","Face tracking is ready, but bright-pixel analysis is unavailable. The game can still run.":"أصبح تتبّع الوجه جاهزًا، لكن تحليل البكسلات الساطعة غير متاح. لا يزال بإمكانك تشغيل اللعبة.","Camera permission denied. Allow camera access in your browser settings.":"تم رفض إذن الكاميرا. اسمح باستخدام الكاميرا من إعدادات المتصفح.","No camera found. Check that a camera is connected.":"لم يتم العثور على كاميرا. تحقق من توصيل الكاميرا.","The camera may be in use by another app. Close other apps using it.":"قد يكون تطبيق آخر يستخدم الكاميرا. أغلق التطبيقات الأخرى التي تستخدمها.","Camera turned off.":"تم إيقاف الكاميرا.","Frame processing failed. Check the browser Console.":"فشلت معالجة الإطار. تحقق من وحدة التحكم (Console) في المتصفح.","Adventure in progress":"التجربة قيد التنفيذ","Adventure started! Follow the star.":"بدأت التجربة! اتبع النجمة.","No session data":"لا توجد بيانات للجلسة","No frames were recorded, so Python analysis was skipped.":"لم يتم تسجيل أي إطارات، لذلك تم تخطي تحليل Python.","Running Python analysis…":"جارٍ تشغيل تحليل Python…","Sending recorded session data to the local Python service.":"جارٍ إرسال بيانات الجلسة المسجلة إلى خدمة Python المحلية.","Python analysis complete":"اكتمل تحليل Python","Python analysis unavailable":"تحليل Python غير متاح","Adventure complete!":"اكتملت التجربة!","You did it! ✨":"أحسنت! ✨","Your session data is ready to review and export.":"بيانات جلستك جاهزة للمراجعة والتصدير.","Session recorded. Bright-pixel candidates are experimental image features, not verified corneal reflections or a medical diagnosis.":"تم تسجيل الجلسة. مؤشرات البكسلات الساطعة خصائص تجريبية للصورة، وليست انعكاسات قرنية مؤكدة أو تشخيصًا طبيًا.","No frame data is available to export.":"لا توجد بيانات إطارات لتصديرها.","CSV exported. It contains experimental facial landmarks and bright-pixel candidates, not a medical diagnosis.":"تم تصدير CSV. يحتوي الملف على معالم وجه تجريبية ومؤشرات بكسلات ساطعة، وليس تشخيصًا طبيًا.","Adventure stopped":"تم إيقاف التجربة","You can start a new adventure when ready.":"يمكنك بدء تجربة جديدة عندما تكون مستعدًا.","Your recorded session data is ready to review.":"بيانات جلستك المسجلة جاهزة للمراجعة.","Session stopped early. You can export the recorded frames.":"تم إيقاف الجلسة مبكرًا. يمكنك تصدير الإطارات المسجلة.","Look at the center":"انظر إلى المركز","Follow left":"اتبع النقطة إلى اليسار","Return to center":"عُد إلى المركز","Follow right":"اتبع النقطة إلى اليمين","Follow upward":"اتبع النقطة إلى أعلى","Follow downward":"اتبع النقطة إلى أسفل","Follow upper-left":"اتبع النقطة إلى أعلى اليسار","Follow upper-right":"اتبع النقطة إلى أعلى اليمين","Follow lower-left":"اتبع النقطة إلى أسفل اليسار","Follow lower-right":"اتبع النقطة إلى أسفل اليمين","Final center fixation":"التثبيت النهائي في المركز","Baseline fixation":"تثبيت أساسي","Horizontal":"أفقي","Vertical":"رأسي","Diagonal":"قطري","Final fixation":"تثبيت نهائي","Left iris landmark x":"إحداثي X لمعْلم القزحية اليسرى","Right iris landmark x":"إحداثي X لمعْلم القزحية اليمنى","Elapsed time (seconds)":"الوقت المنقضي (بالثواني)","Normalized image x-coordinate":"إحداثي X الموحّد للصورة","Face detected":"تم اكتشاف الوجه","Face not detected":"لم يتم اكتشاف الوجه","Recorded frames":"الإطارات المسجلة","Raw iris coordinates over time":"إحداثيات القزحية الخام بمرور الوقت","Relative iris position":"الموضع النسبي للقزحية","Experimental head-rotation proxies":"مؤشرات تجريبية لدوران الرأس","Relative iris comparison by task":"مقارنة موضع القزحية النسبي حسب المهمة","Frame lighting quality over time":"جودة إضاءة الإطارات بمرور الوقت","Technical data availability by task group":"توفر البيانات التقنية حسب مجموعة المهمة"};
Object.assign(translations, {
  "Session analyzed": "تم تحليل الجلسة",
  "Session recorded": "تم تسجيل الجلسة",
  "No frames were recorded. Start a session and try again.": "لم يتم تسجيل أي إطارات. ابدأ جلسة وحاول مرة أخرى.",
  "Session stopped early. You can export the recorded frames.": "تم إيقاف الجلسة مبكرًا. يمكنك تصدير الإطارات المسجلة.",
  "StarbSense home": "الصفحة الرئيسية لـ StarbSense"
});

Object.assign(translations, {
  "STARBSENSE GUIDE · LOCAL ASSISTANT": "مساعد StarbSense المحلي",
  "Ask about your session or eye-health next steps": "اسأل عن جلستك أو الخطوات المناسبة لصحة العين",
  "This on-device, rule-based guide explains project measurements and evidence-based next steps. It is not a generative AI model, medical examination, or diagnostic service. Your question is handled in this browser.": "يساعدك هذا الدليل المحلي القائم على قواعد محددة في فهم قياسات المشروع والخطوات التالية المستندة إلى الأدلة. لكنه ليس نموذج ذكاء اصطناعي توليديًا أو فحصًا طبيًا أو خدمة تشخيص. تتم معالجة سؤالك داخل المتصفح.",
  "Medical next steps": "الخطوات الطبية التالية",
  "StarbSense measurements alone cannot decide whether an eye examination is needed. If you have a concern about vision or eye alignment, arrange an eye-care assessment.": "لا تستطيع قياسات StarbSense وحدها تحديد الحاجة إلى فحص العين. إذا كان لديك قلق بشأن الرؤية أو اتجاه العين، فرتّب تقييمًا لدى مختص عيون.",
  "You can ask about the session summary, data quality, the star-following protocol, privacy, or when to seek professional eye care.": "يمكنك السؤال عن ملخص الجلسة أو جودة البيانات أو بروتوكول تتبّع النجمة أو الخصوصية أو توقيت طلب رعاية متخصصة للعين.",
  "Your question": "سؤالك",
  "For example: What do these session results mean?": "مثال: ماذا تعني نتائج هذه الجلسة؟",
  "Ask StarbSense Guide": "اسأل مساعد StarbSense",
  "This assistant uses a limited local knowledge base and simple rules. It does not understand every possible question, provide a diagnosis, or replace a clinician.": "يستخدم هذا المساعد قاعدة معرفة محلية محدودة وقواعد بسيطة. لا يفهم كل الأسئلة المحتملة، ولا يقدم تشخيصًا، ولا يحل محل الطبيب.",
  "I noticed a possible urgent symptom in your message. Sudden new double vision, sudden eye misalignment, or sudden vision loss needs urgent medical assessment. Tell a parent or guardian now and seek urgent medical care.": "يبدو أنك ذكرت عرضًا قد يحتاج إلى تقييم عاجل. ظهور ازدواج جديد في الرؤية فجأة، أو انحراف مفاجئ بالعين، أو فقدان مفاجئ للرؤية يستلزم تقييمًا طبيًا عاجلًا. أخبر ولي أمرك الآن واطلبوا رعاية طبية عاجلة.",
  "Your message describes an eye or vision concern. Please tell a parent or guardian and arrange a comprehensive assessment with an eye-care professional. StarbSense cannot confirm or exclude strabismus.": "رسالتك تصف قلقًا متعلقًا بالعين أو الرؤية. أخبر ولي أمرك ورتّبوا فحصًا شاملًا لدى مختص عيون. لا يستطيع StarbSense تأكيد الحَوَل أو استبعاده.",
  "If there are no symptoms or concerns and routine eye checks are up to date, this session alone does not create a reason for an extra appointment. Continue routine age-appropriate eye care. This is not a statement that the eyes are healthy; StarbSense cannot assess that.": "إذا لم توجد أعراض أو مخاوف وكانت فحوصات العين الدورية محدثة، فهذه الجلسة وحدها لا تُنشئ سببًا لموعد إضافي. استمر في رعاية العين الدورية المناسبة للعمر. هذا لا يعني أن العين سليمة؛ فـStarbSense لا يستطيع تقييم ذلك.",
  "The star path samples center, left/right, up/down, and diagonal screen positions. These directions make the task repeatable and easy to describe. The exact path, star shape, and durations are experimental design choices, not a clinically validated eye-movement test.": "يمر مسار النجمة بالمركز واليمين/اليسار والأعلى/الأسفل والاتجاهات القطرية. تساعد هذه الاتجاهات على جعل المهمة قابلة للتكرار وسهلة الوصف. أما المسار الدقيق وشكل النجمة والمدد فهي اختيارات تصميم تجريبية وليست اختبارًا سريريًا معتمدًا لحركة العين.",
  "The browser processes camera frames locally. The Python service receives derived numeric measurements for analysis; it does not receive or store raw video in this project. CSV exports contain facial-landmark coordinates and should be treated as sensitive research data, especially for children.": "يعالج المتصفح إطارات الكاميرا محليًا. تستقبل خدمة Python قياسات رقمية مشتقة للتحليل؛ ولا تستقبل أو تخزن فيديو خامًا في هذا المشروع. تحتوي ملفات CSV على إحداثيات معالم الوجه ويجب التعامل معها كبيانات بحثية حساسة، خاصةً للأطفال.",
  "I can explain the session metrics, protocol design, privacy, and general care guidance. I cannot interpret webcam measurements as a diagnosis or answer questions outside this limited project guide. Please rephrase your question or ask an eye-care professional for personal medical advice.": "يمكنني شرح مؤشرات الجلسة وتصميم البروتوكول والخصوصية والإرشادات العامة للرعاية. لا يمكنني تفسير قياسات كاميرا الويب على أنها تشخيص أو الإجابة عن أسئلة خارج نطاق دليل المشروع المحدود. أعد صياغة سؤالك أو اسأل مختص عيون للحصول على نصيحة طبية شخصية."
});

Object.assign(translations, {
  "OFFLINE IMAGE-MODEL EXPERIMENTS": "تجارب نماذج الصور غير المتصلة",
  "Research model baselines": "النتائج الأساسية للنماذج البحثية",
  "Results from two separate image-classification experiments using the uploaded research datasets. These are not results from your live camera session.": "نتائج تجربتين منفصلتين لتصنيف الصور باستخدام مجموعات البيانات البحثية المرفوعة. هذه النتائج ليست ناتجة عن جلسة الكاميرا المباشرة.",
  "Offline evaluation": "تقييم غير متصل",
  "BINARY CLASSIFICATION": "تصنيف ثنائي",
  "Strabismus / strabismus-free": "حَوَل / دون حَوَل وفق تسميات مجموعة الصور",
  "Held-out test accuracy": "دقة مجموعة الاختبار المحجوبة",
  "Macro-F1": "مقياس Macro-F1",
  "Balanced accuracy": "الدقة المتوازنة",
  "Test images": "صور الاختبار",
  "Dataset images": "صور مجموعة البيانات",
  "HOG features (grayscale 96×96) with an RBF support-vector machine. Source-image variants were grouped for splitting using the available class and numeric image ID.": "استخدمت التجربة خصائص HOG لصور رمادية بحجم 96×96 مع مصنف SVM بنواة RBF. جُمعت نسخ الصور المرتبطة عند التقسيم باستخدام الفئة ورقم الصورة المتاح.",
  "FIVE-CLASS CLASSIFICATION": "تصنيف بخمس فئات",
  "Five supplied image labels": "الفئات الخمس الموجودة في الصور",
  "HOG features (grayscale 96×96) with an RBF support-vector machine. The available dataset had no participant/source IDs, so participant-level separation could not be verified.": "استخدمت التجربة خصائص HOG لصور رمادية بحجم 96×96 مع مصنف SVM بنواة RBF. لا تحتوي مجموعة البيانات على معرفات للمشاركين أو مصادر الصور، لذلك لم يمكن التحقق من الفصل على مستوى المشاركين.",
  "How these models relate to StarbSense": "علاقة هذه النماذج بمشروع StarbSense",
  "These are offline image experiments. They accept pre-cropped eye-pair images; the current browser session records MediaPipe landmarks and experimental image measurements. The image models are not connected to the webcam stream and do not analyze the session CSV.": "هذه تجارب صور غير متصلة. تستقبل صورًا لزوج العينين بعد قصّها مسبقًا؛ أما جلسة المتصفح الحالية فتسجل معالم MediaPipe وقياسات صور تجريبية. نماذج الصور غير متصلة ببث الكاميرا ولا تحلل ملف CSV الخاص بالجلسة.",
  "Accuracy on these datasets does not establish performance on real-world webcam recordings. These experimental models must not be used to diagnose or rule out an eye condition or decide whether someone needs medical care.": "الدقة على مجموعات البيانات هذه لا تثبت الأداء على تسجيلات كاميرا الويب في الواقع. يجب عدم استخدام هذه النماذج التجريبية لتشخيص حالة بالعين أو استبعادها أو تقرير احتياج شخص إلى رعاية طبية.",
  "View machine-readable results (JSON)": "عرض النتائج بصيغة JSON"
});
let latestAnalysis = null;
let latestModelPrediction = null;

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

  const assistantInput = $("assistant-input");
  if (assistantInput) assistantInput.placeholder = currentLanguage === "ar"
    ? "مثال: ماذا تعني نتائج هذه الجلسة؟"
    : "For example: What do these session results mean?";
  const assistantLabel = document.querySelector('label[for="assistant-input"]');
  if (assistantLabel) assistantLabel.textContent = currentLanguage === "ar" ? "سؤالك" : "Your question";
  const assistantButton = $("assistant-form")?.querySelector('button[type="submit"]');
  if (assistantButton) assistantButton.textContent = currentLanguage === "ar" ? "اسأل مساعد StarbSense" : "Ask StarbSense Guide";
  updateCareGuidance();
  if (latestCameraQuality) updateReadiness(latestCameraQuality);

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
const readinessPanel = $("readiness-panel");
const readinessTitle = $("readiness-title");
const readinessMessage = $("readiness-message");
const readinessDetail = $("readiness-detail");
const faceGuideOverlay = $("face-guide-overlay");
const technicalSessionResult = $("technical-session-result");

const readinessCopy = {
  waiting: ["Camera positioning guide", "Turn on the camera to check that your face and both eyes are visible."],
  no_face: ["Face not found", "Move into the camera view so your whole face is visible."],
  too_far: ["Move a little closer", "Your face looks small in the camera. Move closer while keeping your full face visible."],
  too_close: ["Move a little farther away", "Your face is too close to fit comfortably in the guide."],
  center_face: ["Center your face", "Move your face toward the middle of the frame and keep your eyes visible."],
  eyes_not_clear: ["Eyes are not clear enough", "Make sure both eyes are visible and face the camera."],
  head_straight: ["Face the camera", "Keep your head comfortably upright and look toward the screen."],
  lighting: ["Adjust the lighting", "Use soft, even light from in front of you. Avoid darkness and strong backlighting."],
  processing_error: ["Camera check paused", "The camera frame could not be analyzed. Check the camera and try again."],
  ready: ["Camera position looks ready", "Your face is centered and the image is clear enough for this technical session check."]
};

Object.assign(translations, {
  "Camera positioning guide": "دليل وضع الكاميرا",
  "Turn on the camera to check that your face and both eyes are visible.": "شغّل الكاميرا للتأكد من ظهور الوجه والعينين بوضوح.",
  "This checks camera framing and image quality only. It cannot tell whether eyes are healthy.": "نتأكد من ظهور الوجه والعينين بوضوح.",
  "We check that your face and both eyes are clearly visible.": "نتأكد من ظهور الوجه والعينين بوضوح.",
  "Face not found": "لم يتم العثور على الوجه",
  "Move into the camera view so your whole face is visible.": "تحرك إلى مجال الكاميرا حتى يظهر وجهك بالكامل.",
  "Move a little closer": "اقترب قليلًا",
  "Your face looks small in the camera. Move closer while keeping your full face visible.": "يبدو وجهك صغيرًا في الصورة. اقترب مع إبقاء الوجه كاملًا ظاهرًا.",
  "Move a little farther away": "ابتعد قليلًا",
  "Your face is too close to fit comfortably in the guide.": "وجهك قريب جدًا؛ ابتعد قليلًا ليظهر كاملًا داخل الإطار.",
  "Center your face": "ضع وجهك في المنتصف",
  "Move your face toward the middle of the frame and keep your eyes visible.": "حرّك وجهك إلى منتصف الإطار وتأكد من ظهور العينين.",
  "Eyes are not clear enough": "العينان غير واضحتين بما يكفي",
  "Make sure both eyes are visible and face the camera.": "تأكد من ظهور العينين بوضوح وأنك تواجه الكاميرا.",
  "Face the camera": "واجه الكاميرا",
  "Keep your head comfortably upright and look toward the screen.": "حافظ على وضع رأس مريح ومستقيم وانظر إلى الشاشة.",
  "Adjust the lighting": "عدّل الإضاءة",
  "Use soft, even light from in front of you. Avoid darkness and strong backlighting.": "استخدم إضاءة أمامية هادئة ومتساوية، وتجنب الظلام والإضاءة القوية من الخلف.",
  "Camera check paused": "توقف فحص الكاميرا مؤقتًا",
  "The camera frame could not be analyzed. Check the camera and try again.": "تعذر تحليل إطار الكاميرا. تحقق من الكاميرا وحاول مرة أخرى.",
  "Camera position looks ready": "وضع الكاميرا مناسب مبدئيًا",
  "Your face is centered and the image is clear enough for this technical session check.": "وجهك في المنتصف والصورة واضحة بما يكفي لفحص الجاهزية التقني.",
  "Technical session status": "حالة الجلسة التقنية",
  "The camera captured enough usable tracking data for this experimental session.": "سجلت الكاميرا بيانات تتبّع كافية لهذه الجلسة التجريبية.",
  "Some tracking data may be missing. Adjust your position and repeat the session if you want a cleaner technical recording.": "قد تكون بعض بيانات التتبّع غير مكتملة. عدّل وضعك وأعد الجلسة إذا أردت تسجيلًا تقنيًا أوضح.",
  "This status describes recording quality only. It is not an eye-health result or a medical recommendation.": "هذه النتيجة تصف جودة التسجيل.",
  "This result describes recording quality.": "هذه النتيجة تصف جودة التسجيل.",
  "Bright spots can be caused by glasses or room lights. This camera setup cannot verify a corneal light reflex.": "قد تنتج البقع الساطعة عن النظارات أو إضاءة الغرفة. لا يستطيع إعداد الكاميرا هذا تأكيد انعكاس الضوء القرني.",
  "Repeat the session": "يُفضّل إعادة الجلسة",
  "Technical recording looks usable": "التسجيل التقني قابل للاستخدام مبدئيًا"
});
Object.assign(reverseTranslations, Object.fromEntries(
  Object.entries(translations).map(([english, arabic]) => [arabic, english])
));

function updateReadiness(state) {
  latestCameraQuality = state;
  const copy = readinessCopy[state.code] || readinessCopy.waiting;
  const ready = Boolean(state.ready);
  readinessTitle.textContent = t(ready ? readinessCopy.ready[0] : copy[0]);
  readinessMessage.textContent = t(ready ? readinessCopy.ready[1] : copy[1]);
  readinessDetail.textContent = t("We check that your face and both eyes are clearly visible.");
  readinessPanel?.classList.toggle("is-ready", ready);
  readinessPanel?.classList.toggle("is-warning", !ready);
  startButton.disabled = !cameraReady || !ready || gameRunning;
}

function startQualityMonitor() {
  if (!cameraReady || !landmarker || gameRunning || qualityMonitor) return;
  updateReadiness({ ready: false, code: "waiting", stable_frames: 0 });
  qualityMonitor = startCameraQualityMonitor({
    video: camera, landmarker, canvas: faceGuideOverlay, onUpdate: updateReadiness
  });
}

function stopQualityMonitor() {
  qualityMonitor?.stop();
  qualityMonitor = null;
}

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
let qualityMonitor = null;
let latestCameraQuality = { ready: false, code: "waiting" };

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

    startButton.disabled = true;
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
    startQualityMonitor();
  } catch (error) {
    console.error("CAMERA OR FACE MODEL ERROR:", error);

    stopQualityMonitor();
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

  stopQualityMonitor();
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
        elapsed_ms: Math.max(0, Math.round(now - startTime)),
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
        calculateAdvancedMetrics(landmarks, matrixData),
        inspectFaceGeometry(landmarks, matrixData)
      );
      sample.camera_quality_ready_at_start = latestCameraQuality.ready ? 1 : 0;

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
  if (!cameraReady || !landmarker || gameRunning || !latestCameraQuality.ready) return;

  stopQualityMonitor();
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

  startButton.disabled = true;
  stopButton.disabled = true;
  if (cameraReady) startQualityMonitor();
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
    latestAnalysis = result;

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
    showPythonChart(
      "python-task-group-chart",
      result.task_group_chart,
      "Technical data availability by task group"
    );
  } catch (error) {
    console.error("Python analysis error:", error);
    status.textContent = t("Python analysis unavailable");
    summary.textContent = currentLanguage === "ar"
      ? `لا تزال لوحة التحليلات داخل المتصفح متاحة. تعذّر إكمال تحليل Python: ${error.message}`
      : `The in-browser dashboard remains available. Python analysis could not be completed: ${error.message}`;
  }
}


function normalizeAssistantText(value) {
  return String(value || "").toLowerCase().normalize("NFKC")
    .replace(/[ًٌٍَُِّْـ]/g, "").replace(/\s+/g, " ").trim();
}

function appendAssistantMessage(message, kind = "assistant") {
  const container = $("assistant-messages");
  if (!container) return;
  const item = document.createElement("p");
  item.className = kind === "user"
    ? "assistant-message assistant-message-user"
    : "assistant-message assistant-message-system";
  item.textContent = message;
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
}

function updateCareGuidance(level = "general") {
  const panel = $("care-guidance");
  if (!panel) return;
  const title = currentLanguage === "ar" ? "الخطوات الطبية التالية" : "Medical next steps";
  let body;
  if (level === "urgent") {
    body = currentLanguage === "ar"
      ? "تحتاج الأعراض المفاجئة مثل ازدواج الرؤية الجديد أو انحراف العين المفاجئ أو فقدان الرؤية المفاجئ إلى تقييم طبي عاجل. أخبر ولي أمرك الآن واطلبوا رعاية عاجلة."
      : "Sudden new double vision, sudden eye misalignment, or sudden vision loss needs urgent medical assessment. Tell a parent or guardian now and seek urgent care.";
  } else if (level === "concern") {
    body = currentLanguage === "ar"
      ? "عند وجود انحراف ملحوظ بالعين أو شكوى بصرية أو اختلاف في الرؤية، أخبر ولي أمرك ورتّبوا فحصًا شاملًا لدى مختص عيون."
      : "If an eye appears misaligned, or there is a vision complaint or difference in vision, tell a parent or guardian and arrange a comprehensive eye-care assessment.";
  } else {
    body = currentLanguage === "ar"
      ? "لا يمكن لنتيجة StarbSense تحديد الحاجة إلى الطبيب. إذا لم توجد أعراض وكانت الفحوصات الدورية محدثة، فلا تستلزم هذه الجلسة وحدها موعدًا إضافيًا؛ استمر في الفحوصات الدورية المناسبة للعمر. أي قلق جديد يستحق تقييمًا مهنيًا."
      : "StarbSense cannot decide whether a clinician is needed. If there are no symptoms and routine checks are up to date, this session alone does not require an extra appointment; continue age-appropriate routine eye care. Any new concern deserves professional assessment.";
  }
  panel.hidden = level === "general";
  panel.replaceChildren();
  const strong = document.createElement("strong");
  strong.textContent = title;
  const p = document.createElement("p");
  p.textContent = body;
  panel.append(strong, p);
}

function answerAssistantQuestion(rawQuestion) {
  const q = normalizeAssistantText(rawQuestion);
  const hasAny = (...terms) => terms.some((term) => q.includes(normalizeAssistantText(term)));
  const ar = currentLanguage === "ar";

  const urgent = hasAny(
    "sudden double vision", "sudden vision loss", "sudden eye turn",
    "new onset diplopia", "فجأة", "مفاجئ", "ازدواج جديد", "فقدان الرؤية المفاجئ",
    "فقدان مفاجئ للنظر", "انحراف مفاجئ", "تغير مفاجئ"
  );
  const eyeConcern = hasAny(
    "double vision", "diplopia", "crossed eye", "eye turns", "misaligned",
    "strabismus", "blurred vision", "vision difference", "head tilt",
    "حول", "حَوَل", "انحراف", "ازدواج", "زغللة", "الرؤية مختلفة", "عين بتتحول"
  );
  const asksDiagnosis = hasAny(
    "do i have", "does it have", "is it strabismus", "diagnose", "normal or not",
    "فيه حول", "عندي حول", "عنده حول", "عندها حول", "طبيعي ولا", "حول ولا لا",
    "التشخيص", "شخصني"
  );
  const asksImage = hasAny(
    "image model", "uploaded image", "model label", "prediction", "تصنيف الصورة",
    "نتيجة الصورة", "النموذج", "الصورة اللي رفعتها"
  );
  const asksSession = hasAny(
    "session", "result", "results", "report", "analysis", "frames", "iris",
    "الجلسة", "النتيجة", "النتايج", "النتائج", "التقرير", "التحليل", "العينات", "القزحية"
  );

  if (urgent) {
    updateCareGuidance("urgent");
    return ar
      ? "الأعراض الجديدة والمفاجئة مثل ازدواج الرؤية أو تغيّر اتجاه العين أو فقدان الرؤية تحتاج تقييمًا طبيًا عاجلًا. أخبر ولي أمرك الآن واطلبوا المساعدة الطبية العاجلة."
      : "New, sudden symptoms such as double vision, a change in eye alignment, or vision loss need urgent medical assessment. Tell a parent or guardian now and seek urgent medical care.";
  }

  if (eyeConcern && !asksSession && !asksImage) {
    updateCareGuidance("concern");
    return ar
      ? "ده سؤال متعلق بصحة العين، ومش ممكن أحسمه من اختبار StarbSense. احكي لولي أمرك عن اللي ملاحظُه ورتّبوا فحصًا عند طبيب عيون."
      : "That is an eye-health concern, and StarbSense cannot settle it. Tell a parent or guardian what you have noticed and arrange an eye-care assessment.";
  }

  if (asksDiagnosis) {
    if (latestModelPrediction) {
      const label = displayModelLabel(latestModelPrediction.predicted_label);
      return ar
        ? `آخر صورة اتعمل لها تحليل: النموذج صنّفها ضمن "${label}". دي الفئة اللي اختارها نموذج الصور من التسميات اللي اتدرّب عليها، مش تشخيص مؤكد للشخص. اختبار الكاميرا نفسه لا يقدر يحدد وجود الحَوَل أو ينفيه.`
        : `For the last image analyzed, the model selected "${label}". That is a dataset label predicted by the image model, not a confirmed diagnosis for a person. The camera session itself cannot confirm or rule out strabismus.`;
    }
    return ar
      ? "لسه مفيش تصنيف صورة متاح. تقرير جلسة الكاميرا يقيس جودة التسجيل وتوفر نقاط العين فقط، ومش بيصنّف الشخص إلى عنده حَوَل أو لا. لو استخدمت تجربة الصورة، هتظهر تسمية النموذج بوضوح."
      : "There is no image-model label yet. The camera-session report measures recording quality and landmark availability; it does not classify a person as having or not having strabismus. Run the separate image experiment to see its predicted dataset label.";
  }

  if (asksImage) {
    if (latestModelPrediction) {
      const label = latestModelPrediction.predicted_label;
      const task = latestModelPrediction.task === "binary" ? "binary" : "five-class";
      const scores = latestModelPrediction.decision_scores || {};
      const scoreText = Object.entries(scores).map(([name, value]) => `${name}: ${Number(value).toFixed(3)}`).join(" · ");
      return ar
        ? `آخر نتيجة للصورة: "${label}" من تجربة ${task === "binary" ? "التصنيف الثنائي" : "التصنيف الخماسي"}. درجات SVM: ${scoreText || "غير متاحة"}. الدرجات دي قيم حسابية وليست نسب ثقة أو احتمالات.`
        : `Latest image result: "${label}" from the ${task} experiment. SVM decision values: ${scoreText || "not available"}. These values are not confidence percentages or probabilities.`;
    }
    return ar
      ? "مفيش صورة اتحللت لسه. افتح قسم «تجربة الصور»، اختار التصنيف الثنائي أو الخماسي، وارفع صورة واضحة ومقصوصة للعينين معًا."
      : "No image has been analyzed yet. Open the Image-model experiments section, choose binary or five-class classification, and upload a clear, tightly cropped image of both eyes.";
  }

  if (asksSession) {
    if (!latestAnalysis) {
      return ar
        ? "لسه مفيش جلسة مكتملة للتحليل. شغّل الكاميرا، ابدأ الاختبار، وبعد انتهاء الخطوات هتظهر لوحة النتائج هنا."
        : "There is no analyzed session yet. Turn on the camera, start the test, and the results dashboard will appear here when the steps finish.";
    }
    const total = latestAnalysis.sample_count ?? 0;
    const faceRate = latestAnalysis.face_detection_rate_pct ?? "—";
    const irisRate = latestAnalysis.valid_iris_rate_pct ?? "—";
    const tasks = latestAnalysis.task_count ?? 0;
    const median = latestAnalysis.median_sample_interval_ms ?? "—";
    return ar
      ? `ملخص جلستك: ${total} إطارًا مسجلًا؛ اكتشاف الوجه ${faceRate}٪؛ عينات القزحيتين الصالحة ${irisRate}٪؛ إطارات في ${tasks} مهمة؛ ووسيط الفاصل بين العينات ${median} مللي ثانية. الأرقام دي بتشرح جودة وتغطية التسجيل، مش اتجاه النظر أو وجود الحَوَل.`
      : `Session summary: ${total} recorded frames; face detection ${faceRate}%; valid iris samples ${irisRate}%; frames across ${tasks} tasks; median sampling interval ${median} ms. These describe recording quality and coverage, not gaze direction or whether strabismus is present.`;
  }

  if (hasAny("accuracy", "accurate", "performance", "دقة", "الدقة", "نسبة نجاح", "الأداء")) {
    return ar
      ? "في تقرير التجارب: دقة التصنيف الثنائي 83.3٪، ودقة التصنيف الخماسي 65.7٪ على مجموعات اختبار منفصلة. دي نتائج داخل مجموعات الصور المستخدمة فقط، ومش مقياسًا لدقة كاميرا الويب أو تشخيص الأشخاص."
      : "In the baseline report, binary image classification reached 83.3% test accuracy and five-class classification reached 65.7% on separate held-out image sets. These are dataset results, not webcam accuracy or diagnostic performance.";
  }

  if (hasAny("how does it work", "how it works", "algorithm", "hog", "svm", "بيشتغل ازاي", "بيشتغل إزاي", "الخوارزمية", "الموديل")) {
    return ar
      ? "المشروع فيه مسارين منفصلين: جلسة الكاميرا تستخدم MediaPipe لاستخراج نقاط الوجه والقزحية وتراجع جودة الإطارات؛ وتجربة الصور تستخدم خصائص HOG مع مصنف SVM على صورة عينين مقصوصة. نموذج الصور لا يحلل فيديو الجلسة أو ملف CSV."
      : "The project has two separate paths: the camera session uses MediaPipe to extract face and iris landmarks and checks frame quality; the image experiment uses HOG features and an SVM classifier on a cropped eye-pair image. The image model does not analyze session video or CSV data.";
  }

  if (hasAny("camera", "lighting", "face", "eyes visible", "كاميرا", "الإضاءة", "النور", "الوجه", "العينين")) {
    return ar
      ? "علشان التسجيل يبقى أوضح: خلي الوجه في منتصف الإطار، العينين ظاهرين، الإضاءة أمامية وهادية، والرأس في وضع مريح. لو لوحة الجاهزية طلبت تعديل حاجة، اتبع الرسالة اللي جنب معاينة الكاميرا."
      : "For a cleaner recording, keep your face centered, both eyes visible, use steady front lighting, and keep your head comfortably upright. Follow the readiness message shown beside the camera preview.";
  }

  if (hasAny("star", "movement", "directions", "diagonal", "game", "protocol", "النجمة", "الحركة", "الاتجاهات", "اللعبة", "الخطوات", "الاختبار")) {
    return ar
      ? "الاختبار مكوّن من 17 خطوة: تثبيت في المنتصف، اتجاهات أفقية ورأسية، اتجاهات قطرية، ثم تثبيت نهائي في المنتصف. اتبع النجمة بعينيك وحاول تثبيت الرأس بشكل مريح."
      : "The test has 17 steps: a center fixation, horizontal and vertical directions, diagonal directions, and a final center fixation. Follow the star with your eyes and keep your head comfortably still.";
  }

  if (hasAny("privacy", "video", "csv", "data", "خصوصية", "فيديو", "ملف", "بيانات")) {
    return ar
      ? "معالجة إطارات الكاميرا بتحصل داخل المتصفح. خدمة Python تستقبل القياسات الرقمية المشتقة لتحليل الجلسة، ومش بتستقبل فيديو خام. ملف CSV يحتوي إحداثيات وقياسات مستخرجة، فاحتفظ به في مكان آمن."
      : "Camera frames are processed in the browser. The Python service receives derived numeric measurements for session analysis, not raw video. The CSV contains derived coordinates and measurements, so store it carefully.";
  }

  if (hasAny("help", "what can i ask", "مساعدة", "اسأل ايه", "اسأل إيه", "تقدر تعمل ايه", "تقدر تعمل إيه")) {
    return ar
      ? "تقدر تسألني عن: نتيجة الجلسة، جودة الكاميرا، معنى الرسوم، تصنيف صورة العينين، دقة تجارب الصور، خطوات الاختبار، أو طريقة عمل المشروع."
      : "You can ask about the session result, camera quality, chart meanings, an eye-image label, image-model accuracy, test steps, or how the project works.";
  }

  return ar
    ? "أقدر أساعدك في فهم StarbSense وبياناته. جرّب تسألني: «اشرح نتيجة الجلسة»، «ليه جودة التسجيل ضعيفة؟»، «يعني إيه تصنيف الصورة؟»، أو «النموذج بيشتغل إزاي؟»."
    : "I can help explain StarbSense and its data. Try: “Explain my session result,” “Why is recording quality low?”, “What does the image label mean?”, or “How does the model work?”";
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

  startButton.disabled = true;
  exportButton.disabled = samples.length === 0;
  if (cameraReady) startQualityMonitor();

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

  if (technicalSessionResult) {
    const usable = stats.total >= 30 && stats.faceRate >= 85 &&
      stats.validIrisSamples / Math.max(stats.total, 1) >= 0.80 &&
      tasksWithFrames >= 12;
    technicalSessionResult.hidden = !stats.total;
    technicalSessionResult.classList.toggle("is-pass", usable);
    technicalSessionResult.classList.toggle("is-repeat", !usable);
    technicalSessionResult.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = t(usable ? "Technical recording looks usable" : "Repeat the session");
    const detail = document.createElement("p");
    detail.textContent = t(usable
      ? "The camera captured enough usable tracking data for this experimental session."
      : "Some tracking data may be missing. Adjust your position and repeat the session if you want a cleaner technical recording.");
    const note = document.createElement("small");
    note.textContent = t("This result describes recording quality.");
    technicalSessionResult.append(heading, detail, note);
  }

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


const assistantForm = $("assistant-form");
if (assistantForm) {
  assistantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("assistant-input");
    const question = input?.value?.trim();
    if (!question) return;
    appendAssistantMessage(question, "user");
    appendAssistantMessage(answerAssistantQuestion(question));
    input.value = "";
  });
}
updateCareGuidance();

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
  stopQualityMonitor();
  stopCameraTracks();

  if (landmarker) {
    landmarker.close();
    landmarker = null;
  }
});


Object.assign(translations, {
  "SEPARATE IMAGE EXPERIMENT": "تجربة صور منفصلة",
  "Try a trained image model": "جرّب نموذج الصور المدرّب",
  "Upload a pre-cropped image containing both eyes. This experiment does not use your webcam stream or session measurements.": "ارفَع صورة مقصوصة مسبقًا وتحتوي على العينين معًا. هذه التجربة لا تستخدم بث الكاميرا أو قياسات الجلسة.",
  "Checking local model files…": "جارٍ التحقق من ملفات النماذج المحلية…",
  "Research experiment": "التجربة البحثية",
  "Binary labels · strabismus / strabismus-free": "تصنيف ثنائي · حَوَل / دون حَوَل",
  "Five image labels · eso / exo / hyper / hypo / normal": "خمس تسميات للصور · أنواع الحَوَل / طبيعي",
  "Eye-pair image (PNG, JPEG or WebP, up to 8 MB)": "صورة العينين (PNG أو JPEG أو WebP، حتى 8 ميجابايت)",
  "Use a tightly cropped, clear image of both eyes only. Do not upload a full portrait, and only use an image you have permission to use.": "استخدم صورة واضحة ومقصوصة حول العينين فقط. لا ترفع صورة وجه كاملة، واستخدم فقط صورة لديك إذن باستخدامها.",
  "Selected eye-pair image preview": "معاينة صورة العينين المحددة",
  "Run image experiment": "تشغيل تجربة الصور",
  "Waiting for an image": "في انتظار صورة",
  "Choose an image and run one of the offline experiments.": "اختر صورة وشغّل إحدى التجربتين غير المتصلتين.",
  "Experimental dataset-label output only — not a diagnosis, not a screening result, and not a reason to delay or avoid an eye-care examination. Uploaded image bytes are processed in memory and are not saved by this endpoint.": "المخرجات مجرد تسمية تجريبية وفق مجموعة البيانات؛ وليست تشخيصًا أو نتيجة فحص، ولا سببًا لتأجيل أو تجنب فحص العيون. تُعالج الصورة في الذاكرة ولا تحفظها هذه الخدمة."
});
Object.assign(reverseTranslations, Object.fromEntries(
  Object.entries(translations).map(([english, arabic]) => [arabic, english])
));


const modelUploadForm = $("model-upload-form");
const modelImageInput = $("model-image-file");
const modelImagePreview = $("model-image-preview");
const modelPredictionResult = $("model-prediction-result");
const modelPredictButton = $("model-predict-button");
let modelPreviewUrl = null;


function displayModelLabel(label) {
  if (currentLanguage !== "ar") return label;
  const labels = {
    strabismus: "فئة الحَوَل",
    strabismus_free: "فئة دون حَوَل",
    esotropia: "حَوَل إنسي",
    exotropia: "حَوَل وحشي",
    hypertropia: "حَوَل رأسي لأعلى",
    hypotropia: "حَوَل رأسي لأسفل",
    normal: "الفئة الطبيعية"
  };
  return labels[label] || label;
}

function renderModelMessage(title, detail, scores = null) {
  if (!modelPredictionResult) return;
  modelPredictionResult.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = title;
  const paragraph = document.createElement("p");
  paragraph.textContent = detail;
  modelPredictionResult.append(heading, paragraph);
  if (scores && Object.keys(scores).length) {
    const list = document.createElement("ul");
    for (const [label, score] of Object.entries(scores)) {
      const item = document.createElement("li");
      item.textContent = `${label}: ${Number(score).toFixed(4)}`;
      list.append(item);
    }
    modelPredictionResult.append(list);
  }
}

async function checkImageModelAvailability() {
  const status = $("model-api-status");
  if (!status) return;
  try {
    const response = await fetch("/api/model-health", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Model service unavailable.");
    if (result.available) {
      status.textContent = currentLanguage === "ar" ? "النماذج المحلية جاهزة" : "Local models ready";
      status.classList.add("is-model-ready");
    } else {
      status.textContent = currentLanguage === "ar" ? "ملفات النماذج غير مثبتة" : "Model files not installed";
      status.classList.remove("is-model-ready");
      renderModelMessage(
        currentLanguage === "ar" ? "ثبّت ملفات النماذج أولًا" : "Install the model files first",
        currentLanguage === "ar"
          ? "نزّل ملف النماذج ثم شغّل tools/install_trained_models.py من مجلد المشروع. راجع docs/USING_IMAGE_MODELS.md."
          : "Download the trained-models ZIP, then run tools/install_trained_models.py from the project folder. See docs/USING_IMAGE_MODELS.md."
      );
    }
  } catch (error) {
    status.textContent = currentLanguage === "ar" ? "خادم Python غير متصل" : "Python server offline";
    renderModelMessage(
      currentLanguage === "ar" ? "شغّل خادم Python" : "Start the Python server",
      currentLanguage === "ar"
        ? "شغّل python server.py في نافذة PowerShell منفصلة، ثم أعد تحميل الصفحة."
        : "Run python server.py in a separate PowerShell window, then reload this page."
    );
  }
}

modelImageInput?.addEventListener("change", () => {
  const file = modelImageInput.files?.[0];
  if (modelPreviewUrl) URL.revokeObjectURL(modelPreviewUrl);
  modelPreviewUrl = null;
  if (!file) {
    modelImagePreview.hidden = true;
    modelImagePreview.removeAttribute("src");
    return;
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
    renderModelMessage(
      currentLanguage === "ar" ? "صورة غير مدعومة" : "Unsupported image",
      currentLanguage === "ar" ? "اختر PNG أو JPEG أو WebP بحجم لا يتجاوز 8 ميجابايت." : "Choose PNG, JPEG, or WebP up to 8 MB."
    );
    modelImageInput.value = "";
    modelImagePreview.hidden = true;
    return;
  }
  modelPreviewUrl = URL.createObjectURL(file);
  modelImagePreview.src = modelPreviewUrl;
  modelImagePreview.hidden = false;
  renderModelMessage(
    currentLanguage === "ar" ? "الصورة جاهزة" : "Image ready",
    currentLanguage === "ar" ? "تأكد أن الصورة تحتوي على العينين معًا ومقصوصة بإحكام، ثم شغّل التجربة." : "Check that the image contains both eyes and is tightly cropped, then run the experiment."
  );
});

modelUploadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = modelImageInput?.files?.[0];
  if (!file) return;
  const payload = new FormData();
  payload.append("image", file);
  payload.append("task", $("model-task-select").value);
  modelPredictButton.disabled = true;
  modelPredictButton.textContent = currentLanguage === "ar" ? "جارٍ تشغيل التجربة…" : "Running experiment…";
  renderModelMessage(
    currentLanguage === "ar" ? "جارٍ تشغيل النموذج" : "Running the model",
    currentLanguage === "ar" ? "تُعالج الصورة مؤقتًا في خادم Python المحلي." : "The image is being processed temporarily by the local Python server."
  );
  try {
    const response = await fetch("/api/model-predict", { method: "POST", body: payload });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Image experiment failed.");
    latestModelPrediction = result;
    const title = currentLanguage === "ar"
      ? `تصنيف الصورة وفق النموذج: ${displayModelLabel(result.predicted_label)}`
      : `Model label: ${result.predicted_label}`;
    const detail = currentLanguage === "ar"
      ? "هذه تسمية تجريبية من النموذج وليست تشخيصًا أو نتيجة فحص. درجات SVM المعروضة قيم حسابية وليست احتمالات."
      : "This is an experimental model label, not a diagnosis or screening result. SVM scores are raw decision values, not probabilities.";
    renderModelMessage(title, detail, result.decision_scores);
  } catch (error) {
    renderModelMessage(
      currentLanguage === "ar" ? "تعذّر تشغيل التجربة" : "Experiment unavailable",
      error.message || (currentLanguage === "ar" ? "تحقق من تشغيل خادم Python وتثبيت ملفات النماذج." : "Check that the Python server is running and the model files are installed.")
    );
  } finally {
    modelPredictButton.disabled = false;
    modelPredictButton.textContent = currentLanguage === "ar" ? "تشغيل تجربة الصور" : "Run image experiment";
  }
});


checkImageModelAvailability();


Object.assign(translations, {
  "A simple guided eye-tracking research session.": "جلسة بحثية مبسطة لتتبّع حركة العين.",
  "Follow the star through 17 guided steps. StarbSense records camera-based measurements and organizes them into an easy-to-read session report.": "اتبع النجمة خلال 17 خطوة واضحة. يسجل StarbSense قياسات الكاميرا وينظمها في تقرير سهل الفهم.",
  "Session steps": "خطوات الجلسة",
  "Get ready": "استعد",
  "Start the test": "ابدأ الاختبار",
  "View results": "اعرض النتائج",
  "Ask a question": "اسأل سؤالًا",
  "Step 1 · Get ready": "الخطوة 1 · الاستعداد",
  "Camera setup": "إعداد الكاميرا",
  "Sit comfortably facing the camera. Keep both eyes visible and use steady front lighting.": "اجلس بشكل مريح أمام الكاميرا، واجعل العينين ظاهرتين واستخدم إضاءة أمامية ثابتة.",
  "What will happen?": "ماذا سيحدث؟",
  "The star will appear at the center, sides, top, bottom, and diagonal positions. Follow it with your eyes while keeping your head comfortably still.": "ستظهر النجمة في المنتصف والجوانب والأعلى والأسفل والاتجاهات القطرية. اتبعها بعينيك مع إبقاء رأسك ثابتًا بشكل مريح.",
  "The session takes about 22 seconds and contains 17 steps.": "تستغرق الجلسة نحو 22 ثانية وتتكون من 17 خطوة.",
  "Step 2 · Follow the star": "الخطوة 2 · اتبع النجمة",
  "Step 3 · Your session results": "الخطوة 3 · نتائج جلستك",
  "After the session, your summary and charts will appear here.": "بعد الجلسة، سيظهر هنا الملخص والرسوم البيانية.",
  "Session summary": "ملخص الجلسة",
  "A clear summary of the recorded session, followed by optional technical charts.": "ملخص واضح للجلسة المسجلة، وبعده رسوم تقنية اختيارية.",
  "Technical charts and measurements": "الرسوم والقياسات التقنية",
  "What this session tells you": "ماذا تخبرك هذه الجلسة؟",
  "The session report describes how well the camera recorded the task. It does not determine whether a person has strabismus.": "يوضح تقرير الجلسة مدى جودة تسجيل الكاميرا للمهمة، ولا يحدد ما إذا كان الشخص لديه حَوَل.",
  "Image-model experiments": "تجارب نماذج الصور",
  "Model accuracy and research details": "دقة النماذج والتفاصيل البحثية",
  "Optional · Classify an eye-pair image": "اختياري · تصنيف صورة للعينين",
  "The model returns one label from its training dataset. The image is processed in memory and is not saved by this endpoint.": "يعرض النموذج تسمية واحدة من فئات مجموعة التدريب. تُعالج الصورة في الذاكرة ولا تحفظها هذه الخدمة.",
  "How to read your result": "كيف تقرأ النتيجة؟",
  "There are two different outputs: the camera-session report describes recording quality, while the optional image experiment predicts a dataset label for one uploaded image.": "هناك نتيجتان مختلفتان: تقرير جلسة الكاميرا يوضح جودة التسجيل، بينما تتوقع تجربة الصور الاختيارية فئة لصورة واحدة مرفوعة.",
  "Camera-session result": "نتيجة جلسة الكاميرا",
  "This shows whether enough usable frames and eye landmarks were recorded. It is not a strabismus classification.": "توضح ما إذا كان قد تم تسجيل عدد كافٍ من الإطارات ومعالم العين. وهي ليست تصنيفًا للحَوَل.",
  "Image-model result": "نتيجة نموذج الصور",
  "This shows the model’s predicted label for the uploaded image: “strabismus” or “strabismus-free”, or one of the five image classes.": "تعرض الفئة التي توقعها النموذج للصورة: «حَوَل» أو «دون حَوَل»، أو إحدى فئات الصور الخمس.",
  "If you have a concern about your vision or eye alignment, discuss it with a parent or guardian and an eye-care professional.": "إذا كان لديك قلق بشأن الرؤية أو اتجاه العين، فتحدث مع ولي أمرك ومع مختص عيون.",
  "Step 4 · Ask StarbSense": "الخطوة 4 · اسأل StarbSense",
  "Ask about your session, charts, image-model labels, camera quality, or how StarbSense works. The assistant uses the project data available in this browser.": "اسأل عن جلستك أو الرسوم أو تصنيفات نموذج الصور أو جودة الكاميرا أو طريقة عمل StarbSense. يستخدم المساعد بيانات المشروع المتاحة في هذا المتصفح.",
  "For questions outside the project, the assistant may not have enough information.": "قد لا تتوفر لدى المساعد معلومات كافية للأسئلة خارج نطاق المشروع.",
  "Explain my session results in simple words.": "اشرح نتيجة جلستي بكلمات بسيطة.",
  "Image label:": "تصنيف الصورة:",
  "Image model label:": "تصنيف نموذج الصور:",
  "This is a dataset label predicted by the image model, not a confirmed diagnosis for a person.": "هذه تسمية من مجموعة البيانات توقعها نموذج الصور، وليست تشخيصًا مؤكدًا لشخص.",
  "The camera-session report measures recording quality and landmark availability; it does not classify a person as having or not having strabismus.": "يقيس تقرير جلسة الكاميرا جودة التسجيل وتوفر معالم العين، ولا يصنف الشخص على أنه لديه حَوَل أو لا."
});
Object.assign(reverseTranslations, Object.fromEntries(
  Object.entries(translations).map(([english, arabic]) => [arabic, english])
));

applyLanguage(currentLanguage);
