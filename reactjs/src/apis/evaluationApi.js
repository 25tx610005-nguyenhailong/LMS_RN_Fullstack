import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchCourseEvaluationsAPI = async (courseId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/evaluations/courses/${courseId}`)
  return response.data
}

export const saveStudentEvaluationAPI = async (courseId, data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/evaluations/courses/${courseId}`, data)
  return response.data
}
