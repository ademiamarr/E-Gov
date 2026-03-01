const { supabase } = require('../config/supabase')
const { markFinePaid } = require('./fines.service')

// Mock payment — placeholder për bankë lokale
const processMockPayment = async ({ fine_id, card_number, card_holder, expiry, cvv, user }) => {
  // Validim bazik
  if (!card_number || !card_holder || !expiry || !cvv) {
    throw { status: 400, message: 'Të dhënat e kartës janë të pakompletuara' }
  }

  if (card_number.replace(/\s/g, '').length !== 16) {
    throw { status: 400, message: 'Numri i kartës është i pavlefshëm' }
  }

  // Simulim procesim (500ms delay)
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock: refuzo kartën test 4000000000000002
  if (card_number.replace(/\s/g, '') === '4000000000000002') {
    throw { status: 402, message: 'Pagesa u refuzua nga banka' }
  }

  // Shëno gjobën si të paguar
  const fine = await markFinePaid(fine_id, user)

  // Regjistro transaksionin
  const { data: transaction, error } = await supabase
    .from('payments')
    .insert([{
      fine_id,
      user_id: user.id,
      amount: fine.amount,
      status: 'success',
      method: 'card',
      reference: `PAY-${Date.now()}`
    }])
    .select()
    .single()

  if (error) console.error('Payment log error:', error.message)

  return {
    success: true,
    reference: transaction?.reference || `PAY-${Date.now()}`,
    amount: fine.amount,
    fine_id
  }
}

const getMyPayments = async (user_id) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*, fines(type, description)')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) throw { status: 500, message: error.message }
  return data
}

module.exports = { processMockPayment, getMyPayments }