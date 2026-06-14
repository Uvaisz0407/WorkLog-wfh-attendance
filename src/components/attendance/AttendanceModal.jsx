import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDurationShort, getOvertimeSeconds, getStatus } from '../../utils/time'

const STATUSES = ['Present', 'Absent', 'Half Day', 'Leave', 'Late', 'Completed']

const timeToISO = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null
  try {
    return new Date(`${dateStr}T${timeStr}`).toISOString()
  } catch { return null }
}

const isoToTime = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch { return '' }
}

export default function AttendanceModal({ open, onClose, onSave, record, userId, userName, department, role }) {
  const isEdit = !!record

  const [form, setForm] = useState({
    date: '', signIn: '', signOut: '', breakMinutes: '0', status: 'Present', notes: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (record) {
        setForm({
          date: record.date || '',
          signIn: isoToTime(record.check_in),
          signOut: isoToTime(record.check_out),
          breakMinutes: record.break_seconds ? String(Math.round(record.break_seconds / 60)) : '0',
          status: record.status || 'Present',
          notes: record.notes || '',
        })
      } else {
        const today = new Date().toISOString().slice(0, 10)
        setForm({ date: today, signIn: '09:00', signOut: '', breakMinutes: '60', status: 'Present', notes: '' })
      }
      setErrors({})
    }
  }, [open, record])

  const calc = () => {
    if (!form.signIn || !form.signOut || !form.date) return null
    try {
      const signInISO = timeToISO(form.date, form.signIn)
      const signOutISO = timeToISO(form.date, form.signOut)
      if (!signInISO || !signOutISO) return null
      const shiftSec = Math.max(0, (new Date(signOutISO) - new Date(signInISO)) / 1000)
      const breakSec = Math.max(0, (parseInt(form.breakMinutes) || 0) * 60)
      const productiveSec = Math.max(0, shiftSec - breakSec)
      const shiftConfig = { requiredHours: 8 }
      return { shiftSec, breakSec, productiveSec}
    } catch { return null }
  }

  const preview = calc()

  const validate = () => {
    const e = {}
    if (!form.date) e.date = 'Date is required'
    if (form.status !== 'Absent' && form.status !== 'Leave') {
      if (!form.signIn) e.signIn = 'Sign in time required'
      if (form.signOut && form.signIn && form.signOut <= form.signIn) e.signOut = 'Sign out must be after sign in'
    }
    return e
  }

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const signInISO = timeToISO(form.date, form.signIn)
    const signOutISO = timeToISO(form.date, form.signOut)
    const breakSec = Math.max(0, (parseInt(form.breakMinutes) || 0) * 60)
    const shiftSec = (signInISO && signOutISO)
      ? Math.max(0, (new Date(signOutISO) - new Date(signInISO)) / 1000) : 0
    const productiveSec = Math.max(0, shiftSec - breakSec)
    const shiftConfig = { requiredHours: 9 }
    

  onSave({
  user_id: userId,
  user_name: userName,
  department,
  role,

  date: form.date,

  check_in: signInISO,
  check_out: signOutISO,

  break_seconds: breakSec,
  shift_seconds: shiftSec,
  productive_seconds: productiveSec,

  status: form.status,
  notes: form.notes,

  is_manual: true,
})
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22 }}
            className="relative glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 glass-card border-b border-white/5 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-lg font-display font-semibold text-white">{isEdit ? 'Edit Attendance' : 'Add Attendance'}</h2>
                <p className="text-slate-500 text-xs">{userName} · {department}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-dark-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange}
                  className={`input-field ${errors.date ? 'border-danger/50' : ''}`}
                  disabled={isEdit} />
                {errors.date && <p className="text-danger text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Sign In Time</label>
                  <input name="signIn" type="time" value={form.signIn} onChange={handleChange}
                    className={`input-field ${errors.signIn ? 'border-danger/50' : ''}`} />
                  {errors.signIn && <p className="text-danger text-xs mt-1">{errors.signIn}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Sign Out Time</label>
                  <input name="signOut" type="time" value={form.signOut} onChange={handleChange}
                    className={`input-field ${errors.signOut ? 'border-danger/50' : ''}`} />
                  {errors.signOut && <p className="text-danger text-xs mt-1">{errors.signOut}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Break (minutes)</label>
                  <input name="breakMinutes" type="number" min="0" max="480" value={form.breakMinutes} onChange={handleChange}
                    className="input-field" placeholder="60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="input-field">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="bg-dark-600 rounded-xl p-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Shift Duration</div>
                    <div className="text-sm font-semibold text-white">{formatDurationShort(preview.shiftSec)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Break</div>
                    <div className="text-sm font-semibold text-warning">{formatDurationShort(preview.breakSec)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Productive</div>
                    <div className="text-sm font-semibold text-accent-light">{formatDurationShort(preview.productiveSec)}</div>
                  </div>
                  <div>
                    
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  className="input-field resize-none" rows={2} placeholder="Any notes for this day..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 btn-secondary justify-center">Cancel</button>
                <button onClick={handleSave} className="flex-1 btn-primary justify-center">
                  {isEdit ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
