import { useState } from 'react'
import Header from './components/Header'
import ProgressBar from './components/ProgressBar'
import WelcomeScreen from './screens/WelcomeScreen'
import ConsultationScreen from './screens/ConsultationScreen'
import QuestionsScreen from './screens/QuestionsScreen'
import SummaryScreen from './screens/SummaryScreen'
import ReceiptScreen from './screens/ReceiptScreen'

function App() {
  const [step, setStep] = useState(0)

  const [patientData, setPatientData] = useState({
    language: null,           // 'en' | 'hi' | 'te'
    consultationType: null,   // 'allopathic' | 'ayush'
    answers: {},
    summarySections: [],
  })

  const goNext = () => setStep((s) => Math.min(s + 1, 4))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const screens = [
    <WelcomeScreen patientData={patientData} setPatientData={setPatientData} goNext={goNext} />,
    <ConsultationScreen patientData={patientData} setPatientData={setPatientData} goNext={goNext} />,
    <QuestionsScreen patientData={patientData} setPatientData={setPatientData} goNext={goNext} />,
    <SummaryScreen patientData={patientData} setPatientData={setPatientData} goNext={goNext} />,
    <ReceiptScreen patientData={patientData} />,
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <ProgressBar currentStep={step} onBack={goBack} />
      {screens[step]}
    </div>
  )
}

export default App