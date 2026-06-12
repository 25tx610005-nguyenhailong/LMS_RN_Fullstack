import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Stack,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputAdornment,
  alpha,
  Autocomplete
} from '@mui/material'
import { toast } from 'react-toastify'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import InfoIcon from '@mui/icons-material/Info'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DateRangeIcon from '@mui/icons-material/DateRange'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { updateCourseAPI, deleteCourseAPI, fetchLevelsAPI } from '~/apis/courseApi'
import { uploadFileAPI } from '~/apis/commonApi'
import { fetchSchoolSettingsAPI, fetchSchoolDashboardAPI, fetchAvailableTeachersAPI } from '~/apis/schoolApi'
import moment from 'moment'

const PRESET_BANNERS = [
  {
    name: 'Công nghệ / Lập trình',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop'
  },
  {
    name: 'Ngoại ngữ / Sách',
    url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop'
  },
  {
    name: 'Nghệ thuật / Sáng tạo',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop'
  },
  {
    name: 'Trừu tượng / Gradient',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop'
  }
]

const COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  accent: '#764ba2',
  danger: '#ef4444'
}

const resolveFileUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  return `http://localhost:8017${url}`
}

function CourseSettings() {
  const { course, reloadCourse } = useOutletContext()
  const navigate = useNavigate()

  const currentUser = useSelector(selectCurrentUser)
  const userRole = currentUser?.role?.toUpperCase()

  const [levels, setLevels] = useState([])
  const [loadingLevels, setLoadingLevels] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [idLevel, setIdLevel] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [linkOnline, setLinkOnline] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState(null)

  // Lịch học States
  const [schoolPeriods, setSchoolPeriods] = useState([])
  const [schoolTeachers, setSchoolTeachers] = useState([])
  const [courseFromDate, setCourseFromDate] = useState('')
  const [courseToDate, setCourseToDate] = useState('')
  const [hasCompletedSessions, setHasCompletedSessions] = useState(false)
  const [schedules, setSchedules] = useState([])
  const [rowAvailableTeachers, setRowAvailableTeachers] = useState({})
  const [lastFetchedConfigs, setLastFetchedConfigs] = useState([])
  const [stepSubmitted, setStepSubmitted] = useState(false)

  // Student is NOT allowed to access settings at all
  if (userRole === 'STUDENT') {
    return <Navigate to={`/courses/${course?.Id}/schedule`} replace />
  }

  useEffect(() => {
    if (!course?.IdSchool) return

    setLoadingLevels(true)
    const schoolId = course.IdSchool

    Promise.all([
      fetchLevelsAPI(),
      fetchSchoolSettingsAPI(schoolId),
      fetchSchoolDashboardAPI(schoolId)
    ])
      .then(([lvData, settingsData, dashboardData]) => {
        setLevels(lvData || [])
        const periods = settingsData?.periods || []
        setSchoolPeriods(periods)
        setSchoolTeachers(dashboardData?.teachers || [])

        // Parse schedules
        const formatDate = (dateStr) => {
          if (!dateStr) return ''
          return dateStr.split('T')[0]
        }

        const formatTime = (timeStr) => {
          if (!timeStr) return ''
          if (typeof timeStr === 'string' && /^\d{2}:\d{2}$/.test(timeStr)) return timeStr
          if (typeof timeStr === 'string' && timeStr.includes('T')) {
            return timeStr.split('T')[1].substring(0, 5)
          }
          const d = new Date(timeStr)
          if (isNaN(d.getTime())) return ''
          const hours = String(d.getUTCHours()).padStart(2, '0')
          const minutes = String(d.getUTCMinutes()).padStart(2, '0')
          return `${hours}:${minutes}`
        }

        const details = course.CourseSchedule?.flatMap(cs => cs.CourseScheduleDetail || []) || []
        const hasCompleted = !!course.hasCompletedSessions || details.some(d => d.Status !== 0)
        setHasCompletedSessions(hasCompleted)

        setCourseFromDate(course.StartDate ? formatDate(course.StartDate) : '')
        setCourseToDate(course.EndDate ? formatDate(course.EndDate) : '')

        const formattedSchedules = []
        course.CourseSchedule?.forEach(s => {
          const fromTimeStr = formatTime(s.FromTime)
          const toTimeStr = formatTime(s.ToTime)
          const foundFromPeriod = periods.find(p => p.FromTime === fromTimeStr)
          const foundToPeriod = periods.find(p => p.ToTime === toTimeStr)

          const baseSchedule = {
            IdAccountTeacher: s.IdAccountTeacher || '',
            FromDate: formatDate(s.FromDate),
            ToDate: formatDate(s.ToDate),
            FromTime: fromTimeStr,
            ToTime: toTimeStr,
            FromPeriodIndexes: s.FromPeriodIndexes || foundFromPeriod?.Indexes || 1,
            ToPeriodIndexes: s.ToPeriodIndexes || foundToPeriod?.Indexes || 1
          }

          if (s.Schedule) {
            s.Schedule.split('').forEach(dayChar => {
              formattedSchedules.push({
                ...baseSchedule,
                Schedule: dayChar
              })
            })
          } else {
            formattedSchedules.push({
              ...baseSchedule,
              Schedule: '2'
            })
          }
        })

        setSchedules(formattedSchedules.length > 0 ? formattedSchedules : [
          {
            IdAccountTeacher: '',
            FromDate: course.StartDate ? formatDate(course.StartDate) : '',
            ToDate: course.EndDate ? formatDate(course.EndDate) : '',
            Schedule: '2',
            FromTime: periods[0]?.FromTime || '08:00',
            ToTime: periods[0]?.ToTime || '08:45',
            FromPeriodIndexes: periods[0]?.Indexes || 1,
            ToPeriodIndexes: periods[0]?.Indexes || 1
          }
        ])
      })
      .catch((err) => {
        console.error(err)
        toast.error('Không thể tải cấu hình lịch học của trường')
      })
      .finally(() => {
        setLoadingLevels(false)
      })
  }, [course])

  useEffect(() => {
    if (course) {
      setName(course.Name || '')
      setIdLevel(course.IdLevel || '')
      setIsOnline(course.IsOnline || false)
      setLinkOnline(course.LinkOnline || '')
      setThumbnail(course.Thumbnail || '')
      setThumbnailFile(null)
    }
  }, [course])

  // Fetch available teachers per row
  useEffect(() => {
    if (!courseFromDate || !courseToDate || !course?.IdSchool || schedules.length === 0) return

    const currentConfigs = schedules.map(s => `${s.Schedule}_${s.FromTime}_${s.ToTime}`)
    let needsUpdate = false

    currentConfigs.forEach((config, idx) => {
      if (lastFetchedConfigs[idx] !== config) {
        needsUpdate = true
      }
    })

    if (lastFetchedConfigs.length !== currentConfigs.length) {
      needsUpdate = true
    }

    if (!needsUpdate) return

    setLastFetchedConfigs(currentConfigs)

    schedules.forEach((s, idx) => {
      if (s.Schedule && s.FromTime && s.ToTime) {
        const params = {
          fromDate: courseFromDate,
          toDate: courseToDate,
          dayOfWeek: s.Schedule,
          fromTime: s.FromTime,
          toTime: s.ToTime,
          excludeCourseId: course.Id
        }

        fetchAvailableTeachersAPI(course.IdSchool, params)
          .then(res => {
            setRowAvailableTeachers(prev => ({
              ...prev,
              [idx]: res
            }))
          })
          .catch(err => console.error(err))
      }
    })
  }, [courseFromDate, courseToDate, schedules, course?.IdSchool, course?.Id, lastFetchedConfigs])

  const handleReset = () => {
    if (course) {
      setName(course.Name || '')
      setIdLevel(course.IdLevel || '')
      setIsOnline(course.IsOnline || false)
      setLinkOnline(course.LinkOnline || '')
      setThumbnail(course.Thumbnail || '')
      setThumbnailFile(null)

      // Reset dates and schedules
      const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return dateStr.split('T')[0]
      }

      const formatTime = (timeStr) => {
        if (!timeStr) return ''
        if (typeof timeStr === 'string' && /^\d{2}:\d{2}$/.test(timeStr)) return timeStr
        if (typeof timeStr === 'string' && timeStr.includes('T')) {
          return timeStr.split('T')[1].substring(0, 5)
        }
        const d = new Date(timeStr)
        if (isNaN(d.getTime())) return ''
        const hours = String(d.getUTCHours()).padStart(2, '0')
        const minutes = String(d.getUTCMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }

      setCourseFromDate(course.StartDate ? formatDate(course.StartDate) : '')
      setCourseToDate(course.EndDate ? formatDate(course.EndDate) : '')

      const formattedSchedules = []
      course.CourseSchedule?.forEach(s => {
        const fromTimeStr = formatTime(s.FromTime)
        const toTimeStr = formatTime(s.ToTime)
        const foundFromPeriod = schoolPeriods.find(p => p.FromTime === fromTimeStr)
        const foundToPeriod = schoolPeriods.find(p => p.ToTime === toTimeStr)

        const baseSchedule = {
          IdAccountTeacher: s.IdAccountTeacher || '',
          FromDate: formatDate(s.FromDate),
          ToDate: formatDate(s.ToDate),
          FromTime: fromTimeStr,
          ToTime: toTimeStr,
          FromPeriodIndexes: s.FromPeriodIndexes || foundFromPeriod?.Indexes || 1,
          ToPeriodIndexes: s.ToPeriodIndexes || foundToPeriod?.Indexes || 1
        }

        if (s.Schedule) {
          s.Schedule.split('').forEach(dayChar => {
            formattedSchedules.push({
              ...baseSchedule,
              Schedule: dayChar
            })
          })
        } else {
          formattedSchedules.push({
            ...baseSchedule,
            Schedule: '2'
          })
        }
      })

      setSchedules(formattedSchedules.length > 0 ? formattedSchedules : [
        {
          IdAccountTeacher: '',
          FromDate: course.StartDate ? formatDate(course.StartDate) : '',
          ToDate: course.EndDate ? formatDate(course.EndDate) : '',
          Schedule: '2',
          FromTime: schoolPeriods[0]?.FromTime || '08:00',
          ToTime: schoolPeriods[0]?.ToTime || '08:45',
          FromPeriodIndexes: schoolPeriods[0]?.Indexes || 1,
          ToPeriodIndexes: schoolPeriods[0]?.Indexes || 1
        }
      ])

      toast.info('Đã khôi phục dữ liệu ban đầu')
    }
  }

  const getConflictingIndexes = () => {
    const conflicts = new Set()
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i]
        const s2 = schedules[j]
        if (s1.Schedule === s2.Schedule) {
          if (s1.FromTime < s2.ToTime && s1.ToTime > s2.FromTime) {
            conflicts.add(i)
            conflicts.add(j)
          }
        }
      }
    }
    return conflicts
  }

  const getTeachersForDropdown = (idx, currentSelectedId) => {
    const available = rowAvailableTeachers[idx] || []
    const currentTeacher = schoolTeachers.find(t => t.Id === currentSelectedId)

    if (currentTeacher && !available.some(t => t.Id === currentSelectedId)) {
      return [
        ...available,
        {
          ...currentTeacher,
          FullName: `${currentTeacher.FullName} (Bị trùng lịch/ngoài giờ)`
        }
      ]
    }

    if (available.length === 0 && !(idx in rowAvailableTeachers)) {
      return schoolTeachers
    }

    return available
  }

  const handleUpdateScheduleRow = (index, field, value) => {
    const updated = [...schedules]

    if (field === 'FromPeriodIndexes') {
      const fromPeriodIdx = Number(value)
      updated[index].FromPeriodIndexes = fromPeriodIdx

      const foundPeriod = schoolPeriods.find(p => p.Indexes === fromPeriodIdx)
      if (foundPeriod) {
        updated[index].FromTime = foundPeriod.FromTime
      }

      if (updated[index].ToPeriodIndexes < fromPeriodIdx) {
        updated[index].ToPeriodIndexes = fromPeriodIdx
        if (foundPeriod) {
          updated[index].ToTime = foundPeriod.ToTime
        }
      } else {
        const toPeriodIdx = updated[index].ToPeriodIndexes
        const foundToPeriod = schoolPeriods.find(p => p.Indexes === toPeriodIdx)
        if (foundToPeriod) {
          updated[index].ToTime = foundToPeriod.ToTime
        }
      }
    } else if (field === 'ToPeriodIndexes') {
      const toPeriodIdx = Number(value)
      updated[index].ToPeriodIndexes = toPeriodIdx

      const foundPeriod = schoolPeriods.find(p => p.Indexes === toPeriodIdx)
      if (foundPeriod) {
        updated[index].ToTime = foundPeriod.ToTime
      }
    } else {
      updated[index][field] = value
    }

    setSchedules(updated)
  }

  const handleAddSchedule = () => {
    const defaultPeriodIdx = schoolPeriods[0]?.Indexes || 1
    const defaultFromTime = schoolPeriods[0]?.FromTime || '08:00'
    const defaultToTime = schoolPeriods[0]?.ToTime || '08:45'

    setSchedules([
      ...schedules,
      {
        IdAccountTeacher: '',
        FromDate: courseFromDate,
        ToDate: courseToDate,
        Schedule: '2',
        FromTime: defaultFromTime,
        ToTime: defaultToTime,
        FromPeriodIndexes: defaultPeriodIdx,
        ToPeriodIndexes: defaultPeriodIdx
      }
    ])
  }

  const removeSchedule = (index) => {
    const next = schedules.filter((_, i) => i !== index)
    setSchedules(next)
  }

  const handleImageUploadChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ cho phép tải lên file hình ảnh (PNG, JPG, WEBP...)!')
      return
    }

    const localUrl = URL.createObjectURL(file)
    setThumbnailFile(file)
    setThumbnail(localUrl)
  }

  const handleSave = async () => {
    setStepSubmitted(true)
    if (!name.trim()) {
      toast.warn('Tên lớp học không được để trống')
      return
    }
    if (!idLevel) {
      toast.warn('Vui lòng chọn cấp độ học')
      return
    }
    if (isOnline && !linkOnline.trim()) {
      toast.warn('Vui lòng nhập đường dẫn học trực tuyến')
      return
    }

    // Validate Lịch học (Chỉ áp dụng cho Admin, Giáo viên không sửa lịch học)
    if (!isTeacher) {
      if (!courseFromDate) {
        toast.warn('Vui lòng chọn Ngày bắt đầu khóa học')
        return
      }
      if (!courseToDate) {
        toast.warn('Vui lòng chọn Ngày kết thúc khóa học')
        return
      }

      const conflictingRows = getConflictingIndexes()
      if (conflictingRows.size > 0) {
        toast.error('Có các dòng lịch học bị trùng lặp thời gian dạy (trong cùng một ngày). Vui lòng điều chỉnh lại!')
        return
      }

      for (let i = 0; i < schedules.length; i++) {
        const s = schedules[i]
        if (!s.IdAccountTeacher) {
          toast.warn(`Vui lòng chọn giáo viên giảng dạy cho khung giờ thứ ${i + 1}`)
          return
        }
        if (!s.Schedule) {
          toast.warn(`Vui lòng chọn Thứ trong tuần cho khung giờ thứ ${i + 1}`)
          return
        }
        if (!s.FromTime || !s.ToTime) {
          toast.warn(`Vui lòng kiểm tra lại tiết học của khung giờ thứ ${i + 1}`)
          return
        }
      }
    }

    setSaving(true)
    try {
      let finalThumbnail = thumbnail

      if (thumbnailFile) {
        setUploading(true)
        try {
          const res = await uploadFileAPI(thumbnailFile, 'course_thumbnails')
          finalThumbnail = res.url
        } catch (err) {
          toast.error('Lỗi khi tải ảnh mới lên hệ thống')
          setSaving(false)
          setUploading(false)
          return
        }
      }

      const payload = {
        Name: name,
        IdLevel: idLevel,
        IsOnline: isOnline,
        LinkOnline: isOnline ? linkOnline : '',
        Thumbnail: finalThumbnail
      }

      // Chỉ Admin mới được phép cập nhật Lịch học và gửi kèm Schedules, StartDate, EndDate lên API
      if (!isTeacher) {
        payload.StartDate = courseFromDate
        payload.EndDate = courseToDate
        payload.Schedules = schedules.map(s => ({
          ...s,
          FromDate: courseFromDate,
          ToDate: courseToDate
        }))
      }

      await updateCourseAPI(course.Id, payload)
      toast.success('🎉 Cập nhật cài đặt lớp học thành công!')
      setThumbnailFile(null)
      reloadCourse()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật cài đặt lớp học')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn xóa lớp học này? Hành động này sẽ xóa vĩnh viễn toàn bộ lớp học, lịch học, dữ liệu điểm danh và thông tin liên quan. Hành động không thể hoàn tác.')) {
      try {
        await deleteCourseAPI(course.Id)
        toast.success('Xóa lớp học thành công')
        navigate(`/school/${course.IdSchool}/overview`)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa lớp học')
      }
    }
  }

  if (loadingLevels) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  const isTeacher = userRole === 'TEACHER'

  return (
    <Box sx={{ pb: 12, animation: 'fadeIn 0.3s ease', p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SettingsIcon sx={{ color: COLORS.accent, fontSize: 32 }} /> Cài đặt lớp học
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cấu hình các thông tin cơ bản, hình thức học tập và các cài đặt quản trị của lớp học {course?.Name}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left column: Form configuration fields */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* General Settings */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>
                  Thông tin cơ bản lớp học
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Mã lớp học"
                      value={course?.Id || ''}
                      fullWidth
                      disabled
                      InputProps={{
                        sx: { borderRadius: '16px', bgcolor: '#f8fafc' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Tên lớp học"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      required
                      InputProps={{
                        sx: { borderRadius: '16px' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Tooltip title={isTeacher ? 'Giáo viên không được thay đổi level lớp học' : ''}>
                      <Autocomplete
                        disabled={isTeacher}
                        options={levels}
                        getOptionLabel={option => option.Name || ''}
                        value={levels.find(l => l.Id === idLevel) || null}
                        onChange={(event, newValue) => {
                          setIdLevel(newValue ? newValue.Id : '')
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Cấp độ học (Chương trình đào tạo)"
                            placeholder="Tìm kiếm cấp độ..."
                            required
                            InputProps={{
                              ...params.InputProps,
                              sx: { borderRadius: '16px', bgcolor: isTeacher ? '#f1f5f9' : 'transparent' }
                            }}
                          />
                        )}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Formats & Location Settings */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                  Hình thức và Liên kết học tập
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isOnline}
                      onChange={(e) => setIsOnline(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>
                      Lớp học trực tuyến (Online Class)
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                {isOnline ? (
                  <TextField
                    label="Đường dẫn phòng học trực tuyến (Zoom / Google Meet...)"
                    value={linkOnline}
                    onChange={(e) => setLinkOnline(e.target.value)}
                    fullWidth
                    required
                    placeholder="https://meet.google.com/..."
                    helperText="Đường dẫn này sẽ hiển thị làm phòng học trực tuyến để giáo viên và học sinh tham gia học tập."
                    InputProps={{
                      sx: { borderRadius: '16px' }
                    }}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: '16px', mt: 1 }}>
                    Khi bật hình thức **Học trực tuyến**, bạn sẽ có thể gán link Zoom/Meet để học sinh và giáo viên click vào lớp học nhanh ngay trên trang lịch trình học tập.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Phân Công & Lịch Học */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                      Phân Công & Lịch Học
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Thiết lập thời gian biểu và chỉ định giáo viên phụ trách lớp học.
                    </Typography>
                  </Box>
                  {!isTeacher && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddSchedule}
                      disabled={schoolPeriods.length === 0}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 800,
                        px: 3,
                        background: schoolPeriods.length === 0 ? '#cbd5e1' : COLORS.primary
                      }}
                    >
                      Thêm Khung Giờ
                    </Button>
                  )}
                </Box>

                {schoolPeriods.length === 0 && (
                  <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 4, borderRadius: '16px', fontWeight: 600 }}>
                    Lưu ý: Trường học chưa được cấu hình tiết học mặc định nào! Hãy hoàn tất cài đặt các tiết học trong mục "Cài đặt trường học" trước để xếp lịch lớp học theo tiết.
                  </Alert>
                )}

                {hasCompletedSessions && (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}>
                    Lớp học đã có buổi học hoàn thành hoặc hủy lịch. Không thể thay đổi ngày bắt đầu và ngày kết thúc!
                  </Alert>
                )}

                {/* Date Selection Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ngày bắt đầu khóa học"
                      type="date"
                      fullWidth
                      required
                      disabled={isTeacher || hasCompletedSessions}
                      error={stepSubmitted && !courseFromDate}
                      helperText={stepSubmitted && !courseFromDate ? 'Ngày bắt đầu là bắt buộc' : ''}
                      value={courseFromDate}
                      onChange={e => setCourseFromDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon sx={{ color: stepSubmitted && !courseFromDate ? 'error.main' : 'text.secondary', mr: 1 }} />,
                        sx: { borderRadius: '16px', bgcolor: (isTeacher || hasCompletedSessions) ? '#f1f5f9' : 'transparent' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ngày kết thúc khóa học"
                      type="date"
                      fullWidth
                      required
                      disabled={isTeacher || hasCompletedSessions}
                      error={stepSubmitted && !courseToDate}
                      helperText={stepSubmitted && !courseToDate ? 'Ngày kết thúc là bắt buộc' : ''}
                      value={courseToDate}
                      onChange={e => setCourseToDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon sx={{ color: stepSubmitted && !courseToDate ? 'error.main' : 'text.secondary', mr: 1 }} />,
                        sx: { borderRadius: '16px', bgcolor: (isTeacher || hasCompletedSessions) ? '#f1f5f9' : 'transparent' }
                      }}
                    />
                  </Grid>
                </Grid>

                {getConflictingIndexes().size > 0 && (
                  <Alert severity="error" icon={<WarningAmberIcon />} sx={{ mb: 4, borderRadius: '16px', fontWeight: 600 }}>
                    Phát hiện trùng lặp thời gian dạy giữa các khung giờ trong cùng ngày! Vui lòng điều chỉnh lại các dòng được bôi đỏ dưới đây.
                  </Alert>
                )}

                {/* Schedules Table */}
                {schoolPeriods.length > 0 && (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden' }}>
                    <Table
                      size="small"
                      sx={{
                        '& .MuiTableCell-root': {
                          borderRight: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0'
                        },
                        '& .MuiTableCell-root:last-child': {
                          borderRight: 'none'
                        }
                      }}
                    >
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 1.5 }}>Ngày (Thứ)</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 1.5 }}>Từ tiết</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 1.5 }}>Đến tiết</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 1.5 }}>Giáo viên</TableCell>
                          {!isTeacher && <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 1.5 }}>Hành động</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {schedules.map((s, idx) => {
                          const isConflicting = getConflictingIndexes().has(idx)
                          return (
                            <TableRow
                              key={idx}
                              sx={{
                                transition: '0.3s',
                                bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                                borderLeft: isConflicting ? '4px solid #ef4444' : 'none',
                                '&:hover': { bgcolor: isConflicting ? 'rgba(239, 68, 68, 0.08)' : '#f8fafc' }
                              }}
                            >
                              <TableCell sx={{ py: 1.5, minWidth: '130px' }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  disabled={isTeacher}
                                  value={s.Schedule}
                                  onChange={e => handleUpdateScheduleRow(idx, 'Schedule', e.target.value)}
                                  InputProps={{ sx: { borderRadius: '12px', bgcolor: isTeacher ? '#f1f5f9' : 'transparent' } }}
                                >
                                  <MenuItem value="2">Thứ hai</MenuItem>
                                  <MenuItem value="3">Thứ ba</MenuItem>
                                  <MenuItem value="4">Thứ tư</MenuItem>
                                  <MenuItem value="5">Thứ năm</MenuItem>
                                  <MenuItem value="6">Thứ sáu</MenuItem>
                                  <MenuItem value="7">Thứ bảy</MenuItem>
                                  <MenuItem value="0">Chủ nhật</MenuItem>
                                </TextField>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, minWidth: '110px' }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  disabled={isTeacher}
                                  value={s.FromPeriodIndexes || 1}
                                  onChange={e => handleUpdateScheduleRow(idx, 'FromPeriodIndexes', e.target.value)}
                                  InputProps={{ sx: { borderRadius: '12px', bgcolor: isTeacher ? '#f1f5f9' : 'transparent' } }}
                                >
                                  {schoolPeriods.map(p => (
                                    <MenuItem key={p.Indexes} value={p.Indexes}>
                                      Tiết {p.Indexes} ({p.FromTime})
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, minWidth: '110px' }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  disabled={isTeacher}
                                  value={s.ToPeriodIndexes || 1}
                                  onChange={e => handleUpdateScheduleRow(idx, 'ToPeriodIndexes', e.target.value)}
                                  InputProps={{ sx: { borderRadius: '12px', bgcolor: isTeacher ? '#f1f5f9' : 'transparent' } }}
                                >
                                  {schoolPeriods
                                    .filter(p => p.Indexes >= (s.FromPeriodIndexes || 1))
                                    .map(p => (
                                      <MenuItem key={p.Indexes} value={p.Indexes}>
                                        Tiết {p.Indexes} ({p.ToTime})
                                      </MenuItem>
                                    ))}
                                </TextField>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, minWidth: '180px' }}>
                                <Autocomplete
                                  disabled={isTeacher}
                                  options={getTeachersForDropdown(idx, s.IdAccountTeacher)}
                                  getOptionLabel={option => option.FullName || ''}
                                  value={getTeachersForDropdown(idx, s.IdAccountTeacher).find(t => t.Id === s.IdAccountTeacher) || null}
                                  onChange={(event, newValue) => {
                                    handleUpdateScheduleRow(idx, 'IdAccountTeacher', newValue ? newValue.Id : '')
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Giáo viên"
                                      placeholder="Tìm giáo viên..."
                                      required
                                      error={stepSubmitted && !s.IdAccountTeacher}
                                      size="small"
                                      InputProps={{
                                        ...params.InputProps,
                                        sx: { borderRadius: '12px', bgcolor: isTeacher ? '#f1f5f9' : 'transparent' }
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>
                              {!isTeacher && (
                                <TableCell align="center" sx={{ py: 1.5 }}>
                                  <Tooltip title="Xóa khung giờ">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => removeSchedule(idx)}
                                        disabled={schedules.length === 1}
                                        sx={{
                                          color: '#94a3b8',
                                          '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) }
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone - Hidden for TEACHER */}
            {!isTeacher && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: '24px',
                  border: '1px solid #fee2e2',
                  bgcolor: '#fff5f5',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.02)'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.danger, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    Khu vực nguy hiểm (Danger Zone)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Các thay đổi trong phần này không thể hoàn tác. Vui lòng cân nhắc kỹ lưỡng trước khi thao tác.
                  </Typography>

                  <Divider sx={{ my: 2, borderColor: '#fecaca' }} />

                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        Xóa lớp học này
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Xóa toàn bộ thông tin lớp học cùng tất cả lịch trình, điểm danh học viên và các bài tập đi kèm.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteForeverIcon />}
                      onClick={handleDelete}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 800,
                        px: 3,
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                        '&:hover': {
                          bgcolor: '#dc2626'
                        }
                      }}
                    >
                      Xóa lớp học
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Right column: Banner upload & selection & preview */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '28px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
              position: 'sticky',
              top: 84
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 2.5 }}>
              Hình ảnh nền lớp học
            </Typography>

            {/* Banner Preview */}
            <Box
              sx={{
                width: '100%',
                height: '140px',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: '#f8fafc',
                border: '2px dashed #cbd5e1',
                mb: 3,
                backgroundImage: thumbnail ? `url(${resolveFileUrl(thumbnail)})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              {(uploading || saving) && (
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              {thumbnail ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setThumbnail('')
                    setThumbnailFile(null)
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Chưa chọn hình nền
                </Typography>
              )}
            </Box>

            {/* Image File Uploader Input */}
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 800,
                border: '2px solid',
                mb: 4,
                borderColor: COLORS.accent,
                color: COLORS.accent,
                '&:hover': {
                  border: '2px solid',
                  borderColor: COLORS.accent,
                  bgcolor: 'rgba(118, 75, 162, 0.04)'
                }
              }}
            >
              Tải lên hình nền mới
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUploadChange}
              />
            </Button>

            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hoặc chọn các mẫu có sẵn:
            </Typography>

            <Stack spacing={1.5}>
              {PRESET_BANNERS.map((banner) => {
                const isSelected = thumbnail === banner.url
                return (
                  <Box
                    key={banner.url}
                    onClick={() => {
                      setThumbnail(banner.url)
                      setThumbnailFile(null)
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1,
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: isSelected ? COLORS.accent : '#f1f5f9',
                      bgcolor: isSelected ? 'rgba(118, 75, 162, 0.02)' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: isSelected ? COLORS.accent : '#cbd5e1',
                        bgcolor: isSelected ? 'rgba(118, 75, 162, 0.02)' : '#f1f5f9'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: '60px',
                        height: '40px',
                        borderRadius: '6px',
                        backgroundImage: `url(${banner.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'block' }}>
                        {banner.name}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckCircleIcon sx={{ color: COLORS.accent, fontSize: 18, mr: 1 }} />
                    )}
                  </Box>
                )
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Sticky Bottom Action Bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid #e2e8f0',
          py: 2,
          px: 4,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          zIndex: 1000,
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.04)'
        }}
      >
        <Button
          variant="outlined"
          startIcon={<UndoIcon />}
          onClick={handleReset}
          disabled={saving}
          sx={{
            borderRadius: '12px',
            px: 3,
            fontWeight: 800,
            textTransform: 'none',
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
          }}
        >
          Hủy Thay Đổi
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            borderRadius: '12px',
            px: 4,
            fontWeight: 800,
            textTransform: 'none',
            background: COLORS.primary,
            boxShadow: '0 4px 12px rgba(118, 75, 162, 0.25)',
            '&:hover': {
              background: COLORS.primary,
              opacity: 0.95
            }
          }}
        >
          {saving ? 'Đang Lưu...' : 'Lưu cài đặt'}
        </Button>
      </Box>
    </Box>
  )
}

export default CourseSettings
