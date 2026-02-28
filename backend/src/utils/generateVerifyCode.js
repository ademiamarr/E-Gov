const generateVerifyCode = () => Math.floor(100000 + Math.random() * 900000).toString()

const generateCodeExpiry = () => {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + 10)
  return expiry.toISOString()
}

const isCodeExpired = (expiryIso) => new Date() > new Date(expiryIso)

module.exports = { generateVerifyCode, generateCodeExpiry, isCodeExpired }