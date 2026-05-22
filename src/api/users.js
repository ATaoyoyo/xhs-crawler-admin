import request from './index'

// 用户相关 API
export const getUserList = (params) => {
  return request.get('/admin/users', { params })
}

export const getUserDetail = (id) => {
  return request.get(`/admin/users/${id}`)
}

// 管理员账号相关 API
export const createAdminAccount = (data) => {
  return request.post('/admin/account', data)
}

export const getAdminAccountList = (params) => {
  return request.get('/admin/accounts', { params })
}

export const getAdminAccountDetail = (id) => {
  return request.get(`/admin/accounts/${id}`)
}

export const updateAdminAccount = (id, data) => {
  return request.put(`/admin/accounts/${id}`, data)
}

export const deleteAdminAccount = (id) => {
  return request.delete(`/admin/accounts/${id}`)
}