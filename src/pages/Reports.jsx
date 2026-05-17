import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getUserAttendance, getAllAttendance, getUsers } from '../utils/storage'
import { formatDate, formatDurationShort } from '../utils/time'
import { exportCSV, exportPDF } from '../utils/export'
import StatusBadge from '../components/shared/StatusBadge'
import toast from 'react-hot-toast'

export default function Reports() {
  const { user } = useAuth()
  const isAdmin = ['Admin', 'Manager', 'HR'].includes(user?.role)

  const [scope, setScope] = useState('mine')
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [statusFilter, setStatusFilter] = useState('All')

  const allUsers = useMemo(() => getUsers(), [])

  const rawRecords = useMemo(() => {
    if (scope === 'all' && isAdmin) return getAllAttendance()
    return getUserAttendance(user?.id)
  }, [scope, isAdmin, user?.id])

  const months = useMemo(() => {
    const set = new Set(rawRecords.map(r => r.date.slice(0, 7)))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [rawRecords])

  const filtered = useMemo(() => {
    let data = [...rawRecords]
    if (monthFilter) data = data.filter(r => r.date.startsWith(monthFilter))
    if (statusFilter !== 'All') data = data.filter(r => r.status === statusFilter)
    return data.sort((a, b) => b.date.localeCompare(a.date))
  }, [rawRecords, monthFilter, statusFilter])

  const stats = useMemo(() => {
    const totalProductive = filtered.reduce((s, r) => s + (r.productiveSeconds || 0), 0)
    const totalBreak = filtered.reduce((s, r) => s + (r.breakSeconds || 0), 0)
    const totalOvertime = filtered.reduce((s, r) => s + (r.overtimeSeconds || 0), 0)
    const totalShift = filtered.reduce((s, r) => s + (r.shiftSeconds || 0), 0)
    const byStatus = filtered.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {})
    return { totalProductive, totalBreak, totalOvertime, totalShift, byStatus, count: filtered.length }
  }, [filtered])

  const handleExportCSV = () => {
    if (filtered.length === 0) { toast.error('No records to export'); return }
    exportCSV(filtered, `attendance_${scope}_${monthFilter || 'all'}`)
    toast.success('CSV exported!')
  }

  const handleExportPDF = () => {
    if (filtered.length === 0) { toast.error('No records to export'); return }
    exportPDF(filtered, scope === 'mine' ? user : null, `attendance_${scope}_${monthFilter || 'all'}`)
    toast.success('PDF exported!')
  }

  const STATUSES = ['All', 'Present', 'Absent', 'Half Day', 'Leave', 'Late', 'Completed']

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Export and analyze attendance data</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button onClick={handleExportPDF} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        {isAdmin && (
          <div className="flex rounded-xl overflow-hidden border border-white/8">
            <button onClick={() => setScope('mine')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${scope === 'mine' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>
              My Records
            </button>
            <button onClick={() => setScope('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${scope === 'all' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>
              All Employees
            </button>
          </div>
        )}
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="input-field w-auto py-2">
          <option value="">All months</option>
          {months.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto py-2">
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-slate-500 text-sm ml-auto">{filtered.length} records</span>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Shift', value: formatDurationShort(stats.totalShift), color: 'text-white', bg: 'bg-dark-500' },
          { label: 'Productive', value: formatDurationShort(stats.totalProductive), color: 'text-accent-light', bg: 'bg-accent/10' },
          { label: 'Break Used', value: formatDurationShort(stats.totalBreak), color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Overtime', value: formatDurationShort(stats.totalOvertime), color: 'text-purple', bg: 'bg-purple/10' },
        ].map(s => (
          <div key={s.label} className={`glass-card rounded-2xl p-4 ${s.bg} border border-white/5`}>
            <div className="text-xs text-slate-500 mb-2 font-medium">{s.label}</div>
            <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Status breakdown */}
      {Object.keys(stats.byStatus).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Status Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2.5 bg-dark-600 rounded-xl px-4 py-2.5">
                <StatusBadge status={status} />
                <span className="text-white font-bold text-sm">{count}</span>
                <span className="text-slate-500 text-xs">days</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No records match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  {scope === 'all' && <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>}
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sign In</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sign Out</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Productive</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Break</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Overtime</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr key={`${r.date}-${r.userId}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="table-row">
                    <td className="px-4 py-3.5 text-sm text-white font-medium whitespace-nowrap">{formatDate(r.date)}</td>
                    {scope === 'all' && (
                      <td className="px-4 py-3.5 text-sm text-slate-300 whitespace-nowrap">
                        <div>{r.userName || '--'}</div>
                        <div className="text-xs text-slate-600">{r.department}</div>
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-sm text-slate-400 font-mono whitespace-nowrap">
                      {r.signIn ? new Date(r.signIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-400 font-mono whitespace-nowrap">
                      {r.signOut ? new Date(r.signOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-accent-light font-mono whitespace-nowrap">{formatDurationShort(r.productiveSeconds)}</td>
                    <td className="px-4 py-3.5 text-sm text-warning font-mono whitespace-nowrap">{formatDurationShort(r.breakSeconds)}</td>
                    <td className="px-4 py-3.5 text-sm text-purple font-mono whitespace-nowrap">{formatDurationShort(r.overtimeSeconds)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[150px] truncate">{r.notes || '--'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
