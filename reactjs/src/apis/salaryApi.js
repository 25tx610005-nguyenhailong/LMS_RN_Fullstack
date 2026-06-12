import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchSchoolSalariesAPI = async (schoolId, monthStr) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/salaries/schools/${schoolId}?month=${monthStr}`)
  return response.data
}
