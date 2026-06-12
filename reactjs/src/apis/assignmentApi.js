import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchAssignmentsAPI = async (courseId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/assignments/course/${courseId}`)
  return response.data
}

export const createAssignmentAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/assignments`, data)
  return response.data
}

export const deleteAssignmentAPI = async (assignmentId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/assignments/${assignmentId}`)
  return response.data
}

export const submitAssignmentAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/assignments/submit`, data)
  return response.data
}

export const gradeSubmissionAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/assignments/grade`, data)
  return response.data
}

export const updateAssignmentAPI = async (assignmentId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/assignments/${assignmentId}`, data)
  return response.data
}
