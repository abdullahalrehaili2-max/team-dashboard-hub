import client from './client.js'

export const listDashboards = () => client.get('/dashboards').then(r => r.data)
export const getDashboard = (id) => client.get(`/dashboards/${id}`).then(r => r.data)
export const createDashboard = (data) => client.post('/dashboards', data).then(r => r.data)
export const updateDashboard = (id, data) => client.put(`/dashboards/${id}`, data).then(r => r.data)
export const deleteDashboard = (id) => client.delete(`/dashboards/${id}`).then(r => r.data)
export const seedFromHtml = (id, file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post(`/dashboards/${id}/seed-from-html`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
}

export const listPages = (dashboardId) => client.get(`/pages/dashboard/${dashboardId}`).then(r => r.data)
export const createPage = (dashboardId, data) => client.post(`/pages/dashboard/${dashboardId}`, data).then(r => r.data)
export const updatePage = (id, data) => client.put(`/pages/${id}`, data).then(r => r.data)
export const deletePage = (id) => client.delete(`/pages/${id}`).then(r => r.data)

export const listSections = (dashboardId, pageId) =>
  client.get(`/sections/dashboard/${dashboardId}`, { params: { page_id: pageId } }).then(r => r.data)
export const createSection = (dashboardId, data) => client.post(`/sections/dashboard/${dashboardId}`, data).then(r => r.data)
export const updateSection = (id, data) => client.put(`/sections/${id}`, data).then(r => r.data)
export const deleteSection = (id) => client.delete(`/sections/${id}`).then(r => r.data)
export const swapIndicator = (id, type) => client.post(`/sections/${id}/indicator?indicator_type=${type}`).then(r => r.data)

export const saveLayout = (dashboardId, layout) =>
  client.post(`/layouts/dashboards/${dashboardId}/layout`, layout).then(r => r.data)

export const getDeltas = (dashboardId, params) =>
  client.get(`/deltas/${dashboardId}`, { params }).then(r => r.data)

export const createShare = (data) => client.post('/share', data).then(r => r.data)
export const getShare = (token) => client.get(`/share/${token}`).then(r => r.data)

export const exportDashboard = (id, format) =>
  client.get(`/exports/${id}/${format}`, { responseType: format === 'html' ? 'text' : 'blob' }).then(r => r.data)
