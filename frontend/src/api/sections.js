import client from './client.js'

export const listFields = (sectionId) => client.get(`/fields/section/${sectionId}`).then(r => r.data)
export const createField = (sectionId, data) => client.post(`/fields/section/${sectionId}`, data).then(r => r.data)
export const updateField = (id, data) => client.put(`/fields/${id}`, data).then(r => r.data)
export const deleteField = (id) => client.delete(`/fields/${id}`).then(r => r.data)
