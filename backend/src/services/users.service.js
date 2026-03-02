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

  // Generate signed URLs for all users with photos
  const users = await Promise.all(
    data.map(async (u) => {
      const userObj = { ...u }

      if (u.id_photo_url) {
        try {
          const signedUrl = await getSignedUrl(u.id_photo_url, 7200) // 2 hours
          userObj.photo_signed_url = signedUrl
          console.log(`✅ Signed URL generated for user ${u.id}: ${signedUrl ? 'OK' : 'FAILED'}`)
        } catch (err) {
          console.error(`❌ Signed URL failed for user ${u.id}:`, err.message)
          userObj.photo_signed_url = null
        }
      } else {
        userObj.photo_signed_url = null
      }

      return userObj
    })
  )

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

  // Add signed photo URL
  if (data.id_photo_url) {
    try {
      data.photo_signed_url = await getSignedUrl(data.id_photo_url, 3600)
    } catch {
      data.photo_signed_url = null
    }
  }

  return data
}

module.exports = { getMe, getPendingUsers, getAllUsers, getUserById }