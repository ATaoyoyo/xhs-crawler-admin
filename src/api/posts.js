import request from './index'

export const getPostList = (params) => {
  return request.get('/admin/posts', { params })
}

export const getPostDetail = (id) => {
  return request.get(`/admin/posts/${id}`)
}

export const deletePost = (id) => {
  return request.delete(`/admin/posts/${id}`)
}