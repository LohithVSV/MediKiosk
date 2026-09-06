import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Mic,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const LANGUAGE_CODES = {
  English: "en-IN",
  Hindi: "hi-IN",
  Telugu: "te-IN",
  Tamil: "ta-IN",
};

const CONSULTATION_TYPES = [
  {
    id: "Allopathic",
    title: "Allopathic",
    description: "Modern clinical treatment",
    icon: Stethoscope,
  },
  {
    id: "AYUSH",
    title: "AYUSH",
    description: "Traditional health systems",
    icon: Sparkles,
  },
];

const VOICE_PROMPTS = {
  English: {
    Allopathic:
      "If you want Allopathic treatment, please click the Allopathic button.",
    AYUSH:
      "If you want AYUSH treatment, please click the AYUSH button.",
    continueAllopathic:
      "You have selected Allopathic. Please click the glowing green button below to start the consultation.",
    continueAYUSH:
      "You have selected AYUSH. Please click the glowing green button below to start the consultation.",
  },

  Hindi: {
    Allopathic:
      "अगर आप एलोपैथिक इलाज चाहते हैं, तो कृपया एलोपैथिक बटन दबाएं।",
    AYUSH:
      "अगर आप आयुष इलाज चाहते हैं, तो कृपया आयुष बटन दबाएं।",
    continueAllopathic:
      "आपने एलोपैथिक इलाज चुना है। परामर्श शुरू करने के लिए नीचे चमक रहे हरे बटन को दबाएं।",
    continueAYUSH:
      "आपने आयुष इलाज चुना है। परामर्श शुरू करने के लिए नीचे चमक रहे हरे बटन को दबाएं।",
  },

  Telugu: {
    Allopathic:
      "మీరు అల్లోపతి వైద్యాన్ని ఎంచుకోవాలనుకుంటే, దయచేసి అల్లోపతి బటన్‌ను నొక్కండి.",
    AYUSH:
      "మీరు ఆయుష్ వైద్యాన్ని ఎంచుకోవాలనుకుంటే, దయచేసి ఆయుష్ బటన్‌ను నొక్కండి.",
    continueAllopathic:
      "మీరు అల్లోపతి వైద్యాన్ని ఎంచుకున్నారు. సంప్రదింపులను ప్రారంభించడానికి కింద వెలుగుతున్న ఆకుపచ్చ బటన్‌ను నొక్కండి.",
    continueAYUSH:
      "మీరు ఆయుష్ వైద్యాన్ని ఎంచుకున్నారు. సంప్రదింపులను ప్రారంభించడానికి కింద వెలుగుతున్న ఆకుపచ్చ బటన్‌ను నొక్కండి.",
  },

  Tamil: {
    Allopathic:
      "நீங்கள் அலோபதி சிகிச்சையைத் தேர்வு செய்ய விரும்பினால், அலோபதி பொத்தானை அழுத்தவும்.",
    AYUSH:
      "நீங்கள் ஆயுஷ் சிகிச்சையைத் தேர்வு செய்ய விரும்பினால், ஆயுஷ் பொத்தானை அழுத்தவும்.",
    continueAllopathic:
      "நீங்கள் அலோபதி சிகிச்சையைத் தேர்ந்தெடுத்துள்ளீர்கள். ஆலோசனையைத் தொடங்க கீழே ஒளிரும் பச்சை பொத்தானை அழுத்தவும்.",
    continueAYUSH:
      "நீங்கள் ஆயுஷ் சிகிச்சையைத் தேர்ந்தெடுத்துள்ளீர்கள். ஆலோசனையைத் தொடங்க கீழே ஒளிரும் பச்சை பொத்தானை அழுத்தவும்.",
  },
};

function ConsultationScreen({
  patientData,
  onUpdate,
  onStart,
  onBack,
}) {
  const selectedLanguage = patientData?.language || "English";

  const [selectedMode, setSelectedMode] = useState(
    patientData?.consultationType || ""
  );

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMode, setSpeakingMode] = useState(null);
  const [introComplete, setIntroComplete] = useState(false);
  const [readyToStart, setReadyToStart] = useState(false);

  const mountedRef = useRef(true);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (patientData?.consultationType) {
      setSelectedMode(patientData.consultationType);
    }
  }, [patientData?.consultationType]);

  /*
   * Speak a consultation option.
   *
   * While speaking:
   * - The corresponding card glows green.
   *
   * When speech ends:
   * - Green glow disappears immediately.
   */
  const speak = (text, mode = null, onFinished = null) => {
    if (!("speechSynthesis" in window)) {
      onFinished?.();
      return;
    }

    window.speechSynthesis.cancel();

    setIsSpeaking(false);
    setSpeakingMode(null);

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang =
      LANGUAGE_CODES[selectedLanguage] || "en-IN";

    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();

    const matchingVoice =
      voices.find(
        (voice) =>
          voice.lang?.toLowerCase() ===
          utterance.lang.toLowerCase()
      ) ||
      voices.find((voice) =>
        voice.lang
          ?.toLowerCase()
          .startsWith(
            utterance.lang.slice(0, 2).toLowerCase()
          )
      );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      if (!mountedRef.current) return;

      setIsSpeaking(true);
      setSpeakingMode(mode);
    };

    utterance.onend = () => {
      if (!mountedRef.current) return;

      setIsSpeaking(false);
      setSpeakingMode(null);

      onFinished?.();
    };

    utterance.onerror = (event) => {
      if (!mountedRef.current) return;

      if (
        event?.error === "canceled" ||
        event?.error === "interrupted"
      ) {
        return;
      }

      setIsSpeaking(false);
      setSpeakingMode(null);

      onFinished?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  /*
   * Explain Allopathic first,
   * then AYUSH in the language chosen on WelcomeScreen.
   */
  const startModeIntroduction = () => {
    const prompts =
      VOICE_PROMPTS[selectedLanguage] ||
      VOICE_PROMPTS.English;

    setIntroComplete(false);
    setReadyToStart(false);

    speak(
      prompts.Allopathic,
      "Allopathic",
      () => {
        setTimeout(() => {
          if (!mountedRef.current) return;

          speak(
            prompts.AYUSH,
            "AYUSH",
            () => {
              setTimeout(() => {
                if (!mountedRef.current) return;

                setIntroComplete(true);
              }, 400);
            }
          );
        }, 700);
      }
    );
  };

  /*
   * Start the voice explanation automatically
   * when this screen opens.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;

      startModeIntroduction();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedLanguage]);

  /*
   * Patient selects Allopathic or AYUSH.
   *
   * After selection:
   * - The card becomes blue.
   * - The start button becomes green.
   * - MediKiosk tells the patient to press
   *   the glowing green button.
   */
  const handleModeChange = (mode) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setSpeakingMode(null);
    setSelectedMode(mode);
    setIntroComplete(true);

    setReadyToStart(false);

    onUpdate?.({
      consultationType: mode,
    });

    const prompts =
      VOICE_PROMPTS[selectedLanguage] ||
      VOICE_PROMPTS.English;

    const continueMessage =
      mode === "Allopathic"
        ? prompts.continueAllopathic
        : prompts.continueAYUSH;

    setTimeout(() => {
      if (!mountedRef.current) return;

      speak(continueMessage, null, () => {
        if (!mountedRef.current) return;

        setIsSpeaking(false);
        setSpeakingMode(null);
        setReadyToStart(true);
      });
    }, 250);
  };

  /*
   * Start the actual AI clinical interview.
   */
  const handleStartInterview = () => {
    if (hasStartedRef.current) return;

    if (!selectedMode) return;

    hasStartedRef.current = true;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setSpeakingMode(null);
    setReadyToStart(false);

    onUpdate?.({
      language: selectedLanguage,
      consultationType: selectedMode,
      interviewStatus: "in_progress",
      startedAt: new Date().toISOString(),
    });

    onStart?.({
      language: selectedLanguage,
      consultationType: selectedMode,
      patient: {
        name: "Registered Patient",
        age: "",
        gender: "",
        phone: "",
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Stethoscope size={20} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                MediKiosk
              </p>

              <p className="text-xs text-slate-500">
                AI Clinical History
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <ShieldCheck size={15} />
            Secure Session
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <Check size={16} />
              </div>

              <span className="font-semibold">
                Welcome
              </span>
            </div>

            <div className="h-px w-16 bg-blue-200" />

            <div className="flex items-center gap-2 text-blue-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white font-bold">
                2
              </div>

              <span className="font-semibold">
                Consultation
              </span>
            </div>

            <div className="h-px w-16 bg-slate-200" />

            <div className="flex items-center gap-2 text-slate-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white">
                3
              </div>

              <span>AI Interview</span>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.85fr]">
          {/* Left */}
          <section>
            <div className="mb-9">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Sparkles size={14} />
                Consultation setup
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Choose your consultation
              </h1>

              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                MediKiosk will guide you through your medical history
                using a simple voice conversation.
              </p>
            </div>

            {/* Consultation choices */}
            <div>
              <div className="mb-5">
                <h2 className="font-bold text-slate-900">
                  How would you like to proceed?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Listen to the options and select the consultation
                  type you prefer.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {CONSULTATION_TYPES.map((type) => {
                  const Icon = type.icon;

                  const isSelected =
                    selectedMode === type.id;

                  const isCurrentlySpeaking =
                    isSpeaking &&
                    speakingMode === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        handleModeChange(type.id)
                      }
                      className={[
                        "relative min-h-[190px] overflow-hidden rounded-3xl border-2 p-6 text-left transition-all duration-300",
                        isCurrentlySpeaking
                          ? "border-emerald-400 bg-emerald-50 shadow-xl shadow-emerald-200/60"
                          : isSelected
                            ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
                            : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg",
                      ].join(" ")}
                    >
                      {/* Speaking indicator */}
                      {isCurrentlySpeaking && (
                        <div className="absolute right-5 top-5 flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                          </span>

                          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            Speaking
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div
                        className={[
                          "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                          isCurrentlySpeaking
                            ? "bg-emerald-500 text-white"
                            : isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600",
                        ].join(" ")}
                      >
                        <Icon size={25} />
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xl font-bold text-slate-900">
                            {type.title}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {type.description}
                          </p>
                        </div>

                        {isSelected &&
                          !isCurrentlySpeaking && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check size={15} />
                            </div>
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Mic size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Voice-guided selection
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      MediKiosk is speaking in your selected language.
                    </p>
                  </div>
                </div>
              </div>

              {introComplete && !selectedMode && (
                <p className="mt-4 text-sm font-semibold text-blue-600">
                  Please select Allopathic or AYUSH to continue.
                </p>
              )}
            </div>
          </section>

          {/* Right */}
          <aside>
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              {/* Microphone status */}
              <div
                className={[
                  "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
                  readyToStart
                    ? "bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-200/60"
                    : "bg-blue-50 text-blue-600",
                ].join(" ")}
              >
                <Mic size={30} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Ready to begin?
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Choose the type of consultation you want. MediKiosk
                will then start the voice-based clinical interview.
              </p>

              {/* Steps */}
              <div className="my-7 space-y-4">
                {[
                  "Choose Allopathic or AYUSH",
                  "Speak naturally with MediKiosk",
                  "Answer relevant follow-up questions",
                  "Receive a structured clinical summary",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {/* Selected mode */}
              <div className="mb-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Selected consultation
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p
                    className={`font-bold ${
                      selectedMode
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {selectedMode || "Choose an option"}
                  </p>

                  {selectedMode && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              </div>

              {/* Start */}
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={!selectedMode}
                className={[
                  "group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-5 py-4 text-base font-bold text-white transition-all duration-300 active:scale-[0.99]",
                  selectedMode
                    ? readyToStart
                      ? "animate-pulse bg-emerald-500 shadow-xl shadow-emerald-400/50 hover:bg-emerald-600"
                      : "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                    : "cursor-not-allowed bg-slate-300 shadow-none",
                ].join(" ")}
              >
                {selectedMode && readyToStart && (
                  <span className="absolute inset-0 rounded-2xl ring-4 ring-emerald-300/30" />
                )}

                <Mic
                  size={21}
                  className="relative z-10"
                />

                <span className="relative z-10">
                  Start voice consultation
                </span>

                <ChevronRight
                  size={20}
                  className={[
                    "relative z-10",
                    selectedMode
                      ? "transition-transform group-hover:translate-x-1"
                      : "",
                  ].join(" ")}
                />
              </button>

              {/* Green button instruction */}
              {readyToStart && selectedMode && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                  <p className="text-sm font-bold text-emerald-700">
                    Click the glowing green button to start
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} />
                Secure voice-based consultation
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ConsultationScreen;