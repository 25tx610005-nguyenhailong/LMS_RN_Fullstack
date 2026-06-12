import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { WEBSITE_DOMAIN } from '~/utils/constants'

/**
 * Upload file to local server storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} folderName - Folder to save (inside 'uploads' directory)
 * @param {string} originalName - Original filename to extract extension
 * @param {boolean} keepOriginalName - Whether to keep the original filename
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
const uploadFile = async (fileBuffer, folderName, originalName = 'file.png', keepOriginalName = false) => {
  try {
    // Define the local upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', folderName)

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Determine filename
    let fileName
    if (keepOriginalName) {
      fileName = originalName
    } else {
      const extension = path.extname(originalName) || '.png'
      fileName = `${uuidv4()}${extension}`
    }
    const filePath = path.join(uploadDir, fileName)

    // Save the file to disk
    fs.writeFileSync(filePath, fileBuffer)

    // Return the relative path for database storage and full URL for convenience
    return {
      secure_url: `/uploads/${folderName}/${fileName}`,
      full_url: `${WEBSITE_DOMAIN}/uploads/${folderName}/${fileName}`,
      public_id: fileName
    }
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Delete file from local server storage
 * @param {string} filePath - Relative path from database (e.g., /uploads/folder/file.ext)
 */
const deleteFile = async (filePath) => {
  try {
    if (!filePath) return

    // Normalize path: remove ~/ and ensure relative to process.cwd()
    const cleanPath = filePath.replace(/^~\//, '')
    const relativePath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath

    // Security check: ensure we are only deleting within 'uploads'
    if (!relativePath.startsWith('uploads')) return

    const absolutePath = path.join(process.cwd(), relativePath)

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

/**
 * Rename physical file on disk
 * @param {string} oldFilePath - Old relative path (e.g. /uploads/folder/oldfile.ext)
 * @param {string} newName - New file name (e.g. newfile.ext)
 * @returns {Promise<string>} New relative path
 */
const renameFile = async (oldFilePath, newName) => {
  try {
    if (!oldFilePath || !newName) return oldFilePath

    const cleanPath = oldFilePath.replace(/^~\//, '')
    const relativeOldPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath

    // Safety check
    if (!relativeOldPath.startsWith('uploads')) return oldFilePath

    const absoluteOldPath = path.join(process.cwd(), relativeOldPath)
    if (fs.existsSync(absoluteOldPath)) {
      const dir = path.dirname(absoluteOldPath)
      const absoluteNewPath = path.join(dir, newName)
      fs.renameSync(absoluteOldPath, absoluteNewPath)

      const parts = relativeOldPath.split('/')
      parts[parts.length - 1] = newName
      return '/' + parts.join('/')
    }
    return oldFilePath
  } catch (error) {
    console.error('Error renaming physical file:', error)
    return oldFilePath
  }
}

export const LocalUploadProvider = { uploadFile, deleteFile, renameFile }
