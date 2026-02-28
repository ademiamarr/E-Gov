const formatCurrency = (amount, currency = 'MKD') => {
  if (amount === null || amount === undefined) return '-'
  const num = parseFloat(amount)
  if (isNaN(num)) return '-'
  return `${num.toLocaleString('mk-MK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}
const formatCurrencyShort = (amount, currency = 'MKD') => {
  if (amount === null || amount === undefined) return '-'
  const num = parseFloat(amount)
  if (isNaN(num)) return '-'
  return `${num.toLocaleString('mk-MK')} ${currency}`
}
const parseAmount = (value) => {
  if (!value) return 0
  return parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
}
module.exports = { formatCurrency, formatCurrencyShort, parseAmount }