const { supabase } = require('../config/supabase')
const { sendEmail } = require('../config/resend')
const finePaidEmail = require('../email/templates/fine-paid.email')
const { formatCurrency } = require('../utils/formatCurrency')
const { formatDate } = require('../utils/formatDate')

const getMyFines = async (user_id) => {
  const { data, error } = await supabase
    .from('fines')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) throw { status: 500, message: error.message }
  return data
}

const getAllFines = async () => {
  const { data, error } = await supabase
    .from('fines')
    .select('*, users(first_name, last_name, email, personal_id)')
    .order('created_at', { ascending: false })

  if (error) throw { status: 500, message: error.message }
  return data
}

const addFine = async ({ user_id, type, amount, fine_date, description }) => {
  const { data: fine, error } = await supabase
    .from('fines')
    .insert([{ user_id, type, amount, fine_date, description, status: 'unpaid' }])
    .select('*, users(first_name, last_name, email)')
    .single()

  if (error) throw { status: 500, message: error.message }
  return fine
}

const getFineById = async (id) => {
  const { data, error } = await supabase
    .from('fines')
    .select('*, users(first_name, last_name, email)')
    .eq('id', id)
    .single()

  if (error || !data) throw { status: 404, message: 'Gjoba nuk u gjet' }
  return data
}

const markFinePaid = async (id, user) => {
  const fine = await getFineById(id)

  if (fine.user_id !== user.id) {
    throw { status: 403, message: 'Nuk keni akses' }
  }

  if (fine.status === 'paid') {
    throw { status: 400, message: 'Gjoba është paguar tashmë' }
  }

  const { data: updated, error } = await supabase
    .from('fines')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw { status: 500, message: error.message }

  // ✅ përdor sendEmail helper — jo resend direkt
  try {
    await sendEmail({
      to: user.email,
      ...finePaidEmail({
        first_name:   user.first_name,
        fine_type:    fine.type,
        amount:       formatCurrency(fine.amount),
        reference_id: `FINE-${id.slice(0, 8).toUpperCase()}`,
        paid_at:      formatDate(new Date()),
      }),
    })
  } catch (emailErr) {
    console.warn('⚠️ Fine paid email dështoi:', emailErr.message)
  }

  return updated
}

module.exports = { getMyFines, getAllFines, addFine, getFineById, markFinePaid }