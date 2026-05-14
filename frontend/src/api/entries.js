import client from './client.js'

export const getEntry = (fieldId, weekStart) =>
  client.get(`/entries/${fieldId}/entry/${weekStart}`).then(r => r.data).catch(() => null)

export const upsertEntry = (fieldId, weekStart, data) =>
  client.post(`/entries/${fieldId}/entry/${weekStart}`, data).then(r => r.data)

export const listEntries = (fieldId, limit = 52) =>
  client.get(`/entries/${fieldId}`, { params: { limit } }).then(r => r.data)

export const backfillEntries = (data) =>
  client.post('/entries/backfill', data).then(r => r.data)
