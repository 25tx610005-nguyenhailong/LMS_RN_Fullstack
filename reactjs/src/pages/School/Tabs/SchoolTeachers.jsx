import { useEffect, useState } from 'react'
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
  Tabs,
  Tab,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Card,
  CardContent,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  alpha
} from '@mui/material'
import { useOutletContext, useParams } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import PaymentsIcon from '@mui/icons-material/Payments'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BadgeIcon from '@mui/icons-material/Badge'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'
import { createTeacherAPI, updateTeacherAPI, deleteTeacherAPI } from '~/apis'
import { fetchSchoolDashboardAPI } from '~/apis/schoolApi'

import { fetchTeachersAPI } from '~/apis/teacherApi'
import { resolveFileUrl } from '~/utils/formatters'
import { addTeachersToSchoolAPI, fetchCitiesAPI, fetchDistrictsAPI } from '~/apis/schoolApi'
import { fetchReferenceDataAPI } from '~/apis/adminApi'
import { Pagination, Stack as MuiStack, Autocomplete } from '@mui/material'
import moment from 'moment'

const formatCurrency = (value) => {
  if (!value) return ''
  const num = parseInt(value.toString().replace(/\D/g, ''), 10)
  if (isNaN(num)) return ''
  return num.toLocaleString('vi-VN')
}

const parseCurrency = (value) => {
  if (!value) return 0
  return parseInt(value.toString().replace(/\D/g, ''), 10) || 0
}

function AddTeacherModal({ open, onClose, onSave, currentTeacherIds, refData, cities, allDistricts }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [teacherType, setTeacherType] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const limit = 5

  const loadPickTeachers = async () => {
    setLoading(true)
    try {
      const data = await fetchTeachersAPI({
        page,
        limit,
        search,
        teacherType,
        cityId: cityFilter,
        districtId: districtFilter,
        active: activeFilter
      })
      setTeachers(data.teachers)
      setTotal(data.total)
    } catch (error) {
      toast.error('Không thể tải danh sách giáo viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadPickTeachers()
  }, [open, page, teacherType, activeFilter, cityFilter, districtFilter])

  const handleSearch = () => {
    setPage(1)
    loadPickTeachers()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCityFilterChange = (e) => {
    setCityFilter(e.target.value)
    setDistrictFilter('')
  }

  const handleReset = () => {
    setSearch('')
    setTeacherType('')
    setActiveFilter('')
    setCityFilter('')
    setDistrictFilter('')
    setPage(1)
    setLoading(true)
    fetchTeachersAPI({ page: 1, limit, search: '', teacherType: '', active: '', cityId: '', districtId: '' })
      .then(data => {
        setTeachers(data.teachers)
        setTotal(data.total)
      })
      .catch(() => {
        toast.error('Không thể tải danh sách giáo viên')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const filterDistricts = cityFilter === ''
    ? []
    : allDistricts?.filter(d => d.IdCity === Number(cityFilter)) || []

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSave = () => {
    onSave(selectedIds)
    setSelectedIds([])
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', width: 44, height: 44 }}>
            <PersonAddIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Chọn giáo viên từ hệ thống
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tìm kiếm và liên kết giáo viên có sẵn vào cơ sở trường học này
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#ffffff' }}>
        {/* Bộ lọc hiện đại */}
        <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Grid container spacing={2} alignItems="center">
            {/* Hàng 1 */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tên, Email, Username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#6366f1' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '10px', bgcolor: 'white', '& fieldset': { borderColor: '#e2e8f0' } }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                options={cities || []}
                getOptionLabel={option => option.Name || ''}
                value={cities?.find(c => String(c.Id) === String(cityFilter)) || null}
                onChange={(event, newValue) => {
                  const val = newValue ? newValue.Id : ''
                  setCityFilter(val)
                  setDistrictFilter('')
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tỉnh/Thành"
                    placeholder="Tất cả tỉnh thành..."
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: '10px', bgcolor: 'white' }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                disabled={!cityFilter}
                options={filterDistricts || []}
                getOptionLabel={option => option.Name || ''}
                value={filterDistricts?.find(d => String(d.Id) === String(districtFilter)) || null}
                onChange={(event, newValue) => {
                  setDistrictFilter(newValue ? newValue.Id : '')
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Quận/Huyện"
                    placeholder={cityFilter ? 'Tất cả quận huyện...' : 'Chọn Tỉnh/Thành trước...'}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: '10px', bgcolor: 'white' }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Hàng 2 */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.85rem' }}>Hợp đồng</InputLabel>
                <Select
                  value={teacherType}
                  label="Hợp đồng"
                  onChange={e => setTeacherType(e.target.value)}
                  sx={{ borderRadius: '10px', bgcolor: 'white' }}
                >
                  <MenuItem value="">Tất cả hợp đồng</MenuItem>
                  <MenuItem value={1}>Cố định</MenuItem>
                  <MenuItem value={2}>Theo giờ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.85rem' }}>Trạng thái</InputLabel>
                <Select
                  value={activeFilter}
                  label="Trạng thái"
                  onChange={e => setActiveFilter(e.target.value)}
                  sx={{ borderRadius: '10px', bgcolor: 'white' }}
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="true">Hoạt động</MenuItem>
                  <MenuItem value="false">Tạm khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon fontSize="small" />}
                sx={{
                  borderRadius: '10px',
                  bgcolor: '#4f46e5',
                  textTransform: 'none',
                  fontWeight: 600,
                  height: '40px',
                  '&:hover': { bgcolor: '#4338ca' }
                }}
              >
                Tìm kiếm
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  borderRadius: '10px',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  minWidth: '40px',
                  height: '40px',
                  p: 1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
                }}
              >
                <RestartAltIcon fontSize="small" />
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Bảng kết quả */}
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table
            stickyHeader
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
              <TableRow>
                <TableCell padding="checkbox" sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}></TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Giáo viên</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Liên hệ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Cá nhân</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Địa chỉ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Khu vực</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Hợp đồng</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Thù lao</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Thanh toán</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} sx={{ color: '#4f46e5' }} />
                  </TableCell>
                </TableRow>
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      <PersonAddIcon sx={{ fontSize: 48, mb: 1, opacity: 0.2, color: '#6366f1' }} />
                      <Typography sx={{ fontWeight: 500 }}>Không tìm thấy giáo viên phù hợp</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : teachers.map(t => {
                const isAlreadyInSchool = currentTeacherIds.includes(t.Id)
                const salary = t.AccountSalary?.[0] || {}
                const genderName = refData?.genders?.find(g => g.Id === t.IdGender)?.Name || '—'
                const paymentMethodName = refData?.paymentMethods?.find(pm => pm.Id === salary.IdPaymentMethod)?.Name || 'Chưa thiết lập'
                const cityName = cities?.find(c => c.Id === t.IdCity)?.Name
                const districtName = allDistricts?.find(d => d.Id === t.IdDistrict)?.Name
                const locationName = [districtName, cityName].filter(Boolean).join(', ') || '—'

                const typeConfig = {
                  1: { label: 'Cố định', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
                  2: { label: 'Theo giờ', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
                }
                const typeInfo = typeConfig[salary.TypeSalary] || { label: 'N/A', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' }

                return (
                  <TableRow
                    key={t.Id}
                    hover
                    sx={{
                      opacity: isAlreadyInSchool ? 0.75 : 1,
                      bgcolor: isAlreadyInSchool ? '#f8fafc' : 'inherit',
                      transition: 'all 0.2s',
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(t.Id) || isAlreadyInSchool}
                        disabled={isAlreadyInSchool}
                        onChange={() => handleToggleSelect(t.Id)}
                        sx={{
                          color: isAlreadyInSchool ? '#cbd5e1' : '#4f46e5',
                          '&.Mui-checked': {
                            color: isAlreadyInSchool ? '#94a3b8' : '#4f46e5'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={resolveFileUrl(t.LinkAvatar)}
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: '#6366f1',
                            fontSize: '14px',
                            fontWeight: 700,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                          }}
                        >
                          {t.FullName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
                            {t.FullName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              @{t.UserName}
                            </Typography>
                            {isAlreadyInSchool && (
                              <Chip
                                label="Đã thuộc cơ sở"
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 16,
                                  px: 0.5,
                                  fontWeight: 600,
                                  borderColor: '#fca5a5',
                                  color: '#ef4444',
                                  bgcolor: '#fef2f2'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.Email}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{t.Phone || '—'}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {t.BirthDay ? moment(t.BirthDay).format('DD/MM/YYYY') : '—'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Giới tính: {genderName}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.8rem',
                        color: '#475569',
                        maxWidth: 180,
                        wordBreak: 'break-word',
                        whiteSpace: 'normal'
                      }}
                      title={t.Address || ''}
                    >
                      {t.Address || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {locationName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={typeInfo.label}
                        size="small"
                        sx={{
                          bgcolor: typeInfo.bg,
                          color: typeInfo.color,
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: `1px solid ${typeInfo.border}`,
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {salary.TypeSalary === 1 ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#1e293b' }}>
                            Cứng: {formatCurrency(salary.SalaryPerMonth)}đ
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>
                            Định mức: {salary.WarrantyHours || 0}h | OT: {formatCurrency(salary.SalaryPerHour)}đ/h
                          </Typography>
                        </Box>
                      ) : salary.TypeSalary === 2 ? (
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#2563eb' }}>
                          Đơn giá: {formatCurrency(salary.SalaryPerHour)}đ/h
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                        {paymentMethodName}
                      </Typography>
                      {salary.NumberAccountBank && (
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                          STK: {salary.NumberAccountBank}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.Active ? (
                        <Chip
                          label="Hoạt động"
                          size="small"
                          sx={{
                            bgcolor: '#dcfce7',
                            color: '#15803d',
                            fontWeight: 700,
                            borderRadius: '6px',
                            fontSize: '0.75rem'
                          }}
                        />
                      ) : (
                        <Chip
                          label="Tạm khóa"
                          size="small"
                          sx={{
                            bgcolor: '#fee2e2',
                            color: '#b91c1c',
                            fontWeight: 700,
                            borderRadius: '6px',
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Phân trang */}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={(e, v) => setPage(v)}
            color="primary"
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 600,
                borderRadius: '8px'
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 1.5 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: '10px',
            '&:hover': { bgcolor: '#e2e8f0' }
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={selectedIds.length === 0}
          sx={{
            borderRadius: '10px',
            px: 4,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)'
            },
            '&.Mui-disabled': {
              background: '#e2e8f0',
              color: '#94a3b8'
            }
          }}
        >
          Xác nhận thêm ({selectedIds.length} giáo viên)
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}


function SchoolTeachers() {
  const { schoolId } = useParams()
  const { data: dashboardData } = useOutletContext()
  const [teachers, setTeachers] = useState(dashboardData?.teachers || [])
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])
  const [allDistricts, setAllDistricts] = useState([])
  const [refData, setRefData] = useState({ genders: [], paymentMethods: [] })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const confirm = useConfirm()

  // Pagination for the main teachers table
  const [mainPage, setMainPage] = useState(1)

  const [editingTeacher, setEditingTeacher] = useState(null)
  const [contractTypeFilter, setContractTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [cityFilter, setCityFilter] = useState('ALL')
  const [districtFilter, setDistrictFilter] = useState('ALL')

  // Rich Form State
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    password: '',
    idCity: '',
    idDistrict: '',
    idGender: '',
    birthDay: '',
    salary: {
      typeSalary: 1,
      typeTeacher: 1,
      idMonetaryUnit: 1,
      salaryPerMonth: 0,
      salaryPerHour: 0,
      warrantyHours: 0,
      idPaymentMethod: '',
      bankAccount: ''
    },
    certificates: []
  })

  const [newCert, setNewCert] = useState({
    name: '', org: '', issueDate: '', expiryDate: '', description: '', fileUrl: ''
  })

  useEffect(() => {
    if (dashboardData?.teachers) setTeachers(dashboardData.teachers)

    const loadInitData = async () => {
      try {
        const [cityList, districtList, refs] = await Promise.all([
          fetchCitiesAPI(),
          fetchDistrictsAPI(),
          fetchReferenceDataAPI()
        ])
        setCities(cityList)
        setAllDistricts(districtList)
        setRefData(refs)
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu khởi tạo')
      }
    }
    loadInitData()
  }, [dashboardData])

  const loadDistricts = async (cityId) => {
    try {
      const list = await fetchDistrictsAPI(cityId)
      setDistricts(list)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Quận/Huyện')
    }
  }

  const handleCityChange = (e) => {
    const cityId = e.target.value
    setFormData({ ...formData, idCity: cityId, idDistrict: '' })
    loadDistricts(cityId)
  }

  const refreshTeachers = async () => {
    setLoading(true)
    try {
      const updatedData = await fetchSchoolDashboardAPI(schoolId)
      setTeachers(updatedData.teachers)
    } catch (error) {
      toast.error('Không thể cập nhật danh sách')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (teacher = null) => {
    setTabValue(0)
    if (teacher) {
      setEditingTeacher(teacher)
      const salary = teacher.AccountSalary?.[0] || {}
      setFormData({
        userName: teacher.UserName || '',
        email: teacher.Email,
        fullName: teacher.FullName,
        phone: teacher.Phone || '',
        address: teacher.Address || '',
        birthDay: teacher.BirthDay || '',
        idGender: teacher.IdGender || '',
        idCity: teacher.IdCity || '',
        idDistrict: teacher.IdDistrict || '',
        password: '',
        salary: {
          typeTeacher: 1, // Enforced to 1
          typeSalary: salary.TypeSalary || 1, // Determined by TypeSalary
          idMonetaryUnit: salary.IdMonetaryUnit || 1,
          salaryPerMonth: salary.SalaryPerMonth || 0,
          salaryPerHour: salary.SalaryPerHour || 0,
          warrantyHours: salary.WarrantyHours || 0,
          idPaymentMethod: salary.IdPaymentMethod || '',
          bankAccount: salary.NumberAccountBank || ''
        },
        certificates: teacher.AccountCertificate?.map(cert => ({
          name: cert.CertificateName,
          org: cert.Organization,
          issueDate: cert.IssueDate ? cert.IssueDate.split('T')[0] : '',
          expiryDate: cert.ExpiryDate ? cert.ExpiryDate.split('T')[0] : '',
          description: cert.Description
        })) || [],
        workingTimes: (teacher.AccountWorkingTime || teacher.accountWorkingTime)?.map(wt => {
          const parse = (val) => {
            if (!val) return null
            if (typeof val === 'string' && !val.includes('T')) return val.substring(0, 5)
            const d = new Date(val)
            if (isNaN(d.getTime())) return null
            const h = d.getUTCHours().toString().padStart(2, '0')
            const m = d.getUTCMinutes().toString().padStart(2, '0')
            return `${h}:${m}`
          }
          return {
            dayOfWeek: Number(wt.DayOfWeek ?? wt.dayOfWeek ?? 2),
            fromTime: parse(wt.FromTime ?? wt.fromTime) || '08:00',
            toTime: parse(wt.ToTime ?? wt.toTime) || '17:00'
          }
        }) || []
      })
      if (teacher.IdCity) loadDistricts(teacher.IdCity)
    } else {
      setEditingTeacher(null)
      setFormData({
        userName: '',
        email: '', fullName: '', phone: '', address: '', password: '',
        idCity: '', idDistrict: '', idGender: '', birthDay: '',
        salary: { typeSalary: 1, typeTeacher: 1, idMonetaryUnit: 1, salaryPerMonth: 0, salaryPerHour: 0, warrantyHours: 0, idPaymentMethod: '', bankAccount: '' },
        certificates: [],
        workingTimes: [
          { dayOfWeek: 2, fromTime: '08:00', toTime: '17:00' },
          { dayOfWeek: 3, fromTime: '08:00', toTime: '17:00' },
          { dayOfWeek: 4, fromTime: '08:00', toTime: '17:00' },
          { dayOfWeek: 5, fromTime: '08:00', toTime: '17:00' },
          { dayOfWeek: 6, fromTime: '08:00', toTime: '17:00' },
          { dayOfWeek: 7, fromTime: '08:00', toTime: '17:00' },
          { dayOfWeek: 1, fromTime: '08:00', toTime: '17:00' }
        ]
      })
    }
    setShowForm(true)
  }

  const checkOverlap = (day, from, to, excludeIdx = -1) => {
    const daySlots = formData.workingTimes.filter((wt, idx) => wt.dayOfWeek === day && idx !== excludeIdx)
    return daySlots.some(slot => (from < slot.toTime && to > slot.fromTime))
  }

  const handleAddWorkingTime = (day = 2) => {
    const newFrom = '08:00'
    const newTo = '17:00'
    if (checkOverlap(day, newFrom, newTo)) {
      toast.warning('Chú ý: Khung giờ mới đang trùng với lịch đã có trong ngày!')
    }
    setFormData({ ...formData, workingTimes: [...formData.workingTimes, { dayOfWeek: day, fromTime: newFrom, toTime: newTo }] })
  }

  const handleUpdateWorkingTime = (idx, field, value) => {
    const newWT = [...formData.workingTimes]
    const updatedSlot = { ...newWT[idx], [field]: value }

    if (checkOverlap(updatedSlot.dayOfWeek, updatedSlot.fromTime, updatedSlot.toTime, idx)) {
      toast.error('Lỗi: Khung giờ này bị trùng với một lịch khác cùng ngày!')
    }

    newWT[idx][field] = value
    setFormData({ ...formData, workingTimes: newWT })
  }

  const handleAddCert = () => {
    if (newCert.name) {
      setFormData({ ...formData, certificates: [...formData.certificates, newCert] })
      setNewCert({ name: '', org: '', issueDate: '', expiryDate: '', description: '', fileUrl: '' })
    }
  }

  const handleSubmit = async () => {
    if (!formData.email || !formData.fullName) {
      toast.error('Vui lòng nhập Email và Họ tên')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...formData,
        schoolId,
        userName: formData.userName,
        birthDay: formData.birthDay || null,
        idCity: formData.idCity || null,
        idDistrict: formData.idDistrict || null,
        idGender: formData.idGender || null,
        salary: {
          TypeSalary: formData.salary.typeSalary,
          TypeTeacher: formData.salary.typeTeacher,
          IdMonetaryUnit: formData.salary.idMonetaryUnit,
          SalaryPerMonth: formData.salary.salaryPerMonth,
          SalaryPerHour: formData.salary.salaryPerHour,
          WarrantyHours: formData.salary.warrantyHours,
          IdPaymentMethod: formData.salary.idPaymentMethod,
          NumberAccountBank: formData.salary.bankAccount
        },
        workingTimes: formData.workingTimes.map(wt => ({
          DayOfWeek: parseInt(wt.dayOfWeek),
          FromTime: wt.fromTime,
          ToTime: wt.toTime
        }))
      }

      if (editingTeacher) {
        await updateTeacherAPI(editingTeacher.Id, payload)
        toast.success('Cập nhật hồ sơ thành công')
      } else {
        await createTeacherAPI(payload)
        toast.success('Đã khởi tạo và gán giáo viên vào cơ sở thành công')
      }
      setShowForm(false)
      refreshTeachers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hệ thống')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (teacher) => {
    confirm({
      title: 'Xác nhận xóa?',
      description: `Bạn có chắc muốn xóa giáo viên ${teacher.FullName}?`,
      confirmationText: 'Xóa ngay', cancellationText: 'Hủy'
    }).then(async () => {
      await deleteTeacherAPI(teacher.Id)
      toast.success('Đã xóa giáo viên')
      refreshTeachers()
    }).catch(() => {})
  }

  const handleSavePickedTeachers = async (selectedIds) => {
    setLoading(true)
    try {
      await addTeachersToSchoolAPI(schoolId, selectedIds)
      toast.success('Đã thêm giáo viên vào trường')
      refreshTeachers()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm giáo viên')
    } finally {
      setLoading(false)
    }
  }

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.FullName?.toLowerCase().includes(search.toLowerCase()) ||
                          t.Email?.toLowerCase().includes(search.toLowerCase()) ||
                          t.UserName?.toLowerCase().includes(search.toLowerCase())

    const salary = t.AccountSalary?.[0] || {}
    const matchesContract = contractTypeFilter === 'ALL' || salary.TypeSalary === Number(contractTypeFilter)
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? t.Active === true : t.Active === false)
    const matchesCity = cityFilter === 'ALL' || t.IdCity === Number(cityFilter)
    const matchesDistrict = districtFilter === 'ALL' || t.IdDistrict === Number(districtFilter)

    return matchesSearch && matchesContract && matchesStatus && matchesCity && matchesDistrict
  })

  // Pagination for main teachers table
  const mainLimit = 10
  const totalMain = filteredTeachers.length
  const paginatedTeachers = filteredTeachers.slice((mainPage - 1) * mainLimit, mainPage * mainLimit)

  const filterDistrictsMain = cityFilter === 'ALL'
    ? []
    : allDistricts.filter(d => d.IdCity === Number(cityFilter))

  const dayNames = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 1: 'Chủ Nhật' }

  if (!showForm) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Danh sách Giáo viên</Typography>
            <Typography variant="body2" color="text.secondary">Quản lý đội ngũ giảng dạy của trường học</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined" startIcon={<PersonAddIcon />} onClick={() => setShowAddTeacherModal(true)}
              sx={{ borderRadius: '12px', textTransform: 'none', px: 3, py: 1 }}
            >
              Thêm giáo viên
            </Button>
            <Button
              variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}
              sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', textTransform: 'none', px: 3, py: 1, boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)' }}
            >
              Tạo giáo viên mới
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm nhanh theo tên, tên đăng nhập hoặc email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setMainPage(1) }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '10px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="contract-filter-label" sx={{ fontSize: '0.85rem' }}>Loại hợp đồng</InputLabel>
                <Select
                  labelId="contract-filter-label"
                  value={contractTypeFilter}
                  label="Loại hợp đồng"
                  onChange={(e) => { setContractTypeFilter(e.target.value); setMainPage(1) }}
                  sx={{ borderRadius: '10px', bgcolor: '#f8fafc' }}
                >
                  <MenuItem value="ALL">Tất cả hợp đồng</MenuItem>
                  <MenuItem value="1">Cố định</MenuItem>
                  <MenuItem value="2">Theo giờ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label" sx={{ fontSize: '0.85rem' }}>Trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => { setStatusFilter(e.target.value); setMainPage(1) }}
                  sx={{ borderRadius: '10px', bgcolor: '#f8fafc' }}
                >
                  <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Tạm khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                options={cities || []}
                getOptionLabel={option => option.Name || ''}
                value={cities?.find(c => String(c.Id) === String(cityFilter)) || null}
                onChange={(event, newValue) => {
                  setCityFilter(newValue ? newValue.Id : 'ALL')
                  setDistrictFilter('ALL')
                  setMainPage(1)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tỉnh/Thành"
                    placeholder="Tất cả tỉnh thành..."
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: '10px', bgcolor: '#f8fafc' }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                disabled={cityFilter === 'ALL'}
                options={filterDistrictsMain || []}
                getOptionLabel={option => option.Name || ''}
                value={filterDistrictsMain?.find(d => String(d.Id) === String(districtFilter)) || null}
                onChange={(event, newValue) => {
                  setDistrictFilter(newValue ? newValue.Id : 'ALL')
                  setMainPage(1)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Quận/Huyện"
                    placeholder={cityFilter === 'ALL' ? 'Chọn Tỉnh/Thành trước...' : 'Tất cả quận huyện...'}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: '10px', bgcolor: '#f8fafc' }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
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
                <TableCell>Giáo viên</TableCell>
                <TableCell>Liên hệ</TableCell>
                <TableCell>Thông tin cá nhân</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Khu vực</TableCell>
                <TableCell>Hợp đồng</TableCell>
                <TableCell>Chi tiết thù lao</TableCell>
                <TableCell>Thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 8 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : paginatedTeachers.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 8 }}><Typography color="text.secondary">Chưa có dữ liệu giáo viên</Typography></TableCell></TableRow>
              ) : paginatedTeachers.map((t) => {
                const salary = t.AccountSalary?.[0] || {}
                const genderName = refData.genders.find(g => g.Id === t.IdGender)?.Name || '—'
                const paymentMethodName = refData.paymentMethods.find(pm => pm.Id === salary.IdPaymentMethod)?.Name || 'Chưa thiết lập'

                return (
                  <TableRow key={t.Id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={resolveFileUrl(t.LinkAvatar)} sx={{ width: 30, height: 30, bgcolor: '#6366f1', fontSize: '12px', fontWeight: 700 }}>
                          {t.FullName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem', lineHeight: 1.2 }}>{t.FullName}</Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>@{t.UserName}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.775rem' }}>{t.Email}</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>{t.Phone || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.775rem' }}>
                        {t.BirthDay ? moment(t.BirthDay).format('DD/MM/YYYY') : '—'}
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                        Giới tính: {genderName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 165, wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '0.775rem', color: '#475569' }}>
                      {t.Address || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.775rem' }}>
                      {[
                        allDistricts.find(d => d.Id === t.IdDistrict)?.Name,
                        cities.find(c => c.Id === t.IdCity)?.Name
                      ].filter(Boolean).join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      {salary.TypeSalary === 1 ? (
                        <Chip label="Cố định" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.7rem', height: 20 }} />
                      ) : salary.TypeSalary === 2 ? (
                        <Chip label="Theo giờ" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.7rem', height: 20 }} />
                      ) : (
                        <Chip label="N/A" size="small" variant="outlined" sx={{ borderRadius: '8px', fontSize: '0.7rem', height: 20 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {salary.TypeSalary === 1 ? (
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#1e293b' }}>
                            Cứng: {formatCurrency(salary.SalaryPerMonth)}đ
                          </Typography>
                          <Typography sx={{ display: 'block', fontSize: '0.675rem', color: '#475569' }}>
                            Định mức: {salary.WarrantyHours || 0}h | OT: {formatCurrency(salary.SalaryPerHour)}đ/h
                          </Typography>
                        </Box>
                      ) : salary.TypeSalary === 2 ? (
                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#2563eb' }}>
                          Đơn giá: {formatCurrency(salary.SalaryPerHour)}đ/h
                        </Typography>
                      ) : (
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.725rem' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.775rem' }}>
                        {paymentMethodName}
                      </Typography>
                      {salary.NumberAccountBank && (
                        <Typography sx={{ color: '#64748b', display: 'block', fontSize: '0.675rem' }}>
                          STK: {salary.NumberAccountBank}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.Active ? (
                        <Chip label="Hoạt động" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, borderRadius: '6px', fontSize: '0.7rem', height: 20 }} />
                      ) : (
                        <Chip label="Tạm khóa" size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, borderRadius: '6px', fontSize: '0.7rem', height: 20 }} />
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Chỉnh sửa"><IconButton size="small" color="primary" onClick={() => handleOpenForm(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => handleDelete(t)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {totalMain > mainLimit && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Pagination
              count={Math.ceil(totalMain / mainLimit)}
              page={mainPage}
              onChange={(e, v) => setMainPage(v)}
              color="primary"
              size="medium"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                  borderRadius: '8px'
                }
              }}
            />
          </Box>
        )}

        <AddTeacherModal
          open={showAddTeacherModal}
          onClose={() => setShowAddTeacherModal(false)}
          onSave={handleSavePickedTeachers}
          currentTeacherIds={teachers.map(t => t.Id)}
          refData={refData}
          cities={cities}
          allDistricts={allDistricts}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, animation: 'fadeIn 0.3s ease' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => setShowForm(false)} sx={{ bgcolor: '#f1f5f9' }}><ArrowBackIcon fontSize="small" /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{editingTeacher ? 'Cập nhật hồ sơ giáo viên' : 'Khởi tạo hồ sơ giáo viên mới'}</Typography>
      </Box>

      <Card sx={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth"
            sx={{ bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { py: 2, fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' } }}
          >
            <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Hồ sơ cá nhân" />
            <Tab icon={<PaymentsIcon />} iconPosition="start" label="Hợp đồng & Lương" />
            <Tab icon={<BadgeIcon />} iconPosition="start" label="Bằng cấp chuyên môn" />
            <Tab icon={<EventAvailableIcon />} iconPosition="start" label="Lịch làm việc" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}><TextField label="Tên đăng nhập (Username)" fullWidth required disabled={!!editingTeacher} value={formData.userName} onChange={e => setFormData({ ...formData, userName: e.target.value })} /></Grid>
                <Grid item xs={12} md={6}><TextField label="Địa chỉ Email" fullWidth required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></Grid>
                <Grid item xs={12} md={6}><TextField label="Họ và tên đầy đủ" fullWidth required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} /></Grid>
                <Grid item xs={12} md={6}><TextField label="Số điện thoại" fullWidth value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Ngày sinh" type="date" fullWidth InputLabelProps={{ shrink: true }}
                    value={formData.birthDay ? formData.birthDay.split('T')[0] : ''}
                    onChange={e => setFormData({ ...formData, birthDay: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select value={formData.idGender} label="Giới tính" onChange={e => setFormData({ ...formData, idGender: e.target.value })}>
                      {refData.genders.map(g => <MenuItem key={g.Id} value={g.Id}>{g.Name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                {!editingTeacher && <Grid item xs={12} md={6}><TextField label="Mật khẩu hệ thống" type="password" fullWidth placeholder="Mặc định: teacher123" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></Grid>}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={cities}
                    getOptionLabel={option => option.Name || ''}
                    value={cities.find(c => String(c.Id) === String(formData.idCity)) || null}
                    onChange={(event, newValue) => {
                      const cityId = newValue ? newValue.Id : ''
                      setFormData({ ...formData, idCity: cityId, idDistrict: '' })
                      if (cityId) {
                        loadDistricts(cityId)
                      } else {
                        setDistricts([])
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tỉnh/Thành"
                        placeholder="Chọn Tỉnh/Thành..."
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    disabled={!formData.idCity}
                    options={districts}
                    getOptionLabel={option => option.Name || ''}
                    value={districts.find(d => String(d.Id) === String(formData.idDistrict)) || null}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, idDistrict: newValue ? newValue.Id : '' })
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Quận/Huyện"
                        placeholder="Chọn Quận/Huyện..."
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}><TextField label="Địa chỉ thường trú" fullWidth multiline rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 800, color: '#334155' }}>Cấu hình thù lao chi tiết</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Loại hợp đồng</InputLabel>
                    <Select value={formData.salary.typeSalary} label="Loại hợp đồng" onChange={e => {
                      const salaryType = parseInt(e.target.value)
                      setFormData({
                        ...formData,
                        salary: {
                          ...formData.salary,
                          typeSalary: salaryType,
                          typeTeacher: 1 // Default to 1
                        }
                      })
                    }}>
                      <MenuItem value={1}>Cố định</MenuItem>
                      <MenuItem value={2}>Theo giờ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Đơn vị tiền tệ</InputLabel>
                    <Select value={formData.salary.idMonetaryUnit} label="Đơn vị tiền tệ" onChange={e => setFormData({ ...formData, salary: { ...formData.salary, idMonetaryUnit: e.target.value } })}>
                      <MenuItem value={1}>VNĐ (Việt Nam Đồng)</MenuItem>
                      <MenuItem value={2}>USD (Đô la Mỹ)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {formData.salary.typeSalary === 1 ? (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Lương tháng" fullWidth type="text"
                        value={formatCurrency(formData.salary.salaryPerMonth)}
                        onChange={e => setFormData({ ...formData, salary: { ...formData.salary, salaryPerMonth: parseCurrency(e.target.value) } })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField label="Số giờ bảo hành / tháng" fullWidth type="number" value={formData.salary.warrantyHours} onChange={e => setFormData({ ...formData, salary: { ...formData.salary, warrantyHours: e.target.value } })} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Lương theo giờ (Tính Overtime)" fullWidth type="text"
                        value={formatCurrency(formData.salary.salaryPerHour)}
                        onChange={e => setFormData({ ...formData, salary: { ...formData.salary, salaryPerHour: parseCurrency(e.target.value) } })}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Lương theo giờ dạy" fullWidth type="text"
                      value={formatCurrency(formData.salary.salaryPerHour)}
                      onChange={e => setFormData({ ...formData, salary: { ...formData.salary, salaryPerHour: parseCurrency(e.target.value) } })}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Phương thức thanh toán</InputLabel>
                    <Select value={formData.salary.idPaymentMethod} label="Phương thức thanh toán" onChange={e => setFormData({ ...formData, salary: { ...formData.salary, idPaymentMethod: e.target.value } })}>
                      {refData.paymentMethods.map(pm => <MenuItem key={pm.Id} value={pm.Id}>{pm.Name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}><TextField label="Số tài khoản ngân hàng" fullWidth type="number" value={formData.salary.bankAccount} onChange={e => setFormData({ ...formData, salary: { ...formData.salary, bankAccount: e.target.value } })} /></Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#334155' }}>Bằng cấp chuyên môn</Typography>
                <Button
                  size="small" startIcon={<AddIcon />}
                  onClick={() => setFormData({ ...formData, certificates: [...formData.certificates, { name: '', org: '', issueDate: '', expiryDate: '', description: '' }] })}
                  sx={{ fontWeight: 700, borderRadius: '8px' }}
                >
                  Thêm bằng cấp mới
                </Button>
              </Box>

              {formData.certificates.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                  <BadgeIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">Chưa có thông tin bằng cấp được thêm vào</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {formData.certificates.map((cert, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#fdfdfd', position: 'relative' }}>
                        <IconButton
                          size="small" color="error"
                          onClick={() => setFormData({ ...formData, certificates: formData.certificates.filter((_, i) => i !== index) })}
                          sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#fff1f2', '&:hover': { bgcolor: '#ffe4e6' } }}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth label="Tên chứng chỉ / Bằng cấp" size="small" value={cert.name}
                              onChange={e => {
                                const newCerts = [...formData.certificates]
                                newCerts[index].name = e.target.value
                                setFormData({ ...formData, certificates: newCerts })
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth label="Tổ chức cấp" size="small" value={cert.org}
                              onChange={e => {
                                const newCerts = [...formData.certificates]
                                newCerts[index].org = e.target.value
                                setFormData({ ...formData, certificates: newCerts })
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth label="Ngày cấp" type="date" size="small" InputLabelProps={{ shrink: true }} value={cert.issueDate}
                              onChange={e => {
                                const newCerts = [...formData.certificates]
                                newCerts[index].issueDate = e.target.value
                                setFormData({ ...formData, certificates: newCerts })
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth label="Ngày hết hạn" type="date" size="small" InputLabelProps={{ shrink: true }} value={cert.expiryDate}
                              onChange={e => {
                                const newCerts = [...formData.certificates]
                                newCerts[index].expiryDate = e.target.value
                                setFormData({ ...formData, certificates: newCerts })
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth label="Ghi chú / Link hồ sơ" size="small" value={cert.description}
                              onChange={e => {
                                const newCerts = [...formData.certificates]
                                newCerts[index].description = e.target.value
                                setFormData({ ...formData, certificates: newCerts })
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5 }}>Lịch dạy cố định</Typography>
                  <Typography variant="body2" color="text.secondary">Thiết lập khung giờ lên lớp định kỳ của giáo viên trong tuần</Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  {formData.workingTimes.length > 0 && (
                    <Tooltip title="Xóa tất cả lịch">
                      <Button
                        variant="outlined" color="error" size="small"
                        onClick={() => setFormData({ ...formData, workingTimes: [] })}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, border: '1.5px solid' }}
                      >
                        Xóa trắng
                      </Button>
                    </Tooltip>
                  )}
                  {formData.workingTimes.length === 0 && (
                    <Button
                      variant="contained" startIcon={<AddIcon />}
                      onClick={() => handleAddWorkingTime(2)}
                      sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                    >
                      Thêm khung giờ
                    </Button>
                  )}
                </Stack>
              </Box>

              {formData.workingTimes.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <EventAvailableIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569', mb: 1 }}>Chưa có lịch làm việc</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto', mb: 3 }}>Vui lòng thêm các khung giờ để hệ thống có thể sắp xếp lớp học cho giáo viên này.</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleAddWorkingTime(2)} sx={{ borderRadius: '12px', fontWeight: 700 }}>Thiết lập lịch ngay</Button>
                </Box>
              ) : (
                <Grid container spacing={2.5}>
                  {[2, 3, 4, 5, 6, 7, 1].map((day) => {
                    const daySlots = formData.workingTimes.filter(wt => Number(wt.dayOfWeek) === Number(day))
                    const dayName = day === 1 ? 'Chủ Nhật' : `Thứ ${day}`
                    const dayColor = day === 1 ? '#ef4444' : '#6366f1'

                    return (
                      <Grid item xs={12} md={6} lg={4} key={day}>
                        <Paper
                          sx={{
                            p: 2.5, borderRadius: '24px', border: '1px solid', borderColor: daySlots.length > 0 ? alpha(dayColor, 0.2) : '#e2e8f0',
                            bgcolor: daySlots.length > 0 ? alpha(dayColor, 0.02) : '#fff', transition: 'all 0.2s ease',
                            '&:hover': { boxShadow: '0 12px 20px -10px rgba(0,0,0,0.08)', borderColor: dayColor }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 36, height: 36, bgcolor: dayColor, fontSize: '0.9rem', fontWeight: 900 }}>{day === 1 ? 'CN' : day}</Avatar>
                              <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>{dayName}</Typography>
                            </Stack>
                            <IconButton
                              size="small" sx={{ bgcolor: alpha(dayColor, 0.1), color: dayColor }}
                              onClick={() => handleAddWorkingTime(day)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Stack spacing={1.5}>
                            {daySlots.length === 0 ? (
                              <Typography variant="caption" sx={{ py: 1.5, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', bgcolor: '#f8fafc', borderRadius: '12px' }}>Không có lịch dạy</Typography>
                            ) : (
                              daySlots.map((slot, sIdx) => {
                                const realIdx = formData.workingTimes.indexOf(slot)
                                return (
                                  <Box
                                    key={sIdx}
                                    sx={{
                                      p: 1.5, bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
                                      display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative'
                                    }}
                                  >
                                    <TextField
                                      size="small" type="time" label="Từ" InputLabelProps={{ shrink: true }} value={slot.fromTime}
                                      sx={{ '& .MuiInputBase-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
                                      onChange={e => handleUpdateWorkingTime(realIdx, 'fromTime', e.target.value)}
                                    />
                                    <Typography color="text.secondary">→</Typography>
                                    <TextField
                                      size="small" type="time" label="Đến" InputLabelProps={{ shrink: true }} value={slot.toTime}
                                      sx={{ '& .MuiInputBase-root': { borderRadius: '10px', fontSize: '0.85rem' } }}
                                      onChange={e => handleUpdateWorkingTime(realIdx, 'toTime', e.target.value)}
                                    />
                                    <IconButton
                                      size="small" color="error"
                                      sx={{ ml: 'auto', bgcolor: '#fff1f2', '&:hover': { bgcolor: '#ffe4e6' } }}
                                      onClick={() => setFormData({ ...formData, workingTimes: formData.workingTimes.filter((_, i) => i !== realIdx) })}
                                    >
                                      <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                  </Box>
                                )
                              })
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </TabPanel>
          </Box>

          <Divider />
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: '#f8fafc' }}>
            <Button onClick={() => setShowForm(false)} sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}>Hủy và quay lại</Button>
            <Button variant="contained" startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} onClick={handleSubmit} disabled={loading} sx={{ borderRadius: '12px', px: 5, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', textTransform: 'none', fontWeight: 700 }}>Lưu hồ sơ giáo viên</Button>
          </Box>
        </CardContent>
      </Card>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Box>
  )
}

export default SchoolTeachers
