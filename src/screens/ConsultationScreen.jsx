import { Stethoscope, Leaf } from 'lucide-react'

const LABELS = {
  en: { title: 'Select Consultation Type', sub: 'Choose what applies to your visit today', allo: 'Allopathic', alloSub: 'General medical history', ayush: 'AYUSH', ayushSub: 'Ayurvedic history (Dashavidha Pariksha)' },
  hi: { title: 'परामर्श का प्रकार चुनें', sub: 'आज आपकी विज़िट के लिए जो लागू हो उसे चुनें', allo: 'एलोपैथिक', alloSub: 'सामान्य चिकित्सा इतिहास', ayush: 'आयुष', ayushSub: 'आयुर्वेदिक इतिहास (दशविध परीक्षा)' },
  te: { title: 'కన్సల్టేషన్ రకాన్ని ఎంచుకోండి', sub: 'మీకు తగినది నొక్కండి', allo: 'అల్లోపతి', alloSub: 'సాధారణ వైద్య చరిత్ర', ayush: 'ఆయుష్', ayushSub: 'ఆయుర్వేద చరిత్ర (దశవిధ పరీక్ష)' },
}

function ConsultationScreen({ patientData, setPatientData, goNext }) {
  const t = LABELS[patientData.language] || LABELS.en

  const handleSelect = (type) => {
    setPatientData((prev) => ({ ...prev, consultationType: type }))
    goNext()
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 px-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
        <p className="text-gray-500">{t.sub}</p>
      </div>

      <div className="flex gap-8 flex-wrap justify-center">
        <button
          onClick={() => handleSelect('allopathic')}
          className="w-64 h-60 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-4 transition-all shadow-sm hover:shadow-lg"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Stethoscope size={32} className="text-blue-600" />
          </div>
          <span className="text-2xl font-semibold text-gray-800">{t.allo}</span>
          <span className="text-sm text-gray-400 px-6 text-center">{t.alloSub}</span>
        </button>

        <button
          onClick={() => handleSelect('ayush')}
          className="w-64 h-60 rounded-2xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50/50 flex flex-col items-center justify-center gap-4 transition-all shadow-sm hover:shadow-lg"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <Leaf size={32} className="text-green-600" />
          </div>
          <span className="text-2xl font-semibold text-gray-800">{t.ayush}</span>
          <span className="text-sm text-gray-400 px-6 text-center">{t.ayushSub}</span>
        </button>
      </div>
    </div>
  )
}

export default ConsultationScreen