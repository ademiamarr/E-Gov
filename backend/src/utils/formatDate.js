const { format, parseISO, isValid } = require('date-fns')
const { mk, sq, enUS } = require('date-fns/locale')
const LOCALES = { mk, sq, en: enUS }

const formatDate = (date, lang = 'mk') => {
  if (!date) return '-'
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return '-'
  return format(parsed, 'dd MMMM yyyy', { locale: LOCALES[lang] || enUS })
}
const formatDateTime = (date, lang = 'mk') => {
  if (!date) return '-'
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return '-'
  return format(parsed, 'dd MMMM yyyy, HH:mm', { locale: LOCALES[lang] || enUS })
}
const formatTime = (date) => {
  if (!date) return '-'
  const parsed = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsed)) return '-'
  return format(parsed, 'HH:mm')
}
module.exports = { formatDate, formatDateTime, formatTime }