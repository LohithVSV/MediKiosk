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
      "सांस फूल",
      "सांस लेने में परेशानी",
      "ఊపిరి తీసుకోవడంలో ఇబ్బంది",
      "మూచ్చ",
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

function normalizeText(text) {
  return String(text || "").toLowerCase().trim();
}

function detectRedFlags(text) {
  const normalized = normalizeText(text);

  return RED_FLAG_PATTERNS.filter((flag) =>
    flag.keywords.some((keyword) =>
      normalized.includes(keyword.toLowerCase())
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
    normalized.includes("నెഞ്ചు") ||
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
        return JSON.parse(
          cleaned.slice(firstBrace, lastBrace + 1)
        );
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
      patientData.name ||
      patientData.patientName ||
      undefined,

    age:
      patientData.age ||
      undefined,

    gender:
      patientData.gender ||
      undefined,

    knownSymptoms:
      patientData.symptoms || [],

    existingClinicalContext:
      patientData.clinicalContext || {},
  };
}

function buildTranscript(conversation, latestAnswer) {
  const lines = conversation.map((message) => {
    const speaker =
      message.role === "patient"
        ? "PATIENT"
        : "MEDIKIOSK";

    return `${speaker}: ${message.text}`;
  });

  if (latestAnswer) {
    lines.push(`PATIENT: ${latestAnswer}`);
  }

  return lines.join("\n");
}

async function getNextClinicalQuestion({
  language,
  conversation,
  latestAnswer,
  patientData,
  questionNumber,
  symptomType,
}) {
  const languageName = language || "English";

  const transcript = buildTranscript(
    conversation,
    latestAnswer
  );

  const patientContext = getPatientContext(patientData);

  const prompt = `
You are MediKiosk, an AI clinical HISTORY-TAKING assistant for a hospital prototype.

Your job is ONLY to collect clinical history from a patient.

You are NOT a doctor.
Do NOT diagnose.
Do NOT recommend treatment.
Do NOT prescribe medicines.
Do NOT tell the patient what disease they have.
Do NOT provide medical advice.

The patient is speaking in ${languageName}.

IMPORTANT CONVERSATION RULES:

1. Understand the patient's latest answer using the ENTIRE conversation.
2. Never repeat a question that has already been asked.
3. Never ask for information the patient has already clearly provided.
4. If the patient says "no", "లేదు", "नहीं", etc., understand that as a negative answer and move forward.
5. Ask EXACTLY ONE question.
6. The next question must be clinically relevant to the information already provided.
7. Prefer natural follow-up questions over a rigid questionnaire.
8. If the patient gives a detailed answer containing multiple facts, remember all of them.
9. Do not restart the interview.
10. Do not ask the same question using different wording.
11. Do not ask several questions joined with "and".
12. Keep questions short and easy for a patient to understand.
13. Ask questions in ${languageName}.
14. If the patient's answer is ambiguous, ask one focused clarification.
15. If enough useful history has been collected, finish instead of endlessly asking questions.
16. Maximum total AI follow-up questions in this interview is ${MAX_AI_FOLLOWUPS}.
17. This is question number ${questionNumber}.
18. Current symptom category inferred by the application: ${symptomType}.

The interview transcript is:

${transcript}

Patient context:

${JSON.stringify(patientContext, null, 2)}

Return ONLY valid JSON in exactly this structure:

{
  "isComplete": false,
  "nextQuestion": "one short question in ${languageName}",
  "clinicalUnderstanding": {
    "chiefComplaint": "",
    "onset": "",
    "location": "",
    "character": "",
    "severity": "",
    "timing": "",
    "radiation": "",
    "aggravatingFactors": "",
    "relievingFactors": "",
    "associatedSymptoms": "",
    "relevantHistory": ""
  },
  "redFlagConcern": ""
}

If the history is sufficiently collected, return:

{
  "isComplete": true,
  "nextQuestion": "",
  "clinicalUnderstanding": {
    "chiefComplaint": "",
    "onset": "",
    "location": "",
    "character": "",
    "severity": "",
    "timing": "",
    "radiation": "",
    "aggravatingFactors": "",
    "relievingFactors": "",
    "associatedSymptoms": "",
    "relevantHistory": ""
  },
  "redFlagConcern": ""
}

Remember: ONE question only.
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
    },
  });

  const parsed = cleanGeminiJson(response.text);

  if (!parsed) {
    throw new Error(
      "Gemini returned an unexpected response format."
    );
  }

  return parsed;
}

function QuestionsScreen({
  patientData,
  onUpdate,
  onComplete,
  onBack,
}) {
  const language =
    patientData?.language || "English";

  const config =
    LANGUAGE_CONFIG[language] ||
    LANGUAGE_CONFIG.English;

  const [conversation, setConversation] =
    useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState("");

  const [currentAnswer, setCurrentAnswer] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [isThinking, setIsThinking] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [questionNumber, setQuestionNumber] =
    useState(1);

  const [symptomType, setSymptomType] =
    useState("general");

  const [redFlags, setRedFlags] =
    useState(patientData?.redFlags || []);

  const [errorMessage, setErrorMessage] =
    useState("");

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const startedRef = useRef(false);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);

  const speechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window;

  const recognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window);

  const addConversationMessage = (
    role,
    text
  ) => {
    const message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      text,
      timestamp: new Date().toISOString(),
    };

    setConversation((previous) => [
      ...previous,
      message,
    ]);

    return message;
  };

  const speak = (text, onFinished) => {
    if (!text) {
      onFinished?.();
      return;
    }

    if (!speechSupported) {
      onFinished?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = config.code;
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices =
      window.speechSynthesis.getVoices();

    const matchingVoice = voices.find(
      (voice) =>
        voice.lang
          ?.toLowerCase()
          .startsWith(
            config.code
              .toLowerCase()
              .split("-")[0]
          )
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
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      const recognition =
        new SpeechRecognition();

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

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i += 1
        ) {
          const transcript =
            event.results[i][0]?.transcript || "";

          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const visibleText =
          finalText || interimText;

        if (visibleText && mountedRef.current) {
          setCurrentAnswer(visibleText);
        }

        if (finalText.trim()) {
          clearTimeout(
            silenceTimerRef.current
          );

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

        if (
          event.error !== "aborted" &&
          event.error !== "no-speech"
        ) {
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

  const askQuestion = (question) => {
    if (!question || isPaused) {
      return;
    }

    setCurrentQuestion(question);
    setCurrentAnswer("");
    setIsThinking(false);
    setErrorMessage("");

    addConversationMessage(
      "ai",
      question
    );

    speak(question, () => {
      if (!mountedRef.current || isPaused) {
        return;
      }

      setTimeout(() => {
        startListening();
      }, 250);
    });
  };

  const finishInterview = ({
    history,
    answers,
    finalRedFlags,
    finalClinicalContext,
    finalSymptoms,
  }) => {
    stopListening();

    if (speechSupported) {
      window.speechSynthesis.cancel();
    }

    setIsThinking(false);

    const finalHistory =
      history ||
      patientData?.interviewHistory ||
      [];

    const finalAnswers =
      answers ||
      patientData?.answers ||
      {};

    const completedRedFlags =
      finalRedFlags ||
      redFlags ||
      patientData?.redFlags ||
      [];

    const clinicalContext =
      finalClinicalContext ||
      patientData?.clinicalContext ||
      {};

    const symptoms =
      finalSymptoms ||
      patientData?.symptoms ||
      [];

    addConversationMessage(
      "ai",
      config.finished
    );

    speak(config.finished, () => {
      setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        onComplete?.({
          answers: finalAnswers,
          interviewHistory: finalHistory,
          redFlags: completedRedFlags,
          symptoms,
          clinicalContext,
          questionCount:
            finalHistory.length,
          answeredCount:
            finalHistory.length,
          interviewStatus: "completed",
          completedAt:
            new Date().toISOString(),
          priority:
            completedRedFlags.length > 0
              ? "review"
              : "routine",
        });
      }, 500);
    });
  };

  const processAnswer = async (answer) => {
    const cleanAnswer = String(
      answer || ""
    ).trim();

    if (
      !cleanAnswer ||
      isThinking ||
      processingRef.current ||
      isPaused
    ) {
      return;
    }

    processingRef.current = true;

    stopListening();

    setIsThinking(true);
    setCurrentAnswer(cleanAnswer);
    setErrorMessage("");

    const detectedFlags =
      detectRedFlags(cleanAnswer);

    const existingFlags =
      patientData?.redFlags ||
      redFlags ||
      [];

    const existingIds = new Set(
      existingFlags.map(
        (flag) => flag.id
      )
    );

    const newFlags =
      detectedFlags.filter(
        (flag) =>
          !existingIds.has(flag.id)
      );

    const mergedRedFlags = [
      ...existingFlags,
      ...newFlags,
    ];

    const detectedType =
      questionNumber === 1
        ? detectSymptomType(cleanAnswer)
        : symptomType;

    if (
      questionNumber === 1 &&
      detectedType !== "general"
    ) {
      setSymptomType(detectedType);
    }

    const answerRecord = {
      question: currentQuestion,
      answer: cleanAnswer,
      questionIndex:
        questionNumber - 1,
      timestamp:
        new Date().toISOString(),
    };

    const updatedHistory = [
      ...(patientData?.interviewHistory ||
        []),
      answerRecord,
    ];

    const updatedAnswers = {
      ...(patientData?.answers || {}),
      [`question_${questionNumber}`]: {
        question: currentQuestion,
        answer: cleanAnswer,
      },
    };

    const updatedConversation = [
      ...conversation,
      {
        id: `${Date.now()}-patient`,
        role: "patient",
        text: cleanAnswer,
        timestamp:
          new Date().toISOString(),
      },
    ];

    setConversation(
      updatedConversation
    );

    const baseClinicalContext = {
      ...(patientData?.clinicalContext ||
        {}),
      ...(questionNumber === 1
        ? {
            chiefComplaint:
              cleanAnswer,
          }
        : {}),
    };

    onUpdate?.({
      answers: updatedAnswers,
      interviewHistory: updatedHistory,
      answeredCount:
        updatedHistory.length,
      questionCount:
        updatedHistory.length + 1,
      symptoms:
        detectedType !== "general"
          ? [detectedType]
          : patientData?.symptoms || [],
      redFlags: mergedRedFlags,
      clinicalContext:
        baseClinicalContext,
      interviewStatus:
        "in_progress",
    });

    setRedFlags(mergedRedFlags);

    try {
      const result =
        await getNextClinicalQuestion({
          language,
          conversation:
            updatedConversation,
          latestAnswer: null,
          patientData,
          questionNumber:
            questionNumber,
          symptomType:
            detectedType,
        });

      if (!mountedRef.current) {
        return;
      }

      const modelClinical =
        result?.clinicalUnderstanding ||
        {};

      const updatedClinicalContext = {
        ...baseClinicalContext,
        ...modelClinical,
      };

      const modelRedFlag =
        result?.redFlagConcern;

      let finalRedFlags =
        mergedRedFlags;

      if (
        modelRedFlag &&
        String(modelRedFlag)
          .trim()
          .length > 0
      ) {
        const aiFlag = {
          id: "ai-clinical-review",
          label: String(
            modelRedFlag
          ).trim(),
        };

        const alreadyExists =
          mergedRedFlags.some(
            (flag) =>
              flag.id === aiFlag.id
          );

        if (!alreadyExists) {
          finalRedFlags = [
            ...mergedRedFlags,
            aiFlag,
          ];

          setRedFlags(finalRedFlags);
        }
      }

      onUpdate?.({
        clinicalContext:
          updatedClinicalContext,
        redFlags: finalRedFlags,
        answers: updatedAnswers,
        interviewHistory:
          updatedHistory,
        answeredCount:
          updatedHistory.length,
        questionCount:
          updatedHistory.length + 1,
      });

      const shouldFinish =
        result?.isComplete === true ||
        !result?.nextQuestion ||
        questionNumber >
          MAX_AI_FOLLOWUPS;

      if (shouldFinish) {
        processingRef.current = false;

        finishInterview({
          history: updatedHistory,
          answers: updatedAnswers,
          finalRedFlags,
          finalClinicalContext:
            updatedClinicalContext,
          finalSymptoms:
            detectedType !== "general"
              ? [detectedType]
              : patientData?.symptoms ||
                [],
        });

        return;
      }

      const nextQuestion =
        String(
          result.nextQuestion || ""
        ).trim();

      if (!nextQuestion) {
        processingRef.current = false;

        finishInterview({
          history: updatedHistory,
          answers: updatedAnswers,
          finalRedFlags,
          finalClinicalContext:
            updatedClinicalContext,
          finalSymptoms:
            detectedType !== "general"
              ? [detectedType]
              : patientData?.symptoms ||
                [],
        });

        return;
      }

      setQuestionNumber(
        (previous) => previous + 1
      );

      setIsThinking(false);
      processingRef.current = false;

      setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        askQuestion(nextQuestion);
      }, 500);
    } catch (error) {
      console.error(
        "Gemini clinical interview error:",
        error
      );

      if (!mountedRef.current) {
        return;
      }

      setIsThinking(false);
      processingRef.current = false;

      setErrorMessage(
        "I couldn't process that answer right now. Please try again or type your answer below."
      );
    }
  };

  const handleSubmitTypedAnswer = () => {
    const answer =
      currentAnswer.trim();

    if (
      !answer ||
      isThinking ||
      processingRef.current
    ) {
      return;
    }

    processAnswer(answer);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);

      setTimeout(() => {
        if (
          speechSupported &&
          currentQuestion
        ) {
          speak(
            currentQuestion,
            () => {
              startListening();
            }
          );
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

    onUpdate?.({
      interviewStatus:
        "in_progress",
      questionCount: 1,
      answeredCount: 0,
    });

    addConversationMessage(
      "ai",
      config.welcome
    );

    speak(
      config.welcome,
      () => {
        if (!mountedRef.current) {
          return;
        }

        setTimeout(() => {
          askQuestion(
            config.firstQuestion
          );
        }, 500);
      }
    );
  };

  useEffect(() => {
    mountedRef.current = true;

    startInterview();

    return () => {
      mountedRef.current = false;

      stopListening();

      if (speechSupported) {
        window.speechSynthesis.cancel();
      }

      clearTimeout(
        silenceTimerRef.current
      );
    };

    // Start only once when screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.min(
    95,
    Math.round(
      (questionNumber /
        (MAX_AI_FOLLOWUPS + 1)) *
        100
    )
  );

  const statusText = isThinking
    ? config.thinking
    : isListening
      ? config.listening
      : isSpeaking
        ? config.speaking
        : config.ready;

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
              <p className="font-bold text-slate-900">
                MediKiosk
              </p>

              <p className="text-xs text-slate-500">
                AI Clinical Interview
              </p>
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
              {patientData?.consultationType ||
                "Allopathic"}
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
              style={{
                width: `${progress}%`,
              }}
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

                {(isListening ||
                  isSpeaking) && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">
                    MediKiosk AI
                  </p>

                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    AI
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {statusText}
                </p>
              </div>

              <button
                type="button"
                onClick={togglePause}
                className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50"
                title={
                  isPaused
                    ? "Resume"
                    : "Pause"
                }
              >
                {isPaused ? (
                  <Play size={18} />
                ) : (
                  <Pause size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {conversation.map(
              (message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role ===
                    "patient"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                      message.role ===
                      "patient"
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {message.role ===
                      "patient" ? (
                        <Mic size={14} />
                      ) : (
                        <Sparkles
                          size={14}
                        />
                      )}

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          message.role ===
                          "patient"
                            ? "text-blue-100"
                            : "text-slate-400"
                        }`}
                      >
                        {message.role ===
                        "patient"
                          ? "You"
                          : "MediKiosk"}
                      </span>
                    </div>

                    <p className="text-sm leading-7">
                      {message.text}
                    </p>
                  </div>
                </div>
              )
            )}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{
                        animationDelay:
                          "120ms",
                      }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{
                        animationDelay:
                          "240ms",
                      }}
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
                {currentQuestion ||
                  config.firstQuestion}
              </p>
            </div>

            {/* Voice control */}
            <div className="mt-4 flex flex-col items-center">
              <button
                type="button"
                onClick={
                  isListening
                    ? stopListening
                    : startListening
                }
                disabled={
                  isThinking ||
                  isPaused
                }
                className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition ${
                  isListening
                    ? "bg-red-500 shadow-red-500/20 hover:bg-red-600"
                    : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
                } ${
                  isThinking ||
                  isPaused
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
                {isListening
                  ? "Tap to stop listening"
                  : "Tap to speak"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {config.fallback}
              </p>
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
                  onChange={(event) =>
                    setCurrentAnswer(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
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
                onClick={
                  handleSubmitTypedAnswer
                }
                disabled={
                  !currentAnswer.trim() ||
                  isThinking
                }
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
                <ChevronRight
                  size={17}
                />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0"
                />
                {errorMessage}
              </div>
            )}
          </div>
        </section>

        {/* Side panel */}
        <aside className="space-y-5">
          {/* Listening card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Ear size={20} />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Voice assistant
                </p>

                <p className="text-xs text-slate-500">
                  {config.code}
                </p>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                isListening
                  ? "bg-emerald-50"
                  : "bg-slate-50"
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
                  {isListening ? (
                    <Mic size={17} />
                  ) : (
                    <MicOff size={17} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {isListening
                      ? "Listening"
                      : "Microphone ready"}
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
                  <AlertTriangle
                    size={20}
                  />
                </div>

                <div>
                  <p className="font-bold text-amber-900">
                    Potential clinical concern
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Information requiring
                    clinician review has
                    been detected.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {redFlags.map(
                  (flag) => (
                    <div
                      key={flag.id}
                      className="rounded-xl bg-white/70 p-3 text-xs font-medium text-amber-900"
                    >
                      {flag.label}
                    </div>
                  )
                )}
              </div>

              <p className="mt-4 text-[11px] leading-5 text-amber-700">
                This is not a diagnosis.
                Please ask a clinician
                to review this information.
              </p>
            </div>
          )}

          {/* What AI is doing */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-blue-600"
              />

              <p className="font-bold text-slate-900">
                What MediKiosk is doing
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: CheckCircle2,
                  text: "Listening to your answer",
                },
                {
                  icon: CheckCircle2,
                  text: "Understanding the conversation",
                },
                {
                  icon: CheckCircle2,
                  text: "Choosing a relevant follow-up",
                },
                {
                  icon: FileText,
                  text: "Building your clinical history",
                },
              ].map((item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.text}
                    className="flex items-start gap-3"
                  >
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
                  MediKiosk is designed
                  so patients can complete
                  the interview mainly by
                  listening and speaking.
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
      <circle
        cx="20"
        cy="15"
        r="1"
      />
    </svg>
  );
}

export default QuestionsScreen;