const success = (res, data = {}, message = 'Sukses', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data })
}
const error = (res, message = 'Gabim i brendshëm', statusCode = 500, errors = null) => {
  const response = { success: false, message }
  if (errors) response.errors = errors
  return res.status(statusCode).json(response)
}
const notFound = (res, message = 'Nuk u gjet') => res.status(404).json({ success: false, message })
const unauthorized = (res, message = 'Nuk jeni të autorizuar') => res.status(401).json({ success: false, message })
const forbidden = (res, message = 'Qasja është e ndaluar') => res.status(403).json({ success: false, message })
const badRequest = (res, message = 'Kërkesë e pavlefshme', errors = null) => {
  const response = { success: false, message }
  if (errors) response.errors = errors
  return res.status(400).json(response)
}
module.exports = { success, error, notFound, unauthorized, forbidden, badRequest }