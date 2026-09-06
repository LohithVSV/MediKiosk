import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  HeartPulse,
  Languages,
  Mic,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

const LANGUAGES = [
  {
    name: "English",
    code: "en-IN",
    greeting:
      "Hello. Welcome to MediKiosk. I will ask you a few simple questions about your health before your consultation. Please choose your preferred language after listening to all the options.",
  },
  {
    name: "Hindi",
    code: "hi-IN",
    greeting:
      "नमस्ते। MediKiosk में आपका स्वागत है। आपकी consultation से पहले मैं आपके स्वास्थ्य के बारे में कुछ आसान सवाल पूछूंगा। सभी भाषाओं को सुनने के बाद अपनी पसंदीदा भाषा चुनें।",
  },
  {
    name: "Telugu",
    code: "te-IN",
    greeting:
      "నమస్కారం. MediKiosk కి స్వాగతం. మీ consultation కి ముందు మీ ఆరోగ్యం గురించి కొన్ని సులభమైన ప్రశ్నలు అడుగుతాను. అన్ని భాషలను విన్న తర్వాత మీకు నచ్చిన భాషను ఎంచుకోండి.",
  },
];

export default function WelcomeScreen({
  onStart,
  startInterview,
  patientData = {},
}) {
  const [activeLanguage, setActiveLanguage] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(
    patientData?.language || ""
  );
  const [isCycling, setIsCycling] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cycleRef = useRef(true);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    cycleRef.current = true;

    const startTimer = setTimeout(() => {
      if (!mountedRef.current || !cycleRef.current || startedRef.current) {
        return;
      }

      startedRef.current = true;

      playLanguage(0);
    }, 500);

    return () => {
      mountedRef.current = false;
      cycleRef.current = false;
      clearTimeout(startTimer);

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playLanguage = (index) => {
    if (!mountedRef.current || !cycleRef.current) {
      return;
    }

    const language = LANGUAGES[index];

    if (!language) {
      setIsSpeaking(false);
      setIsCycling(false);
      return;
    }

    setActiveLanguage(index);
    setIsSpeaking(false);

    const speak = () => {
      if (!mountedRef.current || !cycleRef.current) {
        return;
      }

      if (!window.speechSynthesis) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(language.greeting);

      utterance.lang = language.code;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();

      const matchingVoice =
        voices.find(
          (voice) =>
            voice.lang?.toLowerCase() === language.code.toLowerCase()
        ) ||
        voices.find((voice) =>
          voice.lang?.toLowerCase().startsWith(language.code.slice(0, 2))
        );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        if (!mountedRef.current || !cycleRef.current) {
          return;
        }

        setIsSpeaking(true);
      };

      utterance.onend = () => {
        if (!mountedRef.current || !cycleRef.current) {
          return;
        }

        // Green light goes OFF as soon as this language finishes.
        setIsSpeaking(false);

        if (index < LANGUAGES.length - 1) {
          setTimeout(() => {
            if (!mountedRef.current || !cycleRef.current) {
              return;
            }

            playLanguage(index + 1);
          }, 800);
        } else {
          setTimeout(() => {
            if (!mountedRef.current || !cycleRef.current) {
              return;
            }

            setIsCycling(false);
            setIsSpeaking(false);
          }, 800);
        }
      };

      utterance.onerror = (event) => {
        if (!mountedRef.current || !cycleRef.current) {
          return;
        }

        // Ignore cancellation/interruption errors.
        if (
          event?.error === "canceled" ||
          event?.error === "interrupted"
        ) {
          return;
        }

        setIsSpeaking(false);

        // Continue the language cycle even if the browser voice engine
        // reports an error.
        if (index < LANGUAGES.length - 1) {
          setTimeout(() => {
            if (!mountedRef.current || !cycleRef.current) {
              return;
            }

            playLanguage(index + 1);
          }, 800);
        } else {
          setIsCycling(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    // Give the browser time to finish loading available voices.
    if (window.speechSynthesis.getVoices().length === 0) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );

        speak();
      };

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        handleVoicesChanged
      );

      setTimeout(() => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );

        if (mountedRef.current && cycleRef.current) {
          speak();
        }
      }, 700);
    } else {
      speak();
    }
  };

  const handleLanguageSelect = (languageName) => {
    cycleRef.current = false;
    setIsCycling(false);
    setIsSpeaking(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSelectedLanguage(languageName);

    const selected = LANGUAGES.find(
      (language) => language.name === languageName
    );

    if (selected) {
      const utterance = new SpeechSynthesisUtterance(selected.greeting);

      utterance.lang = selected.code;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();

      const matchingVoice =
        voices.find(
          (voice) =>
            voice.lang?.toLowerCase() === selected.code.toLowerCase()
        ) ||
        voices.find((voice) =>
          voice.lang?.toLowerCase().startsWith(selected.code.slice(0, 2))
        );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStart = () => {
    cycleRef.current = false;
    setIsCycling(false);
    setIsSpeaking(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (typeof onStart === "function") {
      onStart(selectedLanguage);
      return;
    }

    if (typeof startInterview === "function") {
      startInterview(selectedLanguage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Stethoscope size={23} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                MediKiosk
              </h1>

              <p className="text-[11px] font-medium text-slate-500">
                AI-assisted clinical history
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">
            <ShieldCheck size={15} className="text-emerald-600" />

            <span className="text-xs font-semibold text-emerald-700">
              Private &amp; secure
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Left */}
          <section className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-2">
              <Sparkles size={15} className="text-sky-600" />

              <span className="text-xs font-bold uppercase tracking-wide text-sky-700">
                AI clinical assistant
              </span>
            </div>

            <h2 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Your story matters.
              <span className="block text-sky-600">
                Tell us what brought you here.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              MediKiosk will guide you through a short conversation about
              your symptoms, medical history, medicines and other relevant
              details before your consultation.
            </p>

            {/* Trust points */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <TrustPoint
                icon={<Mic size={17} />}
                title="Voice first"
                text="Speak naturally"
              />

              <TrustPoint
                icon={<Brain size={17} />}
                title="Adaptive"
                text="Follow-up questions"
              />

              <TrustPoint
                icon={<HeartPulse size={17} />}
                title="Clinical"
                text="Doctor-ready history"
              />
            </div>

            {/* Language selection */}
            <div className="mt-9">
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-800">
                  Choose your language
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Listen to each option, then select the language you prefer.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {LANGUAGES.map((language, index) => {
                  const isActive =
                    isCycling &&
                    isSpeaking &&
                    activeLanguage === index;

                  const isSelected =
                    !isCycling && selectedLanguage === language.name;

                  return (
                    <button
                      key={language.name}
                      type="button"
                      onClick={() =>
                        handleLanguageSelect(language.name)
                      }
                      className={[
                        "relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                        isActive
                          ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-200/60"
                          : isSelected
                            ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-200/40"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md",
                      ].join(" ")}
                    >
                      {isActive && (
                        <div className="absolute right-3 top-3 flex items-center gap-1.5">
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                          </span>

                          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            Speaking
                          </span>
                        </div>
                      )}

                      <div
                        className={[
                          "mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                          isActive || isSelected
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-sky-50 text-sky-600",
                        ].join(" ")}
                      >
                        <Languages size={19} />
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        {language.name}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        {language.name === "English"
                          ? "English"
                          : language.name === "Hindi"
                            ? "हिन्दी"
                            : "తెలుగు"}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Start button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!selectedLanguage}
                  className={[
                    "group inline-flex w-full items-center justify-center gap-3 rounded-2xl px-7 py-4 text-base font-bold shadow-lg transition duration-200 sm:w-auto",
                    selectedLanguage
                      ? "bg-emerald-600 text-white shadow-emerald-600/20 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl"
                      : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      selectedLanguage
                        ? "bg-white/15"
                        : "bg-slate-300",
                    ].join(" ")}
                  >
                    <Mic size={17} />
                  </span>

                  Start consultation

                  <ArrowRight
                    size={18}
                    className={
                      selectedLanguage
                        ? "transition-transform duration-200 group-hover:translate-x-1"
                        : ""
                    }
                  />
                </button>

                <p className="mt-3 text-xs text-slate-400">
                  You can also type your answers if you prefer.
                </p>
              </div>
            </div>
          </section>

          {/* Right — consultation preview */}
          <section className="relative">
            <div className="mx-auto max-w-lg">
              {/* Main preview card */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                {/* Card header */}
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <Stethoscope size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          New consultation
                        </p>

                        <p className="text-xs text-slate-500">
                          MediKiosk interview
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Ready
                    </span>
                  </div>
                </div>

                {/* Conversation preview */}
                <div className="space-y-5 bg-slate-50/70 p-6">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      <Sparkles size={16} />
                    </div>

                    <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-sky-600">
                        MediKiosk AI
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        Hello. I&apos;ll ask a few questions to understand
                        what you&apos;re experiencing. What brings you in
                        today?
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-slate-900 px-4 py-3 text-white shadow-sm">
                      <p className="text-sm leading-6">
                        I&apos;ve been having a headache since yesterday.
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <UserRound size={16} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      <Brain size={16} />
                    </div>

                    <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-sky-600">
                        Adaptive follow-up
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        I understand. Can you tell me where the headache is
                        located and how severe it feels?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom status */}
                <div className="border-t border-slate-100 bg-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "h-2 w-2 rounded-full transition-all duration-300",
                          isSpeaking
                            ? "animate-pulse bg-emerald-500"
                            : "bg-slate-300",
                        ].join(" ")}
                      />

                      <span className="text-xs font-semibold text-slate-500">
                        {isSpeaking
                          ? "MediKiosk is speaking"
                          : selectedLanguage
                            ? "Language selected"
                            : "Choose your language"}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      Voice + text
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating info cards */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniFeature
                  icon={<Languages size={17} />}
                  title="Multiple languages"
                  text="Patient-friendly interaction"
                />

                <MiniFeature
                  icon={<CheckCircle2 size={17} />}
                  title="Structured history"
                  text="Ready for clinician review"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4 text-center text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
          <p>
            MediKiosk assists with clinical history collection.
          </p>

          <p>
            AI output should always be reviewed by a qualified clinician.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TrustPoint({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
        {icon}
      </div>

      <p className="text-sm font-bold text-slate-800">
        {title}
      </p>

      <p className="mt-0.5 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function MiniFeature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>

        <p className="text-xs font-bold text-slate-800">
          {title}
        </p>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}