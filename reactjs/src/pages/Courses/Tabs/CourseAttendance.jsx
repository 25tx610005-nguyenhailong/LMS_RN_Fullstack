import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  InputAdornment,
  Divider
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import TodayIcon from '@mui/icons-material/Today'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import moment from 'moment'
import { fetchCourseAttendanceAPI, updateCourseAttendanceAPI } from '~/apis/courseApi'
import { toast } from 'react-toastify'
import { resolveFileUrl } from '~/utils/formatters'

// Gradient background for the save button
const GRADIENT_HEADER = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'

function CourseAttendance() {
  const { id: courseId } = useParams()
  const currentUser = useSelector(selectCurrentUser)
  const role = currentUser?.role?.toUpperCase() // ADMIN, TEACHER, STUDENT
  const isTeacher = role === 'TEACHER' || role === 'ADMIN'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [localAttendance, setLocalAttendance] = useState({})
  const [isDirty, setIsDirty] = useState(false)

  // Pagination and filtering states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(0)
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
    setPage(0)
  }

  // Date configuration
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'))
  const [weekDays, setWeekDays] = useState([])

  // Calculate the 7 days of the selected week (Mon to Sun)
  useEffect(() => {
    const monday = selectedDate.clone().startOf('isoWeek')
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(monday.clone().add(i, 'days'))
    }
    setWeekDays(days)
  }, [selectedDate])

  const loadAttendance = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD')
      const res = await fetchCourseAttendanceAPI(courseId, dateStr)
      if (res) {
        setStudents(res.students || [])
        setSessions(res.sessions || [])

        // Map attendance to local key-value state: "studentId_YYYY-MM-DD" -> status (1: Present, 2: Absent)
        const initialMap = {}
        if (res.attendance) {
          res.attendance.forEach(record => {
            const dateKey = moment.utc(record.StartDate).format('YYYY-MM-DD')
            initialMap[`${record.IdAccountStudent}_${dateKey}`] = record.Status
          })
        }
        setLocalAttendance(initialMap)
        setIsDirty(false)
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu điểm danh!')
    } finally {
      setLoading(false)
    }
  }, [courseId, selectedDate])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  const handlePrevWeek = () => {
    setSelectedDate(prev => prev.clone().subtract(1, 'weeks'))
  }

  const handleNextWeek = () => {
    setSelectedDate(prev => prev.clone().add(1, 'weeks'))
  }

  const handleToday = () => {
    setSelectedDate(moment().startOf('day'))
  }

  const handleDateChange = (e) => {
    if (e.target.value) {
      setSelectedDate(moment(e.target.value).startOf('day'))
    }
  }

  // Directly toggle state on click: Present (1) <-> Absent (2). Default is Absent (2).
  const handleCellToggle = (studentId, dateKey) => {
    if (!isTeacher) return
    setLocalAttendance(prev => {
      const newMap = { ...prev }
      const key = `${studentId}_${dateKey}`
      const current = newMap[key] || 2 // Default to Absent if not set

      if (current === 1) {
        newMap[key] = 2 // Toggle to Absent
      } else {
        newMap[key] = 1 // Toggle to Present
      }
      return newMap
    })
    setIsDirty(true)
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      // Map all student-session combinations to send to the server
      const todayStr = moment().format('YYYY-MM-DD')
      const activeSessions = sessions.filter(sess => moment.utc(sess.Date).format('YYYY-MM-DD') <= todayStr)

      const payload = []
      students.forEach(student => {
        activeSessions.forEach(sess => {
          const dateKey = moment.utc(sess.Date).format('YYYY-MM-DD')
          const status = localAttendance[`${student.IdAccountStudent}_${dateKey}`] || 2 // Default to Absent
          payload.push({
            idAccountStudent: student.IdAccountStudent,
            date: dateKey,
            status: status
          })
        })
      })

      await updateCourseAttendanceAPI(courseId, payload)
      toast.success('Lưu điểm danh thành công!')
      setIsDirty(false)
      loadAttendance()
    } catch (error) {
      toast.error('Gặp lỗi khi lưu điểm danh!')
    } finally {
      setSaving(false)
    }
  }

  const renderStatusCell = (studentId, dateKey, hasSession) => {
    if (!hasSession) {
      return (
        <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
          -
        </Typography>
      )
    }

    const status = localAttendance[`${studentId}_${dateKey}`] || 2 // Default to Absent (2)

    if (status === 1) {
      return (
        <IconButton
          onClick={() => handleCellToggle(studentId, dateKey)}
          disabled={!isTeacher}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            border: '2px solid #10b981',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: 'rgba(16, 185, 129, 0.2)',
              transform: isTeacher ? 'scale(1.08)' : 'none'
            },
            '&.Mui-disabled': {
              color: '#10b981',
              borderColor: '#10b981',
              bgcolor: 'rgba(16, 185, 129, 0.08)'
            }
          }}
        >
          <CheckIcon sx={{ fontSize: 16, fontWeight: 900 }} />
        </IconButton>
      )
    }

    // Default or status === 2: Absent
    return (
      <IconButton
        onClick={() => handleCellToggle(studentId, dateKey)}
        disabled={!isTeacher}
        sx={{
          width: 32,
          height: 32,
          bgcolor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          border: '2px solid #ef4444',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: 'rgba(239, 68, 68, 0.2)',
            transform: isTeacher ? 'scale(1.08)' : 'none'
          },
          '&.Mui-disabled': {
            color: '#ef4444',
            borderColor: '#ef4444',
            bgcolor: 'rgba(239, 68, 68, 0.08)'
          }
        }}
      >
        <CloseIcon sx={{ fontSize: 16, fontWeight: 900 }} />
      </IconButton>
    )
  }

  const filteredStudents = students.filter(student => {
    // Search by name
    const studentName = student.StudentProfile?.Name || student.FullName || ''
    const matchesName = studentName.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesName) return false

    // Filter by status
    if (statusFilter === 'ALL') return true

    const todayStr = moment().format('YYYY-MM-DD')
    const activeSessions = sessions.filter(sess => moment.utc(sess.Date).format('YYYY-MM-DD') <= todayStr)
    let totalActive = 0
    let presentCount = 0
    let absentCount = 0

    activeSessions.forEach(sess => {
      const dateKey = moment.utc(sess.Date).format('YYYY-MM-DD')
      const status = localAttendance[`${student.IdAccountStudent}_${dateKey}`] || 2
      totalActive++
      if (status === 1) presentCount++
      if (status === 2) absentCount++
    })

    if (statusFilter === 'HAS_ABSENT') {
      return absentCount > 0
    }
    if (statusFilter === 'PRESENT_ALL') {
      return totalActive > 0 ? presentCount === totalActive : true
    }
    return true
  })

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Top Controller Panel */}
      <Paper
        sx={{
          p: 3,
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.01)',
          mb: 3,
          bgcolor: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2.5 }}>

          {/* Month Indicator & Main Title */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarMonthIcon color="primary" sx={{ fontSize: 28 }} />
              Bảng Điểm danh Lớp học
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#4f46e5', mt: 0.5, textTransform: 'capitalize' }}>
              {selectedDate.format('[Tháng] MM, YYYY')}
            </Typography>
          </Box>

          {/* Calendar Navigation Buttons & Pickers */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Tìm kiếm theo tên học viên..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px', bgcolor: '#f8fafc', width: { xs: '100%', sm: 240 }, height: '40px' }
              }}
            />

            {/* Status Select Filter */}
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel id="status-filter-label" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FilterListIcon sx={{ fontSize: 16 }} /> Lọc trạng thái điểm danh
              </InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Lọc trạng thái điểm danh"
                onChange={handleStatusFilterChange}
                sx={{ borderRadius: '12px', bgcolor: '#f8fafc', height: '40px' }}
              >
                <MenuItem value="ALL">Tất cả học viên</MenuItem>
                <MenuItem value="HAS_ABSENT">Học viên có vắng mặt (ít nhất 1 buổi)</MenuItem>
                <MenuItem value="PRESENT_ALL">Học viên đi học đầy đủ (Có mặt 100%)</MenuItem>
              </Select>
            </FormControl>

            {/* Week Navigator */}
            <Box sx={{ display: 'inline-flex', bgcolor: '#f1f5f9', p: 0.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <IconButton size="small" onClick={handlePrevWeek} sx={{ borderRadius: '10px' }}>
                <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Button
                size="small"
                onClick={handleToday}
                startIcon={<TodayIcon />}
                sx={{
                  color: '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                Hôm nay
              </Button>
              <IconButton size="small" onClick={handleNextWeek} sx={{ borderRadius: '10px' }}>
                <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {/* DateTime DatePicker Input */}
            <TextField
              type="date"
              size="small"
              value={selectedDate.format('YYYY-MM-DD')}
              onChange={handleDateChange}
              InputProps={{
                sx: {
                  borderRadius: '12px',
                  bgcolor: 'white',
                  fontWeight: 700,
                  color: '#334155',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                  height: '40px'
                }
              }}
            />

            {/* Save Button */}
            {isTeacher && (
              <Button
                variant="contained"
                disabled={!isDirty || saving}
                onClick={handleSaveChanges}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  height: '40px',
                  fontWeight: 800,
                  textTransform: 'none',
                  background: GRADIENT_HEADER,
                  boxShadow: isDirty ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)'
                  }
                }}
              >
                Lưu điểm danh
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Main Grid Table Container */}
      <Paper
        sx={{
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '400px'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, py: 15, gap: 2 }}>
            <CircularProgress size={40} thickness={4} />
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Đang tải dữ liệu điểm danh...</Typography>
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ p: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <PeopleAltIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569', mb: 1 }}>
              Chưa có học viên nào trong lớp
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Không có học viên được phê duyệt học trong lớp này để thực hiện điểm danh.
            </Typography>
          </Box>
        ) : filteredStudents.length === 0 ? (
          <Box sx={{ p: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <SearchIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569', mb: 1 }}>
              Không tìm thấy học viên phù hợp
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trạng thái điểm danh.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
              <Table sx={{ minWidth: 900 }} stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: '#475569',
                        py: 2.5,
                        width: 260,
                        borderRight: '1px solid #e2e8f0',
                        bgcolor: '#f8fafc !important',
                        position: 'sticky',
                        left: 0,
                        zIndex: 5
                      }}
                    >
                      Học viên
                    </TableCell>
                    {weekDays.map((day, idx) => {
                      const isToday = day.isSame(moment(), 'day')
                      return (
                        <TableCell
                          key={idx}
                          align="center"
                          sx={{
                            fontWeight: 800,
                            py: 2,
                            color: isToday ? '#4f46e5' : '#475569',
                            bgcolor: isToday ? '#eef2ff !important' : '#f8fafc !important',
                            borderBottom: isToday ? '3px solid #4f46e5' : '1px solid #e2e8f0',
                            borderRight: '1px solid #e2e8f0',
                            minWidth: 120,
                            zIndex: 4
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                              {day.format('dddd')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                              {day.format('DD/MM')}
                            </Typography>
                          </Box>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStudents.map((student) => {
                    const studentName = student.StudentProfile?.Name || student.FullName
                    const avatarUrl = resolveFileUrl(student.LinkAvatar)
                    const email = student.Email

                    return (
                      <TableRow key={student.IdAccountStudent} sx={{ '&:hover': { bgcolor: '#fbfbfb' } }}>
                        {/* Student Identity Card */}
                        <TableCell sx={{ py: 2, borderRight: '1px solid #e2e8f0', bgcolor: 'white', position: 'sticky', left: 0, zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={avatarUrl}
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: '#4f46e5',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                border: '2px solid #f1f5f9'
                              }}
                            >
                              {studentName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.875rem', lineHeight: 1.2 }}>
                                {studentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* 7 Days Attendance Checkbox Cells */}
                        {weekDays.map((day, idx) => {
                          const dateKey = day.format('YYYY-MM-DD')
                          const isToday = day.isSame(moment(), 'day')

                          const todayStr = moment().format('YYYY-MM-DD')
                          const dayStr = day.format('YYYY-MM-DD')

                          // Check if this specific day has a scheduled session and is not in the future
                          const hasSession = sessions.some(sess => moment.utc(sess.Date).format('YYYY-MM-DD') === dayStr) && dayStr <= todayStr

                          return (
                            <TableCell
                              key={idx}
                              align="center"
                              sx={{
                                py: 2,
                                bgcolor: isToday ? 'rgba(79, 70, 229, 0.04)' : 'inherit',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              {renderStatusCell(student.IdAccountStudent, dateKey, hasSession)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              labelRowsPerPage="Số dòng mỗi trang:"
              sx={{ borderTop: '1px solid #e2e8f0' }}
            />
          </>
        )}
      </Paper>

      {/* Floating Info Legend bar at bottom */}
      {!loading && students.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2.5,
            mt: 3,
            bgcolor: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon sx={{ fontSize: 10, fontWeight: 900 }} /></Box>
              Có mặt: Đi học đầy đủ
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1.5px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CloseIcon sx={{ fontSize: 10, fontWeight: 900 }} /></Box>
              Vắng mặt: Nghỉ học (Mặc định)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#cbd5e1', mr: 0.5 }}>-</Typography>
              Không có lịch học: Không tích điểm danh
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {isTeacher
              ? '* Click trực tiếp vào ô để thay đổi trạng thái điểm danh nhanh. Đừng quên bấm "Lưu điểm danh" để lưu lại vào cơ sở dữ liệu.'
              : '* Bảng điểm danh lớp học ở chế độ Chỉ Xem. Học sinh không thể thay đổi thông tin điểm danh.'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default CourseAttendance
