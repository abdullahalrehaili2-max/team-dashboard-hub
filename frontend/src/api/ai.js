import client from './client.js'

export const suggestIndicators = (dashboardId) =>
  client.get(`/ai/suggest/indicators/${dashboardId}`).then(r => r.data)

export const suggestLayout = (dashboardId) =>
  client.get(`/ai/suggest/layout/${dashboardId}`).then(r => r.data)

export const applySuggestions = (data) =>
  client.post('/ai/suggest/apply', data).then(r => r.data)

export const explainSection = (sectionId) =>
  client.get(`/ai/suggest/explain/${sectionId}`).then(r => r.data)
