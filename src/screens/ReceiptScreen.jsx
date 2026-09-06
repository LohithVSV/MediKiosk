import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  UserRound,
  CalendarDays,
  Clock3,
  AlertTriangle,
  Stethoscope,
  Mic,
  ChevronRight,
  Printer,
  Pill,
  HeartPulse,
  Users,
  Activity,
} from "lucide-react";

export default function ReceiptScreen({
  patientData = {},
  onBack,
  onNewConsultation,
}) {
  /*
    ==========================================================
    PATIENT RECORD
    ==========================================================

    QuestionsScreen now stores the demo patient record directly
    inside patientData.

    We therefore do NOT use patientData.patient anymore.
  */

  const patientName =
    patientData?.name || "Ravi Kumar";

  const patientId =
    patientData?.patientId ||
    patientData?.id ||
    "MED-2026-001";

  const age =
    patientData?.age || 42;

  const gender =
    patientData?.gender || "Male";

  const consultationType =
    patientData?.consultationType ||
    "General Consultation";

  const language =
    patientData?.language ||
    "English";

  /*
    ==========================================================
    EXISTING MEDICAL RECORD
    ==========================================================
  */

  const previousMedicalHistory =
    Array.isArray(
      patientData?.previousMedicalHistory
    )
      ? patientData.previousMedicalHistory
      : [
          "Type 2 diabetes — diagnosed in 2021",
          "Hypertension — diagnosed in 2022",
          "Appendectomy — 2018",
          "Occasional acidity / GERD symptoms",
        ];

  const currentMedications =
    Array.isArray(
      patientData?.currentMedications
    )
      ? patientData.currentMedications
      : [
          "Metformin 500 mg — twice daily",
          "Amlodipine 5 mg — once daily",
        ];

  const allergies =
    Array.isArray(patientData?.allergies)
      ? patientData.allergies
      : ["No known drug allergies"];

  const familyHistory =
    Array.isArray(
      patientData?.familyHistory
    )
      ? patientData.familyHistory
      : ["Father — hypertension"];

  const lifestyle =
    Array.isArray(patientData?.lifestyle)
      ? patientData.lifestyle
      : [
          "Non-smoker",
          "Occasional tea / coffee",
          "No regular alcohol use",
        ];

  /*
    ==========================================================
    AI INTERVIEW DATA
    ==========================================================
  */

  const interviewMemory =
    patientData?.interviewMemory || {};

  const clinicalContext =
    patientData?.clinicalContext || {};

  const summary =
    patientData?.summary || {};

  const redFlags =
    Array.isArray(patientData?.redFlags)
      ? patientData.redFlags
      : [];

  /*
    Helper to safely get today's interview information.

    Priority:
    1. summary
    2. clinicalContext
    3. interviewMemory
  */

  const getClinicalValue = (
    summaryKeys = [],
    contextKeys = [],
    memoryKeys = []
  ) => {
    for (const key of summaryKeys) {
      if (
        summary?.[key] !== undefined &&
        summary?.[key] !== null &&
        String(summary[key]).trim()
      ) {
        return summary[key];
      }
    }

    for (const key of contextKeys) {
      if (
        clinicalContext?.[key] !== undefined &&
        clinicalContext?.[key] !== null &&
        String(clinicalContext[key]).trim()
      ) {
        return clinicalContext[key];
      }
    }

    for (const key of memoryKeys) {
      if (
        interviewMemory?.[key] !== undefined &&
        interviewMemory?.[key] !== null &&
        String(interviewMemory[key]).trim()
      ) {
        return interviewMemory[key];
      }
    }

    return "";
  };

  /*
    ==========================================================
    TODAY'S CLINICAL HISTORY
    ==========================================================
  */

  const chiefComplaint =
    getClinicalValue(
      ["chiefComplaint"],
      ["chiefComplaint"],
      ["chiefComplaint", "complaint"]
    ) ||
    patientData?.chiefComplaint ||
    "No chief complaint recorded.";

  const historyOfPresentIllness =
    getClinicalValue(
      [
        "historyOfPresentIllness",
        "hpi",
      ],
      [],
      [
        "onset",
        "location",
        "character",
        "severity",
        "timing",
        "radiation",
        "aggravatingFactors",
        "relievingFactors",
      ]
    );

  const onset =
    getClinicalValue(
      [],
      ["onset"],
      ["onset", "duration"]
    );

  const location =
    getClinicalValue(
      [],
      ["location"],
      ["location"]
    );

  const character =
    getClinicalValue(
      [],
      ["character"],
      ["character"]
    );

  const severity =
    getClinicalValue(
      [],
      ["severity"],
      ["severity"]
    );

  const timing =
    getClinicalValue(
      [],
      ["timing"],
      ["timing"]
    );

  const radiation =
    getClinicalValue(
      [],
      ["radiation"],
      ["radiation"]
    );

  const aggravatingFactors =
    getClinicalValue(
      [],
      ["aggravatingFactors"],
      ["aggravatingFactors"]
    );

  const relievingFactors =
    getClinicalValue(
      [],
      ["relievingFactors"],
      ["relievingFactors"]
    );

  const associatedSymptoms =
    getClinicalValue(
      ["associatedSymptoms"],
      ["associatedSymptoms"],
      ["associatedSymptoms"]
    ) ||
    patientData?.associatedSymptoms ||
    "No associated symptoms recorded.";

  const relevantHistory =
    getClinicalValue(
      [
        "medicalHistory",
        "relevantHistory",
      ],
      ["relevantHistory"],
      ["relevantHistory"]
    );

  /*
    Build a readable HPI if SummaryScreen has not
    generated a dedicated HPI.
  */

  const generatedHPI = [
    onset && `Onset: ${onset}`,
    location && `Location: ${location}`,
    character && `Character: ${character}`,
    severity && `Severity: ${severity}`,
    timing && `Timing: ${timing}`,
    radiation && `Radiation: ${radiation}`,
    aggravatingFactors &&
      `Aggravating factors: ${aggravatingFactors}`,
    relievingFactors &&
      `Relieving factors: ${relievingFactors}`,
  ]
    .filter(Boolean)
    .join(" • ");

  const finalHPI =
    historyOfPresentIllness ||
    generatedHPI ||
    "No detailed history available.";

  /*
    ==========================================================
    SESSION INFORMATION
    ==========================================================
  */

  const sessionId =
    patientData?.sessionId ||
    `MED-${new Date()
      .getTime()
      .toString()
      .slice(-6)}`;

  const date =
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const time =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Go back"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Stethoscope size={17} />
                </div>

                <h1 className="text-lg font-bold tracking-tight">
                  MediKiosk
                </h1>
              </div>

              <p className="mt-0.5 text-xs text-slate-500">
                Doctor Review
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">
              Print
            </span>
          </button>
        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">

        {/* Page heading */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              Interview completed
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Clinical History Review
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review the patient's existing medical record
              together with today's AI-collected history.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Session
            </p>

            <p className="font-mono text-sm font-semibold text-slate-700">
              {sessionId}
            </p>
          </div>
        </div>

        {/* ====================================================
            PATIENT OVERVIEW
        ==================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 md:px-6">
            <div className="flex items-center gap-2">
              <UserRound
                size={18}
                className="text-blue-600"
              />

              <h3 className="font-semibold text-slate-900">
                Patient Overview
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">

            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Patient
              </p>

              <p className="mt-1 text-base font-semibold text-slate-900">
                {patientName}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {patientId}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Demographics
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {age} years
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {gender}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Consultation
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {consultationType}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Language: {language}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Completed
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarDays size={15} />
                {date}
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={13} />
                {time}
              </div>
            </div>

          </div>
        </section>

        {/* ====================================================
            EXISTING MEDICAL RECORD
        ==================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">

          <div className="border-b border-blue-100 bg-blue-50/50 px-5 py-4 md:px-6">
            <div className="flex items-center gap-2">
              <HeartPulse
                size={18}
                className="text-blue-600"
              />

              <div>
                <h3 className="font-semibold text-slate-900">
                  Existing Medical Record
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Previously available patient information
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:p-6">

            {/* Previous history */}

            <MedicalRecordCard
              icon={HeartPulse}
              title="Previous Medical History"
              items={previousMedicalHistory}
            />

            {/* Medications */}

            <MedicalRecordCard
              icon={Pill}
              title="Current Medications"
              items={currentMedications}
            />

            {/* Allergies */}

            <MedicalRecordCard
              icon={AlertTriangle}
              title="Allergies"
              items={allergies}
              alert
            />

            {/* Family history */}

            <MedicalRecordCard
              icon={Users}
              title="Family History"
              items={familyHistory}
            />

            {/* Lifestyle */}

            <MedicalRecordCard
              icon={Activity}
              title="Lifestyle"
              items={lifestyle}
            />

          </div>
        </section>

        {/* ====================================================
            CLINICAL CONTENT
        ==================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ==================================================
              MAIN CLINICAL SUMMARY
          ================================================== */}

          <section className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
                <div className="flex items-center gap-2">
                  <FileText
                    size={18}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Today's Clinical History
                  </h3>
                </div>

                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  AI assisted
                </span>
              </div>

              <div className="space-y-6 p-5 md:p-6">

                <ClinicalBlock
                  title="Chief Complaint"
                  content={chiefComplaint}
                />

                <ClinicalBlock
                  title="History of Present Illness"
                  content={finalHPI}
                />

                {/* Structured history */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <ClinicalBlock
                    title="Onset / Duration"
                    content={
                      onset ||
                      "Not established."
                    }
                  />

                  <ClinicalBlock
                    title="Location"
                    content={
                      location ||
                      "Not established."
                    }
                  />

                  <ClinicalBlock
                    title="Character"
                    content={
                      character ||
                      "Not established."
                    }
                  />

                  <ClinicalBlock
                    title="Severity"
                    content={
                      severity ||
                      "Not established."
                    }
                  />

                  <ClinicalBlock
                    title="Timing"
                    content={
                      timing ||
                      "Not established."
                    }
                  />

                  <ClinicalBlock
                    title="Radiation"
                    content={
                      radiation ||
                      "Not established."
                    }
                  />

                  <ClinicalBlock
                    title="Aggravating Factors"
                    content={
                      aggravatingFactors ||
                      "Not established."
                    }
                  />

                  <ClinicalBlock
                    title="Relieving Factors"
                    content={
                      relievingFactors ||
                      "Not established."
                    }
                  />

                </div>

                <ClinicalBlock
                  title="Associated Symptoms"
                  content={associatedSymptoms}
                />

                <ClinicalBlock
                  title="Relevant History"
                  content={
                    relevantHistory ||
                    "No additional relevant history established during today's interview."
                  }
                />

              </div>
            </div>
          </section>

          {/* ==================================================
              RIGHT DOCTOR PANEL
          ================================================== */}

          <aside className="space-y-6">

            {/* Doctor review */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList
                    size={18}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold">
                    Doctor Review
                  </h3>
                </div>
              </div>

              <div className="space-y-3 p-5">

                <ReviewItem
                  label="Existing medical record loaded"
                  done
                />

                <ReviewItem
                  label="Patient responses captured"
                  done
                />

                <ReviewItem
                  label="Clinical history organized"
                  done
                />

                <ReviewItem
                  label="Clinician verification"
                  done={false}
                />

              </div>
            </div>

            {/* ==================================================
                CLINICAL ATTENTION
            ================================================== */}

            <div
              className={`rounded-2xl border shadow-sm ${
                redFlags.length > 0
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-white"
              }`}
            >

              <div className="border-b border-slate-200/70 px-5 py-4">
                <div className="flex items-center gap-2">

                  <AlertTriangle
                    size={18}
                    className={
                      redFlags.length > 0
                        ? "text-red-600"
                        : "text-slate-500"
                    }
                  />

                  <h3 className="font-semibold">
                    Clinical Attention
                  </h3>

                </div>
              </div>

              <div className="p-5">

                {redFlags.length > 0 ? (
                  <div className="space-y-2">

                    {redFlags.map(
                      (flag, index) => (
                        <div
                          key={
                            flag?.id ||
                            index
                          }
                          className="rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-red-800"
                        >
                          {typeof flag ===
                          "string"
                            ? flag
                            : flag?.label ||
                              flag?.message ||
                              "Attention required"}
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="flex items-start gap-3">

                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        No AI-flagged concerns
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        This does not rule out clinical
                        risk. Review the complete patient
                        history.
                      </p>

                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* ==================================================
                PATIENT RECORD SNAPSHOT
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">

                <div className="flex items-center gap-2">

                  <UserRound
                    size={17}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Patient Record Snapshot
                  </h3>

                </div>

              </div>

              <div className="space-y-4 p-5">

                <SnapshotRow
                  label="Name"
                  value={patientName}
                />

                <SnapshotRow
                  label="Age"
                  value={`${age} years`}
                />

                <SnapshotRow
                  label="Gender"
                  value={gender}
                />

                <SnapshotRow
                  label="Known conditions"
                  value={`${previousMedicalHistory.length} recorded`}
                />

                <SnapshotRow
                  label="Medications"
                  value={`${currentMedications.length} recorded`}
                />

                <SnapshotRow
                  label="Allergies"
                  value={`${allergies.length} recorded`}
                />

              </div>
            </div>

            {/* ==================================================
                INTERVIEW SOURCE
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="p-5">

                <div className="mb-3 flex items-center gap-2">

                  <Mic
                    size={17}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Interview Source
                  </h3>

                </div>

                <p className="text-sm leading-6 text-slate-600">
                  History collected through a
                  voice-assisted AI patient interview.
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-3">

                  <p className="text-xs text-slate-500">
                    Patient language
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {language}
                  </p>

                </div>

              </div>
            </div>

          </aside>
        </div>

        {/* ====================================================
            BOTTOM ACTIONS
        ==================================================== */}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Ready for clinical review
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Verify the AI-generated information and
              existing medical record before making
              clinical decisions.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              onClick={onNewConsultation}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              New Consultation
            </button>

            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Continue to Doctor Review
              <ChevronRight size={17} />
            </button>

          </div>
        </div>

        {/* Disclaimer */}

        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-slate-400">
          MediKiosk is a documentation and history-taking
          assistant. Clinical information must be reviewed
          and verified by a qualified healthcare professional.
        </p>

      </main>
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function ClinicalBlock({
  title,
  content,
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </h4>

      <div className="rounded-xl bg-slate-50 px-4 py-3.5">
        <p className="text-sm leading-6 text-slate-700">
          {content}
        </p>
      </div>
    </div>
  );
}

function MedicalRecordCard({
  icon: Icon,
  title,
  items = [],
  alert = false,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

      <div className="mb-3 flex items-center gap-2">

        <Icon
          size={16}
          className={
            alert
              ? "text-amber-600"
              : "text-blue-600"
          }
        />

        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </h4>

      </div>

      <div className="space-y-2">

        {items.length > 0 ? (
          items.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-lg bg-white px-3 py-2.5 text-sm leading-5 text-slate-700"
              >
                {item}
              </div>
            )
          )
        ) : (
          <p className="text-sm text-slate-500">
            No information recorded.
          </p>
        )}

      </div>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}

function ReviewItem({
  label,
  done,
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          done
            ? "bg-emerald-100 text-emerald-600"
            : "bg-amber-100 text-amber-600"
        }`}
      >
        {done ? (
          <CheckCircle2 size={15} />
        ) : (
          <Clock3 size={15} />
        )}
      </div>

      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

    </div>
  );
}

