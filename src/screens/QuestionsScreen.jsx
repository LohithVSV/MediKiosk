import { useState, useRef, useEffect } from 'react'
import { Mic, Square, AlertCircle } from 'lucide-react'

const ALLOPATHIC_QUESTIONS = [
  { id: 'chiefComplaint', section: 'Chief Complaint', text: 'What is the main problem you are here for today?', type: 'voice' },
  { id: 'onset', section: 'History of Present Illness', text: 'When did it start?', type: 'choice', options: ['Today', 'Few days ago', 'Few weeks ago', 'Months ago'] },
  { id: 'site', section: 'History of Present Illness', text: 'Where exactly do you feel it?', type: 'voice' },
  { id: 'character', section: 'History of Present Illness', text: 'How would you describe it?', type: 'choice', options: ['Sharp', 'Dull', 'Burning', 'Throbbing', 'Cramping'] },
  { id: 'radiation', section: 'History of Present Illness', text: 'Does it spread to any other part of your body?', type: 'voice' },
  { id: 'associations', section: 'History of Present Illness', text: 'Any other symptoms along with this?', type: 'voice' },
  { id: 'timeCourse', section: 'History of Present Illness', text: 'Is it constant, or does it come and go?', type: 'choice', options: ['Constant', 'Comes and goes'] },
  { id: 'exacerbating', section: 'History of Present Illness', text: 'What makes it better or worse?', type: 'voice' },
  { id: 'severity', section: 'History of Present Illness', text: 'On a scale of 1 to 10, how severe is it?', type: 'choice', options: ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)'] },
  { id: 'medicines', section: 'Drug & Allergy History', text: 'Are you currently taking any medicines? Please name them.', type: 'voice' },
  { id: 'pastHistory', section: 'Past Medical History', text: 'Do you have any past medical conditions, like diabetes or blood pressure?', type: 'voice' },
]

const AYUSH_QUESTIONS = [
  { id: 'prakriti', section: 'Prakriti (Constitution)', text: 'Which best describes your natural body type — Vata (thin, quick), Pitta (medium, sharp), or Kapha (heavy, calm)?', type: 'choice', options: ['Vata', 'Pitta', 'Kapha', 'Mixed'] },
  { id: 'vikriti', section: 'Vikriti (Current Imbalance)', text: 'What imbalance or discomfort are you currently experiencing?', type: 'voice' },
  { id: 'agniShakti', section: 'Ahara Shakti (Digestive Fire)', text: 'How is your digestion?', type: 'choice', options: ['Strong', 'Weak', 'Irregular'] },
  { id: 'vyayamaShakti', section: 'Vyayama Shakti (Exercise Capacity)', text: 'How much physical activity can you comfortably do?', type: 'choice', options: ['High', 'Moderate', 'Low'] },
  { id: 'ahara', section: 'Ahara-Vihara (Diet & Lifestyle)', text: 'Describe your typical daily diet.', type: 'voice' },
  { id: 'vihara', section: 'Ahara-Vihara (Diet & Lifestyle)', text: 'Describe your daily routine and lifestyle.', type: 'voice' },
  { id: 'sleep', section: 'Sattva (Mental State)', text: 'How is your sleep quality?', type: 'choice', options: ['Good', 'Disturbed', 'Poor'] },
  { id: 'nidana', section: 'Nidana (Causative Factors)', text: 'What do you think caused this problem?', type: 'voice' },
]

const LANG_CODES = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }

function QuestionsScreen({ patientData, setPatientData, goNext }) {
  const questions = patientData.consultationType === 'ayush' ? AYUSH_QUESTIONS : ALLOPATHIC_QUESTIONS
  const [index, setIndex] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [micError, setMicError] = useState('')
  const [micSupported, setMicSupported] = useState(true)
  const recognitionRef = useRef(null)

  const currentQuestion = questions[index]
  const langCode = LANG_CODES[patientData.language] || 'en-IN'

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMicSupported(false)
      return
    }
    setMicSupported(true)
    setMicError('')

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = langCode

    recognition.onresult = (event) => {
      let text = ''
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)
    }

    recognition.onend = () => setIsListening(false)

    recognition.onerror = (event) => {
      setIsListening(false)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicError('Microphone permission denied. Click the 🔒/mic icon in your browser address bar and allow access, then try again.')
      } else if (event.error === 'language-not-supported') {
        setMicError('This language is not supported for voice input in your browser. Please type your answer instead.')
      } else if (event.error === 'no-speech') {
        setMicError('No speech detected. Try speaking again, closer to the mic.')
      } else if (event.error === 'network') {
        setMicError('Network error from the browser\'s speech service. Check your internet connection and try again.')
      } else {
        setMicError(`Voice input error (${event.error}). You can type your answer instead.`)
      }
    }

    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [index, langCode])

  const startListening = () => {
    if (!recognitionRef.current) return
    setMicError('')
    setTranscript('')
    setIsListening(true)
    try {
      recognitionRef.current.start()
    } catch {
      // start() throws if called twice in a row — safe to ignore
    }
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const saveAnswerAndAdvance = (answer) => {
    setPatientData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer },
    }))
    setTranscript('')
    setMicError('')
    if (index < questions.length - 1) {
      setIndex(index + 1)
    } else {
      goNext()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 gap-6 max-w-2xl mx-auto w-full">
      <div className="w-full text-center">
        <span className="text-xs font-bold uppercase tracking-wide text-blue-500">
          {currentQuestion.section}
        </span>
        <p className="text-xs text-gray-400 mt-1">Question {index + 1} of {questions.length}</p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-md border p-8 flex flex-col items-center gap-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">{currentQuestion.text}</h2>

        {currentQuestion.type === 'choice' ? (
          <div className="flex flex-wrap gap-3 justify-center w-full">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                onClick={() => saveAnswerAndAdvance(opt)}
                className="px-5 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 font-medium transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            {!micSupported && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm">
                <AlertCircle size={16} /> Voice input isn't supported in this browser. Please use Chrome or Edge, or type below.
              </div>
            )}

            {micSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all
                  ${isListening ? 'bg-red-500 animate-pulse text-white shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
              >
                {isListening ? <Square size={30} fill="currentColor" /> : <Mic size={34} />}
              </button>
            )}
            <p className="text-sm text-gray-400">{isListening ? 'Listening...' : 'Tap the mic and speak'}</p>

            {micError && (
              <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm w-full">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {micError}
              </div>
            )}

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type your answer here"
              className="w-full border rounded-xl p-3 text-gray-700 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={() => transcript.trim() && saveAnswerAndAdvance(transcript.trim())}
              disabled={!transcript.trim()}
              className={`px-8 py-3 rounded-lg font-medium transition-all
                ${transcript.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionsScreen