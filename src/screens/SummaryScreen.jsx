import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  History,
  Info,
  Pill,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

const SECTION_ICONS = {
  "Chief Complaint": HeartPulse,
  "History of Present Illness": History,
  "Associated Symptoms": Sparkles,
  "Relevant Negatives": CheckCircle2,
  "Past Medical History": History,
  Medications: Pill,
  Allergies: ShieldAlert,
  "Family History": UserRound,
  Lifestyle: HeartPulse,
};

function cleanAnswer(answer) {
  if (!answer) return "";

  return String(answer)
    .replace(/\s+/g, " ")
    .trim();
}

function getAnswers(patientData) {
  const history = patientData?.interviewHistory || [];

  if (history.length > 0) {
    return history
      .map((item) => ({
        question: cleanAnswer(item.question),
        answer: cleanAnswer(item.answer),
      }))
      .filter((item) => item.answer);
  }

  const answers = patientData?.answers || {};

  return Object.values(answers)
    .map((item) => ({
      question: cleanAnswer(item?.question),
      answer: cleanAnswer(item?.answer),
    }))
    .filter((item) => item.answer);
}

function findAnswer(answers, keywords) {
  const item = answers.find((entry) =>
    keywords.some((keyword) =>
      entry.question
        .toLowerCase()
        .includes(keyword.toLowerCase())
    )
  );

  return item?.answer || "";
}

function buildClinicalSummary(patientData, answers) {
  const context = patientData?.clinicalContext || {};

  const chiefComplaint =
    context.chiefComplaint ||
    answers[0]?.answer ||
    "Not clearly documented";

  const duration =
    context.duration ||
    findAnswer(answers, [
      "when did",
      "started",
      "begin",
      "कब शुरू",
      "ఎప్పుడు ప్రారంభ",
      "எப்போது தொடங்க",
    ]);

  const severity =
    context.severity ||
    findAnswer(answers, [
      "severity",
      "0 to 10",
      "0 से 10",
      "0 నుండి 10",
      "0 முதல் 10",
    ]);

  const progression =
    context.progression ||
    findAnswer(answers, [
      "better",
      "worse",
      "same",
      "बेहतर",
      "बढ़",
      "घट",
      "తగ్గ",
      "పెరుగ",
      "குறைகிற",
      "அதிகரிக்க",
    ]);

  const associated = answers
    .filter(
      (entry) =>
        entry.question
          .toLowerCase()
          .includes("other symptoms") ||
        entry.question.includes("अन्य लक्षण") ||
        entry.question.includes("ఇతర లక్షణ") ||
        entry.question.includes("வேறு ஏதேனும் அறிகுற")
    )
    .map((entry) => entry.answer);

  return {
    chiefComplaint,
    duration,
    severity,
    progression,
    associatedSymptoms:
      associated.length > 0
        ? associated.join(" ")
        : "No additional associated symptoms documented.",
  };
}

function SummarySection({
  title,
  content,
  icon: Icon,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>
      </div>

      <p className="text-sm leading-7 text-slate-600">
        {content || "Not documented during this interview."}
      </p>
    </section>
  );
}

function SummaryScreen({
  patientData,
  onContinue,
  onBack,
  onNewConsultation,
}) {
  const answers = useMemo(
    () => getAnswers(patientData),
    [patientData]
  );

  const clinicalSummary = useMemo(
    () =>
      buildClinicalSummary(
        patientData,
        answers
      ),
    [patientData, answers]
  );

  const redFlags = patientData?.redFlags || [];

  const patientName =
    patientData?.patient?.name ||
    "Registered Patient";

  const consultationType =
    patientData?.consultationType ||
    "Allopathic";

  const language =
    patientData?.language ||
    "English";

  const sessionId =
    patientData?.sessionId ||
    "MK-SESSION";

  const interviewDuration = useMemo(() => {
    if (
      !patientData?.startedAt ||
      !patientData?.completedAt
    ) {
      return "Completed";
    }

    const start = new Date(
      patientData.startedAt
    ).getTime();

    const end = new Date(
      patientData.completedAt
    ).getTime();

    const seconds = Math.max(
      0,
      Math.round((end - start) / 1000)
    );

    if (seconds < 60) {
      return `${seconds}s`;
    }

    return `${Math.floor(seconds / 60)}m ${
      seconds % 60
    }s`;
  }, [
    patientData?.startedAt,
    patientData?.completedAt,
  ]);

  const priority =
    patientData?.priority ||
    (redFlags.length > 0
      ? "review"
      : "routine");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Stethoscope size={22} />
            </div>

            <div>
              <p className="font-bold text-slate-900">
                MediKiosk
              </p>
              <p className="text-xs text-slate-500">
                Clinical Summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 sm:block">
              {consultationType}
            </div>

            <div className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              Interview complete
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Top actions */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
          >
            <ArrowLeft size={18} />
            Back to interview
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 shadow-sm">
              Session:{" "}
              <span className="text-slate-800">
                {sessionId}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <Sparkles size={14} />
            AI-generated clinical history
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Patient Summary
          </h1>

          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            MediKiosk has converted the patient&apos;s
            conversation into a structured clinical history
            for clinician review.
          </p>
        </div>

        {/* Patient overview */}
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UserRound size={30} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Patient
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {patientName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Existing hospital record • {language} •{" "}
                  {consultationType}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoCard
                label="Questions"
                value={
                  patientData?.answeredCount ||
                  answers.length
                }
              />

              <InfoCard
                label="Duration"
                value={interviewDuration}
              />

              <InfoCard
                label="Priority"
                value={
                  priority === "review"
                    ? "Review"
                    : "Routine"
                }
                danger={priority === "review"}
              />
            </div>
          </div>
        </section>

        {/* Clinical concern */}
        {redFlags.length > 0 ? (
          <section className="mb-6 rounded-3xl border border-amber-300 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle size={23} />
              </div>

              <div className="flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-amber-950">
                      Potential clinical concerns detected
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      These findings are based on the patient&apos;s
                      reported answers and require clinician review.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">
                    Review required
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {redFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="rounded-2xl border border-amber-200 bg-white/70 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          size={17}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <p className="text-sm font-semibold leading-6 text-amber-950">
                          {flag.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-amber-800">
                  <Info
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    This is a screening flag, not a diagnosis.
                    The treating clinician should independently
                    assess the patient.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={22}
                className="text-emerald-600"
              />

              <div>
                <p className="font-bold text-emerald-900">
                  No automated clinical concern flags detected
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  This does not rule out illness. Continue with
                  normal clinician assessment.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Main summary grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {/* Chief complaint */}
            <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <HeartPulse size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                    Chief complaint
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-blue-950">
                    {clinicalSummary.chiefComplaint}
                  </h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MiniClinicalCard
                  label="Duration"
                  value={
                    clinicalSummary.duration ||
                    "Not documented"
                  }
                />

                <MiniClinicalCard
                  label="Severity"
                  value={
                    clinicalSummary.severity ||
                    "Not documented"
                  }
                />

                <MiniClinicalCard
                  label="Progression"
                  value={
                    clinicalSummary.progression ||
                    "Not documented"
                  }
                />
              </div>
            </section>

            {/* HPI */}
            <SummarySection
              title="History of Present Illness"
              icon={History}
              content={
                answers.length > 0
                  ? answers
                      .slice(0, 7)
                      .map(
                        (item) =>
                          `${item.question}: ${item.answer}`
                      )
                      .join(" ")
                  : "No interview responses were recorded."
              }
            />

            <SummarySection
              title="Associated Symptoms"
              icon={Sparkles}
              content={
                clinicalSummary.associatedSymptoms
              }
            />

            {/* Relevant negatives */}
            <SummarySection
              title="Relevant Negatives"
              icon={CheckCircle2}
              content={
                "Negative findings should be confirmed and interpreted by the clinician from the complete interview record."
              }
            />

            <SummarySection
              title="Past Medical History"
              icon={History}
              content="Existing medical history can be reviewed from the patient record. No additional past medical history was specifically captured in this interview."
            />

            <SummarySection
              title="Medications"
              icon={Pill}
              content="Medication information should be verified against the patient's existing medical record and current medication list."
            />

            <SummarySection
              title="Allergies"
              icon={ShieldAlert}
              content="Allergy information should be verified against the patient's existing medical record."
            />

            <SummarySection
              title="Family History"
              icon={UserRound}
              content="No additional family history was specifically captured during this interview."
            />

            <SummarySection
              title="Lifestyle"
              icon={HeartPulse}
              content="Lifestyle and social history should be confirmed by the clinician where clinically relevant."
            />
          </div>

          {/* Right column */}
          <aside className="space-y-5">
            {/* AI synthesis */}
            <section className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Sparkles size={21} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    AI Clinical Synthesis
                  </p>

                  <p className="text-xs text-slate-500">
                    Conversation-based overview
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  The patient reported{" "}
                  <strong>
                    {clinicalSummary.chiefComplaint}
                  </strong>
                  {clinicalSummary.duration
                    ? `, beginning ${clinicalSummary.duration}.`
                    : "."}{" "}
                  {clinicalSummary.severity
                    ? `Reported severity: ${clinicalSummary.severity}.`
                    : ""}{" "}
                  {clinicalSummary.progression
                    ? `The reported progression was ${clinicalSummary.progression}.`
                    : ""}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-xs leading-5 text-blue-800">
                    This synthesis summarizes reported information.
                    It is not a diagnosis or treatment recommendation.
                  </p>
                </div>
              </div>
            </section>

            {/* Doctor review */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ClipboardCheck size={21} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Ready for clinician review
                  </p>

                  <p className="text-xs text-slate-500">
                    Final clinical decisions remain with the doctor.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ReviewPoint
                  complete={answers.length > 0}
                  text="Patient interview captured"
                />

                <ReviewPoint
                  complete={true}
                  text="Structured history generated"
                />

                <ReviewPoint
                  complete={redFlags.length > 0}
                  warning={redFlags.length > 0}
                  text={
                    redFlags.length > 0
                      ? "Potential concerns require review"
                      : "No automated concern flags"
                  }
                />
              </div>
            </section>

            {/* Interview transcript */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <FileText
                  size={20}
                  className="text-slate-600"
                />

                <div>
                  <p className="font-bold text-slate-900">
                    Interview record
                  </p>

                  <p className="text-xs text-slate-500">
                    {answers.length} recorded responses
                  </p>
                </div>
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {answers.length > 0 ? (
                  answers.map((item, index) => (
                    <div
                      key={`${item.question}-${index}`}
                      className="rounded-xl bg-slate-50 p-3"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Q{index + 1}
                      </p>

                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
                        {item.question}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.answer}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No interview responses available.
                  </p>
                )}
              </div>
            </section>

            {/* Disclaimer */}
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
              <div className="flex items-start gap-2">
                <ShieldAlert
                  size={16}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <p className="text-[11px] leading-5 text-slate-500">
                  AI-generated content is provided as a clinical
                  documentation aid only. It must be reviewed by a
                  qualified healthcare professional before use in
                  patient care.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onNewConsultation}
            className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-white"
          >
            Start new consultation
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <ClipboardCheck size={19} />
            Continue to doctor review
          </button>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  label,
  value,
  danger = false,
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        danger
          ? "bg-amber-50"
          : "bg-slate-50"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-bold ${
          danger
            ? "text-amber-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniClinicalCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ReviewPoint({
  complete,
  warning,
  text,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          warning
            ? "bg-amber-100 text-amber-600"
            : complete
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-200 text-slate-400"
        }`}
      >
        {warning ? (
          <AlertTriangle size={14} />
        ) : (
          <CheckCircle2 size={14} />
        )}
      </div>

      <p className="text-xs font-semibold text-slate-700">
        {text}
      </p>
    </div>
  );
}

export default SummaryScreen;