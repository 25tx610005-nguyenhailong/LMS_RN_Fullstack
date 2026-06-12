import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'
import { accountModel } from '~/models/accountModel'
import { GET_DB } from '~/config/prisma'

const isAuthorized = async (req, res, next) => {
  // Lấy accesstoken trên cookie
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }
  try {
    // Giải mã token và check xem có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // Lấy vai trò của người dùng từ Database
    const userInRole = await GET_DB().accountInRole.findFirst({
      where: { IdAccount: accessTokenDecoded.id, Deleted: 0 },
      include: { AccountRole: true }
    })
    accessTokenDecoded.role = userInRole?.AccountRole?.Name || ''

    // Lưu thông tin giải mã được
    req.jwtDecoded = accessTokenDecoded

    // Lấy danh sách quyền của người dùng từ Database và gắn vào request
    const userRights = await accountModel.getRightsByAccountId(accessTokenDecoded.id)
    req.userRights = userRights

    // Cho phép request đi tiếp
    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

// Middleware kiểm tra quyền cụ thể
const checkPermission = (requiredRight) => {
  return (req, res, next) => {
    if (!req.userRights || !req.userRights.includes(requiredRight)) {
      next(new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action!'))
      return
    }
    next()
  }
}

export const authMiddleware = {
  isAuthorized,
  checkPermission
}