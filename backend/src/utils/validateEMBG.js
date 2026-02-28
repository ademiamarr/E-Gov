const validateEMBG = (embg) => {
  if (!embg) return { valid: false, error: 'EMBG është i detyrueshëm' }
  const cleaned = embg.replace(/\s/g, '')
  if (cleaned.length !== 13) return { valid: false, error: 'EMBG duhet të ketë 13 shifra' }
  if (!/^\d{13}$/.test(cleaned)) return { valid: false, error: 'EMBG duhet të përmbajë vetëm shifra' }
  const day = parseInt(cleaned.substring(0, 2))
  const month = parseInt(cleaned.substring(2, 4))
  const yearPart = parseInt(cleaned.substring(4, 7))
  if (day < 1 || day > 31) return { valid: false, error: 'EMBG: dita e lindjes është e pavlefshme' }
  if (month < 1 || month > 12) return { valid: false, error: 'EMBG: muaji i lindjes është i pavlefshëm' }
  const fullYear = yearPart >= 900 ? 1000 + yearPart : 2000 + yearPart
  const birthDate = new Date(fullYear, month - 1, day)
  if (birthDate.getFullYear() !== fullYear || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day)
    return { valid: false, error: 'EMBG: data e lindjes është e pavlefshme' }
  if (birthDate > new Date()) return { valid: false, error: 'EMBG: data e lindjes nuk mund të jetë në të ardhmen' }
  const digits = cleaned.split('').map(Number)
  const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) sum += digits[i] * weights[i]
  const remainder = sum % 11
  const checkDigit = remainder < 2 ? remainder : 11 - remainder
  if (checkDigit !== digits[12]) return { valid: false, error: 'EMBG: numri personal është i pavlefshëm' }
  return { valid: true, error: null, birthDate: `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${fullYear}`, birthYear: fullYear }
}
module.exports = { validateEMBG }