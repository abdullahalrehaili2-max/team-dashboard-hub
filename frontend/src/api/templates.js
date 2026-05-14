import client from './client.js'

export const listTemplates = (params) => client.get('/templates', { params }).then(r => r.data)
export const getTemplate = (id) => client.get(`/templates/${id}`).then(r => r.data)
export const saveAsTemplate = (dashboardId, params) =>
  client.post(`/templates/from-dashboard/${dashboardId}`, null, { params }).then(r => r.data)
export const cloneTemplate = (id, name) =>
  client.post(`/templates/${id}/clone`, null, { params: { name } }).then(r => r.data)
export const updateTemplate = (id, data) => client.put(`/templates/${id}`, data).then(r => r.data)
export const deleteTemplate = (id) => client.delete(`/templates/${id}`).then(r => r.data)
export const publishTemplate = (id, visibility) =>
  client.post(`/templates/${id}/publish`, null, { params: { visibility } }).then(r => r.data)
export const importTemplate = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/templates/import', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
}
export const exportTemplate = (id) => client.get(`/templates/${id}/export`).then(r => r.data)
export const regenerateCover = (id) => client.post(`/templates/${id}/cover`).then(r => r.data)
