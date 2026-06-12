import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const uploadFileAPI = async (file, folder = 'others', oldPath = null, keepOriginalName = true) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('keepOriginalName', keepOriginalName)
  if (oldPath) formData.append('oldPath', oldPath)

  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/uploads`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteFileAPI = async (filePath) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/uploads`, {
    data: { filePath }
  })
  return response.data
}
