import { Stethoscope } from 'lucide-react'

function Header() {
  return (
    <div className="w-full bg-white border-b px-6 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
        <Stethoscope size={20} className="text-white" strokeWidth={2.25} />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-800 leading-none">MediKiosk</h1>
        <p className="text-[11px] text-gray-400 leading-none mt-0.5">AI Clinical History Platform</p>
      </div>
    </div>
  )
}

export default Header