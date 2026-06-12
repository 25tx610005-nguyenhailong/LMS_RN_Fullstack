import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

/**
 * Component kiểm soát truy cập UI dựa trên quyền (Rights)
 * @param {string} right - Tên quyền cần kiểm tra (ví dụ: 'COURSE_CREATE')
 * @param {ReactNode} children - Thành phần hiển thị nếu có quyền
 * @param {ReactNode} fallback - Thành phần hiển thị nếu KHÔNG có quyền (mặc định là null)
 */
const Authorized = ({ right, children, fallback = null }) => {
  const currentUser = useSelector(selectCurrentUser)
  const userRights = currentUser?.rights || []

  console.log('userRights', userRights)

  if (userRights.includes(right)) {
    return children
  }

  return fallback
}

export default Authorized
