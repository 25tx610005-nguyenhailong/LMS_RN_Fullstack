import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchCoursesAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/courses`)
  return response.data
}

export const fetchCourseDetailsAPI = async (courseId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/courses/${courseId}`)
  return response.data
}

export const fetchCourseSchedulesAPI = async (courseId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/courses/${courseId}/schedules`)
  return response.data
}

export const createCourseScheduleDetailAPI = async (courseId, data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/courses/${courseId}/schedules`, data)
  return response.data
}

export const createCourseAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/courses`, data)
  return response.data
}

export const updateCourseAPI = async (courseId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/courses/${courseId}`, data)
  return response.data
}

export const deleteCourseAPI = async (courseId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/courses/${courseId}`)
  return response.data
}

export const fetchLevelsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/courses/metadata/levels`)
  return response.data
}

export const fetchMaterialsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/courses/metadata/materials`)
  return response.data
}

export const updateCourseScheduleDetailAPI = async (detailId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/schedules/detail/${detailId}`, data)
  return response.data
}

export const joinOnlineClassAPI = async (detailId) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/schedules/detail/${detailId}/join`)
  return response.data
}

export const fetchPublicCourseDetailsAPI = async (courseId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/courses/public/${courseId}`)
  return response.data
}

export const enrollStudentAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/courses/public/enroll`, data)
  return response.data
}

export const fetchCourseAttendanceAPI = async (courseId, date) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/courses/${courseId}/attendance`, {
    params: { date }
  })
  return response.data
}

export const updateCourseAttendanceAPI = async (courseId, data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/courses/${courseId}/attendance`, data)
  return response.data
}

export const fetchScheduleDetailsListAPI = async (params) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/schedules/details`, { params })
  return response.data
}

export const batchConfirmSchedulesAPI = async (ids) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/schedules/details/batch-confirm`, { ids })
  return response.data
}
