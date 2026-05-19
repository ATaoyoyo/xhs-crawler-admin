import request from './index'

export const getUserList = (params) => {
  return request.get('/admin/users', { params })
}

export const getUserDetail = (id) => {
  return request.get(`/admin/users/${id}`)
}