import { supabase } from '../lib/supabase'

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')

  if (error) throw error

  return data || []
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

export async function updateUser(id, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteUser(id) {

  const { error: attendanceError } = await supabase
    .from('attendance_records')
    .delete()
    .eq('user_id', id)

  if (attendanceError) throw attendanceError

  const { error: userError } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (userError) throw userError

  return true
}