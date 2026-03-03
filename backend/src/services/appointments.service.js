const { supabase } = require('../config/supabase')
const { sendEmail } = require('../config/resend')
const appointmentConfirmEmail = require('../email/templates/appointment-confirm.email')
const appointmentReminderEmail = require('../email/templates/appointment-reminder.email')
const { formatDate } = require('../utils/formatDate')

const getMyAppointments = async (user_id) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) throw { status: 500, message: error.message }
  return data
}

const getAllAppointments = async (institution = null) => {
  let query = supabase
    .from('appointments')
    .select('*, users(first_name, last_name, email, personal_id)')
    .order('created_at', { ascending: false })

  if (institution) query = query.eq('institution', institution)

  const { data, error } = await query
  if (error) throw { status: 500, message: error.message }
  return data
}

const bookAppointment = async ({ user_id, user_email, user_first_name, institution, reason, appointment_date }) => {
  const { data: appt, error } = await supabase
    .from('appointments')
    .insert([{
      user_id,
      institution,
      reason,
      appointment_date: appointment_date || null,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) throw { status: 500, message: error.message }

  try {
    await sendEmail({
      to: user_email,
      ...appointmentConfirmEmail({
        first_name: user_first_name,
        institution,
        reason,
        date: appointment_date ? formatDate(new Date(appointment_date)) : 'Do të konfirmohet nga admini',
        reference_id: `APPT-${appt.id.slice(0, 8).toUpperCase()}`
      })
    })
  } catch (emailErr) {
    console.warn('⚠️ Email konfirmimi dështoi:', emailErr.message)
  }

  return appt
}

const updateAppointment = async (id, { status, admin_note, approved_date }) => {
  const { data: appt, error } = await supabase
    .from('appointments')
    .update({ status, admin_note, approved_date: approved_date || null })
    .eq('id', id)
    .select('*, users(first_name, last_name, email)')
    .single()

  if (error) throw { status: 500, message: error.message }
  return appt
}

// ✅ CANCEL APPOINTMENT (per qytetari)
const cancelAppointment = async (appointment_id, user_id, reason = null) => {
  // Kontrollo pronësinë
  const { data: appt, error: fetchErr } = await supabase
    .from('appointments')
    .select('user_id, status')
    .eq('id', appointment_id)
    .single()

  if (fetchErr || !appt) throw { status: 404, message: 'Termini nuk u gjet' }
  if (appt.user_id !== user_id) throw { status: 403, message: 'Nuk keni akses' }
  
  // Vetëm pending/approved mund të anulohen
  if (!['pending', 'approved'].includes(appt.status)) {
    throw { status: 400, message: 'Ky termin nuk mund të anulohet' }
  }

  // Ažuroni statusin
  const { data: updated, error } = await supabase
    .from('appointments')
    .update({ 
      status: 'cancelled', 
      cancelled_at: new Date().toISOString(),
      notes: reason || null 
    })
    .eq('id', appointment_id)
    .select()
    .single()

  if (error) throw { status: 500, message: error.message }
  return updated
}

// ✅ RESCHEDULE APPOINTMENT (per qytetari)
const rescheduleAppointment = async (appointment_id, user_id, newDate, newTime = null) => {
  // Kontrollo pronësinë
  const { data: appt, error: fetchErr } = await supabase
    .from('appointments')
    .select('user_id, status, appointment_date')
    .eq('id', appointment_id)
    .single()

  if (fetchErr || !appt) throw { status: 404, message: 'Termini nuk u gjet' }
  if (appt.user_id !== user_id) throw { status: 403, message: 'Nuk keni akses' }
  
  // Vetëm pending/approved mund të riprogramohen
  if (!['pending', 'approved'].includes(appt.status)) {
    throw { status: 400, message: 'Ky termin nuk mund të riprogramohet' }
  }

  // Validimi i datës
  const newDateObj = new Date(newDate)
  if (isNaN(newDateObj.getTime())) {
    throw { status: 400, message: 'Data e pavlefshme' }
  }

  // Kombinironi datën dhe orën
  let finalDateTime = newDateObj
  if (newTime) {
    const [h, m] = newTime.split(':')
    if (!isNaN(+h) && !isNaN(+m)) {
      finalDateTime.setHours(+h, +m, 0, 0)
    }
  }

  // Ažuroni
  const { data: updated, error } = await supabase
    .from('appointments')
    .update({ 
      appointment_date: finalDateTime.toISOString(),
      rescheduled_at: new Date().toISOString(),
      rescheduled_count: (appt.rescheduled_count || 0) + 1
    })
    .eq('id', appointment_id)
    .select()
    .single()

  if (error) throw { status: 500, message: error.message }
  return updated
}

const sendReminder = async (appointment_id) => {
  const { data: appt, error } = await supabase
    .from('appointments')
    .select('*, users(first_name, last_name, email)')
    .eq('id', appointment_id)
    .single()

  if (error || !appt) throw { status: 404, message: 'Termini nuk u gjet' }

  await sendEmail({
    to: appt.users.email,
    ...appointmentReminderEmail({
      first_name: appt.users.first_name,
      institution: appt.institution,
      reason: appt.reason,
      date: formatDate(new Date(appt.approved_date)),
      reference_id: `APPT-${appt.id.slice(0, 8).toUpperCase()}`
    })
  })

  return { sent: true }
}

module.exports = { 
  getMyAppointments, 
  getAllAppointments, 
  bookAppointment, 
  updateAppointment, 
  cancelAppointment,        // ✅ NEW
  rescheduleAppointment,    // ✅ NEW
  sendReminder 
}