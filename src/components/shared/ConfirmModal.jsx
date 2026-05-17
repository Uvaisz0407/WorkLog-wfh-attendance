import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative glass-card rounded-2xl p-6 w-full max-w-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${danger ? 'bg-danger/10' : 'bg-warning/10'}`}>
              {danger ? (
                <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-display font-semibold text-white text-center mb-2">{title}</h3>
            <p className="text-slate-400 text-sm text-center mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 btn-secondary justify-center">Cancel</button>
              <button
                onClick={onConfirm}
                className={`flex-1 justify-center font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm ${danger ? 'bg-danger hover:bg-red-600 text-white' : 'bg-warning hover:bg-yellow-500 text-dark-900'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
