const supabase = require('../config/supabase')

const uploadIdPhoto = async (file, personal_id) => {
  const ext = file.mimetype.split('/')[1]
  const fileName = `${personal_id}_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('id-photos')
    .upload(fileName, file.buffer, { contentType: file.mimetype })

  if (error) throw new Error('Ngarkimi i fotos dështoi: ' + error.message)

  return fileName
}

const getSignedUrl = async (path, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from('id-photos')
    .createSignedUrl(path, expiresIn)

  if (error) throw new Error('URL e fotos dështoi: ' + error.message)
  return data.signedUrl
}

const deletePhoto = async (path) => {
  const { error } = await supabase.storage
    .from('id-photos')
    .remove([path])

  if (error) throw new Error('Fshirja e fotos dështoi: ' + error.message)
}

module.exports = { uploadIdPhoto, getSignedUrl, deletePhoto }