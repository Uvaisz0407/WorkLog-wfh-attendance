import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, formatDurationShort, formatTime } from './time'

export const exportCSV = (records, filename = 'attendance') => {
  console.log("CSV RECORD:", records[0])
  const rows = records.map(r => ({
    'Date': formatDate(r.date),
    'Employee': r.user_name || '--',
    'Department': r.department || '--',
    'Sign In': formatTime(r.check_in),
    'Sign Out': formatTime(r.check_out),
    'Shift Duration': formatDurationShort(r.shift_seconds),
    'Break Duration': formatDurationShort(r.break_seconds),
    'Productive Hours': formatDurationShort(r.productive_seconds),
   
    'Status': r.status || '--',
    'Notes': r.notes || '',
  }))

  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export const exportPDF = (records, user, filename = 'attendance') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header background
  doc.setFillColor(8, 12, 20)
  doc.rect(0, 0, 297, 297, 'F')

  // Title bar
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, 297, 18, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('WorkLog — Attendance Report', 14, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 12)

  // Meta
  doc.setFillColor(13, 18, 32)
  doc.roundedRect(14, 22, 270, 22, 3, 3, 'F')
  doc.setTextColor(160, 174, 192)
  doc.setFontSize(9)
  doc.text(`Employee: ${user?.name || 'All Employees'}`, 20, 30)
  doc.text(`Department: ${user?.department || '--'}`, 80, 30)
  doc.text(`Role: ${user?.role || '--'}`, 150, 30)
  doc.text(`Total Records: ${records.length}`, 210, 30)

  const totalProductive = records.reduce((s, r) => s + (r.productive_seconds || 0), 0)
  
  doc.text(`Total Productive: ${formatDurationShort(totalProductive)}`, 20, 38)
  

  const statusCounts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})
  const statusText = Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join('  |  ')
  doc.text(statusText, 150, 38)

  // Table
  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Employee', 'Sign In', 'Sign Out', 'Shift', 'Break', 'Productive', 'Status', 'Notes']],
    body: records.map(r => [
      formatDate(r.date),
      r.user_name || '--',
      formatTime(r.check_in),
      formatTime(r.check_out),
      formatDurationShort(r.shift_seconds),
      formatDurationShort(r.break_seconds),
      formatDurationShort(r.productive_seconds),
      
      r.status || '--',
      r.notes || '',
    ]),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: 'helvetica',
      textColor: [226, 232, 240],
      fillColor: [13, 18, 32],
      lineColor: [30, 42, 66],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [26, 34, 53],
      textColor: [96, 165, 250],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [17, 24, 39],
    },
    columnStyles: {
      8: {
        fontStyle: 'bold',
        textColor: [16, 185, 129],
      },
    },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(`Page ${i} of ${pageCount}`, 270, 205, { align: 'right' })
    doc.text('WorkLog — WFH Attendance Management', 14, 205)
  }

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
