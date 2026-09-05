import { ArrowLeft, Check } from 'lucide-react'

const STEPS = ["Welcome", "Consultation", "Questions", "Summary", "Receipt"]

function ProgressBar({ currentStep, onBack }) {
  return (
    <div className="w-full bg-white border-b px-6 py-3 flex items-center gap-4">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded transition-colors
          ${currentStep === 0 ? 'invisible' : 'text-blue-600 hover:bg-blue-50'}`}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex-1 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                ${i < currentStep ? "bg-blue-600 text-white" : i === currentStep ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-200 text-gray-500"}`}
            >
              {i < currentStep ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`ml-2 text-xs hidden sm:block whitespace-nowrap ${i <= currentStep ? "text-blue-700 font-medium" : "text-gray-400"}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded transition-colors ${i < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar