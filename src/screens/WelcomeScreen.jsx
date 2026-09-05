import React from 'react';
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
} from 'lucide-react';

export default function WelcomeScreen({
  onStart,
  startInterview,
  patientData = {},
}) {
  const handleStart = () => {
    if (typeof onStart === 'function') {
      onStart();
      return;
    }

    if (typeof startInterview === 'function') {
      startInterview();
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
          {/* Left — introduction */}
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

            {/* Start button */}
            <div className="mt-9">
              <button
                type="button"
                onClick={handleStart}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-7 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl sm:w-auto"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Mic size={17} />
                </span>

                Start consultation

                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>

              <p className="mt-3 text-xs text-slate-400">
                You can also type your answers if you prefer.
              </p>
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
                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-slate-500">
                        Ready to listen
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

      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-0.5 text-xs leading-5 text-slate-500">{text}</p>
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

        <p className="text-xs font-bold text-slate-800">{title}</p>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-slate-500">{text}</p>
    </div>
  );
}