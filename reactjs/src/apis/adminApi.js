import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchAllUsersAPI = async (params) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/admin/users`, { params })
  return response.data
}

export const createUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/admin/users`, data)
  return response.data
}

export const fetchUserStatsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/admin/stats`)
  return response.data
}

export const updateUserAPI = async (userId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/admin/users/${userId}`, data)
  return response.data
}

export const deleteUserAPI = async (userId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/admin/users/${userId}`)
  return response.data
}

export const fetchReferenceDataAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/admin/reference-data`)
  return response.data
}

export const fetchUserByIdAPI = async (userId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/admin/users/${userId}`)
  return response.data
}
