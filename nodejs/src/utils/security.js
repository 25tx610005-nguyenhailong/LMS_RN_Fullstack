import crypto from 'crypto'

/**
 * Tạo password và passwordSalt từ mật khẩu thuần
 */
export const hashPassword = (plainPassword) => {
  if (!plainPassword) return { password: null, passwordSalt: null }

  const passwordSalt = crypto.randomBytes(16).toString('base64')
  const passwordHash = crypto.createHash('md5').update(plainPassword + passwordSalt).digest('base64')

  return {
    password: passwordHash,
    passwordSalt: passwordSalt
  }
}

/**
 * Kiểm tra mật khẩu thuần có khớp với mã băm trong DB không
 */
export const comparePassword = (plainPassword, storedHash, storedSalt) => {
  if (!plainPassword || !storedHash || !storedSalt) return false

  const hashToCompare = crypto.createHash('md5').update(plainPassword + storedSalt).digest('base64')

  return hashToCompare === storedHash
}

export const securityUtils = {
  hashPassword,
  comparePassword
}
