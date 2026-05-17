import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getUsers, updateUser, deleteUser } from '../utils/storage'
import ConfirmModal from '../components/shared/ConfirmModal'
import toast from 'react-hot-toast'

const ROLES = ['Employee', 'Manager', 'HR', 'Admin']
const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Legal', 'Other']

const roleColor = {
  Admin: 'text-purple-400 bg-purple-500/10',
  Manager: 'text-blue-400 bg-blue-500/10',
  HR: 'text-yellow-400 bg-yellow-500/10',
  Employee: 'text-green-400 bg-green-500/10',
}

export default function Employees() {
  const { user } = useAuth()
  const [users, setUsers] = useState(() => getUsers())
  const [search, setSearch] = useState('')
  const [editModal, setEditModal] = useState({ open: false, employee: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null })
  const [editForm, setEditForm] = useState({})
  const [editErrors, setEditErrors] = useState({})

  const isAdmin = ['Admin', 'Manager', 'HR'].includes(user?.role)

  const refresh = () => setUsers(getUsers())

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    )
  }, [users, search])

  const openEdit = (emp) => {
    setEditForm({
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || 'Employee',
      department: emp.department || '',
    })
    setEditErrors({})
    setEditModal({ open: true, employee: emp })
  }

  const handleEditSave = () => {
    const e = {}
    if (!editForm.name.trim()) e.name = 'Name is required'
    if (!editForm.role) e.role = 'Role is required'
    if (!editForm.department) e.department = 'Department is required'
    if (Object.keys(e).length > 0) { setEditErrors(e); return }

    updateUser(editModal.employee.id, {
      name: editForm.name.trim(),
      role: editForm.role,
      department: editForm.department,
    })
    toast.success('Employee updated successfully')
    setEditModal({ open: false, employee: null })
    refresh()
  }

  const handleDelete = () => {
    if (!deleteModal.employee) return
    if (deleteModal.employee.id === user.id) {
      toast.error("You can't delete your own account")
      setDeleteModal({ open: false, employee: null })
      return
    }
    deleteUser(deleteModal.employee.id)
    toast.success('Employee removed')
    setDeleteModal({ open: false, employee: null })
    refresh()
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} registered accounts</p>
        </div>
      </motion.div>

      {!isAdmin && (
        <div className="p-4 rounded-xl border border-warning/20 bg-warning/5 text-warning text-sm">
          You have read-only access. Only Admin, Manager, and HR can edit employee records.
        </div>
      )}

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-4 flex gap-3 items-center">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2" placeholder="Search employees..." />
        </div>
        <span className="text-slate-600 text-sm">{filtered.length} found</span>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-dark-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No employees found</p>
          <p className="text-slate-600 text-sm mt-1">Users will appear here once they register</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp, i) => (
            <motion.div key={emp.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-light font-bold text-base">{emp.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm leading-tight">
                      {emp.name}
                      {emp.id === user?.id && <span className="ml-2 text-xs text-accent-light">(You)</span>}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5 truncate max-w-[140px]">{emp.email}</div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(emp)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-accent-light hover:bg-accent/10 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {emp.id !== user?.id && (
                      <button onClick={() => setDeleteModal({ open: true, employee: emp })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${roleColor[emp.role] || 'text-slate-400 bg-dark-500'}`}>
                  {emp.role}
                </span>
                <span className="text-xs text-slate-500 bg-dark-600 px-2.5 py-1 rounded-lg">{emp.department}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-600">
                Joined {new Date(emp.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditModal({ open: false, employee: null })} />
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            className="relative glass-card rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-display font-semibold text-white mb-5">Edit Employee</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className={`input-field ${editErrors.name ? 'border-danger/50' : ''}`} />
                {editErrors.name && <p className="text-danger text-xs mt-1">{editErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                  className="input-field">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Department</label>
                <select value={editForm.department} onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))}
                  className="input-field">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditModal({ open: false, employee: null })} className="flex-1 btn-secondary justify-center">Cancel</button>
                <button onClick={handleEditSave} className="flex-1 btn-primary justify-center">Save</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        open={deleteModal.open}
        title="Remove Employee"
        message={`Remove ${deleteModal.employee?.name} from the system? Their attendance data will be preserved.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, employee: null })}
        confirmLabel="Remove"
      />
    </div>
  )
}
