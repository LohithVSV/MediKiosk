import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'

function buildSections(patientData) {
  const a = patientData.answers
  const get = (id) => a[id] || ''

  if (patientData.consultationType === 'ayush') {
    return [
      { key: 'symptoms', label: 'Symptoms (Vikriti & Cause)', content: [get('vikriti'), get('nidana') && `Suspected cause: ${get('nidana')}`].filter(Boolean).join('. ') },
      { key: 'ayushParams', label: 'AYUSH Parameters (Dashavidha Pariksha)', content: [
          get('prakriti') && `Prakriti (constitution): ${get('prakriti')}`,
          get('agniShakti') && `Ahara Shakti (digestion): ${get('agniShakti')}`,
          get('vyayamaShakti') && `Vyayama Shakti (activity tolerance): ${get('vyayamaShakti')}`,
          get('sleep') && `Sleep quality: ${get('sleep')}`,
        ].filter(Boolean).join('\n') },
      { key: 'history', label: 'Ahara-Vihara (Diet & Lifestyle)', content: [
          get('ahara') && `Diet: ${get('ahara')}`,
          get('vihara') && `Lifestyle: ${get('vihara')}`,
        ].filter(Boolean).join('\n') },
    ]
  }

  return [
    { key: 'symptoms', label: 'Symptoms', content: [
        get('chiefComplaint') && `Chief complaint: ${get('chiefComplaint')}`,
        get('site') && `Site: ${get('site')}`,
        get('character') && `Character: ${get('character')}`,
        get('radiation') && `Radiation: ${get('radiation')}`,
        get('associations') && `Associated symptoms: ${get('associations')}`,
        get('exacerbating') && `Aggravating/relieving factors: ${get('exacerbating')}`,
        get('severity') && `Severity: ${get('severity')}`,
      ].filter(Boolean).join('\n') },
    { key: 'duration', label: 'Duration', content: [
        get('onset') && `Onset: ${get('onset')}`,
        get('timeCourse') && `Pattern: ${get('timeCourse')}`,
      ].filter(Boolean).join('\n') },
    { key: 'history', label: 'Past Medical History', content: get('pastHistory') },
    { key: 'medicines', label: 'Current Medicines', content: get('medicines') },
  ]
}

function SummaryScreen({ patientData, setPatientData, goNext }) {
  const [sections, setSections] = useState([])

  useEffect(() => {
    setSections(buildSections(patientData))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEdit = (key, newContent) => {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, content: newContent } : s)))
  }

  const handleConfirm = () => {
    setPatientData((prev) => ({ ...prev, summarySections: sections }))
    goNext()
  }

  return (
    <div className="flex flex-col items-center flex-1 px-6 py-8 gap-6 max-w-2xl mx-auto w-full">
      <div className="text-center flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <FileText size={26} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Structured Clinical Summary</h1>
        <p className="text-gray-500 text-sm">Review and edit before confirming — this is what the physician will see</p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {sections.map((section) => (
          <div key={section.key} className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-2">{section.label}</h3>
            <textarea
              value={section.content}
              onChange={(e) => handleEdit(section.key, e.target.value)}
              placeholder="Not reported"
              className="w-full min-h-[70px] text-gray-700 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md"
      >
        Confirm & Generate Receipt →
      </button>
    </div>
  )
}

export default SummaryScreen