import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import PasswordIcon from '@mui/icons-material/Password'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'

import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useForm } from 'react-hook-form'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { logoutUserAPI, updateUserAPI } from '~/redux/user/userSlice'

function SecurityTab() {
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const confirmChangePassword = useConfirm()
  const submitChangePassword = (data) => {
    confirmChangePassword({
      title: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LogoutIcon sx={{ color: 'warning.dark' }} /> Đổi mật khẩu
        </Box>
      ),
      description: 'Bạn sẽ cần đăng nhập lại sau khi thay đổi mật khẩu thành công. Tiếp tục?',
      confirmationText: 'Xác nhận',
      cancellationText: 'Hủy'
    })
      .then(() => {
        const { current_password, new_password } = data
        toast
          .promise(dispatch(updateUserAPI({ current_password, new_password })), { pending: 'Đang cập nhật...' })
          .then((res) => {
            if (!res.error) {
              toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
              dispatch(logoutUserAPI(false))
            }
          })
      })
      .catch(() => {})
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        bgcolor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
        height: '100%'
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', mb: 1 }}>
        Thiết lập bảo mật
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Thay đổi mật khẩu đăng nhập để bảo vệ an toàn cho tài khoản của bạn.
      </Typography>

      <form onSubmit={handleSubmit(submitChangePassword)}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
              MẬT KHẨU HIỆN TẠI
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập mật khẩu hiện tại..."
              type='password'
              variant='outlined'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <PasswordIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              {...register('current_password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: PASSWORD_RULE,
                  message: PASSWORD_RULE_MESSAGE
                }
              })}
              error={!!errors['current_password']}
            />
            <FieldErrorAlert errors={errors} fieldName={'current_password'} />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
              MẬT KHẨU MỚI
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập mật khẩu mới..."
              type='password'
              variant='outlined'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <LockIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              {...register('new_password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: PASSWORD_RULE,
                  message: PASSWORD_RULE_MESSAGE
                }
              })}
              error={!!errors['new_password']}
            />
            <FieldErrorAlert errors={errors} fieldName={'new_password'} />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
              XÁC NHẬN MẬT KHẨU MỚI
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập lại mật khẩu mới..."
              type='password'
              variant='outlined'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <LockResetIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              {...register('new_password_confirmation', {
                validate: (value) => {
                  if (value === watch('new_password')) return true
                  return 'Mật khẩu xác nhận không khớp.'
                }
              })}
              error={!!errors['new_password_confirmation']}
            />
            <FieldErrorAlert errors={errors} fieldName={'new_password_confirmation'} />
          </Box>

          <Box sx={{ mt: 1 }}>
            <Button
              className='interceptor-loading'
              type='submit'
              variant='contained'
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)'
                }
              }}
            >
              Đổi mật khẩu
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  )
}

export default SecurityTab
