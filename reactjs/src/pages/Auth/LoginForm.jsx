import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import Typography from '@mui/material/Typography'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import Alert from '@mui/material/Alert'
import { useForm } from 'react-hook-form'
import {
  PASSWORD_RULE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginUserAPI } from '~/redux/user/userSlice'
import { toast } from 'react-toastify'

function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()
  let [searchParams] = useSearchParams()
  const { registeredEmail, verifiedEmail } = Object.fromEntries([...searchParams])

  const submitLogIn = (data) => {
    const { userName, password } = data
    toast.promise(dispatch(loginUserAPI({ userName, password })), { pending: 'Đang đăng nhập...' }).then((res) => {
      if (!res.error) navigate('/home')
    })
  }

  return (
    <form onSubmit={handleSubmit(submitLogIn)} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <MuiCard
          sx={{
            minWidth: { xs: 340, sm: 400 },
            maxWidth: 420,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '2.5em 1.5em 1.5em 1.5em',
            margin: '2em 1em',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
          }}
        >
          {/* Logo Branding */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                mb: 2
              }}
            >
              <SchoolRoundedIcon sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, #F8FAFC 0%, #E2E8F0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                letterSpacing: '0.5px',
                mb: 0.5
              }}
            >
              APEX PORTAL
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                textAlign: 'center',
                fontWeight: 500,
                fontSize: '0.85rem'
              }}
            >
              Hệ thống Quản lý Đào tạo & Học tập
            </Typography>
          </Box>

          {/* Verification Status Alerts */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              mb: 2,
              padding: '0 0.5em'
            }}
          >
            {verifiedEmail && (
              <Alert
                severity="success"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  '.MuiAlert-icon': { color: '#34D399' },
                  '.MuiAlert-message': { overflow: 'hidden', fontSize: '0.85rem' }
                }}
              >
                Email&nbsp;
                <Typography variant="span" sx={{ fontWeight: 'bold' }}>
                  {verifiedEmail}
                </Typography>
                &nbsp;đã được xác thực thành công. Bạn có thể đăng nhập ngay!
              </Alert>
            )}

            {registeredEmail && (
              <Alert
                severity="info"
                sx={{
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  '.MuiAlert-icon': { color: '#60A5FA' },
                  '.MuiAlert-message': { overflow: 'hidden', fontSize: '0.85rem' }
                }}
              >
                Một email đã được gửi đến&nbsp;
                <Typography variant="span" sx={{ fontWeight: 'bold' }}>
                  {registeredEmail}
                </Typography>
                . Vui lòng xác thực trước khi đăng nhập!
              </Alert>
            )}
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 0.5, mb: 3 }}>
            <Box>
              <TextField
                autoFocus
                fullWidth
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập của bạn..."
                type="text"
                variant="outlined"
                error={!!errors['userName']}
                {...register('userName', {
                  required: FIELD_REQUIRED_MESSAGE
                })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F8FAFC',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.08)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3B82F6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748B',
                    '&.Mui-focused': {
                      color: '#3B82F6'
                    }
                  },
                  '& input::placeholder': {
                    color: '#475569',
                    opacity: 1
                  }
                }}
              />
              <FieldErrorAlert errors={errors} fieldName={'userName'} />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Mật khẩu"
                placeholder="Nhập mật khẩu của bạn..."
                type="password"
                variant="outlined"
                error={!!errors['password']}
                {...register('password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F8FAFC',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.08)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3B82F6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748B',
                    '&.Mui-focused': {
                      color: '#3B82F6'
                    }
                  },
                  '& input::placeholder': {
                    color: '#475569',
                    opacity: 1
                  }
                }}
              />
              <FieldErrorAlert errors={errors} fieldName={'password'} />
            </Box>
          </Box>

          {/* Action Buttons */}
          <CardActions sx={{ padding: 0, px: 0.5, mb: 3 }}>
            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                borderRadius: '12px',
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
                },
                '&:active': {
                  transform: 'translateY(1px)'
                }
              }}
            >
              Đăng nhập
            </Button>
          </CardActions>

          {/* Footer branding and notice */}
          <Box
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              pt: 2.5,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>
              Hệ thống Quản lý Giáo dục Nội bộ
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: '0.75rem' }}>
              Chức năng Đăng ký tài khoản mới đã bị vô hiệu hóa. Vui lòng liên hệ bộ phận Kỹ thuật/Quản trị để được cấp tài khoản.
            </Typography>
          </Box>
        </MuiCard>
      </Zoom>
    </form>
  )
}

export default LoginForm
