import request from './index'

export const getDashboardStats = () => {
  return request.get('/admin/dashboard/stats')
}

export const getDownloadTrend = (days = 7) => {
  return request.get('/admin/dashboard/trend', { params: { days } })
}

export const getHotTags = (limit = 10) => {
  return request.get('/admin/dashboard/hot-tags', { params: { limit } })
}