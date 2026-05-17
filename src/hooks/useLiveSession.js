import { useState, useEffect, useRef, useCallback } from 'react'
import { getLiveSession, setLiveSession, clearLiveSession, upsertAttendance, getAttendanceByDate } from '../utils/storage'
import { TODAY, nowISO, calculateProductiveSeconds, calculateShiftSeconds, getStatus, getOvertimeSeconds } from '../utils/time'
import { useAuth } from '../context/AuthContext'

export function useLiveSession() {
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [elapsed, setElapsed] = useState(0)       // total elapsed seconds since sign in
  const [breakElapsed, setBreakElapsed] = useState(0) // current break segment seconds
  const tickRef = useRef(null)

  // Load persisted session
  useEffect(() => {
    const saved = getLiveSession()
    if (saved && saved.userId === user?.id) {
      setSession(saved)
    }
  }, [user?.id])

  // Tick
  useEffect(() => {
    if (!session || session.signedOut) {
      clearInterval(tickRef.current)
      return
    }

    const tick = () => {
      const now = Date.now()
      const totalElapsed = Math.floor((now - new Date(session.signInTime).getTime()) / 1000)
      setElapsed(totalElapsed)

      if (session.onBreak && session.currentBreakStart) {
        const breakSeg = Math.floor((now - new Date(session.currentBreakStart).getTime()) / 1000)
        setBreakElapsed(breakSeg)
      } else {
        setBreakElapsed(0)
      }
    }

    tick()
    tickRef.current = setInterval(tick, 1000)
    return () => clearInterval(tickRef.current)
  }, [session])

  const totalBreakSeconds = (session?.breaks || []).reduce((s, b) => {
    if (b.end) return s + Math.floor((new Date(b.end) - new Date(b.start)) / 1000)
    return s
  }, 0) + (session?.onBreak ? breakElapsed : 0)

  const productiveSeconds = Math.max(0, elapsed - totalBreakSeconds)
  const shiftConfig = user?.shiftConfig || { totalHours: 9, requiredHours: 8, breakAllowed: 1 }
  const requiredSeconds = shiftConfig.requiredHours * 3600
  const remainingSeconds = Math.max(0, requiredSeconds - productiveSeconds)
  const overtimeSeconds = Math.max(0, productiveSeconds - requiredSeconds)
  const isComplete = productiveSeconds >= requiredSeconds

  const signIn = useCallback(() => {
    const now = nowISO()
    const s = {
      userId: user.id,
      date: TODAY(),
      signInTime: now,
      breaks: [],
      onBreak: false,
      currentBreakStart: null,
      signedOut: false,
    }
    setSession(s)
    setLiveSession(s)
  }, [user])

  const startBreak = useCallback(() => {
    if (!session || session.onBreak) return
    const now = nowISO()
    const updated = { ...session, onBreak: true, currentBreakStart: now }
    setSession(updated)
    setLiveSession(updated)
  }, [session])

  const endBreak = useCallback(() => {
    if (!session || !session.onBreak) return
    const now = nowISO()
    const updated = {
      ...session,
      onBreak: false,
      currentBreakStart: null,
      breaks: [...(session.breaks || []), { start: session.currentBreakStart, end: now }],
    }
    setSession(updated)
    setLiveSession(updated)
  }, [session])

  const signOut = useCallback(() => {
    if (!session) return
    const now = nowISO()
    let finalBreaks = session.breaks || []
    if (session.onBreak && session.currentBreakStart) {
      finalBreaks = [...finalBreaks, { start: session.currentBreakStart, end: now }]
    }

    const totalBreak = finalBreaks.reduce((s, b) => {
      return s + Math.floor((new Date(b.end) - new Date(b.start)) / 1000)
    }, 0)

    const shiftSec = calculateShiftSeconds(session.signInTime, now)
    const productiveSec = Math.max(0, shiftSec - totalBreak)
    const overSec = getOvertimeSeconds(productiveSec, shiftConfig)
    const status = getStatus(productiveSec, shiftConfig)

    const record = {
      userId: user.id,
      userName: user.name,
      department: user.department,
      role: user.role,
      date: session.date,
      signIn: session.signInTime,
      signOut: now,
      breaks: finalBreaks,
      breakSeconds: totalBreak,
      shiftSeconds: shiftSec,
      productiveSeconds: productiveSec,
      overtimeSeconds: overSec,
      status,
      notes: '',
      isManual: false,
    }

    upsertAttendance(record)
    clearLiveSession()
    setSession(null)
    setElapsed(0)
    setBreakElapsed(0)
    return record
  }, [session, user, shiftConfig])

  const existingToday = user ? getAttendanceByDate(user.id, TODAY()) : null

  return {
    session,
    elapsed,
    totalBreakSeconds,
    productiveSeconds,
    remainingSeconds,
    overtimeSeconds,
    isComplete,
    shiftConfig,
    existingToday,
    signIn,
    startBreak,
    endBreak,
    signOut,
  }
}
