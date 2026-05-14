import client from './client.js'

export const listThemes = () => client.get('/themes').then(r => r.data)
export const getPresets = () => client.get('/themes/presets').then(r => r.data)
export const getTheme = (id) => client.get(`/themes/${id}`).then(r => r.data)
export const createTheme = (data) => client.post('/themes', data).then(r => r.data)
export const updateTheme = (id, data) => client.put(`/themes/${id}`, data).then(r => r.data)
export const deleteTheme = (id) => client.delete(`/themes/${id}`).then(r => r.data)
export const extractFromLogo = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/themes/extract-from-logo', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
}
