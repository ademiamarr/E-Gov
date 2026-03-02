const { supabase } = require('../config/supabase')
const { sendEmail } = require('../config/resend')
const { uploadIdPhoto } = require('./storage.service')
const welcomePendingEmail = require('../email/templates/welcome-pending.email')
const approvedEmail = require('../email/templates/approved.email')
const rejectedEmail = require('../email/templates/rejected.email')
const { validateEMBG } = require('../utils/validateEMBG')

const register = async ({ clerk_id, first_name, last_name, personal_id, email, file }) => {
  console.log(`📝 Register attempt: ${email} | EMBG: ${personal_id}`)

  if (!personal_id) {
    throw { status: 400, message: 'EMBG është i detyrueshëm' }
  }

  const embgValidation = validateEMBG(personal_id)
  if (!embgValidation.valid) {
    throw { status: 400, message: embgValidation.error || 'EMBG i pavlefshëm' }
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id, clerk_id')
    .or(`personal_id.eq.${personal_id},email.eq.${email}`)
    .maybeSingle()

  if (existing && existing.clerk_id === clerk_id) {
    let id_photo_url = undefined
    if (file) {
      try {
        id_photo_url = await uploadIdPhoto(file, personal_id)
      } catch (photoErr) {
        console.error('❌ Photo upload failed:', photoErr.message)
      }
    }

    const updateData = {
      first_name,
      last_name,
      personal_id,
      email,
      role: 'pending',
      verification_status: 'pending',
    }
    if (id_photo_url) updateData.id_photo_url = id_photo_url

    const { data: updated, error: updateErr } = await supabase
      .from('users')
      .update(updateData)
      .eq('clerk_id', clerk_id)
      .select()
      .single()

    if (updateErr) throw { status: 500, message: updateErr.message }

    await sendEmail({
      to: email,
      ...welcomePendingEmail({ first_name })
    }).catch(err => console.error('⚠️ Welcome email failed:', err.message))

    return updated
  }

  if (existing) {
    throw { status: 400, message: 'Ky EMBG ose email ekziston tashmë' }
  }

  let id_photo_url = null
  if (file) {
    try {
      id_photo_url = await uploadIdPhoto(file, personal_id)
    } catch (photoErr) {
      console.error('❌ Photo upload failed:', photoErr.message)
    }
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
      verification_status: 'pending',
    }])
    .select()
    .single()

  if (error) {
    throw { status: 500, message: error.message }
  }

  try {
    await sendEmail({
      to: email,
      ...welcomePendingEmail({ first_name })
    })
  } catch (emailErr) {
    console.error('⚠️ Welcome email failed:', emailErr.message)
  }

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

  try {
    await sendEmail({
      to: user.email,
      ...approvedEmail({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        login_url: `${process.env.FRONTEND_URL}/login`
      })
    })
    console.log(`✅ Approval email sent to ${user.email}`)
  } catch (emailErr) {
    console.error('❌ Approve email failed:', emailErr.message)
  }

  console.log(`✅ User approved: ${user.email}`)
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

  try {
    await sendEmail({
      to: user.email,
      ...rejectedEmail({
        first_name: user.first_name,
        last_name: user.last_name,
        reason
      })
    })
    console.log(`✅ Rejection email sent to ${user.email}`)
  } catch (emailErr) {
    console.error('❌ Reject email failed:', emailErr.message)
  }

  console.log(`✅ User rejected: ${user.email} | Reason: ${reason}`)
  return user
}

module.exports = { register, approveUser, rejectUser }