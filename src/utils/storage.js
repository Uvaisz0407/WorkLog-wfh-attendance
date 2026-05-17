// Storage keys
export const KEYS = {
  USERS: 'wfh_users',
  SESSION: 'wfh_session',
  ATTENDANCE: 'wfh_attendance',
  LIVE_SESSION: 'wfh_live_session',
}

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage error:', e)
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {}
  },
}

// Users
export const getUsers = () => storage.get(KEYS.USERS) || []
export const saveUsers = (users) => storage.set(KEYS.USERS, users)

export const getUserByEmail = (email) => {
  const users = getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export const addUser = (user) => {
  const users = getUsers()
  users.push(user)
  saveUsers(users)
}

export const updateUser = (id, updates) => {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === id)
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates }
    saveUsers(users)
  }
}

export const deleteUser = (id) => {
  const users = getUsers().filter(u => u.id !== id)
  saveUsers(users)
}

// Session
export const getSession = () => storage.get(KEYS.SESSION)
export const setSession = (user) => storage.set(KEYS.SESSION, user)
export const clearSession = () => storage.remove(KEYS.SESSION)

// Attendance
export const getAllAttendance = () => storage.get(KEYS.ATTENDANCE) || []
export const saveAllAttendance = (records) => storage.set(KEYS.ATTENDANCE, records)

export const getUserAttendance = (userId) => {
  return getAllAttendance().filter(r => r.userId === userId)
}

export const getAttendanceByDate = (userId, date) => {
  return getAllAttendance().find(r => r.userId === userId && r.date === date) || null
}

export const upsertAttendance = (record) => {
  const all = getAllAttendance()
  const idx = all.findIndex(r => r.userId === record.userId && r.date === record.date)
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...record }
  } else {
    all.push(record)
  }
  saveAllAttendance(all)
}

export const deleteAttendance = (userId, date) => {
  const all = getAllAttendance().filter(r => !(r.userId === userId && r.date === date))
  saveAllAttendance(all)
}

// Live session
export const getLiveSession = () => storage.get(KEYS.LIVE_SESSION)
export const setLiveSession = (session) => storage.set(KEYS.LIVE_SESSION, session)
export const clearLiveSession = () => storage.remove(KEYS.LIVE_SESSION)
