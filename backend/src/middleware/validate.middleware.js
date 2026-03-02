const { z } = require('zod')

const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const data = source === 'body'   ? req.body
               : source === 'query'  ? req.query
               : source === 'params' ? req.params
               : req.body

    const parsed = schema.parse(data)

    if (source === 'body')   req.body   = parsed
    if (source === 'query')  req.query  = parsed
    if (source === 'params') req.params = parsed

    next()
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Të dhënat e dërguara nuk janë të vlefshme',
        errors: err.errors.map(e => ({
          field:   e.path.join('.'),
          message: e.message,
        })),
      })
    }
    next(err)
  }
}

module.exports = { validate }