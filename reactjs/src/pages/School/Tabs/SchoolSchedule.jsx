import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Tooltip,
  CircularProgress,
  IconButton,
  Button,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Divider,
  Stack,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete
} from '@mui/material'
import { useOutletContext, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ClassIcon from '@mui/icons-material/Class'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import PersonIcon from '@mui/icons-material/Person'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import EventNoteIcon from '@mui/icons-material/EventNote'
import GroupsIcon from '@mui/icons-material/Groups'
import LanguageIcon from '@mui/icons-material/Language'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TodayIcon from '@mui/icons-material/Today'
import ViewListIcon from '@mui/icons-material/ViewList'

import moment from 'moment'
import {
  fetchCourseSchedulesAPI,
  createCourseScheduleDetailAPI,
  fetchCourseDetailsAPI,
  updateCourseScheduleDetailAPI,
  joinOnlineClassAPI,
  fetchScheduleDetailsListAPI,
  batchConfirmSchedulesAPI
} from '~/apis/courseApi'
import { fetchSchoolSettingsAPI, fetchAvailableTeachersAPI } from '~/apis/schoolApi'
import { toast } from 'react-toastify'


function SchoolSchedule() {
  const theme = useTheme()
  const datePickerRef = useRef(null)
  const { data: dashboardData } = useOutletContext()
  const { schoolId } = useParams()
  const classes = dashboardData?.classes || []
  const schoolTeachers = dashboardData?.teachers || []
  const currentUser = useSelector(selectCurrentUser)
  const role = currentUser?.role?.toUpperCase() // ADMIN, TEACHER, STUDENT
  const ROW_HEIGHT = 125

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [schedules, setSchedules] = useState([])
  const [courseDetails, setCourseDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [periods, setPeriods] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('isoWeek'))

  // New List View States
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' | 'list'
  const [listData, setListData] = useState([])
  const [listPage, setListPage] = useState(1)
  const [listLimit, setListLimit] = useState(10)
  const [listTotal, setListTotal] = useState(0)
  const [selectedListCourseId, setSelectedListCourseId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [listStartDate, setListStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'))
  const [listEndDate, setListEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'))

  const loadListData = async () => {
    setListLoading(true)
    try {
      const res = await fetchScheduleDetailsListAPI({
        page: listPage,
        limit: listLimit,
        courseId: selectedListCourseId || undefined,
        schoolId: schoolId,
        status: selectedStatus !== '' ? parseInt(selectedStatus) : undefined,
        fromDate: listStartDate || undefined,
        toDate: listEndDate || undefined
      })
      setListData(res.data || [])
      setListTotal(res.pagination?.total || 0)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách lịch học')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    if (viewMode === 'list' && schoolId) {
      loadListData()
    }
  }, [viewMode, listPage, listLimit, selectedListCourseId, selectedStatus, listStartDate, listEndDate, schoolId])

  const handleBatchConfirm = async () => {
    if (selectedRowIds.length === 0) return
    try {
      await batchConfirmSchedulesAPI(selectedRowIds)
      toast.success('Xác nhận tính công thành công!')
      setSelectedRowIds([])
      loadListData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xác nhận lịch học')
    }
  }

  const [editEntry, setEditEntry] = useState({
    id: '',
    idAccountTeacher: '',
    date: '',
    fromTime: '08:00',
    toTime: '09:00',
    fromPeriod: 1,
    toPeriod: 1,
    status: 0,
    idMaterial: '',
    idTheme: '',
    idLesson: '',
    note: '',
    isOnline: false,
    linkOnline: ''
  })

  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const date = moment(currentWeekStart).add(idx, 'days')
    return {
      id: date.day() === 0 ? 1 : date.day() + 1,
      name: date.day() === 0 ? 'Chủ Nhật' : `Thứ ${date.day() + 1}`,
      short: date.format('ddd'),
      dateStr: date.format('DD/MM'),
      fullDate: date,
      isToday: date.isSame(moment(), 'day')
    }
  })

  useEffect(() => {
    if (schoolId) {
      fetchSchoolSettingsAPI(schoolId)
        .then(res => {
          const fetchedPeriods = res.periods || []
          setPeriods(fetchedPeriods)
          if (fetchedPeriods.length > 0) {
            setManualEntry(prev => ({
              ...prev,
              fromPeriod: fetchedPeriods[0].Indexes,
              toPeriod: fetchedPeriods[0].Indexes,
              fromTime: fetchedPeriods[0].FromTime,
              toTime: fetchedPeriods[0].ToTime
            }))
          }
        })
        .catch(err => console.error('Error fetching school settings:', err))
    }
  }, [schoolId])

  useEffect(() => {
    if (role === 'STUDENT' && viewMode !== 'calendar') {
      setViewMode('calendar')
    }
  }, [role, viewMode])

  const [manualEntry, setManualEntry] = useState({
    idCourseSchedule: '',
    idAccountTeacher: '',
    date: moment().format('YYYY-MM-DD'),
    fromTime: '08:00',
    toTime: '09:00',
    fromPeriod: 1,
    toPeriod: 1,
    idMaterial: '',
    idTheme: '',
    idLesson: '',
    note: ''
  })

  const [addAvailableTeachers, setAddAvailableTeachers] = useState([])
  const [lastAddConfig, setLastAddConfig] = useState('')
  const [editAvailableTeachers, setEditAvailableTeachers] = useState([])
  const [lastEditConfig, setLastEditConfig] = useState('')

  useEffect(() => {
    if (!showAddModal || !manualEntry.date || !manualEntry.fromTime || !manualEntry.toTime || !schoolId) return

    const getScheduleDayOfWeek = (dateStr) => {
      const day = moment(dateStr).day()
      return day === 0 ? '0' : String(day + 1)
    }

    const config = `${manualEntry.date}_${manualEntry.fromTime}_${manualEntry.toTime}`
    if (lastAddConfig === config) return
    setLastAddConfig(config)

    const params = {
      fromDate: manualEntry.date,
      toDate: manualEntry.date,
      dayOfWeek: getScheduleDayOfWeek(manualEntry.date),
      fromTime: manualEntry.fromTime,
      toTime: manualEntry.toTime
    }

    fetchAvailableTeachersAPI(schoolId, params)
      .then(res => setAddAvailableTeachers(res))
      .catch(err => console.error(err))
  }, [showAddModal, manualEntry.date, manualEntry.fromTime, manualEntry.toTime, schoolId, lastAddConfig])

  useEffect(() => {
    if (!showEditModal || !editEntry.date || !editEntry.fromTime || !editEntry.toTime || !schoolId) return

    const getScheduleDayOfWeek = (dateStr) => {
      const day = moment(dateStr).day()
      return day === 0 ? '0' : String(day + 1)
    }

    const config = `${editEntry.date}_${editEntry.fromTime}_${editEntry.toTime}`
    if (lastEditConfig === config) return
    setLastEditConfig(config)

    const params = {
      fromDate: editEntry.date,
      toDate: editEntry.date,
      dayOfWeek: getScheduleDayOfWeek(editEntry.date),
      fromTime: editEntry.fromTime,
      toTime: editEntry.toTime,
      excludeCourseId: selectedCourseId || undefined
    }

    fetchAvailableTeachersAPI(schoolId, params)
      .then(res => setEditAvailableTeachers(res))
      .catch(err => console.error(err))
  }, [showEditModal, editEntry.date, editEntry.fromTime, editEntry.toTime, schoolId, selectedCourseId, lastEditConfig])

  const getAddTeachersForDropdown = (currentSelectedId) => {
    const available = addAvailableTeachers || []
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

    if (available.length === 0 && addAvailableTeachers.length === 0) {
      return schoolTeachers
    }

    return available
  }

  const getEditTeachersForDropdown = (currentSelectedId) => {
    const available = editAvailableTeachers || []
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

    if (available.length === 0 && editAvailableTeachers.length === 0) {
      return schoolTeachers
    }

    return available
  }

  const handleManualScheduleConfigChange = (e) => {
    const scheduleId = e.target.value
    const selectedSchedule = schedules.find(s => s.Id === parseInt(scheduleId))
    setManualEntry(prev => ({
      ...prev,
      idCourseSchedule: scheduleId,
      idAccountTeacher: selectedSchedule?.IdAccountTeacher || prev.idAccountTeacher
    }))
  }

  const handleOpenEditModal = (detail, parentSchedule) => {
    const detailLesson = detail.CourseScheduleDetailLesson || {}
    setEditEntry({
      id: detail.Id,
      idAccountTeacher: detail.IdAccountTeacher || parentSchedule?.IdAccountTeacher || '',
      date: moment(detail.Date).format('YYYY-MM-DD'),
      fromTime: parseTime(detail.FromTime).format('HH:mm'),
      toTime: parseTime(detail.ToTime).format('HH:mm'),
      fromPeriod: detail.FromPeriodIndexes || 1,
      toPeriod: detail.ToPeriodIndexes || 1,
      status: detail.Status !== undefined ? detail.Status : 0,
      idMaterial: detailLesson.IdMaterial || '',
      idTheme: detailLesson.IdTheme || '',
      idLesson: detailLesson.IdLesson || '',
      note: detail.Note || '',
      isOnline: detail.IsOnline ?? false,
      linkOnline: detail.LinkOnline || ''
    })
    setShowEditModal(true)
  }

  const handleEditThemeChange = (e) => {
    const themeId = e.target.value
    if (!themeId) {
      setEditEntry(prev => ({
        ...prev,
        idMaterial: '',
        idTheme: '',
        idLesson: ''
      }))
      return
    }

    const selectedTheme = allThemes.find(t => t.Id === parseInt(themeId))
    setEditEntry(prev => ({
      ...prev,
      idMaterial: selectedTheme?.IdMaterial || '',
      idTheme: themeId,
      idLesson: ''
    }))
  }

  const handleEditLessonChange = (e) => {
    const lessonId = e.target.value
    setEditEntry(prev => ({
      ...prev,
      idLesson: lessonId
    }))
  }

  const handleManualThemeChange = (e) => {
    const themeId = e.target.value
    if (!themeId) {
      setManualEntry(prev => ({
        ...prev,
        idMaterial: '',
        idTheme: '',
        idLesson: ''
      }))
      return
    }

    const selectedTheme = allThemes.find(t => t.Id === parseInt(themeId))
    setManualEntry(prev => ({
      ...prev,
      idMaterial: selectedTheme?.IdMaterial || '',
      idTheme: themeId,
      idLesson: ''
    }))
  }

  const handleManualLessonChange = (e) => {
    const lessonId = e.target.value
    setManualEntry(prev => ({
      ...prev,
      idLesson: lessonId
    }))
  }

  const handleManualFromPeriodChange = (e) => {
    const fromPeriodIdx = Number(e.target.value)
    const foundPeriod = periods.find(p => p.Indexes === fromPeriodIdx)

    setManualEntry(prev => {
      const nextToPeriod = prev.toPeriod < fromPeriodIdx ? fromPeriodIdx : prev.toPeriod
      const foundToPeriod = periods.find(p => p.Indexes === nextToPeriod)

      return {
        ...prev,
        fromPeriod: fromPeriodIdx,
        fromTime: foundPeriod?.FromTime || prev.fromTime,
        toPeriod: nextToPeriod,
        toTime: foundToPeriod?.ToTime || prev.toTime
      }
    })
  }

  const handleManualToPeriodChange = (e) => {
    const toPeriodIdx = Number(e.target.value)
    const foundPeriod = periods.find(p => p.Indexes === toPeriodIdx)

    setManualEntry(prev => ({
      ...prev,
      toPeriod: toPeriodIdx,
      toTime: foundPeriod?.ToTime || prev.toTime
    }))
  }

  const handleEditFromPeriodChange = (e) => {
    const fromPeriodIdx = Number(e.target.value)
    const foundPeriod = periods.find(p => p.Indexes === fromPeriodIdx)

    setEditEntry(prev => {
      const nextToPeriod = prev.toPeriod < fromPeriodIdx ? fromPeriodIdx : prev.toPeriod
      const foundToPeriod = periods.find(p => p.Indexes === nextToPeriod)

      return {
        ...prev,
        fromPeriod: fromPeriodIdx,
        fromTime: foundPeriod?.FromTime || prev.fromTime,
        toPeriod: nextToPeriod,
        toTime: foundToPeriod?.ToTime || prev.toTime
      }
    })
  }

  const handleEditToPeriodChange = (e) => {
    const toPeriodIdx = Number(e.target.value)
    const foundPeriod = periods.find(p => p.Indexes === toPeriodIdx)

    setEditEntry(prev => ({
      ...prev,
      toPeriod: toPeriodIdx,
      toTime: foundPeriod?.ToTime || prev.toTime
    }))
  }

  const handleSaveEdit = async () => {
    if (!editEntry.idAccountTeacher) {
      toast.error('Vui lòng chọn giáo viên')
      return
    }
    try {
      const payload = {
        IdAccountTeacher: editEntry.idAccountTeacher,
        Date: editEntry.date,
        FromTime: editEntry.fromTime,
        ToTime: editEntry.toTime,
        FromPeriodIndexes: parseInt(editEntry.fromPeriod),
        ToPeriodIndexes: parseInt(editEntry.toPeriod),
        Status: parseInt(editEntry.status),
        IdMaterial: editEntry.idMaterial ? parseInt(editEntry.idMaterial) : null,
        IdTheme: editEntry.idTheme ? parseInt(editEntry.idTheme) : null,
        IdLesson: editEntry.idLesson ? parseInt(editEntry.idLesson) : null,
        Note: editEntry.note || null,
        IsOnline: editEntry.isOnline,
        LinkOnline: editEntry.isOnline ? (editEntry.linkOnline || null) : null
      }
      await updateCourseScheduleDetailAPI(editEntry.id, payload)
      toast.success('Cập nhật lịch học thành công')
      setShowEditModal(false)
      if (viewMode === 'list') {
        loadListData()
      } else {
        const updatedSchedules = await fetchCourseSchedulesAPI(selectedCourseId)
        setSchedules(updatedSchedules.CourseSchedule || [])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật lịch học')
    }
  }


  const handleCourseChange = async (event) => {
    const courseId = event.target.value
    setSelectedCourseId(courseId)
    if (courseId) {
      setLoading(true)
      try {
        const [scheduleData, details] = await Promise.all([
          fetchCourseSchedulesAPI(courseId),
          fetchCourseDetailsAPI(courseId)
        ])
        const courseSchedules = scheduleData.CourseSchedule || []
        setSchedules(courseSchedules)
        setCourseDetails(details)
        if (courseSchedules.length > 0) {
          setManualEntry(prev => ({
            ...prev,
            idCourseSchedule: courseSchedules[0].Id,
            idAccountTeacher: courseSchedules[0].IdAccountTeacher || ''
          }))
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu lớp học')
      } finally {
        setLoading(false)
      }
    } else {
      setSchedules([])
      setCourseDetails(null)
    }
  }

  const handleSaveManual = async () => {
    if (!selectedCourseId || !manualEntry.idAccountTeacher) {
      toast.error('Vui lòng chọn lớp và giáo viên')
      return
    }
    try {
      const payload = {
        IdCourse: selectedCourseId,
        IdCourseSchedule: manualEntry.idCourseSchedule ? parseInt(manualEntry.idCourseSchedule) : null,
        IdAccountTeacher: manualEntry.idAccountTeacher,
        Date: manualEntry.date,
        FromTime: manualEntry.fromTime,
        ToTime: manualEntry.toTime,
        FromPeriodIndexes: parseInt(manualEntry.fromPeriod),
        ToPeriodIndexes: parseInt(manualEntry.toPeriod),
        Note: manualEntry.note,
        IdMaterial: manualEntry.idMaterial ? parseInt(manualEntry.idMaterial) : null,
        IdTheme: manualEntry.idTheme ? parseInt(manualEntry.idTheme) : null,
        IdLesson: manualEntry.idLesson ? parseInt(manualEntry.idLesson) : null
      }
      await createCourseScheduleDetailAPI(selectedCourseId, payload)
      toast.success('Đã thêm buổi học thành công')
      setShowAddModal(false)

      // Reset manualEntry
      setManualEntry({
        idCourseSchedule: schedules[0]?.Id || '',
        idAccountTeacher: schedules[0]?.IdAccountTeacher || '',
        date: moment().format('YYYY-MM-DD'),
        fromTime: '08:00',
        toTime: '09:00',
        fromPeriod: 1,
        toPeriod: 1,
        idMaterial: '',
        idTheme: '',
        idLesson: '',
        note: ''
      })

      const updatedSchedules = await fetchCourseSchedulesAPI(selectedCourseId)
      setSchedules(updatedSchedules.CourseSchedule || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu lịch học')
    }
  }

  const handleJoinOnlineClass = async (detailId) => {
    try {
      const res = await joinOnlineClassAPI(detailId)
      if (res?.LinkOnline) {
        window.open(res.LinkOnline, '_blank')
      } else {
        toast.error('Không tìm thấy link học online!')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tham gia lớp học trực tuyến')
    }
  }

  const parseTime = (val) => {
    if (!val) return moment().startOf('day')
    if (typeof val === 'string') {
      if (val.includes('T')) return moment.utc(val)
      return moment(val, ['HH:mm:ss', 'HH:mm'])
    }
    return moment.utc(val)
  }

  const getStatusConfig = (status, isListView = false) => {
    switch (status) {
    case 1: return { text: 'Hoàn thành', bgcolor: isListView ? 'rgba(16, 185, 129, 0.15)' : '#10b981', color: isListView ? '#10b981' : '#fff' }
    case 2: return { text: 'Hủy lịch', bgcolor: isListView ? 'rgba(239, 68, 68, 0.15)' : '#ef4444', color: isListView ? '#ef4444' : '#fff' }
    case 3: return { text: 'Xác nhận', bgcolor: isListView ? 'rgba(37, 99, 235, 0.15)' : '#2563eb', color: isListView ? '#2563eb' : '#fff' }
    case 0:
    default: return { text: 'Chưa học', bgcolor: isListView ? 'rgba(100, 116, 139, 0.15)' : 'rgba(255,255,255,0.25)', color: isListView ? '#64748b' : '#fff' }
    }
  }

  const COLORS = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
  ]

  const allLessons = courseDetails?.CourseMaterial?.flatMap(m =>
    m.Material?.MaterialTheme?.flatMap(t => t.MaterialLesson)
  ).filter(Boolean) || []

  const allThemes = courseDetails?.CourseMaterial?.flatMap(m =>
    m.Material?.MaterialTheme
  ).filter(Boolean) || []

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CalendarMonthIcon sx={{ color: '#334155' }} /> Thời khóa biểu
          </Typography>
          <Typography variant="body2" color="text.secondary">Quản lý lịch giảng dạy của các lớp học</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
          {viewMode === 'calendar' ? (
            <>
              {/* Week Navigator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'white', p: 0.5, borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <Button size="small" onClick={() => setCurrentWeekStart(moment().startOf('isoWeek'))} sx={{ textTransform: 'none', fontWeight: 700, color: '#6366f1', bgcolor: alpha('#6366f1', 0.1), borderRadius: '12px', px: 2, '&:hover': { bgcolor: alpha('#6366f1', 0.2) } }}>
                  Hôm nay
                </Button>

                <IconButton size="small" onClick={() => setCurrentWeekStart(prev => moment(prev).subtract(1, 'week'))}><ChevronLeftIcon /></IconButton>

                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      if (datePickerRef.current && typeof datePickerRef.current.showPicker === 'function') {
                        datePickerRef.current.showPicker()
                      }
                    }}
                    sx={{ textTransform: 'none', fontWeight: 700, color: '#475569', px: 2 }}
                  >
                    {currentWeekStart.format('DD/MM')} - {moment(currentWeekStart).add(6, 'days').format('DD/MM/YYYY')}
                  </Button>
                  <input
                    ref={datePickerRef}
                    type="date"
                    value={currentWeekStart.format('YYYY-MM-DD')}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCurrentWeekStart(moment(e.target.value).startOf('isoWeek'))
                      }
                    }}
                    style={{ position: 'absolute', bottom: 0, left: '50%', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
                  />
                </Box>

                <IconButton size="small" onClick={() => setCurrentWeekStart(prev => moment(prev).add(1, 'week'))}><ChevronRightIcon /></IconButton>
              </Box>

              <FormControl sx={{ minWidth: 280 }} size="small">
                <InputLabel id="select-course-label">Chọn lớp học cần xem</InputLabel>
                <Select
                  labelId="select-course-label"
                  value={selectedCourseId}
                  label="Chọn lớp học cần xem"
                  onChange={handleCourseChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <span style={{ color: '#94a3b8' }}>-- Chọn lớp học --</span>
                    }
                    const course = classes.find(c => c.Id === selected)
                    return course ? course.Name : selected
                  }}
                  sx={{ borderRadius: '16px', bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                  startAdornment={<ClassIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />}
                >
                  <MenuItem value=""><em>-- Vui lòng chọn lớp --</em></MenuItem>
                  {classes.map(c => (
                    <MenuItem key={c.Id} value={c.Id}>{c.Name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {role === 'ADMIN' && (
                <Button
                  variant="contained" startIcon={<AddIcon />}
                  disabled={!selectedCourseId}
                  onClick={() => setShowAddModal(true)}
                  sx={{ borderRadius: '16px', px: 3, py: 1, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', textTransform: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)', '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)' } }}
                >
                  Thêm buổi học
                </Button>
              )}
            </>
          ) : (
            <>
              {/* List View Controls in Header */}
              <FormControl sx={{ minWidth: 280 }} size="small">
                <InputLabel id="select-list-course-label">Lọc theo lớp học</InputLabel>
                <Select
                  labelId="select-list-course-label"
                  value={selectedListCourseId}
                  label="Lọc theo lớp học"
                  onChange={(e) => {
                    setSelectedListCourseId(e.target.value)
                    setListPage(1)
                    setSelectedRowIds([])
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <span style={{ color: '#94a3b8' }}>-- Tất cả --</span>
                    }
                    const course = classes.find(c => c.Id === selected)
                    return course ? course.Name : selected
                  }}
                  sx={{ borderRadius: '16px', bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                  startAdornment={<ClassIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />}
                >
                  <MenuItem value=""><em>-- Tất cả lớp học --</em></MenuItem>
                  {classes.map(c => (
                    <MenuItem key={c.Id} value={c.Id}>{c.Name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="select-list-status-label">Lọc theo trạng thái</InputLabel>
                <Select
                  labelId="select-list-status-label"
                  value={selectedStatus}
                  label="Lọc theo trạng thái"
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setListPage(1)
                    setSelectedRowIds([])
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <span style={{ color: '#94a3b8' }}>-- Tất cả --</span>
                    }
                    const statusMap = {
                      '0': 'Chưa học',
                      '1': 'Hoàn thành',
                      '2': 'Hủy lịch',
                      '3': 'Xác nhận'
                    }
                    return statusMap[selected] || selected
                  }}
                  sx={{ borderRadius: '16px', bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                  startAdornment={<EventNoteIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />}
                >
                  <MenuItem value=""><em>-- Tất cả trạng thái --</em></MenuItem>
                  <MenuItem value="0">Chưa học</MenuItem>
                  <MenuItem value="1">Hoàn thành</MenuItem>
                  <MenuItem value="2">Hủy lịch</MenuItem>
                  <MenuItem value="3">Xác nhận</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={listStartDate}
                onChange={(e) => {
                  setListStartDate(e.target.value)
                  setListPage(1)
                  setSelectedRowIds([])
                }}
                sx={{
                  width: 170,
                  '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }
                }}
              />

              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={listEndDate}
                onChange={(e) => {
                  setListEndDate(e.target.value)
                  setListPage(1)
                  setSelectedRowIds([])
                }}
                sx={{
                  width: 170,
                  '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }
                }}
              />

              {role === 'ADMIN' && (
                <Button
                  variant="contained"
                  disabled={selectedRowIds.length === 0}
                  onClick={handleBatchConfirm}
                  sx={{
                    borderRadius: '16px',
                    px: 3,
                    py: 1.1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    }
                  }}
                >
                  Xác nhận tính công ({selectedRowIds.length})
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ position: 'relative', marginLeft: '46px', mt: 1 }}>
        {/* Side Tabs Container */}
        <Box
          sx={{
            position: 'absolute',
            left: '-45px',
            top: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            zIndex: 10
          }}
        >
          {/* Calendar Tab (Top) */}
          <Box
            onClick={() => setViewMode('calendar')}
            sx={{
              width: '46px',
              height: '130px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderTopLeftRadius: '16px',
              borderBottomLeftRadius: role === 'STUDENT' ? '16px' : '0px',
              borderTopRightRadius: '0px',
              borderBottomRightRadius: '0px',
              background: viewMode === 'calendar'
                ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' // Sunset Amber/Orange
                : '#f8fafc',
              color: viewMode === 'calendar' ? 'white' : '#64748b',
              fontWeight: 800,
              boxShadow: viewMode === 'calendar'
                ? '-4px 4px 12px rgba(234, 88, 12, 0.25)'
                : 'none',
              transition: 'all 0.2s ease-in-out',
              border: '1px solid #e2e8f0',
              borderRight: viewMode === 'calendar' ? 'none' : '1px solid #e2e8f0',
              zIndex: viewMode === 'calendar' ? 2 : 1,
              '&:hover': {
                background: viewMode === 'calendar'
                  ? 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)'
                  : '#fff7ed',
                color: viewMode === 'calendar' ? 'white' : '#ea580c',
                width: '48px',
                marginLeft: '-2px'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                transform: 'rotate(-90deg)',
                whiteSpace: 'nowrap'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px'
                }}
              >
                Lịch tuần
              </Typography>
              <CalendarMonthIcon sx={{ fontSize: 20, opacity: viewMode === 'calendar' ? 1 : 0.8 }} />
            </Box>
          </Box>

          {/* List Tab (Bottom) */}
          {role !== 'STUDENT' && (
            <Box
              onClick={() => setViewMode('list')}
              sx={{
                width: '46px',
                height: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '16px',
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px',
                background: viewMode === 'list'
                  ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' // Ocean Teal/Green
                  : '#f8fafc',
                color: viewMode === 'list' ? 'white' : '#64748b',
                fontWeight: 800,
                boxShadow: viewMode === 'list'
                  ? '-4px 4px 12px rgba(13, 148, 136, 0.25)'
                  : 'none',
                transition: 'all 0.2s ease-in-out',
                border: '1px solid #e2e8f0',
                borderRight: viewMode === 'list' ? 'none' : '1px solid #e2e8f0',
                zIndex: viewMode === 'list' ? 2 : 1,
                '&:hover': {
                  background: viewMode === 'list'
                    ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
                    : '#f0fdfa',
                  color: viewMode === 'list' ? 'white' : '#0d9488',
                  width: '48px',
                  marginLeft: '-2px'
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transform: 'rotate(-90deg)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Danh sách
                </Typography>
                <ViewListIcon sx={{ fontSize: 20, opacity: viewMode === 'list' ? 1 : 0.8 }} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Main Content Area */}
        <Box sx={{ width: '100%' }}>
          {viewMode === 'calendar' ? (
            !selectedCourseId ? (
              <Paper sx={{ p: 12, textAlign: 'center', borderRadius: '32px', border: '2px dashed #e2e8f0', bgcolor: alpha('#f8fafc', 0.5) }}>
                <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                  <CalendarMonthIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569' }}>Chưa chọn lớp học</Typography>
                <Typography variant="body2" color="text.secondary">Hãy chọn một lớp từ danh sách phía trên để bắt đầu quản lý lịch học.</Typography>
              </Paper>
            ) : loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15, gap: 2 }}>
                <CircularProgress size={40} thickness={4} />
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Đang đồng bộ lịch học...</Typography>
              </Box>
            ) : (
              <Paper
                sx={{
                  borderRadius: '32px',
                  overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: 'white',
                  display: 'flex', flexDirection: 'column', height: 'calc(100vh - 300px)', minHeight: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                }}
              >
                <Box sx={{ display: 'flex', borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', pr: '8px' }}>
                  <Box sx={{ width: 100, borderRight: '1px solid #f1f5f9' }} />
                  <Box sx={{ flex: 1, display: 'flex', minWidth: 800 }}>
                    {weekDays.map(day => (
                      <Box
                        key={day.id}
                        sx={{
                          flex: 1,
                          p: 2,
                          textAlign: 'center',
                          borderRight: day.id === 1 ? 'none' : '1px solid #f1f5f9',
                          bgcolor: day.isToday ? alpha('#e65100', 0.08) : 'transparent',
                          borderTop: day.isToday ? '3px solid #e65100' : '3px solid transparent'
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: day.isToday ? '#e65100' : (day.id === 1 ? '#ef4444' : '#1e293b') }}>
                          {day.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: day.isToday ? '#e65100' : '#94a3b8', fontWeight: 700 }}>
                          {day.dateStr}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex' }}>
                  <Box sx={{ width: 100, borderRight: '1px solid #f1f5f9', bgcolor: '#f8fafc', zIndex: 2 }}>
                    {periods.length === 0 ? (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="error">Chưa có<br/>tiết học</Typography>
                      </Box>
                    ) : periods.map(period => (
                      <Box key={period.Id} sx={{ height: ROW_HEIGHT, p: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>Tiết {period.Indexes}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{period.FromTime} - {period.ToTime}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ flex: 1, position: 'relative', minWidth: 800, height: periods.length * ROW_HEIGHT }}>
                    {periods.map(period => <Box key={period.Id} sx={{ height: ROW_HEIGHT, borderBottom: '1px solid #f1f5f9', width: '100%' }} />)}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                      {weekDays.map(day => (
                        <Box
                          key={day.id}
                          sx={{
                            flex: 1,
                            borderRight: day.id === 1 ? 'none' : '1px solid #f1f5f9',
                            height: '100%',
                            bgcolor: day.isToday ? alpha('#e65100', 0.04) : 'transparent'
                          }}
                        />
                      ))}
                    </Box>

                    {(() => {
                      const allDetails = schedules
                        .flatMap(s => s.CourseScheduleDetail || [])
                        .filter(d => role !== 'TEACHER' || d.IdAccountTeacher === currentUser?.id)

                      const currentWeekDetails = allDetails.filter(d => {
                        const dDate = moment(d.Date)
                        return dDate.isSameOrAfter(currentWeekStart, 'day') && dDate.isBefore(moment(currentWeekStart).add(7, 'days'), 'day')
                      })

                      return currentWeekDetails.map((detail, idx) => {
                        const detailDate = moment(detail.Date)
                        const dayIndex = weekDays.findIndex(d => d.fullDate.isSame(detailDate, 'day'))
                        if (dayIndex === -1) return null

                        const parentSchedule = schedules.find(s => s.Id === detail.IdCourseSchedule)

                        const fromStr = parseTime(detail.FromTime).format('HH:mm')
                        const toStr = parseTime(detail.ToTime).format('HH:mm')

                        const foundFromPeriod = periods.find(p => p.FromTime === fromStr)
                        const foundToPeriod = periods.find(p => p.ToTime === toStr)

                        let fromPeriod = foundFromPeriod?.Indexes || detail.FromPeriodIndexes || 1
                        let toPeriod = foundToPeriod?.Indexes || detail.ToPeriodIndexes || 1

                        const startVisualIndex = periods.findIndex(p => p.Indexes === fromPeriod)
                        const endVisualIndex = periods.findIndex(p => p.Indexes === toPeriod)

                        const top = startVisualIndex !== -1 ? startVisualIndex * ROW_HEIGHT : 0
                        const height = (startVisualIndex !== -1 && endVisualIndex !== -1 && endVisualIndex >= startVisualIndex)
                          ? (endVisualIndex - startVisualIndex + 1) * ROW_HEIGHT
                          : ROW_HEIGHT

                        const statusConfig = getStatusConfig(detail.Status || 0)
                        const statusGradients = {
                          1: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Hoàn thành (Emerald Green)
                          2: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', // Hủy lịch (Slate Muted Gray)
                          3: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', // Xác nhận (Sky Blue to Royal Blue)
                          0: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' // Chưa học (Violet to Indigo)
                        }
                        const cardBackground = statusGradients[detail.Status || 0]
                        const statusShadows = {
                          1: 'rgba(16, 185, 129, 0.25)',
                          2: 'rgba(148, 163, 184, 0.25)',
                          3: 'rgba(37, 99, 235, 0.25)',
                          0: 'rgba(99, 102, 241, 0.25)'
                        }
                        const cardShadow = statusShadows[detail.Status || 0]

                        const materialLesson = detail.MaterialLesson
                        let themeDisplay = ''
                        let lessonDisplay = 'Chưa gán bài học'
                        if (materialLesson) {
                          if (materialLesson.ThemeName) {
                            themeDisplay = `${materialLesson.ThemeName}${materialLesson.ThemeTitle ? ` - ${materialLesson.ThemeTitle}` : ''}`
                          }
                          lessonDisplay = `${materialLesson.Name}${materialLesson.Title ? ` - ${materialLesson.Title}` : ''}`
                        }
                        const teacherName = parentSchedule?.Account?.FullName || 'Không xác định'
                        const teacherAvatar = parentSchedule?.Account?.LinkAvatar

                        return (
                          <Tooltip
                            key={`${detail.Id}-${dayIndex}`}
                            placement="right"
                            arrow
                            title={
                              <Box sx={{ p: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>{courseDetails?.Name}</Typography>
                                <Stack spacing={0.5}>
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon sx={{ fontSize: 14 }} /> {fromStr} - {toStr}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon sx={{ fontSize: 14 }} /> Giáo viên: {teacherName}
                                  </Typography>
                                  {themeDisplay && (
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <MenuBookIcon sx={{ fontSize: 14 }} /> Chuyên đề: {themeDisplay}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MenuBookIcon sx={{ fontSize: 14 }} /> Bài học: {lessonDisplay}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EventNoteIcon sx={{ fontSize: 14 }} /> Trạng thái:
                                    <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: '12px', bgcolor: statusConfig.bgcolor, color: statusConfig.color, fontSize: '0.65rem', fontWeight: 700 }}>
                                      {statusConfig.text}
                                    </Box>
                                  </Typography>
                                  {detail?.IsOnline && (
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#60a5fa' }}>
                                      <LanguageIcon sx={{ fontSize: 14 }} /> Link: {detail?.LinkOnline}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            }
                          >
                            <Box sx={{ position: 'absolute', top: top, left: `${(dayIndex / 7) * 100}%`, width: `${(1 / 7) * 100}%`, height: height, p: 0.75, zIndex: 3 }}>
                              <Box
                                onClick={() => {
                                  if (role !== 'ADMIN' && role !== 'STUDENT' && moment(detail.Date).startOf('day').isBefore(moment().startOf('day'))) {
                                    toast.warning('Không thể chỉnh sửa buổi học đã diễn ra trong quá khứ!')
                                    return
                                  }
                                  handleOpenEditModal(detail, parentSchedule)
                                }}
                                sx={{ height: '100%', width: '100%', background: cardBackground, borderRadius: '14px', p: 1.25, color: 'white', boxShadow: `0 8px 16px ${cardShadow}`, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0.5, opacity: detail.Status === 2 ? 0.6 : 1, '&:hover': { transform: 'translateY(-2px) scale(1.01)', boxShadow: `0 12px 24px ${cardShadow}`, zIndex: 10, opacity: 1 } }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  {detail?.IsOnline ? (
                                    <Box
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255, 255, 255, 0.35)',
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: '6px'
                                      }}
                                    >
                                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                                      <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Online
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255, 255, 255, 0.25)', px: 0.75, py: 0.25, borderRadius: '6px' }}>
                                      <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Offline
                                      </Typography>
                                    </Box>
                                  )}
                                  <Box sx={{ px: 0.75, py: 0.25, borderRadius: '6px', bgcolor: statusConfig.bgcolor, color: statusConfig.color, fontSize: '0.55rem', fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {statusConfig.text}
                                  </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: 'rgba(255, 255, 255, 0.9)' }}>
                                  <AccessTimeIcon sx={{ fontSize: 13 }} />
                                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.3px' }}>
                                    {fromStr} - {toStr}
                                  </Typography>
                                </Box>

                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textDecoration: detail.Status === 2 ? 'line-through' : 'none' }}>
                                  {courseDetails?.Name}
                                </Typography>

                                {height > ROW_HEIGHT && themeDisplay && (
                                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.9, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {themeDisplay}
                                  </Typography>
                                )}

                                {height > ROW_HEIGHT && (
                                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.8, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {lessonDisplay}
                                  </Typography>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', pt: 0.5 }}>
                                  <Avatar src={teacherAvatar} sx={{ width: 18, height: 18, border: '1px solid white' }} />
                                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.9 }}>{teacherName}</Typography>
                                </Box>

                                {detail?.IsOnline && detail?.LinkOnline && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleJoinOnlineClass(detail.Id)
                                    }}
                                    variant="contained"
                                    size="small"
                                    startIcon={<LanguageIcon sx={{ fontSize: '11px !important' }} />}
                                    sx={{
                                      alignSelf: 'flex-start',
                                      textTransform: 'none',
                                      fontWeight: 800,
                                      fontSize: '0.6rem',
                                      borderRadius: '6px',
                                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                                      color: 'white',
                                      border: '1px solid rgba(255, 255, 255, 0.3)',
                                      boxShadow: 'none',
                                      py: 0.25,
                                      px: 1.25,
                                      mt: 0.5,
                                      minWidth: 'auto',
                                      '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.35)',
                                        borderColor: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                      },
                                      '& .MuiButton-startIcon': {
                                        marginRight: '4px',
                                        marginLeft: '-2px'
                                      }
                                    }}
                                  >
                              Vào lớp Online
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Tooltip>
                        )
                      })
                    })()}
                  </Box>
                </Box>
              </Paper>
            )) : (
            <Paper
              sx={{
                borderRadius: '32px',
                overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: 'white',
                display: 'flex', flexDirection: 'column', minHeight: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
              }}
            >

              {listLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15, gap: 2 }}>
                  <CircularProgress size={40} thickness={4} />
                  <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Đang tải danh sách...</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ flex: 1, maxHeight: 'calc(100vh - 340px)', minHeight: '450px' }}>
                    <Table
                      stickyHeader
                      sx={{
                        minWidth: 800,
                        '& .MuiTableCell-root': {
                          borderRight: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0'
                        },
                        '& .MuiTableCell-root:last-child': {
                          borderRight: 'none'
                        }
                      }}
                    >
                      <TableHead sx={{ bgcolor: '#e0e7ff' }}>
                        <TableRow sx={{ '& th': { bgcolor: '#e0e7ff', fontWeight: 800, color: '#312e81' } }}>
                          {role === 'ADMIN' && (
                            <TableCell padding="checkbox" sx={{ width: 50 }}>
                              <Checkbox
                                indeterminate={
                                  selectedRowIds.length > 0 &&
                              selectedRowIds.length < listData.filter(d => d.Status !== 3).length
                                }
                                checked={
                                  listData.length > 0 &&
                              listData.filter(d => d.Status !== 3).length > 0 &&
                              selectedRowIds.length === listData.filter(d => d.Status !== 3).length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const confirmableIds = listData
                                      .filter(d => d.Status !== 3)
                                      .map(d => d.Id)
                                    setSelectedRowIds(confirmableIds)
                                  } else {
                                    setSelectedRowIds([])
                                  }
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell>Lớp học</TableCell>
                          <TableCell>Giáo viên</TableCell>
                          <TableCell>Ngày học</TableCell>
                          <TableCell>Ca học (Thời gian)</TableCell>
                          <TableCell>Hình thức</TableCell>
                          <TableCell>Trạng thái</TableCell>
                          <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {listData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={role === 'ADMIN' ? 8 : 7} align="center" sx={{ py: 10 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Không tìm thấy buổi học nào.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          listData
                            .filter(row => role !== 'TEACHER' || row.IdAccountTeacher === currentUser?.id)
                            .map((row) => {
                              const statusConfig = getStatusConfig(row.Status || 0, true)
                              const formattedDate = moment.utc(row.Date).format('DD/MM/YYYY')
                              const formattedFrom = moment(row.FromTime).utc().format('HH:mm')
                              const formattedTo = moment(row.ToTime).utc().format('HH:mm')
                              const isChecked = selectedRowIds.includes(row.Id)

                              return (
                                <TableRow
                                  key={row.Id}
                                  hover
                                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s' }}
                                >
                                  {role === 'ADMIN' && (
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        disabled={row.Status === 3}
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedRowIds(prev => [...prev, row.Id])
                                          } else {
                                            setSelectedRowIds(prev => prev.filter(id => id !== row.Id))
                                          }
                                        }}
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    {row.CourseSchedule?.Course?.Name || row.IdCourse}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#6366f1' }}>
                                        {(row.Account?.FullName || 'G').charAt(0)}
                                      </Avatar>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.Account?.FullName || '--'}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{formattedDate}</TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                Tiết {row.FromPeriodIndexes} - {row.ToPeriodIndexes}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                ({formattedFrom} - {formattedTo})
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {row.IsOnline ? (
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.25, borderRadius: '8px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '0.75rem', fontWeight: 700 }}>
                                        <LanguageIcon sx={{ fontSize: 14 }} /> Online
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.25, borderRadius: '8px', bgcolor: 'rgba(100, 116, 139, 0.1)', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                                  Offline
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: '10px', bgcolor: statusConfig.bgcolor, color: statusConfig.color, fontSize: '0.75rem', fontWeight: 800 }}>
                                      {statusConfig.text}
                                    </Box>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleOpenEditModal(row, row.CourseSchedule)}
                                      sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                                    >
                                      {role === 'STUDENT' ? 'Xem chi tiết' : 'Chỉnh sửa'}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 3,
                      bgcolor: '#f8fafc',
                      borderTop: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                        Hiển thị
                      </Typography>
                      <Select
                        value={listLimit}
                        onChange={(e) => {
                          setListLimit(parseInt(e.target.value, 10))
                          setListPage(1)
                          setSelectedRowIds([])
                        }}
                        size="small"
                        sx={{
                          borderRadius: '12px',
                          bgcolor: 'white',
                          fontWeight: 800,
                          color: '#1e293b',
                          minWidth: 70,
                          height: 36,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' }
                        }}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                        dòng mỗi trang (Dòng {listTotal === 0 ? 0 : (listPage - 1) * listLimit + 1}-{Math.min(listPage * listLimit, listTotal)} trên tổng số {listTotal})
                      </Typography>
                    </Box>

                    {listTotal > 0 && (
                      <Pagination
                        count={Math.ceil(listTotal / listLimit)}
                        page={listPage}
                        onChange={(e, val) => {
                          setListPage(val)
                          setSelectedRowIds([])
                        }}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            border: '1px solid #cbd5e1',
                            bgcolor: '#ffffff',
                            color: '#334155',
                            minWidth: '36px',
                            height: '36px',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: '#f1f5f9',
                              borderColor: '#94a3b8',
                              color: '#0f172a'
                            },
                            '&.Mui-selected': {
                              bgcolor: '#6366f1',
                              color: '#ffffff',
                              borderColor: '#6366f1',
                              fontWeight: 700,
                              '&:hover': {
                                bgcolor: '#4f46e5',
                                borderColor: '#4f46e5'
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </Box>
                </>
              )}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Manual Add Modal - Refined Premium Design */}
      <Dialog
        open={showAddModal} onClose={() => setShowAddModal(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)' } }}
      >
        <DialogTitle component="div" sx={{ py: 1.5, px: 3, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.1rem' }}>Thiết lập buổi dạy mới</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>{courseDetails?.Name}</Typography>
          </Box>
          <IconButton onClick={() => setShowAddModal(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Khung lịch dạy Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Khung lịch dạy của lớp</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Chọn khung lịch</InputLabel>
                <Select
                  value={manualEntry.idCourseSchedule}
                  label="Chọn khung lịch"
                  onChange={handleManualScheduleConfigChange}
                  startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: '#6366f1', fontSize: 18 }} />}
                  sx={{ borderRadius: '12px' }}
                >
                  {schedules.map(s => {
                    const fromStr = parseTime(s.FromTime).format('HH:mm')
                    const toStr = parseTime(s.ToTime).format('HH:mm')
                    const days = s.Schedule ? s.Schedule.split('').map(d => d === '0' ? 'CN' : `T${d}`).join(', ') : ''
                    return (
                      <MenuItem key={s.Id} value={s.Id}>
                        Lịch #{s.Id} ({days} | {fromStr} - {toStr}) - GV: {s.Account?.FullName || 'Không xác định'}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Personnel Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Nhân sự tham gia</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={getAddTeachersForDropdown(manualEntry.idAccountTeacher)}
                    getOptionLabel={option => option.FullName || ''}
                    value={getAddTeachersForDropdown(manualEntry.idAccountTeacher).find(t => t.Id === manualEntry.idAccountTeacher) || null}
                    onChange={(event, newValue) => {
                      setManualEntry({ ...manualEntry, idAccountTeacher: newValue ? newValue.Id : '' })
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Giáo viên chính"
                        placeholder="Tìm kiếm giáo viên chính..."
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <PersonIcon sx={{ mr: 1, color: '#6366f1', fontSize: 18 }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Time Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Thời gian & Ca học</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Ngày thực hiện" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={manualEntry.date} onChange={e => setManualEntry({ ...manualEntry, date: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Từ tiết</InputLabel>
                    <Select
                      value={manualEntry.fromPeriod || 1}
                      label="Từ tiết"
                      onChange={handleManualFromPeriodChange}
                      sx={{ borderRadius: '12px' }}
                    >
                      {periods.map(p => (
                        <MenuItem key={p.Indexes} value={p.Indexes}>
                          Tiết {p.Indexes} ({p.FromTime})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Đến tiết</InputLabel>
                    <Select
                      value={manualEntry.toPeriod || 1}
                      label="Đến tiết"
                      onChange={handleManualToPeriodChange}
                      sx={{ borderRadius: '12px' }}
                    >
                      {periods
                        .filter(p => p.Indexes >= (manualEntry.fromPeriod || 1))
                        .map(p => (
                          <MenuItem key={p.Indexes} value={p.Indexes}>
                            Tiết {p.Indexes} ({p.ToTime})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Content Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Nội dung chi tiết</Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Chuyên đề</InputLabel>
                  <Select
                    value={manualEntry.idTheme}
                    label="Chuyên đề"
                    onChange={handleManualThemeChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span style={{ color: '#94a3b8' }}>Chọn chuyên đề</span>
                      }
                      const matched = allThemes.find(t => t.Id === parseInt(selected))
                      return matched ? `${matched.Name}${matched.Title ? ` - ${matched.Title}` : ''}` : selected
                    }}
                    startAdornment={<MenuBookIcon sx={{ mr: 1, color: '#10b981', fontSize: 18 }} />}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value=""><em>-- Chọn chuyên đề --</em></MenuItem>
                    {allThemes.map(t => (
                      <MenuItem key={t.Id} value={t.Id}>
                        {t.Name}{t.Title ? ` - ${t.Title}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={!manualEntry.idTheme}>
                  <InputLabel>Bài học</InputLabel>
                  <Select
                    value={manualEntry.idLesson}
                    label="Bài học"
                    onChange={handleManualLessonChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span style={{ color: '#94a3b8' }}>Chọn bài học</span>
                      }
                      const activeTheme = allThemes.find(t => t.Id === parseInt(manualEntry.idTheme))
                      const matched = (activeTheme?.MaterialLesson || []).find(l => l.Id === parseInt(selected))
                      return matched ? `${matched.Name}${matched.Title ? ` - ${matched.Title}` : ''}` : selected
                    }}
                    startAdornment={<MenuBookIcon sx={{ mr: 1, color: '#8b5cf6', fontSize: 18 }} />}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value=""><em>-- Chọn bài học --</em></MenuItem>
                    {((allThemes.find(t => t.Id === parseInt(manualEntry.idTheme)))?.MaterialLesson || []).map(l => (
                      <MenuItem key={l.Id} value={l.Id}>
                        {l.Name}{l.Title ? ` - ${l.Title}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Ghi chú thêm" fullWidth multiline rows={2} size="small" value={manualEntry.note} onChange={e => setManualEntry({ ...manualEntry, note: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ py: 2, px: 3, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => setShowAddModal(false)} sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b', borderRadius: '12px', px: 3 }}>Hủy bỏ</Button>
          <Button
            variant="contained" startIcon={<SaveIcon />} onClick={handleSaveManual}
            sx={{ borderRadius: '14px', px: 5, py: 1.2, background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', textTransform: 'none', fontWeight: 800, boxShadow: '0 8px 20px rgba(234, 88, 12, 0.25)', '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)' } }}
          >
            Lưu buổi học
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Schedule Modal - Refined Premium Design */}
      <Dialog
        open={showEditModal} onClose={() => setShowEditModal(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)' } }}
      >
        <DialogTitle component="div" sx={{ py: 1.5, px: 3, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.1rem' }}>
              {role === 'STUDENT' ? 'Chi tiết buổi học' : 'Cập nhật buổi học'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>{courseDetails?.Name}</Typography>
          </Box>
          <IconButton onClick={() => setShowEditModal(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Personnel Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Nhân sự tham gia</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    disabled={role !== 'ADMIN' || editEntry.status === 3}
                    options={getEditTeachersForDropdown(editEntry.idAccountTeacher)}
                    getOptionLabel={option => option.FullName || ''}
                    value={getEditTeachersForDropdown(editEntry.idAccountTeacher).find(t => t.Id === editEntry.idAccountTeacher) || null}
                    onChange={(event, newValue) => {
                      setEditEntry({ ...editEntry, idAccountTeacher: newValue ? newValue.Id : '' })
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Giáo viên chính"
                        placeholder="Tìm kiếm giáo viên chính..."
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <PersonIcon sx={{ mr: 1, color: '#6366f1', fontSize: 18 }} />
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Time Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Thời gian & Ca học</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Ngày thực hiện" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={editEntry.date} onChange={e => setEditEntry({ ...editEntry, date: e.target.value })} disabled={role !== 'ADMIN' || editEntry.status === 3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" disabled={role !== 'ADMIN' || editEntry.status === 3}>
                    <InputLabel>Từ tiết</InputLabel>
                    <Select
                      value={editEntry.fromPeriod || 1}
                      label="Từ tiết"
                      onChange={handleEditFromPeriodChange}
                      sx={{ borderRadius: '12px' }}
                    >
                      {periods.map(p => (
                        <MenuItem key={p.Indexes} value={p.Indexes}>
                          Tiết {p.Indexes} ({p.FromTime})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" disabled={role !== 'ADMIN' || editEntry.status === 3}>
                    <InputLabel>Đến tiết</InputLabel>
                    <Select
                      value={editEntry.toPeriod || 1}
                      label="Đến tiết"
                      onChange={handleEditToPeriodChange}
                      sx={{ borderRadius: '12px' }}
                    >
                      {periods
                        .filter(p => p.Indexes >= (editEntry.fromPeriod || 1))
                        .map(p => (
                          <MenuItem key={p.Indexes} value={p.Indexes}>
                            Tiết {p.Indexes} ({p.ToTime})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Status Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>Trạng thái buổi học</Typography>
              {role === 'STUDENT' ? (
                <Box>
                  {(() => {
                    const STATUS_OPTIONS = [
                      { value: 0, label: 'Chưa học', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
                      { value: 1, label: 'Hoàn thành', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' },
                      { value: 2, label: 'Hủy lịch', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)' },
                      { value: 3, label: 'Xác nhận', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)', border: 'rgba(37, 99, 235, 0.2)' }
                    ]
                    const opt = STATUS_OPTIONS.find(o => o.value === editEntry.status) || STATUS_OPTIONS[0]
                    return (
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.75,
                          borderRadius: '10px',
                          bgcolor: opt.bg,
                          color: opt.color,
                          border: `1px solid ${opt.border}`,
                          fontWeight: 800,
                          fontSize: '0.8rem'
                        }}
                      >
                        {opt.label}
                      </Box>
                    )
                  })()}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {[
                    { value: 0, label: 'Chưa học', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
                    { value: 1, label: 'Hoàn thành', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' },
                    { value: 2, label: 'Hủy lịch', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)' },
                    { value: 3, label: 'Xác nhận', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)', border: 'rgba(37, 99, 235, 0.2)' }
                  ].map(opt => {
                    const isSelected = editEntry.status === opt.value
                    const isFuture = editEntry.date && moment(editEntry.date).startOf('day').isAfter(moment().startOf('day'))
                    const isStatusRestricted = isFuture && (opt.value === 1 || opt.value === 3)

                    const isDisabled = isStatusRestricted || (role !== 'ADMIN' && (
                      (opt.value === 2 && editEntry.status !== 2) ||
                      (opt.value === 3 && editEntry.status !== 3) ||
                      (editEntry.status === 2 || editEntry.status === 3)
                    ))

                    if (isDisabled && !isSelected) return null

                    return (
                      <Button
                        key={opt.value}
                        variant={isSelected ? 'contained' : 'outlined'}
                        disabled={isDisabled}
                        onClick={() => setEditEntry({ ...editEntry, status: opt.value })}
                        sx={{
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          px: 2.5,
                          py: 1,
                          borderColor: isSelected ? 'transparent' : opt.border,
                          bgcolor: isSelected ? opt.color : 'white',
                          color: isSelected ? 'white' : opt.color,
                          boxShadow: isSelected ? `0 4px 12px ${alpha(opt.color, 0.2)}` : 'none',
                          '&:hover': {
                            bgcolor: isSelected ? opt.color : alpha(opt.color, 0.04),
                            borderColor: opt.color,
                            boxShadow: isSelected ? `0 6px 16px ${alpha(opt.color, 0.3)}` : 'none'
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#f1f5f9',
                            color: '#94a3b8',
                            borderColor: '#e2e8f0'
                          }
                        }}
                      >
                        {opt.label}
                      </Button>
                    )
                  })}
                </Box>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Hình thức học</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small" disabled={role === 'STUDENT' || editEntry.status === 3}>
                    <InputLabel>Hình thức</InputLabel>
                    <Select
                      value={editEntry.isOnline ? 1 : 0}
                      label="Hình thức"
                      onChange={e => setEditEntry({ ...editEntry, isOnline: e.target.value === 1, linkOnline: e.target.value === 1 ? editEntry.linkOnline : '' })}
                      startAdornment={<LanguageIcon sx={{ mr: 1, color: '#6366f1', fontSize: 18 }} />}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value={0}>Offline</MenuItem>
                      <MenuItem value={1}>Online</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {editEntry.isOnline && (
                  <Grid item xs={12} md={8}>
                    <TextField
                      label="Link học Online"
                      fullWidth
                      size="small"
                      placeholder="https://..."
                      value={editEntry.linkOnline}
                      onChange={e => setEditEntry({ ...editEntry, linkOnline: e.target.value })}
                      disabled={role === 'STUDENT' || editEntry.status === 3}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Syllabus & Lesson Assignment Section */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Gán bài học theo giáo trình</Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small" disabled={role === 'STUDENT' || editEntry.status === 3}>
                  <InputLabel>Chuyên đề</InputLabel>
                  <Select
                    value={editEntry.idTheme}
                    label="Chuyên đề"
                    onChange={handleEditThemeChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span style={{ color: '#94a3b8' }}>Chọn chuyên đề</span>
                      }
                      const matched = allThemes.find(t => t.Id === parseInt(selected))
                      return matched ? `${matched.Name}${matched.Title ? ` - ${matched.Title}` : ''}` : selected
                    }}
                    startAdornment={<MenuBookIcon sx={{ mr: 1, color: '#10b981', fontSize: 18 }} />}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value=""><em>-- Chọn chuyên đề --</em></MenuItem>
                    {allThemes.map(t => (
                      <MenuItem key={t.Id} value={t.Id}>
                        {t.Name}{t.Title ? ` - ${t.Title}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={role === 'STUDENT' || editEntry.status === 3 || !editEntry.idTheme}>
                  <InputLabel>Bài học</InputLabel>
                  <Select
                    value={editEntry.idLesson}
                    label="Bài học"
                    onChange={handleEditLessonChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span style={{ color: '#94a3b8' }}>Chọn bài học</span>
                      }
                      const activeTheme = allThemes.find(t => t.Id === parseInt(editEntry.idTheme))
                      const matched = (activeTheme?.MaterialLesson || []).find(l => l.Id === parseInt(selected))
                      return matched ? `${matched.Name}${matched.Title ? ` - ${matched.Title}` : ''}` : selected
                    }}
                    startAdornment={<MenuBookIcon sx={{ mr: 1, color: '#8b5cf6', fontSize: 18 }} />}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value=""><em>-- Chọn bài học --</em></MenuItem>
                    {((allThemes.find(t => t.Id === parseInt(editEntry.idTheme)))?.MaterialLesson || []).map(l => (
                      <MenuItem key={l.Id} value={l.Id}>
                        {l.Name}{l.Title ? ` - ${l.Title}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Ghi chú thêm" fullWidth multiline rows={2} size="small" value={editEntry.note || ''} onChange={e => setEditEntry({ ...editEntry, note: e.target.value })} disabled={role === 'STUDENT' || editEntry.status === 3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, mt: 2 }} />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ py: 2, px: 3, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => setShowEditModal(false)} sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b', borderRadius: '12px', px: 3 }}>
            {role === 'STUDENT' ? 'Đóng' : 'Hủy bỏ'}
          </Button>
          {role !== 'STUDENT' && (role === 'ADMIN' || editEntry.status !== 3) && (
            <Button
              variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit}
              sx={{ borderRadius: '14px', px: 5, py: 1.2, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', textTransform: 'none', fontWeight: 800, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)', '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' } }}
            >
              Cập nhật
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SchoolSchedule
