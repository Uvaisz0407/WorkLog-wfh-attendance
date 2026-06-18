import { supabase } from '../lib/supabase'

export async function getUserAttendance(userId) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error

  return data || []
}

export async function getAllAttendance() {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error

  return data || []
}

export async function getAttendanceByDate(userId, date) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function createAttendance(record) {

  const existing = await getAttendanceByDate(
    record.user_id,
    record.date
  )

  if (existing) {
    throw new Error(
      'Attendance for this date already exists. Use Edit instead.'
    )
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .insert([record])
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateAttendance(id, updates) {
  const { data, error } = await supabase
    .from('attendance_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteAttendance(id) {
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', id)

  if (error) throw error

  return true
}