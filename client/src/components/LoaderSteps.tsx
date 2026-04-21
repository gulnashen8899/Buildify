import {  CircleIcon, ScanLineIcon, SquareIcon, TriangleIcon } from 'lucide-react'
import React from 'react'


const steps = [
  {icon:ScanLineIcon, label:"Analyzing your codebase..."},
  {icon:SquareIcon, label:"Generating layer diagram..."},
  {icon:TriangleIcon, label:"Assembling UI components..."},
  {icon:CircleIcon, label:"Finalizing your UI..."},
]
const STEP_DURATION = 45000
const LoaderSteps = () => {
const [current, setCurrent] = React.useState(0)

React.useEffect(() => {
  const interval = setInterval(() => {
    setCurrent((s) => (s + 1) % steps.length)
  }, STEP_DURATION)

  return () => clearInterval(interval)
}, [])

const Icon = steps[current].icon 

//const LoaderSteps = () => {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center bg-gray-950 relative overflow-hidden text-white'>
      <div className='absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-fuchsia-500/10 blur-3xl animate-pulse'>  </div>

      <div className='relative z-10 w-32 h-32 flex items-center justify-center'>
        <div className='absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-30'/>
        <div className='absolute inset-4 rounded-full border border-purple-400/20'/>
        <Icon className='w-8 h-8 text-white opacity-80 animate-bounce'/>
      </div>

      {/* Steps label- fade using transition only (no invisible start) */}
      <p key={current} className="mt-8 text-lg font-light text-white/90 tracking-wide transition-all duration-700 ease-in-out opacity-100">{steps[current].label}</p>
     <p>This may take a few moments...</p>
    </div>


  )
}

export default LoaderSteps