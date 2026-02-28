const supabase = require('../config/supabase')
const resend = require('../config/resend')
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

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: user_email,
    ...appointmentConfirmEmail({
      first_name: user_first_name,
      institution,
      reason,
      date: appointment_date ? formatDate(new Date(appointment_date)) : 'Do të konfirmohet',
      reference_id: `APPT-${appt.id.slice(0, 8).toUpperCase()}`
    })
  })

  return appt
}

const updateAppointment = async (id, { status, admin_note, approved_date }) => {
  const { data: appt, error } = await supabase
    .from('appointments')
    .update({ status, admin_note, approved_date })
    .eq('id', id)
    .select('*, users(first_name, last_name, email)')
    .single()

  if (error) throw { status: 500, message: error.message }
  return appt
}

const sendReminder = async (appointment_id) => {
  const { data: appt, error } = await supabase
    .from('appointments')
    .select('*, users(first_name, last_name, email)')
    .eq('id', appointment_id)
    .single()

  if (error || !appt) throw { status: 404, message: 'Termini nuk u gjet' }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
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

module.exports = { getMyAppointments, getAllAppointments, bookAppointment, updateAppointment, sendReminder }