import { request } from '../http'

export function getStatistikSummary() {
  return request('/statistics/informasi')
}

export function getStatistikDetail(kode) {
  return request(`/statistics/informasi/${kode}`)
}

export function getStatistikKeluarga() {
  return request('/statistics/informasi/keluarga')
}

export function getDashboardStatistics() {
  return request(`/dashboard`)
}