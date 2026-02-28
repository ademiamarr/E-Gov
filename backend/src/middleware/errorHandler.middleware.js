const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Të dhënat e dërguara nuk janë të vlefshme',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    })
  }
  if (err.status) return res.status(err.status).json({ success: false, message: err.message })
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Gabim i brendshëm i serverit' : err.message,
  })
}
module.exports = errorHandler