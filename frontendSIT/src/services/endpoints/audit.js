import { request } from '../http'

export function getAuditLogs(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/audit-logs${query ? `?${query}` : ''}`)
}