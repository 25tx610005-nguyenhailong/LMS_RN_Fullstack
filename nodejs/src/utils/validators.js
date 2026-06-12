export const FIELD_REQUIRED_MESSAGE = 'This field is required.'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid. (example@gmail.com)'
export const PASSWORD_RULE = /^.{1,256}$/
export const PASSWORD_RULE_MESSAGE = 'Password is required.'
export const PASSWORD_CONFIRMATION_MESSAGE = 'Password Confirmation does not match!'
export const OBJECT_ID_RULE = /^\d+$/
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Integer ID pattern!'
export const LIMIT_COMMON_FILE_SIZE = 104857600 // byte = 100 MB
export const ALLOW_COMMON_FILE_TYPES = [
  'image/jpg', 'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac', 'audio/x-m4a', 'audio/m4a', 'audio/mp4',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg', 'video/x-msvideo', 'video/x-matroska', 'video/mpeg', 'video/3gpp'
]