import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getUserByEmail, addUser } from '../utils/storage'

const ROLES = ['Employee', 'Manager', 'HR', 'Admin']
const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Legal', 'Other']

 const Field = ({ label, name, type = 'text', placeholder, children, form, handleChange, errors }) => (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      {children || (
        <input
          name={name}
          type={type}
          value={form?.[name]}
          onChange={handleChange}
          className={`input-field ${errors?.[name] ? 'border-danger/50' : ''}`}
          placeholder={placeholder}
        />
      )}
      {errors[name] && <p className="text-danger text-xs mt-1.5">{errors[name]}</p>}
    </div>
  )

export default function Register() {
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL) 
  console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: '', department: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Full name is required (min 2 chars)'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required'
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.role) errs.role = 'Please select a role'
    if (!form.department) errs.department = 'Please select a department'
    return errs
  }

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const existing = getUserByEmail(form.email.trim())
    if (existing) {
      setErrors({ email: 'An account with this email already exists' })
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600))

    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      department: form.department,
      createdAt: new Date().toISOString(),
      shiftConfig: { totalHours: 9, requiredHours: 8, breakAllowed: 1 }
    }

    addUser(user)
    toast.success('Account created! Please sign in.')
    navigate('/login')
  }

 

  return ( 
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-white">WorkLog</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-white mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Start tracking your WFH attendance professionally</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="name" placeholder="your name" form={form} handleChange={handleChange} errors={errors} />

              <Field label="Email Address" name="email" type="email" placeholder="you@company.com" form={form} handleChange={handleChange} errors={errors}/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    className={`input-field pr-11 ${errors.password ? 'border-danger/50' : ''}`}
                    placeholder="Min 6 characters"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
                {errors.password && <p className="text-danger text-xs mt-1.5">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'border-danger/50' : ''}`}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <p className="text-danger text-xs mt-1.5">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`input-field ${errors.role ? 'border-danger/50' : ''}`}
                >
                  <option value="">Select role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.role && <p className="text-danger text-xs mt-1.5">{errors.role}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={`input-field ${errors.department ? 'border-danger/50' : ''}`}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-danger text-xs mt-1.5">{errors.department}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-light hover:text-accent font-semibold transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
