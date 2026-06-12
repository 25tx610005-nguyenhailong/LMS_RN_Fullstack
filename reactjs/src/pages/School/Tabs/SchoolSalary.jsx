import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  LinearProgress
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchSchoolSalariesAPI } from '~/apis/salaryApi'
import { resolveFileUrl } from '~/utils/formatters'
import { toast } from 'react-toastify'
import moment from 'moment'

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TodayIcon from '@mui/icons-material/Today'
import SearchIcon from '@mui/icons-material/Search'
import PaymentsIcon from '@mui/icons-material/Payments'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import FilterListIcon from '@mui/icons-material/FilterList'
import BadgeIcon from '@mui/icons-material/Badge'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '0đ'
  return Number(val).toLocaleString('vi-VN') + 'đ'
}

function SchoolSalary() {
  const { schoolId } = useParams()
  const currentUser = useSelector(selectCurrentUser)
  const role = currentUser?.role?.toUpperCase()

  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'))
  const [salaries, setSalaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [salaryTypeFilter, setSalaryTypeFilter] = useState('ALL')
  const [earningsFilter, setEarningsFilter] = useState('ALL')
  const [activeTeacherDetails, setActiveTeacherDetails] = useState(null)
  const monthPickerRef = useRef(null)

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const [modalPage, setModalPage] = useState(0)
  const [modalRowsPerPage, setModalRowsPerPage] = useState(5)

  const [teacherPage, setTeacherPage] = useState(0)
  const [teacherRowsPerPage, setTeacherRowsPerPage] = useState(5)

  // Filters for session details
  const [teacherSessionCourseFilter, setTeacherSessionCourseFilter] = useState('ALL')
  const [teacherSessionSearchQuery, setTeacherSessionSearchQuery] = useState('')

  const [adminSessionCourseFilter, setAdminSessionCourseFilter] = useState('ALL')
  const [adminSessionSearchQuery, setAdminSessionSearchQuery] = useState('')

  // Reset pagination when dependencies change
  useEffect(() => {
    setPage(0)
  }, [searchQuery, salaryTypeFilter, earningsFilter, currentMonth])

  useEffect(() => {
    setModalPage(0)
    setAdminSessionCourseFilter('ALL')
    setAdminSessionSearchQuery('')
  }, [activeTeacherDetails])

  useEffect(() => {
    setTeacherPage(0)
  }, [teacherSessionCourseFilter, teacherSessionSearchQuery, currentMonth])

  useEffect(() => {
    setModalPage(0)
  }, [adminSessionCourseFilter, adminSessionSearchQuery])

  // Fetch salaries data
  useEffect(() => {
    if (schoolId && currentMonth) {
      setLoading(true)
      fetchSchoolSalariesAPI(schoolId, currentMonth)
        .then(res => {
          setSalaries(res)
        })
        .catch(() => {
          toast.error('Không thể tải thông tin tính lương!')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [schoolId, currentMonth])

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(prev => moment(prev, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => moment(prev, 'YYYY-MM').add(1, 'month').format('YYYY-MM'))
  }

  const handleToday = () => {
    setCurrentMonth(moment().format('YYYY-MM'))
  }

  // Filter salaries (For Admin view)
  const filteredSalaries = salaries.filter(t => {
    const matchesSearch = t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = salaryTypeFilter === 'ALL' || t.typeSalary === Number(salaryTypeFilter)
    const matchesEarnings = earningsFilter === 'ALL' || (t.totalEarnings !== 0 && t.totalEarnings !== null && t.totalEarnings !== undefined)
    return matchesSearch && matchesType && matchesEarnings
  })

  // Calculate statistics (For Admin overview)
  const totalPayroll = filteredSalaries.reduce((sum, s) => sum + (s.totalEarnings || 0), 0)
  const totalHours = filteredSalaries.reduce((sum, s) => sum + (s.totalHours || 0), 0)
  const totalPeriods = filteredSalaries.reduce((sum, s) => sum + (s.totalPeriods || 0), 0)
  const activeTeachersCount = filteredSalaries.length

  // Date formatting helpers
  const formatMonthDisplay = (monthStr) => {
    return moment(monthStr, 'YYYY-MM').format('MM/YYYY')
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    return moment(dateStr).format('DD/MM/YYYY')
  }

  const getSalaryTypeLabel = (type) => {
    switch (type) {
    case 1:
      return 'Cố định'
    case 2:
      return 'Theo giờ'
    default:
      return 'Chưa xác định'
    }
  }

  const getSalaryTypeChip = (type) => {
    switch (type) {
    case 1:
      return <Chip label="Cố định" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, borderRadius: '8px', border: '1px solid #a7f3d0' }} />
    case 2:
      return <Chip label="Theo giờ" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, borderRadius: '8px', border: '1px solid #bfdbfe' }} />
    default:
      return <Chip label="N/A" size="small" variant="outlined" sx={{ borderRadius: '8px' }} />
    }
  }

  // For Teacher, backend filters data to their own. So list has exactly 1 element or they are mySalaryInfo
  const mySalaryInfo = salaries.find(s => s.teacherId === currentUser?.id) || salaries[0]

  const uniqueCoursesForTeacher = mySalaryInfo?.sessions
    ? [...new Set(mySalaryInfo.sessions.map(s => s.courseName))].filter(Boolean)
    : []

  const filteredTeacherSessions = (mySalaryInfo?.sessions || []).filter(session => {
    const matchesCourse = teacherSessionCourseFilter === 'ALL' || session.courseName === teacherSessionCourseFilter
    const matchesKeyword = !teacherSessionSearchQuery ||
      session.courseCode.toLowerCase().includes(teacherSessionSearchQuery.toLowerCase()) ||
      session.courseName.toLowerCase().includes(teacherSessionSearchQuery.toLowerCase()) ||
      (session.note && session.note.toLowerCase().includes(teacherSessionSearchQuery.toLowerCase()))
    return matchesCourse && matchesKeyword
  })

  const uniqueCoursesForAdminModal = activeTeacherDetails?.sessions
    ? [...new Set(activeTeacherDetails.sessions.map(s => s.courseName))].filter(Boolean)
    : []

  const filteredAdminSessions = (activeTeacherDetails?.sessions || []).filter(session => {
    const matchesCourse = adminSessionCourseFilter === 'ALL' || session.courseName === adminSessionCourseFilter
    const matchesKeyword = !adminSessionSearchQuery ||
      session.courseCode.toLowerCase().includes(adminSessionSearchQuery.toLowerCase()) ||
      session.courseName.toLowerCase().includes(adminSessionSearchQuery.toLowerCase()) ||
      (session.note && session.note.toLowerCase().includes(adminSessionSearchQuery.toLowerCase()))
    return matchesCourse && matchesKeyword
  })
  // Helper to split session thù lao into Lương cứng vs Lương OT based on chronological running hours
  const getSessionEarningsBreakdown = (session, typeSalary, warrantyHours, prevAccum, accum) => {
    if (typeSalary === 2) {
      // Part-time: all standard thù lao
      return {
        standard: 0,
        hourly: session.earnings,
        ot: 0,
        total: session.earnings,
        status: 'Hourly'
      }
    }

    // Full-time
    const durationHours = (session.duration || 0) / 60
    if (accum <= warrantyHours) {
      // Entirely standard
      return {
        standard: session.earnings,
        hourly: 0,
        ot: 0,
        total: session.earnings,
        status: 'STANDARD'
      }
    } else if (prevAccum >= warrantyHours) {
      // Entirely OT
      return {
        standard: 0,
        hourly: 0,
        ot: session.earnings,
        total: session.earnings,
        status: 'OT'
      }
    } else {
      // Partial OT
      const standardHours = warrantyHours - prevAccum
      const standardRatio = standardHours / durationHours
      const standardEarnings = Math.round(session.earnings * standardRatio)
      const otEarnings = session.earnings - standardEarnings
      return {
        standard: standardEarnings,
        hourly: 0,
        ot: otEarnings,
        total: session.earnings,
        status: 'PARTIAL_OT'
      }
    }
  }

  // Compute breakdowns for each session in teacher view
  const teacherSessionBreakdowns = {}
  if (mySalaryInfo) {
    const sorted = [...(mySalaryInfo.sessions || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
    let accum = 0
    const warranty = mySalaryInfo.warrantyHours || 0
    sorted.forEach(s => {
      const hours = (s.duration || 0) / 60
      const prev = accum
      accum += hours
      teacherSessionBreakdowns[s.id] = getSessionEarningsBreakdown(s, mySalaryInfo.typeSalary, warranty, prev, accum)
    })
  }

  // Compute breakdowns for each session in admin details modal
  const adminSessionBreakdowns = {}
  if (activeTeacherDetails) {
    const sorted = [...(activeTeacherDetails.sessions || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
    let accum = 0
    const warranty = activeTeacherDetails.warrantyHours || 0
    sorted.forEach(s => {
      const hours = (s.duration || 0) / 60
      const prev = accum
      accum += hours
      adminSessionBreakdowns[s.id] = getSessionEarningsBreakdown(s, activeTeacherDetails.typeSalary, warranty, prev, accum)
    })
  }

  return (
    <Box sx={{ p: 2.5, animation: 'fadeIn 0.3s ease' }}>
      {/* Month Navigation Panel */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
            {role === 'ADMIN' ? 'Bảng Tính Lương Giáo Viên' : 'Báo Cáo Thu Nhập Cá Nhân'}
          </Typography>
          <Typography sx={{ fontSize: '0.825rem', color: '#64748b', mt: 0.5 }}>
            {role === 'ADMIN'
              ? 'Thống kê, đối soát và tính lương tự động cho đội ngũ giáo viên'
              : 'Chi tiết lương cứng, số buổi giảng dạy và tổng thù lao nhận được'}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.25,
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            bgcolor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <Tooltip title="Tháng trước">
            <IconButton onClick={handlePrevMonth} size="small" sx={{ color: '#475569' }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Nhấp để chọn tháng">
              <Button
                size="small"
                startIcon={<CalendarMonthIcon sx={{ color: '#6366f1', fontSize: 18 }} />}
                onClick={() => {
                  if (monthPickerRef.current && typeof monthPickerRef.current.showPicker === 'function') {
                    monthPickerRef.current.showPicker()
                  }
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  color: '#1e293b',
                  minWidth: 100,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#eff6ff' }
                }}
              >
                Tháng {formatMonthDisplay(currentMonth)}
              </Button>
            </Tooltip>
            <input
              ref={monthPickerRef}
              type="month"
              value={currentMonth}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentMonth(e.target.value)
                }
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                opacity: 0,
                pointerEvents: 'none',
                width: '1px',
                height: '1px'
              }}
            />
          </Box>

          <Tooltip title="Tháng sau">
            <IconButton onClick={handleNextMonth} size="small" sx={{ color: '#475569' }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />

          <Tooltip title="Tháng hiện tại">
            <Button
              size="small"
              startIcon={<TodayIcon sx={{ fontSize: 16 }} />}
              onClick={handleToday}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: '#6366f1',
                borderRadius: '8px',
                px: 1.5,
                py: 0.25,
                fontSize: '0.8rem',
                '&:hover': { bgcolor: '#eff6ff' }
              }}
            >
              Hôm nay
            </Button>
          </Tooltip>
        </Paper>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
          <CircularProgress size={36} sx={{ color: '#6366f1' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Đang tính toán bảng lương...</Typography>
        </Box>
      ) : (role === 'ADMIN' ? (
        // ==========================================
        // ADMIN VIEW
        // ==========================================
        <Box>
          {/* Quick Stats Grid */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontSize: '0.72rem' }}>Tổng ngân quỹ lương</Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, mt: 0.25, color: '#0f172a' }}>{formatCurrency(totalPayroll)}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981', width: 38, height: 38 }}>
                      <PaymentsIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontSize: '0.72rem' }}>Tổng số giờ dạy</Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, mt: 0.25, color: '#0f172a' }}>{totalHours} giờ</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#eef2ff', color: '#6366f1', width: 38, height: 38 }}>
                      <AccessTimeIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontSize: '0.72rem' }}>Tổng số tiết học</Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, mt: 0.25, color: '#0f172a' }}>{totalPeriods} tiết</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#fffbeb', color: '#f59e0b', width: 38, height: 38 }}>
                      <CalendarMonthIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #64748b, #94a3b8)' }} />
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontSize: '0.72rem' }}>Giáo viên ghi nhận</Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, mt: 0.25, color: '#0f172a' }}>{activeTeachersCount} thành viên</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f8fafc', color: '#64748b', width: 38, height: 38 }}>
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filter Toolbar */}
          <Paper sx={{ p: 1.5, borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: 'none', mb: 2.5 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm theo tên giáo viên hoặc tên đăng nhập..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '10px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="salary-type-filter-label" sx={{ fontSize: '0.85rem' }}>Loại hợp đồng</InputLabel>
                  <Select
                    labelId="salary-type-filter-label"
                    value={salaryTypeFilter}
                    label="Loại hợp đồng"
                    onChange={(e) => setSalaryTypeFilter(e.target.value)}
                    sx={{ borderRadius: '10px', bgcolor: '#f8fafc' }}
                    startAdornment={<FilterListIcon sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} />}
                  >
                    <MenuItem value="ALL">Tất cả</MenuItem>
                    <MenuItem value="1">Cố định</MenuItem>
                    <MenuItem value="2">Theo giờ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="salary-earnings-filter-label" sx={{ fontSize: '0.85rem' }}>Thực nhận</InputLabel>
                  <Select
                    labelId="salary-earnings-filter-label"
                    value={earningsFilter}
                    label="Thực nhận"
                    onChange={(e) => setEarningsFilter(e.target.value)}
                    sx={{ borderRadius: '10px', bgcolor: '#f8fafc' }}
                    startAdornment={<FilterListIcon sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} />}
                  >
                    <MenuItem value="ALL">Tất cả</MenuItem>
                    <MenuItem value="NON_ZERO">Khác 0đ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Payroll List Table */}
          {filteredSalaries.length === 0 ? (
            <Paper sx={{ py: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: 'none' }}>
              <PaymentsIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748b' }}>Không có dữ liệu thù lao</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Không tìm thấy thông tin lương phù hợp với bộ lọc trong tháng {formatMonthDisplay(currentMonth)}</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: 'none', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Giáo viên</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Loại hợp đồng</TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Tổng số giờ dạy</TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Số lớp dạy</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Lương cứng</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Lương OT</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Lương theo giờ</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem' }}>Phương thức chuyển</TableCell>
                    <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem', textAlign: 'right' }}>Tổng thực nhận</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#334155', py: 1.25, fontSize: '0.825rem', width: '110px' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSalaries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((teacher) => (
                    <TableRow key={teacher.teacherId} hover sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                      <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={resolveFileUrl(teacher.avatar)}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#6366f1',
                              fontSize: '13px',
                              fontWeight: 700,
                              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.15)'
                            }}
                          >
                            {teacher.fullName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.825rem' }}>
                              {teacher.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                              @{teacher.userName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        {getSalaryTypeChip(teacher.typeSalary)}
                      </TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.825rem' }}>
                          {teacher.totalHours}h
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        <Chip label={`Lớp dạy: ${teacher.mainTeacherCount}`} size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: '0.7rem', height: '20px' }} />
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        {teacher.typeSalary === 1 ? (
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.825rem', color: '#334155' }}>
                            {formatCurrency(teacher.baseSalary)}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        {teacher.typeSalary === 1 ? (
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.825rem', color: '#ea580c' }}>
                            {formatCurrency(teacher.overtimeEarnings)}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        {teacher.typeSalary === 2 ? (
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.825rem', color: '#334155' }}>
                            {formatCurrency(teacher.totalEarnings)}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.825rem' }}>
                          {teacher.paymentMethod}
                        </Typography>
                        {teacher.bankAccount && (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.67rem' }}>
                            STK: {teacher.bankAccount}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1, textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.875rem' }}>
                          {formatCurrency(teacher.totalEarnings)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setActiveTeacherDetails(teacher)}
                          startIcon={<VisibilityIcon sx={{ fontSize: '14px !important' }} />}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderColor: '#cbd5e1',
                            color: '#6366f1',
                            fontSize: '0.72rem',
                            py: 0.25,
                            px: 1,
                            '&:hover': {
                              borderColor: '#6366f1',
                              bgcolor: '#f5f3ff'
                            }
                          }}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredSalaries.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2, borderTop: '1px solid #cbd5e1', bgcolor: '#f8fafc', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Số hàng mỗi trang:</Typography>
                    <Select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10))
                        setPage(0)
                      }}
                      size="small"
                      sx={{ height: 28, fontSize: '0.75rem', borderRadius: '6px', bgcolor: 'white' }}
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                    </Select>
                  </Box>
                  <Pagination
                    count={Math.ceil(filteredSalaries.length / rowsPerPage)}
                    page={page + 1}
                    onChange={(e, value) => setPage(value - 1)}
                    color="primary"
                    size="small"
                    sx={{
                      '& .MuiPaginationItem-root': { fontWeight: 700 }
                    }}
                  />
                </Box>
              )}
            </TableContainer>
          )}
        </Box>
      ) : (
        // ==========================================
        // TEACHER VIEW
        // ==========================================
        <Box>
          {!mySalaryInfo ? (
            <Paper sx={{ py: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: 'none' }}>
              <PaymentsIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748b' }}>Không có dữ liệu thù lao cá nhân</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Không tìm thấy hồ sơ hoặc thông số tính lương của bạn trong tháng {formatMonthDisplay(currentMonth)}</Typography>
            </Paper>
          ) : (
            <Box>
              {/* Premium Dashboard KPI Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* CARD 1: Tổng thu nhập */}
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: 'white',
                      borderRadius: '24px',
                      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.35)',
                      height: '100%',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      border: 'none',
                      transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 30px -5px rgba(99, 102, 241, 0.45)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(8px)' }} />
                    <CardContent sx={{ p: 3, pb: '16px !important' }}>
                      <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontSize: '0.67rem' }}>
                        TỔNG THU NHẬP THÁNG {formatMonthDisplay(currentMonth)}
                      </Typography>
                      <Typography sx={{ fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.1)', letterSpacing: '-0.5px', my: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(mySalaryInfo.totalEarnings)}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                        <Chip
                          label={getSalaryTypeLabel(mySalaryInfo.typeSalary)}
                          size="small"
                          sx={{ bgcolor: 'rgba(255, 255, 255, 0.18)', color: 'white', fontWeight: 700, fontSize: '0.67rem', height: 20 }}
                        />
                        {mySalaryInfo.typeSalary === 1 && (
                          <Chip
                            label={`Cứng: ${formatCurrency(mySalaryInfo.baseSalary)}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', color: 'white', fontWeight: 650, fontSize: '0.67rem', height: 20 }}
                          />
                        )}
                        {mySalaryInfo.typeSalary === 1 && mySalaryInfo.overtimeEarnings > 0 && (
                          <Chip
                            label={`OT: ${formatCurrency(mySalaryInfo.overtimeEarnings)}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(251, 191, 36, 0.25)', color: '#fef08a', fontWeight: 700, fontSize: '0.67rem', height: 20, border: '1px solid rgba(251, 191, 36, 0.3)' }}
                          />
                        )}
                      </Box>
                    </CardContent>

                    <Box sx={{ p: 2, px: 3, bgcolor: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <AccountBalanceIcon sx={{ color: '#fcd34d', fontSize: 18 }} />
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography sx={{ display: 'block', opacity: 0.75, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                          Tài khoản nhận ({mySalaryInfo.paymentMethod})
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.775rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {mySalaryInfo.bankAccount || 'Chưa liên kết số tài khoản'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {/* CARD 2: Giờ giảng dạy */}
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                      color: 'white',
                      borderRadius: '24px',
                      boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.35)',
                      height: '100%',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      border: 'none',
                      transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 30px -5px rgba(13, 148, 136, 0.45)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(8px)' }} />
                    <CardContent sx={{ p: 3 }}>
                      <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontSize: '0.67rem' }}>
                        GIỜ GIẢNG DẠY THỰC TẾ
                      </Typography>
                      <Typography sx={{ fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.1)', letterSpacing: '-0.5px', my: 1, fontSize: '1.875rem' }}>
                        {mySalaryInfo.totalHours} giờ
                      </Typography>

                      {mySalaryInfo.typeSalary === 1 ? (
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                            <Typography sx={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 600 }}>
                              Tiến độ: {mySalaryInfo.totalHours} / {mySalaryInfo.warrantyHours} giờ đảm bảo
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800 }}>
                              {Math.min(100, Math.round((mySalaryInfo.totalHours / (mySalaryInfo.warrantyHours || 1)) * 100))}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.round((mySalaryInfo.totalHours / (mySalaryInfo.warrantyHours || 1)) * 100))}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#51ffcf',
                                borderRadius: 3
                              }
                            }}
                          />
                          {mySalaryInfo.totalHours > mySalaryInfo.warrantyHours && (
                            <Box sx={{ mt: 1.5, p: 1, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                              <Stack spacing={0.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                                  <Typography sx={{ opacity: 0.8 }}>Giờ tăng ca (OT):</Typography>
                                  <Typography sx={{ fontWeight: 800 }}>{(mySalaryInfo.totalHours - mySalaryInfo.warrantyHours).toFixed(1)} giờ</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                                  <Typography sx={{ opacity: 0.8 }}>Thù lao OT:</Typography>
                                  <Typography sx={{ fontWeight: 800, color: '#fcd34d' }}>{formatCurrency(mySalaryInfo.overtimeEarnings)}</Typography>
                                </Box>
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.8, fontSize: '0.72rem', fontStyle: 'italic' }}>
                          Hợp đồng thù lao theo giờ, không giới hạn định mức tối thiểu.
                        </Typography>
                      )}
                    </CardContent>

                    <Box sx={{ p: 2, px: 3, bgcolor: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <AccessTimeIcon sx={{ color: '#51ffcf', fontSize: 18 }} />
                      <Box>
                        <Typography sx={{ display: 'block', opacity: 0.75, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                          Đơn giá giờ dạy (Overtime/Hourly)
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.775rem' }}>
                          {formatCurrency(mySalaryInfo.salaryPerHour)} / giờ
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {/* CARD 3: Hoạt động giảng dạy */}
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                      color: 'white',
                      borderRadius: '24px',
                      boxShadow: '0 10px 25px -5px rgba(217, 119, 6, 0.35)',
                      height: '100%',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      border: 'none',
                      transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 30px -5px rgba(217, 119, 6, 0.45)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(8px)' }} />
                    <CardContent sx={{ p: 3 }}>
                      <Typography sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontSize: '0.67rem' }}>
                        HOẠT ĐỘNG GIẢNG DẠY
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 1.5 }}>
                        <Grid item xs={6} sx={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                          <Typography sx={{ fontSize: '1.625rem', fontWeight: 950, lineHeight: 1 }}>
                            {mySalaryInfo.mainTeacherCount}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', opacity: 0.8, mt: 0.5, fontWeight: 600 }}>
                            Buổi đứng lớp
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ pl: 2 }}>
                          <Typography sx={{ fontSize: '1.625rem', fontWeight: 950, lineHeight: 1 }}>
                            {mySalaryInfo.totalPeriods}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', opacity: 0.8, mt: 0.5, fontWeight: 600 }}>
                            Số tiết dạy
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>

                    <Box sx={{ p: 2, px: 3, bgcolor: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <SchoolIcon sx={{ color: '#fcd34d', fontSize: 18 }} />
                      <Box>
                        <Typography sx={{ display: 'block', opacity: 0.75, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                          Vai trò chính trong tháng
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.775rem' }}>
                          Giáo viên giảng dạy chính
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* Detailed Session Table */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  boxShadow: '0 4px 15px -3px rgba(0,0,0,0.03)',
                  mt: 3
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.925rem' }}>
                    <PaymentsIcon sx={{ color: '#4f46e5', fontSize: 20 }} />
                    Chi tiết các buổi dạy thực tế trong tháng
                  </Typography>

                  {/* Filter Toolbar for Sessions */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id="teacher-session-course-filter-label" sx={{ fontSize: '0.8rem' }}>Lọc theo lớp học</InputLabel>
                      <Select
                        labelId="teacher-session-course-filter-label"
                        value={teacherSessionCourseFilter}
                        label="Lọc theo lớp học"
                        onChange={(e) => setTeacherSessionCourseFilter(e.target.value)}
                        sx={{ borderRadius: '8px', fontSize: '0.775rem', bgcolor: '#f8fafc' }}
                      >
                        <MenuItem value="ALL">Tất cả các lớp</MenuItem>
                        {uniqueCoursesForTeacher.map(courseName => (
                          <MenuItem key={courseName} value={courseName} sx={{ fontSize: '0.775rem' }}>
                            {courseName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      placeholder="Mã lớp, ghi chú..."
                      value={teacherSessionSearchQuery}
                      onChange={(e) => setTeacherSessionSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '8px', fontSize: '0.775rem', bgcolor: '#f8fafc', width: 180 }
                      }}
                    />
                  </Stack>
                </Box>

                {filteredTeacherSessions.length === 0 ? (
                  <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: 'none', bgcolor: '#f8fafc' }}>
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.825rem' }}>
                      Không tìm thấy buổi dạy nào phù hợp với bộ lọc.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: 'none', overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Ngày dạy</TableCell>
                          <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Khóa học / Lớp học</TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Giờ học</TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Thời lượng</TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Số tiết</TableCell>
                          <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Đơn giá/Giờ</TableCell>
                          <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Lương cứng</TableCell>
                          <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Lương theo giờ</TableCell>
                          <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Lương OT</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', py: 1.25, fontSize: '0.8rem' }}>Tổng Lương tạm tính</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTeacherSessions.slice(teacherPage * teacherRowsPerPage, teacherPage * teacherRowsPerPage + teacherRowsPerPage).map((session) => {
                          const bd = teacherSessionBreakdowns[session.id]
                          return (
                            <TableRow key={session.id} hover sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                              <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1, fontSize: '0.8rem' }}>{formatDateDisplay(session.date)}</TableCell>
                              <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 1, fontSize: '0.8rem' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}>
                                  {session.courseName}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.67rem', fontWeight: 500 }}>
                                  Mã lớp: {session.courseCode}
                                </Typography>
                                {session.note && (
                                  <Typography variant="caption" sx={{ display: 'block', color: '#f59e0b', fontSize: '0.65rem', fontStyle: 'italic', mt: 0.25 }}>
                                    Ghi chú: {session.note}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', py: 1, fontSize: '0.8rem' }}>
                                {session.classTime || '—'}
                              </TableCell>
                              <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', py: 1, fontSize: '0.8rem', fontWeight: 600 }}>
                                {`${(session.duration / 60).toFixed(1)} giờ`}
                                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.65rem', fontWeight: 500 }}>
                                  ({session.duration} phút)
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', py: 1, fontSize: '0.8rem' }}>{session.periods} tiết</TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', py: 1, fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                                {formatCurrency(session.salaryPerHour)}
                              </TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                                {bd?.standard > 0 && mySalaryInfo.typeSalary === 1 ? (
                                  <Typography variant="body2" sx={{ fontWeight: 650, color: '#64748b', textDecoration: 'line-through', fontSize: '0.8rem' }}>
                                    {formatCurrency(bd.standard)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                                {bd?.hourly > 0 && mySalaryInfo.typeSalary === 2 ? (
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}>
                                    {formatCurrency(bd.hourly)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', py: 1 }}>
                                {bd?.ot > 0 && mySalaryInfo.typeSalary === 1 ? (
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ea580c', fontSize: '0.8rem' }}>
                                    {formatCurrency(bd.ot)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ py: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.8rem' }}>
                                  {formatCurrency(bd?.total)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    {filteredTeacherSessions.length > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2, borderTop: '1px solid #cbd5e1', bgcolor: '#f8fafc', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Số hàng mỗi trang:</Typography>
                          <Select
                            value={teacherRowsPerPage}
                            onChange={(e) => {
                              setTeacherRowsPerPage(parseInt(e.target.value, 10))
                              setTeacherPage(0)
                            }}
                            size="small"
                            sx={{ height: 28, fontSize: '0.75rem', borderRadius: '6px', bgcolor: 'white' }}
                          >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                          </Select>
                        </Box>
                        <Pagination
                          count={Math.ceil(filteredTeacherSessions.length / teacherRowsPerPage)}
                          page={teacherPage + 1}
                          onChange={(e, value) => setTeacherPage(value - 1)}
                          color="primary"
                          size="small"
                          sx={{
                            '& .MuiPaginationItem-root': { fontWeight: 700 }
                          }}
                        />
                      </Box>
                    )}
                  </TableContainer>
                )}
              </Paper>
            </Box>
          )}
        </Box>
      ))}

      {/* Teacher Sessions Details Modal */}
      <Dialog
        open={Boolean(activeTeacherDetails)}
        onClose={() => setActiveTeacherDetails(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            py: 1.25,
            px: 2.5,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Avatar
              src={resolveFileUrl(activeTeacherDetails?.avatar)}
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'white',
                color: '#6366f1',
                fontSize: '13px',
                fontWeight: 800,
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {activeTeacherDetails?.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.975rem', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Chi tiết thù lao giảng dạy
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.72rem', display: 'block', mt: 0.25 }}>
                Giáo viên: <strong>{activeTeacherDetails?.fullName}</strong> (@{activeTeacherDetails?.userName}) • Tháng {formatMonthDisplay(currentMonth)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setActiveTeacherDetails(null)}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.22)' }
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, pt: '24px !important', pb: 2.5, bgcolor: '#f8fafc' }}>
          <Box sx={{ pt: 0.5 }}>
            {/* Quick Info Grid inside Modal */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderTop: '3px solid #3b82f6',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                  }}
                >
                  <Typography sx={{ fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem', color: '#64748b' }}>Hợp đồng</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {activeTeacherDetails && getSalaryTypeChip(activeTeacherDetails.typeSalary)}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderTop: '3px solid #6366f1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                  }}
                >
                  <Typography sx={{ fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem', color: '#64748b' }}>Tổng giờ dạy</Typography>
                  <Typography sx={{ fontWeight: 850, color: '#4f46e5', mt: 0.5, fontSize: '0.875rem' }}>
                    {activeTeacherDetails?.totalHours}h
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderTop: '3px solid #f59e0b',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                  }}
                >
                  <Typography sx={{ fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem', color: '#64748b' }}>Số lớp dạy</Typography>
                  <Typography sx={{ fontWeight: 850, color: '#d97706', mt: 0.5, fontSize: '0.875rem' }}>
                    {activeTeacherDetails?.mainTeacherCount} lớp
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    textAlign: 'center',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <Typography sx={{ fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem' }}>Tổng thu nhập</Typography>
                  <Typography sx={{ fontWeight: 900, mt: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.1)', fontSize: '0.875rem' }}>
                    {formatCurrency(activeTeacherDetails?.totalEarnings)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {activeTeacherDetails?.typeSalary === 1 && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 2.5,
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  bgcolor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', mb: 1, letterSpacing: '0.5px' }}>
                Chi tiết cấu trúc lương hằng tháng (Lương cố định)
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', p: 1.25, borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Lương cơ bản:</Typography>
                      <Typography sx={{ fontSize: '0.775rem', fontWeight: 750, color: '#1e293b' }}>{formatCurrency(activeTeacherDetails?.baseSalary)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', p: 1.25, borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tăng ca (Overtime):</Typography>
                      <Typography sx={{ fontSize: '0.775rem', fontWeight: 750, color: '#1e293b' }}>
                        {formatCurrency(activeTeacherDetails?.overtimeEarnings)}
                        {activeTeacherDetails && activeTeacherDetails.totalHours > activeTeacherDetails.warrantyHours && (
                          ` (${(activeTeacherDetails.totalHours - activeTeacherDetails.warrantyHours).toFixed(1)}h OT)`
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Sessions Table inside Modal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, mt: 1, flexWrap: 'wrap', gap: 2 }}>
              <Typography sx={{ fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.875rem' }}>
                <BadgeIcon sx={{ fontSize: 16, color: '#6366f1' }} />
              Danh sách buổi dạy thực tế trong tháng
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="admin-modal-course-filter-label" sx={{ fontSize: '0.75rem' }}>Lọc theo lớp học</InputLabel>
                  <Select
                    labelId="admin-modal-course-filter-label"
                    value={adminSessionCourseFilter}
                    label="Lọc theo lớp học"
                    onChange={(e) => setAdminSessionCourseFilter(e.target.value)}
                    sx={{ borderRadius: '8px', fontSize: '0.75rem', height: 32, bgcolor: 'white' }}
                  >
                    <MenuItem value="ALL" sx={{ fontSize: '0.75rem' }}>Tất cả các lớp</MenuItem>
                    {uniqueCoursesForAdminModal.map(courseName => (
                      <MenuItem key={courseName} value={courseName} sx={{ fontSize: '0.75rem' }}>
                        {courseName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  placeholder="Tìm mã lớp, ghi chú..."
                  value={adminSessionSearchQuery}
                  onChange={(e) => setAdminSessionSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 14 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px', fontSize: '0.75rem', height: 32, bgcolor: 'white', width: 170 }
                  }}
                />
              </Stack>
            </Box>

            {filteredAdminSessions.length === 0 ? (
              <Paper sx={{ py: 4, textAlign: 'center', borderRadius: '12px', border: '1px solid #cbd5e1', bgcolor: 'white' }}>
                <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.825rem' }}>
                Không tìm thấy buổi dạy nào phù hợp với bộ lọc.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: 'none' }}>
                <TableContainer
                  sx={{
                    maxHeight: '280px',
                    overflowY: 'auto',
                    boxShadow: 'none',
                    border: 'none',
                    borderRadius: 0,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                      height: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: '#f1f5f9'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: '#cbd5e1',
                      borderRadius: '3px'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      bgcolor: '#94a3b8'
                    }
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Ngày dạy</TableCell>
                        <TableCell sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Khóa học / Lớp học</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Giờ học</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Thời lượng</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Số tiết</TableCell>
                        <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Đơn giá/Giờ</TableCell>
                        <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Lương cứng</TableCell>
                        <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Lương theo giờ</TableCell>
                        <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Lương OT</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f1f5f9', fontWeight: 800, color: '#334155', py: 1, fontSize: '0.8rem' }}>Tổng Lương tạm tính</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAdminSessions
                        .slice(modalPage * modalRowsPerPage, modalPage * modalRowsPerPage + modalRowsPerPage)
                        .map((session) => {
                          const bd = adminSessionBreakdowns[session.id]
                          return (
                            <TableRow
                              key={session.id}
                              hover
                              sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: '#f1f5f9 !important',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 8px -2px rgba(0,0,0,0.05)'
                                },
                                '&:last-child td, &:last-child th': { borderBottom: 0 }
                              }}
                            >
                              <TableCell sx={{ borderRight: '1px solid #cbd5e1', fontSize: '0.775rem', py: 0.75 }}>{formatDateDisplay(session.date)}</TableCell>
                              <TableCell sx={{ borderRight: '1px solid #cbd5e1', py: 0.75 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.775rem' }}>
                                  {session.courseName}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>
                                Mã lớp: {session.courseCode}
                                </Typography>
                                {session.note && (
                                  <Typography variant="caption" sx={{ display: 'block', color: '#f59e0b', fontSize: '0.67rem', fontStyle: 'italic', mt: 0.25 }}>
                                  Ghi chú: {session.note}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontSize: '0.775rem', py: 0.75 }}>
                                {session.classTime || '—'}
                              </TableCell>
                              <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontSize: '0.775rem', py: 0.75, fontWeight: 600 }}>
                                {`${(session.duration / 60).toFixed(1)} giờ`}
                                <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.65rem' }}>
                                ({session.duration} phút)
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ borderRight: '1px solid #cbd5e1', fontSize: '0.775rem', py: 0.75 }}>{session.periods} tiết</TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', fontSize: '0.775rem', py: 0.75, fontWeight: 600, color: '#475569' }}>
                                {formatCurrency(session.salaryPerHour)}
                              </TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', py: 0.75 }}>
                                {bd?.standard > 0 && activeTeacherDetails?.typeSalary === 1 ? (
                                  <Typography variant="body2" sx={{ fontWeight: 650, color: '#64748b', textDecoration: 'line-through', fontSize: '0.75rem' }}>
                                    {formatCurrency(bd.standard)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', py: 0.75 }}>
                                {bd?.hourly > 0 && activeTeacherDetails?.typeSalary === 2 ? (
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.75rem' }}>
                                    {formatCurrency(bd.hourly)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ borderRight: '1px solid #cbd5e1', py: 0.75 }}>
                                {bd?.ot > 0 && activeTeacherDetails?.typeSalary === 1 ? (
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ea580c', fontSize: '0.75rem' }}>
                                    {formatCurrency(bd.ot)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ py: 0.75 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem' }}>
                                  {formatCurrency(bd?.total)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {filteredAdminSessions.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, px: 2, borderTop: '1px solid #cbd5e1', bgcolor: '#f8fafc', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Số hàng mỗi trang:</Typography>
                      <Select
                        value={modalRowsPerPage}
                        onChange={(e) => {
                          setModalRowsPerPage(parseInt(e.target.value, 10))
                          setModalPage(0)
                        }}
                        size="small"
                        sx={{ height: 28, fontSize: '0.75rem', borderRadius: '6px', bgcolor: 'white' }}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                      </Select>
                    </Box>
                    <Pagination
                      count={Math.ceil(filteredAdminSessions.length / modalRowsPerPage)}
                      page={modalPage + 1}
                      onChange={(e, value) => setModalPage(value - 1)}
                      color="primary"
                      size="small"
                      sx={{
                        '& .MuiPaginationItem-root': { fontWeight: 700 }
                      }}
                    />
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ py: 1, px: 2.5, borderTop: '1px solid #cbd5e1', bgcolor: '#f8fafc' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setActiveTeacherDetails(null)}
            sx={{
              borderRadius: '8px',
              px: 3,
              py: 0.5,
              fontWeight: 800,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
              fontSize: '0.825rem',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Đóng chi tiết
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SchoolSalary
