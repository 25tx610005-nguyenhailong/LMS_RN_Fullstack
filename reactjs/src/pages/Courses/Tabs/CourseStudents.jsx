import { useEffect, useState, useCallback } from 'react'
import { useOutletContext, Navigate } from 'react-router-dom'
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
  Tooltip,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Checkbox,
  FormControl,
  InputLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeIcon from '@mui/icons-material/Home'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import RestoreIcon from '@mui/icons-material/Restore'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import InfoIcon from '@mui/icons-material/Info'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import moment from 'moment'
import {
  fetchClassStudentsAPI,
  updateCourseStudentStatusAPI,
  fetchAvailableClassStudentsAPI,
  addStudentToClassAPI,
  fetchCitiesAPI,
  fetchDistrictsAPI
} from '~/apis/schoolApi'
import { toast } from 'react-toastify'

function CourseStudents() {
  const { course } = useOutletContext()
  const courseId = course?.Id

  const currentUser = useSelector(selectCurrentUser)
  const userRole = currentUser?.role?.toUpperCase()

  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState('present') // 'present' or 'left'

  // Pagination states (MUI uses 0-indexed page)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchVal, setSearchVal] = useState('')
  const [debounceSearch, setDebounceSearch] = useState('')

  // Location states
  const [cities, setCities] = useState([])
  const [allDistricts, setAllDistricts] = useState([])
  const [cityFilter, setCityFilter] = useState('ALL')
  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [districtsForFilter, setDistrictsForFilter] = useState([])

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

  // Note dialog state (for student leaving class)
  const [openNoteDialog, setOpenNoteDialog] = useState(false)
  const [noteStudentId, setNoteStudentId] = useState(null) // CourseStudent ID
  const [noteStudentName, setNoteStudentName] = useState('')
  const [leaveNote, setLeaveNote] = useState('')
  const [leaveNoteError, setLeaveNoteError] = useState('')

  // Add student dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [availableSearch, setAvailableSearch] = useState('')
  const [availableStudents, setAvailableStudents] = useState([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [dialogPage, setDialogPage] = useState(0)
  const [dialogRowsPerPage, setDialogRowsPerPage] = useState(5)
  const [dialogTotal, setDialogTotal] = useState(0)
  const [selectedAddIds, setSelectedAddIds] = useState([])
  const [submittingAdd, setSubmittingAdd] = useState(false)

  // Debounce search input for class students list
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(searchVal)
      setPage(0) // Reset to first page on search
    }, 500)
    return () => clearTimeout(handler)
  }, [searchVal])

  const loadStudents = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    try {
      const cityParam = cityFilter === 'ALL' ? '' : cityFilter
      const districtParam = districtFilter === 'ALL' ? '' : districtFilter
      // API expects 1-indexed page
      const res = await fetchClassStudentsAPI(
        courseId,
        page + 1,
        rowsPerPage,
        debounceSearch,
        subTab,
        cityParam,
        districtParam
      )
      // If server returns paginated object
      if (res && res.students !== undefined) {
        setStudents(res.students)
        setTotal(res.total)
      } else {
        // Fallback for direct array response
        setStudents(res || [])
        setTotal(res ? res.length : 0)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách học viên')
    } finally {
      setLoading(false)
    }
  }, [courseId, page, rowsPerPage, debounceSearch, subTab, cityFilter, districtFilter])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const loadAvailableStudents = useCallback(async (search = '', pageIndex = 0, rowsPerPageVal = 5) => {
    if (!courseId) return
    setLoadingAvailable(true)
    try {
      const res = await fetchAvailableClassStudentsAPI(courseId, pageIndex + 1, rowsPerPageVal, search)
      if (res && res.students !== undefined) {
        setAvailableStudents(res.students)
        setDialogTotal(res.total)
      } else {
        setAvailableStudents(res || [])
        setDialogTotal(res ? res.length : 0)
      }
    } catch (error) {
      toast.error('Không thể tìm kiếm học sinh khả dụng')
    } finally {
      setLoadingAvailable(false)
    }
  }, [courseId])

  // Debounce search inside add student dialog
  useEffect(() => {
    if (!openAddDialog) return
    const handler = setTimeout(() => {
      setDialogPage(0)
      loadAvailableStudents(availableSearch, 0, dialogRowsPerPage)
    }, 400)
    return () => clearTimeout(handler)
  }, [availableSearch, loadAvailableStudents, openAddDialog, dialogRowsPerPage])

  const handleDialogPageChange = (event, newPage) => {
    setDialogPage(newPage)
    loadAvailableStudents(availableSearch, newPage, dialogRowsPerPage)
  }

  const handleDialogRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setDialogRowsPerPage(newRowsPerPage)
    setDialogPage(0)
    loadAvailableStudents(availableSearch, 0, newRowsPerPage)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleClearSearch = () => {
    setSearchVal('')
  }

  const handleBatchAddStudents = async () => {
    if (selectedAddIds.length === 0) return
    setSubmittingAdd(true)
    try {
      await addStudentToClassAPI(courseId, null, selectedAddIds)
      toast.success(`Đã thêm ${selectedAddIds.length} học viên vào lớp học thành công!`)
      setSelectedAddIds([])
      loadStudents()
      loadAvailableStudents(availableSearch, dialogPage, dialogRowsPerPage)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm học viên')
    } finally {
      setSubmittingAdd(false)
    }
  }

  const handleOpenLeaveDialog = (courseStudentId, studentName) => {
    setNoteStudentId(courseStudentId)
    setNoteStudentName(studentName)
    setLeaveNote('')
    setLeaveNoteError('')
    setOpenNoteDialog(true)
  }

  const handleConfirmLeave = async () => {
    if (!leaveNote.trim()) {
      setLeaveNoteError('Ghi chú lý do rời lớp là bắt buộc')
      return
    }
    try {
      await updateCourseStudentStatusAPI(courseId, noteStudentId, 0, leaveNote)
      toast.success(`Học viên ${noteStudentName} đã rời lớp học.`)
      setOpenNoteDialog(false)
      loadStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  const handleRejoinClass = async (courseStudentId, studentName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn khôi phục học viên "${studentName}" quay lại học lớp này không?`)) return
    try {
      await updateCourseStudentStatusAPI(courseId, courseStudentId, 1, 'Quay lại lớp')
      toast.success(`Đã khôi phục trạng thái có mặt cho học viên ${studentName}`)
      loadStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi khôi phục trạng thái')
    }
  }

  const handleCopyEnrollLink = () => {
    const enrollLink = `${window.location.origin}/enroll/${courseId}`
    navigator.clipboard.writeText(enrollLink)
    toast.success('Đã sao chép đường dẫn ghi danh lớp học!')
  }

  if (userRole === 'STUDENT') {
    return <Navigate to={`/courses/${course?.Id}/schedule`} replace />
  }

  return (
    <Box sx={{ p: 1, height: '100%', animation: 'fadeIn 0.3s ease' }}>
      {/* Enrollment Link Share Panel */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '24px',
          border: '1px dashed #6366f1',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '280px', flex: 1 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'rgba(99, 102, 241, 0.08)',
              color: '#6366f1',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShareIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Liên kết ghi danh cho phụ huynh
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mt: 0.2 }}>
              Mời phụ huynh đăng ký cho con của họ vào lớp này bằng cách chia sẻ đường dẫn này
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flex: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '0.825rem',
              color: '#475569',
              userSelect: 'all',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: { xs: '100%', sm: '320px', md: '420px' },
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            {`${window.location.origin}/enroll/${courseId}`}
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleCopyEnrollLink}
            startIcon={<ContentCopyIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              height: '38px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 10px rgba(118, 75, 162, 0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd6 0%, #683d93 100%)',
                boxShadow: '0 6px 14px rgba(118, 75, 162, 0.25)'
              }
            }}
          >
            Sao chép
          </Button>
        </Box>
      </Paper>

      {/* Top Header Card */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PeopleOutlineIcon color="primary" sx={{ fontSize: 30 }} /> Danh sách học viên ({total})
          </Typography>
          <Typography variant="body2" color="text.secondary">Danh sách và trạng thái hoạt động của các học viên lớp {course?.Name}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {userRole === 'ADMIN' && (
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => {
                setOpenAddDialog(true)
                setAvailableSearch('')
                setAvailableStudents([])
                setDialogPage(0)
                setDialogRowsPerPage(5)
                setSelectedAddIds([])
                loadAvailableStudents('', 0, 5)
              }}
              sx={{ borderRadius: '12px', px: 2.5, height: '40px', fontWeight: 700, textTransform: 'none', bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
              Thêm học viên vào lớp
            </Button>
          )}

          {/* City Filter Dropdown */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="select-city-label">Tỉnh / Thành phố</InputLabel>
            <Select
              labelId="select-city-label"
              value={cityFilter}
              label="Tỉnh / Thành phố"
              onChange={handleCityFilterChange}
              sx={{ borderRadius: '12px', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            >
              <MenuItem value="ALL"><em>Tất cả Tỉnh/Thành</em></MenuItem>
              {cities.map((city) => (
                <MenuItem key={city.Id} value={city.Id}>
                  {city.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* District Filter Dropdown */}
          <FormControl size="small" sx={{ minWidth: 160 }} disabled={cityFilter === 'ALL'}>
            <InputLabel id="select-district-label">Quận / Huyện</InputLabel>
            <Select
              labelId="select-district-label"
              value={districtFilter}
              label="Quận / Huyện"
              onChange={handleDistrictFilterChange}
              sx={{ borderRadius: '12px', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            >
              <MenuItem value="ALL"><em>Tất cả Quận/Huyện</em></MenuItem>
              {districtsForFilter.map((district) => (
                <MenuItem key={district.Id} value={district.Id}>
                  {district.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
              sx: { borderRadius: '16px', bgcolor: 'white', width: 280, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }
            }}
          />
        </Box>
      </Box>

      {/* Sub-tabs selector */}
      <Box sx={{ display: 'flex', bgcolor: '#f1f5f9', p: 0.75, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0', width: 'fit-content' }}>
        <Tabs
          value={subTab}
          onChange={(e, val) => { setSubTab(val); setPage(0) }}
          aria-label="Class student status tabs"
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            minHeight: 'auto',
            '& .MuiTabs-flexContainer': {
              gap: 1
            }
          }}
        >
          <Tab
            value="present"
            label="Học viên đang học (Có mặt)"
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
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
                color: '#ffffff !important', // White text when selected
                bgcolor: '#10b981 !important', // Solid green when selected
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              },
              '&:hover:not(.Mui-selected)': {
                color: '#10b981',
                bgcolor: 'rgba(16, 185, 129, 0.08)'
              }
            }}
          />
          <Tab
            value="left"
            label="Học viên đã rời lớp"
            icon={<RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />}
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
                color: '#ffffff !important', // White text when selected
                bgcolor: '#ef4444 !important', // Solid red when selected
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
              },
              '&:hover:not(.Mui-selected)': {
                color: '#ef4444',
                bgcolor: 'rgba(239, 68, 68, 0.08)'
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
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Đang tải danh sách học viên...</Typography>
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ p: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <PeopleOutlineIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569', mb: 1 }}>Không tìm thấy học viên</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              {searchVal ? 'Không tìm thấy học viên nào khớp với từ khóa tìm kiếm. Vui lòng thử lại từ khóa khác.' : 'Lớp học hiện tại không có học viên nào ở danh sách này.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TableContainer sx={{ flex: 1 }}>
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
                <TableHead sx={{ bgcolor: '#e0e7ff', '& .MuiTableCell-head': { color: '#312e81', fontWeight: 800 } }}>
                  <TableRow>
                    <TableCell align="center" sx={{ width: 80 }}>STT</TableCell>
                    <TableCell>Học viên</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailIcon sx={{ fontSize: 16 }} /> Email</Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PhoneIcon sx={{ fontSize: 16 }} /> Điện thoại</Box>
                    </TableCell>
                    {subTab === 'present' ? (
                      <>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><HomeIcon sx={{ fontSize: 16 }} /> Địa chỉ</Box>
                        </TableCell>
                        <TableCell>Khu vực</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EventAvailableIcon sx={{ fontSize: 16 }} /> Ngày tham gia</Box>
                        </TableCell>
                        {userRole === 'ADMIN' && (
                          <TableCell align="center" sx={{ width: 120 }}>Thao tác</TableCell>
                        )}
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><InfoIcon sx={{ fontSize: 16 }} /> Ghi chú lý do rời lớp</Box>
                        </TableCell>
                        <TableCell>Khu vực</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EventAvailableIcon sx={{ fontSize: 16 }} /> Ngày cập nhật</Box>
                        </TableCell>
                        {userRole === 'ADMIN' && (
                          <TableCell align="center" sx={{ width: 120 }}>Thao tác</TableCell>
                        )}
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((item, index) => {
                    const acc = item.Account || {}
                    const avatarUrl = acc.LinkAvatar || ''
                    const fullName = acc.FullName || 'Chưa cập nhật'
                    const username = acc.UserName || ''
                    const email = acc.Email || '--'
                    const phone = acc.Phone || '--'
                    const address = acc.Address || '--'
                    const joinDate = item.Created_Date ? moment(item.Created_Date).format('DD/MM/YYYY') : '--'
                    const modifiedDate = item.Modified_Date ? moment(item.Modified_Date).format('DD/MM/YYYY') : joinDate
                    const serialNumber = page * rowsPerPage + index + 1
                    const note = item.Note || '--'

                    // Resolve city & district
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
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>
                          {serialNumber}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={avatarUrl}
                              sx={{
                                width: 40,
                                height: 40,
                                border: '2px solid #f1f5f9',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                bgcolor: '#6366f1',
                                fontSize: '0.95rem',
                                fontWeight: 800
                              }}
                            >
                              {fullName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', lineHeight: 1.2 }}>
                                {fullName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                @{username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>{email}</TableCell>
                        <TableCell sx={{ color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>{phone}</TableCell>
                        {subTab === 'present' ? (
                          <>
                            <TableCell sx={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500, maxWidth: 220 }}>
                              <Tooltip title={address} placement="top" arrow>
                                <Typography sx={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {address}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>
                              {locationText}
                            </TableCell>
                            <TableCell sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                              {joinDate}
                            </TableCell>
                            {userRole === 'ADMIN' && (
                              <TableCell align="center">
                                <Tooltip title="Cho rời lớp">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenLeaveDialog(item.Id, fullName)}
                                    sx={{ color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.08) } }}
                                  >
                                    <ExitToAppIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            )}
                          </>
                        ) : (
                          <>
                            <TableCell sx={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500, maxWidth: 220 }}>
                              <Tooltip title={note} placement="top" arrow>
                                <Typography sx={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {note}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>
                              {locationText}
                            </TableCell>
                            <TableCell sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                              {modifiedDate}
                            </TableCell>
                            {userRole === 'ADMIN' && (
                              <TableCell align="center">
                                <Tooltip title="Khôi phục vào lớp">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRejoinClass(item.Id, fullName)}
                                    sx={{ color: '#10b981', '&:hover': { bgcolor: alpha('#10b981', 0.08) } }}
                                  >
                                    <RestoreIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    )
                  })}
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

      {/* Add Student Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '28px',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease'
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(13, 148, 136, 0.15)'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 1.2, fontSize: '1.15rem' }}>
              <PersonAddIcon sx={{ color: 'white', fontSize: 24 }} />
              Thêm học viên vào lớp
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500, mt: 0.25, fontSize: '0.775rem' }}>
              Tìm kiếm và thêm học sinh từ danh sách của trường chưa ghi danh vào lớp.
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setOpenAddDialog(false)}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              '&:hover': {
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                borderColor: 'rgba(255, 255, 255, 0.35)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              placeholder="Nhập tên, email hoặc số điện thoại học sinh..."
              fullWidth
              size="medium"
              value={availableSearch}
              onChange={(e) => setAvailableSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#0d9488', fontSize: 24 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '20px',
                  bgcolor: 'white',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.04)',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  py: 0.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#0d9488'
                  },
                  '&.Mui-focused': {
                    borderColor: '#0d9488',
                    boxShadow: '0 4px 16px rgba(13, 148, 136, 0.15)'
                  },
                  '& fieldset': { border: 'none' }
                }
              }}
            />

            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white', maxHeight: '380px' }}>
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
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell padding="checkbox" sx={{ width: 50 }}>
                      <Checkbox
                        indeterminate={
                          selectedAddIds.length > 0 &&
                          selectedAddIds.length < availableStudents.filter(s => !students.some(present => present.Account?.Id === s.Id || present.IdAccountStudent === s.Id)).length
                        }
                        checked={
                          availableStudents.length > 0 &&
                          availableStudents.filter(s => !students.some(present => present.Account?.Id === s.Id || present.IdAccountStudent === s.Id)).length > 0 &&
                          selectedAddIds.length === availableStudents.filter(s => !students.some(present => present.Account?.Id === s.Id || present.IdAccountStudent === s.Id)).length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const addableIds = availableStudents
                              .filter(s => !students.some(present => present.Account?.Id === s.Id || present.IdAccountStudent === s.Id))
                              .map(s => s.Id)
                            setSelectedAddIds(addableIds)
                          } else {
                            setSelectedAddIds([])
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', width: 60 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Học viên</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Điện thoại</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', width: 110 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingAvailable ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                          <CircularProgress size={28} thickness={4} sx={{ color: '#0d9488' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Đang tải dữ liệu...</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : availableStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: '50%', display: 'inline-flex' }}>
                            <PeopleOutlineIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, color: '#475569' }}>
                            Không tìm thấy học viên nào khả dụng
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280 }}>
                            {availableSearch ? 'Hãy thử tìm kiếm bằng từ khóa khác.' : 'Học viên trong trường đều đã tham gia lớp học này.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableStudents.map((student, idx) => {
                      const serialNum = dialogPage * dialogRowsPerPage + idx + 1
                      const isAlreadyInClass = students.some(s => s.Account?.Id === student.Id || s.IdAccountStudent === student.Id)
                      const isChecked = selectedAddIds.includes(student.Id)
                      return (
                        <TableRow
                          key={student.Id}
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(13, 148, 136, 0.02)'
                            }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              disabled={isAlreadyInClass}
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAddIds(prev => [...prev, student.Id])
                                } else {
                                  setSelectedAddIds(prev => prev.filter(id => id !== student.Id))
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>
                            {serialNum}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={student.Avatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)',
                                  color: 'white',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.15)',
                                  border: '1px solid #ffffff',
                                  opacity: isAlreadyInClass ? 0.6 : 1
                                }}
                              >
                                {student.StudentName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: isAlreadyInClass ? 'text.secondary' : '#1e293b', fontSize: '0.85rem', textDecoration: isAlreadyInClass ? 'line-through' : 'none' }}>
                                {student.StudentName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: isAlreadyInClass ? 'text.secondary' : '#475569', fontSize: '0.8rem', fontWeight: 500 }}>
                            {student.Email || '--'}
                          </TableCell>
                          <TableCell sx={{ color: isAlreadyInClass ? 'text.secondary' : '#475569', fontSize: '0.8rem', fontWeight: 500 }}>
                            {student.Phone || '--'}
                          </TableCell>
                          <TableCell align="center">
                            {isAlreadyInClass ? (
                              <Box sx={{ display: 'inline-flex', px: 1.25, py: 0.25, borderRadius: '8px', bgcolor: 'rgba(100, 116, 139, 0.1)', color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Đã thêm
                              </Box>
                            ) : (
                              <Box sx={{ display: 'inline-flex', px: 1.25, py: 0.25, borderRadius: '8px', bgcolor: 'rgba(20, 184, 166, 0.1)', color: '#0d9488', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Sẵn có
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {dialogTotal > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  bgcolor: '#f8fafc',
                  borderTop: '1px solid #f1f5f9',
                  borderRadius: '16px',
                  mt: 0.5,
                  flexWrap: 'wrap',
                  gap: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                    Hiển thị
                  </Typography>
                  <Select
                    value={dialogRowsPerPage}
                    onChange={handleDialogRowsPerPageChange}
                    size="small"
                    sx={{
                      borderRadius: '8px',
                      bgcolor: 'white',
                      fontWeight: 800,
                      color: '#1e293b',
                      minWidth: 60,
                      height: 28,
                      fontSize: '0.75rem',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' }
                    }}
                  >
                    <MenuItem value={5} sx={{ fontSize: '0.75rem' }}>5</MenuItem>
                    <MenuItem value={10} sx={{ fontSize: '0.75rem' }}>10</MenuItem>
                    <MenuItem value={25} sx={{ fontSize: '0.75rem' }}>25</MenuItem>
                  </Select>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                    dòng mỗi trang (Dòng {dialogPage * dialogRowsPerPage + 1}-{Math.min((dialogPage + 1) * dialogRowsPerPage, dialogTotal)} trên tổng số {dialogTotal})
                  </Typography>
                </Box>
                <Pagination
                  count={Math.ceil(dialogTotal / dialogRowsPerPage)}
                  page={dialogPage + 1}
                  onChange={(e, val) => handleDialogPageChange(e, val - 1)}
                  color="primary"
                  variant="outlined"
                  shape="rounded"
                  size="small"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      border: '1px solid #cbd5e1',
                      bgcolor: '#ffffff',
                      color: '#334155',
                      minWidth: '28px',
                      height: '28px',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: '#f1f5f9',
                        borderColor: '#94a3b8',
                        color: '#0f172a'
                      },
                      '&.Mui-selected': {
                        bgcolor: '#0d9488',
                        color: '#ffffff',
                        borderColor: '#0d9488',
                        fontWeight: 700,
                        '&:hover': {
                          bgcolor: '#0f766e',
                          borderColor: '#0f766e'
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#f8fafc',
            justifyContent: 'flex-end',
            gap: 1.5
          }}
        >
          <Button
            onClick={() => setOpenAddDialog(false)}
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
            Đóng
          </Button>
          <Button
            variant="contained"
            disabled={selectedAddIds.length === 0 || submittingAdd}
            onClick={handleBatchAddStudents}
            startIcon={submittingAdd ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                boxShadow: '0 6px 16px rgba(13, 148, 136, 0.3)'
              },
              '&.Mui-disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            Thêm học viên đã chọn ({selectedAddIds.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Note Dialog */}
      <Dialog
        open={openNoteDialog}
        onClose={() => setOpenNoteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease'
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
            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(225, 29, 72, 0.15)'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 850, color: 'white', display: 'flex', alignItems: 'center', gap: 1.2, fontSize: '1.15rem' }}>
              <ExitToAppIcon sx={{ color: 'white', fontSize: 24 }} />
              Xác nhận học viên rời lớp
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setOpenNoteDialog(false)}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              '&:hover': {
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                borderColor: 'rgba(255, 255, 255, 0.35)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3.5, bgcolor: '#ffffff' }}>
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'rgba(244, 63, 94, 0.05)',
                border: '1px solid rgba(244, 63, 94, 0.15)',
                borderRadius: '16px'
              }}
            >
              <Typography sx={{ color: '#be123c', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.45 }}>
                Bạn đang thực hiện cho học viên <strong>{noteStudentName}</strong> rời khỏi lớp học này. Vui lòng ghi lại lý do rời lớp dưới đây để hoàn tất hồ sơ.
              </Typography>
            </Box>
            <TextField
              label="Lý do rời lớp"
              placeholder="Ví dụ: Chuyển sang lớp khác, bận lịch cá nhân..."
              required
              fullWidth
              multiline
              rows={5}
              value={leaveNote}
              onChange={(e) => {
                setLeaveNote(e.target.value)
                if (e.target.value.trim()) setLeaveNoteError('')
              }}
              error={!!leaveNoteError}
              helperText={leaveNoteError}
              InputProps={{
                sx: {
                  borderRadius: '16px',
                  bgcolor: '#f8fafc',
                  fontSize: '0.9rem',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1 !important' },
                  '&.Mui-focused fieldset': { borderColor: '#e11d48 !important', borderWidth: '2px' }
                }
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '0.9rem',
                  '&.Mui-focused': { color: '#e11d48' }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#f8fafc',
            justifyContent: 'flex-end',
            gap: 1.5
          }}
        >
          <Button
            onClick={() => setOpenNoteDialog(false)}
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
            onClick={handleConfirmLeave}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1,
              bgcolor: '#e11d48',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
              color: 'white',
              '&:hover': {
                bgcolor: '#be123c',
                boxShadow: '0 6px 16px rgba(225, 29, 72, 0.4)'
              },
              transition: 'all 0.2s'
            }}
          >
            Xác nhận rời lớp
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CourseStudents
