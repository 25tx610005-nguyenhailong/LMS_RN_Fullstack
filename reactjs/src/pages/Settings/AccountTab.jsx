import {
  Typography, TextField, InputAdornment, Button, Grid, Paper
} from '@mui/material'
import MailIcon from '@mui/icons-material/Mail'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeIcon from '@mui/icons-material/Home'
import { useEffect } from 'react'

import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

function AccountTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const initialGeneralForm = {
    displayName: currentUser?.fullName || currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: initialGeneralForm
  })

  // Synchronize form values when currentUser details update in Redux
  useEffect(() => {
    reset({
      displayName: currentUser?.fullName || currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || ''
    })
  }, [currentUser, reset])

  const submitChangeGeneralInformation = (data) => {
    const { displayName, email, phone, address } = data

    // Prevent submission if no changes were made
    if (
      displayName === (currentUser?.fullName || currentUser?.displayName || '') &&
      email === (currentUser?.email || '') &&
      phone === (currentUser?.phone || '') &&
      address === (currentUser?.address || '')
    ) {
      toast.info('Thông tin không có sự thay đổi.')
      return
    }

    toast.promise(
      dispatch(updateUserAPI({ displayName, email, phone, address })),
      { pending: 'Đang cập nhật thông tin...' }
    ).then((res) => {
      if (!res.error) {
        toast.success('Cập nhật thông tin thành công!')
      }
    })
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
        Thông tin tài khoản
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Cập nhật thông tin chi tiết và thông tin liên hệ cho tài khoản của bạn.
      </Typography>

      <form onSubmit={handleSubmit(submitChangeGeneralInformation)}>
        <Grid container spacing={3}>

          {/* Full name input */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
              HỌ VÀ TÊN
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập họ và tên..."
              type="text"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentIndIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              {...register('displayName', {
                required: FIELD_REQUIRED_MESSAGE
              })}
              error={!!errors['displayName']}
            />
            <FieldErrorAlert errors={errors} fieldName={'displayName'} />
          </Grid>

          {/* Email input */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
              ĐỊA CHỈ EMAIL
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập email..."
              type="text"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              {...register('email', {
                required: FIELD_REQUIRED_MESSAGE
              })}
              error={!!errors['email']}
            />
            <FieldErrorAlert errors={errors} fieldName={'email'} />
          </Grid>

          {/* Username input (read-only) */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#94a3b8' }}>
              TÊN ĐĂNG NHẬP (Không thể đổi)
            </Typography>
            <TextField
              disabled
              defaultValue={currentUser?.username}
              fullWidth
              type="text"
              variant="filled"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBoxIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
              }}
            />
          </Grid>

          {/* Phone number input */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
              SỐ ĐIỆN THOẠI
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập số điện thoại..."
              type="tel"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              {...register('phone')}
            />
          </Grid>

          {/* Address input */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
              ĐỊA CHỈ
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập địa chỉ..."
              type="text"
              multiline
              rows={3}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <HomeIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              {...register('address')}
            />
          </Grid>

          {/* Update button */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
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
              Lưu thay đổi
            </Button>
          </Grid>

        </Grid>
      </form>
    </Paper>
  )
}

export default AccountTab
