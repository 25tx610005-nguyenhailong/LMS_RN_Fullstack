import { useEffect, useState, useCallback } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
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
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  alpha,
  Badge,
  Tabs,
  Tab,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Autocomplete
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import SchoolIcon from '@mui/icons-material/School'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import CheckIcon from '@mui/icons-material/Check'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import HomeIcon from '@mui/icons-material/Home'
import FaceIcon from '@mui/icons-material/Face'
import CakeIcon from '@mui/icons-material/Cake'
import WcIcon from '@mui/icons-material/Wc'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import VisibilityIcon from '@mui/icons-material/Visibility'
import moment from 'moment'
import {
  fetchSchoolStudentsAPI,
  approveStudentEnrollmentAPI,
  rejectStudentEnrollmentAPI,
  createSchoolStudentAPI,
  updateSchoolStudentAPI,
  deleteSchoolStudentAPI,
  fetchCitiesAPI,
  fetchDistrictsAPI
} from '~/apis/schoolApi'
import { toast } from 'react-toastify'
import { resolveFileUrl } from '~/utils/formatters'

function SchoolStudents() {
  const { schoolId } = useParams()
  const { data: dashboardData } = useOutletContext()
  const classes = dashboardData?.classes || []
  const currentUser = useSelector(selectCurrentUser)
  const role = currentUser?.role?.toUpperCase()

  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState('approved') // 'approved' or 'pending'
  const [pendingCount, setPendingCount] = useState(0)

  // Filtering states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchVal, setSearchVal] = useState('')
  const [debounceSearch, setDebounceSearch] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')

  // Detail Dialog states
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

  // Dialog Form states
  const [openForm, setOpenForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null) // Account ID
  const [formErrors, setFormErrors] = useState({})
  const [formVal, setFormVal] = useState({
    parentName: '',
    phone: '',
    email: '',
    userName: '',
    password: '',
    studentName: '',
    studentBirthDay: '',
    studentGender: '',
    courseId: '',
    address: '',
    idCity: '',
    idDistrict: ''
  })

  // Location states
  const [cities, setCities] = useState([])
  const [allDistricts, setAllDistricts] = useState([])
  const [cityFilter, setCityFilter] = useState('ALL')
  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [districtsForFilter, setDistrictsForFilter] = useState([])
  const [districtsForForm, setDistrictsForForm] = useState([])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(searchVal)
      setPage(0) // Reset page on search
    }, 500)
    return () => clearTimeout(handler)
  }, [searchVal])

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const [citiesRes, districtsRes] = await Promise.all([
          fetchCitiesAPI(),
          fetchDistrictsAPI()
        ])
        setCities(citiesRes || [])
        setAllDistricts(districtsRes || [])
      } catch (err) {
        toast.error('Không thể tải danh sách địa bàn')
      }
    }
    loadLocations()
  }, [])

  // Sync districts for filter
  useEffect(() => {
    if (cityFilter && cityFilter !== 'ALL') {
      fetchDistrictsAPI(cityFilter)
        .then(res => setDistrictsForFilter(res || []))
        .catch(() => setDistrictsForFilter([]))
    } else {
      setDistrictsForFilter([])
      setDistrictFilter('ALL')
    }
  }, [cityFilter])

  const handleCityFilterChange = (event) => {
    setCityFilter(event.target.value)
    setDistrictFilter('ALL')
    setPage(0)
  }

  const handleDistrictFilterChange = (event) => {
    setDistrictFilter(event.target.value)
    setPage(0)
  }

  const handleCityChange = async (cityId) => {
    setFormVal(prev => ({ ...prev, idCity: cityId, idDistrict: '' }))
    if (cityId) {
      try {
        const res = await fetchDistrictsAPI(cityId)
        setDistrictsForForm(res || [])
      } catch (error) {
        setDistrictsForForm([])
      }
    } else {
      setDistrictsForForm([])
    }
  }

  const loadStudents = useCallback(async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const cityParam = cityFilter === 'ALL' ? '' : cityFilter
      const districtParam = districtFilter === 'ALL' ? '' : districtFilter
      const res = await fetchSchoolStudentsAPI(
        schoolId,
        page + 1,
        rowsPerPage,
        debounceSearch,
        selectedCourseId,
        subTab,
        cityParam,
        districtParam
      )
      if (res && res.students !== undefined) {
        setStudents(res.students)
        setTotal(res.total)
        if (res.pendingCount !== undefined) {
          setPendingCount(res.pendingCount)
        }
      } else {
        setStudents([])
        setTotal(0)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách học viên')
    } finally {
      setLoading(false)
    }
  }, [schoolId, page, rowsPerPage, debounceSearch, selectedCourseId, subTab, cityFilter, districtFilter])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue)
    setPage(0)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleCourseChange = (event) => {
    setSelectedCourseId(event.target.value)
    setPage(0)
  }

  const handleClearSearch = () => {
    setSearchVal('')
  }

  // Action handlers
  const handleOpenDetail = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setOpenDetail(true)
  }

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setSelectedStudentId(null)
    setFormVal({
      parentName: '',
      phone: '',
      email: '',
      userName: '',
      password: '',
      studentName: '',
      studentBirthDay: '',
      studentGender: '',
      courseId: '',
      address: '',
      idCity: '',
      idDistrict: ''
    })
    setDistrictsForForm([])
    setFormErrors({})
    setOpenForm(true)
  }

  const handleOpenEdit = async (student) => {
    setIsEditMode(true)
    setSelectedStudentId(student.Id)
    const cityId = student.Account?.IdCity || ''
    const districtId = student.Account?.IdDistrict || ''

    setFormVal({
      parentName: student.Account?.FullName || '',
      phone: student.Account?.Phone || '',
      email: student.Account?.Email || '',
      userName: student.Account?.UserName || '',
      password: '', // Password is empty by default in edit mode (optional)
      studentName: student.StudentProfile?.Name || '',
      studentBirthDay: student.StudentProfile?.BirthDay ? moment(student.StudentProfile.BirthDay).format('YYYY-MM-DD') : '',
      studentGender: student.StudentProfile?.Gender !== null && student.StudentProfile?.Gender !== undefined ? student.StudentProfile.Gender : '',
      courseId: '', // Course enrollment cannot be directly reassigned here
      address: student.Account?.Address || '',
      idCity: cityId,
      idDistrict: districtId
    })
    setFormErrors({})

    if (cityId) {
      try {
        const res = await fetchDistrictsAPI(cityId)
        setDistrictsForForm(res || [])
      } catch (error) {
        setDistrictsForForm([])
      }
    } else {
      setDistrictsForForm([])
    }
    setOpenForm(true)
  }

  const validateForm = () => {
    const errors = {}
    if (!formVal.parentName) errors.parentName = 'Họ tên phụ huynh không được bỏ trống'
    if (!formVal.phone) errors.phone = 'Số điện thoại phụ huynh không được bỏ trống'
    if (!formVal.email) errors.email = 'Email không được bỏ trống'
    if (!isEditMode) {
      if (!formVal.userName) {
        errors.userName = 'Tên đăng nhập không được bỏ trống'
      } else if (formVal.userName.trim().length < 3) {
        errors.userName = 'Tên đăng nhập phải từ 3 ký tự trở lên'
      } else if (!/^[a-zA-Z0-9_.-]+$/.test(formVal.userName.trim())) {
        errors.userName = 'Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới, gạch ngang hoặc dấu chấm'
      }
      if (!formVal.password) errors.password = 'Mật khẩu không được bỏ trống'
      if (!formVal.courseId) errors.courseId = 'Vui lòng chọn lớp học để xếp lớp'
    }
    if (!formVal.studentName) errors.studentName = 'Họ tên học sinh không được bỏ trống'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveStudent = async () => {
    if (!validateForm()) return
    try {
      if (isEditMode) {
        await updateSchoolStudentAPI(schoolId, selectedStudentId, formVal)
        toast.success('Cập nhật thông tin học viên thành công!')
      } else {
        await createSchoolStudentAPI(schoolId, formVal)
        toast.success('Thêm học viên mới và xếp lớp thành công!')
      }
      setOpenForm(false)
      loadStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu thông tin học viên')
    }
  }

  const handleDeleteStudent = async (accountId, studentName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA học viên "${studentName}" khỏi trường học? Hành động này sẽ hủy ghi danh ở tất cả lớp học và xóa tài khoản liên kết.`)) return
    try {
      await deleteSchoolStudentAPI(schoolId, accountId)
      toast.success(`Đã xóa học viên ${studentName} thành công!`)
      loadStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa học viên')
    }
  }

  const handleApprove = async (enrollmentId, studentName, courseName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn duyệt học viên "${studentName}" vào lớp "${courseName}"?`)) return
    try {
      await approveStudentEnrollmentAPI(schoolId, enrollmentId)
      toast.success(`Đã phê duyệt học viên ${studentName} vào lớp ${courseName}`)
      loadStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt')
    }
  }

  const handleReject = async (enrollmentId, studentName, courseName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI yêu cầu ghi danh của "${studentName}" vào lớp "${courseName}"?`)) return
    try {
      await rejectStudentEnrollmentAPI(schoolId, enrollmentId)
      toast.success(`Đã từ chối yêu cầu của học viên ${studentName}`)
      loadStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối')
    }
  }

  return (
    <Box sx={{ p: 3, animation: 'fadeIn 0.3s ease' }}>
      {/* Top Header & Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 30 }} /> Danh sách Học viên
          </Typography>
          <Typography variant="body2" color="text.secondary">Quản lý và theo dõi thông tin học viên của trường học</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Add Student Button */}
          {role === 'ADMIN' && (
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAdd}
              sx={{ borderRadius: '12px', px: 2.5, height: '40px', fontWeight: 700, textTransform: 'none', bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
              Thêm học viên
            </Button>
          )}

          {/* Class Filter Dropdown */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="select-course-label">Lọc theo lớp học</InputLabel>
            <Select
              labelId="select-course-label"
              value={selectedCourseId}
              label="Lọc theo lớp học"
              onChange={handleCourseChange}
              sx={{ borderRadius: '12px', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            >
              <MenuItem value=""><em>Tất cả lớp học</em></MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.Id} value={cls.Id}>
                  {cls.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* City Filter Dropdown */}
          <Autocomplete
            options={cities || []}
            getOptionLabel={option => option.Name || ''}
            value={cities?.find(c => String(c.Id) === String(cityFilter)) || null}
            onChange={(event, newValue) => {
              setCityFilter(newValue ? newValue.Id : 'ALL')
              setDistrictFilter('ALL')
              setPage(0)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tỉnh / Thành phố"
                placeholder="Tất cả Tỉnh/Thành..."
                size="small"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  ...params.InputProps,
                  sx: { borderRadius: '12px', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }
                }}
              />
            )}
            sx={{ minWidth: 160 }}
          />

          {/* District Filter Dropdown */}
          <Autocomplete
            disabled={cityFilter === 'ALL'}
            options={districtsForFilter || []}
            getOptionLabel={option => option.Name || ''}
            value={districtsForFilter?.find(d => String(d.Id) === String(districtFilter)) || null}
            onChange={(event, newValue) => {
              setDistrictFilter(newValue ? newValue.Id : 'ALL')
              setPage(0)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Quận / Huyện"
                placeholder={cityFilter === 'ALL' ? 'Chọn Tỉnh/Thành trước...' : 'Tất cả Quận/Huyện...'}
                size="small"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  ...params.InputProps,
                  sx: { borderRadius: '12px', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }
                }}
              />
            )}
            sx={{ minWidth: 160 }}
          />

          {/* Search Bar */}
          <TextField
            placeholder="Tìm theo tên, email, SĐT..."
            size="small"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchVal && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} edge="end">
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: '16px', bgcolor: 'white', width: 220, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }
            }}
          />
        </Box>
      </Box>

      {/* Sub-tabs selector */}
      <Box sx={{ display: 'inline-flex', bgcolor: '#f1f5f9', p: 0.75, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0' }}>
        <Tabs
          value={subTab}
          onChange={handleSubTabChange}
          aria-label="Student management subtabs"
          TabIndicatorProps={{ style: { display: 'none' } }} // Hide the default underline
          sx={{
            minHeight: 'auto',
            '& .MuiTabs-flexContainer': {
              gap: 1
            }
          }}
        >
          <Tab
            value="approved"
            label="Học viên chính thức"
            icon={<SchoolIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            sx={{
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.875rem',
              px: 3,
              py: 1,
              borderRadius: '12px',
              color: '#64748b',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#4f46e5',
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              },
              '&:hover:not(.Mui-selected)': {
                color: '#1e293b',
                bgcolor: 'rgba(255,255,255,0.4)'
              }
            }}
          />
          <Tab
            value="pending"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Yêu cầu chờ duyệt</span>
                {pendingCount > 0 && (
                  <Badge
                    badgeContent={pendingCount}
                    color="error"
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        height: 18,
                        minWidth: 18,
                        fontWeight: 800,
                        backgroundColor: '#ef4444',
                        color: 'white'
                      }
                    }}
                  />
                )}
              </Box>
            }
            icon={<HourglassEmptyIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            sx={{
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.875rem',
              px: 3,
              py: 1,
              borderRadius: '12px',
              color: '#64748b',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#4f46e5',
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              },
              '&:hover:not(.Mui-selected)': {
                color: '#1e293b',
                bgcolor: 'rgba(255,255,255,0.4)'
              }
            }}
          />
        </Tabs>
      </Box>

      {/* Main Table Container */}
      <Paper
        sx={{
          borderRadius: '32px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          bgcolor: 'white',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '400px'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, py: 15, gap: 2 }}>
            <CircularProgress size={40} thickness={4} />
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Đang tải danh sách...</Typography>
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ p: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569', mb: 1 }}>
              {subTab === 'approved' ? 'Không tìm thấy học viên' : 'Không có yêu cầu chờ duyệt'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              {subTab === 'approved'
                ? (searchVal || selectedCourseId
                  ? 'Không tìm thấy học viên nào khớp với điều kiện lọc. Vui lòng thử chọn lớp hoặc từ khóa khác.'
                  : 'Trường học hiện tại chưa có học viên nào ghi danh.')
                : (searchVal || selectedCourseId
                  ? 'Không có yêu cầu đăng ký học nào khớp với điều kiện lọc.'
                  : 'Hiện tại trường học không có yêu cầu ghi danh nào đang chờ duyệt.')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TableContainer sx={{ flex: 1 }}>
              <Table
                size="small"
                sx={{
                  '& .MuiTableCell-root': {
                    borderRight: '1px solid #e2e8f0',
                    borderBottom: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    py: '8px !important'
                  },
                  '& .MuiTableCell-root:last-child': {
                    borderRight: 'none'
                  }
                }}
              >
                <TableHead sx={{ bgcolor: '#e0e7ff', '& .MuiTableCell-head': { color: '#312e81', fontWeight: 800, fontSize: '0.8rem', py: 1.5, whiteSpace: 'nowrap' } }}>
                  <TableRow>
                    <TableCell align="center" sx={{ width: 50 }}>STT</TableCell>
                    <TableCell>Học viên</TableCell>
                    {subTab === 'approved' ? (
                      <>
                        <TableCell>Cá nhân</TableCell>
                        <TableCell>Phụ huynh</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailIcon sx={{ fontSize: 14 }} /> Email</Box>
                        </TableCell>
                        <TableCell>Địa chỉ</TableCell>
                        <TableCell>Khu vực</TableCell>
                        <TableCell>Lớp đang học</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EventAvailableIcon sx={{ fontSize: 14 }} /> Ngày tham gia</Box>
                        </TableCell>
                        {role === 'ADMIN' && (
                          <TableCell align="center" sx={{ width: 90 }}>Thao tác</TableCell>
                        )}
                      </>
                    ) : (
                      <>
                        <TableCell>Cá nhân</TableCell>
                        <TableCell>Phụ huynh</TableCell>
                        <TableCell>Địa chỉ & Khu vực</TableCell>
                        <TableCell>Lớp đăng ký</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EventAvailableIcon sx={{ fontSize: 14 }} /> Ngày đăng ký</Box>
                        </TableCell>
                        <TableCell align="center" sx={{ width: 130 }}>Thao tác</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((item, index) => {
                    const acc = item.Account || {}
                    const studentProfile = item.StudentProfile || {}
                    const avatarUrl = resolveFileUrl(acc.LinkAvatar)
                    const studentName = studentProfile.Name || acc.FullName || 'Chưa cập nhật'
                    const parentName = acc.FullName || 'Chưa cập nhật'
                    const email = acc.Email || '--'
                    const phone = acc.Phone || '--'
                    const studentBirthDay = studentProfile.BirthDay || ''
                    const studentGender = studentProfile.Gender !== null && studentProfile.Gender !== undefined ? studentProfile.Gender : null
                    const joinDate = item.Created_Date ? moment(item.Created_Date).format('DD/MM/YYYY') : '--'
                    const serialNumber = page * rowsPerPage + index + 1

                    // Resolve location
                    const cityName = cities.find(c => c.Id === acc.IdCity)?.Name || ''
                    const districtName = allDistricts.find(d => d.Id === acc.IdDistrict)?.Name || ''
                    const locationText = [districtName, cityName].filter(Boolean).join(', ') || '--'

                    return (
                      <TableRow
                        key={item.Id}
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: alpha('#6366f1', 0.02),
                            transform: 'scale(1.001)',
                            boxShadow: 'inset 4px 0 0 #6366f1'
                          }
                        }}
                      >
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.775rem' }}>
                          {serialNumber}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={avatarUrl}
                              sx={{
                                width: 30,
                                height: 30,
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                bgcolor: '#6366f1',
                                fontSize: '0.85rem',
                                fontWeight: 800
                              }}
                            >
                              {studentName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.8rem', lineHeight: 1.2, wordBreak: 'break-word' }}>
                                {studentName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {subTab === 'approved' ? (
                          <>
                            {/* Cá nhân */}
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                {studentBirthDay ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontSize: '0.75rem' }}>
                                    <CakeIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                                    {moment(studentBirthDay).format('DD/MM/YYYY')}
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>--</Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontSize: '0.75rem' }}>
                                  <WcIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                                  {studentGender === 1 ? 'Nam' : studentGender === 2 ? 'Nữ' : studentGender === 0 ? 'Khác' : '--'}
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Phụ huynh */}
                            <TableCell sx={{ color: '#475569', fontSize: '0.775rem' }}>
                              <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.775rem' }}>
                                {parentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, fontSize: '0.7rem' }}>
                                <PhoneIcon sx={{ fontSize: 10 }} /> {phone}
                              </Typography>
                            </TableCell>

                            {/* Email */}
                            <TableCell sx={{ color: '#475569', fontSize: '0.775rem', fontWeight: 500 }}>
                              {email}
                            </TableCell>

                            {/* Địa chỉ */}
                            <TableCell sx={{ color: '#475569', fontSize: '0.775rem', fontWeight: 500, wordBreak: 'break-word', maxWidth: 150 }}>
                              {acc.Address || '--'}
                            </TableCell>

                            {/* Khu vực */}
                            <TableCell sx={{ color: '#475569', fontSize: '0.775rem', fontWeight: 600 }}>
                              {locationText}
                            </TableCell>

                            {/* Lớp đang học */}
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 140 }}>
                                {item.Courses && item.Courses.length > 0 ? (
                                  item.Courses.map(cls => (
                                    <Box
                                      key={cls.Id}
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        bgcolor: '#e0e7ff',
                                        color: '#4338ca',
                                        px: 0.8,
                                        py: 0.25,
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800
                                      }}
                                    >
                                      {cls.Name}
                                    </Box>
                                  ))
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Chưa xếp lớp</Typography>
                                )}
                              </Box>
                            </TableCell>

                            <TableCell sx={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 700 }}>
                              {joinDate}
                            </TableCell>
                            {role === 'ADMIN' && (
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <Tooltip title="Sửa thông tin">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenEdit(item)}
                                      sx={{ color: '#3b82f6', '&:hover': { bgcolor: alpha('#3b82f6', 0.08) }, p: 0.5 }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa học viên">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteStudent(item.Id, studentName)}
                                      sx={{ color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.08) }, p: 0.5 }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Cá nhân */}
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                {studentBirthDay ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontSize: '0.75rem' }}>
                                    <CakeIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                                    {moment(studentBirthDay).format('DD/MM/YYYY')}
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>--</Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', fontSize: '0.75rem' }}>
                                  <WcIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                                  {studentGender === 1 ? 'Nam' : studentGender === 2 ? 'Nữ' : studentGender === 0 ? 'Khác' : '--'}
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Phụ huynh */}
                            <TableCell sx={{ color: '#475569', fontSize: '0.775rem' }}>
                              <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.775rem' }}>
                                {parentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, fontSize: '0.7rem' }}>
                                <PhoneIcon sx={{ fontSize: 10 }} /> {phone}
                              </Typography>
                            </TableCell>

                            {/* Địa chỉ & Khu vực */}
                            <TableCell sx={{ fontSize: '0.775rem' }}>
                              <Typography sx={{ color: '#475569', fontSize: '0.775rem', fontWeight: 500, wordBreak: 'break-word', maxWidth: 150 }}>
                                {acc.Address || '--'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mt: 0.25, display: 'block', wordBreak: 'break-word', fontSize: '0.7rem' }}>
                                {locationText}
                              </Typography>
                            </TableCell>

                            {/* Lớp đăng ký */}
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  bgcolor: '#fef3c7',
                                  color: '#d97706',
                                  px: 0.8,
                                  py: 0.25,
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800
                                }}
                              >
                                Lớp {item.Course?.Name || '--'}
                              </Box>
                            </TableCell>

                            <TableCell sx={{ color: '#64748b', fontSize: '0.775rem', fontWeight: 700 }}>
                              {joinDate}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Tooltip title="Xem chi tiết">
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleOpenDetail(item)}
                                    sx={{
                                      minWidth: '28px',
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '8px',
                                      p: 0,
                                      bgcolor: '#6366f1',
                                      '&:hover': { bgcolor: '#4f46e5' }
                                    }}
                                  >
                                    <VisibilityIcon sx={{ fontSize: 16 }} />
                                  </Button>
                                </Tooltip>
                                {role === 'ADMIN' && (
                                  <>
                                    <Tooltip title="Duyệt ghi danh">
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleApprove(item.Id, studentName, item.Course?.Name)}
                                        sx={{
                                          minWidth: '28px',
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '8px',
                                          p: 0,
                                          bgcolor: '#10b981',
                                          '&:hover': { bgcolor: '#059669' }
                                        }}
                                      >
                                        <CheckIcon sx={{ fontSize: 16 }} />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Từ chối ghi danh">
                                      <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleReject(item.Id, studentName, item.Course?.Name)}
                                        sx={{
                                          minWidth: '28px',
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '8px',
                                          p: 0,
                                          bgcolor: '#ef4444',
                                          '&:hover': { bgcolor: '#dc2626' }
                                        }}
                                      >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                      </Button>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer / Pagination */}
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
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
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
                  học viên mỗi trang (Dòng {total === 0 ? 0 : page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, total)} trên tổng số {total})
                </Typography>
              </Box>

              {total > 0 && (
                <Pagination
                  count={Math.ceil(total / rowsPerPage)}
                  page={page + 1}
                  onChange={(e, val) => setPage(val - 1)}
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
          </Box>
        )}
      </Paper>

      {/* Add/Edit Student Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '28px',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            bgcolor: '#f8fafc'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isEditMode ? <EditIcon sx={{ color: '#6366f1' }} /> : <PersonAddIcon sx={{ color: '#6366f1' }} />}
              {isEditMode ? 'Chỉnh sửa thông tin Học viên' : 'Thêm Học viên mới & Xếp lớp'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
              {isEditMode ? 'Cập nhật thông tin chi tiết cho tài khoản phụ huynh và học sinh.' : 'Vui lòng cung cấp thông tin phụ huynh, con em và đăng ký lớp học tương ứng.'}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setOpenForm(false)}
            sx={{
              color: '#94a3b8',
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              '&:hover': {
                color: '#475569',
                bgcolor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3.5, bgcolor: '#fafafa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mt: 1 }}>

            {/* Section 1: Parent Info */}
            <Box
              sx={{
                p: 3,
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)'
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em'
                }}
              >
                <SupervisorAccountIcon sx={{ fontSize: 18 }} />
                1. Thông tin Phụ huynh (Tài khoản login)
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Họ tên phụ huynh"
                    required
                    value={formVal.parentName}
                    onChange={(e) => setFormVal({ ...formVal, parentName: e.target.value })}
                    error={!!formErrors.parentName}
                    helperText={formErrors.parentName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Số điện thoại"
                    required
                    value={formVal.phone}
                    onChange={(e) => setFormVal({ ...formVal, phone: e.target.value })}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email phụ huynh"
                    required
                    value={formVal.email}
                    onChange={(e) => setFormVal({ ...formVal, email: e.target.value })}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên đăng nhập"
                    required
                    disabled={isEditMode}
                    value={formVal.userName}
                    onChange={(e) => setFormVal({ ...formVal, userName: e.target.value })}
                    error={!!formErrors.userName}
                    helperText={formErrors.userName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: isEditMode ? '#f8fafc' : 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={isEditMode ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu đăng nhập'}
                    required={!isEditMode}
                    type="password"
                    value={formVal.password}
                    onChange={(e) => setFormVal({ ...formVal, password: e.target.value })}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Địa chỉ"
                    value={formVal.address}
                    onChange={(e) => setFormVal({ ...formVal, address: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={cities}
                    getOptionLabel={option => option.Name || ''}
                    value={cities.find(c => String(c.Id) === String(formVal.idCity)) || null}
                    onChange={(event, newValue) => {
                      handleCityChange(newValue ? newValue.Id : '')
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tỉnh / Thành phố"
                        placeholder="Chọn Tỉnh/Thành..."
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: '14px', bgcolor: 'white' }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    disabled={!formVal.idCity}
                    options={districtsForForm}
                    getOptionLabel={option => option.Name || ''}
                    value={districtsForForm.find(d => String(d.Id) === String(formVal.idDistrict)) || null}
                    onChange={(event, newValue) => {
                      setFormVal(prev => ({ ...prev, idDistrict: newValue ? newValue.Id : '' }))
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Quận / Huyện"
                        placeholder="Chọn Quận/Huyện..."
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: '14px', bgcolor: 'white' }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 2: Student Info */}
            <Box
              sx={{
                p: 3,
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)'
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em'
                }}
              >
                <FaceIcon sx={{ fontSize: 18 }} />
                2. Thông tin Học viên (Học sinh)
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Họ tên học sinh"
                    required
                    value={formVal.studentName}
                    onChange={(e) => setFormVal({ ...formVal, studentName: e.target.value })}
                    error={!!formErrors.studentName}
                    helperText={formErrors.studentName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaceIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ngày sinh"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formVal.studentBirthDay}
                    onChange={(e) => setFormVal({ ...formVal, studentBirthDay: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CakeIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '14px', bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="student-gender-label">Giới tính</InputLabel>
                    <Select
                      labelId="student-gender-label"
                      value={formVal.studentGender}
                      label="Giới tính"
                      onChange={(e) => setFormVal({ ...formVal, studentGender: e.target.value })}
                      startAdornment={
                        <InputAdornment position="start">
                          <WcIcon sx={{ color: '#94a3b8', fontSize: 18, mr: 1 }} />
                        </InputAdornment>
                      }
                      sx={{ borderRadius: '14px', bgcolor: 'white' }}
                    >
                      <MenuItem value={1}>Nam</MenuItem>
                      <MenuItem value={2}>Nữ</MenuItem>
                      <MenuItem value={0}>Khác</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Section 3: Class Assignment */}
            {!isEditMode && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)'
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em'
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 18 }} />
                  3. Đăng ký & Xếp lớp học
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" error={!!formErrors.courseId}>
                      <InputLabel id="enroll-course-label">Lớp học đăng ký</InputLabel>
                      <Select
                        labelId="enroll-course-label"
                        value={formVal.courseId}
                        label="Lớp học đăng ký"
                        onChange={(e) => setFormVal({ ...formVal, courseId: e.target.value })}
                        startAdornment={
                          <InputAdornment position="start">
                            <SchoolIcon sx={{ color: '#94a3b8', fontSize: 18, mr: 1 }} />
                          </InputAdornment>
                        }
                        sx={{ borderRadius: '14px', bgcolor: 'white' }}
                      >
                        {classes.map((cls) => (
                          <MenuItem key={cls.Id} value={cls.Id}>
                            Lớp {cls.Name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.courseId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {formErrors.courseId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1.5,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#f8fafc',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            onClick={() => setOpenForm(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1,
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': {
                borderColor: '#cbd5e1',
                bgcolor: '#f1f5f9',
                color: '#1e293b'
              }
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveStudent}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3.5,
              py: 1,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              bgcolor: '#6366f1',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
              }
            }}
          >
            Lưu thông tin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pending Student Detail Dialog */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #6366f1 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <VisibilityIcon />
                Chi tiết Yêu cầu Ghi danh
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500, mt: 0.5 }}>
                Xem chi tiết hồ sơ đăng ký trước khi phê duyệt.
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setOpenDetail(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3.5, bgcolor: '#f8fafc' }}>
          {selectedEnrollment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Section 1: Học viên */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em'
                  }}
                >
                  <FaceIcon sx={{ fontSize: 18 }} />
                    Hồ sơ học viên
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Tên học viên:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                      {selectedEnrollment.StudentProfile?.Name || selectedEnrollment.Account?.FullName || 'Chưa cập nhật'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CakeIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Ngày sinh:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                      {selectedEnrollment.StudentProfile?.BirthDay ? moment(selectedEnrollment.StudentProfile.BirthDay).format('DD/MM/YYYY') : '--'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WcIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Giới tính:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                      {selectedEnrollment.StudentProfile?.Gender === 1 ? 'Nam' : selectedEnrollment.StudentProfile?.Gender === 2 ? 'Nữ' : 'Khác'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Section 2: Phụ huynh */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em'
                  }}
                >
                  <SupervisorAccountIcon sx={{ fontSize: 18 }} />
                    Thông tin phụ huynh
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Họ tên phụ huynh:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                      {selectedEnrollment.Account?.FullName || 'Chưa cập nhật'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Số điện thoại:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                      {selectedEnrollment.Account?.Phone || '--'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Địa chỉ Email (Tài khoản login):</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                      {selectedEnrollment.Account?.Email || '--'}
                    </Typography>
                  </Grid>

                  {selectedEnrollment.Account?.Address && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Địa chỉ:</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                        {selectedEnrollment.Account.Address}
                      </Typography>
                    </Grid>
                  )}

                  {(selectedEnrollment.Account?.IdCity || selectedEnrollment.Account?.IdDistrict) && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Khu vực:</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                        {[
                          allDistricts.find(d => d.Id === selectedEnrollment.Account?.IdDistrict)?.Name,
                          cities.find(c => c.Id === selectedEnrollment.Account?.IdCity)?.Name
                        ].filter(Boolean).join(', ') || '--'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Section 3: Ghi danh */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em'
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 18 }} />
                    Thông tin đăng ký
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Lớp đăng ký:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#4f46e5', mt: 0.5, ml: 3.2 }}>
                        Lớp {selectedEnrollment.Course?.Name || '--'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventAvailableIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Ngày đăng ký:</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, ml: 3.2 }}>
                      {selectedEnrollment.Created_Date ? moment(selectedEnrollment.Created_Date).format('DD/MM/YYYY HH:mm') : '--'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1.5,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#f8fafc',
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={() => setOpenDetail(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f1f5f9', color: '#1e293b' }
            }}
          >
              Đóng lại
          </Button>

          {selectedEnrollment && role === 'ADMIN' && (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  const studentName = selectedEnrollment.StudentProfile?.Name || selectedEnrollment.Account?.FullName || 'Học viên'
                  setOpenDetail(false)
                  await handleReject(selectedEnrollment.Id, studentName, selectedEnrollment.Course?.Name)
                }}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  bgcolor: '#ef4444',
                  '&:hover': { bgcolor: '#dc2626' }
                }}
              >
                  Từ chối
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={async () => {
                  const studentName = selectedEnrollment.StudentProfile?.Name || selectedEnrollment.Account?.FullName || 'Học viên'
                  setOpenDetail(false)
                  await handleApprove(selectedEnrollment.Id, studentName, selectedEnrollment.Course?.Name)
                }}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                  Phê duyệt
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SchoolStudents
