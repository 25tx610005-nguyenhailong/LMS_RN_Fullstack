export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}
//generate column với 1 card rỗng để giữ chỗ
export const generatePlaceholderCard =(column) => {
  return {
    _id:`${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}

export const interceptorLoadingElements = (calling) => {
  // DOM lấy ra toàn bộ phần tử trên page hiện tại có className là 'interceptor-loading'
  const elements = document.querySelectorAll('.interceptor-loading')
  for (let i = 0; i < elements.length; i++) {
    if (calling) {
      // Nếu đang trong thời gian chờ gọi API (calling === true) thì sẽ làm mờ phần tử và chặn click bằng css pointer-events
      elements[i].style.opacity = '0.5'
      elements[i].style.pointerEvents = 'none'
    } else {
      // Ngược lại thì trả về như ban đầu, không làm gì cả
      elements[i].style.opacity = 'initial'
      elements[i].style.pointerEvents = 'initial'
    }
  }
}

/**
 * Resolve file URL based on relative path from DB or absolute Cloudinary URL
 */
import { API_ROOT } from '~/utils/constants'
export const resolveFileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('blob:')) return path
  // Loại bỏ ~/ nếu có
  const cleanPath = path.replace(/^~\//, '/')
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  return `${API_ROOT}${finalPath}`.replace(/([^:]\/)\/+/g, '$1')
}

/**
 * Automatically map any absolute or relative enrollment link to the active browser domain.
 */
export const getFrontendEnrollLink = (linkEnrol, courseId) => {
  if (!linkEnrol) return `${window.location.origin}/enroll/${courseId}`
  if (linkEnrol.startsWith('/')) {
    return `${window.location.origin}${linkEnrol}`
  }
  try {
    const url = new URL(linkEnrol)
    return `${window.location.origin}${url.pathname}${url.search}${url.hash}`
  } catch (e) {
    if (linkEnrol.includes('/enroll/')) {
      const idx = linkEnrol.indexOf('/enroll/')
      return `${window.location.origin}${linkEnrol.slice(idx)}`
    }
    return `${window.location.origin}/enroll/${courseId}`
  }
}