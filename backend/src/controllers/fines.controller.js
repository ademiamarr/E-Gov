const finesService = require('../services/fines.service')
const { success, error } = require('../utils/apiResponse')

const getMyFines = async (req, res) => {
  try {
    const fines = await finesService.getMyFines(req.user.id)
    return success(res, fines)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const getAllFines = async (req, res) => {
  try {
    const fines = await finesService.getAllFines()
    return success(res, fines)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const addFine = async (req, res) => {
  try {
    const fine = await finesService.addFine(req.body)
    return success(res, fine, 'Gjoba u shtua', 201)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { getMyFines, getAllFines, addFine }