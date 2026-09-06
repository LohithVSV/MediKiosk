import { useState } from "react";

import WelcomeScreen from "./screens/WelcomeScreen";
import ConsultationScreen from "./screens/ConsultationScreen";
import QuestionsScreen from "./screens/QuestionsScreen";
import SummaryScreen from "./screens/SummaryScreen";
import ReceiptScreen from "./screens/ReceiptScreen";

const createInitialPatientData = () => ({
  sessionId: `MK-${Date.now().toString().slice(-8)}`,
  startedAt: new Date().toISOString(),
  completedAt: null,

  patient: {
    name: "",
    age: "",
    gender: "",
    phone: "",
  },

  language: "English",
  consultationType: "Allopathic",

  answers: {},
  interviewHistory: [],

  redFlags: [],
  symptoms: [],

  clinicalContext: {
    chiefComplaint: "",
    duration: "",
    severity: "",
    progression: "",
  },

  summarySections: [],

  doctorNotes: "",
  doctorReviewed: false,

  interviewStatus: "not_started",

  questionCount: 0,
  answeredCount: 0,

  priority: "routine",
});

function App() {
  const [screen, setScreen] = useState("welcome");

  const [patientData, setPatientData] = useState(
    createInitialPatientData()
  );

  const updatePatientData = (updates) => {
    setPatientData((previous) => ({
      ...previous,
      ...updates,
    }));
  };

  const updatePatientField = (field, value) => {
    setPatientData((previous) => ({
      ...previous,
      patient: {
        ...previous.patient,
        [field]: value,
      },
    }));
  };

  const updateClinicalContext = (field, value) => {
    setPatientData((previous) => ({
      ...previous,
      clinicalContext: {
        ...previous.clinicalContext,
        [field]: value,
      },
    }));
  };

  // Language selection from WelcomeScreen
  const handleLanguageSelect = (language) => {
    setPatientData((previous) => ({
      ...previous,
      language,
    }));

    setScreen("consultation");
  };

  const startConsultation = (setup = {}) => {
    setPatientData((previous) => ({
      ...previous,

      language: setup.language || previous.language,

      consultationType:
        setup.consultationType || previous.consultationType,

      patient: {
        ...previous.patient,
        ...(setup.patient || {}),
      },

      startedAt: new Date().toISOString(),
      completedAt: null,
      interviewStatus: "in_progress",
      doctorReviewed: false,
    }));

    setScreen("questions");
  };

  const completeInterview = (interviewData = {}) => {
    setPatientData((previous) => ({
      ...previous,

      ...interviewData,

      completedAt: new Date().toISOString(),
      interviewStatus: "completed",
    }));

    setScreen("summary");
  };

  const openDoctorReview = () => {
    setPatientData((previous) => ({
      ...previous,
      doctorReviewed: false,
    }));

    setScreen("review");
  };

  const saveDoctorReview = (notes = "", priority = null) => {
    setPatientData((previous) => ({
      ...previous,
      doctorNotes: notes,
      doctorReviewed: true,
      priority: priority || previous.priority,
    }));
  };

  const startNewConsultation = () => {
    setPatientData(createInitialPatientData());
    setScreen("welcome");
  };

  const goBack = () => {
    const previousScreens = {
      consultation: "welcome",
      questions: "consultation",
      summary: "questions",
      review: "summary",
    };

    const previousScreen = previousScreens[screen];

    if (previousScreen) {
      setScreen(previousScreen);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {screen === "welcome" && (
        <WelcomeScreen
          patientData={patientData}
          onStart={handleLanguageSelect}
        />
      )}

      {screen === "consultation" && (
        <ConsultationScreen
          patientData={patientData}
          onUpdate={updatePatientData}
          onUpdatePatient={updatePatientField}
          onStart={startConsultation}
          onBack={goBack}
        />
      )}

      {screen === "questions" && (
        <QuestionsScreen
          patientData={patientData}
          onUpdate={updatePatientData}
          onUpdateClinicalContext={updateClinicalContext}
          onComplete={completeInterview}
          onBack={goBack}
        />
      )}

      {screen === "summary" && (
        <SummaryScreen
          patientData={patientData}
          onUpdate={updatePatientData}
          onContinue={openDoctorReview}
          onBack={goBack}
          onNewConsultation={startNewConsultation}
        />
      )}

      {screen === "review" && (
        <ReceiptScreen
          patientData={patientData}
          onUpdate={updatePatientData}
          onSaveReview={saveDoctorReview}
          onNewConsultation={startNewConsultation}
          onBack={goBack}
        />
      )}
    </div>
  );
}

export default App;