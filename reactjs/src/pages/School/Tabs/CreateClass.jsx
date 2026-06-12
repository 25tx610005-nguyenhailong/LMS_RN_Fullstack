import { useState, useEffect } from 'react'
import {
  Grid, Paper, Box, Typography, Button,
  TextField, MenuItem,
  Switch, Stack, FormControl, InputLabel,
  Select, CircularProgress, alpha, useTheme, Divider, Avatar, Pagination, InputAdornment,
  IconButton, Tooltip, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert,
  Dialog, DialogContent, Autocomplete
} from '@mui/material'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import SchoolIcon from '@mui/icons-material/School'
import EventNoteIcon from '@mui/icons-material/EventNote'
import DeleteIcon from '@mui/icons-material/Delete'
import DateRangeIcon from '@mui/icons-material/DateRange'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { fetchLevelsAPI, fetchMaterialsAPI, createCourseAPI, fetchCourseDetailsAPI, updateCourseAPI } from '~/apis/courseApi'
import { fetchSchoolSettingsAPI, fetchAvailableTeachersAPI } from '~/apis/schoolApi'
import { uploadFileAPI } from '~/apis/commonApi'
import { resolveFileUrl, getFrontendEnrollLink } from '~/utils/formatters'
import RefreshIcon from '@mui/icons-material/Refresh'
import { toast } from 'react-toastify'

const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const part1 = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
  const part2 = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
  return `${part1}-${part2}`
}

const STEPS = [
  { label: 'Cơ bản', icon: <SchoolIcon sx={{ fontSize: 18 }} /> },
  { label: 'Giáo trình', icon: <MenuBookIcon sx={{ fontSize: 18 }} /> },
  { label: 'Lịch học', icon: <EventNoteIcon sx={{ fontSize: 18 }} /> }
]

function CreateClass() {
  const theme = useTheme()
  const { data: dashboardData } = useOutletContext()
  const { schoolId, courseId } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!courseId

  const [activeStep, setActiveStep] = useState(0)
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false)
  const [createdCourseInfo, setCreatedCourseInfo] = useState(null)

  // Metadata
  const [levels, setLevels] = useState([])
  const [materials, setMaterials] = useState([])
  const [schoolPeriods, setSchoolPeriods] = useState([])
  const schoolTeachers = dashboardData?.teachers || []

  // Material selection logic
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 4

  const [courseFromDate, setCourseFromDate] = useState('')
  const [courseToDate, setCourseToDate] = useState('')
  const [stepSubmitted, setStepSubmitted] = useState(false)
  const [hasCompletedSessions, setHasCompletedSessions] = useState(false)

  const [rowAvailableTeachers, setRowAvailableTeachers] = useState({})
  const [lastFetchedConfigs, setLastFetchedConfigs] = useState([])

  // Real-time schedule internal overlap checking helper
  const getConflictingIndexes = () => {
    const conflicts = new Set()
    const schedules = formData.Schedules

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i]
        const s2 = schedules[j]

        // Compare day of week (Schedule)
        if (s1.Schedule === s2.Schedule) {
          // Check time overlap: FromTime1 < ToTime2 AND ToTime1 > FromTime2
          if (s1.FromTime < s2.ToTime && s1.ToTime > s2.FromTime) {
            conflicts.add(i)
            conflicts.add(j)
          }
        }
      }
    }
    return conflicts
  }

  // Form State
  const [formData, setFormData] = useState({
    Id: generateRandomCode(),
    Name: '',
    IdLevel: '',
    Thumbnail: '',
    IsOnline: false,
    LinkOnline: '',
    LinkEnrol: '',
    Materials: [],
    Schedules: [
      {
        IdAccountTeacher: '',
        FromDate: '',
        ToDate: '',
        Schedule: '2',
        FromTime: '08:00',
        ToTime: '08:45',
        FromPeriodIndexes: 1,
        ToPeriodIndexes: 1
      }
    ]
  })

  // Fetch metadata and course details
  useEffect(() => {
    setLoadingMetadata(true)
    const promises = [fetchLevelsAPI(), fetchMaterialsAPI()]
    if (schoolId) {
      promises.push(fetchSchoolSettingsAPI(schoolId))
    }
    if (isEditMode) {
      promises.push(fetchCourseDetailsAPI(courseId))
    }

    Promise.all(promises)
      .then(([lvData, mtData, settingsData, courseData]) => {
        setLevels(lvData)
        setMaterials(mtData)

        const periods = settingsData?.periods || []
        setSchoolPeriods(periods)

        if (isEditMode && courseData) {
          const selectedMaterials = courseData.CourseMaterial?.map(cm => cm.IdMaterial) || []

          const details = courseData.CourseSchedule?.flatMap(cs => cs.CourseScheduleDetail || []) || []
          const hasCompleted = !!courseData.hasCompletedSessions || details.some(d => d.Status !== 0)
          setHasCompletedSessions(hasCompleted)

          const formatDate = (dateStr) => {
            if (!dateStr) return ''
            return dateStr.split('T')[0]
          }

          const formatTime = (timeStr) => {
            if (!timeStr) return ''
            if (typeof timeStr === 'string' && /^\d{2}:\d{2}$/.test(timeStr)) return timeStr

            if (typeof timeStr === 'string' && timeStr.includes('T')) {
              const timePart = timeStr.split('T')[1]
              return timePart.substring(0, 5)
            }

            const d = new Date(timeStr)
            if (isNaN(d.getTime())) return ''
            const hours = String(d.getUTCHours()).padStart(2, '0')
            const minutes = String(d.getUTCMinutes()).padStart(2, '0')
            return `${hours}:${minutes}`
          }

          // Prepopulate start and end dates from course details directly
          if (courseData.StartDate) {
            setCourseFromDate(formatDate(courseData.StartDate))
          } else {
            const firstSchedule = courseData.CourseSchedule?.[0]
            if (firstSchedule) {
              setCourseFromDate(formatDate(firstSchedule.FromDate))
            }
          }

          if (courseData.EndDate) {
            setCourseToDate(formatDate(courseData.EndDate))
          } else {
            const firstSchedule = courseData.CourseSchedule?.[0]
            if (firstSchedule) {
              setCourseToDate(formatDate(firstSchedule.ToDate))
            }
          }

          const formattedSchedules = []
          courseData.CourseSchedule?.forEach(s => {
            const fromTimeStr = formatTime(s.FromTime)
            const toTimeStr = formatTime(s.ToTime)

            // Try to find matching periods based on start and end times
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

          setFormData({
            Id: courseData.Id,
            Name: courseData.Name || '',
            IdLevel: courseData.IdLevel || '',
            Thumbnail: courseData.Thumbnail || '',
            IsOnline: !!courseData.IsOnline,
            LinkOnline: courseData.LinkOnline || '',
            LinkEnrol: courseData.LinkEnrol || '',
            Materials: selectedMaterials,
            Schedules: formattedSchedules.length > 0 ? formattedSchedules : [
              {
                IdAccountTeacher: '',
                FromDate: '',
                ToDate: '',
                Schedule: '2',
                FromTime: periods[0]?.FromTime || '08:00',
                ToTime: periods[0]?.ToTime || '08:45',
                FromPeriodIndexes: periods[0]?.Indexes || 1,
                ToPeriodIndexes: periods[0]?.Indexes || 1
              }
            ]
          })
        } else if (periods.length > 0) {
          // Preset time schedules with first period times on creation mode
          setFormData(prev => ({
            ...prev,
            Schedules: [
              {
                IdAccountTeacher: '',
                FromDate: '',
                ToDate: '',
                Schedule: '2',
                FromTime: periods[0].FromTime,
                ToTime: periods[0].ToTime,
                FromPeriodIndexes: periods[0].Indexes,
                ToPeriodIndexes: periods[0].Indexes
              }
            ]
          }))
        }
      })
      .catch(err => {
        toast.error('Lỗi khi tải dữ liệu cấu hình')
        console.error(err)
      })
      .finally(() => setLoadingMetadata(false))
  }, [courseId, isEditMode, schoolId])

  useEffect(() => {
    if (!courseFromDate || !courseToDate || schoolId === undefined) return

    const currentConfigs = formData.Schedules.map(s => `${s.Schedule}_${s.FromTime}_${s.ToTime}`)
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

    formData.Schedules.forEach((s, idx) => {
      if (s.Schedule && s.FromTime && s.ToTime) {
        const params = {
          fromDate: courseFromDate,
          toDate: courseToDate,
          dayOfWeek: s.Schedule,
          fromTime: s.FromTime,
          toTime: s.ToTime
        }
        if (isEditMode) {
          params.excludeCourseId = courseId
        }

        fetchAvailableTeachersAPI(schoolId, params)
          .then(res => {
            setRowAvailableTeachers(prev => ({
              ...prev,
              [idx]: res
            }))
          })
          .catch(err => console.error(err))
      }
    })
  }, [courseFromDate, courseToDate, formData.Schedules, schoolId, isEditMode, courseId, lastFetchedConfigs])

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

  const validateStep = (step) => {
    if (step === 0) {
      if (!formData.Id) { toast.warning('Vui lòng nhập hoặc tạo mã lớp học'); return false }
      if (!formData.Name) { toast.warning('Vui lòng nhập tên lớp học'); return false }
      if (!formData.IdLevel) { toast.warning('Vui lòng chọn trình độ / level'); return false }
      if (formData.IsOnline && !formData.LinkOnline) { toast.warning('Vui lòng nhập link học trực tuyến'); return false }
    }
    if (step === 1) {
      if (formData.Materials.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một giáo trình')
        return false
      }
    }
    if (step === 2) {
      if (!courseFromDate) {
        toast.warning('Vui lòng chọn Ngày bắt đầu khóa học')
        return false
      }
      if (!courseToDate) {
        toast.warning('Vui lòng chọn Ngày kết thúc khóa học')
        return false
      }

      if (!isEditMode) {
        const localToday = new Date()
        const todayStr = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`
        if (courseFromDate < todayStr) {
          toast.warning('Ngày bắt đầu khóa học không được nhỏ hơn ngày hiện tại')
          return false
        }
      }

      // Check for internal duplicates/overlaps
      const conflictingRows = getConflictingIndexes()
      if (conflictingRows.size > 0) {
        toast.error('Có các dòng lịch học bị trùng lặp thời gian dạy (trong cùng một ngày). Vui lòng điều chỉnh lại!')
        return false
      }

      for (let i = 0; i < formData.Schedules.length; i++) {
        const s = formData.Schedules[i]
        if (!s.IdAccountTeacher) {
          toast.warning(`Vui lòng chọn giáo viên giảng dạy cho khung giờ thứ ${i + 1}`)
          return false
        }
        if (!s.Schedule) { toast.warning(`Vui lòng chọn Thứ trong tuần cho khung giờ thứ ${i + 1}`); return false }
        if (!s.FromTime || !s.ToTime) { toast.warning(`Vui lòng kiểm tra lại tiết học của khung giờ thứ ${i + 1}`); return false }
      }
    }
    return true
  }

  const handleNext = () => {
    if (activeStep === 2) {
      setStepSubmitted(true)
    }
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1)
      setStepSubmitted(false)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setStepSubmitted(false)
  }

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setThumbnailFile(file)
    setFormData({ ...formData, Thumbnail: localUrl })
  }

  const handleSave = async () => {
    setStepSubmitted(true)
    if (!validateStep(activeStep)) return

    setSubmitting(true)
    try {
      let finalThumbnail = formData.Thumbnail

      if (thumbnailFile) {
        setUploading(true)
        try {
          const res = await uploadFileAPI(thumbnailFile, 'course_thumbnails')
          finalThumbnail = res.url
        } catch (err) {
          toast.error('Lỗi khi tải ảnh lên hệ thống')
          setSubmitting(false)
          setUploading(false)
          return
        }
      }

      // Sync the global start & end dates into all schedule slots for details generation
      const payload = {
        ...formData,
        Thumbnail: finalThumbnail,
        IdSchool: schoolId,
        Schedules: formData.Schedules.map(s => ({
          ...s,
          FromDate: courseFromDate,
          ToDate: courseToDate
        }))
      }

      if (isEditMode) {
        await updateCourseAPI(courseId, payload)
        toast.success('🎉 Đã cập nhật lớp học thành công!')
        navigate(`/school/${schoolId}/classes`)
      } else {
        const createdCourse = await createCourseAPI(payload)
        toast.success('🎉 Đã tạo lớp học thành công!')
        setCreatedCourseInfo({
          Id: createdCourse.Id || formData.Id,
          Name: createdCourse.Name || formData.Name,
          LinkEnrol: getFrontendEnrollLink(createdCourse.LinkEnrol, createdCourse.Id || formData.Id)
        })
        setOpenSuccessDialog(true)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xử lý thông tin lớp học')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  // Update a specific cell in a schedule row
  const handleUpdateScheduleRow = (index, field, value) => {
    const updated = [...formData.Schedules]

    if (field === 'FromPeriodIndexes') {
      const fromPeriodIdx = Number(value)
      updated[index].FromPeriodIndexes = fromPeriodIdx

      // Sync times from schoolPeriods
      const foundPeriod = schoolPeriods.find(p => p.Indexes === fromPeriodIdx)
      if (foundPeriod) {
        updated[index].FromTime = foundPeriod.FromTime
      }

      // Auto-bump end period if it's earlier than start period
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

    setFormData({ ...formData, Schedules: updated })
  }

  const handleAddSchedule = () => {
    const defaultPeriodIdx = schoolPeriods[0]?.Indexes || 1
    const defaultFromTime = schoolPeriods[0]?.FromTime || '08:00'
    const defaultToTime = schoolPeriods[0]?.ToTime || '08:45'

    setFormData({
      ...formData,
      Schedules: [
        ...formData.Schedules,
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
      ]
    })
  }

  const removeSchedule = (index) => {
    const next = formData.Schedules.filter((_, i) => i !== index)
    setFormData({ ...formData, Schedules: next })
  }

  // Filter and paginate materials
  const filteredMaterials = materials.filter(m =>
    m.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.Id.toString().includes(searchTerm)
  )
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const paginatedMaterials = filteredMaterials.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const gradientPrimary = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'

  if (loadingMetadata) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ width: '100%', mt: 1, pb: 4 }}>
      <Paper elevation={0} sx={{
        borderRadius: '32px',
        overflow: 'hidden',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.04)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Modern Header Section */}
        <Box sx={{
          background: gradientPrimary,
          p: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: 100, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1.5px' }}>{isEditMode ? 'Chỉnh Sửa Lớp Học' : 'Tạo Lớp Học Mới'}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>{isEditMode ? 'Cập nhật lộ trình học tập và thông tin chi tiết.' : 'Bắt đầu xây dựng lộ trình học tập chuyên nghiệp ngay hôm nay.'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                {STEPS.map((step, index) => (
                  <Box key={index} sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: '16px',
                    bgcolor: activeStep === index ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid',
                    borderColor: activeStep === index ? 'rgba(255,255,255,0.4)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: '0.3s'
                  }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: activeStep >= index ? 'white' : 'rgba(255,255,255,0.2)',
                      color: activeStep >= index ? '#6366f1' : 'white'
                    }}>
                      {step.icon}
                    </Box>
                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', lineHeight: 1 }}>Bước {index + 1}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{step.label}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: 5 }}>
          {/* Main Content Area */}
          <Box sx={{ minHeight: '380px' }}>
            {activeStep === 0 && (
              <Grid container spacing={5}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, textAlign: 'left', color: '#1e293b' }}>Hình đại diện lớp</Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1, borderRadius: '24px', border: '2px dashed',
                        borderColor: formData.Thumbnail ? 'primary.main' : '#cbd5e1',
                        bgcolor: '#f8fafc', position: 'relative', height: '260px',
                        transition: '0.3s',
                        overflow: 'hidden',
                        '&:hover': { borderColor: theme.palette.primary.main, transform: 'scale(1.01)' }
                      }}
                    >
                      {uploading && (
                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CircularProgress size={30} thickness={5} />
                        </Box>
                      )}
                      {formData.Thumbnail ? (
                        <Box sx={{ height: '100%', position: 'relative' }}>
                          <img src={resolveFileUrl(formData.Thumbnail)} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
                          <IconButton
                            size="small"
                            onClick={() => {
                              setFormData({ ...formData, Thumbnail: '' })
                              setThumbnailFile(null)
                            }}
                            sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2 }}>
                            <CloudUploadIcon sx={{ fontSize: 40 }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Tải lên hình ảnh lớp học</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 3 }}>PNG, JPG hoặc WEBP. Tối đa 5MB.</Typography>
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{ borderRadius: '12px', px: 4, textTransform: 'none', fontWeight: 700, border: '2px solid' }}
                          >
                            Chọn file ảnh
                            <input type="file" hidden accept="image/*" onChange={handleThumbnailUpload} />
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>Thông tin chi tiết</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label={isEditMode ? 'Mã định danh lớp học' : 'Mã định danh lớp học (Tự động)'} fullWidth
                        disabled={isEditMode}
                        value={formData.Id} onChange={e => setFormData({ ...formData, Id: e.target.value.toUpperCase() })}
                        placeholder="VD: A54P-KJ4D"
                        InputProps={{
                          sx: { borderRadius: '16px', bgcolor: isEditMode ? '#e2e8f0' : '#f8fafc' },
                          endAdornment: !isEditMode && (
                            <InputAdornment position="end">
                              <Tooltip title="Tạo mã mới">
                                <IconButton onClick={() => setFormData({ ...formData, Id: generateRandomCode() })} size="small">
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Tên lớp học" fullWidth
                        value={formData.Name} onChange={e => setFormData({ ...formData, Name: e.target.value })}
                        placeholder="Nhập tên khóa học/lớp học"
                        InputProps={{ sx: { borderRadius: '16px', bgcolor: '#f8fafc' } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={levels}
                        getOptionLabel={option => option.Name || ''}
                        value={levels.find(l => l.Id === formData.IdLevel) || null}
                        onChange={(event, newValue) => {
                          setFormData({ ...formData, IdLevel: newValue ? newValue.Id : '' })
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Trình độ / Level học viên"
                            placeholder="Tìm kiếm trình độ..."
                            InputProps={{
                              ...params.InputProps,
                              sx: { borderRadius: '16px', bgcolor: '#f8fafc' }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 2, border: '1.5px solid #e2e8f0', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        bgcolor: formData.IsOnline ? alpha(theme.palette.primary.main, 0.05) : '#f8fafc',
                        transition: '0.3s'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                            <CloudUploadIcon sx={{ fontSize: 20, color: formData.IsOnline ? 'primary.main' : '#64748b' }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>Chế độ Online</Typography>
                            <Typography variant="caption" color="text.secondary">Tắt nếu học tại trung tâm</Typography>
                          </Box>
                        </Box>
                        <Switch checked={formData.IsOnline} onChange={e => setFormData({ ...formData, IsOnline: e.target.checked })} />
                      </Box>
                    </Grid>
                    {formData.IsOnline && (
                      <Grid item xs={12}>
                        <TextField
                          label="Link học trực tuyến (Zoom / Meet / Teams)" fullWidth
                          value={formData.LinkOnline} onChange={e => setFormData({ ...formData, LinkOnline: e.target.value })}
                          placeholder="https://zoom.us/j/..."
                          InputProps={{ sx: { borderRadius: '16px', bgcolor: '#f8fafc' } }}
                        />
                      </Grid>
                    )}
                    {isEditMode && formData.LinkEnrol && (() => {
                      const displayEnrollLink = getFrontendEnrollLink(formData.LinkEnrol, courseId)
                      return (
                        <Grid item xs={12}>
                          <TextField
                            label="Đường dẫn đăng ký ghi danh công khai (Link Enroll)"
                            fullWidth
                            value={displayEnrollLink}
                            InputProps={{
                              readOnly: true,
                              sx: { borderRadius: '16px', bgcolor: '#f8fafc', fontWeight: 'bold', fontFamily: 'monospace' },
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip title="Sao chép link">
                                    <IconButton
                                      onClick={() => {
                                        navigator.clipboard.writeText(displayEnrollLink)
                                        toast.success('📋 Đã sao chép liên kết ghi danh!')
                                      }}
                                      edge="end"
                                    >
                                      <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Mở trong tab mới">
                                    <IconButton
                                      onClick={() => window.open(displayEnrollLink, '_blank')}
                                      edge="end"
                                      sx={{ ml: 1 }}
                                    >
                                      <ArrowForwardIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                      )
                    })()}
                  </Grid>
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5 }}>Lựa Chọn Tài Liệu</Typography>
                    <Typography variant="body2" color="text.secondary">Đính kèm các giáo trình và học liệu cho lớp học này.</Typography>
                  </Box>
                  <TextField
                    size="small"
                    placeholder="Tìm theo tên hoặc mã..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                    sx={{ width: '320px', '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f8fafc' } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="primary" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Grid container spacing={3} sx={{ minHeight: '300px' }}>
                  {paginatedMaterials.map((m) => {
                    const isSelected = formData.Materials.includes(m.Id)
                    return (
                      <Grid item xs={12} md={6} key={m.Id}>
                        <Paper
                          elevation={0}
                          onClick={() => {
                            setFormData({ ...formData, Materials: [m.Id] })
                          }}
                          sx={{
                            p: 2, borderRadius: '24px', border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'rgba(226, 232, 240, 0.6)',
                            cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: 3,
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.02) : 'white',
                            position: 'relative',
                            '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-3px)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <Avatar src={m.ImageUrl} variant="rounded" sx={{ width: 70, height: 70, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                            {isSelected && (
                              <Box sx={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderRadius: '4px', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AddIcon sx={{ fontSize: 14 }} />
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : '#1e293b' }}>{m.Name}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption" sx={{ px: 1, py: 0.2, bgcolor: '#f1f5f9', borderRadius: '4px', fontWeight: 700 }}>ID: {m.Id}</Typography>
                              <Typography variant="caption" color="text.secondary">Giáo trình chuẩn</Typography>
                            </Box>
                          </Box>
                          <Radio checked={isSelected} sx={{ p: 0 }} color="primary" />
                        </Paper>
                      </Grid>
                    )
                  })}
                  {paginatedMaterials.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ py: 10, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '24px' }}>
                        <MenuBookIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">Không tìm thấy tài liệu phù hợp</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, val) => setPage(val)}
                      color="primary"
                      shape="rounded"
                      sx={{ '& .MuiPaginationItem-root': { fontWeight: 700, borderRadius: '8px' } }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5 }}>Phân Công & Lịch Học</Typography>
                    <Typography variant="body2" color="text.secondary">Thiết lập thời gian biểu và chỉ định giáo viên phụ trách.</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSchedule}
                    disabled={schoolPeriods.length === 0}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 3, background: schoolPeriods.length === 0 ? '#cbd5e1' : gradientPrimary }}
                  >
                    Thêm Khung Giờ
                  </Button>
                </Box>

                {schoolPeriods.length === 0 && (
                  <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 4, borderRadius: '16px', fontWeight: 600 }}>
                    Lưu ý: Trường học chưa được cấu hình tiết học mặc định nào! Hãy hoàn tất cài đặt các tiết học trong mục &quot;Cài đặt trường học&quot; trước để xếp lịch lớp học theo tiết.
                  </Alert>
                )}

                {hasCompletedSessions && (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}>
                    Lớp học đã có buổi học hoàn thành hoặc hủy lịch. Không thể thay đổi ngày bắt đầu và ngày kết thúc!
                  </Alert>
                )}

                {/* Date selection row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ngày bắt đầu khóa học"
                      type="date"
                      fullWidth
                      required
                      disabled={hasCompletedSessions}
                      error={stepSubmitted && !courseFromDate}
                      helperText={stepSubmitted && !courseFromDate ? 'Ngày bắt đầu là bắt buộc' : ''}
                      value={courseFromDate}
                      onChange={e => setCourseFromDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon sx={{ color: stepSubmitted && !courseFromDate ? 'error.main' : 'text.secondary', mr: 1 }} />,
                        sx: { borderRadius: '16px', bgcolor: hasCompletedSessions ? '#e2e8f0' : '#f8fafc' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ngày kết thúc khóa học"
                      type="date"
                      fullWidth
                      required
                      disabled={hasCompletedSessions}
                      error={stepSubmitted && !courseToDate}
                      helperText={stepSubmitted && !courseToDate ? 'Ngày kết thúc là bắt buộc' : ''}
                      value={courseToDate}
                      onChange={e => setCourseToDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon sx={{ color: stepSubmitted && !courseToDate ? 'error.main' : 'text.secondary', mr: 1 }} />,
                        inputProps: { min: new Date().toISOString().split('T')[0] },
                        sx: { borderRadius: '16px', bgcolor: hasCompletedSessions ? '#e2e8f0' : '#f8fafc' }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Overlap alert banner */}
                {getConflictingIndexes().size > 0 && (
                  <Alert severity="error" icon={<WarningAmberIcon />} sx={{ mb: 4, borderRadius: '16px', fontWeight: 600 }}>
                    Phát hiện trùng lặp thời gian dạy giữa các khung giờ trong cùng ngày! Vui lòng điều chỉnh lại các dòng được bôi đỏ dưới đây.
                  </Alert>
                )}

                {/* Premium Schedules Table */}
                {schoolPeriods.length > 0 && (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', mb: 3 }}>
                    <Table
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
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Ngày (Thứ)</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Từ tiết</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Đến tiết</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Giáo viên</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Hành động</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.Schedules.map((s, idx) => {
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
                              <TableCell sx={{ py: 2, minWidth: '150px' }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  value={s.Schedule}
                                  onChange={e => handleUpdateScheduleRow(idx, 'Schedule', e.target.value)}
                                  InputProps={{ sx: { borderRadius: '12px' } }}
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
                              <TableCell sx={{ py: 2, minWidth: '130px' }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  value={s.FromPeriodIndexes || 1}
                                  onChange={e => handleUpdateScheduleRow(idx, 'FromPeriodIndexes', e.target.value)}
                                  InputProps={{ sx: { borderRadius: '12px' } }}
                                >
                                  {schoolPeriods.map(p => (
                                    <MenuItem key={p.Indexes} value={p.Indexes}>
                                      Tiết {p.Indexes} ({p.FromTime})
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell sx={{ py: 2, minWidth: '130px' }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  value={s.ToPeriodIndexes || 1}
                                  onChange={e => handleUpdateScheduleRow(idx, 'ToPeriodIndexes', e.target.value)}
                                  InputProps={{ sx: { borderRadius: '12px' } }}
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
                              <TableCell sx={{ py: 2, minWidth: '200px' }}>
                                <Autocomplete
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
                                      helperText={stepSubmitted && !s.IdAccountTeacher ? 'Bắt buộc chọn giáo viên' : ''}
                                      size="small"
                                      InputProps={{
                                        ...params.InputProps,
                                        sx: { borderRadius: '12px' }
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ py: 2 }}>
                                <Tooltip title="Xóa khung giờ">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => removeSchedule(idx)}
                                      disabled={formData.Schedules.length === 1}
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
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 4, opacity: 0.6 }} />

          {/* Action Footer - High Contrast */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              disabled={activeStep === 0 || submitting}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{ px: 4, borderRadius: '14px', fontWeight: 800, textTransform: 'none', color: '#1e293b' }}
            >
              Quay lại
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={() => navigate(`/school/${schoolId}/classes`)}
                sx={{ px: 3, borderRadius: '14px', fontWeight: 700, textTransform: 'none', color: '#64748b' }}
              >
                Hủy bỏ
              </Button>
              {activeStep === STEPS.length - 1 ? (
                <Button
                  variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={submitting}
                  sx={{
                    px: 6, py: 1.5, borderRadius: '16px', fontWeight: 900, textTransform: 'none',
                    background: gradientPrimary,
                    boxShadow: '0 12px 24px rgba(99, 102, 241, 0.3)',
                    fontSize: '1rem'
                  }}
                >
                  {submitting ? (isEditMode ? 'Đang cập nhật...' : 'Đang khởi tạo...') : (isEditMode ? 'Hoàn tất & Cập nhật' : 'Hoàn tất & Tạo lớp học')}
                </Button>
              ) : (
                <Button
                  variant="contained" onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 6, py: 1.5, borderRadius: '16px', fontWeight: 900, textTransform: 'none',
                    background: gradientPrimary,
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)',
                    fontSize: '1rem'
                  }}
                >
                  Tiếp theo
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Dialog hiển thị Link ghi danh */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 4 }}>
          <Box sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'success.light',
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.4)' },
              '70%': { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(46, 125, 50, 0)' },
              '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)' }
            }
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 44 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1e293b' }}>
            Khởi Tạo Lớp Học Thành Công!
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            {createdCourseInfo?.Name} ({createdCourseInfo?.Id})
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 2 }}>
            Sử dụng liên kết bên dưới để gửi cho Học sinh đăng ký tài khoản và tự động ghi danh vào lớp học này.
          </Typography>

          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            borderRadius: '16px',
            bgcolor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            mb: 4
          }}>
            <Typography variant="body2" sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              color: '#475569',
              wordBreak: 'break-all',
              textAlign: 'left',
              flex: 1
            }}>
              {createdCourseInfo?.LinkEnrol}
            </Typography>
            <Tooltip title="Sao chép link">
              <IconButton
                onClick={() => {
                  if (createdCourseInfo?.LinkEnrol) {
                    navigator.clipboard.writeText(createdCourseInfo.LinkEnrol)
                    toast.success('📋 Đã sao chép liên kết ghi danh!')
                  }
                }}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #e2e8f0',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (createdCourseInfo?.LinkEnrol) {
                  window.open(createdCourseInfo.LinkEnrol, '_blank')
                }
              }}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: '14px',
                fontWeight: 700,
                textTransform: 'none',
                borderWidth: '2px',
                '&:hover': { borderWidth: '2px' }
              }}
            >
              Mở link đăng ký (Tab mới)
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setOpenSuccessDialog(false)
                navigate(`/school/${schoolId}/classes`)
                window.location.reload()
              }}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: '14px',
                fontWeight: 800,
                textTransform: 'none',
                background: gradientPrimary,
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
              }}
            >
              Hoàn tất & Đóng
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default CreateClass
