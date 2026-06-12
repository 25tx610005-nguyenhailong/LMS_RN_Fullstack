import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Grid, Paper, Typography, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, CircularProgress,
  IconButton, InputAdornment, Stack, Card, Divider, Autocomplete
} from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { fetchPublicCourseDetailsAPI, enrollStudentAPI } from '~/apis/courseApi'
import { fetchCitiesAPI, fetchDistrictsAPI } from '~/apis/schoolApi'
import { toast } from 'react-toastify'
import { resolveFileUrl } from '~/utils/formatters'

function EnrollClass() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Show/Hide password
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    parentName: '',
    phone: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
    studentName: '',
    studentBirthDay: '',
    studentGender: 1, // 1: Male, 2: Female
    idCity: '',
    idDistrict: '',
    address: ''
  })

  // Location list states
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])

  const [validationErrors, setValidationErrors] = useState({})

  // Fetch course details & cities on mount
  useEffect(() => {
    if (!courseId) {
      setError('Mã lớp học không hợp lệ!')
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      fetchPublicCourseDetailsAPI(courseId),
      fetchCitiesAPI()
    ])
      .then(([courseData, citiesData]) => {
        setCourse(courseData)
        setCities(citiesData || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Lỗi khi tải thông tin lớp học. Lớp học không tồn tại hoặc đã bị xóa!')
        setLoading(false)
      })
  }, [courseId])

  const handleCityChange = async (cityId) => {
    setFormData(prev => ({ ...prev, idCity: cityId, idDistrict: '' }))
    if (cityId) {
      try {
        const res = await fetchDistrictsAPI(cityId)
        setDistricts(res || [])
      } catch (err) {
        setDistricts([])
      }
    } else {
      setDistricts([])
    }
  }

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/

    if (!formData.parentName.trim()) errors.parentName = 'Họ tên phụ huynh không được để trống'
    else if (formData.parentName.trim().length < 3) errors.parentName = 'Họ tên phụ huynh phải từ 3 ký tự trở lên'

    if (!formData.phone.trim()) errors.phone = 'Số điện thoại không được để trống'
    else if (!phoneRegex.test(formData.phone.trim())) errors.phone = 'Số điện thoại không hợp lệ (ví dụ: 0912345678)'

    if (!formData.email.trim()) errors.email = 'Email không được để trống'
    else if (!emailRegex.test(formData.email.trim())) errors.email = 'Địa chỉ email không đúng định dạng'

    if (!formData.userName.trim()) {
      errors.userName = 'Tên đăng nhập không được để trống'
    } else if (formData.userName.trim().length < 3) {
      errors.userName = 'Tên đăng nhập phải từ 3 ký tự trở lên'
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.userName.trim())) {
      errors.userName = 'Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới, gạch ngang hoặc dấu chấm'
    }

    if (!formData.password) errors.password = 'Mật khẩu không được để trống'
    else if (formData.password.length < 6) errors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự'

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp'
    }

    if (!formData.studentName.trim()) errors.studentName = 'Họ tên học sinh không được để trống'
    else if (formData.studentName.trim().length < 3) errors.studentName = 'Họ tên học sinh phải từ 3 ký tự trở lên'

    if (!formData.studentBirthDay) errors.studentBirthDay = 'Vui lòng chọn ngày sinh của học sinh'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.warning('Vui lòng kiểm tra lại các trường thông tin!')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        parentName: formData.parentName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        userName: formData.userName.trim().toLowerCase(),
        password: formData.password,
        studentName: formData.studentName.trim(),
        studentBirthDay: formData.studentBirthDay,
        studentGender: parseInt(formData.studentGender),
        courseId: courseId,
        idCity: formData.idCity ? parseInt(formData.idCity) : null,
        idDistrict: formData.idDistrict ? parseInt(formData.idDistrict) : null,
        address: formData.address.trim() || null
      }

      await enrollStudentAPI(payload)
      toast.success('🎉 Ghi danh học viên thành công!')
      setIsEnrolled(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện ghi danh')
    } finally {
      setSubmitting(false)
    }
  }

  // Format schedule display
  const formatSchedules = (csList) => {
    if (!csList || csList.length === 0) return 'Chưa có lịch học cụ thể'

    const daysMap = {
      '2': 'Thứ 2',
      '3': 'Thứ 3',
      '4': 'Thứ 4',
      '5': 'Thứ 5',
      '6': 'Thứ 6',
      '7': 'Thứ 7',
      '0': 'Chủ nhật'
    }

    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      if (typeof timeStr === 'string' && timeStr.includes('T')) {
        return timeStr.split('T')[1].substring(0, 5)
      }
      return timeStr.substring(0, 5)
    }

    return csList.map(s => {
      const days = s.Schedule ? s.Schedule.split('').map(d => daysMap[d] || d).join(', ') : ''
      const time = s.FromTime && s.ToTime ? `(${formatTime(s.FromTime)} - ${formatTime(s.ToTime)})` : ''
      return `${days} ${time}`
    }).join('; ')
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
        <CircularProgress color="primary" size={50} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', p: 3 }}>
        <Card sx={{ maxWidth: 450, borderRadius: '24px', p: 4, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ef4444', mb: 2 }}>Lỗi Truy Cập</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{error}</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 4, py: 1 }}
          >
            Quay về trang đăng nhập
          </Button>
        </Card>
      </Box>
    )
  }

  if (isEnrolled) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        p: 3
      }}>
        <Paper elevation={0} sx={{
          maxWidth: 550,
          borderRadius: '32px',
          p: 5,
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'success.light',
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <CheckCircleIcon sx={{ fontSize: 50 }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#1e293b', letterSpacing: '-1px' }}>
            Đăng Ký Thành Công!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, px: 2 }}>
            Tài khoản phụ huynh và học sinh của bạn đã được khởi tạo và ghi danh vào lớp <strong>{course?.Name}</strong> thành công.
          </Typography>

          <Box sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: '#f1f5f9',
            textAlign: 'left',
            mb: 4,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 1 }}>Thông tin đăng nhập:</Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
                • Tên đăng nhập: <strong>{formData.userName}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                • Email: <strong>{formData.email}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                • Vai trò: <strong>Học viên / Phụ huynh</strong>
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{
              py: 1.8,
              borderRadius: '16px',
              fontWeight: 800,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              }
            }}
          >
            Đăng nhập ngay
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      p: { xs: 2, md: 4 }
    }}>
      <Paper elevation={0} sx={{
        width: '100%',
        maxWidth: 1100,
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        background: 'rgba(255, 255, 255, 0.98)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Grid container>
          {/* Cột trái: Thông tin lớp học (Style xịn tối màu) */}
          <Grid item xs={12} md={4.5} sx={{
            background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
            color: 'white',
            p: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background elements */}
            <Box sx={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(30px)' }} />
            <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)', filter: 'blur(40px)' }} />

            {/* Header */}
            <Box sx={{ zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '10px',
                  bgcolor: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(99, 102, 241, 0.4)'
                }}>
                  <LanguageIcon sx={{ color: '#818cf8' }} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 900, lineHeight: 1.1, letterSpacing: '1px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {course?.School?.Name || 'ISO English'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 800, letterSpacing: '1px' }}>HỆ THỐNG LMS</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '1px' }}>KHÓA HỌC CỦA TÔI</Typography>

              <Box sx={{
                display: 'inline-block',
                px: 2, py: 0.8,
                borderRadius: '8px',
                bgcolor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                mb: 3
              }}>
                <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 700 }}>MÃ LỚP: </Typography>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 900, fontFamily: 'monospace' }}>{course?.Id}</Typography>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                {course?.Name}
              </Typography>

              {course?.Thumbnail && (
                <Box sx={{ width: '100%', height: 160, borderRadius: '16px', overflow: 'hidden', mb: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={resolveFileUrl(course.Thumbnail)} alt={course.Name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}

              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: '#6366f1' }}>
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 700 }}>Trình độ</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{course?.Level?.Name || 'Chưa phân lớp'}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: '#6366f1' }}>
                    <CalendarMonthIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 700 }}>Lịch học hàng tuần</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatSchedules(course?.CourseSchedule)}</Typography>
                  </Box>
                </Box>

                {course?.School?.Name && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: '#6366f1' }}>
                      <LanguageIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 700 }}>Trường / Chi nhánh</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{course.School.Name}</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Footer Left */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 6, zIndex: 1, opacity: 0.6 }}>
              <LockIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Đăng ký bảo mật</Typography>
            </Box>
          </Grid>

          {/* Cột phải: Form Ghi danh */}
          <Grid item xs={12} md={7.5} sx={{ p: { xs: 4, md: 5 } }}>
            <form onSubmit={handleSubmit}>
              {/* Section 1: Thông tin phụ huynh */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TÀI KHOẢN ĐĂNG NHẬP {course?.School?.Name ? course.School.Name.toUpperCase() : 'ISO LMS'}
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Họ và tên Phụ huynh / Người đại diện"
                    fullWidth
                    required
                    value={formData.parentName}
                    onChange={e => handleInputChange('parentName', e.target.value)}
                    error={!!validationErrors.parentName}
                    helperText={validationErrors.parentName}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số điện thoại liên hệ"
                    fullWidth
                    required
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    error={!!validationErrors.phone}
                    helperText={validationErrors.phone}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Địa chỉ Email"
                    fullWidth
                    required
                    type="email"
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tên đăng nhập"
                    fullWidth
                    required
                    placeholder="Nhập tên đăng nhập..."
                    value={formData.userName}
                    onChange={e => handleInputChange('userName', e.target.value)}
                    error={!!validationErrors.userName}
                    helperText={validationErrors.userName}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mật khẩu"
                    fullWidth
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    error={!!validationErrors.password}
                    helperText={validationErrors.password}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Xác nhận mật khẩu"
                    fullWidth
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    error={!!validationErrors.confirmPassword}
                    helperText={validationErrors.confirmPassword}
                    InputProps={{
                      sx: { borderRadius: '12px' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={cities}
                    getOptionLabel={option => option.Name || ''}
                    value={cities.find(c => String(c.Id) === String(formData.idCity)) || null}
                    onChange={(event, newValue) => {
                      handleCityChange(newValue ? newValue.Id : '')
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tỉnh / Thành phố"
                        placeholder="Chọn Tỉnh/Thành..."
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    disabled={!formData.idCity}
                    options={districts}
                    getOptionLabel={option => option.Name || ''}
                    value={districts.find(d => String(d.Id) === String(formData.idDistrict)) || null}
                    onChange={(event, newValue) => {
                      handleInputChange('idDistrict', newValue ? newValue.Id : '')
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Quận / Huyện"
                        placeholder="Chọn Quận/Huyện..."
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Địa chỉ chi tiết"
                    fullWidth
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

              {/* Section 2: Thông tin học sinh */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LanguageIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  THÔNG TIN HỌC VIÊN
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tên học viên"
                    fullWidth
                    required
                    value={formData.studentName}
                    onChange={e => handleInputChange('studentName', e.target.value)}
                    error={!!validationErrors.studentName}
                    helperText={validationErrors.studentName}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày sinh học viên"
                    fullWidth
                    required
                    type="date"
                    value={formData.studentBirthDay}
                    onChange={e => handleInputChange('studentBirthDay', e.target.value)}
                    error={!!validationErrors.studentBirthDay}
                    helperText={validationErrors.studentBirthDay}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      label="Giới tính"
                      value={formData.studentGender}
                      onChange={e => handleInputChange('studentGender', e.target.value)}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value={1}>Nam</MenuItem>
                      <MenuItem value={2}>Nữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mã lớp ghi danh"
                    fullWidth
                    disabled
                    value={courseId}
                    InputProps={{
                      sx: { borderRadius: '12px', bgcolor: '#f8fafc', fontWeight: 'bold', fontFamily: 'monospace' }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                sx={{
                  mt: 5,
                  py: 1.8,
                  borderRadius: '16px',
                  fontWeight: 900,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)',
                  transition: '0.3s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {submitting ? 'ĐANG XỬ LÝ GHI DANH...' : 'HOÀN TẤT GHI DANH'}
              </Button>

              {/* Footer text */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 3, opacity: 0.6 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {course?.School?.Name ? course.School.Name.toUpperCase() : 'ISO LMS'} - HỆ THỐNG GHI DANH BẢO MẬT
                </Typography>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default EnrollClass
