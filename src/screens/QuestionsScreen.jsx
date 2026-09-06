import { useEffect, useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Ear,
  FileText,
  Keyboard,
  Mic,
  MicOff,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-3.6-flash";

const MAX_AI_FOLLOWUPS = 8;

/*
  ==========================================================
  WHY THIS FILE WAS REWRITTEN
  ==========================================================

  The previous version tried to figure out "has this already
  been asked / already been answered?" by:

    1. Comparing the NEW question's wording against OLD
       questions' wording (word-overlap similarity), and
    2. Guessing which clinical "topic" a question belonged to
       by scanning it for keyword phrases.

  Both of those are guesses. A small/fast model like Flash will
  happily re-ask the same clinical thing in different words, and
  a keyword scan won't always recognize the new phrasing either
  — so the guess-based repeat detector silently failed and the
  interview looped.

  This version removes the guessing entirely. There is a fixed,
  known list of clinical topics (CLINICAL_TOPICS below). The app
  — not the model — always knows exactly which topic was just
  asked about (topicInFlightRef) and exactly which topics are
  still open (remaining topics = the list minus whatever is
  already recorded in topicAnswersRef). Gemini is only asked to:

    - extract the answer for the topic we just asked about, and
    - pick the NEXT question from the REMAINING list we hand it.

  If Gemini ever tries to pick a topic that isn't in that
  remaining list (already covered, hallucinated, whatever), the
  app overrides it and deterministically asks about the next
  open topic itself, using a built-in fallback question. If the
  Gemini call fails outright (bad key, network, rate limit), the
  same deterministic fallback keeps the interview moving instead
  of getting stuck. A topic can only ever be asked about once,
  by construction — not by detection.
*/

/*
  ==========================================================
  DEMO PATIENT RECORD
  ==========================================================

  This is fictional demo data.

  The record is persisted into patientData so the same
  information can later be displayed by:

  QuestionsScreen → SummaryScreen → ReceiptScreen
*/
const DEMO_PATIENT_RECORD = {
  name: "Ravi Kumar",
  age: 42,
  gender: "Male",

  previousMedicalHistory: [
    "Type 2 diabetes — diagnosed in 2021",
    "Hypertension — diagnosed in 2022",
    "Appendectomy — 2018",
    "Occasional acidity / GERD symptoms",
  ],

  currentMedications: [
    "Metformin 500 mg — twice daily",
    "Amlodipine 5 mg — once daily",
  ],

  allergies: ["No known drug allergies"],

  familyHistory: ["Father — hypertension"],

  lifestyle: [
    "Non-smoker",
    "Occasional tea / coffee",
    "No regular alcohol use",
  ],
};

const LANGUAGE_CONFIG = {
  English: {
    code: "en-IN",
    welcome:
      "Hello. I am MediKiosk, your AI clinical assistant. Your medical record is already available. I will ask you a few questions about how you are feeling today. Please answer in your own words. You can speak naturally.",
    firstQuestion:
      "What brings you here today? Please tell me what problem or symptom you are experiencing.",
    listening: "I'm listening...",
    thinking: "Let me understand that...",
    speakAgain: "Could you please tell me that again?",
    fallback:
      "You can speak your answer, or type it below if voice input is unavailable.",
    finished:
      "Thank you. I have collected the important information from your history.",
    next: "Next question",
    finish: "Complete interview",
    ready: "Ready for your answer",
    speaking: "MediKiosk is speaking...",
  },

  Hindi: {
    code: "hi-IN",
    welcome:
      "नमस्ते। मैं MediKiosk, आपका AI स्वास्थ्य सहायक हूँ। आपका मेडिकल रिकॉर्ड पहले से उपलब्ध है। मैं आज आपकी तबीयत के बारे में कुछ सवाल पूछूँगा। कृपया अपने शब्दों में स्वाभाविक रूप से जवाब दें।",
    firstQuestion:
      "आप आज किस समस्या के लिए आए हैं? कृपया बताइए कि आपको क्या परेशानी या लक्षण हो रहे हैं।",
    listening: "मैं सुन रहा हूँ...",
    thinking: "मैं आपके जवाब को समझ रहा हूँ...",
    speakAgain: "कृपया अपना जवाब एक बार फिर बताइए।",
    fallback:
      "आप अपना जवाब बोल सकते हैं। अगर आवाज़ उपलब्ध नहीं है, तो नीचे लिख भी सकते हैं।",
    finished:
      "धन्यवाद। मैंने आपकी हिस्ट्री की महत्वपूर्ण जानकारी रिकॉर्ड कर ली है।",
    next: "अगला सवाल",
    finish: "इंटरव्यू पूरा करें",
    ready: "आपके जवाब के लिए तैयार",
    speaking: "MediKiosk बोल रहा है...",
  },

  Telugu: {
    code: "te-IN",
    welcome:
      "నమస్కారం. నేను MediKiosk, మీ AI ఆరోగ్య సహాయకుడిని. మీ వైద్య రికార్డు ఇప్పటికే అందుబాటులో ఉంది. ఈ రోజు మీ ఆరోగ్యం గురించి కొన్ని ప్రశ్నలు అడుగుతాను. దయచేసి మీకు అనిపించిన విధంగా సహజంగా సమాధానం చెప్పండి.",
    firstQuestion:
      "మీరు ఈ రోజు ఏ సమస్యతో వచ్చారు? మీకు ఉన్న ఇబ్బంది లేదా లక్షణం గురించి మీ మాటల్లో చెప్పండి.",
    listening: "నేను వింటున్నాను...",
    thinking: "మీ సమాధానాన్ని అర్థం చేసుకుంటున్నాను...",
    speakAgain: "దయచేసి మీ సమాధానాన్ని మరోసారి చెప్పగలరా?",
    fallback:
      "మీరు మీ సమాధానాన్ని మాట్లాడవచ్చు. వాయిస్ అందుబాటులో లేకపోతే కింద టైప్ చేయవచ్చు.",
    finished:
      "ధన్యవాదాలు. మీ ఆరోగ్య చరిత్రలో ముఖ్యమైన సమాచారాన్ని నమోదు చేశాను.",
    next: "తదుపరి ప్రశ్న",
    finish: "ఇంటర్వ్యూ పూర్తి చేయండి",
    ready: "మీ సమాధానం కోసం సిద్ధంగా ఉంది",
    speaking: "MediKiosk మాట్లాడుతోంది...",
  },

  Tamil: {
    code: "ta-IN",
    welcome:
      "வணக்கம். நான் MediKiosk, உங்கள் AI சுகாதார உதவியாளர். உங்கள் மருத்துவப் பதிவு ஏற்கனவே உள்ளது. இன்று உங்கள் உடல்நிலை குறித்து சில கேள்விகள் கேட்பேன். உங்கள் சொந்த வார்த்தைகளில் இயல்பாக பதிலளிக்கவும்.",
    firstQuestion:
      "இன்று எந்த பிரச்சினைக்காக வந்துள்ளீர்கள்? உங்களுக்கு இருக்கும் பிரச்சினை அல்லது அறிகுறியை உங்கள் சொந்த வார்த்தைகளில் சொல்லுங்கள்.",
    listening: "நான் கேட்கிறேன்...",
    thinking: "உங்கள் பதிலைப் புரிந்துகொள்கிறேன்...",
    speakAgain: "தயவுசெய்து உங்கள் பதிலை மீண்டும் சொல்ல முடியுமா?",
    fallback:
      "உங்கள் பதிலைப் பேசலாம். குரல் வசதியில்லையெனில் கீழே தட்டச்சு செய்யலாம்.",
    finished:
      "நன்றி. உங்கள் மருத்துவ வரலாற்றில் முக்கியமான தகவல்களை பதிவு செய்துள்ளேன்.",
    next: "அடுத்த கேள்வி",
    finish: "நேர்காணலை முடிக்கவும்",
    ready: "உங்கள் பதிலுக்கு தயாராக உள்ளது",
    speaking: "MediKiosk பேசுகிறது...",
  },
};

const RED_FLAG_PATTERNS = [
  {
    id: "chest-breathlessness",
    keywords: [
      "chest pain",
      "shortness of breath",
      "difficulty breathing",
      "can't breathe",
      "cannot breathe",
      "सीने में दर्द",
      "सांस फूल",
      "सांस लेने में परेशानी",
      "ఛాతీ నొప్పి",
      "ఊపిరి తీసుకోవడంలో ఇబ్బంది",
      "மூச்சுத்திணறல்",
    ],
    label: "Chest symptoms with breathing difficulty",
  },

  {
    id: "severe-chest-pain",
    keywords: [
      "severe chest pain",
      "crushing chest pain",
      "heavy chest pain",
      "सीने में बहुत तेज दर्द",
      "ఛాతీలో తీవ్రమైన నొప్పి",
      "கடுமையான நெஞ்சு வலி",
    ],
    label: "Severe chest discomfort reported",
  },

  {
    id: "neurological",
    keywords: [
      "one side weak",
      "face drooping",
      "slurred speech",
      "difficulty speaking",
      "confusion",
      "बेहोशी",
      "अचानक कमजोरी",
      "बोलने में परेशानी",
      "ఒక వైపు బలహీనత",
      "మాట్లాడడంలో ఇబ్బంది",
      "முகம் சாய்வு",
      "பேசுவதில் சிரமம்",
    ],
    label: "Neurological symptom requiring review",
  },

  {
    id: "fainting",
    keywords: [
      "fainted",
      "passed out",
      "lost consciousness",
      "बेहोश",
      "बेहोशी",
      "స్పృహ కోల్పోయాను",
      "மயக்கம்",
    ],
    label: "Loss of consciousness reported",
  },

  {
    id: "bleeding",
    keywords: [
      "blood in vomit",
      "vomiting blood",
      "blood in stool",
      "black stool",
      "coughing blood",
      "खून की उल्टी",
      "मल में खून",
      "రక్తం వాంతి",
      "మలంలో రక్తం",
      "வாந்தியில் இரத்தம்",
      "மலத்தில் இரத்தம்",
    ],
    label: "Bleeding symptom reported",
  },
];

/*
  ==========================================================
  CLINICAL TOPICS — the fixed checklist
  ==========================================================

  This is the single source of truth for "what still needs to
  be asked". chiefComplaint is not in this list because
  question 1 always establishes it directly from the patient's
  own opening answer.

  Order here is just the order used when the app has to pick a
  fallback topic itself (Gemini is still free to choose any
  remaining topic in whatever order makes clinical sense).
*/
const CLINICAL_TOPICS = [
  "onset",
  "location",
  "character",
  "severity",
  "timing",
  "radiation",
  "aggravatingFactors",
  "relievingFactors",
  "associatedSymptoms",
  "relevantHistory",
];

/*
  Deterministic backup questions.

  These are only ever used when Gemini's response is missing,
  malformed, or tries to re-cover an already-answered topic, or
  when the API call fails outright. They guarantee the interview
  can always take one more real step forward without needing the
  model at all.
*/
const TOPIC_FALLBACK_QUESTIONS = {
  English: {
    onset: "How long ago did this start, and when did you first notice it?",
    location: "Where exactly do you feel it — which part of the body?",
    character:
      "How would you describe it — sharp, dull, burning, throbbing, or something else?",
    severity: "On a 0 to 10 scale, how severe is it right now?",
    timing:
      "Is it constant, or does it come and go, and is it getting better or worse?",
    radiation: "Does it spread or move to any other part of your body?",
    aggravatingFactors: "Is there anything that makes it worse?",
    relievingFactors: "Is there anything that makes it feel better?",
    associatedSymptoms:
      "Are you noticing any other symptoms along with this, such as fever, nausea, or dizziness?",
    relevantHistory:
      "Has anything like this happened before, or does it relate to any illness you already have?",
  },

  Hindi: {
    onset: "यह कब शुरू हुआ, और आपने इसे पहली बार कब महसूस किया?",
    location: "यह शरीर के किस हिस्से में महसूस होता है?",
    character:
      "इसे आप कैसे बताएंगे — तेज़ दर्द, हल्का दर्द, जलन, या धड़कने जैसा?",
    severity: "0 से 10 के पैमाने पर, अभी यह कितना गंभीर है?",
    timing: "क्या यह लगातार रहता है या आता-जाता है, और यह बेहतर हो रहा है या बढ़ रहा है?",
    radiation: "क्या यह शरीर के किसी और हिस्से में फैलता है?",
    aggravatingFactors: "क्या कुछ ऐसा है जिससे यह बढ़ जाता है?",
    relievingFactors: "क्या कुछ ऐसा है जिससे यह कम होता है?",
    associatedSymptoms:
      "क्या इसके साथ कोई और लक्षण हैं, जैसे बुखार, जी मिचलाना या चक्कर?",
    relevantHistory:
      "क्या पहले भी ऐसा हुआ है, या यह आपकी किसी मौजूदा बीमारी से जुड़ा है?",
  },

  Telugu: {
    onset: "ఇది ఎప్పుడు మొదలైంది, మీరు దీన్ని మొదట ఎప్పుడు గమనించారు?",
    location: "ఇది శరీరంలో ఎక్కడ, ఏ భాగంలో అనిపిస్తుంది?",
    character:
      "దీన్ని మీరు ఎలా చెబుతారు — పదునుగా, మందంగా, మంటలాగా, లేదా కొట్టుకున్నట్లు?",
    severity: "0 నుండి 10 స్కేల్‌లో, ఇది ఇప్పుడు ఎంత తీవ్రంగా ఉంది?",
    timing:
      "ఇది నిరంతరం ఉంటుందా లేక వస్తూ పోతూ ఉంటుందా, మరియు ఇది తగ్గుతోందా పెరుగుతోందా?",
    radiation: "ఇది శరీరంలోని మరో భాగానికి వ్యాపిస్తుందా?",
    aggravatingFactors: "దీన్ని ఎక్కువ చేసే విషయం ఏదైనా ఉందా?",
    relievingFactors: "దీన్ని తగ్గించే విషయం ఏదైనా ఉందా?",
    associatedSymptoms:
      "దీనితో పాటు జ్వరం, వికారం లేదా తలతిరగడం వంటి ఇతర లక్షణాలు ఏమైనా ఉన్నాయా?",
    relevantHistory:
      "గతంలో ఇలా జరిగిందా, లేదా ఇది మీ ప్రస్తుత ఆరోగ్య పరిస్థితికి సంబంధించినదా?",
  },

  Tamil: {
    onset: "இது எப்போது தொடங்கியது, முதலில் எப்போது கவனித்தீர்கள்?",
    location: "இது உடலின் எந்த பகுதியில் உணரப்படுகிறது?",
    character:
      "இதை எப்படி சொல்வீர்கள் — கூர்மையாக, மந்தமாக, எரிச்சலாக, அல்லது துடிப்பதுபோல?",
    severity: "0 முதல் 10 அளவில், இது இப்போது எவ்வளவு கடுமையானது?",
    timing:
      "இது தொடர்ந்து இருக்குமா அல்லது வந்து போகுமா, மேலும் இது மேம்படுகிறதா மோசமாகிறதா?",
    radiation: "இது உடலின் வேறு பகுதிக்கு பரவுகிறதா?",
    aggravatingFactors: "இதை மோசமாக்கும் எதுவும் உள்ளதா?",
    relievingFactors: "இதை குறைக்கும் எதுவும் உள்ளதா?",
    associatedSymptoms:
      "இதனுடன் காய்ச்சல், குமட்டல் அல்லது தலைச்சுற்றல் போன்ற வேறு அறிகுறிகள் ஏதேனும் உள்ளதா?",
    relevantHistory:
      "இதற்கு முன் இது போல் ஏற்பட்டதுண்டா, அல்லது இது உங்கள் தற்போதைய உடல்நல நிலைமையுடன் தொடர்புடையதா?",
  },
};

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectRedFlags(text) {
  const normalized = normalizeText(text);

  return RED_FLAG_PATTERNS.filter((flag) =>
    flag.keywords.some((keyword) =>
      normalized.includes(normalizeText(keyword))
    )
  );
}

function detectSymptomType(text) {
  const normalized = normalizeText(text);

  if (
    normalized.includes("chest") ||
    normalized.includes("सीने") ||
    normalized.includes("छाती") ||
    normalized.includes("ఛాతీ") ||
    normalized.includes("நெஞ்சு")
  ) {
    return "chest";
  }

  if (
    normalized.includes("fever") ||
    normalized.includes("बुखार") ||
    normalized.includes("జ్వరం") ||
    normalized.includes("காய்ச்சல்")
  ) {
    return "fever";
  }

  if (
    normalized.includes("cough") ||
    normalized.includes("खांसी") ||
    normalized.includes("खाँसी") ||
    normalized.includes("దగ్గు") ||
    normalized.includes("இருமல்")
  ) {
    return "cough";
  }

  if (
    normalized.includes("headache") ||
    normalized.includes("सिरदर्द") ||
    normalized.includes("తలనొప్పి") ||
    normalized.includes("தலைவலி")
  ) {
    return "headache";
  }

  if (
    normalized.includes("stomach") ||
    normalized.includes("abdominal") ||
    normalized.includes("abdomen") ||
    normalized.includes("पेट") ||
    normalized.includes("కడుపు") ||
    normalized.includes("வயிறு")
  ) {
    return "abdominal";
  }

  return "general";
}

function cleanGeminiJson(text) {
  if (!text) {
    return null;
  }

  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}

function getPatientContext(patientData) {
  if (!patientData) {
    return {};
  }

  return {
    consultationType:
      patientData.consultationType || "General consultation",

    patientName:
      patientData.name || patientData.patientName || DEMO_PATIENT_RECORD.name,

    age: patientData.age || DEMO_PATIENT_RECORD.age,

    gender: patientData.gender || DEMO_PATIENT_RECORD.gender,

    previousMedicalHistory:
      patientData.previousMedicalHistory ||
      DEMO_PATIENT_RECORD.previousMedicalHistory,

    currentMedications:
      patientData.currentMedications ||
      DEMO_PATIENT_RECORD.currentMedications,

    allergies: patientData.allergies || DEMO_PATIENT_RECORD.allergies,

    familyHistory:
      patientData.familyHistory || DEMO_PATIENT_RECORD.familyHistory,

    lifestyle: patientData.lifestyle || DEMO_PATIENT_RECORD.lifestyle,
  };
}

function buildTranscript(conversation) {
  return conversation
    .map((message) => {
      const speaker = message.role === "patient" ? "PATIENT" : "MEDIKIOSK";
      return `${speaker}: ${message.text}`;
    })
    .join("\n");
}

/*
  ==========================================================
  getNextClinicalQuestion
  ==========================================================

  Only job per call:
    1. If a topic was just asked about (lastTopic), extract a
       short factual value for it from the patient's latest
       answer, and note any OTHER remaining topics the answer
       already covers unprompted.
    2. Choose exactly one topic out of `remainingTopics` (a list
       the app computed — Gemini doesn't have to guess what's
       left) and write one short natural question for it.

  The app treats every field in the response as advisory and
  validates it before using it — see resolveNextStep() in the
  component below.
*/
async function getNextClinicalQuestion({
  language,
  conversation,
  patientContext,
  lastTopic,
  remainingTopics,
  questionNumber,
}) {
  const languageName = language || "English";
  const transcript = buildTranscript(conversation);

  const prompt = `
You are MediKiosk, an AI clinical HISTORY-TAKING assistant for a hospital prototype.
You are NOT a doctor. Do not diagnose, treat, or recommend medicine.

The patient speaks ${languageName}. Reply with natural, short questions in ${languageName}.

PATIENT RECORD (prior information, not today's complaint):
${JSON.stringify(patientContext, null, 2)}

FULL CONVERSATION SO FAR:
${transcript || "No conversation yet."}

This is question number ${questionNumber} of at most ${MAX_AI_FOLLOWUPS}.

==================================================
YOUR TWO JOBS, IN ORDER
==================================================

JOB 1 — Only if "topicJustAsked" below is not null:
Read the PATIENT's most recent message in the transcript above.
It is the answer to the topic named in "topicJustAsked".
Write a short factual value for that topic in "extractedValue"
(a few words, in ${languageName} or English, whichever is clearer).
If the patient's answer also clearly covers any OTHER topics
from "remainingTopics" without being asked, list those topic
keys in "additionalTopicsCovered" so we do not ask about them
again.

topicJustAsked: ${lastTopic ? `"${lastTopic}"` : "null"}

JOB 2 — Choose ONE topic key from this exact list and ask about
it. Do not invent topic keys and do not repeat one that is not
in this list — every topic in this list is confirmed NOT yet
covered:

remainingTopics: ${JSON.stringify(remainingTopics)}

If remainingTopics is empty, or the history already collected is
clearly sufficient, set "isComplete": true instead and leave
"nextTopic" / "nextQuestion" empty.

Ask exactly ONE patient-facing question, short and natural, not
a checklist. Do not explain yourself to the patient.

If the patient's last message suggests something clinically
urgent (e.g. chest pain with breathlessness, fainting,
neurological symptoms, bleeding), put a short note in
"redFlagConcern"; otherwise leave it empty.

Return ONLY this JSON, nothing else, no markdown fences:

{
  "extractedValue": "",
  "additionalTopicsCovered": [],
  "redFlagConcern": "",
  "isComplete": false,
  "nextTopic": "",
  "nextQuestion": ""
}
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.3,
    },
  });

  const parsed = cleanGeminiJson(response.text);

  if (!parsed) {
    throw new Error("Gemini returned an unexpected response format.");
  }

  return parsed;
}

function QuestionsScreen({ patientData, onUpdate, onComplete, onBack }) {
  const language = patientData?.language || "English";

  const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.English;

  const [conversation, setConversation] = useState(
    patientData?.conversationHistory || []
  );

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [questionNumber, setQuestionNumber] = useState(
    Math.max(1, Number(patientData?.questionCount || 1))
  );

  const [symptomType, setSymptomType] = useState("general");

  const [redFlags, setRedFlags] = useState(patientData?.redFlags || []);

  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const startedRef = useRef(false);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);

  /*
    Deterministic interview state. Refs, not React state, because
    it is read and written from inside async callbacks
    (recognition results, Gemini responses, TTS callbacks) where
    stale render closures would otherwise cause exactly the kind
    of bugs that made the old version repeat itself.
  */
  const topicAnswersRef = useRef({
    ...(patientData?.topicAnswers || {}),
  });
  const topicInFlightRef = useRef(null);
  const lastAskedQuestionRef = useRef("");

  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const recognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const getRemainingTopics = () =>
    CLINICAL_TOPICS.filter((topic) => !topicAnswersRef.current[topic]);

  const persistConversation = (updatedConversation) => {
    setConversation(updatedConversation);
    onUpdate?.({ conversationHistory: updatedConversation });
  };

  const addConversationMessage = (
    role,
    text,
    baseConversation = conversation
  ) => {
    const message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = [...baseConversation, message];

    persistConversation(updatedConversation);

    return { message, conversation: updatedConversation };
  };

  const speak = (text, onFinished) => {
    if (!text || !speechSupported) {
      onFinished?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.code;
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const matchingVoice = voices.find((voice) =>
      voice.lang
        ?.toLowerCase()
        .startsWith(config.code.toLowerCase().split("-")[0])
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      if (mountedRef.current) {
        setIsSpeaking(true);
      }
    };

    utterance.onend = () => {
      if (mountedRef.current) {
        setIsSpeaking(false);
      }
      onFinished?.();
    };

    utterance.onerror = () => {
      if (mountedRef.current) {
        setIsSpeaking(false);
      }
      onFinished?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopListening = () => {
    clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
    }

    if (mountedRef.current) {
      setIsListening(false);
    }
  };

  const startListening = () => {
    if (
      !recognitionSupported ||
      isPaused ||
      isThinking ||
      processingRef.current
    ) {
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore previous recognition state.
        }
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognition();

      recognition.lang = config.code;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (mountedRef.current) {
          setIsListening(true);
          setErrorMessage("");
        }
      };

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0]?.transcript || "";

          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const visibleText = finalText || interimText;

        if (visibleText && mountedRef.current) {
          setCurrentAnswer(visibleText);
        }

        if (finalText.trim()) {
          clearTimeout(silenceTimerRef.current);

          setTimeout(() => {
            processAnswer(finalText.trim());
          }, 300);
        }
      };

      recognition.onerror = (event) => {
        if (!mountedRef.current) {
          return;
        }

        setIsListening(false);

        if (event.error !== "aborted" && event.error !== "no-speech") {
          setErrorMessage(
            "Voice input is unavailable. You can type your answer instead."
          );
        }
      };

      recognition.onend = () => {
        if (mountedRef.current) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      if (mountedRef.current) {
        setIsListening(false);
        setErrorMessage(
          "Voice input could not be started. You can type your answer instead."
        );
      }
    }
  };

  /*
    Ask a question for a given topic (topic is null for the
    opening question). Everything the answer-processing side
    needs is written to refs HERE, synchronously, before any
    speaking/listening starts — so there is no render-timing
    window where stale data could leak into the next answer.
  */
  const askQuestion = (question, topic, baseConversation = conversation) => {
    if (!question || isPaused) {
      return;
    }

    topicInFlightRef.current = topic;
    lastAskedQuestionRef.current = question;

    setCurrentQuestion(question);
    setCurrentAnswer("");
    setIsThinking(false);
    setErrorMessage("");

    const { conversation: updatedConversation } = addConversationMessage(
      "ai",
      question,
      baseConversation
    );

    speak(question, () => {
      if (!mountedRef.current || isPaused) {
        return;
      }

      setTimeout(() => {
        startListening();
      }, 250);
    });

    return updatedConversation;
  };

  const buildPersistedFields = ({
    updatedConversation,
    updatedHistory,
    updatedAnswers,
    finalRedFlags,
    finalClinicalContext,
    finalSymptoms,
    interviewStatus,
  }) => ({
    name: patientData?.name || DEMO_PATIENT_RECORD.name,
    age: patientData?.age || DEMO_PATIENT_RECORD.age,
    gender: patientData?.gender || DEMO_PATIENT_RECORD.gender,

    previousMedicalHistory:
      patientData?.previousMedicalHistory ||
      DEMO_PATIENT_RECORD.previousMedicalHistory,

    currentMedications:
      patientData?.currentMedications ||
      DEMO_PATIENT_RECORD.currentMedications,

    allergies: patientData?.allergies || DEMO_PATIENT_RECORD.allergies,

    familyHistory:
      patientData?.familyHistory || DEMO_PATIENT_RECORD.familyHistory,

    lifestyle: patientData?.lifestyle || DEMO_PATIENT_RECORD.lifestyle,

    answers: updatedAnswers,
    interviewHistory: updatedHistory,
    conversationHistory: updatedConversation,
    topicAnswers: { ...topicAnswersRef.current },
    redFlags: finalRedFlags,
    clinicalContext: finalClinicalContext,
    symptoms: finalSymptoms,
    interviewStatus,
    answeredCount: updatedHistory.length,
    questionCount: updatedHistory.length + 1,
  });

  const finishInterview = ({
    history,
    answers,
    finalRedFlags,
    finalClinicalContext,
    finalSymptoms,
    finalConversation,
  }) => {
    stopListening();

    if (speechSupported) {
      window.speechSynthesis.cancel();
    }

    setIsThinking(false);

    const finalHistory = history || patientData?.interviewHistory || [];
    const finalAnswers = answers || patientData?.answers || {};

    const completedRedFlags =
      finalRedFlags || redFlags || patientData?.redFlags || [];

    const clinicalContext =
      finalClinicalContext || patientData?.clinicalContext || {};

    const symptoms = finalSymptoms || patientData?.symptoms || [];

    const historyConversation = finalConversation || conversation;

    const finishedMessage = {
      id: `${Date.now()}-finished`,
      role: "ai",
      text: config.finished,
      timestamp: new Date().toISOString(),
    };

    const completedConversation = [...historyConversation, finishedMessage];

    setConversation(completedConversation);

    onUpdate?.({
      ...buildPersistedFields({
        updatedConversation: completedConversation,
        updatedHistory: finalHistory,
        updatedAnswers: finalAnswers,
        finalRedFlags: completedRedFlags,
        finalClinicalContext: clinicalContext,
        finalSymptoms: symptoms,
        interviewStatus: "in_progress",
      }),
    });

    speak(config.finished, () => {
      setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        onComplete?.({
          answers: finalAnswers,
          interviewHistory: finalHistory,
          conversationHistory: completedConversation,
          topicAnswers: { ...topicAnswersRef.current },
          redFlags: completedRedFlags,
          symptoms,
          clinicalContext,
          questionCount: finalHistory.length,
          answeredCount: finalHistory.length,
          interviewStatus: "completed",
          completedAt: new Date().toISOString(),
          priority: completedRedFlags.length > 0 ? "review" : "routine",

          name: patientData?.name || DEMO_PATIENT_RECORD.name,
          age: patientData?.age || DEMO_PATIENT_RECORD.age,
          gender: patientData?.gender || DEMO_PATIENT_RECORD.gender,

          previousMedicalHistory:
            patientData?.previousMedicalHistory ||
            DEMO_PATIENT_RECORD.previousMedicalHistory,

          currentMedications:
            patientData?.currentMedications ||
            DEMO_PATIENT_RECORD.currentMedications,

          allergies: patientData?.allergies || DEMO_PATIENT_RECORD.allergies,

          familyHistory:
            patientData?.familyHistory || DEMO_PATIENT_RECORD.familyHistory,

          lifestyle: patientData?.lifestyle || DEMO_PATIENT_RECORD.lifestyle,
        });
      }, 500);
    });
  };

  /*
    Deterministically resolve what happens next, given whatever
    (possibly incomplete, possibly wrong) response Gemini gave
    us. This is the piece that makes repeats structurally
    impossible: nextTopic is only ever accepted if it is still
    in the remaining list; otherwise the app itself advances the
    checklist using a built-in question.
  */
  const resolveNextStep = (result, remainingTopics) => {
    const wantsComplete = result?.isComplete === true;

    if (wantsComplete || remainingTopics.length === 0) {
      return { done: true };
    }

    const candidateTopic = result?.nextTopic;

    const topicIsValid =
      typeof candidateTopic === "string" &&
      remainingTopics.includes(candidateTopic);

    const topic = topicIsValid ? candidateTopic : remainingTopics[0];

    const candidateQuestion = String(result?.nextQuestion || "").trim();

    const question =
      topicIsValid && candidateQuestion
        ? candidateQuestion
        : TOPIC_FALLBACK_QUESTIONS[language]?.[topic] ||
          TOPIC_FALLBACK_QUESTIONS.English[topic];

    return { done: false, topic, question };
  };

  const processAnswer = async (answer) => {
    const cleanAnswer = String(answer || "").trim();

    if (!cleanAnswer || isThinking || processingRef.current || isPaused) {
      return;
    }

    processingRef.current = true;
    stopListening();

    setIsThinking(true);
    setCurrentAnswer(cleanAnswer);
    setErrorMessage("");

    const askedQuestionText = lastAskedQuestionRef.current;
    const topicJustAsked = topicInFlightRef.current;

    const detectedFlags = detectRedFlags(cleanAnswer);
    const existingFlags = patientData?.redFlags || redFlags || [];
    const existingIds = new Set(existingFlags.map((flag) => flag.id));
    const newFlags = detectedFlags.filter((flag) => !existingIds.has(flag.id));
    const mergedRedFlags = [...existingFlags, ...newFlags];

    const detectedType =
      questionNumber === 1 ? detectSymptomType(cleanAnswer) : symptomType;

    if (questionNumber === 1 && detectedType !== "general") {
      setSymptomType(detectedType);
    }

    // Question 1 is always the chief complaint — record it directly,
    // no need to ask Gemini to extract something we already have verbatim.
    if (questionNumber === 1) {
      topicAnswersRef.current.chiefComplaint = cleanAnswer;
    }

    const answerRecord = {
      question: askedQuestionText,
      answer: cleanAnswer,
      questionIndex: questionNumber - 1,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [
      ...(patientData?.interviewHistory || []),
      answerRecord,
    ];

    const updatedAnswers = {
      ...(patientData?.answers || {}),
      [`question_${questionNumber}`]: {
        question: askedQuestionText,
        answer: cleanAnswer,
      },
    };

    const patientMessage = {
      id: `${Date.now()}-patient`,
      role: "patient",
      text: cleanAnswer,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = [...conversation, patientMessage];
    setConversation(updatedConversation);

    const finishWithCurrentState = () => {
      processingRef.current = false;

      const finalClinicalContext = buildClinicalContext();

      finishInterview({
        history: updatedHistory,
        answers: updatedAnswers,
        finalRedFlags: mergedRedFlags,
        finalClinicalContext,
        finalSymptoms:
          detectedType !== "general"
            ? [detectedType]
            : patientData?.symptoms || [],
        finalConversation: updatedConversation,
      });
    };

    const buildClinicalContext = () => ({
      ...(patientData?.clinicalContext || {}),
      ...topicAnswersRef.current,
      // Aliases some downstream screens look for by these exact names.
      duration: topicAnswersRef.current.onset,
      progression: topicAnswersRef.current.timing,
    });

    const advanceDeterministically = () => {
      const remainingTopics = getRemainingTopics();

      if (remainingTopics.length === 0 || questionNumber >= MAX_AI_FOLLOWUPS) {
        finishWithCurrentState();
        return;
      }

      const topic = remainingTopics[0];
      const question =
        TOPIC_FALLBACK_QUESTIONS[language]?.[topic] ||
        TOPIC_FALLBACK_QUESTIONS.English[topic];

      persistProgress({ nextTopic: topic });

      setQuestionNumber((previous) => previous + 1);
      setIsThinking(false);
      processingRef.current = false;

      setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }
        askQuestion(question, topic, updatedConversation);
      }, 500);
    };

    const persistProgress = ({ nextTopic }) => {
      onUpdate?.(
        buildPersistedFields({
          updatedConversation,
          updatedHistory,
          updatedAnswers,
          finalRedFlags: mergedRedFlags,
          finalClinicalContext: buildClinicalContext(),
          finalSymptoms:
            detectedType !== "general"
              ? [detectedType]
              : patientData?.symptoms || [],
          interviewStatus: "in_progress",
        })
      );

      void nextTopic; // reserved for future per-topic UI hints
    };

    try {
      const remainingTopicsBeforeCall = getRemainingTopics();

      const result = await getNextClinicalQuestion({
        language,
        conversation: updatedConversation,
        patientContext: getPatientContext(patientData),
        lastTopic: topicJustAsked,
        remainingTopics: remainingTopicsBeforeCall,
        questionNumber,
      });

      if (!mountedRef.current) {
        return;
      }

      // JOB 1 result: record the value for the topic we just asked about.
      if (topicJustAsked) {
        const extracted = String(result?.extractedValue || "").trim();
        topicAnswersRef.current[topicJustAsked] = extracted || cleanAnswer;
      }

      if (Array.isArray(result?.additionalTopicsCovered)) {
        result.additionalTopicsCovered.forEach((topic) => {
          if (
            CLINICAL_TOPICS.includes(topic) &&
            !topicAnswersRef.current[topic]
          ) {
            topicAnswersRef.current[topic] = "Mentioned by patient earlier.";
          }
        });
      }

      let finalRedFlags = mergedRedFlags;
      const modelRedFlag = result?.redFlagConcern;

      if (modelRedFlag && String(modelRedFlag).trim().length > 0) {
        const aiFlag = {
          id: "ai-clinical-review",
          label: String(modelRedFlag).trim(),
        };

        if (!mergedRedFlags.some((flag) => flag.id === aiFlag.id)) {
          finalRedFlags = [...mergedRedFlags, aiFlag];
        }
      }

      setRedFlags(finalRedFlags);

      const remainingTopicsAfterExtraction = getRemainingTopics();

      const step = resolveNextStep(result, remainingTopicsAfterExtraction);

      const finalClinicalContext = buildClinicalContext();

      persistProgress({ nextTopic: step.topic });

      if (step.done || questionNumber >= MAX_AI_FOLLOWUPS) {
        processingRef.current = false;

        finishInterview({
          history: updatedHistory,
          answers: updatedAnswers,
          finalRedFlags,
          finalClinicalContext,
          finalSymptoms:
            detectedType !== "general"
              ? [detectedType]
              : patientData?.symptoms || [],
          finalConversation: updatedConversation,
        });

        return;
      }

      setQuestionNumber((previous) => previous + 1);
      setIsThinking(false);
      processingRef.current = false;

      setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }
        askQuestion(step.question, step.topic, updatedConversation);
      }, 500);
    } catch (error) {
      console.error("Gemini clinical interview error:", error);

      if (!mountedRef.current) {
        return;
      }

      // Gemini failed outright — still make forward progress instead of
      // getting stuck, using the checklist and built-in questions.
      if (topicJustAsked && !topicAnswersRef.current[topicJustAsked]) {
        topicAnswersRef.current[topicJustAsked] = cleanAnswer;
      }

      advanceDeterministically();
    }
  };

  const handleSubmitTypedAnswer = () => {
    const answer = currentAnswer.trim();

    if (!answer || isThinking || processingRef.current) {
      return;
    }

    processAnswer(answer);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);

      setTimeout(() => {
        if (speechSupported && currentQuestion) {
          speak(currentQuestion, () => {
            startListening();
          });
        } else {
          startListening();
        }
      }, 200);

      return;
    }

    setIsPaused(true);
    stopListening();

    if (speechSupported) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  const startInterview = () => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    /*
      Load fictional demo patient data into the active patient
      record immediately. If real patient fields already exist,
      they are preserved.
    */
    const demoPatientData = {
      name: patientData?.name || DEMO_PATIENT_RECORD.name,
      age: patientData?.age || DEMO_PATIENT_RECORD.age,
      gender: patientData?.gender || DEMO_PATIENT_RECORD.gender,

      previousMedicalHistory:
        patientData?.previousMedicalHistory ||
        DEMO_PATIENT_RECORD.previousMedicalHistory,

      currentMedications:
        patientData?.currentMedications ||
        DEMO_PATIENT_RECORD.currentMedications,

      allergies: patientData?.allergies || DEMO_PATIENT_RECORD.allergies,

      familyHistory:
        patientData?.familyHistory || DEMO_PATIENT_RECORD.familyHistory,

      lifestyle: patientData?.lifestyle || DEMO_PATIENT_RECORD.lifestyle,
    };

    onUpdate?.({
      ...demoPatientData,
      interviewStatus: "in_progress",
      questionCount: 1,
      answeredCount: 0,
      topicAnswers: { ...topicAnswersRef.current },
    });

    const welcomeMessage = {
      id: `${Date.now()}-welcome`,
      role: "ai",
      text: config.welcome,
      timestamp: new Date().toISOString(),
    };

    const initialConversation = [...conversation, welcomeMessage];

    setConversation(initialConversation);
    onUpdate?.({ conversationHistory: initialConversation });

    speak(config.welcome, () => {
      if (!mountedRef.current) {
        return;
      }

      setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }
        askQuestion(config.firstQuestion, null, initialConversation);
      }, 500);
    });
  };

  useEffect(() => {
    mountedRef.current = true;

    if (patientData?.topicAnswers) {
      topicAnswersRef.current = { ...patientData.topicAnswers };
    }

    if (patientData?.conversationHistory) {
      setConversation(patientData.conversationHistory);
    }

    startInterview();

    return () => {
      mountedRef.current = false;
      stopListening();

      if (speechSupported) {
        window.speechSynthesis.cancel();
      }

      clearTimeout(silenceTimerRef.current);
    };

    // Start only once when screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.min(
    95,
    Math.round((questionNumber / (MAX_AI_FOLLOWUPS + 1)) * 100)
  );

  const statusText = isThinking
    ? config.thinking
    : isListening
      ? config.listening
      : isSpeaking
        ? config.speaking
        : config.ready;

  const patientName = patientData?.name || DEMO_PATIENT_RECORD.name;
  const patientAge = patientData?.age || DEMO_PATIENT_RECORD.age;
  const patientGender = patientData?.gender || DEMO_PATIENT_RECORD.gender;

  const previousMedicalHistory =
    patientData?.previousMedicalHistory ||
    DEMO_PATIENT_RECORD.previousMedicalHistory;

  const currentMedications =
    patientData?.currentMedications || DEMO_PATIENT_RECORD.currentMedications;

  const allergies = patientData?.allergies || DEMO_PATIENT_RECORD.allergies;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <StethoscopeIcon />
            </div>

            <div>
              <p className="font-bold text-slate-900">MediKiosk</p>

              <p className="text-xs text-slate-500">AI Clinical Interview</p>
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={14} />
              Patient record loaded
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              {language}
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              {patientData?.consultationType || "Allopathic"}
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Clinical history
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                Question {questionNumber}
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <Clock3 size={15} />
              AI adaptive interview
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_340px]">
        {/* Conversation */}
        <section className="flex min-h-[calc(100vh-190px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* AI status */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-4">
              <div
                className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  isListening
                    ? "bg-emerald-100 text-emerald-600"
                    : isSpeaking
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                <Bot size={28} />

                {(isListening || isSpeaking) && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">MediKiosk AI</p>

                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    AI
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">{statusText}</p>
              </div>

              <button
                type="button"
                onClick={togglePause}
                className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "patient" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    message.role === "patient"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {message.role === "patient" ? (
                      <Mic size={14} />
                    ) : (
                      <Sparkles size={14} />
                    )}

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        message.role === "patient"
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {message.role === "patient" ? "You" : "MediKiosk"}
                    </span>
                  </div>

                  <p className="text-sm leading-7">{message.text}</p>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "120ms" }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "240ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current question */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-5">
            <div className="rounded-2xl border border-blue-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Volume2 size={15} />
                Current question
              </div>

              <p className="text-lg font-semibold leading-8 text-slate-900">
                {currentQuestion || config.firstQuestion}
              </p>
            </div>

            {/* Voice control */}
            <div className="mt-4 flex flex-col items-center">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isThinking || isPaused}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition ${
                  isListening
                    ? "bg-red-500 shadow-red-500/20 hover:bg-red-600"
                    : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
                } ${
                  isThinking || isPaused
                    ? "cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                {isListening ? (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                    <MicOff size={30} />
                  </>
                ) : (
                  <Mic size={30} />
                )}
              </button>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                {isListening ? "Tap to stop listening" : "Tap to speak"}
              </p>

              <p className="mt-1 text-xs text-slate-400">{config.fallback}</p>
            </div>

            {/* Text fallback */}
            <div className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <Keyboard
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={currentAnswer}
                  onChange={(event) => setCurrentAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSubmitTypedAnswer();
                    }
                  }}
                  placeholder="Type your answer if needed..."
                  disabled={isThinking}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitTypedAnswer}
                disabled={!currentAnswer.trim() || isThinking}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
                <ChevronRight size={17} />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                {errorMessage}
              </div>
            )}
          </div>
        </section>

        {/* Side panel */}
        <aside className="space-y-5">
          {/* Patient profile */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Patient profile
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {patientName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {patientAge} years • {patientGender}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Demo
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Previous medical history
                </p>

                <div className="mt-2 space-y-1.5">
                  {previousMedicalHistory.map((item) => (
                    <p key={item} className="text-xs leading-5 text-slate-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current medications
                </p>

                <div className="mt-2 space-y-1.5">
                  {currentMedications.map((item) => (
                    <p key={item} className="text-xs leading-5 text-slate-600">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Allergies
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {allergies.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Listening card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Ear size={20} />
              </div>

              <div>
                <p className="font-bold text-slate-900">Voice assistant</p>

                <p className="text-xs text-slate-500">{config.code}</p>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                isListening ? "bg-emerald-50" : "bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isListening
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {isListening ? <Mic size={17} /> : <MicOff size={17} />}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {isListening ? "Listening" : "Microphone ready"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {isListening
                      ? "Speak naturally"
                      : "MediKiosk will listen when you speak"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical concern */}
          {redFlags.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <p className="font-bold text-amber-900">
                    Potential clinical concern
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Information requiring clinician review has been detected.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {redFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="rounded-xl bg-white/70 p-3 text-xs font-medium text-amber-900"
                  >
                    {flag.label}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] leading-5 text-amber-700">
                This is not a diagnosis. Please ask a clinician to review this
                information.
              </p>
            </div>
          )}

          {/* What AI is doing */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={17} className="text-blue-600" />

              <p className="font-bold text-slate-900">
                What MediKiosk is doing
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: CheckCircle2, text: "Listening to your answer" },
                {
                  icon: CheckCircle2,
                  text: "Remembering information already provided",
                },
                {
                  icon: CheckCircle2,
                  text: "Choosing a relevant follow-up",
                },
                { icon: FileText, text: "Building your clinical history" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.text} className="flex items-start gap-3">
                    <Icon
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-xs leading-5 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accessibility */}
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <Volume2
                size={19}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-bold text-blue-900">
                  You don't need to read or type
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-800">
                  MediKiosk is designed so patients can complete the
                  interview mainly by listening and speaking.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StethoscopeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3v5a6 6 0 0 0 12 0V3" />
      <path d="M3 3h3M18 3h3" />
      <path d="M12 14v4a4 4 0 0 0 8 0v-1" />
      <circle cx="20" cy="15" r="1" />
    </svg>
  );
}

export default QuestionsScreen;