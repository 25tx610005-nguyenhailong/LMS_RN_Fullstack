import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchCourseScheduleAPI = async (courseId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/schedules/course/${courseId}`)
  return response.data
}
