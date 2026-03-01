const { supabase } = require('../config/supabase')
const { getSignedUrl } = require('./storage.service')

const getMe = async (clerk_id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerk_id)
    .single()

  if (error || !data) throw { status: 404, message: 'Useri nuk u gjet' }
  return data
}

const getPendingUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw { status: 500, message: error.message }

  const users = await Promise.all(data.map(async (u) => {
    if (u.id_photo_url) {
      try {
        u.photo_signed_url = await getSignedUrl(u.id_photo_url)
      } catch {
        u.photo_signed_url = null
      }
    }
    return u
  }))

  return users
}

const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, personal_id, role, verification_status, created_at')
    .order('created_at', { ascending: false })

  if (error) throw { status: 500, message: error.message }
  return data
}

const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw { status: 404, message: 'Useri nuk u gjet' }
  return data
}

module.exports = { getMe, getPendingUsers, getAllUsers, getUserById }