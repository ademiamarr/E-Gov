const { supabase, DOCUMENTS_BUCKET } = require('../config/supabase')

const BUCKET = 'id-photos'

const uploadIdPhoto = async (file, personal_id) => {
  const ext = file.mimetype.split('/')[1] || 'jpg'
  const fileName = `${personal_id}_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (error) throw new Error('Ngarkimi i fotos dështoi: ' + error.message)

  // Return just the filename - we'll generate signed URL when needed
  return fileName
}

const getSignedUrl = async (path, expiresIn = 3600) => {
  if (!path) return null

  // If it's already a full URL, return it directly
  if (path.startsWith('http')) return path

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Signed URL error:', error.message)
    return null
  }
  return data?.signedUrl || null
}

const getPublicUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return data?.publicUrl || null
}

const deletePhoto = async (path) => {
  if (!path || path.startsWith('http')) return

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  if (error) console.error('Fshirja e fotos dështoi:', error.message)
}

module.exports = { uploadIdPhoto, getSignedUrl, getPublicUrl, deletePhoto }