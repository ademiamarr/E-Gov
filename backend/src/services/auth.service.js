const { supabase } = require('../config/supabase')
const resend = require('../config/resend')
const { uploadIdPhoto } = require('./storage.service')
const verifyCodeEmail = require('../email/templates/verify-code.email')
const welcomePendingEmail = require('../email/templates/welcome-pending.email')
const approvedEmail = require('../email/templates/approved.email')
const rejectedEmail = require('../email/templates/rejected.email')
const { validateEMBG } = require('../utils/validateEMBG')
const { generateVerifyCode } = require('../utils/generateVerifyCode')

const register = async ({ clerk_id, first_name, last_name, personal_id, email, file }) => {
  if (!validateEMBG(personal_id)) {
    throw { status: 400, message: 'EMBG i pavlefshëm' }
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`personal_id.eq.${personal_id},email.eq.${email}`)
    .maybeSingle()

  if (existing) {
    throw { status: 400, message: 'Ky EMBG ose email ekziston tashmë' }
  }

  let id_photo_url = null
  if (file) {
    id_photo_url = await uploadIdPhoto(file, personal_id)
  }

  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      clerk_id,
      first_name,
      last_name,
      personal_id,
      email,
      id_photo_url,
      role: 'pending',
      verification_status: 'pending'
    }])
    .select()
    .single()

  if (error) throw { status: 500, message: error.message }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    ...welcomePendingEmail({ first_name })
  })

  return user
}

const approveUser = async (id) => {
  const { data: user, error } = await supabase
    .from('users')
    .update({ role: 'user', verification_status: 'approved' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw { status: 500, message: error.message }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    ...approvedEmail({
      first_name: user.first_name,
      login_url: `${process.env.FRONTEND_URL}/login`
    })
  })

  return user
}

const rejectUser = async (id, reason) => {
  const { data: user, error } = await supabase
    .from('users')
    .update({ role: 'rejected', verification_status: 'rejected' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw { status: 500, message: error.message }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    ...rejectedEmail({ first_name: user.first_name, reason })
  })

  return user
}

module.exports = { register, approveUser, rejectUser }