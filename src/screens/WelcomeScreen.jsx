import { useState } from 'react'
import { Languages } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', greeting: 'Welcome to MediKiosk', voiceLang: 'en-IN' },
  { code: 'hi', label: 'हिंदी', greeting: 'मेडिकियोस्क में आपका स्वागत है', voiceLang: 'hi-IN' },
  { code: 'te', label: 'తెలుగు', greeting: 'మెడికియోస్క్‌కు స్వాగతం', voiceLang: 'te-IN' },
]

// Speaks text, waiting for the browser's voice list to finish loading if needed.
// This fixes the common bug where the first speak() call after page load produces no sound.
function speak(text, lang) {
  if (!('speechSynthesis' in window)) return
  const synth = window.speechSynthesis

  const doSpeak = () => {
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    const voices = synth.getVoices()
    const match =
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang.startsWith(lang.split('-')[0]))
    if (match) utterance.voice = match
    synth.speak(utterance)
  }

  if (synth.getVoices().length === 0) {
    // Voices not loaded yet — wait for them, then speak once
    const handler = () => {
      doSpeak()
      synth.removeEventListener('voiceschanged', handler)
    }
    synth.addEventListener('voiceschanged', handler)
  } else {
    doSpeak()
  }
}

function WelcomeScreen({ patientData, setPatientData, goNext }) {
  const [selected, setSelected] = useState(patientData.language)

  const handleSelect = (lang) => {
    setSelected(lang.code)
    setPatientData((prev) => ({ ...prev, language: lang.code }))
    speak(lang.greeting, lang.voiceLang)
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 px-6 py-10">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Languages size={30} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Choose Your Language</h1>
        <p className="text-gray-500">हिंदी में चुनें · తెలుగులో ఎంచుకోండి</p>
      </div>

      <div className="flex gap-5 flex-wrap justify-center">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang)}
            className={`w-44 h-32 rounded-2xl border-2 text-2xl font-semibold flex items-center justify-center transition-all
              ${selected === lang.code
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg scale-105'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md'}`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <button
        onClick={goNext}
        disabled={!selected}
        className={`px-10 py-3.5 rounded-xl font-semibold text-lg transition-all
          ${selected
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
      >
        Continue →
      </button>
    </div>
  )
}

export default WelcomeScreen