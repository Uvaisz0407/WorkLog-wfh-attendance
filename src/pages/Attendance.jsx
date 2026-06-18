import React, { useState, useMemo, useCallback, useEffect} from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  getUserAttendance,
  getAttendanceByDate,
  getAllAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance
} from '../services/attendanceService'
import { formatDate, formatDurationShort, TODAY } from '../utils/time'
import StatusBadge from '../components/shared/StatusBadge'
import AttendanceModal from '../components/attendance/AttendanceModal'
import ConfirmModal from '../components/shared/ConfirmModal'
import toast from 'react-hot-toast'

const STATUSES = ['All', 'Present', 'Absent', 'Half Day', 'Leave', 'Late', 'Completed', 'Holiday']

export default function Attendance() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [monthFilter, setMonthFilter] = useState('')
  const [modal, setModal] = useState({ open: false, record: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, record: null })
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

 const loadAttendance = async () => {
   try {
    let data = []

    if (['Admin', 'Manager', 'HR'].includes(user?.role)) {
      const { getAllAttendance } = await import('../services/attendanceService')
      data = await getAllAttendance()
    } else {
      data = await getUserAttendance(user.id)
    }

    setRecords(
      (data || []).sort((a, b) =>
        b.date.localeCompare(a.date)
      )
    )
  } catch (error) {
    console.error(error)
    toast.error('Failed to load attendance')
  }
}

useEffect(() => {
  if (user?.id) {
    loadAttendance()
  }
}, [user])

  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR'

  const filtered = useMemo(() => {
    let data = [...records]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r => r.date.includes(q) || (r.status || '').toLowerCase().includes(q) || (r.notes || '').toLowerCase().includes(q))
    }
    if (statusFilter !== 'All') data = data.filter(r => r.status === statusFilter)
    if (monthFilter) data = data.filter(r => r.date.startsWith(monthFilter))

    data.sort((a, b) => {
      let av = a[sortField] || ''
      let bv = b[sortField] || ''
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return data
  }, [records, search, statusFilter, monthFilter, sortField, sortDir])

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleSave = useCallback(async (data) => {
  try {

    if (modal.record) {

      await updateAttendance(
        modal.record.id,
        data
      )

      toast.success('Attendance updated!')

    } else {

      await createAttendance(data)

      toast.success('Attendance added!')
    }

    setModal({
      open: false,
      record: null
    })

    loadAttendance()

  } catch (error) {

    console.error(error)

    toast.error(
      error.message ||
      'Failed to save attendance'
    )
  }
}, [modal.record])

  const handleDelete = async () => {
  if (!deleteModal.record) return

  try {
    await deleteAttendance(deleteModal.record.id)

    await loadAttendance()

    toast.success('Record deleted')

    setDeleteModal({
      open: false,
      record: null
    })

  } catch (error) {
    console.error(error)
    toast.error('Failed to delete record')
  }
}
  const SortIcon = ({ field }) => (
    <span className={`ml-1 ${sortField === field ? 'text-accent-light' : 'text-slate-600'}`}>
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  const months = useMemo(() => {
    const set = new Set(records.map(r => r.date.slice(0, 7)))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [records])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Attendance</h1>
         <p className="text-slate-500 text-sm mt-1">
  {records.length} total records
  {isAdmin ? ' · All Employees' : ` · ${user?.name}`}
</p>
        </div>
        
        <button onClick={() => setModal({ open: true, record: null })} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Attendance
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2" placeholder="Search records..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto py-2">
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="input-field w-auto py-2">
          <option value="">All months</option>
          {months.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>)}
        </select>
        {(search || statusFilter !== 'All' || monthFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter('All'); setMonthFilter('') }}
            className="text-slate-500 hover:text-white text-sm transition-colors px-2">Clear</button>
        )}
        <span className="text-slate-600 text-sm ml-auto">{filtered.length} records</span>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-dark-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No records found</p>
            <button onClick={() => setModal({ open: true, record: null })} className="text-accent-light text-sm mt-2 hover:underline">
              Add attendance record →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    
  ...(isAdmin
    ? [{ label: 'Employee', field: 'user_name' }]
    : []),

  { label: 'Date', field: 'date' },
  { label: 'Check In', field: 'check_in' },
  { label: 'Check Out', field: 'check_out' },
  { label: 'Shift', field: 'shift_seconds' },
  { label: 'Break', field: 'break_seconds' },
  { label: 'Productive', field: 'productive_seconds' },
  { label: 'Status', field: 'status' },

                  ].map(col => (
                    <th key={col.field}
                      className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none whitespace-nowrap"
                      onClick={() => handleSort(col.field)}>
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr key={`${r.date}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="table-row">
                      {isAdmin && (
  <td className="px-4 py-3.5 text-sm text-white whitespace-nowrap">
    {r.user_name}
  </td>
)}
                    <td className="px-4 py-3.5 text-sm text-white font-medium whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-400 font-mono whitespace-nowrap">
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit'
}) : '--'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-400 font-mono whitespace-nowrap">
                     {r.check_out ? new Date(r.check_out).toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit'
}) : '--'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-300 font-mono whitespace-nowrap">{formatDurationShort(r.shift_seconds)}</td>
                    <td className="px-4 py-3.5 text-sm text-warning font-mono whitespace-nowrap">{formatDurationShort(r.break_seconds)}</td>
                    <td className="px-4 py-3.5 text-sm text-accent-light font-mono whitespace-nowrap">{formatDurationShort(r.productive_seconds)}</td>

                    <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setModal({ open: true, record: r })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-accent-light hover:bg-accent/10 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, record: r })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AttendanceModal
        open={modal.open}
        onClose={() => setModal({ open: false, record: null })}
        onSave={handleSave}
        record={modal.record}
        userId={user?.id}
        userName={user?.name}
        department={user?.department}
        role={user?.role}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Delete Record"
        message={`Delete attendance for ${formatDate(deleteModal.record?.date)}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, record: null })}
        confirmLabel="Delete"
      />
    </div>
  )
}
