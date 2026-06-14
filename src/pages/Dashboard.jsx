import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getUserAttendance, getAllAttendance } from '../services/attendanceService'
import { getUsers } from '../services/userService'
import { formatDurationShort, formatDate, TODAY } from '../utils/time'
import LiveTimer from '../components/dashboard/LiveTimer'
import StatusBadge from '../components/shared/StatusBadge'
import { Link } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay }
})

function StatCard({ label, value, sub, color = 'accent', icon }) {
  const colors = {
    accent: { bg: 'bg-accent/10', text: 'text-accent-light', border: 'border-accent/15' },
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/15' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/15' },
    purple: { bg: 'bg-purple/10', text: 'text-purple', border: 'border-purple/15' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/15' },
  }[color]

  return (
    <div className={`stat-card border ${colors.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-display font-bold ${colors.text} mb-1`}>{value}</div>
      <div className="text-slate-500 text-xs font-medium">{label}</div>
      {sub && <div className="text-slate-600 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
const { user } = useAuth()

const [attendance, setAttendance] = useState([])
const [users, setUsers] = useState([])
const [loading, setLoading] = useState(true)

const today = new Date().toISOString().split('T')[0]
useEffect(() => {
  async function loadData() {
    try {
      setLoading(true)

      const usersData = await getUsers()
      setUsers(usersData)

      if (['Admin', 'Manager', 'HR'].includes(user?.role)) {
        const attendanceData = await getAllAttendance()
        setAttendance(attendanceData || [])
      } else {
        const attendanceData = await getUserAttendance(user?.id)
        setAttendance(attendanceData || [])
      }
    } catch (error) {
      console.error('Dashboard Load Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    loadData()
  }
}, [user])
const presentToday = new Set(
  attendance
    .filter(
      r =>
        r.date === today &&
        r.check_in
    )
    .map(r => r.user_id)
).size
 
  const thisMonth = useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return attendance.filter(r => r.date.startsWith(ym))
  }, [attendance])

 const stats = useMemo(() => {
  const present = thisMonth.filter(
  r => r.check_in
).length
  const totalProductive = thisMonth.reduce((s, r) => s + (r.productive_seconds || 0), 0)
  const totalBreak = thisMonth.reduce((s, r) => s + (r.break_seconds || 0), 0)

  const absent = thisMonth.filter(r => r.status === 'Absent').length
  const leave = thisMonth.filter(r => r.status === 'Leave').length

  return {
    present,
    totalProductive,
    totalBreak,
    absent,
    leave,
    total: thisMonth.length
  }
}, [thisMonth])

const todayStats = useMemo(() => {
  if (!['Admin', 'Manager', 'HR'].includes(user?.role)) return null

const activeUsers = users.filter(
  u => !['Admin', 'Manager', 'HR'].includes(u.role)
)

  const todayRecords = attendance.filter(
  r =>
    r.date === today &&
    r.check_in
)
  const presentToday = todayRecords.length
  const totalEmployees = users.length
  const absentToday = totalEmployees - presentToday

  return {
    totalEmployees,
    presentToday,
    absentToday,
  }
}, [user, attendance, users])

const recent = attendance.slice(0, 5)

return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user?.department} · {user?.role}</p>
        </div>
        <Link to="/attendance" className="btn-secondary hidden sm:flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Manage Attendance
        </Link>
      </motion.div>

      {/* Live Timer */}
      <motion.div {...fadeUp(0.05)}>
        <LiveTimer />
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.1)}>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">This Month</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
         

{todayStats && (
  <>
    <StatCard
      label="Total Employees"
      value={todayStats.totalEmployees}
      color="accent"
    />

    <StatCard
      label="Present Today"
      value={todayStats.presentToday}
      color="success"
    />

    <StatCard
      label="Absent Today"
      value={todayStats.absentToday}
      color="danger"
    />
  </>
)}
          {!['Admin', 'Manager', 'HR'].includes(user?.role) && (
  <>
    <StatCard label="Days Present" value={stats.present} color="success"
      icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />

    <StatCard label="Days Absent" value={stats.absent} color="danger"
      icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />

    <StatCard label="Leave Days" value={stats.leave} color="purple"
      icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
  </>
)}

<StatCard label="Productive" value={formatDurationShort(stats.totalProductive)} color="accent"
  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />

<StatCard label="Break Used" value={formatDurationShort(stats.totalBreak)} color="warning"
  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          
        </div>
      </motion.div>

      {/* Recent Attendance */}
      <motion.div {...fadeUp(0.15)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Attendance</h2>
          <Link to="/attendance" className="text-accent-light hover:text-accent text-xs font-medium transition-colors">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-dark-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No attendance records yet</p>
            <p className="text-slate-600 text-xs mt-1">Sign in or add manual attendance to get started</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee Name</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Productive Hours</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Shift Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <motion.tr
                      key={`${r.date}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="table-row"
                    >
                      <td className="px-5 py-3.5 text-sm text-white font-medium">
  {r.user_name}
</td>
                      <td className="px-5 py-3.5 text-sm text-white font-medium">{formatDate(r.date)}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-mono">
  {r.check_in
    ? new Date(r.check_in).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '--'}
</td>

<td className="px-5 py-3.5 text-sm text-slate-400 font-mono">
  {r.check_out
    ? new Date(r.check_out).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '--'}
</td>
                      <td className="px-5 py-3.5 text-sm text-accent-light font-mono">{formatDurationShort(r.productive_seconds)}</td>
                     
                      <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
