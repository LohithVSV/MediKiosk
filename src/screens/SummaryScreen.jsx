import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  HeartPulse,
  History,
  Info,
  Pill,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserRound,
  Thermometer,
  Weight,
  Droplets,
  Cigarette,
  Wine,
  Users,
  Printer,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

function cleanAnswer(answer) {
  if (answer === null || answer === undefined) return "";

  return String(answer)
    .replace(/\s+/g, " ")
    .trim();
}

function getAnswers(patientData) {
  const history = patientData?.interviewHistory || [];

  if (history.length > 0) {
    return history
      .map((item) => ({
        question: cleanAnswer(item?.question),
        answer: cleanAnswer(item?.answer),
      }))
      .filter((item) => item.question && item.answer);
  }

  const answers = patientData?.answers || {};

  return Object.values(answers)
    .map((item) => ({
      question: cleanAnswer(item?.question),
      answer: cleanAnswer(item?.answer),
    }))
    .filter((item) => item.question && item.answer);
}

function matchesQuestion(question, keywords) {
  const text = cleanAnswer(question).toLowerCase();

  return keywords.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
}

function findAnswer(answers, keywords) {
  const item = answers.find((entry) =>
    matchesQuestion(entry.question, keywords)
  );

  return item?.answer || "";
}

function findAllAnswers(answers, keywords) {
  return answers
    .filter((entry) =>
      matchesQuestion(entry.question, keywords)
    )
    .map((entry) => entry.answer)
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   CLINICAL DATA EXTRACTION
========================================================= */

function buildClinicalData(patientData, answers) {
  const context = patientData?.clinicalContext || {};
  const patient = patientData?.patient || {};

  const chiefComplaint =
    context.chiefComplaint ||
    patientData?.chiefComplaint ||
    answers[0]?.answer ||
    "Not clearly documented";

  const duration =
    context.duration ||
    patientData?.duration ||
    findAnswer(answers, [
      "when did",
      "how long",
      "started",
      "start",
      "since when",
      "duration",
      "कब शुरू",
      "कितने समय",
      "ఎప్పుడు ప్రారంభ",
      "ఎంతకాలం",
      "எப்போது தொடங்க",
      "எவ்வளவு நாட்களாக",
    ]);

  const severity =
    context.severity ||
    patientData?.severity ||
    findAnswer(answers, [
      "severity",
      "how severe",
      "pain level",
      "0 to 10",
      "0 से 10",
      "0 నుండి 10",
      "0 முதல் 10",
    ]);

  const progression =
    context.progression ||
    patientData?.progression ||
    findAnswer(answers, [
      "better",
      "worse",
      "getting worse",
      "getting better",
      "same",
      "changed",
      "progress",
      "बेहतर",
      "बढ़",
      "घट",
      "తగ్గ",
      "పెరుగ",
      "குறைகிற",
      "அதிகரிக்க",
    ]);

  const location =
    context.location ||
    findAnswer(answers, [
      "where is",
      "where does",
      "location",
      "which part",
      "pain located",
      "कहां",
      "कहाँ",
      "किस जगह",
      "ఎక్కడ",
      "ఏ ప్రాంతం",
      "எங்கே",
      "எந்த பகுதியில்",
    ]);

  const character =
    context.character ||
    findAnswer(answers, [
      "what does the pain feel",
      "type of pain",
      "kind of pain",
      "describe the pain",
      "burning",
      "sharp",
      "dull",
      "throbbing",
      "pain feel",
      "दर्द कैसा",
      "నొప్పి ఎలా",
      "வலி எப்படி",
    ]);

  const radiation =
    context.radiation ||
    findAnswer(answers, [
      "spread",
      "spreads",
      "move to another",
      "moves to another",
      "radiat",
      "another area",
      "दूसरी जगह",
      "फैल",
      "మరొక ప్రాంత",
      "వెళ్తుందా",
      "வேறு இடத்திற்கு",
      "பரவ",
    ]);

  const associatedSymptoms = unique(
    findAllAnswers(answers, [
      "other symptoms",
      "associated symptoms",
      "anything else",
      "any other",
      "अन्य लक्षण",
      "कोई और लक्षण",
      "ఇతర లక్షణ",
      "వేరే లక్షణ",
      "வேறு ஏதேனும் அறிகுற",
      "மற்ற அறிகுற",
    ])
  );

  const pastMedicalHistory = unique(
    findAllAnswers(answers, [
      "medical history",
      "past history",
      "previous illness",
      "previous disease",
      "any disease",
      "diabetes",
      "hypertension",
      "blood pressure",
      "asthma",
      "heart disease",
      "kidney",
      "liver",
      "मेडिकल हिस्ट्री",
      "पहले कोई बीमारी",
      "पुरानी बीमारी",
      "వైద్య చరిత్ర",
      "మునుపటి వ్యాధి",
      "பழைய மருத்துவ",
      "முன்னர் நோய்",
    ])
  );

  const medications = unique(
    findAllAnswers(answers, [
      "medication",
      "medicines",
      "medicine",
      "taking any",
      "currently taking",
      "tablets",
      "drugs",
      "दवा",
      "दवाइयां",
      "दवाएं",
      "మందులు",
      "మందు",
      "மருந்து",
      "மருந்துகள்",
    ])
  );

  const allergies = unique(
    findAllAnswers(answers, [
      "allergy",
      "allergic",
      "allergies",
      "drug allergy",
      "medicine allergy",
      "दवा से एलर्जी",
      "एलर्जी",
      "అలెర్జీ",
      "మందులకు అలెర్జీ",
      "ஒவ்வாமை",
      "மருந்து ஒவ்வாமை",
    ])
  );

  const familyHistory = unique(
    findAllAnswers(answers, [
      "family history",
      "family member",
      "runs in your family",
      "hereditary",
      "mother",
      "father",
      "parents",
      "परिवार में",
      "पारिवारिक",
      "కుటుంబ చరిత్ర",
      "కుటుంబంలో",
      "குடும்ப வரலாறு",
      "குடும்பத்தில்",
    ])
  );

  const lifestyle = unique(
    findAllAnswers(answers, [
      "smoking",
      "smoke",
      "tobacco",
      "alcohol",
      "drinking",
      "occupation",
      "job",
      "work",
      "exercise",
      "diet",
      "smoker",
      "धूम्रपान",
      "शराब",
      "तंबाकू",
      "काम",
      "व्यवसाय",
      "धूम्रपान",
      "పొగ",
      "ధూమపానం",
      "మద్యం",
      "ఉద్యోగం",
      "పని",
      "புகை",
      "மது",
      "வேலை",
    ])
  );

  return {
    patient,
    chiefComplaint,
    duration,
    severity,
    progression,
    location,
    character,
    radiation,
    associatedSymptoms,
    pastMedicalHistory,
    medications,
    allergies,
    familyHistory,
    lifestyle,
  };
}

/* =========================================================
   VITALS
========================================================= */

function getVitals(patientData, answers) {
  const vitals = patientData?.vitals || {};

  return {
    bloodPressure:
      vitals.bloodPressure ||
      vitals.bp ||
      findAnswer(answers, [
        "blood pressure",
        "bp",
        "బ్లడ్ ప్రెజర్",
      ]),

    heartRate:
      vitals.heartRate ||
      vitals.pulse ||
      findAnswer(answers, [
        "heart rate",
        "pulse",
        "నాడి",
      ]),

    temperature:
      vitals.temperature ||
      vitals.temp ||
      findAnswer(answers, [
        "temperature",
        "fever temperature",
        "తాపం",
        "జ్వరం ఉష్ణోగ్రత",
      ]),

    oxygenSaturation:
      vitals.oxygenSaturation ||
      vitals.spo2 ||
      findAnswer(answers, [
        "oxygen saturation",
        "spo2",
        "oxygen level",
        "ఆక్సిజన్",
      ]),

    weight:
      vitals.weight ||
      findAnswer(answers, [
        "weight",
        "బరువు",
        "वजन",
      ]),

    height:
      vitals.height ||
      findAnswer(answers, [
        "height",
        "ఎత్తు",
        "ऊंचाई",
      ]),
  };
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  subtle = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 truncate text-sm font-bold ${
              subtle
                ? "text-slate-500"
                : "text-slate-900"
            }`}
          >
            {value || "Not recorded"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ClinicalSection({
  title,
  icon: Icon,
  children,
  badge,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={19} />
          </div>

          <h3 className="font-bold text-slate-900">
            {title}
          </h3>
        </div>

        {badge && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
            {badge}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

function ClinicalValue({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
        {value || "Not documented"}
      </p>
    </div>
  );
}

function DataList({
  values,
  emptyText,
}) {
  if (!values || values.length === 0) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {values.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
        >
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-emerald-500"
          />

          <p className="text-sm leading-6 text-slate-700">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

function SummaryScreen({
  patientData = {},
  onContinue,
  onBack,
  onNewConsultation,
}) {
  const answers = useMemo(
    () => getAnswers(patientData),
    [patientData]
  );

  const clinical = useMemo(
    () => buildClinicalData(patientData, answers),
    [patientData, answers]
  );

  const vitals = useMemo(
    () => getVitals(patientData, answers),
    [patientData, answers]
  );

  const redFlags = patientData?.redFlags || [];

  const patientName =
    clinical.patient?.name ||
    patientData?.patientName ||
    "Registered Patient";

  const patientAge =
    clinical.patient?.age ||
    patientData?.age ||
    "—";

  const patientGender =
    clinical.patient?.gender ||
    patientData?.gender ||
    "—";

  const patientId =
    clinical.patient?.id ||
    clinical.patient?.patientId ||
    patientData?.patientId ||
    "MK-PATIENT";

  const consultationType =
    patientData?.consultationType ||
    "Allopathic";

  const language =
    patientData?.language ||
    "English";

  const sessionId =
    patientData?.sessionId ||
    "MK-SESSION";

  const priority =
    patientData?.priority ||
    (redFlags.length > 0
      ? "review"
      : "routine");

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

  const synthesis = [
    clinical.chiefComplaint !==
      "Not clearly documented"
      ? `Patient presents with ${clinical.chiefComplaint}.`
      : "",

    clinical.duration
      ? `Symptoms have been present for ${clinical.duration}.`
      : "",

    clinical.location
      ? `Reported location: ${clinical.location}.`
      : "",

    clinical.character
      ? `Pain/symptom character: ${clinical.character}.`
      : "",

    clinical.severity
      ? `Reported severity: ${clinical.severity}.`
      : "",

    clinical.progression
      ? `Course: ${clinical.progression}.`
      : "",

    clinical.radiation
      ? `Radiation/spread: ${clinical.radiation}.`
      : "",

    clinical.associatedSymptoms.length > 0
      ? `Associated symptoms: ${clinical.associatedSymptoms.join(
          "; "
        )}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Stethoscope size={22} />
            </div>

            <div>
              <p className="font-bold text-slate-900">
                MediKiosk
              </p>

              <p className="text-xs text-slate-500">
                Doctor Clinical Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 sm:block">
              {consultationType}
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              Interview complete
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1500px] px-6 py-7">
        {/* Navigation */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              Session{" "}
              <span className="text-slate-800">
                {sessionId}
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <Printer size={15} />
              Print
            </button>
          </div>
        </div>

        {/* ===================================================
            PATIENT HEADER
        =================================================== */}

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UserRound size={34} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {patientName}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      priority === "review"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {priority === "review"
                      ? "REVIEW REQUIRED"
                      : "ROUTINE"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span>
                    Patient ID:{" "}
                    <strong className="text-slate-700">
                      {patientId}
                    </strong>
                  </span>

                  <span>
                    Age:{" "}
                    <strong className="text-slate-700">
                      {patientAge}
                    </strong>
                  </span>

                  <span>
                    Gender:{" "}
                    <strong className="text-slate-700">
                      {patientGender}
                    </strong>
                  </span>

                  <span>
                    Language:{" "}
                    <strong className="text-slate-700">
                      {language}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={FileText}
                label="Responses"
                value={answers.length}
              />

              <StatCard
                icon={Clock3}
                label="Interview"
                value={interviewDuration}
              />

              <StatCard
                icon={CalendarDays}
                label="Date"
                value={formatDate(
                  patientData?.completedAt
                )}
              />

              <StatCard
                icon={Activity}
                label="Priority"
                value={
                  priority === "review"
                    ? "Review"
                    : "Routine"
                }
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            RED FLAGS
        =================================================== */}

        {redFlags.length > 0 && (
          <section className="mb-6 rounded-3xl border border-amber-300 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle size={23} />
              </div>

              <div className="flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-amber-950">
                      Clinical attention required
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Potential concern indicators were
                      identified during the patient interview.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">
                    {redFlags.length} flag
                    {redFlags.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {redFlags.map((flag, index) => (
                    <div
                      key={flag.id || index}
                      className="rounded-2xl border border-amber-200 bg-white/80 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          size={17}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <div>
                          <p className="text-sm font-bold leading-6 text-amber-950">
                            {flag.label ||
                              flag.message ||
                              flag.text ||
                              "Potential concern detected"}
                          </p>

                          {flag.detail && (
                            <p className="mt-1 text-xs leading-5 text-amber-800">
                              {flag.detail}
                            </p>
                          )}
                        </div>
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
                    These are screening indicators based
                    on reported information, not diagnoses.
                    Clinical assessment remains with the
                    treating doctor.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================
            CLINICAL OVERVIEW
        =================================================== */}

        <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <ClinicalValue
            label="Chief Complaint"
            value={clinical.chiefComplaint}
          />

          <ClinicalValue
            label="Duration"
            value={clinical.duration}
          />

          <ClinicalValue
            label="Severity"
            value={clinical.severity}
          />

          <ClinicalValue
            label="Progression"
            value={clinical.progression}
          />
        </div>

        {/* ===================================================
            DASHBOARD GRID
        =================================================== */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* =================================================
              LEFT MAIN CLINICAL COLUMN
          ================================================= */}

          <div className="space-y-6">
            {/* Chief Complaint */}
            <ClinicalSection
              title="Presenting Complaint"
              icon={HeartPulse}
              badge="PRIMARY CONCERN"
            >
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  Chief complaint
                </p>

                <h2 className="mt-2 text-2xl font-bold text-blue-950">
                  {clinical.chiefComplaint}
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <ClinicalValue
                    label="Duration"
                    value={clinical.duration}
                  />

                  <ClinicalValue
                    label="Location"
                    value={clinical.location}
                  />

                  <ClinicalValue
                    label="Character"
                    value={clinical.character}
                  />

                  <ClinicalValue
                    label="Radiation"
                    value={clinical.radiation}
                  />
                </div>
              </div>
            </ClinicalSection>

            {/* HPI */}
            <ClinicalSection
              title="History of Present Illness"
              icon={History}
              badge={`${answers.length} RESPONSES`}
            >
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  {answers.length > 0
                    ? answers
                        .slice(0, 10)
                        .map(
                          (item) =>
                            `${item.question}: ${item.answer}`
                        )
                        .join(" ")
                    : "No interview responses were recorded."}
                </p>
              </div>
            </ClinicalSection>

            {/* Associated Symptoms */}
            <ClinicalSection
              title="Associated Symptoms"
              icon={Sparkles}
            >
              <DataList
                values={clinical.associatedSymptoms}
                emptyText="No additional associated symptoms were specifically documented."
              />
            </ClinicalSection>

            {/* Relevant negatives */}
            <ClinicalSection
              title="Relevant Negatives"
              icon={CheckCircle2}
            >
              <div className="rounded-2xl bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-sm leading-6 text-emerald-900">
                    Review the interview record for
                    patient-reported negative findings.
                    Negative responses should be clinically
                    interpreted and confirmed by the doctor.
                  </p>
                </div>
              </div>
            </ClinicalSection>

            {/* Past medical history */}
            <ClinicalSection
              title="Past Medical History"
              icon={History}
            >
              <DataList
                values={clinical.pastMedicalHistory}
                emptyText="No additional past medical history was specifically captured during this interview."
              />
            </ClinicalSection>

            {/* Medications */}
            <ClinicalSection
              title="Current Medications"
              icon={Pill}
            >
              <DataList
                values={clinical.medications}
                emptyText="No medication information was specifically captured. Verify against the current medication list."
              />
            </ClinicalSection>

            {/* Allergies */}
            <ClinicalSection
              title="Allergies"
              icon={ShieldAlert}
            >
              {clinical.allergies.length > 0 ? (
                <DataList
                  values={clinical.allergies}
                  emptyText=""
                />
              ) : (
                <div className="rounded-2xl bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-emerald-600"
                    />

                    <div>
                      <p className="font-bold text-emerald-900">
                        No allergy information captured
                      </p>

                      <p className="mt-1 text-xs text-emerald-700">
                        Verify allergy status against the
                        patient record.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </ClinicalSection>

            {/* Family + lifestyle */}
            <div className="grid gap-6 md:grid-cols-2">
              <ClinicalSection
                title="Family History"
                icon={Users}
              >
                <DataList
                  values={clinical.familyHistory}
                  emptyText="No additional family history was captured."
                />
              </ClinicalSection>

              <ClinicalSection
                title="Lifestyle / Social"
                icon={Cigarette}
              >
                <DataList
                  values={clinical.lifestyle}
                  emptyText="No additional lifestyle or social history was captured."
                />
              </ClinicalSection>
            </div>
          </div>

          {/* =================================================
              RIGHT DOCTOR SIDEBAR
          ================================================= */}

          <aside className="space-y-6">
            {/* Vitals */}
            <ClinicalSection
              title="Vitals & Measurements"
              icon={Activity}
              badge="IF AVAILABLE"
            >
              <div className="grid gap-3">
                <VitalRow
                  icon={Activity}
                  label="Blood Pressure"
                  value={vitals.bloodPressure}
                />

                <VitalRow
                  icon={HeartPulse}
                  label="Heart Rate"
                  value={vitals.heartRate}
                />

                <VitalRow
                  icon={Thermometer}
                  label="Temperature"
                  value={vitals.temperature}
                />

                <VitalRow
                  icon={Droplets}
                  label="SpO₂"
                  value={vitals.oxygenSaturation}
                />

                <VitalRow
                  icon={Weight}
                  label="Weight"
                  value={vitals.weight}
                />
              </div>
            </ClinicalSection>

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
                    Documentation aid
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  {synthesis ||
                    "Insufficient interview data to generate a clinical synthesis."}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-xs leading-5 text-blue-800">
                    This summarizes patient-reported
                    information and is not a diagnosis or
                    treatment recommendation.
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
                    Doctor Review
                  </p>

                  <p className="text-xs text-slate-500">
                    Clinical verification checklist
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ReviewPoint
                  complete={answers.length > 0}
                  text="Patient interview captured"
                />

                <ReviewPoint
                  complete={clinical.chiefComplaint !== "Not clearly documented"}
                  text="Chief complaint identified"
                />

                <ReviewPoint
                  complete={answers.length >= 3}
                  text="Clinical history documented"
                />

                <ReviewPoint
                  complete={
                    clinical.associatedSymptoms.length > 0
                  }
                  text="Associated symptoms reviewed"
                />

                <ReviewPoint
                  complete={redFlags.length === 0}
                  warning={redFlags.length > 0}
                  text={
                    redFlags.length > 0
                      ? "Potential concerns require review"
                      : "No automated concern flags"
                  }
                />
              </div>
            </section>

            {/* Interview record */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText
                    size={20}
                    className="text-slate-600"
                  />

                  <div>
                    <p className="font-bold text-slate-900">
                      Interview Record
                    </p>

                    <p className="text-xs text-slate-500">
                      {answers.length} recorded responses
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
                {answers.length > 0 ? (
                  answers.map((item, index) => (
                    <div
                      key={`${item.question}-${index}`}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Question {index + 1}
                      </p>

                      <p className="mt-1 text-xs font-bold leading-5 text-slate-700">
                        {item.question}
                      </p>

                      <div className="mt-3 rounded-xl bg-white p-3">
                        <p className="text-xs leading-5 text-slate-600">
                          {item.answer}
                        </p>
                      </div>
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
                  AI-generated content is provided as a
                  clinical documentation aid only. It must
                  be reviewed by a qualified healthcare
                  professional before use in patient care.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ===================================================
            FOOTER ACTIONS
        =================================================== */}

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
            Continue to Doctor Review
            <ChevronRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   VITAL ROW
========================================================= */

function VitalRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
          <Icon size={16} />
        </div>

        <p className="text-xs font-semibold text-slate-600">
          {label}
        </p>
      </div>

      <p className="text-sm font-bold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   REVIEW POINT
========================================================= */

function ReviewPoint({
  complete,
  warning,
  text,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
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