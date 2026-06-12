import { StatusCodes } from 'http-status-codes'
import { LocalUploadProvider } from '~/providers/LocalUploadProvider'

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No file uploaded' })
    }

    const folder = req.body.folder || 'materials'
    const keepOriginalName = req.body.keepOriginalName === 'true' || req.body.keepOriginalName === true
    const result = await LocalUploadProvider.uploadFile(req.file.buffer, folder, req.file.originalname, keepOriginalName)

    // Delete old file if provided
    if (req.body.oldPath) {
      await LocalUploadProvider.deleteFile(req.body.oldPath)
    }

    res.status(StatusCodes.OK).json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    })
  } catch (error) { next(error) }
}

const deleteFile = async (req, res, next) => {
  try {
    const { filePath } = req.body
    if (!filePath) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No file path provided' })
    }

    await LocalUploadProvider.deleteFile(filePath)
    res.status(StatusCodes.OK).json({ message: 'File deleted successfully' })
  } catch (error) { next(error) }
}

export const uploadController = {
  uploadFile,
  deleteFile
}
