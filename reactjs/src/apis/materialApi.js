import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchMaterialsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/materials`)
  return response.data
}

export const createMaterialAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/materials`, data)
  return response.data
}

export const updateMaterialAPI = async (id, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/materials/${id}`, data)
  return response.data
}

export const deleteMaterialAPI = async (id) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/materials/${id}`)
  return response.data
}

// Themes
export const createThemeAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/materials/themes`, data)
  return response.data
}

export const createManyThemesAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/materials/themes/bulk`, data)
  return response.data
}

export const updateThemeAPI = async (id, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/materials/themes/${id}`, data) // Assuming we add this route
  return response.data
}

export const deleteThemeAPI = async (id) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/materials/themes/${id}`) // Assuming we add this route
  return response.data
}

// Lessons
export const createLessonAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/materials/lessons`, data)
  return response.data
}

export const createManyLessonsAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/materials/lessons/bulk`, data)
  return response.data
}


export const updateLessonAPI = async (id, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/materials/lessons/${id}`, data)
  return response.data
}

export const deleteLessonAPI = async (id) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/materials/lessons/${id}`) // Need to add route
  return response.data
}

// Lesson Resources
export const uploadLessonResourceAPI = async (lessonId, formData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/materials/lessons/${lessonId}/resources`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const listLessonResourcesAPI = async (lessonId, courseId) => {
  const url = courseId
    ? `${API_ROOT}/v1/materials/lessons/${lessonId}/resources?courseId=${courseId}`
    : `${API_ROOT}/v1/materials/lessons/${lessonId}/resources`
  const response = await authorizedAxiosInstance.get(url)
  return response.data
}

export const updateLessonResourceAPI = async (lessonId, resourceId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/materials/lessons/${lessonId}/resources/${resourceId}`, data)
  return response.data
}

export const deleteLessonResourceAPI = async (lessonId, resourceId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/materials/lessons/${lessonId}/resources/${resourceId}`)
  return response.data
}

export const deleteFileAPI = async (filePath) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/uploads`, {
    data: { filePath }
  })
  return response.data
}
