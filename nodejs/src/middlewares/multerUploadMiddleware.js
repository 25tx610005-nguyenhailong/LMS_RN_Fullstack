import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from '~/utils/validators'

//Check file
const customFileFilter = (req, file, callback) => {
//   console.log('Multer file: ', file)

  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'Định dạng tệp không hợp lệ. Hệ thống chỉ nhận hình ảnh, tài liệu (pdf, doc, docx, xls, xlsx), tệp âm thanh (mp3, wav, ogg, m4a, webm) hoặc tệp video (mp4, mov, webm).'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  return callback(null, true)
}

// Khởi tạo function upload được tạo bởi multer
const upload = multer({
  limits:{ fileSize: LIMIT_COMMON_FILE_SIZE, fieldSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

// Multer upload middleware specific for lesson resources (allowing pdf, doc, docx, mp4, mov, audio, image, and size up to 100MB)
const resourceUpload = multer({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'video/mp4',
      'video/quicktime', // mov
      'audio/mpeg', // mp3
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/webm',
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
    if (!allowedTypes.includes(file.mimetype)) {
      const errMessage = 'Định dạng file không hỗ trợ. Chỉ nhận pdf, doc, docx, mp4, mov, mp3, wav, ogg, jpg, jpeg, png, gif.'
      return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
    }
    callback(null, true)
  }
})

export const multerUploadMiddleware = {
  upload,
  resourceUpload
}