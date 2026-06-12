import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const createTeacherAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/admin/teachers`, data)
  return response.data
}

export const updateTeacherAPI = async (id, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/admin/teachers/${id}`, data)
  return response.data
}

export const deleteTeacherAPI = async (id) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/admin/teachers/${id}`)
  return response.data
}
export const fetchTeachersAPI = async (params) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/admin/teachers`, { params })
  return response.data
}
