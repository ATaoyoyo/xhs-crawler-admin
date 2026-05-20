import request from './index'

export const login = (data) => {
  return request.post('/admin/auth/login', data)
}

export const getCurrentUser = () => {
  return request.get('/admin/auth/current')
}

export const logout = () => {
  return request.post('/admin/auth/logout')
}