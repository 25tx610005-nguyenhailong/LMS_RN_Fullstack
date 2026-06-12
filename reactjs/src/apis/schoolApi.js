import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchSchoolDashboardAPI = async (schoolId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/schools/${schoolId}/dashboard`)
  return response.data
}

export const fetchSchoolsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/schools`)
  return response.data
}

export const fetchClassStudentsAPI = async (courseId, page, limit, search, status, cityId, districtId) => {
  let url = `${API_ROOT}/v1/courses/${courseId}/students`
  const params = []
  if (page) params.push(`page=${page}`)
  if (limit) params.push(`limit=${limit}`)
  if (search) params.push(`search=${encodeURIComponent(search)}`)
  if (status) params.push(`status=${status}`)
  if (cityId) params.push(`cityId=${cityId}`)
  if (districtId) params.push(`districtId=${districtId}`)
  if (params.length > 0) {
    url += `?${params.join('&')}`
  }
  const response = await authorizedAxiosInstance.get(url)
  return response.data
}
export const createSchoolAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/schools`, data)
  return response.data
}

export const updateSchoolAPI = async (id, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/schools/${id}`, data)
  return response.data
}

export const deleteSchoolAPI = async (id) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/schools/${id}`)
  return response.data
}

export const fetchCitiesAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/schools/cities`)
  return response.data
}

export const fetchDistrictsAPI = async (cityId) => {
  const url = cityId ? `${API_ROOT}/v1/schools/districts?cityId=${cityId}` : `${API_ROOT}/v1/schools/districts`
  const response = await authorizedAxiosInstance.get(url)
  return response.data
}
export const addTeachersToSchoolAPI = async (schoolId, teacherIds) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/schools/${schoolId}/teachers`, { teacherIds })
  return response.data
}

export const fetchSchoolSettingsAPI = async (schoolId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/schools/${schoolId}/settings`)
  return response.data
}

export const updateSchoolSettingsAPI = async (schoolId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/schools/${schoolId}/settings`, data)
  return response.data
}

export const fetchAvailableTeachersAPI = async (schoolId, params) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/schools/${schoolId}/teachers/availability`, { params })
  return response.data
}

export const fetchSchoolStudentsAPI = async (schoolId, page, limit, search, courseId, status, cityId, districtId) => {
  let url = `${API_ROOT}/v1/schools/${schoolId}/students`
  const params = []
  if (page) params.push(`page=${page}`)
  if (limit) params.push(`limit=${limit}`)
  if (search) params.push(`search=${encodeURIComponent(search)}`)
  if (courseId) params.push(`courseId=${courseId}`)
  if (status) params.push(`status=${status}`)
  if (cityId) params.push(`cityId=${cityId}`)
  if (districtId) params.push(`districtId=${districtId}`)
  if (params.length > 0) {
    url += `?${params.join('&')}`
  }
  const response = await authorizedAxiosInstance.get(url)
  return response.data
}

export const approveStudentEnrollmentAPI = async (schoolId, enrollmentId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/schools/${schoolId}/students/${enrollmentId}/approve`)
  return response.data
}

export const rejectStudentEnrollmentAPI = async (schoolId, enrollmentId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/schools/${schoolId}/students/${enrollmentId}/reject`)
  return response.data
}

export const createSchoolStudentAPI = async (schoolId, data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/schools/${schoolId}/students`, data)
  return response.data
}

export const updateSchoolStudentAPI = async (schoolId, accountId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/schools/${schoolId}/students/${accountId}`, data)
  return response.data
}

export const deleteSchoolStudentAPI = async (schoolId, accountId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/schools/${schoolId}/students/${accountId}`)
  return response.data
}

export const updateCourseStudentStatusAPI = async (courseId, courseStudentId, status, note) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/courses/${courseId}/students/${courseStudentId}/status`, { status, note })
  return response.data
}

export const fetchAvailableClassStudentsAPI = async (courseId, page, limit, search) => {
  let url = `${API_ROOT}/v1/courses/${courseId}/available-students`
  const params = []
  if (page) params.push(`page=${page}`)
  if (limit) params.push(`limit=${limit}`)
  if (search) params.push(`search=${encodeURIComponent(search)}`)
  if (params.length > 0) {
    url += `?${params.join('&')}`
  }
  const response = await authorizedAxiosInstance.get(url)
  return response.data
}

export const addStudentToClassAPI = async (courseId, accountId, accountIds) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/courses/${courseId}/students`, { accountId, accountIds })
  return response.data
}

