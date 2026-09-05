import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileCheck2,
  Languages,
  Mic,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Volume2,
} from "lucide-react";

const LANGUAGES = [
  {
    id: "English",
    label: "English",
    native: "English",
    greeting: "Hello. I am MediKiosk, your AI clinical assistant.",
  },
  {
    id: "Hindi",
    label: "Hindi",
    native: "हिंदी",
    greeting: "नमस्ते। मैं MediKiosk, आपका AI स्वास्थ्य सहायक हूँ।",
  },
  {
    id: "Telugu",
    label: "Telugu",
    native: "తెలుగు",
    greeting: "నమస్కారం. నేను MediKiosk, మీ AI ఆరోగ్య సహాయకుడిని.",
  },
  {
    id: "Tamil",
    label: "Tamil",
    native: "தமிழ்",
    greeting: "வணக்கம். நான் MediKiosk, உங்கள் AI சுகாதார உதவியாளர்.",
  },
];

const CONSULTATION_TYPES = [
  {
    id: "Allopathic",
    title: "Allopathic",
    description: "Modern clinical history",
    icon: Stethoscope,
  },
  {
    id: "AYUSH",
    title: "AYUSH",
    description: "Traditional health assessment",
    icon: Sparkles,
  },
];

function ConsultationScreen({
  patientData,
  onUpdate,
  onStart,
  onBack,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    patientData?.language || "English"
  );

  const [selectedMode, setSelectedMode] = useState(
    patientData?.consultationType || "Allopathic"
  );

  const [isSpeaking, setIsSpeaking] = useState(false);

  const hasStartedRef = useRef(false);

  const selectedLanguageData =
    LANGUAGES.find((language) => language.id === selectedLanguage) ||
    LANGUAGES[0];

  useEffect(() => {
    if (patientData?.language) {
      setSelectedLanguage(patientData.language);
    }

    if (patientData?.consultationType) {
      setSelectedMode(patientData.consultationType);
    }
  }, [patientData?.language, patientData?.consultationType]);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const languageMap = {
      English: "en-IN",
      Hindi: "hi-IN",
      Telugu: "te-IN",
      Tamil: "ta-IN",
    };

    utterance.lang = languageMap[selectedLanguage] || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);

    onUpdate?.({
      language,
    });
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);

    onUpdate?.({
      consultationType: mode,
    });
  };

  const handleStartInterview = () => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

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

  const handleHearIntro = () => {
    const introByLanguage = {
      English:
        "Your medical record has been loaded securely. You do not need to type anything. I will ask you questions by voice. Please answer naturally in your own words. If I need more information, I will ask a follow-up question.",
      Hindi:
        "आपका मेडिकल रिकॉर्ड सुरक्षित रूप से लोड हो गया है। आपको कुछ भी टाइप करने की जरूरत नहीं है। मैं आपसे आवाज़ में सवाल पूछूँगा। कृपया अपने शब्दों में सामान्य रूप से जवाब दें। अगर मुझे और जानकारी चाहिए होगी, तो मैं आपसे आगे का सवाल पूछूँगा।",
      Telugu:
        "మీ వైద్య రికార్డు సురక్షితంగా లోడ్ చేయబడింది. మీరు ఏమీ టైప్ చేయాల్సిన అవసరం లేదు. నేను మీతో వాయిస్ ద్వారా ప్రశ్నలు అడుగుతాను. దయచేసి మీకు అనిపించిన విధంగా సహజంగా సమాధానం చెప్పండి. మరింత సమాచారం అవసరమైతే నేను తదుపరి ప్రశ్న అడుగుతాను.",
      Tamil:
        "உங்கள் மருத்துவப் பதிவு பாதுகாப்பாக ஏற்றப்பட்டுள்ளது. நீங்கள் எதையும் தட்டச்சு செய்ய வேண்டியதில்லை. நான் குரல் மூலம் உங்களிடம் கேள்விகள் கேட்பேன். உங்கள் சொந்த வார்த்தைகளில் இயல்பாக பதிலளிக்கவும். மேலும் தகவல் தேவைப்பட்டால், அடுத்த கேள்வியை நான் கேட்பேன்.",
    };

    speak(
      introByLanguage[selectedLanguage] ||
        introByLanguage.English
    );
  };

  const languageCode = {
    English: "en-IN",
    Hindi: "hi-IN",
    Telugu: "te-IN",
    Tamil: "ta-IN",
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
              <span className="font-semibold">Welcome</span>
            </div>

            <div className="h-px w-16 bg-blue-200" />

            <div className="flex items-center gap-2 text-blue-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white font-bold">
                2
              </div>
              <span className="font-semibold">Setup</span>
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

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Left */}
          <section>
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Sparkles size={14} />
                AI consultation setup
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Let&apos;s prepare your consultation
              </h1>

              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                Your registered medical record is already available.
                You do not need to enter your name, age, or other
                basic details again.
              </p>
            </div>

            {/* Record loaded */}
            <div className="mb-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <FileCheck2 size={22} />
                </div>

                <div>
                  <p className="font-bold text-emerald-900">
                    Patient record loaded
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Your existing registration and medical information
                    can be used to avoid asking repetitive questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Languages size={20} className="text-blue-600" />
                <div>
                  <h2 className="font-bold text-slate-900">
                    Choose your language
                  </h2>
                  <p className="text-sm text-slate-500">
                    MediKiosk will speak and display the interview in
                    this language.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {LANGUAGES.map((language) => {
                  const isSelected =
                    selectedLanguage === language.id;

                  return (
                    <button
                      key={language.id}
                      type="button"
                      onClick={() =>
                        handleLanguageChange(language.id)
                      }
                      className={`relative rounded-2xl border-2 p-4 text-left transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check size={12} />
                        </div>
                      )}

                      <p
                        className={`font-bold ${
                          isSelected
                            ? "text-blue-700"
                            : "text-slate-800"
                        }`}
                      >
                        {language.native}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {language.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Consultation mode */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="font-bold text-slate-900">
                  Consultation type
                </h2>
                <p className="text-sm text-slate-500">
                  Choose the clinical framework for your consultation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {CONSULTATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedMode === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        handleModeChange(type.id)
                      }
                      className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={22} />
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-slate-900">
                          {type.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {type.description}
                        </p>
                      </div>

                      {isSelected && (
                        <Check
                          size={20}
                          className="text-blue-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice-first message */}
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Mic size={21} />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    Voice-first consultation
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Once you start, MediKiosk will speak to you and
                    listen to your answers. You can simply talk
                    naturally.
                  </p>

                  <button
                    type="button"
                    onClick={handleHearIntro}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    <Volume2 size={17} />
                    {isSpeaking ? "Speaking..." : "Hear how it works"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Right */}
          <aside>
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Mic size={30} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Ready to talk?
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                You won't need to fill out a long form. MediKiosk
                will guide you through the consultation using a
                natural voice conversation.
              </p>

              <div className="my-6 space-y-4">
                {[
                  "AI asks the first question automatically",
                  "Speak naturally in your chosen language",
                  "AI asks relevant follow-up questions",
                  "Your answers become a doctor-ready summary",
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

              <div className="mb-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Selected language
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="font-bold text-slate-900">
                    {selectedLanguageData.native}
                  </p>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {languageCode[selectedLanguage] || "en-IN"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartInterview}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl active:scale-[0.99]"
              >
                <Mic size={21} />
                Start voice consultation
                <ChevronRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} />
                Your consultation is handled securely
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ConsultationScreen;
