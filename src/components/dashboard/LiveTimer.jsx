import React from 'react'
import { motion } from 'framer-motion'
import { secondsToHHMM, formatDurationShort } from '../../utils/time'
import { useLiveSession } from '../../hooks/useLiveSession'
import toast from 'react-hot-toast'


export default function LiveTimer() {
  const {
    session,
    elapsed,
    totalBreakSeconds,
    productiveSeconds,
    remainingSeconds,
    isComplete,
    shiftConfig,
    existingToday,
    signIn,
    startBreak,
    endBreak,
    signOut,
  } = useLiveSession()

  const handleSignIn = () => {
    if (existingToday && !session) {
      toast.error('Attendance already recorded for today. Use Edit to modify.')
      return
    }
    signIn()
    toast.success('Session started — Have a productive day!')
  }

  const handleStartBreak = () => {
    startBreak()
    toast('Break started — Rest well!', { icon: '☕' })
  }

  const handleEndBreak = () => {
    endBreak()
    toast.success('Break ended — Welcome back!')
  }

  const handleSignOut = () => {
    const record = signOut()
    if (record) {
      toast.success(`Signed out — ${record.status}! Productive: ${formatDurationShort(record.productiveSeconds)}`)
    }
  }

  // Progress percent
  const required = shiftConfig.requiredHours * 3600
  const progress = Math.min(100, (productiveSeconds / required) * 100)

  if (!session && existingToday) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Today's Attendance Recorded</h3>
            <p className="text-slate-500 text-sm">Status: <span className="text-success">{existingToday.status}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-600 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Productive</div>
            <div className="text-white font-semibold text-sm">{formatDurationShort(existingToday.productiveSeconds)}</div>
          </div>
          <div className="bg-dark-600 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Break</div>
            <div className="text-white font-semibold text-sm">{formatDurationShort(existingToday.breakSeconds)}</div>
          </div>
          
        </div>
      </motion.div>
    )
  }

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-display font-semibold text-white mb-2">Ready to start your day?</h3>
        <p className="text-slate-500 text-sm mb-6">
          Required: <span className="text-accent-light">{shiftConfig.requiredHours}h productive</span> · 
          Allowed break: <span className="text-warning">{shiftConfig.breakAllowed}h</span>
        </p>
        <button onClick={handleSignIn} className="btn-primary mx-auto px-8 py-3 text-base">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Status bar */}
      <div className={`px-6 py-2.5 flex items-center justify-between text-xs font-semibold ${session.onBreak ? 'bg-warning/10 text-warning' : isComplete ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent-light'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${session.onBreak ? 'bg-warning' : isComplete ? 'bg-success' : 'bg-accent'} animate-pulse`} />
          {session.onBreak ? 'On Break' : isComplete ? "Today's shift completed successfully" : 'Session Active'}
        </div>
        <span>{new Date(session.signInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} sign-in</span>
      </div>

      <div className="p-6">
        {/* Main Timer */}
        <div className="text-center mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-semibold">
            {session.onBreak ? 'Break Time' : 'Productive Time'}
          </div>
          <div className={`font-mono text-5xl font-bold tracking-tight ${session.onBreak ? 'text-warning timer-break' : 'text-white timer-active'}`}>
            {session.onBreak ? secondsToHHMM(totalBreakSeconds) : secondsToHHMM(productiveSeconds)}
          </div>
          {session.onBreak && (
            <div className="text-slate-500 text-sm mt-2">
              Total break: {formatDurationShort(totalBreakSeconds)} · Max allowed: {formatDurationShort(shiftConfig.breakAllowed * 3600)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Progress toward {shiftConfig.requiredHours}h goal</span>
            <span className={isComplete ? 'text-success' : 'text-accent-light'}>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${isComplete ? 'bg-success' : 'bg-accent'}`}
              style={{ boxShadow: isComplete ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(59,130,246,0.5)' }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Elapsed', value: secondsToHHMM(elapsed), color: 'text-white' },
            { label: 'Break Used', value: formatDurationShort(totalBreakSeconds), color: 'text-warning' },
            { label: 'Remaining', value: formatDurationShort(remainingSeconds), color: 'text-accent-light' },
        
          ].map(s => (
            <div key={s.label} className="bg-dark-600 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div className={`font-mono font-semibold text-sm ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!session.onBreak ? (
            <button onClick={handleStartBreak} className="btn-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Break
            </button>
          ) : (
            <button onClick={handleEndBreak} className="bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 font-medium px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              End Break
            </button>
          )}

          <button onClick={handleSignOut} className="btn-danger ml-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </motion.div>
  )
}
