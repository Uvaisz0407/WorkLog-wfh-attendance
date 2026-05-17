import { format, parseISO, differenceInSeconds, differenceInMinutes } from 'date-fns'

export const TODAY = () => format(new Date(), 'yyyy-MM-dd')

export const formatTime = (date) => {
  if (!date) return '--:--'
  try {
    return format(new Date(date), 'hh:mm a')
  } catch {
    return '--:--'
  }
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy')
  } catch {
    return dateStr
  }
}

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '--'
  try {
    return format(parseISO(dateStr), 'dd MMM')
  } catch {
    return dateStr
  }
}

export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0h 0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}h ${m}m ${s}s`
}

export const formatDurationShort = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0h 0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export const formatDurationHours = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0.00'
  return (seconds / 3600).toFixed(2)
}

export const secondsToHHMM = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00:00'
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const timeStringToSeconds = (timeStr) => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h * 3600) + (m * 60)
}

export const calculateProductiveSeconds = (signInTime, signOutTime, breakSeconds) => {
  if (!signInTime || !signOutTime) return 0
  const totalSeconds = differenceInSeconds(new Date(signOutTime), new Date(signInTime))
  return Math.max(0, totalSeconds - (breakSeconds || 0))
}

export const calculateShiftSeconds = (signInTime, signOutTime) => {
  if (!signInTime || !signOutTime) return 0
  return Math.max(0, differenceInSeconds(new Date(signOutTime), new Date(signInTime)))
}

export const getStatus = (productiveSeconds, shiftConfig) => {
  const required = shiftConfig.requiredHours * 3600
  const halfDay = required * 0.5
  if (productiveSeconds <= 0) return 'Absent'
  if (productiveSeconds < halfDay) return 'Half Day'
  if (productiveSeconds >= required) return 'Completed'
  return 'Present'
}

export const getOvertimeSeconds = (productiveSeconds, shiftConfig) => {
  const required = shiftConfig.requiredHours * 3600
  return Math.max(0, productiveSeconds - required)
}

export const nowISO = () => new Date().toISOString()
