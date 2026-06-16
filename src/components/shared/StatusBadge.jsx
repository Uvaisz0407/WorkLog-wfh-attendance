import React from 'react'

const statusMap = {
  Present:   { bg: 'bg-success/10',  text: 'text-success',   dot: 'bg-success'  },
  Absent:    { bg: 'bg-danger/10',   text: 'text-danger',    dot: 'bg-danger'   },
  'Half Day':{ bg: 'bg-warning/10',  text: 'text-warning',   dot: 'bg-warning'  },
  Leave:     { bg: 'bg-purple/10',   text: 'text-purple',    dot: 'bg-purple'   },
  Late:      { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
  Holiday: { bg: 'bg-purple-500/10', text: 'text-purple-400'},
  Completed: { bg: 'bg-accent/10',   text: 'text-accent-light', dot: 'bg-accent' },
  'On Break':{ bg: 'bg-warning/10',  text: 'text-warning',   dot: 'bg-warning'  },
}

export default function StatusBadge({ status }) {
  const s = statusMap[status] || { bg: 'bg-dark-500', text: 'text-slate-400', dot: 'bg-slate-500' }
  return (
    <span className={`status-badge ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || '--'}
    </span>
  )
}
